import { supabase, getCurrentUser } from '../../../shared/supabase/client';
import { PILOT_TENANT_SLUG } from '../../../shared/tenant/config';
import { DEMO_MODE, DEMO_WRITE_BLOCK_MESSAGE } from './demoMode';
import { getFileExtensionFromName, getSafeImageMimeType } from './imageFiles';

const CLIENT_PHOTOS_BUCKET = 'client-photos';
const BLACKLIST_THRESHOLD = -3;
const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];
const ACQUISITION_SOURCES = ['manual', 'whatsapp', 'qr'];
const CUSTOMER_RELATIONSHIP_STATUSES = ['lead', 'contacted', 'active', 'archived'];
const REWARD_POINT_REASONS = ['visit', 'manual', 'promotion', 'redeem', 'correction'];
const PROFILE_ROLES = ['operator', 'customer'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];
const APPOINTMENT_SOURCES = ['operator', 'customer'];
const STAFF_ROLES = ['owner', 'staff'];
const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL || '').trim();

const PET_SELECT = `*, staff_notes:pet_staff_notes(notes), customer:customers(id, tenant_id, user_id, first_name, last_name, email, phone, marketing_opt_in, acquisition_source, relationship_status, created_at, updated_at, staff_notes:customer_staff_notes(notes)), visits(id, pet_id, tenant_id, appointment_id, date, treatments, issues, cost, discount_percent, created_at, updated_at)`;
const APPOINTMENT_SELECT = `id, user_id, pet_id, tenant_id, scheduled_at, duration_minutes, status, approval_status, appointment_source, requested_by_customer_id, notes, external_calendar, service_id, created_at, updated_at, pet:pets(id, tenant_id, customer_id, owner_user_id, name, breed, photo_url, no_show_score, is_blacklisted, customer:customers(id, user_id, first_name, last_name, email, phone))`;
const APPOINTMENT_REQUEST_SELECT = `id, tenant_id, customer_user_id, pet_id, service_id, desired_date, time_preference, coat_condition_codes, coat_condition_notes, declared_pet_age, status, appointment_id, staff_responded_at, proposed_alternatives, created_at, updated_at, service:services(id, name, duration_minutes), appointment:appointments(id, scheduled_at, duration_minutes, status, approval_status), pet:pets(id, tenant_id, customer_id, owner_user_id, name, breed, photo_url, no_show_score, is_blacklisted, birth_date, customer:customers(id, user_id, first_name, last_name, email, phone))`;
const CALENDAR_VISIT_SELECT = `id, pet_id, tenant_id, date, treatments, issues, cost, created_at, updated_at, pet:pets(id, tenant_id, customer_id, owner_user_id, name, breed, photo_url, no_show_score, is_blacklisted, customer:customers(id, user_id, first_name, last_name, email, phone))`;
const CALENDAR_PET_SELECT = `id, tenant_id, customer_id, owner_user_id, name, breed, photo_url, no_show_score, is_blacklisted, customer:customers(id, user_id, first_name, last_name, email, phone)`;

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const generateInviteToken = () =>
  `ghi_${
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 28)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`
  }`;

const assertDemoWriteAllowed = () => {
  if (DEMO_MODE) throw new Error(DEMO_WRITE_BLOCK_MESSAGE);
};

const getPublicAppOrigin = () =>
  PUBLIC_APP_URL ? PUBLIC_APP_URL.replace(/\/+$/, '') : window.location.origin;

const relation = (value) => (Array.isArray(value) ? value[0] || null : value || null);
const customerName = (customer) =>
  [customer?.first_name, customer?.last_name].filter(Boolean).join(' ').trim();

const splitCustomerName = (value) => {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  return parts.length < 2
    ? { firstName: parts[0] || '', lastName: null }
    : { firstName: parts.slice(0, -1).join(' '), lastName: parts.at(-1) };
};

const normalizePhoneIt = (value) => {
  const clean = String(value || '').trim().replace(/[\s\-()./]/g, '');
  if (!clean || clean.startsWith('+')) return clean;
  if (clean.startsWith('00') && clean.length >= 12) return `+${clean.slice(2)}`;
  if (clean.startsWith('39') && clean.length >= 11) return `+${clean}`;
  return `+39${clean}`;
};

const mapPet = (row) => {
  if (!row) return null;
  const rawCustomer = relation(row.customer);
  const customerStaffNotes = relation(rawCustomer?.staff_notes)?.notes || null;
  const customer = rawCustomer
    ? { ...rawCustomer, operator_notes: customerStaffNotes }
    : null;
  const internalNotes = relation(row.staff_notes)?.notes || null;
  const visits = [...(row.visits || [])].sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || ''))
  );
  return {
    ...row,
    customer,
    internal_notes: internalNotes,
    owner: customerName(customer),
    phone: customer?.phone || '',
    email: customer?.email || '',
    photo: row.photo_url || null,
    notes: internalNotes || '',
    visits,
    last_visit_at: visits[0]?.date || null,
  };
};

const setStaffNote = async (table, idColumn, id, value) => {
  const notes = String(value || '').trim();
  if (!notes) {
    const { error } = await supabase.from(table).delete().eq(idColumn, id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from(table)
    .upsert({ [idColumn]: id, notes }, { onConflict: idColumn });
  if (error) throw error;
};

const setCustomerStaffNote = (customerId, value) =>
  setStaffNote('customer_staff_notes', 'customer_id', customerId, value);

const setPetStaffNote = (petId, value) =>
  setStaffNote('pet_staff_notes', 'pet_id', petId, value);

const mapAppointment = (row) => {
  const pet = mapPet(relation(row?.pet));
  return row ? { ...row, pet, client: pet } : null;
};

const mapAppointmentRequest = (row) => {
  if (!row) return null;
  const pet = mapPet(relation(row.pet));
  const service = relation(row.service);
  const appointment = relation(row.appointment);
  return {
    ...row,
    request_kind: 'structured',
    approval_status: row.status,
    appointment_source: 'customer',
    scheduled_at: appointment?.scheduled_at || null,
    duration_minutes: appointment?.duration_minutes || service?.duration_minutes || 60,
    service,
    appointment,
    pet,
    client: pet,
    notes: row.coat_condition_notes || null,
  };
};

const mapCalendarVisit = (row) => {
  if (!row) return null;
  const pet = mapPet(relation(row.pet));
  return { ...row, pet, client: pet };
};

const getMemberships = async (userId) => {
  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, role, created_at')
    .eq('user_id', userId)
    .order('created_at');
  if (error) throw error;
  return data || [];
};

const pickMembership = (memberships, roles = null, tenantId = null) => {
  const matches = memberships.filter(
    (item) => (!tenantId || item.tenant_id === tenantId) && (!roles || roles.includes(item.role))
  );
  return (
    matches.find(({ role }) => role === 'owner') ||
    matches.find(({ role }) => role === 'staff') ||
    matches.find(({ role }) => role === 'customer') ||
    null
  );
};

const adaptedRole = (role) => (STAFF_ROLES.includes(role) ? 'operator' : role === 'customer' ? 'customer' : null);

const requireContext = async (roles, tenantId = null) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utente non autenticato');
  const memberships = await getMemberships(user.id);
  const membership = pickMembership(memberships, roles, tenantId);
  if (!membership) throw new Error('Accesso negato: membership non disponibile');
  return { user, memberships, membership, tenantId: membership.tenant_id };
};

const requireStaff = (tenantId = null) => requireContext(STAFF_ROLES, tenantId);
const requireCustomer = (tenantId = null) => requireContext(['customer'], tenantId);

const getPetById = async (petId, tenantId = null) => {
  let query = supabase.from('pets').select(PET_SELECT).eq('id', petId);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data, error } = await query.single();
  if (error) throw error;
  return mapPet(data);
};

const fileExtension = (file) => {
  const fromName = getFileExtensionFromName(file?.name || '');
  if (fromName) return fromName;
  return { 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic', 'image/heif': 'heif' }[file?.type] || 'jpg';
};

const uploadPhoto = async (userId, petId, file) => {
  const path = `${userId}/${petId}-${Date.now()}.${fileExtension(file)}`;
  const { error } = await supabase.storage.from(CLIENT_PHOTOS_BUCKET).upload(path, file, {
    upsert: false,
    contentType: getSafeImageMimeType(file),
  });
  if (error) throw error;
  return supabase.storage.from(CLIENT_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
};

const deletePhoto = async (url) => {
  const marker = `/storage/v1/object/public/${CLIENT_PHOTOS_BUCKET}/`;
  const index = typeof url === 'string' ? url.indexOf(marker) : -1;
  if (index === -1) return;
  const { error } = await supabase.storage
    .from(CLIENT_PHOTOS_BUCKET)
    .remove([decodeURIComponent(url.slice(index + marker.length))]);
  if (error) throw error;
};

const applyPhoto = async (userId, petId, file) => {
  if (!file) return { photoUrl: null, photoUploadError: null };
  try {
    const photoUrl = await uploadPhoto(userId, petId, file);
    const { error } = await supabase.from('pets').update({ photo_url: photoUrl }).eq('id', petId);
    if (error) throw error;
    return { photoUrl, photoUploadError: null };
  } catch (error) {
    return { photoUrl: null, photoUploadError: error.message };
  }
};

export const VALID_APPOINTMENT_STATUSES = [...APPOINTMENT_STATUSES];
export const VALID_ACQUISITION_SOURCES = [...ACQUISITION_SOURCES];
export const VALID_CUSTOMER_RELATIONSHIP_STATUSES = [...CUSTOMER_RELATIONSHIP_STATUSES];
export const VALID_REWARD_POINT_REASONS = [...REWARD_POINT_REASONS];
export const VALID_PROFILE_ROLES = [...PROFILE_ROLES];
export const VALID_APPOINTMENT_APPROVAL_STATUSES = [...APPROVAL_STATUSES];
export const VALID_APPOINTMENT_SOURCES = [...APPOINTMENT_SOURCES];

export const getUserProfile = async (userId) => {
  try {
    if (!userId) return null;
    const [{ data: profile, error }, memberships] = await Promise.all([
      supabase.from('profiles').select('id, business_name, role, created_at').eq('id', userId).maybeSingle(),
      getMemberships(userId),
    ]);
    if (error) throw error;
    const membership = pickMembership(memberships);
    return {
      ...(profile || { id: userId, business_name: null, created_at: null }),
      legacy_role: profile?.role || null,
      role: adaptedRole(membership?.role),
      membership_role: membership?.role || null,
      tenant_id: membership?.tenant_id || null,
      memberships,
    };
  } catch (error) {
    console.error('Errore caricamento profilo:', error.message);
    return null;
  }
};

export const ensureCustomerProfile = async (user) => {
  const profile = await getUserProfile(user?.id);
  if (!profile) throw new Error('Utente non autenticato');
  if (profile.role === 'operator') throw new Error('Questo account e un account operatore');
  if (profile.role !== 'customer') throw new Error('Account cliente non associato a un tenant');
  return profile;
};

export const ensureOperatorProfile = async (user) => {
  const profile = await getUserProfile(user?.id);
  if (!profile) throw new Error('Utente non autenticato');
  if (profile.role === 'customer') throw new Error('Questo account e un account cliente');
  if (profile.role !== 'operator') throw new Error('Account privo di membership staff');
  return profile;
};

export const createCustomerPortalInvite = async (petId, customerEmail = '') => {
  try {
    assertDemoWriteAllowed();
    const { user, tenantId } = await requireStaff();
    const pet = await getPetById(petId, tenantId);
    if (!pet.customer?.phone) throw new Error('Customer associato senza telefono');
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const { data, error } = await supabase.from('customer_invitations').insert({
      id: `inv_${generateId().replace(/-/g, '')}`,
      token,
      operator_user_id: user.id,
      pet_id: petId,
      tenant_id: tenantId,
      phone: pet.customer.phone,
      first_name: pet.customer.first_name,
      last_name: pet.customer.last_name,
      customer_email: customerEmail || null,
      expires_at: expiresAt.toISOString(),
    }).select('id, token, pet_id, customer_email, expires_at, created_at').single();
    if (error) throw error;
    return {
      ...data,
      inviteUrl: `${getPublicAppOrigin()}/u/redeem/${token}`,
      recipient: pet.owner,
      phone: pet.phone,
      petName: pet.name,
    };
  } catch (error) {
    throw new Error(`Non riesco a creare l'invito cliente: ${error.message}`);
  }
};

export const acceptCustomerPortalInvite = async (token) => {
  const { data, error } = await supabase.rpc('accept_customer_invite', { p_token: token });
  if (error) throw new Error(`Non riesco ad accettare l'invito: ${error.message}`);
  return data;
};

export const getCustomerPortalData = async () => {
  try {
    const { user, tenantId } = await requireCustomer();
    const { data: customers, error: customerError } = await supabase
      .from('customers').select('id').eq('tenant_id', tenantId).eq('user_id', user.id);
    if (customerError) throw customerError;
    const customerIds = (customers || []).map(({ id }) => id);
    if (!customerIds.length) return { clients: [] };
    const { data, error } = await supabase
      .from('pets').select(PET_SELECT).eq('tenant_id', tenantId).in('customer_id', customerIds);
    if (error) throw error;
    const pets = (data || []).map(mapPet);
    const ids = pets.map(({ id }) => id);
    if (!ids.length) return { clients: [] };
    const lookback = new Date(Date.now() - 60 * 86400000).toISOString();
    const [{ data: appointments, error: appointmentError }, { data: points, error: pointsError }] = await Promise.all([
      supabase.from('appointments').select('id, pet_id, scheduled_at, duration_minutes, status, approval_status, appointment_source, requested_by_customer_id, notes').in('pet_id', ids).gte('scheduled_at', lookback).order('scheduled_at'),
      supabase.from('reward_points').select('id, pet_id, points, reason, note, created_at').in('pet_id', ids).order('created_at', { ascending: false }),
    ]);
    if (appointmentError) throw appointmentError;
    if (pointsError) throw pointsError;
    return { clients: pets.map((pet) => {
      const petAppointments = (appointments || []).filter(({ pet_id }) => pet_id === pet.id);
      const rewardPoints = (points || []).filter(({ pet_id }) => pet_id === pet.id);
      return {
        ...pet,
        appointments: petAppointments,
        nextAppointment: petAppointments.find((item) => item.approval_status === 'approved' && item.status === 'scheduled' && new Date(item.scheduled_at) >= new Date()) || null,
        rewardPoints,
        rewardPointsTotal: rewardPoints.reduce((sum, item) => sum + Number(item.points || 0), 0),
      };
    }) };
  } catch (error) {
    throw new Error(`Non riesco a caricare il portale cliente: ${error.message}`);
  }
};

export const getAllPets = async (tenantId = null, filters = {}) => {
  try {
    const context = await requireStaff(tenantId);
    const { data, error } = await supabase.from('pets').select(PET_SELECT).eq('tenant_id', context.tenantId);
    if (error) throw error;
    const search = String(filters.search || '').trim().toLowerCase();
    const pets = (data || []).map(mapPet).filter((pet) =>
      (!search || [pet.name, pet.breed, pet.owner, pet.phone].some((value) => String(value || '').toLowerCase().includes(search))) &&
      (typeof filters.isBlacklisted !== 'boolean' || pet.is_blacklisted === filters.isBlacklisted)
    );
    const sortBy = filters.sortBy || 'last_visit_at';
    const direction = filters.ascending === true ? 1 : -1;
    return pets.sort((a, b) => {
      const compared = String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''), 'it');
      return compared ? compared * direction : String(a.name).localeCompare(String(b.name), 'it');
    });
  } catch (error) {
    throw new Error(`Non riesco a caricare i pet: ${error.message}`);
  }
};

export const getAllClients = (filters = {}) => getAllPets(null, filters);

export const getCalendarPetOptions = async () => {
  try {
    const { tenantId } = await requireStaff();
    const { data, error } = await supabase
      .from('pets')
      .select(CALENDAR_PET_SELECT)
      .eq('tenant_id', tenantId)
      .order('name');
    if (error) throw error;
    return (data || []).map(mapPet);
  } catch (error) {
    throw new Error(`Non riesco a caricare i pet del calendario: ${error.message}`);
  }
};

export const getCustomerDirectory = async () => {
  const { tenantId } = await requireStaff();
  const { data, error } = await supabase
    .from('customers')
    .select(`
      id,
      tenant_id,
      user_id,
      first_name,
      last_name,
      email,
      phone,
      acquisition_source,
      relationship_status,
      created_at,
      updated_at,
      staff_notes:customer_staff_notes(notes),
      pets(id, name, breed, photo_url, created_at)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Non riesco a caricare il direttorio clienti: ${error.message}`);

  return (data || []).map((customer) => {
    const operatorNotes = relation(customer.staff_notes)?.notes || null;
    const pets = [...(customer.pets || [])].sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''), 'it')
    );
    const pendingPetPattern = /(?:^|\n)\[Lead\] Pet dichiarato: ([^\n]+)/;
    const pendingPetName = operatorNotes?.match(pendingPetPattern)?.[1]?.trim() || '';
    const visibleNotes = String(operatorNotes || '')
      .replace(pendingPetPattern, '')
      .trim();
    return {
      ...customer,
      operator_notes: operatorNotes,
      owner_name: customerName(customer),
      notes: visibleNotes,
      source: customer.acquisition_source || 'manual',
      status: customer.relationship_status || (pets.length ? 'active' : 'lead'),
      pets,
      pending_pet_name: pendingPetName,
      pet_name: pets.map((pet) => pet.name).join(', ') || pendingPetName,
    };
  });
};

export const upsertCustomerLead = async (leadData) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (!leadData.owner_name?.trim()) throw new Error('Il nome del proprietario e obbligatorio');
  if (!leadData.phone?.trim()) throw new Error('Il telefono e obbligatorio');
  const { firstName, lastName } = splitCustomerName(leadData.owner_name);
  const source = ACQUISITION_SOURCES.includes(leadData.source) ? leadData.source : 'manual';
  const noteParts = [
    leadData.pet_name?.trim() ? `[Lead] Pet dichiarato: ${leadData.pet_name.trim()}` : null,
    leadData.notes?.trim() || null,
  ].filter(Boolean);
  const { data, error } = await supabase.rpc('upsert_customer_lead', {
    p_tenant_id: tenantId,
    p_first_name: firstName,
    p_phone: leadData.phone.trim(),
    p_last_name: lastName,
    p_operator_notes: noteParts.join('\n') || null,
    p_acquisition_source: source,
    p_relationship_status: 'lead',
  });
  if (error) throw new Error(`Non riesco ad aggiungere il lead: ${error.message}`);
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.customer_id) throw new Error('Identificativo customer non disponibile');
  return result;
};

export const updateCustomerRelationshipStatus = async (customerId, status) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (!CUSTOMER_RELATIONSHIP_STATUSES.includes(status)) {
    throw new Error('Stato relazione non valido');
  }
  const { error } = await supabase
    .from('customers')
    .update({ relationship_status: status })
    .eq('id', customerId)
    .eq('tenant_id', tenantId);
  if (error) throw new Error(`Non riesco ad aggiornare lo stato del customer: ${error.message}`);
};

export const addRewardPointMovement = async (petId, pointData) => {
  assertDemoWriteAllowed();
  const { user, tenantId } = await requireStaff();
  await getPetById(petId, tenantId);
  const points = Number.parseInt(pointData.points, 10);
  if (!Number.isFinite(points) || points === 0) throw new Error('Inserisci un numero di punti diverso da zero');
  const { data, error } = await supabase.from('reward_points').insert({
    id: generateId(), user_id: user.id, pet_id: petId, tenant_id: tenantId, points,
    reason: REWARD_POINT_REASONS.includes(pointData.reason) ? pointData.reason : 'manual',
    note: pointData.note?.trim() || null,
  }).select('id').single();
  if (error) throw new Error(`Non riesco ad aggiungere i punti premio: ${error.message}`);
  return data.id;
};

export const addCustomerWithPet = async (tenantId, customerData, petData) => {
  try {
    assertDemoWriteAllowed();
    const { user, tenantId: activeTenant } = await requireStaff(tenantId);
    if (!customerData?.first_name?.trim()) throw new Error('Il nome del proprietario e obbligatorio');
    if (!customerData?.phone?.trim()) throw new Error('Il telefono del proprietario e obbligatorio');
    if (!petData?.name?.trim()) throw new Error('Il nome del pet e obbligatorio');
    const { data, error } = await supabase.rpc('add_customer_with_pet', {
      p_tenant_id: activeTenant,
      p_customer_first_name: customerData.first_name.trim(),
      p_customer_phone: customerData.phone.trim(),
      p_pet_name: petData.name.trim(),
      p_customer_last_name: customerData.last_name?.trim() || null,
      p_customer_email: customerData.email?.trim() || null,
      p_customer_marketing_opt_in: customerData.marketing_opt_in === true,
      p_customer_operator_notes: customerData.operator_notes?.trim() || null,
      p_pet_species: petData.species?.trim() || null,
      p_pet_breed: petData.breed?.trim() || null,
      p_pet_birth_date: petData.birth_date || null,
      p_pet_sex: petData.sex || null,
      p_pet_microchip: petData.microchip?.trim() || null,
      p_pet_weight_kg: petData.weight_kg || null,
      p_pet_neutered: typeof petData.neutered === 'boolean' ? petData.neutered : null,
      p_pet_color: petData.color?.trim() || null,
      p_pet_coat_preferences: petData.coat_preferences || null,
      p_pet_owner_notes: petData.owner_notes?.trim() || null,
      p_pet_internal_notes: petData.internal_notes?.trim() || null,
      p_pet_photo_url: petData.photo_url || null,
    });
    if (error) throw error;
    const created = Array.isArray(data) ? data[0] : data;
    if (!created?.customer_id || !created?.pet_id) throw new Error('Identificativi creati non disponibili');
    return { ...created, ...(await applyPhoto(user.id, created.pet_id, petData.photoFile)) };
  } catch (error) {
    throw new Error(`Non riesco ad aggiungere customer e pet: ${error.message}`);
  }
};

export const addPetToCustomer = async (customerId, petData) => {
  assertDemoWriteAllowed();
  const { user, tenantId } = await requireStaff();
  if (!petData?.name?.trim()) throw new Error('Il nome del pet e obbligatorio');
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, tenant_id, relationship_status, staff_notes:customer_staff_notes(notes)')
    .eq('id', customerId)
    .eq('tenant_id', tenantId)
    .single();
  if (customerError) throw customerError;
  const { data, error } = await supabase.from('pets').insert({
    tenant_id: customer.tenant_id, customer_id: customer.id, owner_user_id: user.id,
    name: petData.name.trim(), species: petData.species?.trim() || null,
    breed: petData.breed?.trim() || null, birth_date: petData.birth_date || null,
    sex: petData.sex || null, microchip: petData.microchip?.trim() || null,
    weight_kg: petData.weight_kg || null,
    neutered: typeof petData.neutered === 'boolean' ? petData.neutered : null,
    color: petData.color?.trim() || null, coat_preferences: petData.coat_preferences || null,
    owner_notes: petData.owner_notes?.trim() || null,
    photo_url: petData.photo_url || null,
  }).select('id').single();
  if (error) throw new Error(`Non riesco ad aggiungere il pet: ${error.message}`);

  const originalOperatorNotes = relation(customer.staff_notes)?.notes || null;
  const notesWithoutPendingPet = String(originalOperatorNotes || '')
    .replace(/(?:^|\n)\[Lead\] Pet dichiarato: [^\n]+/, '')
    .trim();
  const transferredPetNotes = String(petData.internal_notes || '').trim();
  const operatorNotes = notesWithoutPendingPet === transferredPetNotes
    ? null
    : notesWithoutPendingPet || null;
  try {
    await setPetStaffNote(data.id, petData.internal_notes);
    const { error: statusError } = await supabase
      .from('customers')
      .update({ relationship_status: 'active' })
      .eq('id', customer.id)
      .eq('tenant_id', tenantId);
    if (statusError) throw statusError;
    await setCustomerStaffNote(customer.id, operatorNotes);
  } catch (writeError) {
    await supabase.from('pets').delete().eq('id', data.id).eq('tenant_id', tenantId);
    await supabase
      .from('customers')
      .update({ relationship_status: customer.relationship_status })
      .eq('id', customer.id)
      .eq('tenant_id', tenantId);
    await setCustomerStaffNote(customer.id, originalOperatorNotes).catch(() => {});
    throw new Error(`Pet non confermato: ${writeError.message}`);
  }

  return { pet_id: data.id, ...(await applyPhoto(user.id, data.id, petData.photoFile)) };
};

export const addClient = async (clientData) => {
  const { tenantId } = await requireStaff();
  const { firstName, lastName } = splitCustomerName(clientData.owner);
  const result = await addCustomerWithPet(
    tenantId,
    { first_name: firstName, last_name: lastName, phone: clientData.phone },
    { name: clientData.name, breed: clientData.breed, internal_notes: clientData.notes, photoFile: clientData.photoFile }
  );
  return result.pet_id;
};

export const updateClient = async (petId, input) => {
  assertDemoWriteAllowed();
  const { user, tenantId } = await requireStaff();
  if (!input.name?.trim() || !input.owner?.trim() || !input.phone?.trim()) throw new Error('Nome pet, proprietario e telefono sono obbligatori');
  const pet = await getPetById(petId, tenantId);
  if (!pet.customer_id) throw new Error('Customer associato non disponibile');
  const { firstName, lastName } = splitCustomerName(input.owner);
  const { error: customerError } = await supabase.from('customers').update({
    first_name: firstName, last_name: lastName, phone: normalizePhoneIt(input.phone),
  }).eq('id', pet.customer_id).eq('tenant_id', tenantId);
  if (customerError) throw customerError;
  let photoUrl = pet.photo_url;
  if (input.photoFile) {
    const uploaded = await uploadPhoto(user.id, petId, input.photoFile);
    if (photoUrl) await deletePhoto(photoUrl);
    photoUrl = uploaded;
  } else if (input.removePhoto || input.photo === '') {
    if (photoUrl) await deletePhoto(photoUrl);
    photoUrl = null;
  }
  try {
    await setPetStaffNote(petId, input.notes);
  } catch (noteError) {
    throw new Error(`Non riesco a salvare le note interne: ${noteError.message}`);
  }
  const { error } = await supabase.from('pets').update({
    name: input.name.trim(),
    species: input.species?.trim() || null,
    breed: input.breed?.trim() || null,
    birth_date: input.birth_date || null,
    sex: input.sex || null,
    microchip: input.microchip?.trim() || null,
    weight_kg: input.weight_kg ? Number(input.weight_kg) : null,
    color: input.color?.trim() || null,
    neutered: input.neutered === '' || input.neutered == null
      ? null
      : input.neutered === true || input.neutered === 'true',
    photo_url: photoUrl,
  }).eq('id', petId).eq('tenant_id', tenantId);
  if (error) {
    await setPetStaffNote(petId, pet.notes).catch(() => {});
    throw new Error(`Non riesco a modificare il pet: ${error.message}`);
  }
};

export const deleteClient = async (petId) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  const pet = await getPetById(petId, tenantId);
  if (pet.photo_url) await deletePhoto(pet.photo_url);
  const { error } = await supabase.from('pets').delete().eq('id', petId).eq('tenant_id', tenantId);
  if (error) throw new Error(`Non riesco a eliminare il pet: ${error.message}`);
};

export const addVisit = async (petId, input) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  await getPetById(petId, tenantId);
  if (!input.cost || input.cost <= 0) throw new Error('Il costo deve essere maggiore di zero');
  const { data, error } = await supabase.from('visits').insert({
    id: generateId(), pet_id: petId, tenant_id: tenantId, date: input.date,
    treatments: input.treatments || null, issues: input.issues || null,
    cost: Number.parseFloat(input.cost), discount_percent: input.discount_percent || 0,
  }).select('id').single();
  if (error) throw new Error(`Non riesco ad aggiungere la visita: ${error.message}`);
  return data.id;
};

export const completeAppointmentWithVisit = async (appointmentId, input) => {
  assertDemoWriteAllowed();
  await requireStaff();
  if (!appointmentId) throw new Error('Appuntamento non disponibile');
  if (!input.date || !input.cost || Number(input.cost) <= 0) {
    throw new Error('Data e costo positivo sono obbligatori');
  }
  const { data, error } = await supabase.rpc('complete_appointment_with_visit', {
    p_appointment_id: appointmentId,
    p_date: input.date,
    p_treatments: input.treatments || null,
    p_issues: input.issues || null,
    p_cost: Number(input.cost),
  });
  if (error) throw new Error(`Non riesco a chiudere lavorazione e appuntamento: ${error.message}`);
  return data?.id || data;
};

export const deleteVisit = async (visitId, petId) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  await getPetById(petId, tenantId);
  const { error } = await supabase.from('visits').delete().eq('id', visitId).eq('tenant_id', tenantId);
  if (error) throw new Error(`Non riesco a eliminare la visita: ${error.message}`);
};

export const updateClientNoShowScore = async (petId, delta) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  const pet = await getPetById(petId, tenantId);
  const nextScore = Number(pet.no_show_score || 0) + Number(delta);
  if (Number.isNaN(nextScore)) throw new Error('Delta punteggio non valido');
  const { data, error } = await supabase.from('pets').update({
    no_show_score: nextScore, is_blacklisted: nextScore <= BLACKLIST_THRESHOLD,
  }).eq('id', petId).eq('tenant_id', tenantId).select('id, no_show_score, is_blacklisted').single();
  if (error) throw new Error(`Non riesco ad aggiornare il punteggio: ${error.message}`);
  return data;
};

export const setClientBlacklistStatus = async (petId, isBlacklisted) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  await getPetById(petId, tenantId);
  const { data, error } = await supabase.from('pets').update({ is_blacklisted: Boolean(isBlacklisted) }).eq('id', petId).eq('tenant_id', tenantId).select('id, no_show_score, is_blacklisted').single();
  if (error) throw new Error(`Non riesco ad aggiornare la blacklist: ${error.message}`);
  return data;
};

export const addAppointment = async (input) => {
  assertDemoWriteAllowed();
  const { user, tenantId } = await requireStaff();
  const petId = input.pet_id || input.clientId;
  const status = input.status || 'scheduled';
  if (!petId || !input.scheduled_at) throw new Error('Pet e data sono obbligatori');
  if (!APPOINTMENT_STATUSES.includes(status)) throw new Error('Stato appuntamento non valido');
  await getPetById(petId, tenantId);
  const { data, error } = await supabase.from('appointments').insert({
    id: generateId(), user_id: user.id, pet_id: petId, tenant_id: tenantId,
    scheduled_at: input.scheduled_at, duration_minutes: Number(input.duration_minutes) || 60,
    status, approval_status: APPROVAL_STATUSES.includes(input.approval_status) ? input.approval_status : 'approved',
    appointment_source: APPOINTMENT_SOURCES.includes(input.appointment_source) ? input.appointment_source : 'operator',
    requested_by_customer_id: input.requested_by_customer_id || null,
    notes: input.notes || null, external_calendar: input.external_calendar || null,
    service_id: input.service_id || null,
  }).select('id').single();
  if (error) throw new Error(`Non riesco a creare l'appuntamento: ${error.message}`);
  if (status === 'no_show') await updateClientNoShowScore(petId, -1);
  return data.id;
};

export const createCustomerAppointmentRequest = async (petId, input = {}) => {
  assertDemoWriteAllowed();
  const { user, tenantId } = await requireCustomer();
  if (!input.date || !input.time) throw new Error('Data e ora sono obbligatorie');
  const scheduledAt = new Date(`${input.date}T${input.time}`);
  if (Number.isNaN(scheduledAt.getTime())) throw new Error('Data o ora non valide');
  const duration = Number(input.duration_minutes) || 60;
  if (duration <= 0 || duration > 480) throw new Error('Durata richiesta non valida');
  const pet = await getPetById(petId, tenantId);
  const { data, error } = await supabase.from('appointments').insert({
    id: generateId(), user_id: pet.owner_user_id, pet_id: petId, tenant_id: tenantId,
    scheduled_at: scheduledAt.toISOString(), duration_minutes: duration,
    status: 'scheduled', approval_status: 'pending', appointment_source: 'customer',
    requested_by_customer_id: user.id, notes: input.notes?.trim() || null,
  }).select('id, user_id, pet_id, tenant_id, scheduled_at, duration_minutes, status, approval_status, appointment_source, requested_by_customer_id, notes, created_at').single();
  if (error) throw new Error(`Non riesco a inviare la richiesta appuntamento: ${error.message}`);
  return data;
};

export const getAppointments = async (filters = {}) => {
  const { tenantId } = await requireStaff();
  let query = supabase.from('appointments').select(APPOINTMENT_SELECT).eq('tenant_id', tenantId).order('scheduled_at');
  if (filters.from) query = query.gte('scheduled_at', filters.from);
  if (filters.to) query = query.lte('scheduled_at', filters.to);
  if (filters.includePending !== true) query = query.neq('approval_status', 'pending');
  if (filters.includeRejected !== true) query = query.neq('approval_status', 'rejected');
  const { data, error } = await query;
  if (error) throw new Error(`Non riesco a caricare il calendario: ${error.message}`);
  return (data || []).map(mapAppointment);
};

export const getCalendarWeekData = async ({ from, to } = {}) => {
  if (!from || !to) throw new Error('La settimana del calendario e obbligatoria');

  const { tenantId } = await requireStaff();
  const fromIso = new Date(`${from}T00:00:00`).toISOString();
  const toIso = new Date(`${to}T23:59:59.999`).toISOString();

  const [appointmentsResult, structuredResult, legacyResult, visitsResult] = await Promise.all([
    supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', fromIso)
      .lte('scheduled_at', toIso)
      .neq('approval_status', 'pending')
      .neq('approval_status', 'rejected')
      .order('scheduled_at'),
    supabase
      .from('appointment_requests')
      .select(APPOINTMENT_REQUEST_SELECT)
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .gte('desired_date', from)
      .lte('desired_date', to)
      .order('created_at', { ascending: false }),
    supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('tenant_id', tenantId)
      .eq('approval_status', 'pending')
      .eq('appointment_source', 'customer')
      .gte('scheduled_at', fromIso)
      .lte('scheduled_at', toIso)
      .order('created_at', { ascending: false }),
    supabase
      .from('visits')
      .select(CALENDAR_VISIT_SELECT)
      .eq('tenant_id', tenantId)
      .gte('date', from)
      .lte('date', to)
      .order('date'),
  ]);

  if (appointmentsResult.error) {
    throw new Error(`Non riesco a caricare gli appuntamenti: ${appointmentsResult.error.message}`);
  }
  if (structuredResult.error) {
    throw new Error(`Non riesco a caricare le richieste: ${structuredResult.error.message}`);
  }
  if (legacyResult.error) {
    throw new Error(`Non riesco a caricare le richieste precedenti: ${legacyResult.error.message}`);
  }
  if (visitsResult.error) {
    throw new Error(`Non riesco a caricare le lavorazioni: ${visitsResult.error.message}`);
  }

  return {
    appointments: (appointmentsResult.data || []).map(mapAppointment),
    requests: [
      ...(structuredResult.data || []).map(mapAppointmentRequest),
      ...(legacyResult.data || []).map((row) => ({ ...mapAppointment(row), request_kind: 'legacy' })),
    ].sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || ''))),
    visits: (visitsResult.data || []).map(mapCalendarVisit),
  };
};

export const getPendingAppointmentRequests = async () => {
  const { tenantId } = await requireStaff();
  const [structuredResult, legacyResult] = await Promise.all([
    supabase.from('appointment_requests').select(APPOINTMENT_REQUEST_SELECT)
      .eq('tenant_id', tenantId).eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase.from('appointments').select(APPOINTMENT_SELECT)
      .eq('tenant_id', tenantId).eq('approval_status', 'pending')
      .eq('appointment_source', 'customer').order('created_at', { ascending: false }),
  ]);
  if (structuredResult.error) {
    throw new Error(`Non riesco a caricare le nuove richieste: ${structuredResult.error.message}`);
  }
  if (legacyResult.error) {
    throw new Error(`Non riesco a caricare le richieste precedenti: ${legacyResult.error.message}`);
  }
  return [
    ...(structuredResult.data || []).map(mapAppointmentRequest),
    ...(legacyResult.data || []).map((row) => ({ ...mapAppointment(row), request_kind: 'legacy' })),
  ].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
};

export const resolveAppointmentRequest = async (
  requestId,
  decision,
  scheduledDate = null,
  scheduledTime = null,
  durationMinutes = null
) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (!['approved', 'rejected'].includes(decision)) throw new Error('Decisione richiesta non valida');
  if (decision === 'approved' && (!scheduledDate || !scheduledTime)) throw new Error('Data e ora sono obbligatorie');
  const duration = Number(durationMinutes);
  if (decision === 'approved' && (!Number.isInteger(duration) || duration < 15)) {
    throw new Error('La durata effettiva deve essere di almeno 15 minuti');
  }

  const { error: rpcError } = await supabase.rpc('resolve_appointment_request_local', {
    p_request_id: requestId,
    p_decision: decision,
    p_scheduled_date: decision === 'approved' ? scheduledDate : null,
    p_scheduled_time: decision === 'approved' ? scheduledTime : null,
    p_duration_minutes: decision === 'approved' ? duration : null,
  });
  if (rpcError) throw new Error(`Non riesco ad aggiornare la richiesta: ${rpcError.message}`);

  const { data, error } = await supabase.from('appointment_requests')
    .select(APPOINTMENT_REQUEST_SELECT)
    .eq('id', requestId)
    .eq('tenant_id', tenantId)
    .single();
  if (error) throw new Error(`Richiesta aggiornata ma non rileggibile: ${error.message}`);
  return mapAppointmentRequest(data);
};

export const proposeAppointmentRequestAlternatives = async (requestId, alternatives) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (![2, 3].includes(alternatives?.length)) {
    throw new Error('Scegli due o tre alternative');
  }
  const { error: rpcError } = await supabase.rpc('propose_appointment_request_alternatives', {
    p_request_id: requestId,
    p_alternatives: alternatives,
  });
  if (rpcError) throw new Error(`Non riesco a registrare le alternative: ${rpcError.message}`);
  const { data, error } = await supabase.from('appointment_requests')
    .select(APPOINTMENT_REQUEST_SELECT)
    .eq('id', requestId)
    .eq('tenant_id', tenantId)
    .single();
  if (error) throw new Error(`Alternative registrate ma non rileggibili: ${error.message}`);
  return mapAppointmentRequest(data);
};

const getStaffAppointment = async (appointmentId, tenantId) => {
  const { data, error } = await supabase.from('appointments')
    .select('id, pet_id, tenant_id, status, approval_status, scheduled_at, duration_minutes')
    .eq('id', appointmentId).eq('tenant_id', tenantId).single();
  if (error) throw error;
  return data;
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (!APPOINTMENT_STATUSES.includes(status)) throw new Error('Stato appuntamento non valido');
  const appointment = await getStaffAppointment(appointmentId, tenantId);
  if (appointment.approval_status === 'pending') throw new Error('Conferma o rifiuta prima la richiesta');
  if (appointment.approval_status === 'rejected') throw new Error('Non puoi aggiornare uno slot rifiutato');
  const { data, error } = await supabase.from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appointmentId).eq('tenant_id', tenantId)
    .select('id, pet_id, status').single();
  if (error) throw new Error(`Non riesco ad aggiornare lo stato: ${error.message}`);
  if (appointment.status !== 'no_show' && status === 'no_show') await updateClientNoShowScore(appointment.pet_id, -1);
  if (appointment.status === 'no_show' && status !== 'no_show') await updateClientNoShowScore(appointment.pet_id, 1);
  return data;
};

export const updateAppointmentApproval = async (appointmentId, approvalStatus) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (!['approved', 'rejected'].includes(approvalStatus)) throw new Error('Puoi solo approvare o rifiutare');
  const appointment = await getStaffAppointment(appointmentId, tenantId);
  if (appointment.approval_status === approvalStatus) return appointment;
  const status = approvalStatus === 'rejected'
    ? 'cancelled'
    : appointment.status === 'cancelled' ? 'scheduled' : appointment.status;
  const { data, error } = await supabase.from('appointments')
    .update({ approval_status: approvalStatus, status, updated_at: new Date().toISOString() })
    .eq('id', appointmentId).eq('tenant_id', tenantId).select(APPOINTMENT_SELECT).single();
  if (error) throw new Error(`Non riesco ad aggiornare la richiesta: ${error.message}`);
  return mapAppointment(data);
};

export const updateAppointmentSchedule = async (appointmentId, updates) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  if (!updates?.scheduled_at) throw new Error('La nuova data e obbligatoria');
  const appointment = await getStaffAppointment(appointmentId, tenantId);
  if (appointment.approval_status === 'rejected') throw new Error('Non puoi spostare uno slot rifiutato');
  const { data, error } = await supabase.from('appointments').update({
    scheduled_at: updates.scheduled_at,
    duration_minutes: Number(updates.duration_minutes) || appointment.duration_minutes,
    updated_at: new Date().toISOString(),
  }).eq('id', appointmentId).eq('tenant_id', tenantId).select(APPOINTMENT_SELECT).single();
  if (error) throw new Error(`Non riesco a spostare l'appuntamento: ${error.message}`);
  return mapAppointment(data);
};

export const deleteAppointment = async (appointmentId) => {
  assertDemoWriteAllowed();
  const { tenantId } = await requireStaff();
  await getStaffAppointment(appointmentId, tenantId);
  const { error } = await supabase.from('appointments').delete().eq('id', appointmentId).eq('tenant_id', tenantId);
  if (error) throw new Error(`Non riesco a eliminare l'appuntamento: ${error.message}`);
};

export const exportData = async () => {
  const pets = await getAllPets();
  return {
    exportDate: new Date().toISOString(), petsCount: pets.length, clientsCount: pets.length,
    visitsCount: pets.reduce((sum, pet) => sum + pet.visits.length, 0), data: pets,
  };
};

export const getClientPromos = (client) => {
  const count = client.visits?.length || 0;
  if (count >= 10) return { count, discount: 20, message: 'Sconto 20%!' };
  if (count >= 5) return { count, discount: 10, message: 'Sconto 10%!' };
  return { count, discount: 0, message: count ? `${10 - count} visite per lo sconto!` : '' };
};

export const getClientById = async (petId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');
    const profile = await getUserProfile(user.id);
    const pet = await getPetById(petId, profile?.tenant_id || null);
    const { data, error } = await supabase.from('reward_points').select('*')
      .eq('pet_id', petId).eq('tenant_id', pet.tenant_id).order('created_at', { ascending: false });
    if (error) throw error;
    return {
      ...pet, rewardPoints: data || [],
      rewardPointsTotal: (data || []).reduce((sum, item) => sum + Number(item.points || 0), 0),
    };
  } catch (error) {
    throw new Error(`Non riesco a caricare il pet: ${error.message}`);
  }
};

export const getClientCardByToken = async (qrToken) => {
  if (!qrToken) throw new Error('QR token non valido');
  const { tenantId } = await requireStaff();
  const { data, error } = await supabase.from('pets').select(PET_SELECT)
    .eq('tenant_id', tenantId).eq('qr_token', qrToken).single();
  if (error) throw new Error(`Non riesco a caricare la card: ${error.message}`);
  const pet = mapPet(data);
  const [{ data: nextAppointment }, { data: points, error: pointsError }] = await Promise.all([
    supabase.from('appointments').select('id, scheduled_at, duration_minutes, status, notes')
      .eq('pet_id', pet.id).gte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1).maybeSingle(),
    supabase.from('reward_points').select('points').eq('pet_id', pet.id),
  ]);
  if (pointsError) throw pointsError;
  return {
    ...pet, nextAppointment: nextAppointment || null, lastVisit: pet.visits[0] || null,
    visitsCount: pet.visits.length,
    rewardPointsTotal: (points || []).reduce((sum, item) => sum + Number(item.points || 0), 0),
  };
};

export const getPublicPetCardByToken = async (qrToken) => {
  if (!qrToken) throw new Error('QR token non valido');
  const { data, error } = await supabase.rpc('get_public_pet_card', { p_qr_token: qrToken });
  if (error) throw new Error(`Non riesco a caricare la card pubblica: ${error.message}`);
  if (!data) throw new Error('Card cliente non disponibile');
  return data;
};

export const getPublicSalonIdentity = async () => {
  const { data, error } = await supabase.rpc('get_public_salon_identity', {
    p_tenant_slug: PILOT_TENANT_SLUG,
  });
  if (error) throw new Error(`Non riesco a caricare il contatto del salone: ${error.message}`);
  return data || null;
};

export const getRevenueReportData = async ({ from = null, to = null } = {}) => {
  if (Boolean(from) !== Boolean(to)) throw new Error('Intervallo report incompleto');
  const { tenantId } = await requireStaff();
  let query = supabase.from('visits').select(`
    id, pet_id, tenant_id, date, treatments, issues, cost, discount_percent,
    pet:pets(id, name, breed, photo_url, customer:customers(id, first_name, last_name, phone))
  `).eq('tenant_id', tenantId);
  if (from && to) query = query.gte('date', from).lte('date', to);
  const { data, error } = await query.order('date');
  if (error) throw new Error(`Non riesco a caricare il report incassi: ${error.message}`);
  return (data || []).map((visit) => {
    const pet = mapPet(relation(visit.pet));
    return { ...visit, pet, client: pet };
  });
};
