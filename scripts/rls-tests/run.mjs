import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_PROJECT_REF = process.env.GH_RLS_EXPECTED_PROJECT_REF || 'qttpinkslhenxrsbhhhg';
const EXPECTED_BASELINE_PETS = Number(process.env.GH_RLS_EXPECTED_PET_COUNT || '7');
const SUITE_LABEL = process.env.GH_RLS_SUITE_LABEL || 'GH-06 - Suite RLS demo';
const MARKER = process.env.GH_RLS_MARKER || '[DEMO GH-06]';
const APPOINTMENT_REQUEST_MARKER = process.env.GH_RLS_APPOINTMENT_MARKER || '[DEMO GH-08]';
const GH49_MARKER = '[DEMO GH-49]';
const GH50_MARKER = '[DEMO GH-50]';
const FIXTURE_PHONE = process.env.GH_RLS_FIXTURE_PHONE || '+393339906001';
const GH44_PHONE = '+393339904400';
const FIXTURE_VISIT_ID = process.env.GH_RLS_FIXTURE_VISIT_ID || 'gh-06-rls-luca-visit';
const OWN_STORAGE_FILE = process.env.GH_RLS_OWN_STORAGE_FILE || 'gh-06-rls-own.png';
const FOREIGN_STORAGE_FILE = process.env.GH_RLS_FOREIGN_STORAGE_FILE || 'gh-06-rls-foreign.png';
const FOREIGN_TENANT_FILE = process.env.GH_RLS_FOREIGN_TENANT_FILE || 'gh-06-rls-foreign-tenant.png';
const GH45_CLIENT_PHOTO_FILE = 'gh-45-client-photo.png';
const GH45_PET_AVATAR_FILE = 'gh-45-pet-avatar.png';
const FOREIGN_TENANT_ID = '00000000-0000-4000-8000-000000000606';

const ACCOUNTS = {
  mario: {
    email: process.env.GH_RLS_MARIO_EMAIL || 'mario.rossi@test.example',
    passwordEnv: 'GH_RLS_MARIO_PASSWORD',
  },
  luca: {
    email: process.env.GH_RLS_LUCA_EMAIL || 'luca.bianchi@test.example',
    passwordEnv: 'GH_RLS_LUCA_PASSWORD',
  },
  staff: {
    email: process.env.GH_RLS_STAFF_EMAIL || 'staff.sonda@test.example',
    passwordEnv: 'GH_RLS_STAFF_PASSWORD',
  },
  gh44: {
    email: 'customer.gh44@test.example',
    password: 'demo-gh44-customer-2026',
  },
  foreignStaff: {
    email: 'staff.gh49.foreign@test.example',
    password: 'demo-gh49-foreign-staff-2026',
  },
};

const results = [];
let fatalError = null;
let staff = null;
let mario = null;
let luca = null;
let gh44 = null;
let foreignStaff = null;
let tenantId = null;
let marioCustomer = null;
let lucaCustomer = null;
let marioPet = null;
let fixturePet = null;
let fixtureVisit = null;
let originalOwnerNotes = null;
let originalCoatPreferences = null;
let originalPhotoUrl = null;
let originalOwnerPhotoUrl = null;
let originalPetStaffNotes = null;
let originalCustomerStaffNotes = null;
const storagePaths = new Set();
const gh45StoragePaths = new Set();
const appointmentRequestIds = new Set();
const appointmentIds = new Set();
const gh44PetIds = new Set();
const gh44InvitationIds = new Set();
const gh44RequestIds = new Set();
const gh49PromotionIds = new Set();
let gh44CustomerId = null;
let gh44VisitId = null;

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

function relation(value) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function forbiddenStorageError(error) {
  return Boolean(
    error &&
      (String(error.statusCode) === '403' ||
        /row-level security|unauthorized|not authorized|403/i.test(error.message || ''))
  );
}

function forbiddenRlsError(error) {
  return Boolean(
    error &&
      (error.code === '42501' ||
        /row-level security|permission denied|not authorized|42501/i.test(error.message || ''))
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
  const password = account.password || process.env[account.passwordEnv];
  assert(password, `${account.passwordEnv || 'password fixture'} e obbligatoria`);
  const { data, error } = await client.auth.signInWithPassword({
    email: account.email,
    password,
  });
  assertNoError(error, `Login ${label}`);
  assert(data.user?.id, `Login ${label}: user id assente`);
  addResult('PASS', `Login ${label}`, 'sessione API disponibile', `user ${data.user.id}`);
  return { client, user: data.user };
}

async function removeStoragePath(client, objectPath, bucket = 'pet-avatars') {
  if (!objectPath) return;
  const { error } = await client.storage.from(bucket).remove([objectPath]);
  if (error && !/not found/i.test(error.message || '')) throw error;
}

function trackGh45Storage(bucket, objectPath) {
  gh45StoragePaths.add(`${bucket}\n${objectPath}`);
}

async function cleanupStaleFixtures() {
  const [petNoteCleanup, customerNoteCleanup] = await Promise.all([
    staff.client.from('pet_staff_notes').delete().ilike('notes', `${MARKER}%`),
    staff.client.from('customer_staff_notes').delete().ilike('notes', `${MARKER}%`),
  ]);
  assertNoError(petNoteCleanup.error, 'Pulizia note pet pregresse');
  assertNoError(customerNoteCleanup.error, 'Pulizia note customer pregresse');

  const { error: promotionCleanupError } = await staff.client
    .from('promotions')
    .delete()
    .ilike('title', `${GH49_MARKER}%`);
  assertNoError(promotionCleanupError, 'Pulizia promozioni GH-49 pregresse');

  const { data: staleRequests, error: staleRequestReadError } = await staff.client
    .from('appointment_requests')
    .select('id, appointment_id')
    .ilike('coat_condition_notes', `${APPOINTMENT_REQUEST_MARKER}%`);
  assertNoError(staleRequestReadError, 'Lettura richieste appuntamento pregresse');

  const staleRequestIds = (staleRequests || []).map((item) => item.id);
  const staleAppointmentIds = (staleRequests || []).map((item) => item.appointment_id).filter(Boolean);
  if (staleRequestIds.length) {
    const { error } = await staff.client.from('appointment_requests').delete().in('id', staleRequestIds);
    assertNoError(error, 'Pulizia richieste appuntamento pregresse');
  }
  if (staleAppointmentIds.length) {
    const { error } = await staff.client.from('appointments').delete().in('id', staleAppointmentIds);
    assertNoError(error, 'Pulizia appuntamenti GH-08 pregressi');
  }

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
    .in('phone', [FIXTURE_PHONE, GH44_PHONE]);
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
    .select('id, user_id, tenant_id, first_name, last_name, email, phone, staff_notes:customer_staff_notes(notes)')
    .eq('tenant_id', tenantId)
    .in('user_id', [mario.user.id, luca.user.id]);
  assertNoError(customerError, 'Customer fixture');
  marioCustomer = customers.find((item) => item.user_id === mario.user.id);
  lucaCustomer = customers.find((item) => item.user_id === luca.user.id);
  assert(marioCustomer, 'Customer Mario assente');
  assert(lucaCustomer, 'Customer Luca assente');

  const { data: marioPets, error: marioPetError } = await staff.client
    .from('pets')
    .select('id, name, microchip, owner_notes, coat_preferences, photo_url, owner_photo_url, staff_notes:pet_staff_notes(notes)')
    .eq('tenant_id', tenantId)
    .eq('customer_id', marioCustomer.id)
    .order('name');
  assertNoError(marioPetError, 'Pet Mario');
  assert(marioPets.length === 2, `Pet Mario attesi 2, misurati ${marioPets.length}`);
  marioPet = marioPets.find((item) => item.name === 'Luna') || marioPets[0];
  originalOwnerNotes = marioPet.owner_notes;
  originalCoatPreferences = marioPet.coat_preferences;
  originalPhotoUrl = marioPet.photo_url;
  originalOwnerPhotoUrl = marioPet.owner_photo_url;
  originalPetStaffNotes = relation(marioPet.staff_notes)?.notes || null;
  originalCustomerStaffNotes = relation(marioCustomer.staff_notes)?.notes || null;
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
    })
    .select('id, tenant_id, customer_id, name')
    .single();
  assertNoError(petError, 'Creazione pet Luca');
  fixturePet = pet;

  const { error: noteError } = await staff.client.from('pet_staff_notes').insert({
    pet_id: fixturePet.id,
    notes: `${MARKER} fixture isolamento`,
  });
  assertNoError(noteError, 'Creazione note staff pet Luca');

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

async function createGh44Fixture() {
  const { data: created, error: createError } = await staff.client.rpc('add_customer_with_pet', {
    p_tenant_id: tenantId,
    p_customer_first_name: '[DEMO GH-44] Ada',
    p_customer_last_name: 'Scollegamento',
    p_customer_email: ACCOUNTS.gh44.email,
    p_customer_phone: GH44_PHONE,
    p_pet_name: '[DEMO GH-44] Primo',
    p_pet_species: 'dog',
    p_pet_breed: 'Fixture unlink',
    p_pet_birth_date: '2022-01-01',
  });
  assertNoError(createError, 'Creazione customer GH-44');
  const createdRow = Array.isArray(created) ? created[0] : created;
  assert(createdRow?.customer_id && createdRow?.pet_id, 'ID fixture GH-44 assenti');
  gh44CustomerId = createdRow.customer_id;
  gh44PetIds.add(createdRow.pet_id);

  const { data: extraPets, error: extraPetsError } = await staff.client
    .from('pets')
    .insert([2, 3, 4].map((index) => ({
      tenant_id: tenantId,
      customer_id: gh44CustomerId,
      owner_user_id: staff.user.id,
      name: `[DEMO GH-44] Pet ${index}`,
      species: 'dog',
      breed: 'Fixture limite richieste',
      birth_date: '2022-01-01',
    })))
    .select('id, name');
  assertNoError(extraPetsError, 'Creazione pet aggiuntivi GH-44');
  extraPets.forEach(({ id }) => gh44PetIds.add(id));

  const { data: visit, error: visitError } = await staff.client
    .from('visits')
    .insert({
      id: 'gh-44-unlink-visit',
      tenant_id: tenantId,
      pet_id: createdRow.pet_id,
      date: '2026-08-30',
      treatments: '[DEMO GH-44] visita preservazione',
      cost: 1,
      discount_percent: 0,
    })
    .select('id')
    .single();
  assertNoError(visitError, 'Creazione visita GH-44');
  gh44VisitId = visit.id;

  const invitationId = `inv_gh44_initial_${crypto.randomUUID().replaceAll('-', '')}`;
  const invitationToken = `gh44-initial-${crypto.randomUUID()}`;
  const { error: invitationError } = await staff.client
    .from('customer_invitations')
    .insert({
      id: invitationId,
      token: invitationToken,
      operator_user_id: staff.user.id,
      pet_id: createdRow.pet_id,
      tenant_id: tenantId,
      phone: GH44_PHONE,
      first_name: '[DEMO GH-44] Ada',
      last_name: 'Scollegamento',
      customer_email: ACCOUNTS.gh44.email,
    });
  assertNoError(invitationError, 'Invito iniziale GH-44');
  gh44InvitationIds.add(invitationId);

  const { data: accepted, error: acceptError } = await gh44.client.rpc(
    'accept_customer_invite',
    { p_token: invitationToken }
  );
  assertNoError(acceptError, 'Riscatto iniziale GH-44');
  assert(accepted.customerId === gh44CustomerId, 'Riscatto iniziale su customer inatteso');
}

async function cleanupCurrentRun() {
  const cleanupErrors = [];

  if (staff?.client) {
    if (gh49PromotionIds.size) {
      const { error } = await staff.client
        .from('promotions')
        .delete()
        .in('id', [...gh49PromotionIds]);
      if (error) cleanupErrors.push(`promozioni GH-49: ${error.message}`);
    }
    if (appointmentIds.size) {
      const { error } = await staff.client
        .from('appointments')
        .delete()
        .in('id', [...appointmentIds]);
      if (error) cleanupErrors.push(`appointments GH-08: ${error.message}`);
    }
    if (appointmentRequestIds.size) {
      const { error } = await staff.client
        .from('appointment_requests')
        .delete()
        .in('id', [...appointmentRequestIds]);
      if (error) cleanupErrors.push(`appointment requests: ${error.message}`);
    }
    if (gh44InvitationIds.size) {
      const { error } = await staff.client
        .from('customer_invitations')
        .delete()
        .in('id', [...gh44InvitationIds]);
      if (error) cleanupErrors.push(`inviti GH-44: ${error.message}`);
    }
  }

  if (staff?.client && marioPet?.id) {
    const { error } = await staff.client
      .from('pets')
      .update({
        owner_notes: originalOwnerNotes,
        coat_preferences: originalCoatPreferences,
        photo_url: originalPhotoUrl,
        owner_photo_url: originalOwnerPhotoUrl,
      })
      .eq('id', marioPet.id);
    if (error) cleanupErrors.push(`ripristino pet GH-49: ${error.message}`);
  }

  if (staff?.client && marioPet?.id) {
    const noteQuery = originalPetStaffNotes
      ? staff.client.from('pet_staff_notes').upsert({ pet_id: marioPet.id, notes: originalPetStaffNotes })
      : staff.client.from('pet_staff_notes').delete().eq('pet_id', marioPet.id);
    const { error } = await noteQuery;
    if (error) cleanupErrors.push(`pet_staff_notes: ${error.message}`);
  }

  if (staff?.client && marioCustomer?.id) {
    const noteQuery = originalCustomerStaffNotes
      ? staff.client.from('customer_staff_notes').upsert({ customer_id: marioCustomer.id, notes: originalCustomerStaffNotes })
      : staff.client.from('customer_staff_notes').delete().eq('customer_id', marioCustomer.id);
    const { error } = await noteQuery;
    if (error) cleanupErrors.push(`customer_staff_notes: ${error.message}`);
  }

  if (staff?.client) {
    if (gh44CustomerId) {
      const { error } = await staff.client.rpc('unlink_customer_account', {
        p_customer_id: gh44CustomerId,
      });
      if (error) cleanupErrors.push(`unlink finale GH-44: ${error.message}`);
    }
    for (const objectPath of storagePaths) {
      try {
        await removeStoragePath(staff.client, objectPath);
      } catch (error) {
        cleanupErrors.push(`storage ${objectPath}: ${error.message}`);
      }
    }
    for (const trackedPath of gh45StoragePaths) {
      const [bucket, objectPath] = trackedPath.split('\n');
      try {
        await removeStoragePath(staff.client, objectPath, bucket);
      } catch (error) {
        cleanupErrors.push(`storage GH-45 ${bucket}/${objectPath}: ${error.message}`);
      }
    }

    if (fixtureVisit?.id) {
      const { error } = await staff.client.from('visits').delete().eq('id', fixtureVisit.id);
      if (error) cleanupErrors.push(`visit: ${error.message}`);
    }
    if (gh44VisitId) {
      const { error } = await staff.client.from('visits').delete().eq('id', gh44VisitId);
      if (error) cleanupErrors.push(`visita GH-44: ${error.message}`);
    }
    if (fixturePet?.id) {
      const { error } = await staff.client.from('pets').delete().eq('id', fixturePet.id);
      if (error) cleanupErrors.push(`pet: ${error.message}`);
    }
    if (gh44PetIds.size) {
      const { error } = await staff.client.from('pets').delete().in('id', [...gh44PetIds]);
      if (error) cleanupErrors.push(`pet GH-44: ${error.message}`);
    }

    const { data: markedCustomers, error: markedCustomerError } = await staff.client
      .from('customers')
      .select('id')
      .in('phone', [FIXTURE_PHONE, GH44_PHONE]);
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
  const [
    { data: pets },
    { data: visits },
    { data: customers },
    { data: requests },
    { data: petNotes },
    { data: customerNotes },
    { data: promotions },
  ] = await Promise.all([
    staff.client.from('pets').select('id').ilike('name', `${MARKER}%`),
    staff.client.from('visits').select('id').ilike('treatments', `${MARKER}%`),
    staff.client.from('customers').select('id').in('phone', [FIXTURE_PHONE, GH44_PHONE]),
    staff.client.from('appointment_requests').select('id').ilike('coat_condition_notes', `${APPOINTMENT_REQUEST_MARKER}%`),
    staff.client.from('pet_staff_notes').select('pet_id').ilike('notes', `${MARKER}%`),
    staff.client.from('customer_staff_notes').select('customer_id').ilike('notes', `${MARKER}%`),
    staff.client.from('promotions').select('id').ilike('title', `${GH49_MARKER}%`),
  ]);
  const measured = `${pets?.length || 0} pet, ${visits?.length || 0} visite, ${customers?.length || 0} customer, ${requests?.length || 0} richieste, ${petNotes?.length || 0} note pet, ${customerNotes?.length || 0} note customer, ${promotions?.length || 0} promozioni`;
  addResult(
    pets?.length === 0 && visits?.length === 0 && customers?.length === 0 && requests?.length === 0 && petNotes?.length === 0 && customerNotes?.length === 0 && promotions?.length === 0 ? 'PASS' : 'FAIL',
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
  gh44 = await login('sonda customer GH-44', ACCOUNTS.gh44);
  foreignStaff = await login('staff tenant estraneo GH-49', ACCOUNTS.foreignStaff);
  await cleanupStaleFixtures();
  await loadContext();

  await runTest('Staff legge baseline pet', `${EXPECTED_BASELINE_PETS} pet nel tenant`, async () => {
    const { data, error } = await staff.client
      .from('pets')
      .select('id')
      .eq('tenant_id', tenantId);
    assertNoError(error, 'Lettura pet staff');
    assert(
      data.length === EXPECTED_BASELINE_PETS,
      `Attesi ${EXPECTED_BASELINE_PETS} pet, misurati ${data.length}`
    );
    return `${data.length} pet`;
  });

  await runTest(
    'Promozioni staff crea, modifica, disattiva e riordina GH-49',
    '3 promozioni nel tenant con ordine 10/20/30 e una sola visibile ora',
    async () => {
      const now = Date.now();
      const { data: created, error: createError } = await staff.client
        .from('promotions')
        .insert([
          {
            tenant_id: tenantId,
            title: `${GH49_MARKER} Attiva iniziale`,
            body: `${GH49_MARKER} stesse parole nel gestionale e nell area cliente`,
            valid_from: new Date(now - 60 * 60 * 1000).toISOString(),
            valid_to: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
            display_order: 30,
            is_active: true,
          },
          {
            tenant_id: tenantId,
            title: `${GH49_MARKER} Da disattivare`,
            body: `${GH49_MARKER} non deve apparire`,
            display_order: 20,
            is_active: true,
          },
          {
            tenant_id: tenantId,
            title: `${GH49_MARKER} Futura`,
            body: `${GH49_MARKER} fuori finestra`,
            valid_from: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
            valid_to: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
            display_order: 10,
            is_active: true,
          },
        ])
        .select('id, title');
      assertNoError(createError, 'Creazione promozioni GH-49');
      created.forEach(({ id }) => gh49PromotionIds.add(id));

      const active = created.find(({ title }) => title.includes('Attiva iniziale'));
      const disabled = created.find(({ title }) => title.includes('Da disattivare'));
      const future = created.find(({ title }) => title.includes('Futura'));
      assert(active && disabled && future, 'Fixture promozioni incomplete');

      const [activeUpdate, disableUpdate] = await Promise.all([
        staff.client
          .from('promotions')
          .update({ title: `${GH49_MARKER} Attiva modificata` })
          .eq('id', active.id),
        staff.client
          .from('promotions')
          .update({ is_active: false })
          .eq('id', disabled.id),
      ]);
      assertNoError(activeUpdate.error, 'Modifica promozione GH-49');
      assertNoError(disableUpdate.error, 'Disattivazione promozione GH-49');

      const { error: reorderError } = await staff.client.rpc('reorder_promotions', {
        p_ids: [active.id, future.id, disabled.id],
      });
      assertNoError(reorderError, 'Riordino promozioni GH-49');

      const { data: measured, error: readError } = await staff.client
        .from('promotions')
        .select('id, title, is_active, display_order')
        .in('id', [active.id, future.id, disabled.id])
        .order('display_order');
      assertNoError(readError, 'Rilettura promozioni GH-49');
      assert(measured.map(({ display_order }) => display_order).join(',') === '10,20,30', 'Ordine inatteso');
      assert(measured[0].title.endsWith('Attiva modificata'), 'Modifica titolo non persistita');
      assert(measured[2].is_active === false, 'Disattivazione non persistita');
      return '3 create, 1 modifica, 1 disattivazione, ordine 10/20/30';
    }
  );

  await runTest(
    'Promozioni customer rispettano stato e finestra GH-49',
    'solo la promozione attiva e in finestra e visibile',
    async () => {
      const { data, error } = await mario.client
        .from('promotions')
        .select('id, title, is_active, valid_from, valid_to')
        .ilike('title', `${GH49_MARKER}%`);
      assertNoError(error, 'Lettura promozioni customer GH-49');
      assert(data.length === 1, `Promozioni visibili attese 1, misurate ${data.length}`);
      assert(data[0].title === `${GH49_MARKER} Attiva modificata`, `Titolo visibile inatteso: ${data[0].title}`);
      return `1 visibile: ${data[0].title}`;
    }
  );

  await runTest(
    'Staff fuori tenant non vede ne modifica promozioni GH-49',
    '0 righe visibili, 0 righe modificate e riordino rifiutato',
    async () => {
      const ids = [...gh49PromotionIds];
      const visible = await foreignStaff.client
        .from('promotions')
        .select('id')
        .in('id', ids);
      assertNoError(visible.error, 'Lettura promozioni da staff estraneo');
      assert(visible.data.length === 0, `Staff estraneo vede ${visible.data.length} promozioni`);

      const update = await foreignStaff.client
        .from('promotions')
        .update({ title: `${GH49_MARKER} VIOLAZIONE` })
        .eq('id', ids[0])
        .select('id');
      assertNoError(update.error, 'UPDATE filtrato da staff estraneo');
      assert(update.data.length === 0, `Staff estraneo modifica ${update.data.length} righe`);

      const reorder = await foreignStaff.client.rpc('reorder_promotions', { p_ids: ids });
      assert(forbiddenRlsError(reorder.error), `Riordino estraneo non rifiutato: ${reorder.error?.message || 'successo'}`);
      return '0 lette, 0 modificate, RPC 42501';
    }
  );

  await runTest(
    'Portale customer legge il proprio nucleo',
    '1 customer e 2 pet di Mario',
    async () => {
      const [customerResult, petResult] = await Promise.all([
        mario.client
          .from('customers')
          .select('id, first_name, last_name, phone')
          .eq('id', marioCustomer.id),
        mario.client
          .from('pets')
          .select('id, customer_id, name')
          .eq('customer_id', marioCustomer.id),
      ]);
      assertNoError(customerResult.error, 'Customer proprio dal portale');
      assertNoError(petResult.error, 'Pet propri dal portale');
      assert(customerResult.data.length === 1, `Customer propri: ${customerResult.data.length}`);
      assert(petResult.data.length === 2, `Pet propri: ${petResult.data.length}`);
      return '1 customer, 2 pet';
    }
  );

  await runTest('Staff legge e scrive note riservate', 'marker presenti in entrambe le tabelle', async () => {
    const [petWrite, customerWrite] = await Promise.all([
      staff.client
        .from('pet_staff_notes')
        .upsert({ pet_id: marioPet.id, notes: `${MARKER} STAFF PET` })
        .select('notes')
        .single(),
      staff.client
        .from('customer_staff_notes')
        .upsert({ customer_id: marioCustomer.id, notes: `${MARKER} STAFF CUSTOMER` })
        .select('notes')
        .single(),
    ]);
    assertNoError(petWrite.error, 'Scrittura note pet staff');
    assertNoError(customerWrite.error, 'Scrittura note customer staff');
    assert(petWrite.data.notes === `${MARKER} STAFF PET`, 'Nota pet staff non riletta');
    assert(customerWrite.data.notes === `${MARKER} STAFF CUSTOMER`, 'Nota customer staff non riletta');
    return '2 marker scritti e riletti';
  });

  await runTest('Customer non legge note riservate', '0 note pet e 0 note customer', async () => {
    const [petResult, customerResult] = await Promise.all([
      mario.client.from('pet_staff_notes').select('pet_id, notes').eq('pet_id', marioPet.id),
      mario.client
        .from('customer_staff_notes')
        .select('customer_id, notes')
        .eq('customer_id', marioCustomer.id),
    ]);
    assertNoError(petResult.error, 'Lettura note pet da customer');
    assertNoError(customerResult.error, 'Lettura note customer da customer');
    assert(petResult.data.length === 0, `Mario vede ${petResult.data.length} note pet`);
    assert(customerResult.data.length === 0, `Mario vede ${customerResult.data.length} note customer`);
    return '0 note pet, 0 note customer';
  });

  await runTest('Portale customer non incorpora note riservate', '2 pet con relazioni note vuote', async () => {
    const { data, error } = await mario.client
      .from('pets')
      .select(`
        id,
        staff_notes:pet_staff_notes(notes),
        customer:customers(id, staff_notes:customer_staff_notes(notes))
      `)
      .eq('customer_id', marioCustomer.id);
    assertNoError(error, 'Query portale con relazioni note');
    assert(data.length === 2, `Pet portale attesi 2, misurati ${data.length}`);
    for (const pet of data) {
      assert(!relation(pet.staff_notes), `Nota pet incorporata per ${pet.id}`);
      assert(!relation(relation(pet.customer)?.staff_notes), `Nota customer incorporata per ${pet.id}`);
    }
    return '2 pet, 0 relazioni note';
  });

  await runTest('Customer non scrive note riservate', 'due rifiuti RLS', async () => {
    const [petResult, customerResult] = await Promise.all([
      mario.client
        .from('pet_staff_notes')
        .upsert({ pet_id: marioPet.id, notes: `${MARKER} CUSTOMER PET` }),
      mario.client
        .from('customer_staff_notes')
        .upsert({ customer_id: marioCustomer.id, notes: `${MARKER} CUSTOMER CUSTOMER` }),
    ]);
    assert(forbiddenRlsError(petResult.error), `Scrittura note pet non rifiutata: ${petResult.error?.message || 'successo'}`);
    assert(forbiddenRlsError(customerResult.error), `Scrittura note customer non rifiutata: ${customerResult.error?.message || 'successo'}`);
    return '2 rifiuti 42501/RLS';
  });

  await runTest('Colonne note legacy rimosse', 'operator_notes e internal_notes assenti', async () => {
    const [customerResult, petResult] = await Promise.all([
      mario.client.from('customers').select('id, operator_notes').eq('id', marioCustomer.id),
      mario.client.from('pets').select('id, internal_notes').eq('id', marioPet.id),
    ]);
    assert(customerResult.error?.code === '42703', `customers.operator_notes ancora interrogabile: ${customerResult.error?.code || 'successo'}`);
    assert(petResult.error?.code === '42703', `pets.internal_notes ancora interrogabile: ${petResult.error?.code || 'successo'}`);
    return '2 errori 42703';
  });

  await createLucaFixture();

  const gh45ClientPhotoPath = `${staff.user.id}/${GH45_CLIENT_PHOTO_FILE}`;
  const gh45PetAvatarPath = `${tenantId}/${fixturePet.id}/${GH45_PET_AVATAR_FILE}`;

  await runTest(
    'Storage staff e lettura pubblica GH-45',
    'staff crea e sostituisce in entrambi i bucket; URL pubblici leggibili senza sessione',
    async () => {
      trackGh45Storage('client-photos', gh45ClientPhotoPath);
      trackGh45Storage('pet-avatars', gh45PetAvatarPath);

      for (const [bucket, objectPath] of [
        ['client-photos', gh45ClientPhotoPath],
        ['pet-avatars', gh45PetAvatarPath],
      ]) {
        const initial = new TextEncoder().encode(`[DEMO GH-45] ${bucket} iniziale`);
        const replacement = new TextEncoder().encode(`[DEMO GH-45] ${bucket} sostituito`);
        const { error: uploadError } = await staff.client.storage
          .from(bucket)
          .upload(objectPath, initial, { contentType: 'image/png', upsert: false });
        assertNoError(uploadError, `Upload staff ${bucket}`);
        const { error: updateError } = await staff.client.storage
          .from(bucket)
          .update(objectPath, replacement, { contentType: 'image/png' });
        assertNoError(updateError, `Update staff ${bucket}`);

        const publicUrl = staff.client.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
        const response = await fetch(`${publicUrl}?gh45=${Date.now()}`);
        assert(response.ok, `Lettura pubblica ${bucket}: HTTP ${response.status}`);
      }

      return '2 upload, 2 update, 2 letture pubbliche HTTP 200';
    }
  );

  await runTest(
    'Storage utente senza legami GH-45',
    'nessuna scrittura o cancellazione in client-photos e pet-avatars',
    async () => {
      const { data: memberships, error: membershipError } = await staff.client
        .from('tenant_memberships')
        .select('tenant_id')
        .eq('user_id', gh44.user.id);
      assertNoError(membershipError, 'Membership sonda senza legami');
      assert(memberships.length === 0, `Sonda senza legami ha ${memberships.length} membership`);

      const clientUpload = await gh44.client.storage
        .from('client-photos')
        .upload(`${gh44.user.id}/gh-45-unlinked.png`, new TextEncoder().encode('denied'), {
          contentType: 'image/png',
          upsert: false,
        });
      assert(forbiddenStorageError(clientUpload.error), 'Sonda senza legami ha scritto client-photos');

      const avatarUpload = await gh44.client.storage
        .from('pet-avatars')
        .upload(gh45PetAvatarPath, new TextEncoder().encode('denied'), {
          contentType: 'image/png',
          upsert: true,
        });
      assert(forbiddenStorageError(avatarUpload.error), 'Sonda senza legami ha scritto pet-avatars');

      const clientUpdate = await gh44.client.storage
        .from('client-photos')
        .update(gh45ClientPhotoPath, new TextEncoder().encode('denied'), { contentType: 'image/png' });
      assert(forbiddenStorageError(clientUpdate.error), 'Sonda senza legami ha sostituito client-photos');

      const avatarUpdate = await gh44.client.storage
        .from('pet-avatars')
        .update(gh45PetAvatarPath, new TextEncoder().encode('denied'), { contentType: 'image/png' });
      assert(forbiddenStorageError(avatarUpdate.error), 'Sonda senza legami ha sostituito pet-avatars');

      await gh44.client.storage.from('client-photos').remove([gh45ClientPhotoPath]);
      await gh44.client.storage.from('pet-avatars').remove([gh45PetAvatarPath]);

      for (const [bucket, objectPath] of [
        ['client-photos', gh45ClientPhotoPath],
        ['pet-avatars', gh45PetAvatarPath],
      ]) {
        const publicUrl = staff.client.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
        const response = await fetch(`${publicUrl}?gh45-unlinked=${Date.now()}`);
        assert(response.ok, `Sonda senza legami ha cancellato ${bucket}`);
      }

      return '4 scritture rifiutate; 2 delete senza effetto; oggetti ancora pubblici';
    }
  );

  await runTest(
    'Storage customer non proprietario GH-45',
    'Mario non sostituisce o cancella oggetti staff in nessuno dei due bucket',
    async () => {
      const clientUpdate = await mario.client.storage
        .from('client-photos')
        .update(gh45ClientPhotoPath, new TextEncoder().encode('denied'), { contentType: 'image/png' });
      assert(forbiddenStorageError(clientUpdate.error), 'Mario ha sostituito client-photos');

      const avatarUpdate = await mario.client.storage
        .from('pet-avatars')
        .update(gh45PetAvatarPath, new TextEncoder().encode('denied'), { contentType: 'image/png' });
      assert(forbiddenStorageError(avatarUpdate.error), 'Mario ha sostituito pet-avatars altrui');

      await mario.client.storage.from('client-photos').remove([gh45ClientPhotoPath]);
      await mario.client.storage.from('pet-avatars').remove([gh45PetAvatarPath]);

      for (const [bucket, objectPath] of [
        ['client-photos', gh45ClientPhotoPath],
        ['pet-avatars', gh45PetAvatarPath],
      ]) {
        const publicUrl = staff.client.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
        const response = await fetch(`${publicUrl}?gh45-customer=${Date.now()}`);
        assert(response.ok, `Mario ha cancellato ${bucket}`);
      }

      return '2 update rifiutati; 2 delete senza effetto; oggetti invariati';
    }
  );

  await runTest(
    'Invito con durata tenant GH-45',
    'expires_at memorizzato a 3 giorni anche se il chiamante propone 30 giorni',
    async () => {
      const invitationId = `inv_gh45_duration_${crypto.randomUUID().replaceAll('-', '')}`;
      const { data, error } = await staff.client
        .from('customer_invitations')
        .insert({
          id: invitationId,
          token: `gh45-duration-${crypto.randomUUID()}`,
          operator_user_id: staff.user.id,
          pet_id: fixturePet.id,
          tenant_id: tenantId,
          phone: '+393260004501',
          first_name: '[DEMO GH-45] Durata',
          last_name: 'Tre giorni',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id, created_at, expires_at')
        .single();
      assertNoError(error, 'Creazione invito durata GH-45');
      gh44InvitationIds.add(invitationId);

      const durationSeconds = (Date.parse(data.expires_at) - Date.parse(data.created_at)) / 1000;
      assert(
        durationSeconds >= 259199 && durationSeconds <= 259201,
        `Durata invito inattesa: ${durationSeconds} secondi`
      );
      return `${durationSeconds} secondi (3 giorni)`;
    }
  );

  await runTest(
    'Inviti scaduto e gia usato GH-45',
    'GH_INVITE_EXPIRED e GH_INVITE_ALREADY_USED restano distinti',
    async () => {
      const expiredId = `inv_gh45_expired_${crypto.randomUUID().replaceAll('-', '')}`;
      const usedId = `inv_gh45_used_${crypto.randomUUID().replaceAll('-', '')}`;
      const expiredToken = `gh45-expired-${crypto.randomUUID()}`;
      const usedToken = `gh45-used-${crypto.randomUUID()}`;
      const common = {
        operator_user_id: staff.user.id,
        pet_id: fixturePet.id,
        tenant_id: tenantId,
        first_name: '[DEMO GH-45] Stato',
        last_name: 'Invito',
      };

      const { error: insertError } = await staff.client.from('customer_invitations').insert([
        { ...common, id: expiredId, token: expiredToken, phone: '+393260004502' },
        {
          ...common,
          id: usedId,
          token: usedToken,
          phone: '+393260004503',
          accepted_at: new Date().toISOString(),
          accepted_by: mario.user.id,
        },
      ]);
      assertNoError(insertError, 'Creazione inviti stato GH-45');
      gh44InvitationIds.add(expiredId);
      gh44InvitationIds.add(usedId);

      const { error: expireError } = await staff.client
        .from('customer_invitations')
        .update({ expires_at: new Date(Date.now() - 60 * 1000).toISOString() })
        .eq('id', expiredId);
      assertNoError(expireError, 'Scadenza fixture GH-45');

      const [expiredResult, usedResult] = await Promise.all([
        gh44.client.rpc('accept_customer_invite', { p_token: expiredToken }),
        gh44.client.rpc('accept_customer_invite', { p_token: usedToken }),
      ]);
      assert(
        expiredResult.error?.message?.includes('GH_INVITE_EXPIRED'),
        `Errore scaduto inatteso: ${expiredResult.error?.message || 'successo'}`
      );
      assert(
        usedResult.error?.message?.includes('GH_INVITE_ALREADY_USED'),
        `Errore usato inatteso: ${usedResult.error?.message || 'successo'}`
      );
      return 'GH_INVITE_EXPIRED / GH_INVITE_ALREADY_USED';
    }
  );

  await runTest(
    'Fixture customer GH-44 collegata',
    'customer usa-e-getta, 4 pet, 1 visita e membership customer',
    async () => {
      await createGh44Fixture();
      const { data: pets, error: petsError } = await gh44.client
        .from('pets')
        .select('id')
        .eq('customer_id', gh44CustomerId);
      assertNoError(petsError, 'Visibilita fixture GH-44');
      assert(pets.length === 4, `Pet fixture attesi 4, misurati ${pets.length}`);
      return 'customer collegato, 4 pet e 1 visita';
    }
  );

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

  await runTest(
    'Customer non legge campi direttorio altrui',
    '0 customer altrui con status o source',
    async () => {
      const { data, error } = await mario.client
        .from('customers')
        .select('id, relationship_status, acquisition_source')
        .neq('id', marioCustomer.id);
      assertNoError(error, 'Campi direttorio altrui da Mario');
      assert(data.length === 0, `Mario vede ${data.length} customer altrui`);
      return '0 customer altrui';
    }
  );

  await runTest(
    'Customer non modifica campi direttorio propri',
    'relationship_status e acquisition_source invariati',
    async () => {
      const { data: before, error: beforeError } = await mario.client
        .from('customers')
        .select('relationship_status, acquisition_source')
        .eq('id', marioCustomer.id)
        .single();
      assertNoError(beforeError, 'Lettura direttorio proprio');
      const { data: after, error: updateError } = await mario.client
        .from('customers')
        .update({ relationship_status: 'archived', acquisition_source: 'qr' })
        .eq('id', marioCustomer.id)
        .select('relationship_status, acquisition_source')
        .single();
      assertNoError(updateError, 'UPDATE direttorio proprio');
      assert(
        after.relationship_status === before.relationship_status &&
          after.acquisition_source === before.acquisition_source,
        'Campi direttorio modificati dal customer'
      );
      return `invariati (${before.relationship_status}, ${before.acquisition_source || 'null'})`;
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

  let appointmentRequest = null;
  const desiredDate = new Date();
  desiredDate.setDate(desiredDate.getDate() + 3);
  const desiredDateValue = desiredDate.toISOString().slice(0, 10);

  await runTest('Mario invia richiesta appuntamento', 'richiesta pending sul proprio pet', async () => {
    const { data: service, error: serviceError } = await mario.client
      .from('services')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('display_order')
      .limit(1)
      .single();
    assertNoError(serviceError, 'Servizio booking');
    const { data, error } = await mario.client.rpc('submit_appointment_request', {
      p_tenant_id: tenantId,
      p_pet_id: marioPet.id,
      p_service_id: service.id,
      p_desired_date: desiredDateValue,
      p_time_preference: 'morning',
      p_coat_condition_codes: ['some_knots'],
      p_coat_condition_notes: `${APPOINTMENT_REQUEST_MARKER} richiesta RLS`,
      p_declared_pet_age: null,
    });
    assertNoError(error, 'RPC submit_appointment_request');
    assert(data?.id, 'ID richiesta assente');
    assert(data.status === 'pending', `Stato atteso pending, ricevuto ${data.status}`);
    appointmentRequest = data;
    appointmentRequestIds.add(data.id);
    return `${data.id}, pending`;
  });

  await runTest('Staff legge richiesta Mario', '1 richiesta con campi strutturati', async () => {
    const { data, error } = await staff.client
      .from('appointment_requests')
      .select('id, pet_id, desired_date, time_preference, coat_condition_codes, status')
      .eq('id', appointmentRequest.id)
      .single();
    assertNoError(error, 'Richiesta Mario via staff');
    assert(data.pet_id === marioPet.id, 'Pet richiesta non corrisponde');
    assert(data.desired_date === desiredDateValue, 'Data desiderata non corrisponde');
    assert(data.time_preference === 'morning', 'Preferenza oraria non corrisponde');
    assert(data.coat_condition_codes.includes('some_knots'), 'Condizione manto assente');
    return '1 richiesta strutturata';
  });

  await runTest('Luca non vede richiesta Mario', '0 richieste', async () => {
    const { data, error } = await luca.client
      .from('appointment_requests')
      .select('id')
      .eq('id', appointmentRequest.id);
    assertNoError(error, 'Richiesta Mario da Luca');
    assert(data.length === 0, `Luca vede ${data.length} richieste`);
    return '0 richieste';
  });

  await runTest('Mario non cambia stato richiesta', '0 righe aggiornate, stato pending', async () => {
    const { data: updateRows, error: updateError } = await mario.client
      .from('appointment_requests')
      .update({ status: 'rejected' })
      .eq('id', appointmentRequest.id)
      .select('id');
    assertNoError(updateError, 'Tentativo UPDATE stato customer');
    assert(updateRows.length === 0, `Mario ha aggiornato ${updateRows.length} righe`);
    const { data, error } = await staff.client
      .from('appointment_requests')
      .select('status')
      .eq('id', appointmentRequest.id)
      .single();
    assertNoError(error, 'Verifica stato richiesta');
    assert(data.status === 'pending', `Stato modificato a ${data.status}`);
    return '0 righe, pending';
  });

  await runTest('Luca non invia richiesta per pet Mario', 'SQLSTATE 42501', async () => {
    const { data: service, error: serviceError } = await luca.client
      .from('services')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .limit(1)
      .single();
    assertNoError(serviceError, 'Servizio booking Luca');
    const { error } = await luca.client.rpc('submit_appointment_request', {
      p_tenant_id: tenantId,
      p_pet_id: marioPet.id,
      p_service_id: service.id,
      p_desired_date: desiredDateValue,
      p_time_preference: 'flexible',
      p_coat_condition_codes: ['clean_long'],
      p_coat_condition_notes: `${APPOINTMENT_REQUEST_MARKER} cross customer`,
      p_declared_pet_age: null,
    });
    assert(error, 'Luca ha inviato una richiesta per Mario');
    assert(error.code === '42501', `Atteso 42501, ricevuto ${error.code || error.message}`);
    return '42501';
  });

  await runTest('Staff converte richiesta atomicamente', 'request approved e appointment collegato', async () => {
    const scheduledAt = new Date(`${desiredDateValue}T10:00:00`).toISOString();
    const { data, error } = await staff.client.rpc('resolve_appointment_request', {
      p_request_id: appointmentRequest.id,
      p_decision: 'approved',
      p_scheduled_at: scheduledAt,
    });
    assertNoError(error, 'RPC resolve_appointment_request');
    assert(data.status === 'approved', `Stato atteso approved, ricevuto ${data.status}`);
    assert(data.appointment_id, 'Appointment collegato assente');
    appointmentIds.add(data.appointment_id);
    const { data: appointment, error: appointmentError } = await staff.client
      .from('appointments')
      .select('id, pet_id, service_id, approval_status, appointment_source, requested_by_customer_id')
      .eq('id', data.appointment_id)
      .single();
    assertNoError(appointmentError, 'Appointment convertito');
    assert(appointment.pet_id === marioPet.id, 'Pet appointment non corrisponde');
    assert(appointment.approval_status === 'approved', 'Appointment non approvato');
    assert(appointment.appointment_source === 'customer', 'Fonte appointment non customer');
    assert(appointment.requested_by_customer_id === mario.user.id, 'Richiedente appointment non corrisponde');
    return `${data.appointment_id}, approved`;
  });

  let gh44ServiceId = null;
  let gh44FourthPetId = null;

  await runTest(
    'Tetto richieste aperte per customer',
    '3 pending su pet distinti; quarta rifiutata dal database',
    async () => {
      const { data: service, error: serviceError } = await gh44.client
        .from('services')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('display_order')
        .limit(1)
        .single();
      assertNoError(serviceError, 'Servizio limite richieste GH-44');
      gh44ServiceId = service.id;

      const { data: fixturePets, error: petError } = await staff.client
        .from('pets')
        .select('id, name')
        .eq('customer_id', gh44CustomerId);
      assertNoError(petError, 'Lettura pet limite GH-44');
      assert(fixturePets.length === 4, `Pet GH-44 attesi 4, misurati ${fixturePets.length}`);
      const orderedPets = [...fixturePets].sort((left, right) => left.name.localeCompare(right.name));

      const requestPets = orderedPets.slice(0, 3).map(({ id }) => id);
      for (const [index, petId] of requestPets.entries()) {
        const { data, error } = await gh44.client.rpc('submit_appointment_request', {
          p_tenant_id: tenantId,
          p_pet_id: petId,
          p_service_id: gh44ServiceId,
          p_desired_date: desiredDateValue,
          p_time_preference: 'flexible',
          p_coat_condition_codes: ['clean_long'],
          p_coat_condition_notes: `${APPOINTMENT_REQUEST_MARKER} GH-44 limite ${index + 1}`,
          p_declared_pet_age: null,
        });
        assertNoError(error, `Richiesta GH-44 ${index + 1}`);
        appointmentRequestIds.add(data.id);
        gh44RequestIds.add(data.id);
      }

      gh44FourthPetId = orderedPets[3].id;
      const { error: fourthError } = await gh44.client.rpc('submit_appointment_request', {
        p_tenant_id: tenantId,
        p_pet_id: gh44FourthPetId,
        p_service_id: gh44ServiceId,
        p_desired_date: desiredDateValue,
        p_time_preference: 'flexible',
        p_coat_condition_codes: ['clean_long'],
        p_coat_condition_notes: `${APPOINTMENT_REQUEST_MARKER} GH-44 quarta`,
        p_declared_pet_age: null,
      });
      assert(fourthError, 'Quarta richiesta GH-44 accettata');
      assert(
        fourthError.code === '23514' && fourthError.details === 'GH44_OPEN_REQUEST_LIMIT',
        `Rifiuto limite inatteso: ${fourthError.code || ''} ${fourthError.message || ''}`
      );

      const { data: pending, error: pendingError } = await staff.client
        .from('appointment_requests')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('customer_user_id', gh44.user.id)
        .eq('status', 'pending');
      assertNoError(pendingError, 'Conteggio pending GH-44');
      assert(pending.length === 3, `Pending GH-44 attese 3, misurate ${pending.length}`);
      return '3 pending su 3 pet, quarta 23514/GH44_OPEN_REQUEST_LIMIT';
    }
  );

  await runTest(
    'Chiusura richiesta libera il tetto',
    'una rejected, richiesta successiva accettata',
    async () => {
      const requestToClose = [...gh44RequestIds][0];
      assert(requestToClose, 'Richiesta GH-44 da chiudere assente');
      const { data: closed, error: closeError } = await staff.client.rpc(
        'resolve_appointment_request_local',
        {
          p_request_id: requestToClose,
          p_decision: 'rejected',
          p_scheduled_date: null,
          p_scheduled_time: null,
          p_duration_minutes: null,
        }
      );
      assertNoError(closeError, 'Chiusura richiesta GH-44');
      assert(closed.status === 'rejected', `Stato chiusura inatteso: ${closed.status}`);

      const { data, error } = await gh44.client.rpc('submit_appointment_request', {
        p_tenant_id: tenantId,
        p_pet_id: gh44FourthPetId,
        p_service_id: gh44ServiceId,
        p_desired_date: desiredDateValue,
        p_time_preference: 'afternoon',
        p_coat_condition_codes: ['clean_long'],
        p_coat_condition_notes: `${APPOINTMENT_REQUEST_MARKER} GH-44 dopo chiusura`,
        p_declared_pet_age: null,
      });
      assertNoError(error, 'Richiesta GH-44 dopo chiusura');
      appointmentRequestIds.add(data.id);
      gh44RequestIds.add(data.id);
      return '1 rejected, nuova pending accettata';
    }
  );

  await runTest(
    'Customer non scollega account',
    'sonda GH-44 non scollega se stessa ne Mario',
    async () => {
      const ownAttempt = await gh44.client.rpc('unlink_customer_account', {
        p_customer_id: gh44CustomerId,
      });
      assert(forbiddenRlsError(ownAttempt.error), 'Sonda GH-44 ha scollegato il proprio account');

      const foreignAttempt = await gh44.client.rpc('unlink_customer_account', {
        p_customer_id: marioCustomer.id,
      });
      assert(forbiddenRlsError(foreignAttempt.error), 'Sonda GH-44 ha scollegato Mario');

      const { data: auditRows, error: auditError } = await gh44.client
        .from('customer_account_unlink_audit')
        .select('id')
        .eq('customer_id', gh44CustomerId);
      assertNoError(auditError, 'Lettura audit customer');
      assert(auditRows.length === 0, 'Sonda GH-44 vede il registro staff degli scollegamenti');

      const { data: customer, error: customerError } = await staff.client
        .from('customers')
        .select('user_id')
        .eq('id', gh44CustomerId)
        .single();
      assertNoError(customerError, 'Verifica customer dopo tentativi unlink');
      assert(customer.user_id === gh44.user.id, 'Legame fixture modificato dai tentativi negati');
      return '2 rifiuti 42501, audit invisibile, legame fixture invariato';
    }
  );

  await runTest(
    'Staff scollega e nuovo invito ricollega',
    'account e dati preservati, invisibilita immediata, nuovo riscatto riuscito',
    async () => {
      const petIds = [...gh44PetIds];
      const { data: visitsBefore, error: visitsBeforeError } = await staff.client
        .from('visits')
        .select('id')
        .in('pet_id', petIds);
      assertNoError(visitsBeforeError, 'Conteggio visite prima unlink');

      const { data: unlinked, error: unlinkError } = await staff.client.rpc(
        'unlink_customer_account',
        { p_customer_id: gh44CustomerId }
      );
      assertNoError(unlinkError, 'Scollegamento staff GH-44');
      assert(unlinked.status === 'unlinked', `Esito unlink inatteso: ${unlinked.status}`);
      assert(unlinked.disconnectedUserId === gh44.user.id, 'Utente scollegato inatteso');
      assert(unlinked.performedByUserId === staff.user.id, 'Attore audit inatteso');

      const [customerView, petView, visitView, authView] = await Promise.all([
        gh44.client.from('customers').select('id').eq('id', gh44CustomerId),
        gh44.client.from('pets').select('id').in('id', petIds),
        gh44.client.from('visits').select('id').in('pet_id', petIds),
        gh44.client.auth.getUser(),
      ]);
      assertNoError(customerView.error, 'Customer dopo unlink');
      assertNoError(petView.error, 'Pet dopo unlink');
      assertNoError(visitView.error, 'Visite dopo unlink');
      assertNoError(authView.error, 'Account Auth dopo unlink');
      assert(customerView.data.length === 0, 'Scheda ancora visibile dopo unlink');
      assert(petView.data.length === 0, 'Pet ancora visibili dopo unlink');
      assert(visitView.data.length === 0, 'Visite ancora visibili dopo unlink');
      assert(authView.data.user?.id === gh44.user.id, 'Account Auth non preservato');

      const { data: preservedCustomer, error: preservedCustomerError } = await staff.client
        .from('customers')
        .select('id, user_id')
        .eq('id', gh44CustomerId)
        .single();
      assertNoError(preservedCustomerError, 'Scheda preservata dopo unlink');
      assert(preservedCustomer.user_id === null, 'Legame customer non rimosso');

      const { data: preservedPets, error: preservedPetsError } = await staff.client
        .from('pets')
        .select('id')
        .eq('customer_id', gh44CustomerId);
      assertNoError(preservedPetsError, 'Pet preservati dopo unlink');
      const { data: preservedVisits, error: preservedVisitsError } = await staff.client
        .from('visits')
        .select('id')
        .in('pet_id', petIds);
      assertNoError(preservedVisitsError, 'Visite preservate dopo unlink');
      assert(preservedPets.length === 4, `Pet preservati attesi 4, misurati ${preservedPets.length}`);
      assert(
        preservedVisits.length === visitsBefore.length,
        `Visite cambiate: prima ${visitsBefore.length}, dopo ${preservedVisits.length}`
      );

      const { data: auditRows, error: auditError } = await staff.client
        .from('customer_account_unlink_audit')
        .select('disconnected_user_id, performed_by_user_id')
        .eq('customer_id', gh44CustomerId)
        .eq('disconnected_user_id', gh44.user.id)
        .eq('performed_by_user_id', staff.user.id);
      assertNoError(auditError, 'Audit unlink staff');
      assert(auditRows.length === 1, `Audit unlink atteso 1, misurato ${auditRows.length}`);

      const invitationId = `inv_gh44_relink_${crypto.randomUUID().replaceAll('-', '')}`;
      const invitationToken = `gh44-relink-${crypto.randomUUID()}`;
      const { error: invitationError } = await staff.client
        .from('customer_invitations')
        .insert({
          id: invitationId,
          token: invitationToken,
          operator_user_id: staff.user.id,
          pet_id: petIds[0],
          tenant_id: tenantId,
          phone: GH44_PHONE,
          first_name: '[DEMO GH-44] Ada',
          last_name: 'Scollegamento',
          customer_email: ACCOUNTS.gh44.email,
        });
      assertNoError(invitationError, 'Nuovo invito dopo unlink');
      gh44InvitationIds.add(invitationId);

      const { data: accepted, error: acceptError } = await gh44.client.rpc(
        'accept_customer_invite',
        { p_token: invitationToken }
      );
      assertNoError(acceptError, 'Riscatto nuovo invito');
      assert(accepted.customerId === gh44CustomerId, 'Nuovo invito ha collegato una scheda inattesa');

      const { data: visiblePets, error: visiblePetsError } = await gh44.client
        .from('pets')
        .select('id')
        .in('id', petIds);
      assertNoError(visiblePetsError, 'Pet dopo nuovo invito');
      assert(visiblePets.length === 4, `Pet dopo nuovo invito attesi 4, misurati ${visiblePets.length}`);

      return `0 dati visibili dopo unlink; 4 pet e ${visitsBefore.length} visite preservati; audit staff; nuovo invito ok`;
    }
  );

  for (const [column, attemptedValue] of [
    ['microchip', `${MARKER} MICROCHIP`],
    ['name', `${MARKER} NAME`],
    ['photo_url', `https://example.invalid/${encodeURIComponent(GH49_MARKER)}/customer.png`],
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

  await runTest('Whitelist customer consente coat_preferences', 'preferenze scritte e ripristinabili', async () => {
    const attempted = { gh49_test: `${GH49_MARKER} preferenze` };
    const { data, error } = await mario.client
      .from('pets')
      .update({ coat_preferences: attempted })
      .eq('id', marioPet.id)
      .select('coat_preferences')
      .single();
    assertNoError(error, 'UPDATE coat_preferences');
    assert(data.coat_preferences?.gh49_test === attempted.gh49_test, 'coat_preferences non aggiornato');
    return 'preferenze scritte';
  });

  await runTest('Staff continua a sostituire photo_url GH-49', 'foto staff aggiornata, leggibile e ripristinata', async () => {
    const fixtureUrl = staff.client.storage
      .from('pet-avatars')
      .getPublicUrl(gh45PetAvatarPath).data.publicUrl;
    const { data: updated, error: updateError } = await staff.client
      .from('pets')
      .update({ photo_url: fixtureUrl })
      .eq('id', marioPet.id)
      .select('photo_url')
      .single();
    assertNoError(updateError, 'UPDATE photo_url staff');
    assert(updated.photo_url === fixtureUrl, 'photo_url staff non persistita');
    const response = await fetch(`${fixtureUrl}?gh49=${Date.now()}`);
    assert(response.ok, `Foto staff non leggibile: HTTP ${response.status}`);

    const { data: restored, error: restoreError } = await staff.client
      .from('pets')
      .update({ photo_url: originalPhotoUrl })
      .eq('id', marioPet.id)
      .select('photo_url')
      .single();
    assertNoError(restoreError, 'Ripristino photo_url staff');
    assert(restored.photo_url === originalPhotoUrl, 'photo_url originale non ripristinita');
    return 'update staff, HTTP 200, ripristino originale';
  });

  await runTest('Ritratto owner non sovrascrive foto salone GH-50', 'owner_photo_url scritto; photo_url invariato', async () => {
    const salonUrl = staff.client.storage.from('pet-avatars').getPublicUrl(gh45PetAvatarPath).data.publicUrl;
    const ownerPath = `${tenantId}/${marioPet.id}/owner/gh-50-owner-portrait.png`;
    storagePaths.add(ownerPath);
    const { error: salonError } = await staff.client
      .from('pets')
      .update({ photo_url: salonUrl })
      .eq('id', marioPet.id);
    assertNoError(salonError, 'Impostazione foto salone GH-50');

    const { error: uploadError } = await mario.client.storage
      .from('pet-avatars')
      .upload(ownerPath, new TextEncoder().encode(`${GH50_MARKER} owner portrait`), {
        contentType: 'image/png',
        upsert: false,
      });
    assertNoError(uploadError, 'Upload ritratto owner GH-50');
    const ownerUrl = mario.client.storage.from('pet-avatars').getPublicUrl(ownerPath).data.publicUrl;
    const { data: customerUpdate, error: customerError } = await mario.client
      .from('pets')
      .update({ owner_photo_url: ownerUrl, photo_url: `${ownerUrl}?forbidden=photo_url` })
      .eq('id', marioPet.id)
      .select('owner_photo_url, photo_url')
      .single();
    assertNoError(customerError, 'UPDATE ritratto owner GH-50');
    assert(customerUpdate.owner_photo_url === ownerUrl, 'owner_photo_url non persistita');
    assert(customerUpdate.photo_url === salonUrl, 'photo_url salone sovrascritta dal customer');

    const { data: measured, error: measureError } = await staff.client
      .from('pets')
      .select('owner_photo_url, photo_url')
      .eq('id', marioPet.id)
      .single();
    assertNoError(measureError, 'Controllo staff fotografie GH-50');
    assert(measured.owner_photo_url === ownerUrl && measured.photo_url === salonUrl, 'Colonne GH-50 divergenti');
    return 'ritratto owner presente; URL salone identico al valore pre-update customer';
  });

  await runTest('Customer non scrive visits.photo_url GH-50', 'valore visita invariato', async () => {
    const { data: ownVisits, error: ownVisitError } = await staff.client
      .from('visits')
      .select('id, photo_url')
      .eq('pet_id', marioPet.id)
      .limit(1);
    assertNoError(ownVisitError, 'Lettura visita Mario GH-50');
    assert(ownVisits.length === 1, 'Visita Mario assente');
    const visit = ownVisits[0];
    const attempted = `https://example.invalid/${encodeURIComponent(GH50_MARKER)}/visit.png`;
    const { error } = await mario.client
      .from('visits')
      .update({ photo_url: attempted })
      .eq('id', visit.id);
    if (error) assert(forbiddenRlsError(error), `Errore inatteso: ${error.message}`);
    const { data: measured, error: measuredError } = await staff.client
      .from('visits')
      .select('photo_url')
      .eq('id', visit.id)
      .single();
    assertNoError(measuredError, 'Rilettura visita Mario GH-50');
    assert(measured.photo_url === visit.photo_url, 'Customer ha modificato visits.photo_url');
    return `invariato (${String(visit.photo_url)})`;
  });

  await runTest('Staff allega e rimuove foto visita GH-50', 'foto persistita, leggibile e rimossa', async () => {
    const objectPath = `${tenantId}/${fixturePet.id}/visits/${fixtureVisit.id}/gh-50-visit.png`;
    storagePaths.add(objectPath);
    const { error: uploadError } = await staff.client.storage
      .from('pet-avatars')
      .upload(objectPath, new TextEncoder().encode(`${GH50_MARKER} visit photo`), {
        contentType: 'image/png',
        upsert: false,
      });
    assertNoError(uploadError, 'Upload foto visita staff GH-50');
    const photoUrl = staff.client.storage.from('pet-avatars').getPublicUrl(objectPath).data.publicUrl;
    const { data: attached, error: attachError } = await staff.client
      .from('visits')
      .update({ photo_url: photoUrl })
      .eq('id', fixtureVisit.id)
      .select('photo_url')
      .single();
    assertNoError(attachError, 'Allegato foto visita GH-50');
    assert(attached.photo_url === photoUrl, 'Foto visita non persistita');
    const response = await fetch(`${photoUrl}?gh50=${Date.now()}`);
    assert(response.ok, `Foto visita non leggibile: HTTP ${response.status}`);
    const { data: removed, error: removeDbError } = await staff.client
      .from('visits')
      .update({ photo_url: null })
      .eq('id', fixtureVisit.id)
      .select('photo_url')
      .single();
    assertNoError(removeDbError, 'Rimozione colonna foto visita GH-50');
    assert(removed.photo_url === null, 'Foto visita ancora associata');
    const { error: removeStorageError } = await staff.client.storage.from('pet-avatars').remove([objectPath]);
    assertNoError(removeStorageError, 'Rimozione file visita GH-50');
    storagePaths.delete(objectPath);
    return 'persistita, HTTP 200, colonna null, oggetto rimosso';
  });

  await runTest('Customer non vede foto di pet altrui GH-50', '0 pet e 0 visite', async () => {
    const fixtureUrl = staff.client.storage.from('pet-avatars').getPublicUrl(gh45PetAvatarPath).data.publicUrl;
    const [petUpdate, visitUpdate] = await Promise.all([
      staff.client.from('pets').update({ owner_photo_url: fixtureUrl }).eq('id', fixturePet.id),
      staff.client.from('visits').update({ photo_url: fixtureUrl }).eq('id', fixtureVisit.id),
    ]);
    assertNoError(petUpdate.error, 'Fixture owner_photo_url altrui GH-50');
    assertNoError(visitUpdate.error, 'Fixture visits.photo_url altrui GH-50');
    const [petRead, visitRead] = await Promise.all([
      mario.client.from('pets').select('id, owner_photo_url').eq('id', fixturePet.id),
      mario.client.from('visits').select('id, photo_url').eq('id', fixtureVisit.id),
    ]);
    assertNoError(petRead.error, 'Lettura pet altrui GH-50');
    assertNoError(visitRead.error, 'Lettura visita altrui GH-50');
    assert(petRead.data.length === 0, `Mario vede ${petRead.data.length} pet altrui`);
    assert(visitRead.data.length === 0, `Mario vede ${visitRead.data.length} visite altrui`);
    return '0 pet e 0 visite';
  });

  await runTest('Customer non scrive nello spazio visite GH-50', 'HTTP 403', async () => {
    const objectPath = `${tenantId}/${marioPet.id}/visits/forbidden/${GH50_MARKER.replaceAll(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    storagePaths.add(objectPath);
    const { error } = await mario.client.storage
      .from('pet-avatars')
      .upload(objectPath, new TextEncoder().encode(`${GH50_MARKER} forbidden visit space`), {
        contentType: 'image/png',
        upsert: false,
      });
    assert(forbiddenStorageError(error), `Atteso 403, ricevuto ${error?.statusCode || error?.message || 'successo'}`);
    return `HTTP ${error.statusCode || 403}`;
  });

  await runTest('Storage customer sul pet proprio', 'upload, update e delete riusciti', async () => {
    const objectPath = `${tenantId}/${marioPet.id}/owner/${OWN_STORAGE_FILE}`;
    storagePaths.add(objectPath);
    const payload = new TextEncoder().encode(`${MARKER} own storage`);
    const { error: uploadError } = await mario.client.storage
      .from('pet-avatars')
      .upload(objectPath, payload, { contentType: 'image/png', upsert: false });
    assertNoError(uploadError, 'Upload pet proprio');
    const replacement = new TextEncoder().encode(`${MARKER} own storage updated`);
    const { error: updateError } = await mario.client.storage
      .from('pet-avatars')
      .update(objectPath, replacement, { contentType: 'image/png' });
    assertNoError(updateError, 'Update pet proprio');
    const { error: removeError } = await mario.client.storage
      .from('pet-avatars')
      .remove([objectPath]);
    assertNoError(removeError, 'Delete pet proprio');
    storagePaths.delete(objectPath);
    return 'upload, update e delete riusciti';
  });

  await runTest('Storage customer sul pet altrui', 'HTTP 403', async () => {
    const objectPath = `${tenantId}/${fixturePet.id}/owner/${FOREIGN_STORAGE_FILE}`;
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
    const objectPath = `${FOREIGN_TENANT_ID}/${marioPet.id}/owner/${FOREIGN_TENANT_FILE}`;
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

  await runTest('Staff aggiorna campo staff-only', 'nota pet modificata', async () => {
    const { data, error } = await staff.client
      .from('pet_staff_notes')
      .update({ notes: `${MARKER} STAFF UPDATE` })
      .eq('pet_id', marioPet.id)
      .select('notes')
      .single();
    assertNoError(error, 'UPDATE staff pet_staff_notes');
    assert(data.notes === `${MARKER} STAFF UPDATE`, 'UPDATE staff ripristinato inaspettatamente');
    return 'marker scritto';
  });

  await runTest('Staff fuori tenant', '0 righe da un secondo tenant reale', async () => {
    const { data, error } = await foreignStaff.client
      .from('pets')
      .select('id')
      .eq('tenant_id', tenantId);
    assertNoError(error, 'Lettura pet da staff fuori tenant');
    assert(data.length === 0, `Staff estraneo vede ${data.length} pet`);
    return '0 pet';
  });
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
  if (gh44?.client) {
    await gh44.client.auth.signOut({ scope: 'global' }).catch(() => {});
  }
  if (foreignStaff?.client) {
    await foreignStaff.client.auth.signOut({ scope: 'global' }).catch(() => {});
  }
}

console.log(`\n${SUITE_LABEL}`);
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
