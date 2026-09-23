import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_REF = 'qttpinkslhenxrsbhhhg';
const MARKER = '[DEMO GH-98]';
const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const output = path.join(root, 'docs/consegne/evidenze/GH-98/live-demo.json');
const started = Date.now();

function loadEnv() {
  for (const rawLine of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoError(error, label) {
  if (error) throw new Error(`${label}: ${error.code || ''} ${error.message}`.trim());
}

function localDate(date) {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
}

function pastDate(days, hour) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  value.setHours(hour, 0, 0, 0);
  return value;
}

loadEnv();
assert(new URL(process.env.VITE_SUPABASE_URL).hostname.startsWith(EXPECTED_REF), 'Ref Supabase inatteso');
assert(process.env.GH_RLS_STAFF_PASSWORD, 'Variabile GH_RLS_STAFF_PASSWORD assente');

const staff = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});
const petIds = [];
const appointmentIds = [];
const visitIds = [];
const results = {
  projectRef: EXPECTED_REF,
  marker: MARKER,
  baseline: {},
  checks: {},
  cleanup: {},
};

async function countRows(table, tenantId) {
  const result = await staff.from(table).select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId);
  assertNoError(result.error, `Conteggio ${table}`);
  return result.count;
}

try {
  const auth = await staff.auth.signInWithPassword({
    email: process.env.GH_RLS_STAFF_EMAIL || 'staff.sonda@test.example',
    password: process.env.GH_RLS_STAFF_PASSWORD,
  });
  assertNoError(auth.error, 'Login staff demo');

  const membership = await staff.from('tenant_memberships')
    .select('tenant_id')
    .in('role', ['owner', 'staff'])
    .limit(1)
    .single();
  assertNoError(membership.error, 'Tenant staff');
  const tenantId = membership.data.tenant_id;

  const customer = await staff.from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .order('created_at')
    .limit(1)
    .single();
  assertNoError(customer.error, 'Customer fixture');

  const markerPets = await staff.from('pets')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .ilike('name', `${MARKER}%`);
  assertNoError(markerPets.error, 'Baseline marker pet');
  assert(markerPets.count === 0, `Pet marker preesistenti: ${markerPets.count}`);

  results.baseline = {
    tenantId,
    pets: await countRows('pets', tenantId),
    appointments: await countRows('appointments', tenantId),
    visits: await countRows('visits', tenantId),
  };

  const petRows = [
    { id: crypto.randomUUID(), name: `${MARKER} Con visita` },
    { id: crypto.randomUUID(), name: `${MARKER} Senza visita` },
    { id: crypto.randomUUID(), name: `${MARKER} Solo pet` },
  ].map((pet) => ({
    ...pet,
    tenant_id: tenantId,
    customer_id: customer.data.id,
    owner_user_id: auth.data.user.id,
    species: 'dog',
  }));
  const insertedPets = await staff.from('pets').insert(petRows).select('id, name');
  assertNoError(insertedPets.error, 'Creazione pet fixture');
  petIds.push(...insertedPets.data.map(({ id }) => id));

  const withVisitAt = pastDate(3, 10);
  const withoutVisitAt = pastDate(4, 11);
  const appointmentRows = [
    { id: crypto.randomUUID(), pet_id: petRows[0].id, scheduled_at: withVisitAt.toISOString(), notes: `${MARKER} con visita` },
    { id: crypto.randomUUID(), pet_id: petRows[1].id, scheduled_at: withoutVisitAt.toISOString(), notes: `${MARKER} senza visita` },
  ].map((appointment) => ({
    ...appointment,
    user_id: auth.data.user.id,
    tenant_id: tenantId,
    duration_minutes: 60,
    status: 'scheduled',
    approval_status: 'approved',
    appointment_source: 'operator',
  }));
  const insertedAppointments = await staff.from('appointments').insert(appointmentRows).select('id');
  assertNoError(insertedAppointments.error, 'Creazione appuntamenti fixture');
  appointmentIds.push(...insertedAppointments.data.map(({ id }) => id));

  const visitId = crypto.randomUUID();
  const insertedVisit = await staff.from('visits').insert({
    id: visitId,
    pet_id: petRows[0].id,
    tenant_id: tenantId,
    date: localDate(withVisitAt),
    treatments: `${MARKER} visita nello stesso giorno`,
    cost: 1,
    discount_percent: 0,
  }).select('id').single();
  assertNoError(insertedVisit.error, 'Creazione visita fixture');
  visitIds.push(insertedVisit.data.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [ghostCount, ghostRows, visitRows, unfinishedPet, unfinishedAppointments] = await Promise.all([
    staff.from('appointments').select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId).eq('status', 'scheduled').lt('scheduled_at', todayStart.toISOString()),
    staff.from('appointments').select('id, pet_id, scheduled_at, status, notes, pet:pets(name)')
      .eq('tenant_id', tenantId).eq('status', 'scheduled').lt('scheduled_at', todayStart.toISOString()),
    staff.from('visits').select('id, pet_id, date').eq('tenant_id', tenantId),
    staff.from('pets').select('id, name').eq('id', petRows[2].id).single(),
    staff.from('appointments').select('id', { count: 'exact', head: true }).eq('pet_id', petRows[2].id),
  ]);
  assertNoError(ghostCount.error, 'Conteggio coda via API');
  assertNoError(ghostRows.error, 'Rilettura coda via API');
  assertNoError(visitRows.error, 'Rilettura visite aggregata');
  assertNoError(unfinishedPet.error, 'Rilettura pet lasciato a metà');
  assertNoError(unfinishedAppointments.error, 'Rilettura appuntamenti pet lasciato a metà');
  assert(ghostCount.count === ghostRows.data.length, `Conteggio API ${ghostCount.count}, righe ${ghostRows.data.length}`);

  const fixtureGhosts = ghostRows.data.filter(({ notes }) => notes?.startsWith(MARKER)).map((row) => {
    const scheduledDate = localDate(new Date(row.scheduled_at));
    const hasVisit = visitRows.data.some((visit) => visit.pet_id === row.pet_id && visit.date === scheduledDate);
    return { id: row.id, pet: row.pet?.name, scheduledDate, hasVisit };
  });
  assert(fixtureGhosts.length === 2, `Fantasmi fixture: ${fixtureGhosts.length}/2`);
  assert(fixtureGhosts.filter(({ hasVisit }) => hasVisit).length === 1, 'Distinzione visita/non visita inattesa');
  assert(unfinishedPet.data.id === petRows[2].id, 'Pet lasciato a metà non riletto');
  assert(unfinishedAppointments.count === 0, `Il pet lasciato a metà ha ${unfinishedAppointments.count} appuntamenti`);

  results.checks = {
    apiGhostCountWithFixtures: ghostCount.count,
    fixtureGhosts,
    visitReadsForQueue: 1,
    unfinishedPet: { ...unfinishedPet.data, appointmentCount: unfinishedAppointments.count },
  };
} finally {
  if (visitIds.length) {
    const cleanup = await staff.from('visits').delete().in('id', visitIds);
    if (cleanup.error) results.cleanup.visitError = `${cleanup.error.code || ''} ${cleanup.error.message}`.trim();
  }
  if (appointmentIds.length) {
    const cleanup = await staff.from('appointments').delete().in('id', appointmentIds);
    if (cleanup.error) results.cleanup.appointmentError = `${cleanup.error.code || ''} ${cleanup.error.message}`.trim();
  }
  if (petIds.length) {
    const cleanup = await staff.from('pets').delete().in('id', petIds);
    if (cleanup.error) results.cleanup.petError = `${cleanup.error.code || ''} ${cleanup.error.message}`.trim();
  }

  const membership = await staff.from('tenant_memberships')
    .select('tenant_id').in('role', ['owner', 'staff']).limit(1).maybeSingle();
  if (membership.data?.tenant_id) {
    const tenantId = membership.data.tenant_id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [markerPets, markerAppointments, markerVisits, finalGhosts] = await Promise.all([
      staff.from('pets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).ilike('name', `${MARKER}%`),
      staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).ilike('notes', `${MARKER}%`),
      staff.from('visits').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).ilike('treatments', `${MARKER}%`),
      staff.from('appointments').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).eq('status', 'scheduled').lt('scheduled_at', todayStart.toISOString()),
    ]);
    for (const [label, result] of Object.entries({ markerPets, markerAppointments, markerVisits, finalGhosts })) {
      if (result.error) results.cleanup[`${label}Error`] = `${result.error.code || ''} ${result.error.message}`.trim();
    }
    results.cleanup = {
      ...results.cleanup,
      markerPets: markerPets.count,
      markerAppointments: markerAppointments.count,
      markerVisits: markerVisits.count,
      finalPets: await countRows('pets', tenantId),
      finalAppointments: await countRows('appointments', tenantId),
      finalVisits: await countRows('visits', tenantId),
      finalPastScheduledCount: finalGhosts.count,
    };
  }
  await staff.auth.signOut();
  results.elapsedMs = Date.now() - started;
  fs.writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
}

assert(!Object.keys(results.cleanup).some((key) => key.endsWith('Error')), `Errori pulizia: ${JSON.stringify(results.cleanup)}`);
assert(results.cleanup.markerPets === 0 && results.cleanup.markerAppointments === 0 && results.cleanup.markerVisits === 0, 'Fixture residue');
assert(results.cleanup.finalPets === results.baseline.pets, `Pet finali ${results.cleanup.finalPets}, baseline ${results.baseline.pets}`);
assert(results.cleanup.finalAppointments === results.baseline.appointments, `Appuntamenti finali ${results.cleanup.finalAppointments}, baseline ${results.baseline.appointments}`);
assert(results.cleanup.finalVisits === results.baseline.visits, `Visite finali ${results.cleanup.finalVisits}, baseline ${results.baseline.visits}`);
console.log(JSON.stringify({ checks: results.checks, cleanup: results.cleanup, elapsedMs: results.elapsedMs }, null, 2));
