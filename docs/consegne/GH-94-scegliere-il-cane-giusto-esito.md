# GH-94 - Scegliere il cane giusto: esito

## Esito

Mandato eseguito sulla base `ee9c00174598728293aa26cffbc346892d900faa`.
Il selettore mostra nome, razza, proprietario e foto del salone; senza foto
mostra l'iniziale. È usato sia in **Nuovo appuntamento** sia in **Registra
lavorazione**. Nessun database letto o scritto, nessun push/merge/deploy.

L'ultima visita non è stata aggiunta: `CALENDAR_PET_SELECT` non la carica e
avrebbe richiesto di ampliare la lettura, escluso dal mandato.

## File del commit

| File | Motivo |
|---|---|
| `src/apps/staff/components/CalendarKit.jsx` | Riga identificativa e uso opzionale della creazione al volo |
| `src/apps/staff/pages/Calendar.css` | Layout della sola voce elenco |
| `src/apps/staff/pages/Calendar.jsx` | Stesso selettore nel modale lavorazione |
| `docs/consegne/GH-94-scegliere-il-cane-giusto-esito.md` | Registro |
| `docs/consegne/evidenze/GH-94/browser-check.mjs` | Banco browser in memoria |
| `docs/consegne/evidenze/GH-94/browser.json` | Misure ed esiti |
| `docs/consegne/evidenze/GH-94/hash-check.mjs` | Generatore impronte |
| `docs/consegne/evidenze/GH-94/ui-invariants.sha256` | 68 coppie base/corrente |
| `docs/consegne/evidenze/GH-94/work-375.png` | Modale lavorazione mobile |
| `docs/consegne/evidenze/GH-94/appointment-1365.png` | Modale appuntamento desktop |

Fuori dal commit: i mandati GH-94/GH-96, `nomi-da-recuperare/`,
`qr-gadget/` e le due migrazioni autorizzate per il successivo GH-96.

## Controprove

- Con foto e razza: `Barboncino` / `Toy · 3296167453`, foto visibile.
- Senza foto: `barboncino` / `Nano · 3296167453`, iniziale `B`.
- Senza razza: `Luna` / `Razza non indicata · Paola Foto`, foto visibile.
- Senza foto né razza: `Nina` / `Razza non indicata · Paola Base`, iniziale `N`.
- I due `Barboncino` della stessa famiglia sono distinti da `Toy` e `Nano`.
- Ricerca verde per nome, proprietario, telefono e razza.
- Letture pet: **1** dopo il primo modale e ancora **1** dopo il secondo;
  `getCalendarPetOptions` non è stato modificato.
- A 375 e 1365 px, con 12 risultati: overflow **0**, troncamenti **0**,
  altezza minima bersaglio **58 px**.
- `rg -n "CalendarPetCombobox" src` trova la definizione e i due usi sopra.
- `src/apps/customer` è invariato; usa solo `owner_photo_url` del cliente e
  `photo_url` delle visite, non `pets.photo_url` del salone.
- Le 68 impronte differiscono soltanto nei tre file applicativi dichiarati.

Banco browser: **1,641 s**, nessun page error o accesso inatteso. Build:
**167 moduli**, Vite **1,27 s**, totale **1,814 s**, verde; soli avvisi noti
su `caniuse-lite` e chunk oltre 500 kB. Suite RLS non eseguita, come richiesto;
ultima misura dichiarata dal mandato: GH-91, 60 PASS.

Commit previsto: `fix: identify pets in calendar picker (GH-94)`; hash
risolvibile con `git log -1 --format=%H -- docs/consegne/GH-94-scegliere-il-cane-giusto-esito.md`.
