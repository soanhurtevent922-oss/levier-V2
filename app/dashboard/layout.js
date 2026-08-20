'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  useRouter,
  usePathname,
} from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import {
  JOB_CATEGORIES,
  EXPERIENCE_LEVELS,
  CITY_TIERS,
} from '../../lib/benchmarks';

const DashboardContext = createContext(null);

export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardLayout({
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] =
    useState(true);

  const [fatalError, setFatalError] =
    useState('');

  const [userId, setUserId] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [
    opportunities,
    setOpportunities,
  ] = useState([]);

  const [
    showEditProfile,
    setShowEditProfile,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setFatalError('');

        const {
          data: { session },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          router.push('/login');
          return;
        }

        if (cancelled) {
          return;
        }

        const uid = session.user.id;

        setUserId(uid);

        let {
          data: prof,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!prof) {
          const {
            error: insertError,
          } = await supabase
            .from('profiles')
            .insert({
              user_id: uid,
            });

          if (
            insertError &&
            insertError.code !== '23505'
          ) {
            throw insertError;
          }

          const {
            data: createdProf,
            error: refetchError,
          } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', uid)
            .maybeSingle();

          if (refetchError) {
            throw refetchError;
          }

          prof = createdProf;
        }

        if (!prof) {
          throw new Error(
            "Impossible de charger ton profil. Réessaie dans quelques secondes."
          );
        }

        /*
         * -------------------------
         * VERROU DE PAIEMENT
         * -------------------------
         */

        const paidStatuses = [
          'monthly',
          'lifetime',
        ];

        let hasPaidAccess =
          paidStatuses.includes(
            prof.payment_status
          );

        const paymentJustCompleted =
          new URLSearchParams(
            window.location.search
          ).get('payment') === 'success';

        /*
         * Après Stripe, le webhook peut mettre
         * quelques secondes avant de mettre
         * payment_status à jour.
         *
         * On attend donc un peu avant de refuser
         * l'accès.
         */
        if (
          !hasPaidAccess &&
          paymentJustCompleted
        ) {
          for (
            let attempt = 0;
            attempt < 8;
            attempt++
          ) {
            await new Promise(
              (resolve) =>
                setTimeout(resolve, 750)
            );

            const {
              data: refreshedProf,
              error: refreshError,
            } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', uid)
              .maybeSingle();

            if (refreshError) {
              throw refreshError;
            }

            if (refreshedProf) {
              prof = refreshedProf;
            }

            hasPaidAccess =
              paidStatuses.includes(
                prof?.payment_status
              );

            if (hasPaidAccess) {
              break;
            }
          }
        }

        /*
         * Compte connecté mais non payé :
         * impossible d'ouvrir le dashboard.
         */
        if (!hasPaidAccess) {
          window.localStorage.removeItem(
            'levier_pending_plan'
          );

          window.location.replace(
            '/#pricing'
          );

          return;
        }

        /*
         * Le client a bien payé.
         */
        window.localStorage.removeItem(
          'levier_pending_plan'
        );

        if (paymentJustCompleted) {
          window.history.replaceState(
            {},
            '',
            '/dashboard'
          );
        }

        /*
         * -------------------------
         * FIN DU VERROU
         * -------------------------
         */

        if (cancelled) {
          return;
        }

        setProfile(prof);

        await loadDashboardData(uid);
      } catch (error) {
        console.error(
          'Dashboard init error:',
          error
        );

        if (!cancelled) {
          setFatalError(
            error?.message ||
              'Une erreur est survenue pendant le chargement de ton espace.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadDashboardData(uid) {
    const { data: hist } =
      await supabase
        .from('salary_history')
        .select('*')
        .eq('user_id', uid)
        .order('entry_date', {
          ascending: false,
        });

    setHistory(hist || []);

    const { data: exp } =
      await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', {
          ascending: true,
        });

    setExpenses(exp || []);

    const { data: opps } =
      await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', uid)
        .order('updated_at', {
          ascending: false,
        });

    setOpportunities(opps || []);
  }

  async function refreshProfile() {
    if (!userId) {
      return;
    }

    const { data: prof } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (prof) {
      setProfile(prof);
    }
  }

  async function refreshOpportunities() {
    if (!userId) {
      return;
    }

    const { data: opps } =
      await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', {
          ascending: false,
        });

    setOpportunities(opps || []);
  }

    async function handleSignOut() {
    await supabase.auth.signOut();

    router.push('/login');
  }

  async function handleBillingPortal() {
    try {
      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          'Session invalide. Reconnecte-toi.'
        );
      }

      const response = await fetch(
        '/api/billing-portal',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data?.error ||
            'Impossible d’ouvrir la gestion de ton abonnement.'
        );
      }

      window.location.href = data.url;
    } catch (error) {
      setFatalError(
        error?.message ||
          'Impossible d’ouvrir la gestion de ton abonnement.'
      );
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();

    if (!profile?.id) {
      setFatalError(
        "Ton profil n'est pas encore prêt. Recharge la page et réessaie."
      );

      return;
    }

    const job_category =
      e.target.jobCategory.value;

    const target_job_category =
      e.target.targetJobCategory.value ||
      null;

    const experience_level =
      e.target.experienceLevel.value;

    const city_tier =
      e.target.cityTier.value;

    const next_review_date =
      e.target.nextReviewDate.value ||
      null;

    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .update({
        job_category,
        target_job_category,
        experience_level,
        city_tier,
        next_review_date,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      setFatalError(error.message);
      return;
    }

    setProfile(data);

    if (
      history.length === 0 &&
      expenses.length === 0
    ) {
      await loadDashboardData(
        userId
      );
    }

    setShowEditProfile(false);
  }

  if (loading) {
    return (
      <div className="wrap">
        <p className="sr-loading">
          Chargement…
        </p>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="wrap">
        <div className="setup-wrap">
          <h2>
            Impossible de charger ton espace
          </h2>

          <p className="sub">
            {fatalError}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn-primary"
              onClick={() =>
                window.location.reload()
              }
            >
              Réessayer
            </button>

            <button
              className="btn-ghost"
              onClick={
                handleSignOut
              }
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !profile ||
    !profile.job_category ||
    showEditProfile
  ) {
    return (
      <div className="wrap">
        <div className="setup-wrap">
          <h2>
            Configure ton profil
          </h2>

          <p className="sub">
            Ça nous permet de te donner
            une fourchette de salaire
            pertinente.
          </p>

          <form
            onSubmit={
              handleSaveProfile
            }
          >
            <div>
              <label
                htmlFor="jobCategory"
              >
                Métier
              </label>

              <select
                id="jobCategory"
                name="jobCategory"
                defaultValue={
                  profile?.job_category ||
                  JOB_CATEGORIES[0]
                }
              >
                {JOB_CATEGORIES.map(
                  (c) => (
                    <option key={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="targetJobCategory"
              >
                Métier visé pour ton
                prochain poste
                (optionnel)
              </label>

              <select
                id="targetJobCategory"
                name="targetJobCategory"
                defaultValue={
                  profile?.target_job_category ||
                  ''
                }
              >
                <option value="">
                  Même que mon métier
                  actuel
                </option>

                {JOB_CATEGORIES.map(
                  (c) => (
                    <option key={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="experienceLevel"
              >
                Expérience
              </label>

              <select
                id="experienceLevel"
                name="experienceLevel"
                defaultValue={
                  profile?.experience_level ||
                  'junior'
                }
              >
                {EXPERIENCE_LEVELS.map(
                  (l) => (
                    <option
                      key={l.key}
                      value={l.key}
                    >
                      {l.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="cityTier"
              >
                Zone géographique
              </label>

              <select
                id="cityTier"
                name="cityTier"
                defaultValue={
                  profile?.city_tier ||
                  'paris'
                }
              >
                {CITY_TIERS.map(
                  (z) => (
                    <option
                      key={z.key}
                      value={z.key}
                    >
                      {z.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="nextReviewDate"
              >
                Date de ton prochain
                entretien/évaluation
                (optionnel)
              </label>

              <input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                defaultValue={
                  profile?.next_review_date ||
                  ''
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
            >
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: '/dashboard',
      label: "Vue d'ensemble",
    },
    {
      href:
        '/dashboard/finances',
      label: 'Finances',
    },
    {
      href:
        '/dashboard/script',
      label: 'Script',
    },
    {
      href:
        '/dashboard/entrainement',
      label: 'Entraînement',
    },
    {
      href:
        '/dashboard/opportunites',
      label: 'Opportunités',
    },
  ];

  return (
    <DashboardContext.Provider
      value={{
        profile,
        userId,
        history,
        setHistory,
        expenses,
        setExpenses,
        opportunities,
        setOpportunities,
        refreshOpportunities,
        refreshProfile,
        setShowEditProfile,
      }}
    >
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <h1>Levier</h1>

            <p>
              Le bon argument, au bon
              moment.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div className="user-tag">
              {profile.job_category}

              <button
                className="edit-link"
                onClick={() =>
                  setShowEditProfile(
                    true
                  )
                }
              >
                modifier
              </button>
            </div>

                        {profile.payment_status ===
              'monthly' && (
              <button
                className="btn-ghost"
                onClick={
                  handleBillingPortal
                }
              >
                Gérer mon abonnement
              </button>
            )}

            <button
              className="btn-ghost"
              onClick={
                handleSignOut
              }
            >
              Déconnexion
            </button>
          </div>
        </header>

        <nav className="dash-nav">
          {navItems.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-link ${
                  pathname ===
                  item.href
                    ? 'active'
                    : ''
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {children}
      </div>
    </DashboardContext.Provider>
  );
}
