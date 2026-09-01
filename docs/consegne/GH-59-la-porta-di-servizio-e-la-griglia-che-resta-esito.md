# Consegna GH-59 - La porta di servizio, e la griglia che resta

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `f19742902832f86dc8467a6db6039fae55925806`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, rotta, dipendenza o colore.
- Una sola migration scritta. Non e stata applicata ne registrata: la policy e
  stata installata temporaneamente sul demo per le prove API/RLS e poi
  ripristinata esattamente alla fotografia iniziale.

## Esito

`appointments_staff_all` viene sostituita da tre policy staff separate per
`SELECT`, `INSERT` e `UPDATE`. Ruolo implicito `public`, `USING` e `WITH CHECK`
copiano senza variazioni la condizione esistente
`public.has_tenant_any_staff_access(tenant_id)`. Non esiste una policy staff
`DELETE`: una sessione staff riceve successo, nessuna eccezione e zero righe
cancellate; l'unica porta applicativa resta `delete_staff_appointment`.

La controprova bloccante e passata prima dell'implementazione: sotto la policy
nuova una cancellazione staff del pet ha portato la fixture da `1 pet / 1
appuntamento` a `0 / 0`. La prova era interamente transazionale e si e chiusa
con rollback intenzionale; nessun dato o DDL e rimasto sul demo.

Il dettaglio dell'appuntamento usa ora la variante laterale gia introdotta da
GH-57. Sopra 640 px il calendario applica lo stesso arretramento sia a `Nuovo
appuntamento` sia al dettaglio; sotto 640 px entrambi restano fogli a tutto
schermo. I modali nati dall'intestazione, le conferme e quelli esterni al
calendario conservano il default centrato.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260901070901_gh59_appointments_staff_no_direct_delete.sql` | aggiunto | Sostituisce la policy staff `ALL` con `SELECT`, `INSERT`, `UPDATE`, senza policy `DELETE`. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Accosta il dettaglio e applica l'arretramento ai soli modali nati dalla griglia. |
| `src/apps/staff/pages/Calendar.css` | modificato | Generalizza il selettore di arretramento da prenotazione a modal di griglia. |
| `scripts/rls-tests/run.mjs` | modificato | Adegua il teardown alla porta chiusa: RPC per GH-52 e cascata da pet usa-e-getta per la richiesta customer. |
| `docs/consegne/GH-59-la-porta-di-servizio-e-la-griglia-che-resta-esito.md` | aggiunto | Registro unico del giro. |

`src/shared/ui/Modal.jsx` e `src/shared/ui/Modal.css` sono stati letti ma non
modificati: la variante `side`, il foglio mobile e lo scroll richiesti erano
gia completi. Nessun altro file appartiene alla consegna.

## Policy e ritorno

Fotografia iniziale del demo:

- `appointments_staff_all`: `FOR ALL`, ruolo `{public}`;
  `USING` e `WITH CHECK` entrambi
  `has_tenant_any_staff_access(tenant_id)`;
- `appointments_customer_select`,
  `appointments_customer_request_insert` e
  `appointments_customer_request_update`: definizioni rilevate prima, durante
  e dopo la prova identiche;
- FK `appointments_pet_id_fkey`: `FOREIGN KEY (pet_id) REFERENCES pets(id) ON
  DELETE CASCADE`.

SQL esatta di ripristino della policy precedente:

```sql
BEGIN;

DROP POLICY IF EXISTS appointments_staff_select ON public.appointments;
DROP POLICY IF EXISTS appointments_staff_insert ON public.appointments;
DROP POLICY IF EXISTS appointments_staff_update ON public.appointments;

CREATE POLICY appointments_staff_all
  ON public.appointments FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

COMMIT;
```

La migration non tocca le tre policy customer, `delete_staff_appointment` o
`set_staff_appointment_status`.

## Controprove policy sul demo

| Prova | Misura | Esito |
| --- | --- | --- |
| Cascata bloccante pet | prima `1 pet / 1 appointment`; delete pet `1`; dopo `0 / 0` | PASS, rollback |
| Staff legge | `8` righe lette, count `8` | PASS |
| Staff crea | `4` righe fixture create | PASS |
| Staff modifica | `1` riga aggiornata e riletta | PASS |
| DELETE diretto staff | righe cancellate `0`; eccezione `assente`; riga ancora presente `1` | PASS |
| RPC su riga eliminabile | ritorno id atteso; riga finale `0` | PASS |
| Guardia completato | `23514`, dettaglio `GH58_APPOINTMENT_COMPLETED`, riga `1` | PASS |
| Guardia assenza | `23514`, dettaglio `GH58_APPOINTMENT_NO_SHOW`, riga `1` | PASS |
| Guardia origine customer | `23514`, dettaglio `GH58_APPOINTMENT_CUSTOMER_SOURCE`, riga `1` | PASS |
| Guardia visita collegata | `23514`, dettaglio `GH58_APPOINTMENT_VISIT_LINKED`, riga `1` | PASS |
| Cliente legge | Mario legge `1` propria richiesta | PASS |
| Cliente richiede | Mario crea `1` richiesta pending sul proprio pet | PASS |
| Cliente modifica | Mario aggiorna `1` propria richiesta pending | PASS |
| Suite RLS completa finale | `60 PASS, 0 FAIL, 0 SKIP` | PASS |

Il difetto silenzioso e quindi misurato con le parole richieste: un `DELETE`
diretto negato da RLS riporta successo, cancella zero righe e non solleva
errore.

## Controprove accostamento

| Prova | Misura | Esito |
| --- | --- | --- |
| Dettaglio a 1280 x 800 | pannello `420 x 768`; griglia `794` px; 7/7 giorni visibili; overlap `0`; overflow pannello `no` | PASS |
| Dettaglio a 1024 x 768 | pannello `348,16 x 736`; griglia `609,83` px; 7/7 giorni visibili; overlap `0`; overflow pannello `no` | PASS |
| Nuovo appuntamento a 1024 | pannello laterale `348,16` px; arretramento attivo; overlap `0` | PASS |
| Registra lavorazione a 1024 | default, larghezza `520`; centro modal `512`, centro viewport `512`, delta `0` | PASS |
| Mobile 375 x 812 | pannello `375 x 812`; piede visibile; due gruppi azioni senza overflow; nessun overflow orizzontale pagina | PASS |
| Console browser | errori `0` | PASS |

Restano centrati e invariati:

- calendario: `Registra lavorazione`, `Conferma richiesta`, `Elimina
  appuntamento`;
- scheda cliente: `Registra visita`, `Modifica Cliente`, `Punti premio`;
- richieste cliente: approvazione e proposta alternative;
- album/ritaglio foto: implementazioni autonome fuori calendario.

## Adeguamento suite RLS

Il primo giro sotto la policy nuova ha misurato `59 PASS, 1 FAIL`: la pulizia
GH-52 usava ancora un `DELETE` diretto, riceveva successo silenzioso e lasciava
una riga. La riga e stata rimossa tramite `delete_staff_appointment` e il
teardown e stato cambiato per usare la stessa RPC.

Il secondo giro ha mostrato che anche l'appuntamento customer convertito non
puo essere cancellato dalla RPC, per disegno. La soluzione adottata non apre
eccezioni: la richiesta usa ora un pet Mario usa-e-getta; alla pulizia il pet
viene eliminato e la FK custodita rimuove l'appuntamento in cascata. Il primo
tentativo della nuova fixture, senza `birth_date`, e stato correttamente
rifiutato dalla RPC booking per eta dichiarata mancante (`55 PASS, 5 FAIL`),
con pulizia finale verde. Aggiunta la data di nascita, il giro conclusivo e
`60/0/0` e residui `0`.

## Integrita e pulizia

- Baseline e stato finale demo: `7 customer`, `7 pet`, `90 visite`, `8
  appointment`, `0 appointment_requests`.
- Residui con id/marker GH-59: `0`; fixture GH-52: `0`.
- Policy finale demo: le tre customer originali piu
  `appointments_staff_all FOR ALL`, esattamente come all'ingresso.
- `delete_staff_appointment` temporanea sul demo: assente, come all'ingresso;
  nessuna migration GH-59 registrata.
- Sonde GH-04, GH-44, GH-49: Auth `0`; tenant estraneo GH-49 `0`.
- Audit sonda GH-44 prodotti dai quattro giri: `8`, rimossi con guardia su UUID,
  etichetta e telefono; finale `0`.
- Produzione mai interrogata.

## Verifiche tecniche

- `npm run build`: PASS, Vite 5.4.21, 159 moduli, JS `710,76 kB` (gzip
  `200,62 kB`). Warning non bloccanti: Browserslist datato e chunk oltre 500
  kB.
- `node --check scripts/rls-tests/run.mjs`: PASS.
- `git diff --check`: PASS.
- Server locale chiuso e viewport browser ripristinata dopo le prove.

## Eccezioni e fuori istruzione

- La prima proposta di installazione temporanea e stata bloccata perche avrebbe
  lasciato una policy sensibile attiva senza rollback atomico. La controprova
  bloccante e stata quindi eseguita in una singola transazione conclusa da
  rollback intenzionale; per le prove API Luigi ha poi autorizzato
  esplicitamente la finestra temporanea sul demo.
- Un'import del client Supabase nel test usa-e-getta puntava a un percorso non
  esistente; corretto in `/private/tmp`, senza modifica al repository.
- Il primo avvio API non risolveva il dominio Supabase nel sandbox; rilanciato
  con rete autorizzata, senza scritture nel tentativo fallito.
- Una lettura strutturale del demo ha impiegato circa 45 secondi; rallentamento
  segnalato, poi rientrato a 3-9 secondi.
- La scheda browser creata prima della conferma login e scaduta fra due turni;
  riaperta senza effetti sui dati.
- L'avviso macOS via `osascript` e stato riusato per errore nonostante fosse
  stato dismesso perche il clic porta al Finder. Decisione confermata: non
  verra piu usato; restano soltanto gli avvisi nativi di Codex.
- Nessuna altra modifica fuori istruzione.

## Controllo finale di Luigi

Resta il passo umano previsto dal mandato, sul demo dopo l'applicazione della
migration da parte di Cowork e dopo un reload dall'origine:

1. aprire il dettaglio di un appuntamento e valutare quanto calendario resta
   utile per decidere uno spostamento;
2. ripetere su schermo piccolo e valutare i due gruppi di pulsanti;
3. eliminare un pet con appuntamenti e verificare che spariscano dal
   calendario.

La domanda resta `cosa non ti torna?`.

## Commit

Commit locale previsto con messaggio
`feat: close direct staff appointment deletion`. L'hash e riportato nella
risposta finale. Nessun push eseguito.
