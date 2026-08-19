'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useDashboard } from '../layout';
import { supabase } from '../../../lib/supabaseClient';

const STATUSES = [
  { key: 'postule', label: 'Postulé' },
  { key: 'entretien_rh', label: 'Entretien RH' },
  { key: 'entretien_technique', label: 'Entretien technique' },
  { key: 'entretien_final', label: 'Entretien final' },
  { key: 'offre_recue', label: 'Offre reçue' },
  { key: 'negociation', label: 'Négociation' },
  { key: 'acceptee', label: 'Acceptée' },
  { key: 'refusee', label: 'Refusée' },
];

const ACTIVE_STATUSES = new Set([
  'postule',
  'entretien_rh',
  'entretien_technique',
  'entretien_final',
  'offre_recue',
  'negociation',
]);

const LEVER_STATUSES = new Set([
  'offre_recue',
  'negociation',
]);

function statusLabel(status) {
  return (
    STATUSES.find((s) => s.key === status)?.label || status
  );
}

function formatMoney(value) {
  return value
    ? `${Number(value).toLocaleString('fr-FR')}€`
    : '—';
}

function formatDate(value) {
  if (!value) return null;

  return new Date(`${value}T12:00:00`).toLocaleDateString(
    'fr-FR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}

export default function OpportunitiesPage() {
  const {
    userId,
    opportunities,
    refreshOpportunities,
  } = useDashboard();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeOpportunities = useMemo(
    () =>
      opportunities.filter((o) =>
        ACTIVE_STATUSES.has(o.status)
      ),
    [opportunities]
  );

  const bestOffer = useMemo(() => {
    return (
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
        )[0] || null
    );
  }, [opportunities]);

  const nextAction = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return (
      opportunities
        .filter(
          (o) =>
            ACTIVE_STATUSES.has(o.status) &&
            o.next_action_date &&
            o.next_action_date >= today
        )
        .sort((a, b) =>
          a.next_action_date.localeCompare(
            b.next_action_date
          )
        )[0] || null
    );
  }, [opportunities]);

  function openCreate() {
    setEditing(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(opportunity) {
    setEditing(opportunity);
    setError('');
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setError('');

    const form = e.currentTarget;

    const salaryOffered =
      form.salaryOffered.value.trim();

    const salaryTarget =
      form.salaryTarget.value.trim();

    const payload = {
      company_name: form.companyName.value.trim(),
      job_title:
        form.jobTitle.value.trim() || null,
      status: form.status.value,

      salary_offered: salaryOffered
        ? Number(salaryOffered)
        : null,

      salary_target: salaryTarget
        ? Number(salaryTarget)
        : null,

      benefits:
        form.benefits.value.trim() || null,

      notes:
        form.notes.value.trim() || null,

      next_action:
        form.nextAction.value.trim() || null,

      next_action_date:
        form.nextActionDate.value || null,
    };

    let result;

    if (editing) {
      result = await supabase
        .from('opportunities')
        .update(payload)
        .eq('id', editing.id)
        .eq('user_id', userId);
    } else {
      result = await supabase
        .from('opportunities')
        .insert({
          ...payload,
          user_id: userId,
        });
    }

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    await refreshOpportunities();
    closeForm();
  }

  async function handleDelete(opportunity) {
    if (
      !window.confirm(
        `Supprimer l'opportunité ${opportunity.company_name} ?`
      )
    ) {
      return;
    }

    const { error: deleteError } =
      await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunity.id)
        .eq('user_id', userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await refreshOpportunities();
  }

  return (
    <div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}
      >
        <div>
          <h2
            className="section-title"
            style={{
              margin: '0 0 6px',
            }}
          >
            Mes opportunités
          </h2>

          <p
            className="benchmark-note"
            style={{ margin: 0 }}
          >
            Suis tes candidatures, compare les offres
            et transforme une proposition concurrente
            en levier de négociation.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openCreate}
        >
          + Ajouter une opportunité
        </button>
      </div>


      <div className="summary-grid">

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
              ? formatMoney(
                  bestOffer.salary_offered
                )
              : '—'}
          </span>

          <span className="label">
            Meilleure offre reçue
          </span>
        </div>


        <div className="summary-card">
          <span
            className="val"
            style={{
              fontSize: nextAction
                ? '1rem'
                : undefined,
            }}
          >
            {nextAction
              ? formatDate(
                  nextAction.next_action_date
                )
              : '—'}
          </span>

          <span className="label">
            Prochaine action
          </span>
        </div>

      </div>


      {bestOffer && (
        <div
          className="panel"
          style={{
            borderColor: 'var(--cyan)',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            <strong>
              Ton levier le plus fort :
            </strong>{' '}

            {bestOffer.company_name} t&apos;a
            proposé{' '}

            <strong
              style={{
                color: 'var(--cyan)',
              }}
            >
              {formatMoney(
                bestOffer.salary_offered
              )}
            </strong>{' '}

            brut annuel.

            Tu peux l&apos;injecter dans ton
            script de négociation en un clic.
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
            Utiliser comme levier →
          </Link>
        </div>
      )}


      {showForm && (
        <div
          className="panel"
          style={{
            borderColor: 'var(--blue)',
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2
              className="section-title"
              style={{ margin: 0 }}
            >
              {editing
                ? `Modifier ${editing.company_name}`
                : 'Ajouter une opportunité'}
            </h2>

            <button
              type="button"
              className="btn-ghost"
              onClick={closeForm}
            >
              Fermer
            </button>
          </div>


          <form
            key={editing?.id || 'new'}
            onSubmit={handleSave}
          >

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >

              <div>
                <label htmlFor="companyName">
                  Entreprise *
                </label>

                <input
                  id="companyName"
                  name="companyName"
                  required
                  defaultValue={
                    editing?.company_name || ''
                  }
                  placeholder="Ex. Qonto"
                />
              </div>


              <div>
                <label htmlFor="jobTitle">
                  Poste
                </label>

                <input
                  id="jobTitle"
                  name="jobTitle"
                  defaultValue={
                    editing?.job_title || ''
                  }
                  placeholder="Ex. Account Executive"
                />
              </div>

            </div>


            <div>
              <label htmlFor="status">
                Étape
              </label>

              <select
                id="status"
                name="status"
                defaultValue={
                  editing?.status || 'postule'
                }
              >
                {STATUSES.map((status) => (
                  <option
                    key={status.key}
                    value={status.key}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </div>


            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >

              <div>
                <label htmlFor="salaryOffered">
                  Salaire proposé (€ brut/an)
                </label>

                <input
                  id="salaryOffered"
                  name="salaryOffered"
                  type="number"
                  min="0"
                  step="500"
                  defaultValue={
                    editing?.salary_offered || ''
                  }
                  placeholder="42000"
                />
              </div>


              <div>
                <label htmlFor="salaryTarget">
                  Salaire cible (€ brut/an)
                </label>

                <input
                  id="salaryTarget"
                  name="salaryTarget"
                  type="number"
                  min="0"
                  step="500"
                  defaultValue={
                    editing?.salary_target || ''
                  }
                  placeholder="45000"
                />
              </div>

            </div>


            <div>
              <label htmlFor="benefits">
                Avantages
              </label>

              <textarea
                id="benefits"
                name="benefits"
                rows={2}
                defaultValue={
                  editing?.benefits || ''
                }
                placeholder="Ex. 2 jours de télétravail, RTT, bonus..."
              />
            </div>


            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(220px, 2fr) minmax(160px, 1fr)',
                gap: '12px',
              }}
            >

              <div>
                <label htmlFor="nextAction">
                  Prochaine action
                </label>

                <input
                  id="nextAction"
                  name="nextAction"
                  defaultValue={
                    editing?.next_action || ''
                  }
                  placeholder="Ex. Relancer le recruteur"
                />
              </div>


              <div>
                <label htmlFor="nextActionDate">
                  Date
                </label>

                <input
                  id="nextActionDate"
                  name="nextActionDate"
                  type="date"
                  defaultValue={
                    editing?.next_action_date || ''
                  }
                />
              </div>

            </div>


            <div>
              <label htmlFor="notes">
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={
                  editing?.notes || ''
                }
                placeholder="Interlocuteur, points à négocier, impressions..."
              />
            </div>


            {error && (
              <p
                className="auth-error"
                style={{ margin: 0 }}
              >
                {error}
              </p>
            )}


            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Enregistrement…'
                  : editing
                  ? 'Enregistrer les modifications'
                  : 'Ajouter'}
              </button>


              <button
                type="button"
                className="btn-ghost"
                onClick={closeForm}
              >
                Annuler
              </button>

            </div>

          </form>

        </div>
      )}


      {!showForm && error && (
        <p className="auth-error">
          {error}
        </p>
      )}


      {opportunities.length === 0 ? (

        <div className="panel">
          <p
            className="empty-note"
            style={{ margin: 0 }}
          >
            Aucune opportunité pour l&apos;instant.
            Ajoute ta première candidature pour
            commencer à comparer tes options.
          </p>
        </div>

      ) : (

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >

          {opportunities.map((opportunity) => {

            const isBestOffer =
              bestOffer?.id === opportunity.id;

            const canUseAsLever =
              LEVER_STATUSES.has(
                opportunity.status
              ) &&
              Number(
                opportunity.salary_offered
              ) > 0;

            return (

              <div
                key={opportunity.id}
                className="panel"
                style={{
                  marginBottom: 0,
                  borderColor: isBestOffer
                    ? 'var(--cyan)'
                    : 'var(--border)',
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'flex-start',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >

                      <strong
                        style={{
                          fontFamily:
                            "'Sora', sans-serif",
                          fontSize: '1.05rem',
                        }}
                      >
                        {opportunity.company_name}
                      </strong>


                      <span
                        style={{
                          fontFamily:
                            "'IBM Plex Mono', monospace",
                          fontSize: '0.68rem',
                          textTransform:
                            'uppercase',
                          color:
                            LEVER_STATUSES.has(
                              opportunity.status
                            )
                              ? 'var(--cyan)'
                              : 'var(--ink-soft)',
                          border:
                            '1px solid var(--border)',
                          padding: '3px 7px',
                          borderRadius: '999px',
                        }}
                      >
                        {statusLabel(
                          opportunity.status
                        )}
                      </span>


                      {isBestOffer && (
                        <span
                          style={{
                            fontSize:
                              '0.72rem',
                            color:
                              'var(--cyan)',
                          }}
                        >
                          ★ meilleure offre
                        </span>
                      )}

                    </div>


                    {opportunity.job_title && (
                      <p
                        className="benchmark-note"
                        style={{
                          margin: '5px 0 0',
                        }}
                      >
                        {opportunity.job_title}
                      </p>
                    )}

                  </div>


                  <div
                    style={{
                      textAlign: 'right',
                    }}
                  >

                    <span
                      style={{
                        display: 'block',
                        fontFamily:
                          "'IBM Plex Mono', monospace",
                        color: 'var(--cyan)',
                        fontWeight: 600,
                      }}
                    >
                      {formatMoney(
                        opportunity.salary_offered
                      )}
                    </span>

                    <span className="benchmark-note">
                      proposé
                    </span>

                  </div>

                </div>


                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '12px',
                    marginTop: '16px',
                  }}
                >

                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        color:
                          'var(--ink-soft)',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Salaire cible
                    </span>

                    <span>
                      {formatMoney(
                        opportunity.salary_target
                      )}
                    </span>
                  </div>


                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        color:
                          'var(--ink-soft)',
                        textTransform:
                          'uppercase',
                      }}
                    >
                      Prochaine action
                    </span>

                    <span>
                      {opportunity.next_action ||
                        '—'}
                    </span>

                    {opportunity.next_action_date && (
                      <span className="benchmark-note">
                        {' '}
                        ·{' '}
                        {formatDate(
                          opportunity.next_action_date
                        )}
                      </span>
                    )}

                  </div>

                </div>


                {opportunity.benefits && (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      margin: '14px 0 0',
                    }}
                  >
                    <strong>Avantages :</strong>{' '}
                    {opportunity.benefits}
                  </p>
                )}


                {opportunity.notes && (
                  <p
                    className="benchmark-note"
                    style={{
                      lineHeight: 1.5,
                      margin: '8px 0 0',
                    }}
                  >
                    {opportunity.notes}
                  </p>
                )}


                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '16px',
                  }}
                >

                  {canUseAsLever && (
                    <Link
                      href={`/dashboard/script?opportunity=${opportunity.id}`}
                      className="btn-primary"
                      style={{
                        textDecoration:
                          'none',
                        display:
                          'inline-block',
                      }}
                    >
                      Utiliser comme levier
                    </Link>
                  )}


                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      openEdit(opportunity)
                    }
                  >
                    Modifier
                  </button>


                  <button
                    type="button"
                    className="btn-ghost"
                    style={{
                      color:
                        'var(--danger)',
                    }}
                    onClick={() =>
                      handleDelete(
                        opportunity
                      )
                    }
                  >
                    Supprimer
                  </button>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}
