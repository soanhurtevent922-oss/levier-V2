'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setConfirmMsg('');
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
        setConfirmMsg("Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.");
        setMode('signin');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow" aria-hidden="true" />

      <header className="auth-header">
        <Link href="/" className="auth-logo">LEVIER</Link>
        <Link href="/" className="auth-back">← Retour au site</Link>
      </header>

      <section className="auth-shell">
        <div className="auth-story">
          <div className="auth-kicker">
            <span className="auth-kicker-dot" />
            Ton espace de négociation
          </div>

          <h1>
            Arrive préparé.<br />
            <span>Négocie avec un plan.</span>
          </h1>

          <p className="auth-story-copy">
            Retrouve tes salaires, tes arguments, tes opportunités et tes scripts au même endroit — pour ne plus improviser le jour J.
          </p>

          <div className="auth-points">
            <div>
              <span>01</span>
              <p><strong>Connais ta valeur</strong> avec une fourchette adaptée à ton profil.</p>
            </div>
            <div>
              <span>02</span>
              <p><strong>Prépare ton discours</strong> et anticipe les objections.</p>
            </div>
            <div>
              <span>03</span>
              <p><strong>Garde tes leviers</strong> et compare tes opportunités.</p>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-top">
            <span>{mode === 'signin' ? 'Bon retour' : 'Bienvenue'}</span>
            <span className="auth-status"><i /> sécurisé</span>
          </div>

          <h2>{mode === 'signin' ? 'Connecte-toi à Levier.' : 'Crée ton espace Levier.'}</h2>
          <p className="auth-card-sub">
            {mode === 'signin'
              ? 'Tes outils de préparation t’attendent.'
              : 'Quelques secondes suffisent pour commencer.'}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@email.fr"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}
            {confirmMsg && <p className="auth-success">{confirmMsg}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              <span>{loading ? 'Un instant…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}</span>
              {!loading && <i>→</i>}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signin' ? (
              <>
                <span>Pas encore de compte ?</span>
                <button type="button" onClick={() => { setMode('signup'); setError(''); setConfirmMsg(''); }}>
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                <span>Déjà un compte ?</span>
                <button type="button" onClick={() => { setMode('signin'); setError(''); setConfirmMsg(''); }}>
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="auth-footer">Levier — le bon argument, au bon moment.</footer>
    </main>
  );
}
