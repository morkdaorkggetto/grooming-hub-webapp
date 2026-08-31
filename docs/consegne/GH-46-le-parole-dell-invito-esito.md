# Consegna GH-46 - Le parole dell'invito

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `22568f4`.
- Database ammesso e letto: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, nuova rotta, scrittura dati, fixture applicata, push,
  merge o deploy.

## Esito

Il percorso di creazione dell'invito non chiede e non salva piu' un'email che
non avrebbe alcun effetto. Prima della generazione lo staff vede destinatario,
telefono, canale WhatsApp e durata configurata; la descrizione esplicita che
il cliente trovera' tutti i propri cani e lo storico completo. Dopo la
generazione restano visibili destinatario, invio manuale e scadenza effettiva.

Il testo WhatsApp e' definito in un solo punto, non usa il nominativo del
cliente, identifica il salone col nome del tenant, nomina il cane, descrive il
contenuto dell'area e ricava la durata dalle date dell'invito. Il link `wa.me`
contiene soltanto telefono e testo precompilato: l'app non invia il messaggio.

La schermata raggiungibile delle richieste descrive solo il flusso presente e
non promette piu' la boutique. Il portale legacy morto `CustomerPortal.jsx`
non e' stato rimosso, come richiesto dal mandato.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/lib/database.js` | modificato | Rimuove email e `customer_email` dal solo percorso di creazione invito. |
| `src/apps/staff/lib/whatsapp.js` | modificato | Centralizza il testo affidabile e calcola la durata dalle date dell'invito. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Mostra prima e dopo destinatario, WhatsApp, contenuto reale e scadenza; chiarisce l'invio manuale. |
| `src/apps/staff/pages/CustomerRequests.jsx` | modificato | Sostituisce la promessa futura sulla boutique con la funzione corrente della pagina. |
| `docs/consegne/GH-46-le-parole-dell-invito-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex.

## Controprove completate

| Prova | Misurato | Esito |
| --- | --- | --- |
| Riquadro prima della generazione | Nominativo, numero, `WhatsApp` e scadenza configurata presenti nel rendering | PASS |
| Email inutile | Nessuno stato o campo email in `ClientDetail`; `createCustomerPortalInvite` accetta solo `petId` e non legge/scrive `customer_email` | PASS |
| Contenuto dichiarato | Testo esplicito: tutti i cani e storico completo delle visite | PASS |
| Durata prima e dopo | Prima: setting tenant con fallback coerente a `3`; dopo: `expires_at` restituito dal database | PASS |
| Nominativo numerico | Test puro con destinatario `3333589030`: il numero non compare nel testo | PASS deterministico |
| Salone e cane | Test puro: `Grooming HUB` e `[DEMO GH-46] Nina` entrambi presenti | PASS deterministico |
| Durata dal dato | Differenza `created_at`/`expires_at` pari a tre giorni resa come `3 giorni` | PASS deterministico |
| Composizione senza invio | URL host `wa.me`; parametro `text` identico al testo generato; nessuna chiamata di invio | PASS |
| Boutique nella schermata raggiungibile | Nessuna occorrenza in `CustomerRequests.jsx` | PASS |
| Suite e schema | `scripts/rls-tests/`, `supabase/seeds/` e `supabase/migrations/` invariati rispetto alla base | PASS |
| Preview build | `/login` caricato dalla build su `127.0.0.1:4174`, nessun errore nuovo della pagina | PASS |

Il test puro e' stato eseguito sul modulo realmente distribuito, prima
raggruppato con esbuild. Ha verificato insieme assenza del nominativo numerico,
nome tenant, nome cane, contenuti, durata e identita' fra testo e parametro
WhatsApp.

## Verifiche tecniche

- `npm run build`: PASS con Node `24.19.0`, Vite `5.4.21`, `155` moduli
  trasformati, bundle JS 675.32 kB (gzip 190.84 kB).
- `git diff --check`: PASS.
- Compilazione isolata dei quattro file modificati con esbuild: PASS.
- Test deterministico del formatter e dell'URL WhatsApp: PASS, 7 assert su 7.
- Integrita' suite RLS, seed e migration rispetto a `HEAD`: PASS, nessun diff.
- `npm run lint`: non eseguibile; lo script richiama `eslint`, pacchetto non
  installato. Nessuna dipendenza e' stata aggiunta fuori mandato.
- Warning build non bloccanti: Browserslist datato e chunk principale sopra
  500 kB.

## Eccezioni e controprove vive mancanti

Il mandato si dichiara in forma breve con **nessun dato in gioco**, ma chiede
anche un caso reale numerico sul demo e la rimozione di ogni fixture. La misura
iniziale ha trovato `7` customer e `0` nominativi composti soltanto da cifre:
la controprova viva richiesta non esiste nello stato ammesso.

La sonda staff GH-04 e' inoltre completamente smontata: `0` utenti Auth, `0`
profili e `0` membership. Il tentativo di riapplicare il seed e' stato
rifiutato perche' GH-46 non autorizza la creazione o la reimpostazione di un
account staff. Nessuna strada alternativa e' stata usata. La suite RLS si e'
quindi fermata al bootstrap con `invalid_credentials`, prima di qualsiasi
scrittura: `0 PASS, 1 FAIL, 0 SKIP`.

Di conseguenza restano aperti due gesti, senza effetti sul codice consegnato:

1. generazione viva dell'invito da una scheda con nominativo numerico;
2. riesecuzione completa della suite RLS con il ciclo sonda autorizzato.

Fixture GH-46 create: `0`. Residui GH-46: `0`. Produzione non letta e non
scritta. Nessun segreto letto, stampato o committato.

## Soluzione consigliata a Cowork

Predisporre un micro-mandato dati solo demo che autorizzi nominativamente:

1. riapplicazione idempotente del seed GH-04 gia' versionato;
2. un customer usa-e-getta col nominativo numerico e un pet marcati
   `[DEMO GH-46]`;
3. generazione di un solo invito dalla UI, lettura del `wa.me` precompilato e
   prova umana di Luigi;
4. suite RLS invariata;
5. cancellazione di invito, pet, customer e sonda, con conteggi finali a zero.

Oggetti coinvolti: esclusivamente il seed GH-04 gia' esistente e righe demo in
`auth.users`, `profiles`, `tenant_memberships`, `customers`, `pets` e
`customer_invitations`. Nessuna migration o modifica di codice. Rischio
residuo: soltanto una sessione interrotta prima del teardown; si mitiga con ID
e marker deterministici e un atto iniziale/finale di conteggio.

## Passo umano di Luigi

Dopo il micro-mandato, aprire WhatsApp sull'invito del cliente col nominativo
numerico e leggere il testo come destinatario. La domanda non e' soltanto se
contenga i dati corretti: **sembra un messaggio autentico del salone oppure una
truffa?** Se resta il secondo dubbio, le parole non sono pronte.

## Fuori istruzione

- Nessuna modifica fuori istruzione.
- Il server di sviluppo esistente su `localhost:5173` non e' stato toccato.
- E' stata aperta temporaneamente una preview della build su
  `127.0.0.1:4174`; non e' un deploy.

## Commit

Commit locale della consegna con messaggio
`fix: clarify customer invitation messaging`. Nessun push eseguito.
