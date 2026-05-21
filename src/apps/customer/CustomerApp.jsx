import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import CustomerNav from '../../shared/ui/CustomerNav';
import Book from './pages/Book';
import Forgot from './pages/Forgot';
import Home from './pages/Home';
import Login from './pages/Login';
import Pet from './pages/Pet';
import Promotions from './pages/Promotions';
import Redeem from './pages/Redeem';

/**
 * CustomerApp — router interno di /u/*.
 *
 * Il BrowserRouter è montato a livello top in src/App.jsx, qui usiamo
 * solo <Routes>. I path sono RELATIVI a /u (vedi <Route path="/u/*"
 * element={<CustomerApp />} /> nel parent).
 *
 * Step 6.5: introdotto layout `LoggedInLayout` che monta `CustomerNav`
 * (TopNav desktop / BottomNav mobile) per le route logged-in. Le route
 * pre-auth (login, forgot, redeem) restano "nude" — niente nav globale,
 * perché l'utente non ha ancora un contesto autenticato e l'avatar con
 * iniziali non avrebbe senso.
 *
 * Layout pattern: route element {<LoggedInLayout />} + child routes con
 * <Outlet />. Pattern standard React Router v6+ per layout di gruppo.
 */

function LoggedInLayout() {
  return (
    <CustomerNav>
      <Outlet />
    </CustomerNav>
  );
}

export default function CustomerApp() {
  return (
    <Routes>
      {/* Pre-auth: nessun nav */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/redeem" element={<Redeem />} />
      <Route path="/redeem/:token" element={<Redeem />} />

      {/* Logged-in: wrappate in LoggedInLayout con CustomerNav */}
      <Route element={<LoggedInLayout />}>
        <Route path="/" element={<Navigate to="/u/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/pet/:petId" element={<Pet />} />
        <Route path="/book" element={<Book />} />
      </Route>

      <Route path="*" element={<Navigate to="/u/home" replace />} />
    </Routes>
  );
}
