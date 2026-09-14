import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_REF = 'qttpinkslhenxrsbhhhg';
const MARKER = '[DEMO GH-93]';
const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const output = path.join(root, 'docs/consegne/evidenze/GH-93/live-demo.json');
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

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

loadEnv();
assert(new URL(process.env.VITE_SUPABASE_URL).hostname.startsWith(EXPECTED_REF), 'Ref Supabase inatteso');
assert(process.env.GH_RLS_STAFF_PASSWORD, 'Variabile GH_RLS_STAFF_PASSWORD assente');

const staff = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});
const appointmentIds = [];
const results = {
  projectRef: EXPECTED_REF,
  marker: MARKER,
  fixture: {},
  restore: {},
  cleanup: {},
};

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

  const [tenantResult, petsResult, baselineMarker, baselineTotal] = await Promise.all([
    staff.from('tenants').select('settings').eq('id', tenantId).single(),
    staff.from('pets').select('id, name').eq('tenant_id', tenantId).order('created_at').limit(10),
    staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).ilike('notes', `${MARKER}%`),
    staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ]);
  assertNoError(tenantResult.error, 'Impostazioni tenant');
  assertNoError(petsResult.error, 'Pet fixture');
  assertNoError(baselineMarker.error, 'Baseline marker');
  assertNoError(baselineTotal.error, 'Baseline appuntamenti');
  const capacity = Number(tenantResult.data.settings?.workstation_capacity) || 1;
  assert(petsResult.data.length >= capacity, `Servono ${capacity} pet, trovati ${petsResult.data.length}`);
  assert(baselineMarker.count === 0, `Marker preesistenti: ${baselineMarker.count}`);
  results.fixture.baselineAppointments = baselineTotal.count;

  let scheduledAt = null;
  for (let offset = 30; offset < 90 && !scheduledAt; offset += 1) {
    const candidate = addDays(new Date(), offset);
    candidate.setHours(15, 0, 0, 0);
    const end = new Date(candidate.getTime() + 60 * 60000);
    const occupied = await staff.from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .neq('status', 'cancelled')
      .lt('scheduled_at', end.toISOString())
      .gt('scheduled_at', new Date(candidate.getTime() - 8 * 60 * 60000).toISOString());
    assertNoError(occupied.error, 'Ricerca slot fixture');
    if (occupied.count === 0) scheduledAt = candidate;
  }
  assert(scheduledAt, 'Nessuno slot vuoto trovato per la fixture');

  const rows = [
    ...petsResult.data.slice(0, capacity).map((fixturePet, index) => ({
      id: crypto.randomUUID(),
      user_id: auth.data.user.id,
      pet_id: fixturePet.id,
      tenant_id: tenantId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 60,
      status: 'scheduled',
      approval_status: 'approved',
      appointment_source: 'operator',
      notes: `${MARKER} attivo ${index + 1}`,
    })),
    {
      id: crypto.randomUUID(),
      user_id: auth.data.user.id,
      pet_id: petsResult.data[0].id,
      tenant_id: tenantId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 60,
      status: 'cancelled',
      approval_status: 'approved',
      appointment_source: 'operator',
      notes: `${MARKER} annullato gemello`,
    },
  ];

  for (const row of rows) {
    const inserted = await staff.from('appointments').insert(row).select('id, pet_id, scheduled_at, status').single();
    assertNoError(inserted.error, `Inserimento ${row.notes}`);
    appointmentIds.push(inserted.data.id);
  }

  const cancelledId = rows.at(-1).id;
  const before = await staff.from('appointments')
    .select('id, pet_id, scheduled_at, duration_minutes, status, notes')
    .in('id', appointmentIds)
    .order('notes');
  assertNoError(before.error, 'Rilettura fixture');
  assert(before.data.length === capacity + 1, `Fixture incomplete: ${before.data.length}/${capacity + 1}`);
  assert(before.data.filter((row) => row.status === 'scheduled').length === capacity, `Capienza fixture non pari a ${capacity}`);
  assert(before.data.filter((row) => row.pet_id === petsResult.data[0].id).length === 2, 'Gemello stesso pet assente');

  const restore = await staff.rpc('set_staff_appointment_status', {
    p_appointment_id: cancelledId,
    p_status: 'scheduled',
  });
  assert(restore.error, 'L’appuntamento eccedente è stato ripristinato contro il vincolo');
  assert(
    restore.error.details === 'GH37_APPOINTMENT_CAPACITY'
      || /postazioni sono tutte occupate/i.test(restore.error.message || ''),
    `Rifiuto inatteso: ${restore.error.code || ''} ${restore.error.message || ''}`.trim(),
  );

  const after = await staff.from('appointments').select('status').eq('id', cancelledId).single();
  assertNoError(after.error, 'Stato dopo rifiuto');
  assert(after.data.status === 'cancelled', `Atomicità violata: ${after.data.status}`);
  results.fixture = {
    tenantId,
    capacity,
    scheduledAt: scheduledAt.toISOString(),
    rows: before.data.length,
    activeRows: before.data.filter((row) => row.status === 'scheduled').length,
    samePetRows: before.data.filter((row) => row.pet_id === petsResult.data[0].id).length,
    baselineAppointments: results.fixture.baselineAppointments,
  };
  results.restore = {
    code: restore.error.code,
    details: restore.error.details,
    message: restore.error.message,
    finalStatus: after.data.status,
  };
} finally {
  for (const appointmentId of [...appointmentIds].reverse()) {
    const deletion = await staff.rpc('delete_staff_appointment', { p_appointment_id: appointmentId });
    if (deletion.error) {
      results.cleanup.errors ||= [];
      results.cleanup.errors.push(`${appointmentId}: ${deletion.error.code || ''} ${deletion.error.message}`.trim());
    }
  }
  const membership = await staff.from('tenant_memberships')
    .select('tenant_id')
    .in('role', ['owner', 'staff'])
    .limit(1)
    .maybeSingle();
  if (membership.data?.tenant_id) {
    const [remaining, total] = await Promise.all([
      staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', membership.data.tenant_id).ilike('notes', `${MARKER}%`),
      staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', membership.data.tenant_id),
    ]);
    results.cleanup.markerRows = remaining.count;
    results.cleanup.finalAppointments = total.count;
  }
  await staff.auth.signOut();
  results.elapsedMs = Date.now() - started;
  fs.writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
}

assert(!results.cleanup.errors?.length, `Errori pulizia: ${results.cleanup.errors?.join('; ')}`);
assert(results.cleanup.markerRows === 0, `Fixture residue: ${results.cleanup.markerRows}`);
assert(results.cleanup.finalAppointments === results.fixture.baselineAppointments, `Conteggio finale ${results.cleanup.finalAppointments}, baseline ${results.fixture.baselineAppointments}`);
console.log(JSON.stringify({ fixture: results.fixture, restore: results.restore, cleanup: results.cleanup, elapsedMs: results.elapsedMs }, null, 2));
