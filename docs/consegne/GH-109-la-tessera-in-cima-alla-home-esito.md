# GH-109 — La tessera in cima alla Home

**Ripresa del 2/10: implementazione consegnata, nessun push/deploy.** Il checkpoint iniziale, conservato in fondo, e superato dalla decisione nominativa di Luigi: rifiuto da fare solo in assenza di qualsiasi richiesta successiva per lo stesso pet, anche approved/withdrawn; piu proposte pending senza risposta corrente. Estensione autorizzata a hook richieste e helper condiviso.

**Limite dichiarato del collaudo:** due/tre pending per lo stesso pet sono impedite dal trigger vivo. Queste cardinalita sono provate soltanto come composizione UI simulata; nessun vincolo e stato aggirato. Scelta, rifiuto, nuova prenotazione, ritiro, multi-pet e isolamento Mario/Luca sono prove vive sul demo.

## Base della ripresa

- Base applicativa richiesta `c71240dd35a9f104bc20981417801b136e192bc0`; HEAD di ripresa `21958a454e92866722a427d273fb7e6c2d600740`, contenente solo il primo registro e la prova d'interruzione. Branch `main`.
- Metodo, impronte del mandato e contratto CD-11: quelli dichiarati nel checkpoint storico. La decisione di Luigi in chat estende il perimetro, senza modificare i documenti di Cowork.
- Produzione: **mai letta o scritta**. Solo `qttpinkslhenxrsbhhhg`. Nessuna migration o policy; le scritture sono fixture, relative risposte e ripristini.
- Commit: codice, questo registro e sole evidenze GH-109 insieme; hash risolvibile con `git log -1 --format='%H %s' -- docs/consegne/GH-109-la-tessera-in-cima-alla-home-esito.md` e riportato nel messaggio di consegna. Nessun push, merge o deploy.

| Verifica preventiva | Valore |
|---|---|
| Versione dei file | Base sopra, stesso worktree autorizzato |
| Premessa critica | Due criteri iniziali non equivalenti; decisione esplicita di Luigi adottata |
| Criteri/perimetro | Home, componenti PetCard*, PendingRequest, CSS; hook e helper aggiunti dall'autorizzazione. Differenza non autorizzata: vuota |
| Prerequisiti | CD-11 presente; impronte demo confrontate prima dei test; suite RLS eseguita |
| Attese indipendenti | Testi/misure dal CD-11; regola dei rifiuti dalla decisione scritta, non dedotta dagli output |

## Impronte e ripristino

Query identica a `evidenze/GH-107/impronte-proposte.sql`, eseguita solo sul demo. Fonte produzione: documento Cowork GH-107, riconfermato da Luigi il 2/10 alle06:23.

| Misura | Risultato |
|---|---|
| Produzione, fonte Cowork | 271 righe; MD5 `9b84214d27393f2b0f7ac65c6c35b5e6` |
| Demo misurato | 254 righe; MD5 `06f3a372e14ba984a62276258561d9a4` |
| Confronto | 254 identiche; 0 cambiate; 0 solo demo; esattamente 17 solo produzione autorizzate |
| Eccezioni | 13 colonne dei tre backup; `visits.cost`, `visits.discount_percent`, `services.price_cents`, `gh103_finance_bridge()` |
| Suite esistente | **62 PASS, 0 FAIL, 0 SKIP**, account permanenti invariati |
| Pulizia suite | Rimossi soltanto i due audit sintetici con ID, cliente, marker e autore vincolati in `rls-audit-cleanup.sql` |
| Pulizia fixture GH-109 | Pet0, visite0, richieste0 |
| Regressione viva GH-107 | Quattro pet/visite rimossi; chiave di proiezione temporanea rimossa; MD5 settings tornato `26327442803a6426d07c74c8feca0f33` |
| Ripristino conclusivo, anche dopo rinnovo schermate | **18 aggregati con conteggi e impronte identici alla baseline**; `ripristino-finale-verifica.json` |

Nessun account creato, nessuna password cambiata. Nessun oggetto Storage creato: il ritratto della fixture usa un'immagine locale. I login cambiano le sessioni Auth, non sono dichiarati come ripristino dei log di autenticazione. Nessun dato delle cartelle private letto.

## Modifica e controprove

Un selettore solo, `customerActions(history)`, serve sia l'avviso sia l'elenco multi-pet. Lo storico include ogni stato, paginato a500 con ordine `created_at,id`; i consumer esistenti conservano `data` pending/rejected. Una pagina fallita non produce uno storico parziale.

Un pet: testata senza indietro/saluto, avviso, tessera CD-10, banco, invito e resto della Home. Multi-pet: schede delle azioni con nome, strisce, resto. Rimangono sotto le richieste che aspettano il salone, con i gesti facoltativi esistenti. Il caricamento dei pet non mostra un saluto transitorio.

Il foglio riusa `PendingRequest`, senza nuove RPC o logiche di risposta; cambia soltanto il contenitore e omette l'intestazione duplicata. Per il rifiuto ho scelto **pulsante verso `/u/book?petId=...`**, senza ricostruire il wizard. Il QR richiama la stessa modalita banco del pulsante.

| Controprova | Esito / evidenza |
|---|---|
| Regola «da fare» | `selettore.mjs`: 15 casi, 6 testi; rifiuto storico, qualsiasi stato successivo, altro pet, risposta corrente/nuovo giro |
| Storico oltre la prima pagina | `letture-richieste.mjs`: 1201 righe, ultima withdrawn; filtro legacy e errore pagina successiva PASS |
| Un pet, nulla da fare | Browser demo: zero avvisi/strisce/saluti; tessera in cima, prenotazione e prossimo appuntamento sotto; `browser-none.json` |
| Proposte | «Scegli un orario», Annulla lascia avviso; scelta RPC200, risposta corrente accepted, avviso assente e attesa salone visibile; `browser-proposal.json` |
| Nessuna proposta adatta | Componente esistente, rifiuto RPC200, avviso assente; `browser-decline.json` |
| Data rifiutata | «Scegli un'altra data» -> wizard reale -> `submit_appointment_request`200 -> Home senza avviso; `browser-rejected.json` |
| Richiesta successiva ritirata | Ritiro RPC200 -> ricarica Home -> vecchio rifiuto non riappare; `browser-withdrawn.json` |
| Due/tre insieme | Un solo avviso, «Due/Tre richieste aspettano te», badge2/3, righe2/3, apertura del caso; **sola simulazione della risposta di lettura**, nessuna RPC; `browser-two/three.json` |
| Multi-pet | Due nomi nelle azioni sopra le due strisce, poi resto; tessera separata con indietro; `browser-multi.json` |
| QR/banco | Stessa immagine e stessa modalita con entrambi gli ingressi, Escape funziona |
| Regressioni GH-107/108 | Script ripetuti in GH-109: 308 confronti livelli legacy; 8 proiezioni invalide; letture1201visite/1001punti; 11 stati browser; 6 geometrie, 6 griglie, 6 stati temporali; 4 condizioni Wake Lock, fallback ritratto/nome lungo; **11 rotte vive, incluso reject Luca**, tutti PASS |
| RLS | 62/0/0 e ripristino come sopra |
| Build finale | `npm run build`:183moduli,1.27s, exit0. Avvisi preesistenti Browserslist e chunk oltre500kB; nessuna dipendenza aggiornata |
| Confini | `git diff --check` PASS; nessun diff staff, fidelity, banco, routing, migrazioni, diario o file Cowork |

Per le composizioni uno/due pet, il browser filtra **solo gli inventari di fixture** restituiti a Mario; letture e scritture di richieste passano realmente dal demo con RLS, salvo il caso due/tre esplicitamente simulato. Non e una prova della consistenza dell'inventario di Mario: e una prova delle composizioni autorizzate senza alterare i suoi pet preesistenti.

## Misure a confronto

Valori in CSS px, margine = bordo alto barra meno fondo pulsante: negativo significa sotto la barra. CD-11 assume stato24 e barra64; il browser reale qui ha stato0 e **barra esistente87**, non modificata. La fixture demo ha3/6 visite, finestra12mesi; CD usa3/4 proiettate senza finestra. Con Bronzo il demo mostra3/12 verso Argento su due righe; la tavola CD mostra3/4. **Queste differenze di dati non sono corrette cambiando i livelli.**

| Caso | CD: estensione fino al pulsante | GH-109: estensione dal fondo testata+gap | CD margine812/667/568 | GH-109 margine812/667/568 |
|---|---:|---|---|---|
| Senza ritratto/avviso | 482 | 496.67 a375;520.42 a320 | +182/+37/-62 | +168.33/+23.33/-99.42 |
| Con avviso | 550 | 564.67 a375;588.42 a320 | +114/-31/-130 | +100.33/-44.67/-167.42 |
| Ritratto e Bronzo + avviso | 665 | 730.27 | -1/-146/-245 | -65.27/-210.27/-309.27 |

A375x667 con avviso: QR finisce a**533.67**, barra inizia a**580**, quindi e interamente raggiungibile; CD dichiara536/603. Ritratto+Bronzo a375x812: QR699.27 < barra725 ma pulsante790.27; a667 anche QR sotto barra. Saluto assente misurato. Nessun overflow orizzontale nei tre formati. Testata56, avviso56, QR90 con immagine76, pulsante54. Nove tavole affiancate `cd11-*.png`; i fogli e multi-pet sono allegati separatamente.

## Eccezioni, recuperi e consegna a Cowork

- **Vincolo reale**: `prevent_duplicate_pending_appointment_request()` respinge `due.sql` con23505. L'inserimento multiplo e atomico, non ha lasciato la prima riga. Non disabilitato il trigger. Consiglio: rendere esplicito nei mandati futuri che due/tre azioni sul medesimo pet sono una prova difensiva UI, non una cardinalita producibile dal wizard; non indebolire il database per una tavola.
- **Differenza di misura**: barra87 e dati fidelity diversi dal segnaposto CD ampliano l'overflow. Consiglio: per un eventuale seguito CD usare la barra reale e casi Bronzo3/12; in questo mandato nessuna compressione della tessera/barra.
- Recuperi tecnici: browser inizialmente respinto dal sandbox, poi avviato con permesso; un test locale Vite ha segnalato EPERM del websocket ma terminato0. Corretti nel banco di prova l'obbligo eta e il testo finale del wizard, non nel prodotto. Corretta la chiusura del browser che precedeva una lettura ancora attiva. Confronto visivo ha trovato il nome errato dell'icona freccia: corretto e schermate rinnovate, poi secondo ripristino verificato.
- Attivita fuori istruzione: **nessuna**. File Cowork/CD e SQL preesistenti esclusi; cartelle private non lette; canone/diario intatti. Il preflight storico non viene rieseguito sul codice nuovo: misura i rami precedenti, non e un test regressivo.
- Tempo misurato della ripresa: **06:26:09-07:43:55 CEST, 77m46s**, include attese tool, collaudi e recuperi; redazione finale/commit successivi esclusi. Nessun rallentamento disco/iCloud rilevato. Un limite nuovo dichiarato (cardinalita doppia) senza nuova autorizzazione o ampliamento.
- Luigi: aprire `/u/home` nel demo e guardare tessera, avviso e multi-pet. **Cosa non ti torna?** Prova personale su telefono/Safari e valutazione su Rumba restano a Luigi; non dichiarate eseguite. Anteprima applicativa locale `http://127.0.0.1:4180/u/home`; le fixture sono gia smontate. `__gh109` serve soltanto le tavole CD, non il prodotto.

## File applicativi

| File | Atto |
|---|---|
| `src/apps/customer/pages/Home.jsx` | Nuovo ordine, selettore unico, storico, nessun reindirizzamento |
| `src/apps/customer/pages/PetCard.jsx` | Testata riusabile senza indietro; QR apre il banco esistente |
| `src/apps/customer/components/PetCardHome.jsx` | Riuso della tessera con loading/errore |
| `src/apps/customer/components/PetCardRequests.jsx` | Avviso, schede multi-pet e dialog accessibile |
| `src/apps/customer/components/PendingRequest.jsx` | Contenitore embedded e refresh dopo ritiro nel foglio |
| `src/apps/customer/components/pet-card.css` | Stili delle nuove superfici, nessuna modifica della griglia CD-10 |
| `src/apps/customer/hooks/useAppointmentRequests.js` | Storico opzionale e paginazione; dati legacy invariati |
| `src/apps/customer/lib/customerActions.js` | Selettore condiviso e testi del conteggio |

La tabella esaustiva dei file del commit e nell'allegato `evidenze/GH-109/file-consegna.tsv` (un percorso per riga, byte e SHA-256 dei file consegnati; registro e indice non auto-improntati). Gli script di regressione sono copie con sole destinazioni di output GH-109: nessuna evidenza precedente sovrascritta.

---

# Checkpoint storico — Interruzione iniziale, superata dalla ripresa sopra

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
