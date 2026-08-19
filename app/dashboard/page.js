'use client';

import Link from 'next/link';
import { useDashboard } from './layout';
import { getBenchmark } from '../../lib/benchmarks';

const ACTIVE_STATUSES = new Set([
  'postule',
  'entretien_rh',
  'entretien_technique',
  'entretien_final',
  'offre_recue',
  'negociation',
]);

const LEVER_STATUSES = new Set(['offre_recue', 'negociation']);

export default function OverviewPage() {
  const { profile, history, expenses, opportunities } = useDashboard();

  const [min, max] =
    getBenchmark(
      profile.job_category,
      profile.experience_level,
      profile.city_tier
    ) || [null, null];

  const latestSalary = history[0]?.amount || null;

  const totalMonthlyExpenses = expenses.reduce(
    (sum, e) => sum + e.monthly_amount,
    0
  );

  const monthlyGrossEstimate = latestSalary
    ? Math.round(latestSalary / 12)
    : null;

  const resteAVivre =
    monthlyGrossEstimate !== null
      ? monthlyGrossEstimate - totalMonthlyExpenses
      : null;

  const activeOpportunities = opportunities.filter((o) =>
    ACTIVE_STATUSES.has(o.status)
  );

  const bestOffer =
    opportunities
      .filter(
        (o) =>
          LEVER_STATUSES.has(o.status) &&
          Number(o.salary_offered) > 0
      )
      .sort(
        (a, b) =>
          Number(b.salary_offered) -
          Number(a.salary_offered)
      )[0] || null;

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card">
          <span className="val">
            {min
              ? `${(min / 1000).toFixed(0)}k–${(
                  max / 1000
                ).toFixed(0)}k€`
              : '—'}
          </span>
          <span className="label">
            Fourchette de référence
          </span>
        </div>

        <div className="summary-card">
          <span className="val">
            {latestSalary
              ? `${latestSalary.toLocaleString('fr-FR')}€`
              : '—'}
          </span>
          <span className="label">
            Dernier salaire renseigné
          </span>
        </div>

        <div className="summary-card">
          <span className="val">
            {expenses.length
              ? `${totalMonthlyExpenses.toLocaleString(
                  'fr-FR'
                )}€`
              : '—'}
          </span>
          <span className="label">Dépenses / mois</span>
        </div>

        <div className="summary-card">
          <span
            className={`val ${
              resteAVivre !== null && resteAVivre < 0
                ? 'warn'
                : ''
            }`}
          >
            {resteAVivre !== null
              ? `${resteAVivre.toLocaleString('fr-FR')}€`
              : '—'}
          </span>
          <span className="label">
            Estimation reste à vivre / mois
          </span>
        </div>

        <div className="summary-card">
          <span className="val">
            {activeOpportunities.length}
          </span>
          <span className="label">
            Opportunités actives
          </span>
        </div>

        <div className="summary-card">
          <span className="val">
            {bestOffer
              ? `${Number(
                  bestOffer.salary_offered
                ).toLocaleString('fr-FR')}€`
              : '—'}
          </span>
          <span className="label">
            Meilleure offre reçue
          </span>
        </div>
      </div>

      {latestSalary && expenses.length > 0 && (
        <p
          className="benchmark-note"
          style={{ marginBottom: '28px' }}
        >
          Estimation basée sur ton dernier salaire brut annuel
          divisé par 12 — ce n&apos;est pas un vrai salaire net,
          juste un repère. Renseigne tes dépenses et ton salaire
          dans l&apos;onglet Finances pour affiner.
        </p>
      )}

      {bestOffer && (
        <div
          className="panel"
          style={{
            borderColor: 'var(--cyan)',
            marginBottom: '28px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            <strong>Levier disponible :</strong> ton offre chez{' '}
            {bestOffer.company_name} à{' '}
            <strong style={{ color: 'var(--cyan)' }}>
              {Number(
                bestOffer.salary_offered
              ).toLocaleString('fr-FR')}
              €
            </strong>{' '}
            brut/an peut être utilisée dans ton prochain script
            de négociation.
          </p>

          <Link
            href={`/dashboard/script?opportunity=${bestOffer.id}`}
            className="btn-primary"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              marginTop: '12px',
            }}
          >
            Utiliser cette offre →
          </Link>
        </div>
      )}

      <h2 className="section-title">Accès rapide</h2>

      <div className="quick-links">
        <Link
          href="/dashboard/finances"
          className="quick-link-card"
        >
          <span className="qlabel">Finances</span>
          <p>
            Salaire, charges, dépenses et ton évolution dans le
            temps.
          </p>
        </Link>

        <Link
          href="/dashboard/script"
          className="quick-link-card"
        >
          <span className="qlabel">
            Script d&apos;entretien
          </span>
          <p>
            Génère ton argumentaire personnalisé pour ta prochaine
            négociation.
          </p>
        </Link>

        <Link
          href="/dashboard/entrainement"
          className="quick-link-card"
        >
          <span className="qlabel">Entraînement</span>
          <p>
            Prépare-toi aux objections classiques d&apos;un
            manager.
          </p>
        </Link>

        <Link
          href="/dashboard/opportunites"
          className="quick-link-card"
        >
          <span className="qlabel">Mes opportunités</span>
          <p>
            Suis tes candidatures, compare les offres et repère ton
            meilleur levier.
          </p>
        </Link>
      </div>
    </div>
  );
}
