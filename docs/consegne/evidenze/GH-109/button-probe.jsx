import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../../../../src/index.css';
import '../../../../src/shared/tokens/tokens.css';
import '../../../../src/apps/staff/styles/gh15-staff.css';
import Home from '../../../../src/apps/customer/pages/Home';
import CustomerNav from '../../../../src/shared/ui/CustomerNav';
import { UnsavedChangesProvider } from '../../../../src/shared/navigation/UnsavedChangesProvider';

// Real Home/layout; the browser proof replaces data hooks, never the components.
createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={['/u/home']}>
  <UnsavedChangesProvider><CustomerNav><Home /></CustomerNav></UnsavedChangesProvider>
</MemoryRouter>);
