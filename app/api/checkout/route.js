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
    /*
     * ----------------------------
     * Vérification de connexion
     * ----------------------------
     */

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
            'Tu dois être connecté pour payer.',
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
     * ----------------------------
     * Vérification de la formule
     * ----------------------------
     */

    const { plan } =
      await request.json();

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

    /*
     * ----------------------------
     * Vérification Supabase
     * ----------------------------
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
            'Impossible de vérifier ton abonnement.',
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ----------------------------
     * VERROU ANTI DOUBLE PAIEMENT
     * ----------------------------
     */

    const alreadyPaid =
      profile?.payment_status ===
        'monthly' ||
      profile?.payment_status ===
        'lifetime';

    if (alreadyPaid) {
      return NextResponse.json(
        {
          error:
            'Ton compte possède déjà un accès actif à Levier.',
          alreadyPaid: true,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ----------------------------
     * Configuration Stripe
     * ----------------------------
     */

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

    /*
     * ----------------------------
     * Création Checkout
     * ----------------------------
     */

    const body =
      new URLSearchParams();

    body.set(
      'mode',
      selectedPlan.mode
    );

    body.set(
      'line_items[0][price]',
      priceId
    );

    body.set(
      'line_items[0][quantity]',
      '1'
    );

    body.set(
      'success_url',
      `${siteUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`
    );

    body.set(
      'cancel_url',
      `${siteUrl}/#pricing`
    );

    body.set(
      'client_reference_id',
      user.id
    );

    body.set(
      'metadata[user_id]',
      user.id
    );

    body.set(
      'metadata[plan]',
      plan
    );

    /*
     * Si ce compte possède déjà
     * un client Stripe, on le réutilise.
     */
    if (
      profile?.stripe_customer_id
    ) {
      body.set(
        'customer',
        profile.stripe_customer_id
      );
    } else if (user.email) {
      body.set(
        'customer_email',
        user.email
      );
    }

    /*
     * Paiement unique :
     * Stripe doit créer un client
     * seulement s'il n'existe pas encore.
     */
    if (
      selectedPlan.mode ===
        'payment' &&
      !profile?.stripe_customer_id
    ) {
      body.set(
        'customer_creation',
        'always'
      );
    }

    /*
     * Métadonnées abonnement mensuel
     */
    if (
      selectedPlan.mode ===
      'subscription'
    ) {
      body.set(
        'subscription_data[metadata][user_id]',
        user.id
      );

      body.set(
        'subscription_data[metadata][plan]',
        plan
      );
    }

    /*
     * ----------------------------
     * Appel Stripe
     * ----------------------------
     */

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
            body.toString(),

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

    /*
     * ----------------------------
     * Redirection Stripe
     * ----------------------------
     */

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
          'Impossible de démarrer le paiement.',
      },
      {
        status: 500,
      }
    );
  }
}
