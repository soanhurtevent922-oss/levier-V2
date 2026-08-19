# Levier — Guide de mise en route

Même méthode que Bouche à Oreille et Fidèle — si tu l'as déjà fait, ça ira vite.

Version actuelle : **sans Stripe**, pour un premier déploiement simple et propre. L'abonnement (300€ à vie / 50€ mois) sera ajouté dans une prochaine étape, une fois que tout le reste tourne bien. En attendant, l'accès est libre pour n'importe qui crée un compte.

## 1. Crée ton projet Supabase

1. Va sur https://supabase.com, connecte-toi.
2. "New project", donne-lui un nom (ex. "levier"), choisis un mot de passe pour la base.
3. Une fois créé : **SQL Editor** → **New query** → colle le contenu de `supabase-schema.sql` → **Run**.
4. **Project Settings → API** : note ta **Project URL** et ta clé (publiable / anon).

## 2. Configure tes variables d'environnement

1. Renomme `.env.local.example` en `.env.local`.
2. Colle-y ta Project URL et ta clé (les deux premières lignes suffisent pour démarrer — le reste est optionnel, voir plus bas).

## 3. Mets le code en ligne (GitHub + Vercel)

1. Nouveau repository sur GitHub, "uploading an existing file" → glisse **tous** les fichiers et dossiers (sauf `.env.local`).
2. Sur Vercel : "Add New Project" → importe ce repo.
3. Ajoute tes 2 variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Déploie.

## 4. Teste

1. Ouvre ton adresse Vercel.
2. Crée un compte, configure ton profil (métier, expérience, zone).
3. Tu arrives sur **Vue d'ensemble**, avec une navigation à 4 onglets en haut :
   - **Vue d'ensemble** — résumé rapide (fourchette, dernier salaire, dépenses, reste à vivre)
   - **Finances** — renseigne tes dépenses fixes (loyer, transport...) et ton historique de salaire
   - **Script** — ta fourchette de référence + génère ton script de négociation
   - **Entraînement** — pratique face à un recruteur IA (nécessite l'étape optionnelle 6 ci-dessous)

## Important à savoir

Les fourchettes de salaire affichées sont des **repères indicatifs**, pas des données de marché en temps réel scrapées automatiquement — elles viennent d'une table de référence intégrée au code (`lib/benchmarks.js`). C'est honnête et utile comme point de départ, mais il faut le dire clairement aux utilisateurs et les inciter à croiser avec Glassdoor/LinkedIn/Silkhom pour leur métier précis. Tu peux affiner ces chiffres toi-même en éditant ce fichier. Le tableau de bord affiche aussi des liens directs vers Glassdoor et LinkedIn Salary pour ça.

## Étapes optionnelles (le site fonctionne déjà sans elles)

### 5. Active les rappels automatiques par email

1. Crée un compte gratuit sur https://resend.com (100 emails/jour gratuits).
2. Récupère ta clé API (Developers → API Keys) → `RESEND_API_KEY`.
3. Pour commencer sans configurer de domaine, utilise l'adresse d'envoi de test fournie par Resend (`onboarding@resend.dev`) comme `REMINDER_FROM_EMAIL`.
4. Invente un mot de passe long pour `CRON_SECRET`.
5. Ajoute `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REMINDER_FROM_EMAIL`, `CRON_SECRET` et `NEXT_PUBLIC_SITE_URL` dans Vercel, redéploie.
6. Le fichier `vercel.json` déclenche automatiquement la vérification chaque jour à 8h.

### 6. Active l'entraînement avec l'IA recruteur

1. Crée un compte sur https://console.anthropic.com (facturation à l'usage, pas d'abonnement fixe).
2. Génère une clé API (Settings → API Keys) → `ANTHROPIC_API_KEY`.
3. Ajoute-la dans Vercel, redéploie.

**Point financier à connaître** : contrairement à Supabase/Vercel/Resend (paliers gratuits confortables), chaque message échangé dans le mode entraînement a un **coût réel à l'usage**, facturé par Anthropic — à surveiller sur ton dashboard Anthropic une fois que tu as de vrais utilisateurs.

## Prochaines étapes (pas encore codées)

- Abonnement Stripe (300€ à vie / 50€ mois) — on le rajoutera une fois que tout le reste sera vérifié
- Graphique visuel de l'évolution du salaire dans le temps
- Nom de domaine personnalisé
