# Specifica API — Operazioni CRUD

Tutte le seguenti funzioni sono presenti in `grooming-app/database.js` e devono essere migrate a `webapp/src/lib/database.js` per usare Supabase anziché SQLite.

---

## Funzioni di Database (Exported)

### Inizializzazione

#### `initializeDatabase()`
**Firma:** `initializeDatabase() → void`
**Descrizione:** Crea le tabelle se non esistono (CREATE TABLE IF NOT EXISTS)
**Esecuzione:** Sincrona nella versione mobile, asincrona (async/await) nella webapp
**Dipendenza:** Deve essere chiamata al startup dell'app

---

### Operazioni su CLIENTS

#### `getAllClients()`
**Firma:** `getAllClients() → Promise<Client[]>`
**Descrizione:** Restituisce lista di tutti i clienti con visite associate
**Logica:**
```
SELECT * FROM clients ORDER BY name ASC
Per ogni client:
  SELECT * FROM visits WHERE clientId = client.id ORDER BY date DESC
```
**Outcome:** Array di oggetti client arricchiti con array `visits`
**Uso:** Caricamento lista in ClientsListScreen

**Tipo Client:**
```typescript
interface Client {
  id: string;
  name: string;
  breed?: string;
  owner: string;
  phone?: string;
  notes?: string;
  photo?: string;
  createdAt: string;
  visits: Visit[];
}
```

---

#### `addClient(clientData)`
**Firma:** `addClient(clientData: ClientInput) → Promise<string>` (restituisce l'ID creato)
**Descrizione:** Aggiunge un nuovo cliente al database
**Input:**
```typescript
interface ClientInput {
  name: string;        // obbligatorio
  breed?: string;
  owner: string;       // obbligatorio
  phone?: string;
  notes?: string;
  photo?: string;      // base64 o URL
}
```
**Logica:** Genera ID unico, inserisce record, restituisce ID
**Validazione (lato UI):** name e owner non vuoti
**Uso:** Form aggiunta cliente in ClientsListScreen

---

#### `updateClient(clientId, clientData)`
**Firma:** `updateClient(clientId: string, clientData: ClientInput) → Promise<void>`
**Descrizione:** Modifica dati di un cliente esistente
**Logica:** UPDATE clients SET ... WHERE id = clientId
**Campi aggiornabili:** name, breed, owner, phone, notes, photo
**Validazione:** name e owner non vuoti
**Uso:** Form modifica in ClientDetailScreen

---

#### `deleteClient(clientId)`
**Firma:** `deleteClient(clientId: string) → Promise<void>`
**Descrizione:** Elimina un cliente e tutte le sue visite (cascata)
**Logica:**
```
DELETE FROM visits WHERE clientId = ?
DELETE FROM clients WHERE id = ?
```
**Conferma utente:** Alert con messaggio "Eliminerai il cliente e tutte le sue visite"
**Uso:** Pulsante elimina in ClientDetailScreen

---

### Operazioni su VISITS

#### `addVisit(clientId, visitData)`
**Firma:** `addVisit(clientId: string, visitData: VisitInput) → Promise<string>`
**Descrizione:** Aggiunge una nuova visita per un cliente
**Input:**
```typescript
interface VisitInput {
  date: string;           // YYYY-MM-DD
  treatments?: string;
  issues?: string;
  cost: number | string;  // obbligatorio, euro
}
```
**Logica:** Genera ID unico, inserisce record con clientId, restituisce ID
**Validazione:** cost non vuoto e > 0
**Uso:** Form nuova visita in ClientDetailScreen

**Tipo Visit:**
```typescript
interface Visit {
  id: string;
  clientId: string;
  date: string;
  treatments?: string;
  issues?: string;
  cost: number;
  createdAt: string;
}
```

---

#### `deleteVisit(visitId)`
**Firma:** `deleteVisit(visitId: string) → Promise<void>`
**Descrizione:** Elimina una singola visita
**Logica:** DELETE FROM visits WHERE id = ?
**Conferma utente:** Alert "Sei sicuro?"
**Uso:** Pulsante elimina in ogni visit card in ClientDetailScreen

---

### Operazioni Speciali

#### `exportData()`
**Firma:** `exportData() → Promise<string>` (restituisce fileUri)
**Descrizione:** Esporta tutti i dati (clienti + visite) in JSON
**Logica:**
```javascript
const clients = getAllClients();
const json = JSON.stringify(clients, null, 2);
Salva in file: grooming-backup-YYYY-MM-DD.json
Return fileUri;
```
**Outcome:** File JSON contenente array di clienti con visite annidate
**Uso:** Backup/export in SettingsScreen

**Formato JSON:**
```json
[
  {
    "id": "...",
    "name": "Bau",
    "breed": "Labrador",
    "owner": "Luigi",
    "phone": "3331234567",
    "notes": "Allergie a X",
    "photo": "data:image/jpeg;base64,...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "visits": [
      {
        "id": "...",
        "clientId": "...",
        "date": "2024-01-15",
        "treatments": "Bagno e asciugatura",
        "issues": null,
        "cost": 35.50,
        "createdAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
]
```

---

## Migrazione verso Supabase

### Mapping SQLite → Supabase

| Operazione SQLite | Operazione Supabase |
|---|---|
| `db.openDatabaseSync('grooming.db')` | `supabase.from('table')` |
| `db.getAllSync('SELECT ...')` | `await supabase.from('table').select('*')` |
| `db.runSync('INSERT ...')` | `await supabase.from('table').insert({...})` |
| `db.runSync('UPDATE ...')` | `await supabase.from('table').update({...}).eq('id', id)` |
| `db.runSync('DELETE ...')` | `await supabase.from('table').delete().eq('id', id)` |

### Pattern async/await (webapp)

**Esempio addClient:**
```javascript
// Mobile (sincrono)
export const addClient = (clientData) => {
  const id = Math.random().toString(36).substr(2, 9);
  db.runSync(
    'INSERT INTO clients (...) VALUES (...)',
    [id, clientData.name, ...]
  );
  return id;
};

// Webapp (asincrono)
export const addClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      id: crypto.randomUUID(),
      name: clientData.name,
      ...
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};
```

---

## Error Handling

### Validazione Lato Client (UI)
- name e owner obbligatori
- cost obbligatorio e > 0
- date in formato valido YYYY-MM-DD

### Error Handling Lato Server (Supabase)
- Tutte le funzioni devono avere try/catch
- Sollevare eccezioni leggibili ("Non riesco a caricare i clienti")
- Alert all'utente in caso di errore

**Esempio:**
```javascript
try {
  const data = await getAllClients();
  setClients(data);
} catch (error) {
  console.error(error);
  Alert.alert('Errore', 'Non riesco a caricare i clienti');
}
```

---

## Performance & Ottimizzazioni

### Query Attuali (potenzialmente inefficienti)
1. `getAllClients()` carica TUTTI i clienti con visite → N+1 query problem

### Ottimizzazioni per Supabase
1. Usare `.select('*, visits(*)')` per join in una query
2. Implementare pagination per liste lunghe
3. Cachare dati frequentemente acceduti (React Context o React Query)
4. Lazy-load visite solo quando cliente visualizzato

---

## Riepilogo Funzioni

| Funzione | Input | Output | Sincrono? | Uso |
|---|---|---|---|---|
| `initializeDatabase()` | — | void | Sync → Async | Startup |
| `getAllClients()` | — | Client[] | Sync → Async | Load lista |
| `addClient(data)` | ClientInput | string (id) | Sync → Async | Add form |
| `updateClient(id, data)` | string, ClientInput | void | Sync → Async | Edit form |
| `deleteClient(id)` | string | void | Sync → Async | Delete btn |
| `addVisit(id, data)` | string, VisitInput | string (id) | Sync → Async | Visit form |
| `deleteVisit(id)` | string | void | Sync → Async | Delete visit btn |
| `exportData()` | — | string (fileUri) | Async | Backup |

**Totale funzioni:** 8
**Totale tabelle:** 2
**Totale campi:** 15
