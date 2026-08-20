import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export const runtime = 'nodejs';

function getAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function POST(request) {
  try {
    const authHeader =
      request.headers.get('authorization') || '';

    const accessToken =
      authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Tu dois être connecté.' },
        { status: 401 }
      );
    }

    const authClient = getAuthClient();

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            'Session invalide. Reconnecte-toi.',
        },
        { status: 401 }
      );
    }

    const admin = getSupabaseAdmin();

    const {
      data: profile,
      error: profileError,
    } = await admin
      .from('profiles')
      .select(
        'payment_status, stripe_customer_id'
      )
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error:
            'Impossible de vérifier ton abonnement.',
        },
        { status: 500 }
      );
    }

    if (profile.payment_status !== 'monthly') {
      return NextResponse.json(
        {
          error:
            'Aucun abonnement mensuel à gérer.',
        },
        { status: 403 }
      );
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            'Aucun compte Stripe associé à cet abonnement.',
        },
        { status: 400 }
      );
    }

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            'Stripe n’est pas configuré.',
        },
        { status: 500 }
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://www.levier.online'
    ).replace(/\/$/, '');

    const stripeBody =
      new URLSearchParams();

    stripeBody.set(
      'customer',
      profile.stripe_customer_id
    );

    stripeBody.set(
      'return_url',
      `${siteUrl}/dashboard`
    );

    const stripeResponse = await fetch(
      'https://api.stripe.com/v1/billing_portal/sessions',
      {
        method: 'POST',
        headers: {
          Authorization:
            `Bearer ${stripeSecretKey}`,
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body: stripeBody.toString(),
        cache: 'no-store',
      }
    );

    const portalSession =
      await stripeResponse.json();

    if (
      !stripeResponse.ok ||
      !portalSession.url
    ) {
      console.error(
        'Stripe Billing Portal error:',
        portalSession
      );

      return NextResponse.json(
        {
          error:
            portalSession?.error?.message ||
            'Impossible d’ouvrir la gestion de ton abonnement.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error(
      'Billing portal error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Impossible d’ouvrir la gestion de ton abonnement.',
      },
      { status: 500 }
    );
  }
}
