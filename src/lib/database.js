import { supabase, getCurrentUser } from './supabaseClient';
import { DEMO_MODE, DEMO_WRITE_BLOCK_MESSAGE } from './demoMode';
import { getFileExtensionFromName, getSafeImageMimeType } from './imageFiles';

const CLIENT_PHOTOS_BUCKET = 'client-photos';
const BLACKLIST_THRESHOLD = -3;
const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const generateQrToken = () => {
  const randomPart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 18)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  return `ghc_${randomPart}`;
};

const assertDemoWriteAllowed = () => {
  if (DEMO_MODE) {
    throw new Error(DEMO_WRITE_BLOCK_MESSAGE);
  }
};

const getFileExtension = (file) => {
  const extFromName = getFileExtensionFromName(file?.name || '');
  if (extFromName) return extFromName;

  const mime = file?.type || '';
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'image/heic') return 'heic';
  if (mime === 'image/heif') return 'heif';
  return 'jpg';
};

const getStoragePathFromPublicUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const marker = `/storage/v1/object/public/${CLIENT_PHOTOS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
};

const uploadClientPhoto = async (userId, clientId, file) => {
  const ext = getFileExtension(file);
  const filePath = `${userId}/${clientId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(CLIENT_PHOTOS_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: getSafeImageMimeType(file),
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(CLIENT_PHOTOS_BUCKET).getPublicUrl(filePath);

  return publicUrl;
};

const deleteClientPhotoByUrl = async (url) => {
  const path = getStoragePathFromPublicUrl(url);
  if (!path) return;

  const { error } = await supabase.storage
    .from(CLIENT_PHOTOS_BUCKET)
    .remove([path]);

  if (error) throw error;
};

const getOwnedClient = async (clientId, userId) => {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error || client.user_id !== userId) {
    throw new Error('Accesso negato: questo cliente non ti appartiene');
  }

  return client;
};

/**
 * Funzioni CRUD per Grooming Hub
 * Migrate dalla versione mobile (SQLite) a Supabase (PostgreSQL)
 *
 * Tutte le funzioni usano async/await e includono error handling
 * RLS policies assicurano che ogni utente veda solo i propri dati
 */
export const VALID_APPOINTMENT_STATUSES = [...APPOINTMENT_STATUSES];

/**
 * Carica tutti i clienti dell'utente corrente con le loro visite
 * @returns {Promise<Array>} Array di clienti con array visite annidate
 */
export const getAllClients = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Query principale: clienti ordinati per nome
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (clientsError) throw clientsError;

    // Per ogni cliente, carica le visite ordinate per data decrescente
    const clientsWithVisits = await Promise.all(
      clients.map(async (client) => {
        const { data: visits, error: visitsError } = await supabase
          .from('visits')
          .select('*')
          .eq('client_id', client.id)
          .order('date', { ascending: false });

        if (visitsError) throw visitsError;

        return {
          ...client,
          visits: visits || [],
        };
      })
    );

    return clientsWithVisits;
  } catch (error) {
    console.error('Errore nel caricamento clienti:', error.message);
    throw new Error(`Non riesco a caricare i clienti: ${error.message}`);
  }
};

/**
 * Aggiunge un nuovo cliente
 * @param {Object} clientData - Dati cliente { name, breed?, owner, phone?, notes?, photo? }
 * @returns {Promise<string>} ID del nuovo cliente
 */
export const addClient = async (clientData) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Validazione base
    if (!clientData.name || !clientData.owner) {
      throw new Error('Nome e proprietario sono obbligatori');
    }

    const clientId = generateId();
    const photoUrl = clientData.photoFile
      ? await uploadClientPhoto(user.id, clientId, clientData.photoFile)
      : null;

    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: clientId,
        qr_token: generateQrToken(),
        user_id: user.id,
        name: clientData.name,
        breed: clientData.breed || null,
        owner: clientData.owner,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        photo: photoUrl,
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Errore aggiungimento cliente:', error.message);
    throw new Error(`Non riesco ad aggiungere il cliente: ${error.message}`);
  }
};

/**
 * Modifica un cliente esistente
 * @param {string} clientId - ID cliente
 * @param {Object} clientData - Dati aggiornati
 * @returns {Promise<void>}
 */
export const updateClient = async (clientId, clientData) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Validazione
    if (!clientData.name || !clientData.owner) {
      throw new Error('Nome e proprietario sono obbligatori');
    }

    // Verifica che il cliente appartenga all'utente (sicurezza)
    const { data: client, error: checkError } = await supabase
      .from('clients')
      .select('user_id, photo')
      .eq('id', clientId)
      .single();

    if (checkError || client.user_id !== user.id) {
      throw new Error('Accesso negato: questo cliente non ti appartiene');
    }

    let nextPhotoUrl = client.photo || null;

    if (clientData.photoFile) {
      if (client.photo) {
        await deleteClientPhotoByUrl(client.photo);
      }
      nextPhotoUrl = await uploadClientPhoto(user.id, clientId, clientData.photoFile);
    } else if (clientData.removePhoto || clientData.photo === '') {
      if (client.photo) {
        await deleteClientPhotoByUrl(client.photo);
      }
      nextPhotoUrl = null;
    }

    const { error } = await supabase
      .from('clients')
      .update({
        name: clientData.name,
        breed: clientData.breed || null,
        owner: clientData.owner,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        photo: nextPhotoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (error) throw error;
  } catch (error) {
    console.error('Errore modifica cliente:', error.message);
    throw new Error(`Non riesco a modificare il cliente: ${error.message}`);
  }
};

/**
 * Elimina un cliente e tutte le sue visite (cascata)
 * @param {string} clientId - ID cliente
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Verifica ownership
    const { data: client, error: checkError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (checkError || client.user_id !== user.id) {
      throw new Error('Accesso negato: questo cliente non ti appartiene');
    }

    // Elimina visite associate (cascata manuale, oppure PostgreSQL ON DELETE CASCADE)
    const { error: visitsError } = await supabase
      .from('visits')
      .delete()
      .eq('client_id', clientId);

    if (visitsError) throw visitsError;

    // Elimina cliente
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (clientError) throw clientError;
  } catch (error) {
    console.error('Errore eliminazione cliente:', error.message);
    throw new Error(`Non riesco a eliminare il cliente: ${error.message}`);
  }
};

/**
 * Aggiunge una nuova visita per un cliente
 * @param {string} clientId - ID cliente
 * @param {Object} visitData - { date, treatments?, issues?, cost }
 * @returns {Promise<string>} ID della nuova visita
 */
export const addVisit = async (clientId, visitData) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Validazione
    if (!visitData.cost || visitData.cost <= 0) {
      throw new Error('Il costo è obbligatorio e deve essere > 0');
    }

    // Verifica che il cliente appartenga all'utente
    await getOwnedClient(clientId, user.id);

    const visitId = generateId();

    const { data, error } = await supabase
      .from('visits')
      .insert({
        id: visitId,
        client_id: clientId,
        date: visitData.date,
        treatments: visitData.treatments || null,
        issues: visitData.issues || null,
        cost: parseFloat(visitData.cost),
        discount_percent: visitData.discount_percent || 0,
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Errore aggiungimento visita:', error.message);
    throw new Error(`Non riesco ad aggiungere la visita: ${error.message}`);
  }
};

/**
 * Elimina una visita
 * @param {string} visitId - ID visita
 * @param {string} clientId - ID cliente (per verifica ownership)
 * @returns {Promise<void>}
 */
export const deleteVisit = async (visitId, clientId) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Verifica ownership del cliente
    await getOwnedClient(clientId, user.id);

    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId);

    if (error) throw error;
  } catch (error) {
    console.error('Errore eliminazione visita:', error.message);
    throw new Error(`Non riesco a eliminare la visita: ${error.message}`);
  }
};

/**
 * Aggiorna punteggio no-show del cliente.
 * La blacklist automatica scatta quando il punteggio arriva a -3 o meno.
 * @param {string} clientId
 * @param {number} delta - Valore positivo o negativo da sommare
 * @returns {Promise<Object>} { id, no_show_score, is_blacklisted }
 */
export const updateClientNoShowScore = async (clientId, delta) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    const client = await getOwnedClient(clientId, user.id);
    const parsedDelta = Number(delta);
    if (Number.isNaN(parsedDelta)) {
      throw new Error('Delta punteggio non valido');
    }

    const nextScore = (Number(client.no_show_score) || 0) + parsedDelta;
    const nextBlacklisted = nextScore <= BLACKLIST_THRESHOLD;

    const { data, error } = await supabase
      .from('clients')
      .update({
        no_show_score: nextScore,
        is_blacklisted: nextBlacklisted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select('id, no_show_score, is_blacklisted')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Errore aggiornamento no-show score:', error.message);
    throw new Error(`Non riesco ad aggiornare il punteggio: ${error.message}`);
  }
};

/**
 * Forza manualmente lo stato blacklist di un cliente.
 * @param {string} clientId
 * @param {boolean} isBlacklisted
 * @returns {Promise<Object>} { id, no_show_score, is_blacklisted }
 */
export const setClientBlacklistStatus = async (clientId, isBlacklisted) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    await getOwnedClient(clientId, user.id);

    const { data, error } = await supabase
      .from('clients')
      .update({
        is_blacklisted: !!isBlacklisted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select('id, no_show_score, is_blacklisted')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Errore aggiornamento blacklist:', error.message);
    throw new Error(`Non riesco ad aggiornare la blacklist: ${error.message}`);
  }
};

/**
 * Crea un appuntamento in calendario.
 * @param {Object} appointmentData
 * @returns {Promise<string>} appointment id
 */
export const addAppointment = async (appointmentData) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    const status = appointmentData.status || 'scheduled';
    if (!APPOINTMENT_STATUSES.includes(status)) {
      throw new Error('Stato appuntamento non valido');
    }

    if (!appointmentData.client_id || !appointmentData.scheduled_at) {
      throw new Error('Cliente e data appuntamento sono obbligatori');
    }

    await getOwnedClient(appointmentData.client_id, user.id);
    const appointmentId = generateId();

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        id: appointmentId,
        user_id: user.id,
        client_id: appointmentData.client_id,
        scheduled_at: appointmentData.scheduled_at,
        duration_minutes: Number(appointmentData.duration_minutes) || 60,
        status,
        notes: appointmentData.notes || null,
        external_calendar: appointmentData.external_calendar || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    if (status === 'no_show') {
      await updateClientNoShowScore(appointmentData.client_id, -1);
    }

    return data.id;
  } catch (error) {
    console.error('Errore creazione appuntamento:', error.message);
    throw new Error(`Non riesco a creare l'appuntamento: ${error.message}`);
  }
};

/**
 * Carica appuntamenti dell'utente.
 * @param {Object} filters - { from?, to? } ISO datetime
 * @returns {Promise<Array>}
 */
export const getAppointments = async (filters = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    let query = supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        client_id,
        scheduled_at,
        duration_minutes,
        status,
        notes,
        external_calendar,
        created_at,
        updated_at,
        client:clients(id, name, owner, phone, no_show_score, is_blacklisted)
      `)
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (filters.from) {
      query = query.gte('scheduled_at', filters.from);
    }
    if (filters.to) {
      query = query.lte('scheduled_at', filters.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Errore caricamento appuntamenti:', error.message);
    throw new Error(`Non riesco a caricare il calendario: ${error.message}`);
  }
};

/**
 * Aggiorna lo stato di un appuntamento.
 * Se passa a no_show applica penalità automatica cliente.
 * Se esce da no_show rimuove la penalità.
 * @param {string} appointmentId
 * @param {'scheduled'|'completed'|'cancelled'|'no_show'} status
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');
    if (!APPOINTMENT_STATUSES.includes(status)) {
      throw new Error('Stato appuntamento non valido');
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, user_id, client_id, status')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || appointment.user_id !== user.id) {
      throw new Error('Accesso negato: appuntamento non disponibile');
    }

    const previousStatus = appointment.status;
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select('id, client_id, status')
      .single();

    if (error) throw error;

    if (previousStatus !== 'no_show' && status === 'no_show') {
      await updateClientNoShowScore(appointment.client_id, -1);
    }

    if (previousStatus === 'no_show' && status !== 'no_show') {
      await updateClientNoShowScore(appointment.client_id, 1);
    }

    return data;
  } catch (error) {
    console.error('Errore aggiornamento stato appuntamento:', error.message);
    throw new Error(`Non riesco ad aggiornare lo stato: ${error.message}`);
  }
};

/**
 * Aggiorna data/ora e durata di un appuntamento esistente.
 * @param {string} appointmentId
 * @param {{ scheduled_at: string, duration_minutes?: number }} updates
 * @returns {Promise<Object>}
 */
export const updateAppointmentSchedule = async (appointmentId, updates) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    if (!updates?.scheduled_at) {
      throw new Error('La nuova data appuntamento è obbligatoria');
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, user_id, scheduled_at, duration_minutes, client_id')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || appointment.user_id !== user.id) {
      throw new Error('Accesso negato: appuntamento non disponibile');
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({
        scheduled_at: updates.scheduled_at,
        duration_minutes: Number(updates.duration_minutes) || appointment.duration_minutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select(`
        id,
        user_id,
        client_id,
        scheduled_at,
        duration_minutes,
        status,
        notes,
        external_calendar,
        created_at,
        updated_at,
        client:clients(id, name, owner, phone, no_show_score, is_blacklisted)
      `)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Errore aggiornamento orario appuntamento:', error.message);
    throw new Error(`Non riesco a spostare l'appuntamento: ${error.message}`);
  }
};

/**
 * Elimina un appuntamento.
 * @param {string} appointmentId
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    assertDemoWriteAllowed();
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, user_id')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || appointment.user_id !== user.id) {
      throw new Error('Accesso negato: appuntamento non disponibile');
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) throw error;
  } catch (error) {
    console.error('Errore eliminazione appuntamento:', error.message);
    throw new Error(`Non riesco a eliminare l'appuntamento: ${error.message}`);
  }
};

/**
 * Esporta tutti i clienti e le visite in formato JSON
 * Utilizzato per backup/share dati
 * @returns {Promise<Object>} Oggetto con clienti e visite annidate
 */
export const exportData = async () => {
  try {
    const clients = await getAllClients();
    return {
      exportDate: new Date().toISOString(),
      clientsCount: clients.length,
      visitsCount: clients.reduce((sum, c) => sum + (c.visits?.length || 0), 0),
      data: clients,
    };
  } catch (error) {
    console.error('Errore export dati:', error.message);
    throw new Error(`Non riesco a esportare i dati: ${error.message}`);
  }
};

/**
 * Calcola le informazioni di promozione per un cliente
 * Logica: 5 visite → 10%, 10+ visite → 20%
 * @param {Object} client - Oggetto cliente con array visite
 * @returns {Object} { count, discount, message }
 */
export const getClientPromos = (client) => {
  const count = client.visits?.length || 0;
  let discount = 0;
  let message = '';

  if (count >= 10) {
    discount = 20;
    message = '🎉 Sconto 20%!';
  } else if (count >= 5) {
    discount = 10;
    message = '🌟 Sconto 10%!';
  } else if (count > 0) {
    message = `${10 - count} ${count === 9 ? 'visita' : 'visite'} per lo sconto!`;
  }

  return { count, discount, message };
};

/**
 * Ottiene un singolo cliente per ID
 * @param {string} clientId - ID cliente
 * @returns {Promise<Object>} Oggetto cliente con visite
 */
export const getClientById = async (clientId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single();

    if (clientError) throw clientError;

    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (visitsError) throw visitsError;

    return {
      ...client,
      visits: visits || [],
    };
  } catch (error) {
    console.error('Errore caricamento cliente:', error.message);
    throw new Error(`Non riesco a caricare il cliente: ${error.message}`);
  }
};

/**
 * Ottiene i dati rapidi di una card cliente tramite qr_token.
 * Accessibile solo all'utente autenticato proprietario del cliente.
 * @param {string} qrToken
 * @returns {Promise<Object>}
 */
export const getClientCardByToken = async (qrToken) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');
    if (!qrToken) throw new Error('QR token non valido');

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('qr_token', qrToken)
      .eq('user_id', user.id)
      .single();

    if (clientError) throw clientError;

    const nowIso = new Date().toISOString();

    const [{ data: nextAppointment }, { data: lastVisit }, { count: visitsCount, error: visitsCountError }] =
      await Promise.all([
        supabase
          .from('appointments')
          .select('id, scheduled_at, duration_minutes, status, notes', { head: false })
          .eq('client_id', client.id)
          .gte('scheduled_at', nowIso)
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('visits')
          .select('id, date, treatments, issues, cost')
          .eq('client_id', client.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('visits')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', client.id),
      ]);

    if (visitsCountError) throw visitsCountError;

    return {
      ...client,
      nextAppointment: nextAppointment || null,
      lastVisit: lastVisit || null,
      visitsCount: visitsCount || 0,
    };
  } catch (error) {
    console.error('Errore caricamento card cliente:', error.message);
    throw new Error(`Non riesco a caricare la card cliente: ${error.message}`);
  }
};

/**
 * Restituisce il report incassi per una settimana/intervallo.
 * @param {{ from: string, to: string }} range - date in formato YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export const getWeeklyRevenueReport = async ({ from, to }) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');
    if (!from || !to) throw new Error('Intervallo date non valido');

    const { data, error } = await supabase
      .from('visits')
      .select(`
        id,
        client_id,
        date,
        treatments,
        issues,
        cost,
        discount_percent,
        client:clients(id, name, owner, user_id)
      `)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).filter((visit) => visit.client?.user_id === user.id);
  } catch (error) {
    console.error('Errore report settimanale incassi:', error.message);
    throw new Error(`Non riesco a caricare il report incassi: ${error.message}`);
  }
};
