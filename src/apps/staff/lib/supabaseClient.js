import { createClient } from '@supabase/supabase-js';

/**
 * Configurazione client Supabase
 * Legge le credenziali dalle variabili d'ambiente (Vite)
 *
 * Le variabili devono essere definite in:
 * - .env (produzione)
 * - .env.local (sviluppo locale)
 *
 * Formato:
 * VITE_SUPABASE_URL=https://project-id.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key-here
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validazione: le credenziali devono essere presenti
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Variabili d\'ambiente Supabase non configurate. ' +
    'Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env'
  );
}

/**
 * Client Supabase singleton
 * Fornisce accesso a:
 * - auth: autenticazione utente
 * - from(): query ai database
 * - storage: gestione file (per futuri sviluppi)
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper: ottieni l'utente corrente dalla sessione
 * Ritorna { id, email } oppure null se non loggato
 */
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

/**
 * Helper: monitora i cambiamenti di stato autenticazione
 * Utile per aggiornare il componente App quando login/logout
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
};

/**
 * Helper: effettua logout
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Errore logout: ${error.message}`);
  }
};
