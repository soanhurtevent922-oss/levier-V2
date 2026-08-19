import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export const runtime = 'nodejs';

const PLANS = {
  monthly: {
    mode: 'subscription',
    priceEnv: 'STRIPE_PRICE_MONTHLY',
  },

  lifetime: {
    mode: 'payment',
    priceEnv: 'STRIPE_PRICE_LIFETIME',
  },
};

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
        {
          error:
            'Tu dois être connecté.',
        },
        {
          status: 401,
        }
      );
    }

    const authClient =
      getAuthClient();

    const {
      data: { user },
      error: userError,
    } =
      await authClient.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            'Session invalide. Reconnecte-toi.',
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Le serveur vérifie d'abord
     * si le compte a déjà payé.
     */

    const admin =
      getSupabaseAdmin();

    const {
      data: profile,
      error: profileError,
    } = await admin
      .from('profiles')
      .select(
        'payment_status, stripe_customer_id'
      )
      .eq(
        'user_id',
        user.id
      )
      .maybeSingle();

    if (profileError) {
      console.error(
        'Profile verification error:',
        profileError
      );

      return NextResponse.json(
        {
          error:
            'Impossible de vérifier ton accès.',
        },
        {
          status: 500,
        }
      );
    }

    const hasPaidAccess =
      profile?.payment_status ===
        'monthly' ||
      profile?.payment_status ===
        'lifetime';

    /*
     * COMPTE DÉJÀ PAYÉ :
     * aucune session Stripe créée.
     */

    if (hasPaidAccess) {
      return NextResponse.json({
        alreadyPaid: true,
        paymentStatus:
          profile.payment_status,
      });
    }

    /*
     * Un abonnement past_due existe
     * déjà : on évite d'en créer
     * un deuxième.
     */

    if (
      profile?.payment_status ===
      'past_due'
    ) {
      return NextResponse.json(
        {
          billingIssue: true,
          error:
            'Ton abonnement existe déjà mais le paiement doit être régularisé.',
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Maintenant seulement,
     * on regarde la formule demandée.
     */

    const bodyJson =
      await request.json();

    const plan =
      bodyJson?.plan || null;

    /*
     * Connexion directe d'un compte
     * non payé, sans formule choisie.
     */

    if (!plan) {
      return NextResponse.json({
        needsPlan: true,
      });
    }

    const selectedPlan =
      PLANS[plan];

    if (!selectedPlan) {
      return NextResponse.json(
        {
          error:
            'Formule inconnue.',
        },
        {
          status: 400,
        }
      );
    }

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    const priceId =
      process.env[
        selectedPlan.priceEnv
      ];

    const siteUrl = (
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      'https://www.levier.online'
    ).replace(/\/$/, '');

    if (
      !stripeSecretKey ||
      !priceId
    ) {
      console.error(
        'Stripe configuration missing'
      );

      return NextResponse.json(
        {
          error:
            'Le paiement Stripe n’est pas encore configuré.',
        },
        {
          status: 500,
        }
      );
    }

    const stripeBody =
      new URLSearchParams();

    stripeBody.set(
      'mode',
      selectedPlan.mode
    );

    stripeBody.set(
      'line_items[0][price]',
      priceId
    );

    stripeBody.set(
      'line_items[0][quantity]',
      '1'
    );

    stripeBody.set(
      'success_url',
      `${siteUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`
    );

    stripeBody.set(
      'cancel_url',
      `${siteUrl}/#pricing`
    );

    stripeBody.set(
      'client_reference_id',
      user.id
    );

    stripeBody.set(
      'metadata[user_id]',
      user.id
    );

    stripeBody.set(
      'metadata[plan]',
      plan
    );

    if (
      profile?.stripe_customer_id
    ) {
      stripeBody.set(
        'customer',
        profile.stripe_customer_id
      );
    } else if (user.email) {
      stripeBody.set(
        'customer_email',
        user.email
      );
    }

    if (
      selectedPlan.mode ===
        'payment' &&
      !profile?.stripe_customer_id
    ) {
      stripeBody.set(
        'customer_creation',
        'always'
      );
    }

    if (
      selectedPlan.mode ===
      'subscription'
    ) {
      stripeBody.set(
        'subscription_data[metadata][user_id]',
        user.id
      );

      stripeBody.set(
        'subscription_data[metadata][plan]',
        plan
      );
    }

    const stripeResponse =
      await fetch(
        'https://api.stripe.com/v1/checkout/sessions',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${stripeSecretKey}`,

            'Content-Type':
              'application/x-www-form-urlencoded',
          },

          body:
            stripeBody.toString(),

          cache: 'no-store',
        }
      );

    const session =
      await stripeResponse.json();

    if (
      !stripeResponse.ok ||
      !session.url
    ) {
      console.error(
        'Stripe Checkout error:',
        session
      );

      return NextResponse.json(
        {
          error:
            session?.error
              ?.message ||
            'Impossible de démarrer le paiement.',
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      'Checkout route error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Impossible de vérifier ton accès.',
      },
      {
        status: 500,
      }
    );
  }
}
