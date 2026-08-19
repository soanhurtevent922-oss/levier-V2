'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, CITY_TIERS } from '../../lib/benchmarks';

const DashboardContext = createContext(null);
export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);

      let { data: prof } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();

      // Pas encore de profil pour ce compte : on en crée un vide, rempli juste après.
      if (!prof) {
        const { data: newProf } = await supabase.from('profiles')
          .insert({ user_id: session.user.id })
          .select().single();
        prof = newProf;
      }

      setProfile(prof);

      if (prof) {
        await loadHistoryAndExpenses(session.user.id);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadHistoryAndExpenses(uid) {
    const { data: hist } = await supabase
      .from('salary_history').select('*').eq('user_id', uid).order('entry_date', { ascending: false });
    setHistory(hist || []);
    const { data: exp } = await supabase
      .from('expense_categories').select('*').eq('user_id', uid).order('created_at', { ascending: true });
    setExpenses(exp || []);
  }

  async function refreshProfile() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    setProfile(prof);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    const job_category = e.target.jobCategory.value;
    const experience_level = e.target.experienceLevel.value;
    const city_tier = e.target.cityTier.value;
    const next_review_date = e.target.nextReviewDate.value || null;

    const { data } = await supabase.from('profiles')
      .update({ job_category, experience_level, city_tier, next_review_date }).eq('id', profile.id).select().single();
    setProfile(data);
    if (history.length === 0 && expenses.length === 0) {
      await loadHistoryAndExpenses(userId);
    }
    setShowEditProfile(false);
  }

  if (loading) {
    return <div className="wrap"><p className="sr-loading">Chargement…</p></div>;
  }

  if (!profile.job_category || showEditProfile) {
    return (
      <div className="wrap">
        <div className="setup-wrap">
          <h2>Configure ton profil</h2>
          <p className="sub">Ça nous permet de te donner une fourchette de salaire pertinente.</p>
          <form onSubmit={handleSaveProfile}>
            <div>
              <label htmlFor="jobCategory">Métier</label>
              <select id="jobCategory" name="jobCategory" defaultValue={profile?.job_category || JOB_CATEGORIES[0]}>
                {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="experienceLevel">Expérience</label>
              <select id="experienceLevel" name="experienceLevel" defaultValue={profile?.experience_level || 'junior'}>
                {EXPERIENCE_LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cityTier">Zone géographique</label>
              <select id="cityTier" name="cityTier" defaultValue={profile?.city_tier || 'paris'}>
                {CITY_TIERS.map((z) => <option key={z.key} value={z.key}>{z.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="nextReviewDate">Date de ton prochain entretien/évaluation (optionnel)</label>
              <input id="nextReviewDate" name="nextReviewDate" type="date" defaultValue={profile?.next_review_date || ''} />
            </div>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: "Vue d'ensemble" },
    { href: '/dashboard/finances', label: 'Finances' },
    { href: '/dashboard/script', label: 'Script' },
    { href: '/dashboard/entrainement', label: 'Entraînement' },
  ];

  return (
    <DashboardContext.Provider value={{ profile, userId, history, setHistory, expenses, setExpenses, refreshProfile, setShowEditProfile }}>
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <h1>Levier</h1>
            <p>Le bon argument, au bon moment.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="user-tag">
              {profile.job_category}
              <button className="edit-link" onClick={() => setShowEditProfile(true)}>modifier</button>
            </div>
            <button className="btn-ghost" onClick={handleSignOut}>Déconnexion</button>
          </div>
        </header>

        <nav className="dash-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`dash-nav-link ${pathname === item.href ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </DashboardContext.Provider>
  );
}
