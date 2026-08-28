import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase shared — singleton riusato sia da apps/staff sia da apps/customer.
 *
 * Le credenziali sono lette dalle variabili d'ambiente Vite:
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon-public-key>
 *
 * Devono essere definite in .env (produzione) o .env.local (dev).
 *
 * Step 2 della roadmap fast-track: estratto da src/apps/staff/lib/supabaseClient.js.
 * Quel file resta come shim re-export per back-compat con i 9 punti d'uso staff
 * esistenti — sarà rimosso al Gate 5 quando il refactor di staff/lib/database.js
 * sostituirà tutti gli import.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Variabili d'ambiente Supabase non configurate. " +
      'Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Errore nel recupero utente:', error.message);
    return null;
  }

  return user;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Errore logout: ${error.message}`);
  }
};
