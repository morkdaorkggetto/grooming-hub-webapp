import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_PROJECT_REF = 'qttpinkslhenxrsbhhhg';
const MARKER = '[DEMO GH-06]';
const FIXTURE_PHONE = '+393339906001';
const FIXTURE_VISIT_ID = 'gh-06-rls-luca-visit';
const OWN_STORAGE_FILE = 'gh-06-rls-own.png';
const FOREIGN_STORAGE_FILE = 'gh-06-rls-foreign.png';
const FOREIGN_TENANT_FILE = 'gh-06-rls-foreign-tenant.png';
const FOREIGN_TENANT_ID = '00000000-0000-4000-8000-000000000606';

const ACCOUNTS = {
  mario: { email: 'mario.rossi@test.example', passwordEnv: 'GH_RLS_MARIO_PASSWORD' },
  luca: { email: 'luca.bianchi@test.example', passwordEnv: 'GH_RLS_LUCA_PASSWORD' },
  staff: { email: 'staff.sonda@test.example', passwordEnv: 'GH_RLS_STAFF_PASSWORD' },
};

const results = [];
let fatalError = null;
let staff = null;
let mario = null;
let luca = null;
let tenantId = null;
let marioCustomer = null;
let lucaCustomer = null;
let marioPet = null;
let fixturePet = null;
let fixtureVisit = null;
let originalOwnerNotes = null;
let originalInternalNotes = null;
const storagePaths = new Set();

function loadLocalEnv() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(scriptDir, '../../.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function makeClient() {
  return createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoError(error, label) {
  if (error) throw new Error(`${label}: ${error.code || error.statusCode || ''} ${error.message}`.trim());
}

function forbiddenStorageError(error) {
  return Boolean(
    error &&
      (String(error.statusCode) === '403' ||
        /row-level security|unauthorized|not authorized|403/i.test(error.message || ''))
  );
}

function addResult(status, test, expected, measured) {
  results.push({ status, test, expected, measured });
}

async function runTest(test, expected, callback) {
  try {
    const measured = await callback();
    addResult('PASS', test, expected, measured);
  } catch (error) {
    addResult('FAIL', test, expected, error.message);
  }
}

async function login(label, account) {
  const client = makeClient();
  const password = process.env[account.passwordEnv];
  assert(password, `${account.passwordEnv} e obbligatoria`);
  const { data, error } = await client.auth.signInWithPassword({
    email: account.email,
    password,
  });
  assertNoError(error, `Login ${label}`);
  assert(data.user?.id, `Login ${label}: user id assente`);
  addResult('PASS', `Login ${label}`, 'sessione API disponibile', `user ${data.user.id}`);
  return { client, user: data.user };
}

async function removeStoragePath(client, objectPath) {
  if (!objectPath) return;
  const { error } = await client.storage.from('pet-avatars').remove([objectPath]);
  if (error && !/not found/i.test(error.message || '')) throw error;
}

async function cleanupStaleFixtures() {
  const { data: markedPets, error: petReadError } = await staff.client
    .from('pets')
    .select('id, tenant_id')
    .ilike('name', `${MARKER}%`);
  assertNoError(petReadError, 'Lettura fixture pregresse');

  for (const pet of markedPets || []) {
    await removeStoragePath(
      staff.client,
      `${pet.tenant_id}/${pet.id}/${FOREIGN_STORAGE_FILE}`
    );
  }

  const { error: visitDeleteError } = await staff.client
    .from('visits')
    .delete()
    .ilike('treatments', `${MARKER}%`);
  assertNoError(visitDeleteError, 'Pulizia visite pregresse');

  const { error: petDeleteError } = await staff.client
    .from('pets')
    .delete()
    .ilike('name', `${MARKER}%`);
  assertNoError(petDeleteError, 'Pulizia pet pregressi');

  const { data: markedCustomers, error: customerReadError } = await staff.client
    .from('customers')
    .select('id')
    .eq('phone', FIXTURE_PHONE);
  assertNoError(customerReadError, 'Lettura customer marker pregressi');

  for (const customer of markedCustomers || []) {
    const { error: linkedPetDeleteError } = await staff.client
      .from('pets')
      .delete()
      .eq('customer_id', customer.id);
    assertNoError(linkedPetDeleteError, 'Pulizia pet customer marker');
    const { error: customerDeleteError } = await staff.client
      .from('customers')
      .delete()
      .eq('id', customer.id);
    assertNoError(customerDeleteError, 'Pulizia customer marker');
  }
}

async function loadContext() {
  const { data: membership, error: membershipError } = await staff.client
    .from('tenant_memberships')
    .select('tenant_id, role')
    .eq('user_id', staff.user.id)
    .eq('role', 'staff')
    .single();
  assertNoError(membershipError, 'Membership sonda');
  tenantId = membership.tenant_id;

  const { data: customers, error: customerError } = await staff.client
    .from('customers')
    .select('id, user_id, tenant_id')
    .eq('tenant_id', tenantId)
    .in('user_id', [mario.user.id, luca.user.id]);
  assertNoError(customerError, 'Customer fixture');
  marioCustomer = customers.find((item) => item.user_id === mario.user.id);
  lucaCustomer = customers.find((item) => item.user_id === luca.user.id);
  assert(marioCustomer, 'Customer Mario assente');
  assert(lucaCustomer, 'Customer Luca assente');

  const { data: marioPets, error: marioPetError } = await staff.client
    .from('pets')
    .select('id, name, microchip, internal_notes, owner_notes')
    .eq('tenant_id', tenantId)
    .eq('customer_id', marioCustomer.id)
    .order('name');
  assertNoError(marioPetError, 'Pet Mario');
  assert(marioPets.length === 2, `Pet Mario attesi 2, misurati ${marioPets.length}`);
  marioPet = marioPets.find((item) => item.name === 'Luna') || marioPets[0];
  originalOwnerNotes = marioPet.owner_notes;
  originalInternalNotes = marioPet.internal_notes;
}

async function createLucaFixture() {
  const { data: pet, error: petError } = await staff.client
    .from('pets')
    .insert({
      tenant_id: tenantId,
      customer_id: lucaCustomer.id,
      owner_user_id: staff.user.id,
      name: `${MARKER} Pet Luca`,
      species: 'dog',
      breed: 'Test RLS',
      internal_notes: `${MARKER} fixture isolamento`,
    })
    .select('id, tenant_id, customer_id, name')
    .single();
  assertNoError(petError, 'Creazione pet Luca');
  fixturePet = pet;

  const { data: visit, error: visitError } = await staff.client
    .from('visits')
    .insert({
      id: FIXTURE_VISIT_ID,
      tenant_id: tenantId,
      pet_id: fixturePet.id,
      date: '2026-08-21',
      treatments: `${MARKER} visita isolamento`,
      cost: 1,
      discount_percent: 0,
    })
    .select('id, pet_id')
    .single();
  assertNoError(visitError, 'Creazione visita Luca');
  fixtureVisit = visit;
}

async function cleanupCurrentRun() {
  const cleanupErrors = [];

  if (mario?.client && marioPet?.id) {
    const { error } = await mario.client
      .from('pets')
      .update({ owner_notes: originalOwnerNotes })
      .eq('id', marioPet.id);
    if (error) cleanupErrors.push(`owner_notes: ${error.message}`);
  }

  if (staff?.client && marioPet?.id) {
    const { error } = await staff.client
      .from('pets')
      .update({ internal_notes: originalInternalNotes })
      .eq('id', marioPet.id);
    if (error) cleanupErrors.push(`internal_notes: ${error.message}`);
  }

  if (staff?.client) {
    for (const objectPath of storagePaths) {
      try {
        await removeStoragePath(staff.client, objectPath);
      } catch (error) {
        cleanupErrors.push(`storage ${objectPath}: ${error.message}`);
      }
    }

    if (fixtureVisit?.id) {
      const { error } = await staff.client.from('visits').delete().eq('id', fixtureVisit.id);
      if (error) cleanupErrors.push(`visit: ${error.message}`);
    }
    if (fixturePet?.id) {
      const { error } = await staff.client.from('pets').delete().eq('id', fixturePet.id);
      if (error) cleanupErrors.push(`pet: ${error.message}`);
    }

    const { data: markedCustomers, error: markedCustomerError } = await staff.client
      .from('customers')
      .select('id')
      .eq('phone', FIXTURE_PHONE);
    if (markedCustomerError) {
      cleanupErrors.push(`customer marker read: ${markedCustomerError.message}`);
    } else {
      for (const customer of markedCustomers || []) {
        const { error: petError } = await staff.client
          .from('pets')
          .delete()
          .eq('customer_id', customer.id);
        if (petError) cleanupErrors.push(`customer marker pets: ${petError.message}`);
        const { error: customerError } = await staff.client
          .from('customers')
          .delete()
          .eq('id', customer.id);
        if (customerError) cleanupErrors.push(`customer marker: ${customerError.message}`);
      }
    }
  }

  if (cleanupErrors.length) {
    addResult('FAIL', 'Pulizia fixture', '0 residui marker', cleanupErrors.join('; '));
    return;
  }

  if (!staff?.client || !tenantId) return;
  const [{ data: pets }, { data: visits }, { data: customers }] = await Promise.all([
    staff.client.from('pets').select('id').ilike('name', `${MARKER}%`),
    staff.client.from('visits').select('id').ilike('treatments', `${MARKER}%`),
    staff.client.from('customers').select('id').eq('phone', FIXTURE_PHONE),
  ]);
  const measured = `${pets?.length || 0} pet, ${visits?.length || 0} visite, ${customers?.length || 0} customer`;
  addResult(
    pets?.length === 0 && visits?.length === 0 && customers?.length === 0 ? 'PASS' : 'FAIL',
    'Pulizia fixture',
    '0 residui marker',
    measured
  );
}

async function main() {
  loadLocalEnv();
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  assert(url && anonKey, 'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sono obbligatori');
  assert(
    new URL(url).hostname.startsWith(`${EXPECTED_PROJECT_REF}.`),
    `Guard ambiente: atteso demo ${EXPECTED_PROJECT_REF}, ricevuto ${new URL(url).hostname}`
  );

  staff = await login('sonda staff', ACCOUNTS.staff);
  mario = await login('Mario', ACCOUNTS.mario);
  luca = await login('Luca', ACCOUNTS.luca);
  await cleanupStaleFixtures();
  await loadContext();

  await runTest('Staff legge baseline pet', '7 pet nel tenant demo', async () => {
    const { data, error } = await staff.client
      .from('pets')
      .select('id')
      .eq('tenant_id', tenantId);
    assertNoError(error, 'Lettura pet staff');
    assert(data.length === 7, `Attesi 7 pet, misurati ${data.length}`);
    return `${data.length} pet`;
  });

  await createLucaFixture();

  await runTest(
    'Isolamento Mario -> Luca',
    '0 customer, 0 pet e 0 visite di Luca',
    async () => {
      const [customerResult, petResult, visitResult] = await Promise.all([
        mario.client.from('customers').select('id').eq('id', lucaCustomer.id),
        mario.client.from('pets').select('id').eq('id', fixturePet.id),
        mario.client.from('visits').select('id').eq('id', fixtureVisit.id),
      ]);
      assertNoError(customerResult.error, 'Customer Luca da Mario');
      assertNoError(petResult.error, 'Pet Luca da Mario');
      assertNoError(visitResult.error, 'Visita Luca da Mario');
      assert(customerResult.data.length === 0, 'Mario vede il customer di Luca');
      assert(petResult.data.length === 0, 'Mario vede il pet di Luca');
      assert(visitResult.data.length === 0, 'Mario vede la visita di Luca');
      return '0 customer, 0 pet, 0 visite';
    }
  );

  await runTest(
    'Isolamento Luca -> Mario',
    '0 customer, 0 pet e 0 visite di Mario',
    async () => {
      const { data: marioPets, error: marioPetsError } = await staff.client
        .from('pets')
        .select('id')
        .eq('customer_id', marioCustomer.id);
      assertNoError(marioPetsError, 'Pet Mario via staff');
      const marioPetIds = marioPets.map((item) => item.id);
      const [customerResult, petResult, visitResult] = await Promise.all([
        luca.client.from('customers').select('id').eq('id', marioCustomer.id),
        luca.client.from('pets').select('id').in('id', marioPetIds),
        luca.client.from('visits').select('id').in('pet_id', marioPetIds),
      ]);
      assertNoError(customerResult.error, 'Customer Mario da Luca');
      assertNoError(petResult.error, 'Pet Mario da Luca');
      assertNoError(visitResult.error, 'Visite Mario da Luca');
      assert(customerResult.data.length === 0, 'Luca vede il customer di Mario');
      assert(petResult.data.length === 0, 'Luca vede pet di Mario');
      assert(visitResult.data.length === 0, 'Luca vede visite di Mario');
      return '0 customer, 0 pet, 0 visite';
    }
  );

  await runTest(
    'Customer non vede la sonda',
    '0 membership e 0 profili staff',
    async () => {
      const [membershipResult, profileResult] = await Promise.all([
        mario.client
          .from('tenant_memberships')
          .select('tenant_id, user_id, role')
          .eq('user_id', staff.user.id),
        mario.client.from('profiles').select('id').eq('id', staff.user.id),
      ]);
      assertNoError(membershipResult.error, 'Membership sonda da Mario');
      assertNoError(profileResult.error, 'Profilo sonda da Mario');
      assert(membershipResult.data.length === 0, 'Mario vede la membership della sonda');
      assert(profileResult.data.length === 0, 'Mario vede il profilo della sonda');
      return '0 membership, 0 profili';
    }
  );

  await runTest('Customer non chiama RPC staff', 'SQLSTATE 42501 e 0 scritture', async () => {
    const { error } = await mario.client.rpc('add_customer_with_pet', {
      p_tenant_id: tenantId,
      p_customer_first_name: `${MARKER} RPC`,
      p_customer_phone: FIXTURE_PHONE,
      p_pet_name: `${MARKER} RPC Pet`,
    });
    assert(error, 'RPC staff accettata da Mario');
    assert(error.code === '42501', `Atteso 42501, ricevuto ${error.code || error.message}`);
    const { data: customers, error: readError } = await staff.client
      .from('customers')
      .select('id')
      .eq('phone', FIXTURE_PHONE);
    assertNoError(readError, 'Verifica scritture RPC');
    assert(customers.length === 0, `Customer creati dalla RPC negata: ${customers.length}`);
    return '42501, 0 customer';
  });

  for (const [column, attemptedValue] of [
    ['microchip', `${MARKER} MICROCHIP`],
    ['name', `${MARKER} NAME`],
    ['internal_notes', `${MARKER} INTERNAL`],
  ]) {
    await runTest(
      `Whitelist customer protegge ${column}`,
      'valore invariato',
      async () => {
        const before = marioPet[column];
        const { data, error } = await mario.client
          .from('pets')
          .update({ [column]: attemptedValue })
          .eq('id', marioPet.id)
          .select(column)
          .single();
        assertNoError(error, `UPDATE ${column}`);
        assert(data[column] === before, `${column} modificato: ${String(data[column])}`);
        return `invariato (${String(before)})`;
      }
    );
  }

  await runTest('Whitelist customer consente owner_notes', 'marker scritto e ripristinabile', async () => {
    const { data, error } = await mario.client
      .from('pets')
      .update({ owner_notes: `${MARKER} OWNER NOTES` })
      .eq('id', marioPet.id)
      .select('owner_notes')
      .single();
    assertNoError(error, 'UPDATE owner_notes');
    assert(data.owner_notes === `${MARKER} OWNER NOTES`, 'owner_notes non aggiornato');
    return 'marker scritto';
  });

  await runTest('Storage customer sul pet proprio', 'upload e delete riusciti', async () => {
    const objectPath = `${tenantId}/${marioPet.id}/${OWN_STORAGE_FILE}`;
    storagePaths.add(objectPath);
    const payload = new TextEncoder().encode(`${MARKER} own storage`);
    const { error: uploadError } = await mario.client.storage
      .from('pet-avatars')
      .upload(objectPath, payload, { contentType: 'image/png', upsert: false });
    assertNoError(uploadError, 'Upload pet proprio');
    const { error: removeError } = await mario.client.storage
      .from('pet-avatars')
      .remove([objectPath]);
    assertNoError(removeError, 'Delete pet proprio');
    storagePaths.delete(objectPath);
    return 'upload 200, delete riuscita';
  });

  await runTest('Storage customer sul pet altrui', 'HTTP 403', async () => {
    const objectPath = `${tenantId}/${fixturePet.id}/${FOREIGN_STORAGE_FILE}`;
    storagePaths.add(objectPath);
    const { error } = await mario.client.storage
      .from('pet-avatars')
      .upload(objectPath, new TextEncoder().encode(`${MARKER} foreign pet`), {
        contentType: 'image/png',
        upsert: false,
      });
    assert(forbiddenStorageError(error), `Atteso 403, ricevuto ${error?.statusCode || error?.message || 'successo'}`);
    return `HTTP ${error.statusCode || 403}`;
  });

  await runTest('Storage customer su tenant estraneo', 'HTTP 403', async () => {
    const objectPath = `${FOREIGN_TENANT_ID}/${marioPet.id}/${FOREIGN_TENANT_FILE}`;
    storagePaths.add(objectPath);
    const { error } = await mario.client.storage
      .from('pet-avatars')
      .upload(objectPath, new TextEncoder().encode(`${MARKER} foreign tenant`), {
        contentType: 'image/png',
        upsert: false,
      });
    assert(forbiddenStorageError(error), `Atteso 403, ricevuto ${error?.statusCode || error?.message || 'successo'}`);
    return `HTTP ${error.statusCode || 403}`;
  });

  await runTest('Staff aggiorna campo staff-only', 'internal_notes modificato', async () => {
    const { data, error } = await staff.client
      .from('pets')
      .update({ internal_notes: `${MARKER} STAFF UPDATE` })
      .eq('id', marioPet.id)
      .select('internal_notes')
      .single();
    assertNoError(error, 'UPDATE staff internal_notes');
    assert(data.internal_notes === `${MARKER} STAFF UPDATE`, 'UPDATE staff ripristinato inaspettatamente');
    return 'marker scritto';
  });

  addResult(
    'SKIP',
    'Staff fuori tenant',
    '0 righe da un secondo tenant reale',
    'demo con un solo tenant; fixture cross-tenant non disponibile'
  );
}

try {
  await main();
} catch (error) {
  fatalError = error;
  addResult('FAIL', 'Bootstrap suite', 'fixture e account disponibili', error.message);
} finally {
  try {
    await cleanupCurrentRun();
  } catch (error) {
    addResult('FAIL', 'Pulizia fixture', '0 residui marker', error.message);
  }
  if (staff?.client) {
    await staff.client.auth.signOut({ scope: 'global' }).catch(() => {});
  }
}

console.log('\nGH-06 - Suite RLS demo');
console.log(`Progetto: ${EXPECTED_PROJECT_REF}`);
console.log('');
for (const result of results) {
  console.log(`[${result.status}] ${result.test}`);
  console.log(`  atteso:   ${result.expected}`);
  console.log(`  misurato: ${result.measured}`);
}

const passed = results.filter((item) => item.status === 'PASS').length;
const failed = results.filter((item) => item.status === 'FAIL').length;
const skipped = results.filter((item) => item.status === 'SKIP').length;
console.log(`\nTotale: ${passed} PASS, ${failed} FAIL, ${skipped} SKIP`);
if (fatalError || failed > 0) process.exitCode = 1;
