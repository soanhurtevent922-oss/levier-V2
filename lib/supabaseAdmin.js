import { createClient } from '@supabase/supabase-js';

// Sert uniquement dans la tâche planifiée des rappels, jamais côté navigateur.
// Créé à la demande (pas au chargement du fichier) pour ne pas faire planter
// le build si SUPABASE_SERVICE_ROLE_KEY n'est pas encore configurée (fonctionnalité optionnelle).
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
