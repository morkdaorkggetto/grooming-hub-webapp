import { supabase, getCurrentUser } from './supabaseClient';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Funzioni CRUD per Grooming Hub
 * Migrate dalla versione mobile (SQLite) a Supabase (PostgreSQL)
 *
 * Tutte le funzioni usano async/await e includono error handling
 * RLS policies assicurano che ogni utente veda solo i propri dati
 */

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
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Validazione base
    if (!clientData.name || !clientData.owner) {
      throw new Error('Nome e proprietario sono obbligatori');
    }

    const clientId = generateId();

    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: clientId,
        user_id: user.id,
        name: clientData.name,
        breed: clientData.breed || null,
        owner: clientData.owner,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        photo: clientData.photo || null,
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
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Validazione
    if (!clientData.name || !clientData.owner) {
      throw new Error('Nome e proprietario sono obbligatori');
    }

    // Verifica che il cliente appartenga all'utente (sicurezza)
    const { data: client, error: checkError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (checkError || client.user_id !== user.id) {
      throw new Error('Accesso negato: questo cliente non ti appartiene');
    }

    const { error } = await supabase
      .from('clients')
      .update({
        name: clientData.name,
        breed: clientData.breed || null,
        owner: clientData.owner,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        photo: clientData.photo || null,
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
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Validazione
    if (!visitData.cost || visitData.cost <= 0) {
      throw new Error('Il costo è obbligatorio e deve essere > 0');
    }

    // Verifica che il cliente appartenga all'utente
    const { data: client, error: checkError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (checkError || client.user_id !== user.id) {
      throw new Error('Accesso negato: questo cliente non ti appartiene');
    }

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
    const user = await getCurrentUser();
    if (!user) throw new Error('Utente non autenticato');

    // Verifica ownership del cliente
    const { data: client, error: checkError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (checkError || client.user_id !== user.id) {
      throw new Error('Accesso negato: questa visita non ti appartiene');
    }

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
