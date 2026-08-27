# Consegna GH-23 - Verifica della veste staff

**Esito:** completato con una correzione e una assunzione del mandato non verificata
**Data:** 27 agosto 2026
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Branch:** `feat/customer-app`
**Base Git:** `9f25c67ec3d8b35748fc7d1d9d70adf0e0207fb4`
**Commit:** presente commit; hash finale riportato nella risposta di consegna per evitare un riferimento circolare nel file committato.

## Perimetro ricevuto

Eseguito il mandato `GH-23-verifica-veste-staff.md` sul solo progetto demo
`grooming-hub-demo` (`qttpinkslhenxrsbhhhg`). Verificate le superfici staff a
1440, 390 e 320 px, i flussi reali richiesti e le geometrie gia misurate in
GH-17/GH-20. Nessuna migration, nessuna modifica a query, mutazioni, route o
copy semantico; produzione e progetto temporaneo non consultati. Nessun deploy
e nessun push.

## File inclusi

| File | Stato | Funzione nella consegna |
|---|---|---|
| `docs/incarichi/GH-23-verifica-veste-staff.md` | acquisito | Mandato ricevuto, non modificato da Codex. |
| `docs/consegne/GH-23-verifica-veste-staff-esito.md` | nuovo | Registro unico, misure, eccezioni e proposta a Cowork. |
| `src/apps/staff/pages/Dashboard.jsx` | modificato | Nome accessibile stabile `Esci` sul pulsante logout quando l'etichetta visiva e nascosta. |
| `src/apps/staff/styles/gh15-staff.css` | modificato | Minimo condiviso di larghezza touch sul `HeroButton` sotto 640 px. |

`scripts/salva.sh` era gia modificato all'ingresso da Cowork, come autorizzato
da Luigi nei mandati precedenti: non e stato letto come input operativo, messo
in stage o incluso nel commit GH-23.

## Matrice dodici superfici per tre larghezze

Ogni cella `PASS` significa: nessun overflow orizzontale di pagina, nessuna
sovrapposizione o overlay Vite, nessun alert applicativo e, sotto 640 px,
nessun controllo visibile sotto 44 px. I log successivi al login reale non
contengono errori.

| Superficie | 1440 px | 390 px | 320 px |
|---|---|---|---|
| `LoginForm` | PASS | PASS | PASS |
| `Contacts` | PASS | PASS | PASS |
| `AddClient` | PASS | PASS | PASS |
| `DailyAppointments` | PASS | PASS | PASS |
| `CustomerRequests` + dialog conferma | PASS | PASS | PASS |
| `ClientCard` pagina | PASS | PASS | PASS |
| `ClientCard` componente | N/A: non raggiungibile | N/A: non raggiungibile | N/A: non raggiungibile |
| `VisitCard` componente | N/A: non raggiungibile | N/A: non raggiungibile | N/A: non raggiungibile |
| Dashboard | PASS | PASS | PASS |
| Scheda cliente | PASS | PASS | PASS |
| Form visita | PASS | PASS | PASS |
| Calendario | PASS | PASS | PASS |

Le due righe `N/A` non sono fallimenti visivi: sono un errore nell'assunzione
del mandato secondo cui dodici superfici sono raggiungibili. La ricerca
esaustiva nel repository trova zero import e zero consumer per
`src/apps/staff/components/ClientCard.jsx` e
`src/apps/staff/components/VisitCard.jsx`; non esiste una route che li monti.
La pagina omonima `pages/ClientCard.jsx` e invece raggiungibile dalla scheda
cliente ed e stata verificata alle tre larghezze.

## Flussi funzionali

| Controprova | Esito misurato |
|---|---|
| Login staff reale | Invio del form con `staff.sonda@test.example`; sessione creata, routing a `/dashboard`, archivio caricato. Nessuna credenziale registrata nel repository. |
| AddClient, baseline | `7` customer, `7` pet, `0` marker GH-23. |
| AddClient, gesto reale | Creati `[DEMO GH-23] Verify Owner` e `[DEMO GH-23] Verify Pet`; dashboard a `8`, record visibile in elenco e scheda completa con telefono, razza e note corretti. |
| AddClient, fallimento forzato | RPC atomica invocata come staff con `pets.sex = x`: rifiuto PostgreSQL `23514`; customer orfano `0`, pet `0`. |
| AddClient, cleanup | Rimossi pet e customer marcati; stato finale `7` customer, `7` pet, residui sui tre telefoni GH-23 `0`. |
| Rubrica, lead senza pet | Creato dal form reale `[DEMO GH-23] Lead Owner`: `Lead 1`, `Da associare`, azioni WhatsApp/Aggiungi pet/Segna contattato/Archivia presenti; poi rimosso, residui `0`. |
| Rubrica, multi-pet | Mario Rossi mostra Luna e Pepe in un selettore esplicito; selezionato Pepe e aperta la scheda `869bf0fc-...`. |
| Rubrica, WhatsApp | Il gesto reale sul lead produce nessun errore applicativo; l'IAB blocca la nuova scheda. Controprova del generatore via runtime Vite: host `wa.me`, telefono normalizzato, testo con proprietario e pet. |
| Rubrica, tabella legacy | Nessuna chiamata `.from('contacts')` o `.from("contacts")` in `src/apps/staff`. |
| Richieste clienti | `2` richieste pendenti visibili. Il dialog `Approva e WhatsApp` si apre con giorno, ora e durata `90`; chiuso con Annulla, nessuna mutazione. |
| Operativita giornaliera | Route raggiunta dal gesto Dashboard; data corrente, contatori e stato vuoto coerenti, senza errori o mutazioni. Il demo contiene inoltre appuntamenti storici approvati, incluso il 25/05/2026. |
| ClientCard pagina | Aperta dalla scheda di Rocky tramite QR reale `ghc_d3e38b437cab46cfa9`; dati, codice, QR e azioni visibili alle tre larghezze. |
| Console | Errori dopo il login reale: `0`. I soli errori precedenti appartengono ai tentativi iniziali di aprire route protette prima dell'idratazione Auth; il login successivo e l'intero giro non ne producono. |

## Confronto proprieta GH-17 e GH-20

| Superficie | Proprieta confrontate | 1440 px | 390 px | 320 px | Esito |
|---|---|---|---|---|---|
| Dashboard | hero, H1, righe cliente, tile, stat strip, ordine/stati, logout | hero `117`, H1 `32px`, riga `44`, tile `180`, stat 3 colonne, logout `73x38` | hero `97`, H1 `25px`, riga `61`, tile `152`, stat 1 colonna, logout `46x46` | hero `116`, H1 `25px`, riga `61`, tile `152`, stat 1 colonna, logout `46x46` | PASS dopo correzione logout |
| Scheda cliente | hero, H1, numero pannelli, righe visite, colonne, ordine azioni | hero `117`, H1 `32px`, 8 pannelli, riga visita `52` | hero `97`, H1 `25px`, 8 pannelli, riga visita `60` | hero `116`, H1 `25px`, 8 pannelli, riga visita `60` | PASS; azioni Modifica, Appuntamento, WhatsApp, QR Card, Elimina invariate |
| Form visita | pannello, scorrimento, titolo, controlli, stati data, azioni | dialog `620x686`, `overflow-y:auto` | dialog `390x844`, `overflow-y:auto` | dialog `320x844`, `overflow-y:auto` | PASS; nessun controllo mobile sotto 44 px |
| Calendario | hero, H1, colonna giorno, strip mobile, FAB, scorrimento locale, stati chiusura | hero `117`, H1 `32px`, giorno `744x67`, FAB nascosto | hero `135`, H1 `25px`, strip `362x71` con `overflow-x:auto`, FAB `56x56` | hero `191`, H1 `25px`, strip `292x71` con `overflow-x:auto`, FAB `56x56` | PASS; domenica chiusa e lunedi mattina chiusa restano distinguibili |

Le misure sono in pixel salvo diversa indicazione. Gli scostamenti rispetto ai
contratti precedenti sono zero, eccetto il logout mobile trovato a `42x46` e
portato a `46x46` dal fix condiviso.

## Build e verifiche statiche

- `npm run build`: PASS, Vite 5.4.21, 144 moduli trasformati.
- `git diff --check`: PASS.
- Generatore WhatsApp caricato tramite runtime Vite: PASS su host, telefono e
  testo codificato.
- Ricerca consumer componenti e accessi `contacts` legacy: completata, esiti
  riportati sopra.
- `npm run lint`: non eseguibile, `eslint: command not found`; non sono state
  installate dipendenze fuori mandato.
- Warning build preesistenti: dati Browserslist non aggiornati e chunk
  principale oltre 500 kB.

## Fixture, sonda e ambienti

Le fixture `[DEMO GH-23]` sono state create solo sul demo e rimosse nella
stessa sessione. La sonda `staff.sonda@test.example` e stata smontata con
`scripts/rls-tests/teardown-staff-probe.sql`. Stato finale misurato: `0` in
`auth.users`, `auth.identities`, `profiles`, `tenant_memberships`, `customers`
e `pets`; nuovo login respinto con `invalid_credentials`. Nessun account reale
customer o operatore e stato modificato.

## Eccezioni, fuori istruzione e proposta a Cowork

- Correzione autorizzata dal mandato: minimo touch condiviso del `HeroButton`
  mobile e nome accessibile del logout. Nessuna variazione funzionale o di copy
  visibile.
- L'IAB non apre la nuova scheda esterna di WhatsApp; l'assenza di errore UI e
  la URL prodotta correttamente coprono il comportamento interno, ma non una
  navigazione esterna completa.
- Nessuna attivita fuori istruzione eseguita. Nessuna migration, push, deploy o
  accesso a produzione/progetto temporaneo.

**Soluzione consigliata a Cowork per i due componenti irraggiungibili:** aprire
un micro-mandato di pulizia e rimuovere `components/ClientCard.jsx` e
`components/VisitCard.jsx`, insieme ai soli selettori CSS dimostrati esclusivi,
se una nuova ricerca conferma ancora zero consumer. E la scelta raccomandata:
evita di mantenere e contare superfici morte. L'alternativa e integrarli in una
pagina reale soltanto se esiste un requisito prodotto, definendo prima quale
pagina e quale contratto dati; non va creata una route di prova per far tornare
la matrice. Controprove del micro-mandato: zero import prima, build verde dopo,
ricerca dei selettori CSS e giro delle pagine che oggi rendono righe cliente e
visite. Rischio residuo: consumer esterni al repository, al momento non
osservabili; per questo la rimozione richiede un mandato dedicato.
