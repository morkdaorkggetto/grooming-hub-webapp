import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/auth/AuthProvider';
import { TenantProvider } from './shared/tenant/TenantProvider';
import StaffApp from './apps/staff/StaffApp';
import CustomerApp from './apps/customer/CustomerApp';

/**
 * App.jsx — Top-level shell con routing.
 *
 * Step 2 della roadmap fast-track. Il BrowserRouter vive qui: StaffApp e
 * CustomerApp espongono solo <Routes> interni.
 *
 * Routing scelto in modalità "catch-all":
 *   /      → redirect a /u/login (per consegnare la preview al salone su un
 *            URL che atterra sul customer; StaffApp è broken sul demo finché
 *            Gate 5 non gira)
 *   /u/*   → CustomerApp  (login customer + dashboard + redeem)
 *   /*     → StaffApp     (tutte le rotte staff preservate ai path originali:
 *                          /dashboard, /login, /portal, /calendar, ecc.)
 *
 * Decisione: non si è scelto il prefix /staff/* perché richiederebbe
 * riscrittura di tutte le <Route> interne di StaffApp + dei Link/Navigate;
 * fuori scope di Step 2 (refactor strutturale, non funzionale).
 *
 * AuthProvider e TenantProvider sono cross-app: anche staff usa Supabase auth,
 * anche se Step 2 non lo collega ancora — staff continua a usare il proprio
 * AuthContext interno; lo si unificherà al Gate 5 (refactor database.js).
 */

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/u/login" replace />} />
            <Route path="/u/*" element={<CustomerApp />} />
            <Route path="/*" element={<StaffApp />} />
          </Routes>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
