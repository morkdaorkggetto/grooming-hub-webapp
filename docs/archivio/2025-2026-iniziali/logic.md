# Logica di Business — Grooming Hub

## Flussi Operativi Principali

### 1. Gestione Clienti

#### Aggiungere un Cliente
**Dove:** `ClientsListScreen.js` (handleAddClient)
**Campi obbligatori:** `name`, `owner`
**Campi opzionali:** `breed`, `phone`, `notes`, `photo`
**Validazione:** Se mancano name o owner, mostra Alert "Compila almeno nome e proprietario"
**Outcome:** Nuovo cliente aggiunto alla lista, modal chiuso, form ripulito

#### Elencare Clienti
**Dove:** `ClientsListScreen.js` (loadClients)
**Logica:**
- Carica tutti i clienti ordinati alfabeticamente per nome
- Carica per ogni cliente tutte le sue visite associate
- Espone il conteggio delle visite

#### Visualizzare Dettagli Cliente
**Dove:** `ClientDetailScreen.js` (loadClient)
**Informazioni mostrate:**
- Nome, razza, proprietario, telefono, note
- Foto (se presente)
- Conteggio visite
- **Promozione attiva** (vedi sezione Promozioni)
- Elenco visite ordinate per data decrescente

#### Modificare Cliente
**Dove:** `ClientDetailScreen.js` (handleUpdateClient)
**Campi modificabili:** name, breed, owner, phone, notes, photo
**Validazione:** name e owner obbligatori
**Outcome:** Dati aggiornati nel database, dettagli schermata aggiornati

#### Eliminare Cliente
**Dove:** `ClientDetailScreen.js` (handleDeleteClient)
**Comportamento:** Richiede conferma utente (Alert)
**Cascata:** Elimina il cliente e tutte le sue visite associate
**Outcome:** Torna alla lista clienti

---

### 2. Gestione Visite

#### Aggiungere Visita
**Dove:** `ClientDetailScreen.js` (handleAddVisit)
**Campi:**
- `date`: Data della visita (default: data odierna in formato YYYY-MM-DD)
- `treatments`: Descrizione trattamenti eseguiti (opzionale)
- `issues`: Problematiche riscontrate (opzionale)
- `cost`: Costo della visita (obbligatorio)

**Validazione:** Se manca il costo, mostra Alert "Inserisci il costo"
**Outcome:** Nuova visita aggiunta, modal chiuso, dettagli cliente aggiornati

#### Elimina Visita
**Dove:** `ClientDetailScreen.js` (handleDeleteVisit)
**Comportamento:** Richiede conferma (Alert)
**Outcome:** Visita eliminata, storico clienti aggiornato

---

### 3. Sistema di Promozioni (Loyalty/Sconti)

**Logica:** Basata sul numero totale di visite di un cliente

| Numero Visite | Sconto | Messaggio UI |
|---|---|---|
| 0 | — | — (nessun card) |
| 1-4 | — | "X visite per lo sconto!" |
| 5-9 | 10% | "🌟 Sconto 10%!" |
| ≥10 | 20% | "🎉 Sconto 20%!" |

**Dove:** `ClientDetailScreen.js` (getPromotionInfo)
**Rendering:** Card arancione (backgroundColor: '#f59e0b') visibile in `ClientDetailScreen.jsx`
**Nota:** La logica di sconto è puramente informativa (lato client). Non influenza il costo registrato delle visite.

**Implementazione nella webapp:**
- Mostrare il badge di promozione nel dettaglio cliente
- Opzionalmente, permettere di applicare automaticamente lo sconto al costo della visita
- Tracciare gli sconti concessi in un campo aggiuntivo `discountApplied` nelle visite

---

### 4. Gestione Foto

#### Libreria Utilizzata (mobile)
- `expo-image-picker` per selezionare foto da libreria o fotocamera
- La foto viene convertita in base64 e memorizzata direttamente nel database

#### Flusso
1. Utente preme pulsante "Scegli foto" o "Carica foto"
2. ImagePicker apre libreria/fotocamera
3. Utente seleziona/scatta immagine
4. Immagine viene compressa (quality: 0.7) e convertita a base64
5. Stringa base64 memorizzata nel campo `photo`

#### Questioni per la Webapp
- **Storage locale base64:** Non scalabile per molte foto (⚠️)
- **Alternativa:** Usare Supabase Storage e memorizzare solo il path nel database
- **Fallback UI:** Se foto non presente, mostrare iniziale del nome o icona cane

---

### 5. Export/Backup Dati

**Dove:** `SettingsScreen.js` (handleBackup)
**Librerie:** `expo-file-system`, `expo-sharing`
**Flusso:**
1. Chiama `exportData()` che legge tutti i clienti con visite
2. Serializza in JSON
3. Salva file con nome `grooming-backup-YYYY-MM-DD.json`
4. Condivide tramite "Share" nativo (email, cloud storage, ecc.)

**Contenuto JSON:**
```json
[
  {
    "id": "abc123",
    "name": "Bau",
    "breed": "Labrador",
    "owner": "Luigi",
    "phone": "123456789",
    "notes": "...",
    "photo": "data:image/jpeg;base64,...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "visits": [
      {
        "id": "xyz789",
        "clientId": "abc123",
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

## Dipendenze dalle Librerie Native

### Librerie Expo da Sostituire
1. **expo-sqlite** → Supabase PostreSQL API (async/await)
2. **expo-image-picker** → HTML5 `<input type="file">` o libreria web
3. **expo-file-system** → File API del browser o download JS
4. **expo-sharing** → Download file nel browser
5. **@react-navigation/native** → React Router v6 per web
6. **@react-navigation/native-stack** → react-router Stack
7. **@react-navigation/bottom-tabs** → Custom Tab component o React Router tabs
8. **MaterialCommunityIcons** → Icone web (Heroicons, Feather, Material UI Icons)
9. **react-native** → React standard

### Stili
- StyleSheet di RN → Tailwind CSS per web
- Colori core (vedi COWORK_INSTRUCTIONS.md) rimangono: `#d4a574`, `#faf3f0`, `#5a3a2a`, ecc.

---

## Regole di Validazione

### Client
- **name**: non vuoto, max 100 caratteri
- **owner**: non vuoto, max 100 caratteri
- **breed**: opzionale, max 50 caratteri
- **phone**: opzionale, pattern telefonico
- **notes**: opzionale, max 500 caratteri
- **photo**: opzionale, file immagine < 1MB (dopo compressione)

### Visit
- **date**: obbligatorio, formato YYYY-MM-DD, non futura
- **cost**: obbligatorio, numero > 0, max 2 decimali
- **treatments**: opzionale, max 500 caratteri
- **issues**: opzionale, max 500 caratteri

---

## Flusso Navigazione (Mobile)

```
Tab.Navigator
├── ClientsStackNavigator
│   ├── ClientsListScreen (lista clienti, FAB per aggiungere)
│   └── ClientDetailScreen (dettagli + visite + FAB per visita)
└── SettingsScreen (export + impostazioni)
```

Per la webapp: usare React Router con layout sidebar o navbar.

---

## Osservazioni sulla Migrazione

1. **Autenticazione:** App mobile è single-user. Webapp deve implementare login.
2. **Multi-user:** Ogni utente vede solo i propri clienti (RLS in Supabase).
3. **Foto:** Base64 nel database non scalabile. Usare Supabase Storage.
4. **Sync offline:** App mobile è offline-first (SQLite). Webapp sarà cloud-first (Supabase online).
5. **Promozioni:** Logica già implementata, semplicemente riadattarla alla webapp.
