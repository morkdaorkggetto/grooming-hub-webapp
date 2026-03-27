#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { randomUUID } from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMPORT_USER_ID = process.env.IMPORT_USER_ID;
const IMPORT_USER_EMAIL = process.env.IMPORT_USER_EMAIL;
const IMPORT_ID_PREFIX = process.env.IMPORT_ID_PREFIX || '';

const args = process.argv.slice(2);
const skipConfirm = args.includes('--yes');
const fileArg = args.find((arg) => !arg.startsWith('--'));
const DATA_DIR = path.join(process.cwd(), 'scripts', 'data');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Errore: variabili mancanti.');
  console.error('Richieste: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!IMPORT_USER_ID && !IMPORT_USER_EMAIL) {
  console.error('Errore: devi indicare IMPORT_USER_ID o IMPORT_USER_EMAIL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function parseExportPayload(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  throw new Error('Formato JSON non valido. Atteso array o oggetto con campo "data".');
}

function parseAppointmentsPayload(raw) {
  if (raw && Array.isArray(raw.appointments)) return raw.appointments;
  return [];
}

function normalizeId(id, fallback = randomUUID()) {
  return String(id || fallback);
}

function applyPrefix(id) {
  return IMPORT_ID_PREFIX ? `${IMPORT_ID_PREFIX}${id}` : id;
}

function generateQrToken() {
  return `ghc_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
}

function resolveFilePath(explicitPath) {
  if (explicitPath) return path.resolve(process.cwd(), explicitPath);
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Directory non trovata: ${DATA_DIR}`);
  }

  const jsonFiles = fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(DATA_DIR, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (!jsonFiles.length) {
    throw new Error(`Nessun JSON trovato in ${DATA_DIR}`);
  }
  return jsonFiles[0];
}

async function resolveUserId() {
  if (IMPORT_USER_ID) return IMPORT_USER_ID;

  const targetEmail = IMPORT_USER_EMAIL?.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Impossibile leggere utenti auth: ${error.message}`);
    }

    const users = data?.users || [];
    const found = users.find((u) => (u.email || '').toLowerCase() === targetEmail);
    if (found) return found.id;

    if (users.length < perPage) break;
    page += 1;
  }

  throw new Error(`Utente con email ${IMPORT_USER_EMAIL} non trovato in Auth.`);
}

function buildClientRows(clients, userId) {
  const sourceToTargetClientId = new Map();
  const rows = clients.map((client) => {
    const sourceId = normalizeId(client.id);
    const targetId = applyPrefix(sourceId);
    sourceToTargetClientId.set(sourceId, targetId);

    return {
      id: targetId,
      qr_token: client.qr_token || client.qrToken || generateQrToken(),
      user_id: userId,
      name: client.name || 'Senza nome',
      breed: client.breed || null,
      owner: client.owner || 'Sconosciuto',
      phone: client.phone || null,
      notes: client.notes || null,
      photo: client.photo || null,
      no_show_score: Number.isFinite(Number(client.no_show_score ?? client.noShowScore))
        ? Number(client.no_show_score ?? client.noShowScore)
        : 0,
      is_blacklisted: Boolean(client.is_blacklisted ?? client.isBlacklisted ?? false),
      created_at: client.created_at || client.createdAt || undefined,
      updated_at: client.updated_at || client.updatedAt || undefined,
    };
  });

  return { rows, sourceToTargetClientId };
}

function toVisitRows(clients, sourceToTargetClientId) {
  const rows = [];

  for (const client of clients) {
    const sourceClientId = normalizeId(client.id);
    const targetClientId = sourceToTargetClientId.get(sourceClientId) || applyPrefix(sourceClientId);
    const visits = Array.isArray(client.visits) ? client.visits : [];

    for (let index = 0; index < visits.length; index += 1) {
      const visit = visits[index];
      const sourceVisitId = normalizeId(visit.id, `${sourceClientId}-visit-${index}`);
      const targetVisitId = applyPrefix(sourceVisitId);
      const cost = Number(visit.cost);

      rows.push({
        id: targetVisitId,
        client_id: targetClientId,
        date: visit.date,
        treatments: visit.treatments || null,
        issues: visit.issues || null,
        cost: Number.isFinite(cost) ? cost : 0,
        discount_percent: Number.isFinite(Number(visit.discount_percent ?? visit.discountPercent))
          ? Number(visit.discount_percent ?? visit.discountPercent)
          : 0,
        created_at: visit.created_at || visit.createdAt || undefined,
        updated_at: visit.updated_at || visit.updatedAt || undefined,
      });
    }
  }

  return rows;
}

function toAppointmentRows(clients, sourceToTargetClientId, userId, topLevelAppointments = []) {
  const rows = [];

  const pushAppointment = (appointment, sourceClientId, fallbackIndex) => {
    const targetClientId =
      sourceToTargetClientId.get(sourceClientId) || applyPrefix(normalizeId(sourceClientId));

    const sourceAppointmentId = normalizeId(
      appointment.id,
      `${sourceClientId}-appointment-${fallbackIndex}`
    );
    const targetAppointmentId = applyPrefix(sourceAppointmentId);

    rows.push({
      id: targetAppointmentId,
      user_id: userId,
      client_id: targetClientId,
      scheduled_at: appointment.scheduled_at || appointment.scheduledAt,
      duration_minutes: Number(appointment.duration_minutes ?? appointment.durationMinutes) || 60,
      status: appointment.status || 'scheduled',
      notes: appointment.notes || null,
      external_calendar:
        appointment.external_calendar || appointment.externalCalendar || null,
      created_at: appointment.created_at || appointment.createdAt || undefined,
      updated_at: appointment.updated_at || appointment.updatedAt || undefined,
    });
  };

  for (const client of clients) {
    const sourceClientId = normalizeId(client.id);
    const appointments = Array.isArray(client.appointments) ? client.appointments : [];

    for (let index = 0; index < appointments.length; index += 1) {
      pushAppointment(appointments[index], sourceClientId, index);
    }
  }

  for (let index = 0; index < topLevelAppointments.length; index += 1) {
    const appointment = topLevelAppointments[index];
    if (!appointment.client_id && !appointment.clientId) continue;
    pushAppointment(appointment, normalizeId(appointment.client_id || appointment.clientId), index);
  }

  return rows;
}

async function upsertInBatches(table, rows, onConflict, batchSize = 200) {
  let total = 0;
  for (const batch of chunkArray(rows, batchSize)) {
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict });

    if (error) {
      throw new Error(`[${table}] ${error.message}`);
    }
    total += batch.length;
  }
  return total;
}

async function confirmProceed(filePath, clientsCount, visitsCount, userId) {
  if (skipConfirm) return true;

  console.log('');
  console.log('Importazione pronta:');
  console.log(`- File: ${filePath}`);
  console.log(`- Cliente target (user_id): ${userId}`);
  console.log(`- Clienti: ${clientsCount}`);
  console.log(`- Visite: ${visitsCount}`);
  console.log('- Modalita: upsert (aggiorna se ID gia esistente)');
  console.log(`- Prefix ID: ${IMPORT_ID_PREFIX || '(nessuno)'}`);

  const rl = readline.createInterface({ input, output });
  const answer = (await rl.question('Procedere? (si/no): ')).trim().toLowerCase();
  rl.close();

  return answer === 'si' || answer === 's';
}

async function main() {
  console.log('Grooming Hub - Import record verso Supabase');

  const filePath = resolveFilePath(fileArg);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(fileContent);
  const clients = parseExportPayload(parsed);
  const topLevelAppointments = parseAppointmentsPayload(parsed);
  const userId = await resolveUserId();

  const { rows: clientRows, sourceToTargetClientId } = buildClientRows(clients, userId);
  const visitRows = toVisitRows(clients, sourceToTargetClientId);
  const appointmentRows = toAppointmentRows(
    clients,
    sourceToTargetClientId,
    userId,
    topLevelAppointments
  );

  const ok = await confirmProceed(
    filePath,
    clientRows.length,
    visitRows.length + appointmentRows.length,
    userId
  );
  if (!ok) {
    console.log('Import annullato.');
    process.exit(0);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id' });

  if (profileError) {
    throw new Error(`Impossibile creare/aggiornare profilo: ${profileError.message}`);
  }

  const importedClients = await upsertInBatches('clients', clientRows, 'id');
  const importedVisits = visitRows.length
    ? await upsertInBatches('visits', visitRows, 'id')
    : 0;
  const importedAppointments = appointmentRows.length
    ? await upsertInBatches('appointments', appointmentRows, 'id')
    : 0;

  console.log('');
  console.log('Import completato con successo.');
  console.log(`- Clienti upsert: ${importedClients}`);
  console.log(`- Visite upsert: ${importedVisits}`);
  console.log(`- Appuntamenti upsert: ${importedAppointments}`);
}

main().catch((error) => {
  console.error(`Errore import: ${error.message}`);
  process.exit(1);
});
