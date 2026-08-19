import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export const runtime = 'nodejs';

function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((part) => part.startsWith('t='));

  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3));

  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = timestampPart.slice(2);
  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) return false;

  const age =
    Math.abs(
      Math.floor(Date.now() / 1000) - timestampNumber
    );

  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;

  const expectedSignature = createHmac(
    'sha256',
    secret
  )
    .update(signedPayload, 'utf8')
    .digest('hex');

  const expectedBuffer =
    Buffer.from(expectedSignature, 'hex');

  return signatures.some((signature) => {
    try {
      const receivedBuffer =
        Buffer.from(signature, 'hex');

      if (
        receivedBuffer.length !==
        expectedBuffer.length
      ) {
        return false;
      }

      return timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      );
    } catch {
      return false;
    }
  });
}

async function updateByUserId(userId, values) {
  if (!userId) return;

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('profiles')
    .update(values)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

async function updateByCustomerId(
  customerId,
  paymentStatus
) {
  if (!customerId) return;

  const supabase = getSupabaseAdmin();

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select('user_id, payment_status')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) return;

  if (profile.payment_status === 'lifetime') {
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      payment_status: paymentStatus,
    })
    .eq('user_id', profile.user_id);

  if (error) {
    throw error;
  }
}

export async function POST(request) {
  try {
    const payload = await request.text();

    const signature =
      request.headers.get('stripe-signature');

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        'STRIPE_WEBHOOK_SECRET missing'
      );

      return NextResponse.json(
        {
          error:
            'Webhook Stripe non configuré.',
        },
        { status: 500 }
      );
    }

    const validSignature =
      verifyStripeSignature(
        payload,
        signature,
        webhookSecret
      );

    if (!validSignature) {
      return NextResponse.json(
        {
          error:
            'Signature Stripe invalide.',
        },
        { status: 400 }
      );
    }

    const event = JSON.parse(payload);

    const object =
      event?.data?.object;

    if (!object) {
      return NextResponse.json({
        received: true,
      });
    }

    if (
      event.type ===
      'checkout.session.completed'
    ) {
      const userId =
        object.metadata?.user_id;

      const plan =
        object.metadata?.plan;

      const customerId =
        typeof object.customer === 'string'
          ? object.customer
          : object.customer?.id || null;

      if (
        userId &&
        (plan === 'monthly' ||
          plan === 'lifetime')
      ) {
        await updateByUserId(userId, {
          payment_status: plan,
          stripe_customer_id: customerId,
        });
      }
    }

    if (
      event.type ===
      'customer.subscription.updated'
    ) {
      const customerId =
        typeof object.customer === 'string'
          ? object.customer
          : object.customer?.id || null;

      const activeStatuses = [
        'active',
        'trialing',
      ];

      const paymentStatus =
        activeStatuses.includes(object.status)
          ? 'monthly'
          : object.status === 'past_due'
          ? 'past_due'
          : 'none';

      await updateByCustomerId(
        customerId,
        paymentStatus
      );
    }

    if (
      event.type ===
      'customer.subscription.deleted'
    ) {
      const customerId =
        typeof object.customer === 'string'
          ? object.customer
          : object.customer?.id || null;

      await updateByCustomerId(
        customerId,
        'none'
      );
    }

    if (event.type === 'invoice.paid') {
      const customerId =
        typeof object.customer === 'string'
          ? object.customer
          : object.customer?.id || null;

      await updateByCustomerId(
        customerId,
        'monthly'
      );
    }

    if (
      event.type ===
      'invoice.payment_failed'
    ) {
      const customerId =
        typeof object.customer === 'string'
          ? object.customer
          : object.customer?.id || null;

      await updateByCustomerId(
        customerId,
        'past_due'
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      'Stripe webhook error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Erreur webhook Stripe.',
      },
      { status: 500 }
    );
  }
}
