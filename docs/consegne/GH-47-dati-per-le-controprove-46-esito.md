# Consegna GH-47 - Dati per le controprove di GH-46

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `2f5f0c7`.
- Database usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, modifica al codice, nuova rotta, push, merge o deploy.

## Esito

GH-47 e' completato. Le due sonde usa-e-getta GH-04 e GH-44 sono state
riapplicate sul demo, la fixture numerica deterministica e' stata creata e un
solo invito e' stato generato dalla UI staff. Il messaggio WhatsApp e' stato
letto dall'indirizzo `wa.me` precompilato senza aprire WhatsApp e senza inviare
nulla.

La suite RLS completa e' passata. Invito, pet, customer, note, audit, oggetti
Storage e due sonde sono stati rimossi nella stessa sessione. I conteggi finali
coincidono con quelli iniziali.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `docs/consegne/GH-47-dati-per-le-controprove-46-esito.md` | aggiunto | Registro unico del ciclo dati e delle controprove vive. |

Nessun file applicativo, migration, seed o script e' stato modificato.

## Baseline e stato finale

| Tabella | Prima | Dopo | Marker GH-46/GH-47 dopo |
| --- | ---: | ---: | ---: |
| `auth.users` | 3 | 3 | 0 |
| `profiles` | 3 | 3 | 0 |
| `tenant_memberships` | 3 | 3 | 0 |
| `customers` | 7 | 7 | 0 |
| `pets` | 7 | 7 | 0 |
| `customer_invitations` | 0 | 0 | 0 |

Controlli aggiuntivi finali:

- `customer_staff_notes` GH-46/GH-47: `0`;
- `customer_account_unlink_audit` delle sonde: `0`;
- oggetti Storage marcati dalla suite: `0`;
- sonde Auth GH-04/GH-44, profili e membership: `0`.

## Fixture deterministica

| Oggetto | Identificativo / valore |
| --- | --- |
| Customer | `46460000-0000-4000-8000-000000000047` |
| Nominativo visibile | `3333589030` |
| Telefono | `+393260004647` |
| Marker customer | `[DEMO GH-46] Cliente numerico usa-e-getta creato da GH-47` in nota staff-only |
| Pet | `46460000-0000-4000-8000-000000000046` |
| Nome pet | `[DEMO GH-46] Nina` |
| Proprietario tecnico pet | sonda staff GH-04 |

Il marker customer e' stato tenuto nella nota staff-only affinche' il
nominativo mostrato dalla UI restasse realmente composto da sole cifre.

## Controprova UI prima dell'invito

La scheda reale del demo ha mostrato contemporaneamente:

- destinatario `3333589030`;
- via `WhatsApp` e telefono;
- scadenza `3 giorni dalla creazione`;
- tutti i cani e storico completo delle visite;
- la frase che l'app prepara il messaggio e l'operatore lo invia;
- nessun campo email.

## Testo WhatsApp integrale

> Ciao! Siamo Grooming HUB. Qui trovi l'area dedicata a [DEMO GH-46] Nina: tutti i tuoi cani, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. http://127.0.0.1:4174/u/redeem/ghi_de8ecba1fa5248269d77af9e9a39

L'invito cui apparteneva il token e' stato eliminato prima della chiusura del
mandato; il collegamento riportato e' quindi inattivo.

Controprove sul testo:

| Prova | Misurato | Esito |
| --- | --- | --- |
| Saluto numerico | Nessuna occorrenza di `Ciao 3333589030` | PASS |
| Mittente | `Grooming HUB`, letto dal tenant | PASS |
| Cane | `[DEMO GH-46] Nina` | PASS |
| Durata | `3 giorni`, ricavati dall'invito | PASS |
| Contenuto | Tutti i cani e storico completo | PASS |
| Gesto | Host `wa.me`, testo precompilato; nessuna apertura o invio | PASS |

## Suite e build

- Suite RLS demo completa con baseline temporanea a 8 pet:
  **41 PASS, 0 FAIL, 1 SKIP**.
- Lo skip e' quello previsto per l'assenza di un secondo tenant reale nel
  demo.
- Pulizia interna della suite: PASS, `0` residui marker.
- `npm run build`: PASS con Node `24.19.0`, Vite `5.4.21`, `155` moduli
  trasformati, bundle JS 675.32 kB (gzip 190.84 kB).
- Warning build non bloccanti: Browserslist datato e chunk principale sopra
  500 kB.

## Teardown

Ordine eseguito:

1. logout della sonda staff dalla preview locale;
2. eliminazione custodita dell'unico invito GH-46;
3. eliminazione del pet e del customer deterministici, con cascata della nota;
4. eliminazione dei due audit usa-e-getta prodotti dalla suite GH-44;
5. teardown custodito della sonda customer GH-44;
6. teardown custodito della sonda staff GH-04;
7. conteggi finali e ricerca marker.

Tutte le guardie hanno accettato identita' e cardinalita' attese. Nessun
residuo e' rimasto.

## Eccezioni e autorizzazioni integrative

Il testo iniziale di GH-47 autorizzava nominativamente il seed GH-04, ma la
suite corrente richiede anche la sonda customer GH-44 e la baseline ne
misurava l'assenza. Codex si e' fermato prima di ogni scrittura. Luigi ha poi
autorizzato esplicitamente, una tantum e solo per GH-47, la riapplicazione del
seed GH-44 gia' versionato e il relativo teardown.

Nessun account reale e' stato toccato. Nessun segreto e' stato stampato o
committato. La password GH-04 e quella GH-44 sono credenziali pubbliche e
usa-e-getta gia' dichiarate nei rispettivi seed.

## Passo umano di Luigi

Leggere il testo integrale riportato sopra come lo leggerebbe un cliente che
riceve il messaggio da un numero forse non salvato in rubrica. La domanda e':
**sembra un messaggio autentico del salone oppure una truffa?** La suite prova
i dati; il giudizio finale sulle parole resta di Luigi.

## Fuori istruzione

- Nessuna modifica fuori istruzione.
- La preview locale su `127.0.0.1:4174` e' stata aperta solo per la prova e
  chiusa prima del registro.
- Il server locale preesistente su `localhost:5173` non e' stato toccato.

## Commit

Commit locale documentale con messaggio
`test: close GH-46 live counterproofs`. Nessun push eseguito.
