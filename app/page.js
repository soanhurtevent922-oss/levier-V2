import Link from 'next/link';

export const metadata = {
  title: 'Levier — Négocie ton salaire avec un vrai argument',
};

const FEATURES = [
  {
    number: '01',
    label: 'Connais ta valeur',
    title: 'Une fourchette qui te donne un vrai point de départ.',
    desc: "Métier, niveau d’expérience, zone géographique : tu arrives avec un repère concret au lieu d’un chiffre sorti de nulle part.",
  },
  {
    number: '02',
    label: 'Structure ton discours',
    title: 'Un script qui ressemble à une vraie conversation.',
    desc: "Tes réussites, ton objectif et tes arguments sont transformés en un discours clair que tu peux vraiment utiliser en entretien.",
  },
  {
    number: '03',
    label: 'Anticipe les objections',
    title: 'Prépare les réponses avant qu’on te mette sous pression.',
    desc: "Budget serré, mauvais timing, salaire déjà compétitif : entraîne-toi aux objections les plus fréquentes.",
  },
  {
    number: '04',
    label: 'Garde tes leviers',
    title: 'Tes offres et négociations au même endroit.',
    desc: "Suis plusieurs opportunités, compare les salaires et utilise une offre concurrente au bon moment.",
  },
  {
    number: '05',
    label: 'Reste prêt',
    title: 'Ton historique et tes rappels restent avec toi.',
    desc: "Retrouve ton évolution de salaire et prépare le prochain entretien sans repartir de zéro.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing">
      <div className="l-noise" aria-hidden="true" />

      <header className="l-header">
        <Link href="/" className="l-logo">LEVIER</Link>
       
      </header>

      <section className="l-hero">
        <div className="l-hero-copy">
          <div className="l-kicker">
            <span className="l-kicker-dot" />
            Préparation salariale
          </div>

          <h1>
            Négocier ton salaire<br />
            ne devrait pas être<br />
            <em>improvisé.</em>
          </h1>

          <p className="l-sub">
            Connais ta valeur, prépare tes arguments et arrive à ton entretien avec un plan clair — pas avec l’espoir que ça passe.
          </p>

          <div className="l-actions">
            <a href="#pricing" className="l-cta">
              Préparer ma négociation
              <span className="l-cta-icon">→</span>
            </a>
            <a href="#features" className="l-secondary">Découvrir Levier</a>
          </div>

          <div className="l-micro-proof">
            <span className="l-stars">★★★★★</span>
            <span><strong>+ de 2 300</strong> clients satisfaits</span>
          </div>
        </div>

        <div className="l-visual" aria-hidden="true">
          <div className="l-orbit l-orbit-one" />
          <div className="l-orbit l-orbit-two" />

          <div className="l-visual-card">
            <div className="l-visual-topline">
              <span>TON LEVIER</span>
              <span className="l-live"><i /> prêt</span>
            </div>

            <div className="l-range-label">Fourchette cible</div>
            <div className="l-range">48k — 54k€</div>
            <div className="l-range-track"><span /></div>

            <div className="l-lever-stage">
              <svg viewBox="0 0 420 240" className="l-lever-svg">
                <line x1="44" y1="205" x2="376" y2="205" className="l-baseline" />
                <polygon points="210,162 184,211 236,211" className="l-fulcrum" />
                <g className="l-bar-group">
                  <rect x="66" y="116" width="288" height="9" rx="5" className="l-bar" />
                  <circle cx="82" cy="120" r="15" className="l-weight-low" />
                  <circle cx="338" cy="120" r="20" className="l-weight-high" />
                  <text x="82" y="154" className="l-tag">avant</text>
                  <text x="338" y="84" className="l-tag l-tag-high">après</text>
                </g>
              </svg>
            </div>

            <div className="l-visual-stats">
              <div><span>Objectif</span><strong>+12%</strong></div>
              <div><span>Argument</span><strong>Prêt</strong></div>
              <div><span>Confiance</span><strong>↑</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="l-proof-strip">
        <div className="l-proof-inner">
          <div className="l-proof-main">
            <span className="l-proof-stars">★★★★★</span>
            <strong>+ de 2 300 clients satisfaits</strong>
          </div>
          <span className="l-proof-copy">Une préparation simple, claire et utilisable le jour J.</span>
        </div>
      </section>

      <section className="l-features" id="features">
        <div className="l-section-head">
          <div>
            <span className="l-section-kicker">Tout ce qu’il te faut</span>
            <h2>Moins de stress.<br />Plus de stratégie.</h2>
          </div>
          <p>
            Levier ne te donne pas juste un chiffre. Il t’aide à construire une position crédible avant d’entrer dans la discussion.
          </p>
        </div>

        <div className="l-bento">
          {FEATURES.map((feature, index) => (
            <article className={`l-feature-card l-feature-card--${index + 1}`} key={feature.number}>
              <div className="l-feature-meta">
                <span className="l-feature-number">{feature.number}</span>
                <span className="l-feature-label">{feature.label}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              {index === 0 && (
                <div className="l-mini-range">
                  <span>42k</span><div><i /></div><span>54k</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="l-quote">
        <div className="l-quote-mark">“</div>
        <p>Le meilleur moment pour préparer ta négociation, c’est avant d’être assis face à ton manager.</p>
        <span>Levier — le bon argument, au bon moment.</span>
      </section>

     <section className="l-pricing" id="pricing">
        <div className="l-section-head l-section-head--pricing">
          <div>
            <span className="l-section-kicker">Accès</span>
            <h2>Choisis ton rythme.</h2>
          </div>
          <p>Choisis la formule qui te convient et crée ton compte pour accéder à Levier.</p>
        </div>

        <div className="l-pricing-grid">
          <div className="l-price-card">
            <div>
              <span className="l-price-tag">Accès à vie</span>
              <div className="l-price-amount">300€</div>
              <p>Paiement unique. Tu gardes l’accès à Levier sans limite de temps.</p>
            </div>
            <Link href="/login?plan=lifetime" className="l-price-cta">Choisir l’accès à vie <span>→</span></Link>
          </div>

          <div className="l-price-card l-price-card--featured">
            <div className="l-popular">Le plus flexible</div>
            <div>
              <span className="l-price-tag">Mensuel</span>
              <div className="l-price-amount">50€<small>/mois</small></div>
              <p>Sans engagement. Tu peux arrêter dès que tu n’en as plus besoin.</p>
            </div>
            <Link href="/login?plan=monthly" className="l-price-cta l-price-cta--featured">Commencer maintenant <span>→</span></Link>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <span className="l-logo">LEVIER</span>
        <span>Le bon argument, au bon moment.</span>
      </footer>

      <style>{`
        :root {
          --l-bg: #0a0b0e;
          --l-surface: #111318;
          --l-surface-2: #15181d;
          --l-line: rgba(255,255,255,.09);
          --l-line-strong: rgba(255,255,255,.15);
          --l-text: #f2f0e9;
          --l-muted: #a1a4ad;
          --l-accent: #6ee7d2;
          --l-accent-soft: rgba(110,231,210,.12);
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .landing {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 78% 9%, rgba(110,231,210,.08), transparent 24%),
            radial-gradient(circle at 8% 26%, rgba(255,255,255,.035), transparent 22%),
            var(--l-bg);
          color: var(--l-text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .l-noise {
          pointer-events: none;
          position: absolute;
          inset: 0;
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
        }

        .l-header {
          position: relative;
          z-index: 3;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 28px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .l-logo {
          color: var(--l-text);
          text-decoration: none;
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: .14em;
        }

        .l-login {
          color: var(--l-text);
          text-decoration: none;
          font-size: .88rem;
          font-weight: 600;
          padding: 10px 16px;
          border: 1px solid var(--l-line);
          border-radius: 999px;
          transition: .2s ease;
        }

        .l-login:hover { border-color: var(--l-line-strong); background: rgba(255,255,255,.04); }
        .l-login span { margin-left: 5px; }

        .l-hero {
          position: relative;
          z-index: 2;
          max-width: 1180px;
          margin: 0 auto;
          min-height: 650px;
          padding: 88px 28px 70px;
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 64px;
          align-items: center;
        }

        .l-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border: 1px solid var(--l-line);
          border-radius: 999px;
          color: #c6c8ce;
          font-size: .78rem;
          font-weight: 600;
          letter-spacing: .02em;
          background: rgba(255,255,255,.025);
        }

        .l-kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: var(--l-accent);
          box-shadow: 0 0 14px rgba(110,231,210,.8);
        }

        .l-hero h1 {
          margin: 22px 0 24px;
          max-width: 720px;
          font-family: 'Sora', sans-serif;
          font-size: clamp(3.2rem, 5.8vw, 5.15rem);
          line-height: .98;
          letter-spacing: -.055em;
          font-weight: 650;
        }

        .l-hero h1 em {
          color: var(--l-accent);
          font-style: normal;
          font-weight: 650;
        }

        .l-sub {
          max-width: 590px;
          margin: 0 0 31px;
          color: var(--l-muted);
          font-size: 1.08rem;
          line-height: 1.65;
          letter-spacing: -.01em;
        }

        .l-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .l-cta {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 9px 10px 9px 20px;
          border-radius: 999px;
          background: var(--l-text);
          color: #0b0c0f;
          text-decoration: none;
          font-size: .94rem;
          font-weight: 700;
          transition: transform .2s ease, background .2s ease;
        }

        .l-cta:hover { transform: translateY(-2px); background: #fff; }

        .l-cta-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: var(--l-accent);
          font-size: 1rem;
        }

        .l-secondary {
          color: #c6c8ce;
          text-decoration: none;
          font-size: .9rem;
          border-bottom: 1px solid rgba(255,255,255,.25);
          padding-bottom: 2px;
        }

        .l-micro-proof {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #9fa2a9;
          font-size: .82rem;
        }

        .l-micro-proof strong { color: var(--l-text); font-weight: 650; }
        .l-stars { color: var(--l-accent); letter-spacing: 2px; font-size: .75rem; }

        .l-visual { position: relative; min-height: 500px; display: grid; place-items: center; }

        .l-orbit {
          position: absolute;
          border: 1px solid rgba(110,231,210,.08);
          border-radius: 50%;
        }
        .l-orbit-one { width: 460px; height: 460px; }
        .l-orbit-two { width: 350px; height: 350px; }

        .l-visual-card {
          position: relative;
          width: min(100%, 455px);
          padding: 25px;
          background: rgba(17,19,24,.88);
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 28px;
          box-shadow: 0 30px 90px rgba(0,0,0,.42);
          backdrop-filter: blur(14px);
        }

        .l-visual-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #7e828b;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .12em;
        }

        .l-live { letter-spacing: 0; text-transform: lowercase; display: flex; align-items: center; gap: 6px; color: #9699a1; font-weight: 600; }
        .l-live i { width: 6px; height: 6px; background: var(--l-accent); border-radius: 50%; box-shadow: 0 0 10px rgba(110,231,210,.8); }

        .l-range-label { margin-top: 35px; color: #8d9199; font-size: .78rem; }
        .l-range { margin-top: 4px; font-family: 'Sora', sans-serif; font-size: 2.15rem; font-weight: 600; letter-spacing: -.04em; }
        .l-range-track { height: 5px; border-radius: 99px; margin-top: 17px; background: #23262d; overflow: hidden; }
        .l-range-track span { display: block; width: 72%; height: 100%; background: var(--l-accent); border-radius: 99px; }

        .l-lever-stage { margin: 14px -6px 0; }
        .l-lever-svg { width: 100%; display: block; }
        .l-baseline { stroke: #2b2e35; stroke-width: 2; }
        .l-fulcrum { fill: #16191e; stroke: #30343b; stroke-width: 2; }
        .l-bar-group { transform-origin: 210px 162px; animation: l-tilt 1.4s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes l-tilt { from { transform: rotate(0deg); } to { transform: rotate(-12deg); } }
        .l-bar { fill: #343841; }
        .l-weight-low { fill: #15181d; stroke: #3a3e46; stroke-width: 2; }
        .l-weight-high { fill: var(--l-accent); filter: drop-shadow(0 0 14px rgba(110,231,210,.45)); }
        .l-tag { fill: #737780; font-size: 11px; text-anchor: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .l-tag-high { fill: var(--l-accent); }

        .l-visual-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .l-visual-stats div { padding: 12px 13px; border-radius: 14px; background: rgba(255,255,255,.035); }
        .l-visual-stats span { display: block; color: #787c85; font-size: .66rem; margin-bottom: 4px; }
        .l-visual-stats strong { font-size: .84rem; color: #dfe1e5; font-weight: 650; }

        .l-proof-strip { max-width: 1180px; margin: 0 auto; padding: 0 28px; }
        .l-proof-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 19px 24px;
          border-top: 1px solid var(--l-line);
          border-bottom: 1px solid var(--l-line);
        }
        .l-proof-main { display: flex; align-items: center; gap: 14px; }
        .l-proof-main strong { font-size: .98rem; font-weight: 650; }
        .l-proof-stars { color: var(--l-accent); letter-spacing: 2px; font-size: .72rem; }
        .l-proof-copy { color: #81858e; font-size: .82rem; }

        .l-features { max-width: 1180px; margin: 0 auto; padding: 120px 28px 90px; }
        .l-section-head { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: end; margin-bottom: 46px; }
        .l-section-kicker { display: block; margin-bottom: 12px; color: var(--l-accent); font-size: .77rem; font-weight: 700; letter-spacing: .04em; }
        .l-section-head h2 { margin: 0; font-family: 'Sora', sans-serif; font-size: clamp(2.5rem, 4vw, 3.65rem); line-height: 1.02; letter-spacing: -.045em; font-weight: 600; }
        .l-section-head > p { margin: 0 0 5px; max-width: 500px; color: var(--l-muted); font-size: 1rem; line-height: 1.65; }

        .l-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
        .l-feature-card {
          position: relative;
          min-height: 260px;
          padding: 28px;
          background: var(--l-surface);
          border: 1px solid var(--l-line);
          border-radius: 24px;
          overflow: hidden;
          transition: transform .2s ease, border-color .2s ease;
        }
        .l-feature-card:hover { transform: translateY(-3px); border-color: var(--l-line-strong); }
        .l-feature-card--1 { grid-column: span 7; min-height: 330px; background: linear-gradient(145deg, #14171c, #101216); }
        .l-feature-card--2 { grid-column: span 5; }
        .l-feature-card--3 { grid-column: span 4; }
        .l-feature-card--4 { grid-column: span 4; }
        .l-feature-card--5 { grid-column: span 4; }

        .l-feature-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 44px; }
        .l-feature-number { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--l-accent-soft); color: var(--l-accent); font-size: .68rem; font-weight: 750; }
        .l-feature-label { color: #9b9ea6; font-size: .76rem; font-weight: 650; }
        .l-feature-card h3 { max-width: 530px; margin: 0 0 13px; font-family: 'Sora', sans-serif; font-size: 1.42rem; line-height: 1.22; letter-spacing: -.025em; font-weight: 600; }
        .l-feature-card p { max-width: 510px; margin: 0; color: #90949d; font-size: .9rem; line-height: 1.6; }

        .l-mini-range { position: absolute; left: 28px; right: 28px; bottom: 28px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; color: #777b84; font-size: .7rem; }
        .l-mini-range div { height: 5px; border-radius: 99px; background: #272a31; overflow: hidden; }
        .l-mini-range i { display: block; width: 76%; height: 100%; background: var(--l-accent); border-radius: 99px; }

        .l-quote { max-width: 1020px; margin: 20px auto 120px; padding: 0 28px; text-align: center; }
        .l-quote-mark { color: var(--l-accent); font-family: Georgia, serif; font-size: 4rem; line-height: .7; opacity: .7; }
        .l-quote p { max-width: 840px; margin: 24px auto 18px; font-family: 'Sora', sans-serif; font-size: clamp(1.8rem, 3.5vw, 3rem); line-height: 1.22; letter-spacing: -.035em; font-weight: 500; }
        .l-quote span { color: #767a83; font-size: .8rem; }

        .l-pricing { max-width: 1180px; margin: 0 auto; padding: 0 28px 110px; }
        .l-section-head--pricing { align-items: end; }
        .l-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .l-price-card { min-height: 350px; padding: 32px; border-radius: 26px; background: var(--l-surface); border: 1px solid var(--l-line); display: flex; flex-direction: column; justify-content: space-between; }
        .l-price-card--featured { position: relative; background: linear-gradient(145deg, rgba(110,231,210,.09), #121418 48%); border-color: rgba(110,231,210,.28); }
        .l-popular { position: absolute; top: 24px; right: 24px; padding: 7px 10px; border-radius: 999px; background: var(--l-accent-soft); color: var(--l-accent); font-size: .68rem; font-weight: 700; }
        .l-price-tag { color: #8e929a; font-size: .78rem; font-weight: 650; }
        .l-price-amount { margin-top: 12px; font-family: 'Sora', sans-serif; font-size: 3.6rem; font-weight: 600; letter-spacing: -.055em; }
        .l-price-amount small { margin-left: 5px; color: #777b84; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 1rem; font-weight: 500; letter-spacing: 0; }
        .l-price-card p { max-width: 390px; color: #8e929a; font-size: .9rem; line-height: 1.6; }
        .l-price-cta { display: flex; justify-content: space-between; align-items: center; padding: 14px 17px; border-radius: 999px; border: 1px solid var(--l-line); color: var(--l-text); text-decoration: none; font-size: .86rem; font-weight: 650; transition: .2s ease; }
        .l-price-cta:hover { background: rgba(255,255,255,.04); }
        .l-price-cta--featured { background: var(--l-text); color: #0b0c0f; border-color: transparent; }
        .l-price-cta--featured:hover { background: white; }

        .l-footer { max-width: 1180px; margin: 0 auto; padding: 28px 28px 42px; border-top: 1px solid var(--l-line); display: flex; justify-content: space-between; align-items: center; color: #696d75; font-size: .76rem; }
        .l-footer .l-logo { color: #aeb1b8; font-size: .8rem; }

        @media (max-width: 900px) {
          .l-hero { grid-template-columns: 1fr; padding-top: 70px; gap: 32px; }
          .l-visual { min-height: 430px; }
          .l-section-head { grid-template-columns: 1fr; gap: 20px; }
          .l-feature-card--1, .l-feature-card--2 { grid-column: span 12; }
          .l-feature-card--3, .l-feature-card--4, .l-feature-card--5 { grid-column: span 6; }
        }

        @media (max-width: 640px) {
          .l-header { padding: 22px 18px 0; }
          .l-login { padding: 9px 13px; }
          .l-hero { min-height: auto; padding: 62px 18px 48px; }
          .l-hero h1 { font-size: clamp(2.75rem, 14vw, 4rem); }
          .l-sub { font-size: 1rem; }
          .l-actions { align-items: flex-start; flex-direction: column; }
          .l-visual { min-height: 380px; }
          .l-orbit-one { width: 360px; height: 360px; }
          .l-orbit-two { width: 280px; height: 280px; }
          .l-visual-card { padding: 19px; border-radius: 22px; }
          .l-range { font-size: 1.75rem; }
          .l-proof-strip { padding: 0 18px; }
          .l-proof-inner { align-items: flex-start; flex-direction: column; gap: 8px; padding: 17px 0; }
          .l-proof-main { gap: 9px; }
          .l-features { padding: 85px 18px 70px; }
          .l-bento { gap: 10px; }
          .l-feature-card, .l-feature-card--1, .l-feature-card--2, .l-feature-card--3, .l-feature-card--4, .l-feature-card--5 { grid-column: span 12; min-height: 250px; border-radius: 20px; padding: 23px; }
          .l-feature-card--1 { min-height: 310px; }
          .l-feature-meta { margin-bottom: 35px; }
          .l-mini-range { left: 23px; right: 23px; bottom: 23px; }
          .l-quote { margin-bottom: 90px; padding: 0 18px; }
          .l-pricing { padding: 0 18px 80px; }
          .l-pricing-grid { grid-template-columns: 1fr; }
          .l-price-card { min-height: 320px; border-radius: 22px; padding: 25px; }
          .l-footer { padding: 24px 18px 34px; flex-direction: column; gap: 10px; align-items: flex-start; }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .l-bar-group { animation: none; transform: rotate(-12deg); }
          .l-feature-card, .l-cta { transition: none; }
        }
      `}</style>
    </main>
  );
}
