import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../../../../src/index.css';
import '../../../../src/shared/tokens/tokens.css';
import '../../../../src/apps/staff/styles/gh15-staff.css';
import { PetCardView, PetCardHeader } from '../../../../src/apps/customer/pages/PetCard';
import { CardPortrait, VisitStamps } from '../../../../src/apps/customer/components/PetCardParts';
import { getFidelityTierSnapshot } from '../../../../src/shared/lib/fidelity';
const q = new URLSearchParams(location.search);
const settings = { fidelity_tiers: { bronze: { visits_required: 6, months_window: 12, points_required: 100 }, silver: { visits_required: 12, months_window: 24, points_required: 250 }, gold: { visits_required: 36, months_window: 36, points_required: 500 } } };
if (!q.has('mature')) settings.fidelity_projection = { history_start: '2026-03-06', tiers: ['bronze'] };
const pet = { id: 'local-synthetic', name: q.get('name') || 'Nina', breed: 'Shih Tzu', qr_token: 'ghp_gh107_probe_4', owner_photo_url: q.has('photo') ? '/icons/icon-192.png' : null, visits: Array.from({ length: +(q.get('visits') || 3) }, () => ({ date: '2026-09-01' })), rewardPointsTotal: 0 };
const snapshot = getFidelityTierSnapshot(pet, settings, new Date(q.get('date') || '2026-10-02T12:00:00Z'));
window.proof = { pet, snapshot };
if (q.has('reference')) {
  window.React = React;
  for (const file of ['shared-ui.jsx', 'gh15-ed-kit.jsx', 'cd04-card-kit.jsx', 'cd09-tessera-kit.jsx', 'cd10-tessera-kit.jsx']) await import(/* @vite-ignore */ '/docs/consegne/CD-10-consegna/' + file);
  const s = { pet: pet.name, breed: pet.breed, foto: q.has('photo'), tier: snapshot.currentTier?.key, done: 3, of: 4, win: 12, dal: true };
  createRoot(document.getElementById('root')).render(React.createElement(window.Pagina10, { s, w: innerWidth, h: Math.max(900, innerHeight), invito: true }));
} else {
  createRoot(document.getElementById('root')).render(<MemoryRouter><main className="pet-card-page"><PetCardHeader /><PetCardView pet={pet} snapshot={snapshot} />
    {q.has('strip') && <div className="pet-card-strip"><CardPortrait pet={pet} compact /><span>La tessera di Nina</span></div>}
    {q.has('tiles') && <div data-test-tiles><VisitStamps tier={{ visitsRequired: +q.get('tiles'), visitsInWindow: 3, label: 'Bronzo' }} /></div>}
  </main></MemoryRouter>);
}
