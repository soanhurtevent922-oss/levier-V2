'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [hasPlan, setHasPlan] = useState(false);

  function getSelectedPlan() {
    const urlPlan = new URLSearchParams(
      window.location.search
    ).get('plan');

    const savedPlan = window.localStorage.getItem(
      'levier_pending_plan'
    );

    const plan = urlPlan || savedPlan;

    if (
      plan === 'monthly' ||
      plan === 'lifetime'
    ) {
      return plan;
    }

    return null;
  }

  useEffect(() => {
    const plan = getSelectedPlan();

    if (plan) {
      setHasPlan(true);
      window.localStorage.setItem(
        'levier_pending_plan',
        plan
      );
    } else {
      setHasPlan(false);
    }
  }, []);

  async function goToCheckout(session) {
    const plan = getSelectedPlan();

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('payment_status')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const alreadyPaid =
      profile?.payment_status === 'monthly' ||
      profile?.payment_status === 'lifetime';

    if (alreadyPaid) {
      window.localStorage.removeItem(
        'levier_pending_plan'
      );

      router.push('/dashboard');
      return;
    }

    if (!plan) {
      window.localStorage.removeItem(
        'levier_pending_plan'
      );

      router.push('/#pricing');
      return;
    }

    const response = await fetch(
      '/api/checkout',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization:
            `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          plan,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.url) {
      throw new Error(
        result.error ||
          'Impossible de démarrer le paiement.'
      );
    }

    window.localStorage.removeItem(
      'levier_pending_plan'
    );

    window.location.href = result.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setConfirmMsg('');
    setLoading(true);

    const selectedPlan = getSelectedPlan();

    if (
      mode === 'signup' &&
      !selectedPlan
    ) {
      setLoading(false);

      setError(
        'Choisis d’abord une formule pour créer ton compte.'
      );

      return;
    }

    if (selectedPlan) {
      window.localStorage.setItem(
        'levier_pending_plan',
        selectedPlan
      );
    }

    if (mode === 'signup') {
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }

      if (data.session) {
        try {
          await goToCheckout(
            data.session
          );
        } catch (checkoutError) {
          setLoading(false);

          setError(
            checkoutError.message
          );
        }
      } else {
        setLoading(false);

        setConfirmMsg(
          "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi pour continuer vers le paiement."
        );

        setMode('signin');
      }
    } else {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }

      if (!data.session) {
        setLoading(false);

        setError(
          'Impossible de récupérer ta session.'
        );

        return;
      }

      try {
        await goToCheckout(
          data.session
        );
      } catch (checkoutError) {
        setLoading(false);

        setError(
          checkoutError.message
        );
      }
    }
  }

  return (
    <main className="auth-page">
      <div
        className="auth-glow"
        aria-hidden="true"
      />

      <header className="auth-header">
        <Link
          href="/"
          className="auth-logo"
        >
          LEVIER
        </Link>

        <Link
          href="/"
          className="auth-back"
        >
          ← Retour au site
        </Link>
      </header>

      <section className="auth-shell">
        <div className="auth-story">
          <div className="auth-kicker">
            <span className="auth-kicker-dot" />
            Ton espace de négociation
          </div>

          <h1>
            Arrive préparé.
            <br />
            <span>
              Négocie avec un plan.
            </span>
          </h1>

          <p className="auth-story-copy">
            Retrouve tes salaires, tes arguments,
            tes opportunités et tes scripts au
            même endroit — pour ne plus improviser
            le jour J.
          </p>

          <div className="auth-points">
            <div>
              <span>01</span>

              <p>
                <strong>
                  Connais ta valeur
                </strong>{' '}
                avec une fourchette adaptée à ton
                profil.
              </p>
            </div>

            <div>
              <span>02</span>

              <p>
                <strong>
                  Prépare ton discours
                </strong>{' '}
                et anticipe les objections.
              </p>
            </div>

            <div>
              <span>03</span>

              <p>
                <strong>
                  Garde tes leviers
                </strong>{' '}
                et compare tes opportunités.
              </p>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-top">
            <span>
              {mode === 'signin'
                ? 'Bon retour'
                : 'Bienvenue'}
            </span>

            <span className="auth-status">
              <i /> sécurisé
            </span>
          </div>

          <h2>
            {mode === 'signin'
              ? 'Connecte-toi à Levier.'
              : 'Crée ton espace Levier.'}
          </h2>

          <p className="auth-card-sub">
            {mode === 'signin'
              ? hasPlan
                ? 'Connecte-toi pour continuer vers ton paiement.'
                : 'Réservé aux clients Levier.'
              : 'Crée ton compte pour continuer vers le paiement.'}
          </p>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div>
              <label htmlFor="email">
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="toi@email.fr"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password">
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Au moins 6 caractères"
                autoComplete={
                  mode === 'signin'
                    ? 'current-password'
                    : 'new-password'
                }
              />
            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {confirmMsg && (
              <p className="auth-success">
                {confirmMsg}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Un instant…'
                  : mode === 'signin'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
              </span>

              {!loading && <i>→</i>}
            </button>
          </form>

          <div className="auth-switch">
            {hasPlan ? (
              mode === 'signin' ? (
                <>
                  <span>
                    Pas encore de compte ?
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setConfirmMsg('');
                    }}
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  <span>
                    Déjà un compte ?
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setConfirmMsg('');
                    }}
                  >
                    Se connecter
                  </button>
                </>
              )
            ) : (
              <>
                <span>
                  Pas encore client ?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/#pricing'
                    )
                  }
                >
                  Voir les tarifs
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="auth-footer">
        Levier — le bon argument, au bon moment.
      </footer>
    </main>
  );
}
