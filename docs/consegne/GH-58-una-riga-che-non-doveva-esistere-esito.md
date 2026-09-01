# Consegna GH-58 - Una riga che non doveva esistere

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `bfd24c3` (`GH-58 scritto + correzione diario: 35 appuntamenti, non 271`).
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, nuova rotta, dipendenza o colore.
- Una sola migration scritta. Non e stata applicata ne registrata sul demo o
  sulla produzione: e stata provata in rollback e installata solo
  temporaneamente sul demo per le prove API/browser, poi rimossa.

## Esito

Il dettaglio dell'appuntamento distingue ora la disdetta dall'errore di
inserimento. `Annulla appuntamento` resta nel gruppo operativo esistente;
`Elimina` e separato da una spiegazione, usa il peso quieto `ghost` e apre una
seconda conferma irreversibile.

La conferma nomina il pet, il giorno e l'ora letti dalla riga vera e ricorda che
una disdetta va annullata, non eliminata. Il completato non espone il gesto. Una
assenza lo espone per poter spiegare il percorso corretto, ma la RPC la rifiuta
finche lo staff non usa `Annulla assenza`.

Il browser non esegue piu un `DELETE` diretto su `appointments`: chiama soltanto
`delete_staff_appointment`. La funzione custodita blocca, con dettagli distinti,
completati, assenze, origine customer, richieste customer collegate e visite
collegate; elimina soltanto righe `operator` scheduled/cancelled prive di
storia collegata.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Aggiunge gesto quieto, conferma nominativa, messaggio per l'assenza e aggiornamento calendario senza reload pagina. |
| `src/apps/staff/lib/database.js` | modificato | Sostituisce il delete diretto con la RPC e traduce i quattro rifiuti in messaggi operativi. |
| `supabase/migrations/20260901060131_gh58_delete_staff_appointment.sql` | aggiunto | Definisce la sola RPC custodita e i privilegi minimi. |
| `docs/consegne/GH-58-una-riga-che-non-doveva-esistere-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna.

## Contratto migration e sicurezza

- `SECURITY DEFINER`, `search_path = ''`, oggetti qualificati.
- `auth.uid()` obbligatorio e membership diretta `owner/staff` sul tenant
  dell'appuntamento, dopo lock `FOR UPDATE` della riga.
- Guardie nell'ordine: `completed`, `no_show`, origine/richiesta customer,
  visita collegata.
- Dettagli distinti: `GH58_APPOINTMENT_COMPLETED`,
  `GH58_APPOINTMENT_NO_SHOW`, `GH58_APPOINTMENT_CUSTOMER_SOURCE`,
  `GH58_APPOINTMENT_VISIT_LINKED`.
- Nessun aggiornamento a `pets`, `visits` o `appointment_requests`; nessuna
  modifica a `set_staff_appointment_status`.
- `REVOKE ALL` da `PUBLIC`, `anon`, `authenticated`, `service_role`; riaperto
  soltanto `EXECUTE` ad `authenticated`.
- Privilegi misurati: `authenticated=true`, `anon=false`, `PUBLIC=false`.
- Chiamata API customer Mario: `42501`, riga invariata.
- Chiamata API anon: `42501 permission denied for function`, riga invariata.
- Staff su appuntamento di tenant estraneo: `42501`, riga invariata.

L'Advisor sicurezza segnala la nuova RPC perche una funzione
`SECURITY DEFINER` e eseguibile da `authenticated`. E la superficie richiesta
dal mandato; le guardie interne, il rifiuto customer e i privilegi sono stati
misurati. Gli altri avvisi Advisor su funzioni preesistenti e leaked-password
protection erano gia presenti e sono fuori perimetro.

## Controprove demo

| Prova | Misura | Esito |
| --- | --- | --- |
| Scheduled operator | funzione restituita; riga `0` | PASS |
| Cancelled operator | funzione restituita; riga `0` | PASS |
| Completed | dettaglio `GH58_APPOINTMENT_COMPLETED`; appointment `1`, link visita `1` | PASS |
| Visita collegata su scheduled | dettaglio `GH58_APPOINTMENT_VISIT_LINKED`; appointment `1`, link visita `1` | PASS |
| Origine customer | dettaglio `GH58_APPOINTMENT_CUSTOMER_SOURCE`; riga `1` | PASS |
| Riga `appointment_requests` collegata a source operator | stesso dettaglio customer; appointment `1`, request link `1` | PASS |
| No-show rifiutato | dettaglio `GH58_APPOINTMENT_NO_SHOW`; punteggio `1 -> 0`, poi invariato `0` sul tentativo | PASS |
| Ciclo assenza completo | `Annulla assenza`: punteggio `0 -> 1`; delete riuscito; finale `1`, uguale alla partenza | PASS |
| Tenant estraneo | `42501`, riga `1` | PASS |
| Customer autenticato | `42501`, riga `1` | PASS SQL/API |
| Anon | execute negato, `42501`, riga `1` | PASS API |
| Conferma programmato | `Elimini l'appuntamento di Fido di mercoledi 2 settembre alle 09:30?` | PASS browser |
| Conferma annullato | stessa frase con ora reale `10:30`; seconda riga sulla disdetta presente | PASS browser |
| Aggiornamento scheduled | card sparita; prenotati `3 -> 2`; nessun reload pagina | PASS browser |
| Aggiornamento cancelled | piede `1 annullato` sparito; prenotati rimasti `2` | PASS browser |
| Completato nella UI | pulsanti `Elimina`: `0`; visita ancora collegata prima della pulizia | PASS browser/DB |
| Assenza nella UI | messaggio: `Prima usa Annulla assenza: il punto torna al pet...` | PASS browser |
| Dopo ciclo assenza | card sparita; prenotati `2 -> 1`; resta solo il completato fixture | PASS browser |
| DELETE diretto appointments nel browser | ricerca `.from('appointments').delete`: `0` | PASS |
| Suite RLS completa | `60 PASS, 0 FAIL, 0 SKIP` | PASS |
| Build | Vite 5.4.21, 159 moduli, `1,27 s`, JS `710,73 kB` (gzip `200,61 kB`) | PASS |
| Whitespace | `git diff --check`, nessun errore | PASS |
| Lint | `eslint: command not found` nella base | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## Integrita e pulizia

- Baseline e stato finale demo: `7 customer`, `7 pet`, `90 visite`,
  `8 appointment`, `0 appointment_requests`.
- Residui con id/marker `demo-gh58-*`: appointment `0`, visite `0`.
- Punteggio del pet usato nel ciclo: finale `1`, identico alla partenza.
- RPC temporanea finale `0`; nessuna riga di migration registrata.
- Sonde GH-04, GH-44 e GH-49: Auth `0`, profiles `0`, membership `0`.
- Tenant estraneo GH-49 `0`; audit sonda GH-44 `0`.
- La suite ha prodotto due righe audit per lo scollegamento custodito GH-44.
  Verificati prima a zero customer, membership e inviti della sonda, sono
  state rimosse soltanto quelle due righe prima del teardown.

## Eccezioni e rallentamenti

- La prima prova SQL in rollback ha rifiutato il tenant usa-e-getta per il
  vincolo fidelity GH-40. Transazione annullata e residui misurati a zero;
  ripetuta copiando le impostazioni valide del tenant demo, con tutte le prove
  verdi.
- Una lettura strutturale Supabase ha impiegato circa 31 secondi; il
  rallentamento e stato segnalato e la risposta e poi arrivata regolarmente.
- La scheda browser temporanea si e chiusa mentre attendeva l'autorizzazione
  esplicita all'eliminazione; nessun dato era stato eliminato. Riaperta nella
  stessa sessione e prove riprese dalla conferma.
- La ricreazione delle sonde canoniche GH-44/GH-49 e stata inizialmente
  bloccata dal controllo di sicurezza. Luigi l'ha autorizzata esplicitamente;
  sonde create solo sul demo e smontate nella stessa sessione.
- Nessuna modifica fuori istruzione e nessun dato reale toccato.

## Controllo finale di Luigi

Resta il passo umano previsto dal mandato, sul demo dopo l'applicazione della
migration da parte di Cowork:

1. aprire un appuntamento passato e completato e valutare l'assenza del gesto;
2. provare l'assenza di Ciccio e valutare se il messaggio dice davvero cosa
   fare prima;
3. eliminare un appuntamento scelto da Luigi e valutare se la conferma evita
   lo scambio di riga.

La domanda resta `cosa non ti torna?`.

## Commit

Commit locale previsto con messaggio `feat: guard staff appointment deletion`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
