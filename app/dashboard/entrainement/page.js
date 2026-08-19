'use client';

import { useState } from 'react';
import { OBJECTIONS } from '../../../lib/objections';

export default function EntrainementPage() {
  const [index, setIndex] = useState(0);

  return (
    <div>
      <h2 className="section-title" style={{ marginTop: 0 }}>Mode entraînement</h2>
      <p className="benchmark-note" style={{ marginBottom: '14px' }}>
        Un(e) recruteur/manager répond rarement "oui" du premier coup. Entraîne-toi à répondre à ces {OBJECTIONS.length} mises en situation classiques — augmentation et entretien d&apos;embauche confondus.
      </p>
      <div className="panel">
        <p style={{ fontWeight: 600, marginBottom: '10px' }}>
          &ldquo;{OBJECTIONS[index].objection}&rdquo;
        </p>
        <div className="script-box" style={{ marginTop: 0, marginBottom: '14px' }}>
          {OBJECTIONS[index].tip}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIndex((index - 1 + OBJECTIONS.length) % OBJECTIONS.length)}
          >
            ← Précédente
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIndex((index + 1) % OBJECTIONS.length)}
          >
            Suivante ({index + 1}/{OBJECTIONS.length}) →
          </button>
        </div>
      </div>
    </div>
  );
}
