import React from 'react';
import StaffApp from './apps/staff/StaffApp';

/**
 * App.jsx — Top-level shell.
 *
 * Step 1 della roadmap fast-track (refactor monorepo-ready): oggi questa
 * shell monta direttamente l'app staff esistente, preservando il routing
 * interno di StaffApp (BrowserRouter + rotte staff e customer-portal).
 *
 * Step 2: introdurrà l'instradamento top-level /staff vs /u (customer app)
 * con due app distinte sotto src/apps/. Riferimento:
 * design_handoff_customer_app/01-architettura.md §Routing.
 */
export default function App() {
  return <StaffApp />;
}
