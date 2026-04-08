import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChange } from './lib/supabaseClient';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './pages/Dashboard';
import ClientDetail from './pages/ClientDetail';
import AddClient from './pages/AddClient';
import AddVisit from './pages/AddVisit';
import Calendar from './pages/Calendar';
import ResetPassword from './pages/ResetPassword';
import ClientCard from './pages/ClientCard';
import PublicPetCard from './pages/PublicPetCard';
import WeeklyRevenue from './pages/WeeklyRevenue';
import DailyAppointments from './pages/DailyAppointments';
import { DEMO_MODE } from './lib/demoMode';

/**
 * ProtectedRoute — Componente wrapper per route protette
 * Mostra la route se autenticato, altrimenti reindirizza a /login
 */
function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  return children;
}

/**
 * App — Componente principale
 * Gestisce routing e protezione autenticazione
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Monitora i cambiamenti di stato autenticazione
   * Chiamato una sola volta al mount
   */
  useEffect(() => {
    // Iscriviti ai cambiamenti di autenticazione
    const { data: subscription } = onAuthStateChange((event, currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Log per debug
      if (currentUser) {
        console.log('✅ Utente autenticato:', currentUser.email);
      } else {
        console.log('❌ Utente non autenticato');
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  // Loading state iniziale
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-main)' }}
      >
        <div className="text-center">
          <div
            className="animate-spin h-16 w-16 rounded-full border-4 border-solid mx-auto mb-4"
            style={{
              borderColor: 'var(--color-primary)',
              borderTopColor: 'transparent',
            }}
          ></div>
          <p style={{ color: 'var(--color-secondary)' }} className="text-lg font-medium">
            Caricamento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={DEMO_MODE ? 'demo-theme' : ''}>
        <Routes>
          {/* Route pubblica: Login */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginForm
                  onSuccess={() => {
                    // Callback dopo login riuscito
                    // L'app si aggiornerà automaticamente tramite onAuthStateChange
                  }}
                />
              )
            }
          />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/client-card/:qrToken" element={<PublicPetCard />} />


          {/* Route protette */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/:clientId"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <ClientDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-client"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <AddClient />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/:clientId/add-visit"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <AddVisit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <Calendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/today"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <DailyAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/weekly"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <WeeklyRevenue />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client-card/internal/:qrToken"
            element={
              <ProtectedRoute isAuthenticated={!!user}>
                <ClientCard />
              </ProtectedRoute>
            }
          />

          {/* Route fallback */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-bg-main)' }}
              >
                <div className="text-center">
                  <h1
                    style={{ color: 'var(--color-text-primary)' }}
                    className="text-4xl font-bold mb-4"
                  >
                    404
                  </h1>
                  <p style={{ color: 'var(--color-secondary)' }} className="mb-6">
                    Pagina non trovata
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block px-6 py-3 rounded-lg font-bold text-white transition"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Torna alla home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
