# Schema Dati — Grooming Hub

## Entità e Relazioni

### 1. Tabella `clients` (Clienti / Cani)
Rappresenta i cani gestiti dall'utente.

| Campo | Tipo | Note |
|-------|------|------|
| `id` | TEXT/UUID | Identificatore unico (generato con Math.random().toString(36).substr(2, 9) nell'app mobile) |
| `name` | TEXT | Nome del cane (obbligatorio) |
| `breed` | TEXT | Razza del cane (opzionale) |
| `owner` | TEXT | Nome del proprietario (obbligatorio) |
| `phone` | TEXT | Telefono del proprietario (opzionale) |
| `notes` | TEXT | Note libere (allergie, preferenze, caratteristiche) |
| `photo` | TEXT | URI/base64 della foto del cane (opzionale) |
| `createdAt` | TIMESTAMP | Data/ora creazione (auto-generata) |

**Vincoli:**
- `name` e `owner` sono obbligatori
- `id` è chiave primaria
- Nella versione multi-utente: aggiungere `user_id` per collegare al profilo utente

---

### 2. Tabella `visits` (Visite)
Rappresenta ogni singola visita/grooming del cane.

| Campo | Tipo | Note |
|-------|------|------|
| `id` | TEXT/UUID | Identificatore unico |
| `clientId` | TEXT/UUID | Riferimento al cliente (chiave esterna) |
| `date` | TEXT | Data della visita in formato YYYY-MM-DD |
| `treatments` | TEXT | Descrizione dei trattamenti eseguiti (opzionale) |
| `issues` | TEXT | Problematiche riscontrate durante la visita (opzionale) |
| `cost` | REAL/DECIMAL | Costo della visita (obbligatorio, es. 25.50) |
| `createdAt` | TIMESTAMP | Data/ora registrazione (auto-generata) |

**Vincoli:**
- `cost` è obbligatorio
- `clientId` è chiave esterna che riferisce `clients(id)`
- Relazione 1:N (un cliente ha molte visite)
- Eliminare un cliente elimina in cascata tutte le sue visite

---

## Relazioni

```
clients (1) ----< visits (*)
  id              clientId
```

Un cliente può avere 0..* visite.
Una visita appartiene a esattamente 1 cliente.

---

## Osservazioni sulla Migrazione

### Tipo ID: TEXT → UUID
Nell'app mobile gli ID sono generati come stringhe casuali:
```javascript
Math.random().toString(36).substr(2, 9)
```

In Supabase PostgreSQL è preferibile usare UUID per:
- Distribuzione geografica
- Compatibilità con crittografia
- Sicurezza

**Strategia migrazione:**
Durante l'import del JSON, mantenere gli ID originali come stringhe, oppure generare UUIDs nuovi e aggiornare i riferimenti nei dati esportati.

### Campo photo
Attualmente memorizzato come base64 (stringa) direttamente nel database.

**Opzioni per Supabase:**
1. **Semplice:** Mantenere come stringa base64 (non scalabile per molte foto)
2. **Consigliato:** Usare Supabase Storage e memorizzare solo il path/URL della foto nel database
3. **Alternativa:** Servizio CDN esterno (Cloudinary, ImgBB) e memorizzare URL

---

## Tipi di Dato SQL (PostgreSQL)

Mapping tra SQLite (app mobile) e PostgreSQL (Supabase):

| SQLite | PostgreSQL | Uso |
|--------|-----------|-----|
| TEXT PRIMARY KEY | UUID PRIMARY KEY DEFAULT gen_random_uuid() | ID univoci |
| TEXT | VARCHAR(255) / TEXT | Testi brevi e lunghi |
| REAL | DECIMAL(10,2) / NUMERIC | Costi monetari |
| TIMESTAMP | TIMESTAMP WITH TIME ZONE DEFAULT NOW() | Timestamp |
| FOREIGN KEY | REFERENCES table(column) | Integrità referenziale |

---

## Estensione: Profili Utente (per webapp multi-utente)

Nella versione mobile non c'è autenticazione esplicita. Per la webapp:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  business_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE visits -- non serve, ereditato tramite clientId
```

Ogni cliente apparterrà a uno specifico utente autenticato.

---

## Riepilogo Cardinalità

| Entità | Campi | Relazioni |
|--------|-------|-----------|
| clients | 8 | 1:N con visits |
| visits | 7 | N:1 con clients |

**Totale campi:** 15
**Tabelle:** 2
**Relazioni:** 1
