/**
 * Back-compat shim — il client Supabase canonico è ora in
 * src/shared/supabase/client.js. Questo file re-esporta tutto per non
 * rompere i ~9 import esistenti sotto apps/staff/.
 *
 * Da rimuovere al Gate 5 quando il refactor di apps/staff/lib/database.js
 * e dei suoi consumer riguarderà anche questi import.
 */
export {
  supabase,
  getCurrentUser,
  onAuthStateChange,
  logout,
} from '../../../shared/supabase/client';
