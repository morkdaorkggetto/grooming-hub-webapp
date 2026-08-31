# Consegna GH-48 - Nomi scritti per un quaderno

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `66a08ea`.
- Database usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, nuova rotta, correzione automatica di anagrafiche, push,
  merge o deploy.

## Esito

GH-48 e' completato. Un unico formatter centrale sceglie il nome da mostrare
nei messaggi diretti al cliente. Il ripiego scatta solo se il nome e' vuoto o
se coincide con la razza ignorando maiuscole e spazi; ogni altro contenuto
resta invariato.

Su indicazione esplicita di Luigi durante l'esecuzione, la formulazione del
ripiego e' stata resa neutra rispetto alla specie: `il tuo pet`, al posto di
`il tuo cane`. Per coerenza anche il testo dell'area usa `tutti i tuoi pet`.

Prima di generare l'invito, la scheda staff mostra destinatario, nome del pet,
numero WhatsApp, scadenza e testo completo che verra' composto. Nessun dato
viene riscritto dal formatter o dalla UI.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/lib/whatsapp.js` | modificato | Formatter centrale del nome pet, ripiego neutro e applicazione a tutti i messaggi staff diretti al cliente. |
| `src/apps/staff/lib/database.js` | modificato | La risposta dell'invito include la razza necessaria al formatter. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Anteprima pre-generazione con cliente, numero, pet e testo WhatsApp integrale. |
| `docs/consegne/GH-48-nomi-scritti-per-un-quaderno-esito.md` | aggiunto | Registro unico di implementazione, prove vive e teardown. |

Nessun altro file e' stato modificato.

## Regola implementata

`getCustomerFacingPetName({ petName, petBreed })`:

1. rimuove gli spazi ai soli fini del confronto;
2. confronta in minuscolo italiano;
3. restituisce `il tuo pet` per nome vuoto o uguaglianza esatta con la razza;
4. restituisce il nome originale, solo ripulito ai bordi, in ogni altro caso.

Non sono state introdotte euristiche su cifre, minuscole, sottostringhe o
descrizioni. `Milo maltese` resta tale rispetto a `Maltese`; anche
`barboncino nero` resta tale rispetto a `barboncino`.

Il formatter e' usato nei messaggi staff per:

- contatto dalla scheda cliente;
- promemoria appuntamento;
- approvazione o rifiuto richiesta;
- proposta di fasce alternative;
- invito area cliente;
- contatto dalla rubrica customer.

I messaggi dal cliente verso il salone non sono stati modificati, perche' non
sono testi diretti al cliente.

## Fixture demo e baseline

Baseline prima di ogni scrittura temporanea:

| Tabella | Prima | Dopo | Residui GH-48 |
| --- | ---: | ---: | ---: |
| `auth.users` | 3 | 3 | 0 |
| `profiles` | 3 | 3 | 0 |
| `tenant_memberships` | 3 | 3 | 0 |
| `customers` | 7 | 7 | 0 |
| `pets` | 7 | 7 | 0 |
| `customer_invitations` | 0 | 0 | 0 |

Fixture deterministiche usa-e-getta:

| Caso | Pet | Nome | Razza | Esito |
| --- | --- | --- | --- | --- |
| uguale alla razza | `48480000-0000-4000-8000-000000000011` | `Meticcio` | `meticcio` | `il tuo pet` |
| nome composto reale | `48480000-0000-4000-8000-000000000012` | `Milo maltese` | `Maltese` | nome preservato |
| nome vuoto | `48480000-0000-4000-8000-000000000013` | stringa vuota | `Meticcio` | `il tuo pet` |
| nome normale | `48480000-0000-4000-8000-000000000014` | `Nina` | `Meticcio` | nome preservato |

Customer comune: `48480000-0000-4000-8000-000000000001`, nominativo
`[DEMO GH-48] Quaderno`, telefono `+393260004848`. Le fixture sono state
inserite e poi eliminate; nessuna riga preesistente e' stata corretta.

## Controprove UI prima dell'invito

La scheda staff reale del demo ha mostrato, prima della generazione:

- destinatario `[DEMO GH-48] Quaderno`;
- pet con il valore anagrafico originale;
- via `WhatsApp` e numero `+393260004848`;
- scadenza `3 giorni dalla creazione`;
- testo completo con `[link invito]`;
- precisazione che l'invio resta manuale.

Per `Meticcio / meticcio` l'anteprima finale e' stata:

> Ciao! Siamo Grooming HUB. Questa e' l'area per il tuo pet: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. [link invito]

Per `Milo maltese / Maltese` l'anteprima finale ha conservato il nome:

> Ciao! Siamo Grooming HUB. Qui trovi l'area dedicata a Milo maltese: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. [link invito]

## Due messaggi vivi integrali

Invito per il nome uguale alla razza:

> Ciao! Siamo Grooming HUB. Questa e' l'area per il tuo pet: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. http://127.0.0.1:4174/u/redeem/ghi_6ece3567fbe54f168f57b3cbf2d9

Invito per il nome reale:

> Ciao! Siamo Grooming HUB. Qui trovi l'area dedicata a Milo maltese: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. http://127.0.0.1:4174/u/redeem/ghi_a5ee689481454c82b439ca80460d

I due inviti sono stati generati dalla UI finale. Gli indirizzi `wa.me` sono
stati soltanto letti: WhatsApp non e' stato aperto e nessun messaggio e' stato
inviato. Gli inviti sono stati eliminati; i collegamenti sopra sono inattivi.

## Verifiche

| Prova | Misura | Esito |
| --- | --- | --- |
| Formatter e messaggi | 13 controlli: uguaglianza, spazi/maiuscole, vuoto, normale, nome composto, euristica larga respinta e sei superfici messaggio | PASS |
| Nome uguale alla razza | anteprima e messaggio vivo con `il tuo pet` | PASS |
| `Milo maltese` | anteprima e messaggio vivo con nome preservato | PASS |
| Nome vuoto | fixture demo e formatter con ripiego | PASS |
| Nome normale | fixture demo e anteprima `Nina` invariata | PASS |
| UI pre-generazione | cliente, numero, pet e testo completo visibili insieme | PASS |
| Console della sessione finale | nessun nuovo errore durante le due schede e le due generazioni | PASS |
| Suite RLS demo | `41 PASS`, `0 FAIL`, `1 SKIP` previsto: demo con un solo tenant | PASS |
| Build | Vite `5.4.21`, 155 moduli, JS 676.39 kB (gzip 191.13 kB) | PASS |
| `git diff --check` | nessun errore | PASS |
| Lint | lo script esiste, ma `eslint` non e' installato nel workspace (`command not found`) | NON ESEGUITO |

Warning build non bloccanti: database Browserslist datato e chunk principale
oltre 500 kB.

## Valori anagrafici e timestamp tecnici

I conteggi finali coincidono con la baseline. La suite RLS ha verificato e
ripristinato i valori sui due record reali che usa come sonda:

- customer Mario: `relationship_status=active` e
  `acquisition_source=manual` invariati;
- pet Luna: nome e microchip protetti; `owner_notes` ripristinata a
  `[DEMO GH-02] Luna preferisce pause brevi durante l asciugatura.`.

L'impronta binaria dell'intera riga e' cambiata per quei due record soltanto
per `updated_at`: il trigger aggiorna il timestamp durante la prova di
whitelist e il successivo ripristino. Questo metadato tecnico e' dichiarato
come effetto della suite RLS richiesta; nessun valore anagrafico o operativo e'
rimasto modificato.

## Teardown

Ordine eseguito:

1. logout della sonda staff;
2. eliminazione custodita dei due inviti;
3. eliminazione delle quattro fixture pet e del customer comune;
4. eliminazione dei due audit temporanei prodotti dalla suite;
5. teardown custodito della sonda customer GH-44;
6. teardown custodito della sonda staff GH-04;
7. seconda prova viva finale con due sole fixture, seguita dallo stesso logout
   e teardown;
8. conteggi finali e ricerca residui.

Stato finale aggiuntivo: sonde Auth `0`, fixture customer `0`, fixture pet `0`,
audit `0`, oggetti Storage GH-44/GH-45/GH-48 `0`.

## Autorizzazioni, eccezioni e fuori istruzione

- Luigi ha autorizzato esplicitamente e una tantum per GH-48 la
  riapplicazione sul solo demo dei seed GH-04 e GH-44, il login browser con la
  credenziale pubblica GH-04, le fixture, i due inviti, la suite RLS e il
  teardown completo.
- La richiesta successiva di Luigi ha sostituito il testo prescritto dal
  mandato `il tuo cane` con il neutro `il tuo pet`.
- Nessun account reale e nessun segreto e' stato toccato, stampato o
  committato.
- Nessuna modifica fuori istruzione.
- La preview locale su `127.0.0.1:4174` e' stata avviata solo per le prove e
  chiusa prima del commit.

## Passo umano di Luigi

Leggere di seguito i due messaggi vivi riportati sopra. La domanda prescritta
dal mandato e': il primo, che evita un falso nome, resta personale? Il secondo,
che conserva `Milo maltese`, evita l'impressione di un automatismo cieco?

## Commit

Commit locale con messaggio `fix: guard customer-facing pet names`. Il suo hash
e' riportato nella risposta finale della consegna. Nessun push eseguito.
