# GH-109 — Interruzione alla definizione di «da fare»

**Esito: fermo al prerequisito, nessuna modifica applicativa.** La Home non ha una definizione unica e indipendente dalla composizione per le richieste da riprogrammare. Il mandato chiede di fermarsi su questa ambiguita; non ho scelto una nuova regola al suo posto.

## Base e metodo

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`; repository `webapp/`; HEAD `c71240dd35a9f104bc20981417801b136e192bc0`, coincidente con la base richiesta `c71240d`.
- Canone letto integralmente: corrente/adottato **1.2/1.2**. SHA-256 di `/Users/luigimaisto/Desktop/_metodo/CANONE.md`: `28a1c8d407c3bb624a4c0d499e14aee926472843e5192e3f70d4e961f8b82e71`.
- Mandato locale SHA-256 `f565c794960ef0137769b7f2dcc2f89b541c26648a80aef55f9fd4a92bfa5156`; contratto CD-11 SHA-256 `de9d6f84d4ffa135700f0509d2c0b632702cbffbbf3cba1e0a4e7e595ea89518`.
- Ora misurata all'avvio della ricognizione **2/10/2026 06:12:10 CEST**; fine prova **06:14:50**, intervallo **2m40s**. Lettura preliminare e redazione finale escluse. Nessun rallentamento significativo.
- Nessun database letto o scritto; nessuna fixture persistente, residui 0. Nessun push, merge o deploy.

## Definizioni misurate

Percorsi sotto `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`:

1. `src/apps/customer/components/PendingRequest.jsx:65`: proposta da scegliere quando ci sono alternative e `currentAlternativeResponse(current)` non riconosce una risposta corrente. L'helper in `src/apps/customer/lib/appointmentResponses.js:1` controlla risposta, timestamp del nuovo giro e appartenenza dello slot scelto. Questo criterio e riusabile. Le azioni facoltative «Cambia risposta» e «Correggi data» non significano necessariamente che il salone aspetti il cliente.
2. `src/apps/customer/pages/Home.jsx:137`: `rejectedRequest` e la **prima** riga `rejected`. Ma la scheda appare, a riga387, soltanto nel ramo **senza prossimo appuntamento e senza pending**. Non e lo stesso criterio di «tutte le richieste rejected da fare».
3. `src/apps/customer/hooks/useAppointmentRequests.js:25`: legge tutte le `pending/rejected`, ordinate per creazione; nessun filtro per richieste rifiutate superate. Non restituisce `approved/withdrawn`.
4. `src/apps/customer/lib/booking.js:16`: il wizard chiama `submit_appointment_request` senza identificativo della richiesta rifiutata. La definizione SQL versionata in `supabase/migrations/20260821090000_gh08_appointment_requests.sql:199` inserisce una nuova riga, non chiude la vecchia. Questa e una misura dei sorgenti locali, **non una verifica dello stato vivo**.

Ricerca eseguita: `rg -n 'da fare|currentAlternativeResponse|rejectedRequest|proposed_alternatives' src/apps/customer/pages/Home.jsx src/apps/customer/components/PendingRequest.jsx src/apps/customer/hooks/useAppointmentRequests.js src/apps/customer/lib`; lettura dei rami e del percorso di invio; `rg -n 'submit_appointment_request' supabase --glob '*.sql'`.

## Controprova minima

Comando dalla root applicativa: `node docs/consegne/evidenze/GH-109/preflight.mjs`. Uscita0, prova sintetica della precedenza dei rami, con guardie sui frammenti del sorgente. L'helper delle risposte e importato dal prodotto; nessun browser o database simulato come reale.

| Caso | Rifiutate restituite | Schede di riprogrammazione visibili oggi |
|---|---:|---:|
| Solo una rifiutata | 1 | 1 |
| Rifiutata + nuova pending dello stesso pet | 1 | 0 |
| Rifiutata + prossimo appuntamento | 1 | 0 |
| Due rifiutate | 2 | 1 |

**Conflitto operativo:** mantenere la precedenza attuale puo nascondere gesti di altri pet; elencare tutte le rifiutate puo lasciare l'avviso acceso dopo una nuova richiesta e riesumare rifiuti storici. Il requisito «nuova richiesta inviata → avviso sparito» non si ottiene soltanto spostando le schede.

## Soluzione consigliata a Cowork, da approvare

Definire esplicitamente un selettore comune: tutte le proposte pending senza risposta corrente, piu la richiesta rifiutata **piu recente per pet, solo se non esiste una richiesta successiva per quel pet**, indipendentemente da altri pet o dal prossimo appuntamento. Nessuna cancellazione delle vecchie righe. Occorre decidere se una successiva richiesta ritirata mantenga superato il vecchio rifiuto: consiglio di si, evitando che un gesto gia superato ritorni come nuovo.

Per non far riapparire l'avviso quando la nuova richiesta diventa approved/withdrawn, non basta la lettura attuale: autorizzare `src/apps/customer/hooks/useAppointmentRequests.js` e un helper condiviso per conoscere anche questi stati, senza cambiare il contratto dei consumer esistenti. Questi file non sono nel perimetro GH-109. Il mandato prescrive la suite RLS se si aggiungono letture: pianificare le impronte demo/produzione e la suite in tale estensione. Alternativa senza estensione: Luigi deve fissare una regola piu limitata sui soli dati gia disponibili, dichiarandone i limiti; non la consiglio.

Controprove da aggiungere: vecchio rejected → nuovo pending → approved, e → withdrawn; rifiuto di un pet con pending/appuntamento di un altro; due rifiuti storici dello stesso pet; nuove alternative dopo una risposta gia inviata. Avviso e lista multi-pet devono condividere lo stesso insieme, non due filtri equivalenti solo in apparenza.

## File consegnati e confini

| File | Atto |
|---|---|
| `docs/consegne/GH-109-la-tessera-in-cima-alla-home-esito.md` | Registro dell'interruzione |
| `docs/consegne/evidenze/GH-109/preflight.mjs` | Prova locale ripetibile |
| `docs/consegne/evidenze/GH-109/preflight.json` | Quattro misure e timestamp |

Commit documentale con questi soli file, identificabile da `git log -1 --format='%H %s' -- docs/consegne/GH-109-la-tessera-in-cima-alla-home-esito.md`. Build, screenshot, prove vive, regressioni GH-107/GH-108 e modifica grafica **non eseguiti**, essendo bloccato il primo cancello.

Fuori da modifiche/stage/commit: consegna CD-11 e mandati CD-11/GH-109, SQL preesistenti di riallineamento/GH-102 e rollback. Cartelle private `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` non lette. Diario intatto. Fuori istruzione: nessuno.

Classificazione: **1 recupero**, premessa di un criterio gia unico non confermata dai sorgenti; **1 passaggio richiesto a Luigi** per la definizione e l'eventuale estensione. Tempo della ricognizione/prova2m40s, non stimato un costo ulteriore. Ripresa dopo decisione scritta, non dopo un semplice consenso al disegno.
