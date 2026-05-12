import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Redeem from './pages/Redeem';

/**
 * CustomerApp — router interno di /u/*.
 *
 * Il BrowserRouter è montato a livello top in src/App.jsx, qui usiamo
 * solo <Routes>. I path sono RELATIVI a /u (vedi <Route path="/u/*"
 * element={<CustomerApp />} /> nel parent).
 *
 * Rotte Step 2:
 *   /          → redirect a /u/home
 *   /home      → dashboard placeholder, protetta
 *   /login     → login pubblico (email + password)
 *   /redeem/:token → placeholder accept invite
 *
 * In Step 3+: /pet/:petId, /book, /book/confirm/:id, /promotions.
 */

export default function CustomerApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/u/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/redeem" element={<Redeem />} />
      <Route path="/redeem/:token" element={<Redeem />} />
      <Route path="*" element={<Navigate to="/u/home" replace />} />
    </Routes>
  );
}
