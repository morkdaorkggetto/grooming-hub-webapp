# Consegna GH-57 - Il banco non deve inventare

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `347a216` (`GH-56: il peso del fatto e le sue parole`).
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, nuova rotta o dipendenza.
- Una sola migration scritta. Non e stata applicata ne registrata sul demo o
  sulla produzione: sul demo e stata provata in rollback e resa disponibile
  solo temporaneamente per le prove browser, poi rimossa.

## Esito

Il testo delle lavorazioni gia avvenute torna al primario, mentre la velatura
chiara continua a far arretrare il contenitore. Il modulo `Nuovo appuntamento`
usa sopra 640 px una variante laterale del modal condiviso: la settimana si
stringe senza sovrapposizione, il velo passa dal 34% al 12% e il pannello resta
opaco. Sotto 640 px resta il foglio pieno precedente.

Il campo pet e ora una combobox ricercabile e annunciata, utilizzabile con
frecce, invio ed esc. La creazione resta in coda ai risultati e, quando non
esiste alcun risultato, e l'unica scelta. Cliente e pet nuovi nascono con una
sola RPC transazionale; il nuovo pet viene ricaricato e selezionato senza
chiudere il modulo.

La RPC confronta sulle cifre normalizzate soltanto telefoni con almeno otto
cifre effettivamente fornite. Un conflitto restituisce cliente e telefono senza
scrivere; un numero corto non viene confrontato. Il telefono assente richiede
una dichiarazione esplicita e viene conservato come `NULL`, resa possibile
dalla stessa migration. Nessun numero fittizio viene generato.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Aggiunge la combobox pet accessibile, ricerca, annuncio, tastiera e creazione in coda. |
| `src/apps/staff/lib/database.js` | modificato | Espone il solo wrapper staff/demo della RPC atomica. |
| `src/apps/staff/pages/Calendar.css` | modificato | Ripristina il testo primario, stringe la settimana e veste ricerca e creazione. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Integra modal laterale, combobox, conflitto telefono e selezione immediata del nuovo pet. |
| `src/shared/ui/Modal.jsx` | aggiunto | Estrae il modal esistente e aggiunge la sola variante `side`. |
| `src/shared/ui/Modal.css` | aggiunto | Conserva il default e definisce affiancamento desktop e foglio mobile. |
| `supabase/migrations/20260901044304_gh57_calendar_customer_pet.sql` | aggiunto | Rende il telefono nullable e definisce la RPC transazionale custodita. |
| `docs/consegne/GH-57-il-banco-non-deve-inventare-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna.

## Contratto migration e sicurezza

- `SECURITY DEFINER`, `search_path = ''`, oggetti qualificati.
- Guardia diretta su `auth.uid()`, tenant e membership `owner/staff` prima di
  ogni lettura o scrittura applicativa.
- `REVOKE ALL` da `PUBLIC`, `anon`, `authenticated` e `service_role`; riaperto
  soltanto `EXECUTE` ad `authenticated`.
- Misurato: `authenticated=true`, `anon=false`, `PUBLIC=false`.
- Cliente Mario sulla nuova RPC: `42501`, zero scritture.
- Tenant non appartenente allo staff: `42501`, zero scritture.
- Lock transazionale per tenant e cifre canoniche: due formati concorrenti
  dello stesso telefono non possono superarsi durante il controllo.

L'Advisor sicurezza segnala la RPC perche una funzione `SECURITY DEFINER` e
esposta agli autenticati. E l'architettura richiesta dal mandato; la superficie
e limitata dalle guardie appena misurate e non e esposta ad anon/PUBLIC. Gli
altri avvisi Advisor erano preesistenti e fuori perimetro.

## Controprove demo

| Prova | Misura | Esito |
| --- | --- | --- |
| Contrasto precedente | `4,19:1` su surface-main; `3,89:1` su bg-main, misure del mandato | FAIL ereditato |
| Contrasto nuovo | `13,29:1` su velatura/surface-main; `12,22:1` su velatura/bg-main | PASS |
| Colori browser del fatto | sfondo `rgba(111,151,146,.06)`; testo `rgb(43,37,37)` in riepilogo e modo giorno | PASS |
| Desktop 1365 px | griglia destra `900`, pannello sinistra `929`, pannello `420` px, overflow `0` | PASS |
| Desktop 1024 px | griglia destra `630,83`, pannello sinistra `659,84`, pannello `348,16` px, overflow `0` | PASS |
| Telefono 375 x 812 | pannello `375 x 812`, raggio `0`, ombra `none`, piede visibile | PASS |
| Velo e pannello | side `12%`; default/mobile `34%`; pannello `rgb(251,246,243)`, opacity `1` | PASS |
| Tastiera combobox | freccia seleziona, invio conferma, esc chiude; `aria-expanded` true -> false | PASS browser |
| Ricerca con risultati | quattro Ari/Ariel distinti per proprietario; altri match legittimi su proprietario; creazione ultima | PASS browser |
| Ricerca senza risultati | una sola opzione: `Nessun pet ... creane uno nuovo` | PASS browser |
| Creazione riuscita | customer e pet insieme; pet selezionato nello stesso dialog; telefono dichiarato assente e `NULL` | PASS browser/DB |
| Fallimento secondo passo | `sex='x'` rifiutato dal vincolo; customer orfani `0`, pet orfani `0` | PASS in rollback |
| Telefono in altro formato | archivio `+39 333 5700003`, tentativo `3335700003`; `phone_conflict`, nome restituito, scritture `0` | PASS |
| Numero corto | `12345` conservato; confronto saltato; creazione riuscita | PASS in rollback |
| Telefono omesso senza dichiarazione | rifiuto `22023`; customer `0`, pet `0` | PASS in rollback |
| Cliente preesistente | impronta prima/dopo la prova isolata `cbbad3baeef8efa0afc2662738bb0e13` | PASS |
| GH-41 sul nuovo pet | `... ha gia un appuntamento martedi 1 alle 09:00.` | PASS browser |
| GH-37 sul nuovo pet | terzo posto rifiutato `P0001 / GH37_APPOINTMENT_CAPACITY`; riga `0`; helper `available=false`, prima libera `10:00` | PASS |
| Modal staff non modificato | default a 1024: centrato, `520` px, velo `34%`, pannello opaco; nessuna classe `side` | PASS browser |
| Suite RLS completa | `60 PASS, 0 FAIL, 0 SKIP` | PASS |
| Browser pulito | nuova scheda `/calendar`, dialog `0`, errori console `0` | PASS |
| Build | Vite 5.4.21, 159 moduli, `1,17 s`, JS `708,47 kB` (gzip `199,96 kB`) | PASS |
| Whitespace | `git diff --check`, nessun errore | PASS |
| Lint | `eslint: command not found` nella base | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## Modal non cambiati

La variante `side` compare soltanto su `Nuovo appuntamento`. Restano default:

- calendario: `Registra lavorazione`, `Conferma richiesta`, dettaglio
  `Appuntamento`;
- scheda cliente: `Registra visita`, `Modifica Cliente`, `Punti premio`;
- richieste cliente: approvazione e proposta alternative;
- ritaglio foto: implementazione autonoma invariata.

La misura browser del modal `Registra lavorazione` conferma classe
`gh-modal gh-modal--narrow`, centratura `252..772` a 1024 px, larghezza 520 px,
velo 34% e pannello opaco.

## Integrita e pulizia

- Baseline e stato finale: `7 customer`, `7 pet`, `8 appointment`.
- Residui GH-57: customer `0`, pet `0`, visite `0`, appuntamenti `0`.
- RPC temporanea finale `0`; `customers.phone` tornato `NOT NULL` sul demo.
- Sonde GH-04, GH-44 e GH-49: Auth `0`, profiles `0`, membership `0`.
- Login sonda staff dopo teardown: `invalid_credentials`.
- La suite ha aggiornato e ripristinato i campi protetti di Mario, facendo
  avanzare soltanto `updated_at`; valori operativi finali misurati ancora
  `active/manual`. La prova isolata della nuova funzione, prima della suite,
  aveva impronta completa invariata.
- Il teardown custodito GH-44 ha rilevato due righe audit prodotte dalla suite.
  Verificati a zero customer, membership e inviti della sonda, sono state
  eliminate soltanto quelle due righe; il teardown e poi passato.

## Eccezioni e rallentamenti

- Il primo avvio RLS e rimasto in attesa per 90 secondi perche il sandbox non
  risolveva il dominio Supabase. Interrotto senza risultati e rilanciato con
  rete autorizzata: chiusura regolare `60/0/0`.
- Git ha avuto due attese intermittenti nel confronto aggregato; file e oggetti
  erano integri. Dopo il refresh dell'indice, status, diff per file e
  `git diff --check` sono tornati immediati.
- Il controllo browser del campo `time` nativo non ha notificato React in modo
  affidabile, limite gia documentato in GH-41. La fascia satura proponeva
  correttamente la prima ora libera `10:00`; il tentativo alle `09:00` e stato
  provato sia nell'helper usato dalla UI sia sulla guardia DB, senza forzare il
  DOM.
- Nessuna modifica fuori istruzione e nessun dato reale toccato.

## Controllo finale di Luigi

Resta il passo umano previsto dal mandato, sul demo dopo l'applicazione della
migration da parte di Cowork:

1. prenotare da una fascia e chiedersi se la settimana resta leggibile;
2. cercare `ari` e valutare se proprietario e pet distinguono bene gli omonimi;
3. creare un pet con telefono gia presente e valutare il momento della domanda;
4. ripetere sul telefono e chiedersi `cosa non mi torna?`.

## Commit

Commit locale previsto con messaggio `feat: create pets from staff calendar`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
