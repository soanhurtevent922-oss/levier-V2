'use client';

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
    <div className="wrap">
      <div className="setup-wrap">
        <h2>Levier</h2>
        <p className="sub">
          {mode === 'signin' ? 'Connecte-toi à ton espace.' : 'Crée ton compte.'}
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@email.fr" />
          </div>
          <div>
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Au moins 6 caractères" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          {confirmMsg && <p className="auth-error" style={{ color: 'var(--sage)' }}>{confirmMsg}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Un instant…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '0.85rem' }}>
          {mode === 'signin' ? (
            <>Pas encore de compte ? <button className="edit-link" onClick={() => setMode('signup')}>Créer un compte</button></>
          ) : (
            <>Déjà un compte ? <button className="edit-link" onClick={() => setMode('signin')}>Se connecter</button></>
          )}
        </p>
      </div>
    </div>
  );
}
