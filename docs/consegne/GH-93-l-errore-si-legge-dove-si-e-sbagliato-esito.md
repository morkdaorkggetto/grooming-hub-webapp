# GH-93 - L'errore si legge dove si è sbagliato: esito

## Esito e perimetro

**Mandato eseguito.** Gli esiti delle azioni nate nei modali del calendario
sono ora mostrati nel modale che ha originato il comando e vengono cancellati
alla sua chiusura. Il ripristino di un annullato distingue inoltre il caso in
cui lo stesso pet è già stato riprenotato nello slot dal caso generale di
capienza esaurita; il pulsante resta visibile, disabilitato e nominato prima
del tentativo.

Root `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
Base `main`: **976c84e4aedfeea6868b1077445550440230a2e4**.
Commit previsto: `fix: keep calendar feedback in context (GH-93)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-93-l-errore-si-legge-dove-si-e-sbagliato-esito.md`.

Nessuna migrazione, colonna, policy, rotta o dipendenza. Nessun push, merge o
deploy. Produzione `azgehoseiojodltcttfb` non letta né scritta. Sul solo demo
`grooming-hub-demo` (`qttpinkslhenxrsbhhhg`) sono state create fixture
temporanee marcate `[DEMO GH-93]`, poi smontate nella stessa prova.

## Tabella esaustiva dei file del commit

| File | Intervento / motivo |
|---|---|
| `src/apps/staff/pages/Calendar.jsx` | Feedback locale ai modali, pulizia alla chiusura, distinzione stesso-pet/capienza e stato preventivo del ripristino |
| `docs/consegne/GH-93-l-errore-si-legge-dove-si-e-sbagliato-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-93/browser-check.mjs` | Banco riproducibile con app e SDK reali, HTTP in memoria, viewport 375 px |
| `docs/consegne/evidenze/GH-93/browser.json` | Testi, posizioni, misure, chiamate RPC ed esiti del banco browser |
| `docs/consegne/evidenze/GH-93/live-demo-check.mjs` | Sonda demo riproducibile con fixture marcate e teardown in `finally` |
| `docs/consegne/evidenze/GH-93/live-demo.json` | Capienza reale, rifiuto RPC, atomicità e conteggi di pulizia |
| `docs/consegne/evidenze/GH-93/ui-invariants.sha256` | Coppie di impronte base/corrente per 68 file customer e staff |
| `docs/consegne/evidenze/GH-93/restore-same-pet-375.png` | Caso Davide a 375 px |
| `docs/consegne/evidenze/GH-93/restore-capacity-375.png` | Capienza piena senza gemello a 375 px |
| `docs/consegne/evidenze/GH-93/restore-database-last-word-375.png` | Memoria permissiva e rifiuto finale del database a 375 px |

Fuori da modifica, stage e commit:

- `docs/incarichi/GH-93-l-errore-si-legge-dove-si-e-sbagliato.md`, mandato
  Cowork non versionato;
- `docs/diario-progetto.md`, modifica parallela preesistente di Luigi/Cowork;
- `qr-gadget/`, contenuto locale preesistente di Luigi/Cowork;
- `src/apps/staff/.DS_Store`, file temporaneo macOS comparso durante le
  impronte e autorizzato da Luigi a essere ignorato.

## Ripristino: i due casi

Il confronto stesso-pet riusa
`isAppointmentCapacityAvailable` da
`shared/tenant/workstationCapacity.js`, con capienza `1`, sulla settimana già
in memoria filtrata per `pet_id` e con l'ID corrente escluso. Non esiste una
seconda lettura né un nuovo criterio temporale.

| Condizione | Testo esatto nel modale | Pulsante visibile |
|---|---|---|
| Stesso pet già attivo e sovrapposto | `Questo appuntamento è già stato rifatto nello stesso orario. L’annullato non serve più e non può essere ripristinato.` | `Già rifatto`, disabilitato |
| Fascia piena per altri pet | `Le postazioni sono tutte occupate nella fascia scelta.` | `Postazioni occupate`, disabilitato |
| Slot ripristinabile | dopo l'RPC: `Stato aggiornato: Programmato.` | prima: `Ripristina programmato`, abilitato |

I primi due testi sono diversi e appaiono nel modale dettaglio, subito sopra
il gruppo che contiene il ripristino. Il comando non sparisce. Nel caso
riuscito lo stato in memoria diventa `scheduled` e la conferma resta nello
stesso modale.

## Esiti delle azioni nei modali

Ricerca esaustiva eseguita:

```sh
rg -n "submitManual|createManualPet|confirmRequest|rejectRequest|saveSchedule|changeStatus|openReminder|openDeleteConfirmation|confirmDelete|setError|setSuccess|setModalError|setModalSuccess|setDeleteError" src/apps/staff/pages/Calendar.jsx
```

| Azione | Prima | Dopo |
|---|---|---|
| Crea appuntamento manuale | errore e successo nell'avviso globale | errore e successo nel modale manuale |
| Crea pet dal manuale | errori nel sottoform; successo globale | errori nel sottoform; successo nel modale manuale |
| Conferma/rifiuta richiesta | errore globale dietro il modale | errore nel modale richiesta; il successo continua a chiudere il modale e prepara WhatsApp come prima |
| Sposta appuntamento | errore/successo globale | errore/successo nel modale dettaglio |
| Assenza, annullamento e ripristino | errore/successo globale | errore/successo nel modale dettaglio |
| Promemoria WhatsApp | errore globale, nessuna conferma | errore o `Promemoria aperto in WhatsApp.` nel modale dettaglio |
| Eliminazione | errore già nel modale eliminazione; successo globale dopo chiusura | forma preservata; errore cancellato tornando indietro, successo e chiusura invariati |

Google, Apple, apertura cliente, registrazione lavorazione e passaggio al
nuovo appuntamento restano comandi di uscita/navigazione, non producono uno
stato applicativo da mostrare. Anche conferma, rifiuto ed eliminazione
mantengono la chiusura riuscita prevista dal comportamento esistente.

Il banco ha misurato dentro il modale:

- spostamento: `Non riesco a spostare l'appuntamento: spostamento simulato non disponibile`;
- promemoria: `Numero cliente non disponibile per WhatsApp.`;
- assenza: `Assenza registrata con la data dell’appuntamento.`;
- eliminazione: `Questo appuntamento ha una lavorazione collegata e non si elimina.`.

Dopo la chiusura il conteggio degli avvisi residui del modale è **0**. Il caso
fuori modale resta invece nella pagina principale, senza dialog aperti:
`Non riesco a caricare gli appuntamenti: caricamento settimana simulato`.

## Database ultima parola e prova demo

Nel banco browser la memoria è stata volutamente resa permissiva: il pulsante
era `Ripristina programmato` e abilitato, ma l'RPC ha risposto con
`Le postazioni sono tutte occupate nella fascia scelta.`. Il testo è comparso
nel modale e lo stato è rimasto `cancelled`.

La controprova viva ha autenticato l'account staff già previsto dalla suite,
senza creare account né cambiare password. La capienza letta dal tenant demo
è **2**. In uno slot futuro vuoto sono state inserite due righe attive e una
annullata sovrapposta allo stesso pet: **3 righe**, di cui **2 attive** e **2
con lo stesso pet**. Il tentativo di ripristino è stato respinto così:

| Campo | Misura |
|---|---|
| codice | `P0001` |
| details | `GH37_APPOINTMENT_CAPACITY` |
| messaggio | `Le postazioni sono tutte occupate nella fascia scelta.` |
| stato finale dell'annullato | `cancelled` |

Teardown verificato: righe `[DEMO GH-93]` **0**; appuntamenti tenant **8 prima
e 8 dopo**. Nessun dato di produzione coinvolto.

## Misure a 375 px

Banco Chromium `375 x 812`, fuso `Europe/Rome`, app e Supabase SDK reali con
HTTP in memoria. Tutti i messaggi risultano discendenti del dialog, interi e
sopra il footer mobile.

| Caso | Messaggio top-bottom | Distanza dal footer | Overflow | Troncamenti | Pulsante top-bottom |
|---|---:|---:|---:|---:|---:|
| Stesso pet | 508,031-588,281 px | 94,719 px | 0 px | 0 | 605,281-651,281 px |
| Capienza | 508,031-550,781 px | 132,219 px | 0 px | 0 | 567,781-613,781 px |
| Ripristino riuscito | 443,422-486,172 px | 196,828 px | 0 px | 0 | n.d. dopo il cambio stato |
| Database ultima parola | 443,422-486,172 px | 196,828 px | 0 px | 0 | 620,172-666,172 px prima dell'RPC |

Il footer inizia a **683 px**. Tutti i pulsanti visibili misurati hanno altezza
minima **44 px**; nessun testo copre i comandi. Le tre schermate elencate
nella tabella file sono state ispezionate visivamente.

## Impronte, verifiche e tempi

`ui-invariants.sha256` contiene **68 coppie**. Ne coincidono **67**; l'unico
file applicativo diverso è `Calendar.jsx`:
`a11796d6...a0ccbd0 -> 8bd6c715...6f5cb7`. Tutto `src/apps/customer` e tutte
le altre pagine, componenti, librerie, asset e stili staff coincidono con la
base. `git diff --numstat` applicativo: **83 aggiunte, 29 rimozioni**, tutte in
`Calendar.jsx`. `git diff --check`: verde.

Banco browser finale: **2,422 s**, 0 page error e 0 richieste impreviste.
Sonda demo finale: **4,041 s** lato script, **4,212 s** totale. Il primo giro
live aveva assunto capienza 3: il terzo inserimento attivo è stato
correttamente respinto; il `finally` ha comunque riportato marker a 0 e totale
a 8. La sonda è stata poi corretta per leggere la capienza tenant e il giro
finale è verde.

`npm run build`: **167 moduli**, Vite **1,32 s**, totale **1,881 s**, verde.
Avvisi non bloccanti preesistenti: `caniuse-lite` datato e chunk JS oltre
500 kB. Nessuna dipendenza aggiornata. Durante la messa a punto del banco
browser quattro assunzioni del test sono state corrette (semantica `details`,
conteggio annullati dopo il successo, ritorno eliminazione al dettaglio e
posizione rispetto al footer); l'ultima ha portato a spostare il feedback
prima dei comandi, così da renderlo davvero visibile a 375 px. Nessun
rallentamento persistente osservato.

Suite RLS **non rieseguita**, come prescritto. Ultima misura viva dichiarata
dal mandato: GH-91 del 13/9, **60 PASS**; non viene presentata come prova
GH-93. Il changelog Supabase è stato richiesto come previsto dal protocollo
di lavoro ma il client lo ha rifiutato per content type `text/markdown`; non
è stato necessario assumere alcun cambiamento API o schema.

## Eccezioni e passo finale

Nessuna estensione funzionale e nessun file applicativo fuori istruzione. La
sonda demo è una controprova prescritta e ha lasciato conteggi invariati. I
file Cowork e macOS dichiarati sopra non sono stati toccati.

Resta lo sguardo di Luigi sul gestionale: annullare e rifare nello stesso
slot, verificare se il testo spiega anche cosa fare, quindi rispondere alla
domanda **«cosa non ti torna?»** e valutare se Davide direbbe ancora «non me
la salvava».
