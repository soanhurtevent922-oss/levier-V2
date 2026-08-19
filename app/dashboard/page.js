'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '../layout';
import { getBenchmark } from '../../../lib/benchmarks';

const LEVER_STATUSES = new Set(['offre_recue', 'negociation']);

export default function ScriptPage() {
  const { profile, history, opportunities } = useDashboard();

  const [mode, setMode] = useState('augmentation');
  const [script, setScript] = useState('');
  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const opportunityId = params.get('opportunity');

    if (opportunityId) {
      setSelectedOpportunityId(opportunityId);
    }
  }, []);

  const currentSalary = history?.[0]?.amount || null;

  const [min, max] =
    getBenchmark(
      profile.job_category,
      profile.experience_level,
      profile.city_tier
    ) || [null, null];

  const targetJob =
    profile.target_job_category || profile.job_category;

  const [targetMin, targetMax] =
    getBenchmark(
      targetJob,
      profile.experience_level,
      profile.city_tier
    ) || [null, null];

  const usableOpportunities = useMemo(
    () =>
      (opportunities || []).filter(
        (o) =>
          LEVER_STATUSES.has(o.status) &&
          Number(o.salary_offered) > 0
      ),
    [opportunities]
  );

  const selectedOpportunity =
    usableOpportunities.find(
      (o) => o.id === selectedOpportunityId
    ) || null;

  function competitiveOfferLine() {
    if (!selectedOpportunity) return null;

    const amount = Number(
      selectedOpportunity.salary_offered
    ).toLocaleString('fr-FR');

    return `Je souhaite aussi être transparent : je dispose actuellement d'une autre proposition chez ${selectedOpportunity.company_name} à ${amount}€ brut annuel. Ma préférence dépend de l'ensemble du poste et du package, mais cette offre constitue naturellement un point de comparaison dans ma décision.`;
  }

  function generateScript(e) {
    e.preventDefault();

    const achievement =
      e.target.achievement.value.trim();

    const targetPct =
      parseFloat(e.target.targetPct?.value) || 0;

    if (mode === 'augmentation') {
      const base = currentSalary || max;

      const target = base
        ? Math.round(
            (base * (1 + targetPct / 100)) / 100
          ) * 100
        : null;

      const lines = [
        `Merci de prendre le temps d'échanger sur ma rémunération pour mon poste de ${profile.job_category}.`,

        currentSalary
          ? `Je suis actuellement à ${currentSalary.toLocaleString(
              'fr-FR'
            )}€ brut annuel.`
          : null,

        achievement
          ? `Depuis ma dernière évaluation, j'ai notamment : ${achievement}.`
          : `Je voulais faire un point sur mes responsabilités actuelles et leur évolution.`,

        min && max
          ? `D'après les données de marché pour un poste comparable au mien, la fourchette se situe plutôt entre ${min.toLocaleString(
              'fr-FR'
            )}€ et ${max.toLocaleString(
              'fr-FR'
            )}€ brut annuel.`
          : `D'après mes recherches sur le marché actuel, ma rémunération me semble en retrait par rapport à des postes comparables.`,

        competitiveOfferLine(),

        target
          ? currentSalary
            ? `Vu mes responsabilités et ce contexte, je vise une évolution vers ${target.toLocaleString(
                'fr-FR'
              )}€ brut annuel — soit environ ${targetPct}% d'augmentation par rapport à ma situation actuelle.`
            : `Vu mes responsabilités et ce contexte, je vise une rémunération autour de ${target.toLocaleString(
                'fr-FR'
              )}€ brut annuel.`
          : `Je souhaiterais qu'on évoque une revalorisation cohérente avec ces éléments.`,

        `Si le budget ne permet pas de bouger sur le fixe pour l'instant, je suis ouvert(e) à en discuter — jours de télétravail, prime variable, formation prise en charge.`,
      ].filter(Boolean);

      setScript(lines.join('\n\n'));
    } else {
      const lines = [
        `Merci de me recevoir pour ce poste de ${targetJob}, ça correspond vraiment à ce que je cherche à faire évoluer dans ma carrière.`,

        achievement
          ? `Pour vous donner un exemple concret de ce que j'apporte : ${achievement}.`
          : `Je serais ravi(e) de détailler mon parcours et ce que je peux apporter à ce poste précis.`,

        targetMin && targetMax
          ? `Concernant la rémunération, mes recherches sur le marché pour ce type de poste indiquent une fourchette entre ${targetMin.toLocaleString(
              'fr-FR'
            )}€ et ${targetMax.toLocaleString(
              'fr-FR'
            )}€ brut annuel.`
          : `Concernant la rémunération, je me suis renseigné(e) sur les standards du marché pour ce type de poste.`,

        competitiveOfferLine(),

        `Je viserais plutôt le haut de cette fourchette, vu mon expérience et ce que je peux apporter rapidement à l'équipe — mais je reste ouvert(e) à en discuter selon l'ensemble du package (avantages, évolution, télétravail).`,

        `Avez-vous des questions sur mon parcours, ou souhaitez-vous qu'on aborde un point en particulier ?`,
      ].filter(Boolean);

      setScript(lines.join('\n\n'));
    }
  }

  return (
    <div>
      <div className="panel">
        <h2
          className="section-title"
          style={{ margin: 0 }}
        >
          Ta fourchette de référence
        </h2>

        {min && max ? (
          <>
            <span className="benchmark-range">
              {min.toLocaleString('fr-FR')}€ –{' '}
              {max.toLocaleString('fr-FR')}€
            </span>

            <span className="benchmark-note">
              Brut annuel indicatif pour ton profil.
              Croise avec Glassdoor/LinkedIn pour
              affiner.
            </span>
          </>
        ) : (
          <p className="empty-note">
            Pas de donnée pour ce profil précis.
          </p>
        )}

        {currentSalary && (
          <p
            className="benchmark-note"
            style={{ marginTop: '10px' }}
          >
            Ton dernier salaire renseigné :{' '}
            <strong>
              {currentSalary.toLocaleString('fr-FR')}€
            </strong>
            .
          </p>
        )}
      </div>

      {selectedOpportunity && (
        <div
          className="panel"
          style={{ borderColor: 'var(--cyan)' }}
        >
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            <strong>Levier sélectionné :</strong>{' '}
            {selectedOpportunity.company_name} —{' '}
            <strong style={{ color: 'var(--cyan)' }}>
              {Number(
                selectedOpportunity.salary_offered
              ).toLocaleString('fr-FR')}
              €
            </strong>{' '}
            brut/an.
          </p>

          <p
            className="benchmark-note"
            style={{ margin: '6px 0 0' }}
          >
            Cette offre sera automatiquement intégrée
            à ton prochain script.
          </p>
        </div>
      )}

      <h2 className="section-title">
        Prépare ta discussion
      </h2>

      <div className="panel">
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className={
              mode === 'augmentation'
                ? 'btn-primary'
                : 'btn-ghost'
            }
            onClick={() => {
              setMode('augmentation');
              setScript('');
            }}
          >
            Négociation d&apos;augmentation
          </button>

          <button
            type="button"
            className={
              mode === 'entretien'
                ? 'btn-primary'
                : 'btn-ghost'
            }
            onClick={() => {
              setMode('entretien');
              setScript('');
            }}
          >
            Entretien d&apos;embauche
          </button>
        </div>

        <form onSubmit={generateScript}>
          {usableOpportunities.length > 0 && (
            <div>
              <label htmlFor="opportunity">
                Offre concurrente à utiliser comme
                levier (optionnel)
              </label>

              <select
                id="opportunity"
                value={selectedOpportunityId}
                onChange={(e) => {
                  setSelectedOpportunityId(
                    e.target.value
                  );
                  setScript('');
                }}
              >
                <option value="">
                  Ne pas utiliser d&apos;offre
                </option>

                {usableOpportunities.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.company_name} —{' '}
                    {Number(
                      o.salary_offered
                    ).toLocaleString('fr-FR')}
                    €
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="achievement">
              {mode === 'augmentation'
                ? 'Une réussite récente à mettre en avant (optionnel)'
                : 'Une expérience ou réussite à mettre en avant (optionnel)'}
            </label>

            <textarea
              id="achievement"
              name="achievement"
              rows={2}
              placeholder="Ex. j'ai piloté le lancement de X, augmenté Y de 20%..."
            />
          </div>

          {mode === 'augmentation' && (
            <div>
              <label htmlFor="targetPct">
                Augmentation visée (%)
              </label>

              <input
                id="targetPct"
                name="targetPct"
                type="number"
                min="0"
                max="100"
                defaultValue={10}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
          >
            Générer mon script
          </button>
        </form>

        {script && (
          <div className="script-box">
            {script}
          </div>
        )}

        {mode === 'augmentation' &&
          !currentSalary && (
            <p
              className="benchmark-note"
              style={{ marginTop: '10px' }}
            >
              Astuce : ajoute ton salaire actuel dans
              l&apos;onglet <strong>Finances</strong>{' '}
              pour un script basé sur ta vraie
              situation.
            </p>
          )}
      </div>

      <div
        className="panel"
        style={{ borderColor: 'var(--cyan)' }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            margin: 0,
          }}
        >
          <strong>À savoir :</strong> les fourchettes
          sont des repères indicatifs, pas des données
          de marché en temps réel.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '10px',
            flexWrap: 'wrap',
          }}
        >
          <a
            className="btn-ghost"
            style={{ textDecoration: 'none' }}
            href="https://www.glassdoor.fr/Salaires/index.htm"
            target="_blank"
            rel="noreferrer"
          >
            Voir sur Glassdoor
          </a>

          <a
            className="btn-ghost"
            style={{ textDecoration: 'none' }}
            href="https://www.linkedin.com/salary/"
            target="_blank"
            rel="noreferrer"
          >
            Voir sur LinkedIn Salary
          </a>
        </div>
      </div>
    </div>
  );
}
