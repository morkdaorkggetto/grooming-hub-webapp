# Consegna GH-60 - Bagno o taglio

## Base e perimetro

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `5c160828cb0fd6e89f7cba64a9f389d4dcfcbb54`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), rilevato `ACTIVE_HEALTHY`.
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, rotta, dipendenza o colore.
- Una migration scritta. Non applicata ne registrata: e stata installata
  temporaneamente sul demo, provata e rimossa nella stessa sessione.

## Esito

Le nuove lavorazioni possono classificare il servizio con la FK facoltativa
`visits.service_id`. Il valore viene sempre dal catalogo `services`; il modulo
non contiene nomi, prezzi o durate codificati. Selezionare un servizio propone
il prezzo corrente del listino, ma il costo resta un normale campo modificabile.

Il campo `Trattamenti eseguiti` resta indipendente e invariato. Il servizio non
e obbligatorio. Le lavorazioni vecchie senza classificazione non mostrano
avvisi o richieste di completamento; quando il servizio esiste, il suo nome
compare sobriamente sopra la descrizione nello storico.

La chiusura atomica di un appuntamento riceve `p_service_id` facoltativo,
verifica che appartenga allo stesso tenant e lo salva sulla visita. Firma,
`search_path`, natura `SECURITY INVOKER`, controlli staff, atomicita e ACL sono
rimasti invariati per tutto il resto.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260901113254_gh60_visit_service.sql` | aggiunto | Colonna, FK `ON DELETE SET NULL`, indice e nuova firma della RPC atomica. |
| `src/apps/staff/lib/database.js` | modificato | Carica listino e servizio appuntamento, valida il tenant e salva `service_id` nei due flussi. |
| `src/apps/staff/components/VisitForm.jsx` | modificato | Scelta facoltativa da catalogo, proposta dinamica del costo e precompilazione non distruttiva. |
| `src/apps/staff/pages/AddVisit.jsx` | modificato | Trasmette servizio e contesto dell'appuntamento al modulo condiviso. |
| `src/apps/staff/components/StaffKit.jsx` | modificato | Mostra il nome del servizio solo sulle visite che lo possiedono. |
| `docs/consegne/GH-60-bagno-o-taglio-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna.

## Migration e ritorno

La migration:

1. aggiunge `visits.service_id uuid NULL`, senza default;
2. collega `services(id)` con `ON DELETE SET NULL`;
3. indicizza soltanto i valori non nulli;
4. sostituisce la vecchia firma della RPC con la stessa funzione e il parametro
   finale facoltativo `p_service_id uuid DEFAULT NULL`;
5. non contiene alcun `UPDATE public.visits` e non deduce dati dal testo.

SQL di ritorno completo:

```sql
BEGIN;

DROP FUNCTION public.complete_appointment_with_visit(
  text, date, text, text, numeric, uuid
);

DROP INDEX public.visits_service_id_idx;

ALTER TABLE public.visits
  DROP CONSTRAINT visits_service_id_fkey,
  DROP COLUMN service_id;

CREATE FUNCTION public.complete_appointment_with_visit(
  p_appointment_id text,
  p_date date,
  p_treatments text,
  p_issues text,
  p_cost numeric
)
RETURNS public.visits
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_appointment public.appointments;
  v_visit public.visits;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_appointment
  FROM public.appointments a
  WHERE a.id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_appointment.tenant_id) THEN
    RAISE EXCEPTION 'Appointment not available to current staff user'
      USING ERRCODE = '42501';
  END IF;

  IF v_appointment.approval_status <> 'approved'
     OR v_appointment.status IN ('cancelled', 'no_show') THEN
    RAISE EXCEPTION 'Appointment cannot be completed' USING ERRCODE = '23514';
  END IF;

  IF p_date IS NULL OR p_cost IS NULL OR p_cost <= 0 THEN
    RAISE EXCEPTION 'A visit date and positive cost are required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_visit
  FROM public.visits v
  WHERE v.appointment_id = v_appointment.id;

  IF FOUND THEN
    RETURN v_visit;
  END IF;

  INSERT INTO public.visits (
    id, pet_id, tenant_id, appointment_id, date, treatments, issues, cost
  ) VALUES (
    gen_random_uuid()::text,
    v_appointment.pet_id,
    v_appointment.tenant_id,
    v_appointment.id,
    p_date,
    NULLIF(btrim(p_treatments), ''),
    NULLIF(btrim(p_issues), ''),
    p_cost
  )
  RETURNING * INTO v_visit;

  UPDATE public.appointments
     SET status = 'completed', updated_at = now()
   WHERE id = v_appointment.id;

  RETURN v_visit;
END;
$$;

COMMENT ON FUNCTION public.complete_appointment_with_visit(
  text, date, text, text, numeric
)
IS 'GH-27: atomically add a visit linked to an approved appointment and mark it completed.';

REVOKE ALL ON FUNCTION public.complete_appointment_with_visit(
  text, date, text, text, numeric
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.complete_appointment_with_visit(
  text, date, text, text, numeric
) TO authenticated, service_role;

COMMIT;
```

Questo ritorno e stato eseguito sul demo dopo le prove. La firma finale e
nuovamente quella a cinque parametri e l'ACL finale e esattamente
`postgres`, `authenticated`, `service_role` con solo `EXECUTE`.

## Controprove dati e funzione

| Prova | Misura | Esito |
| --- | --- | --- |
| Nuova lavorazione con servizio | FK uguale al servizio scelto; descrizione manuale `[DEMO GH-60] ... bagno, unghie e nodi` riletta identica | PASS |
| Nuova lavorazione senza servizio | insert riuscito; `service_id = null` | PASS |
| Proposta e costo manuale | listino temporaneo `20,00`; riga salvata `25,00` | PASS |
| Listino dinamico | listino portato da `20,00` a `21,00`; nuova lettura `21,00` senza build | PASS |
| Chiusura appuntamento | prenotato primo servizio, scelto il secondo; visita salva il secondo | PASS |
| Atomicita precedente | visita collegata all'id appuntamento; appuntamento finale `completed` | PASS |
| Eliminazione servizio | visita ancora presente; FK passata a `null` | PASS |
| Tenant del servizio | la RPC accetta soltanto un servizio dello stesso tenant dell'appuntamento | PASS |
| Suite RLS | `60 PASS, 0 FAIL, 0 SKIP` | PASS |

## Storico

Il dato `470 lavorazioni` nel mandato e la misura del salone riportata da
Cowork. Il database ammesso dal mandato, il demo, ne contiene invece `90`.
Non era autorizzato leggere la produzione per replicare la misura: la
controprova sul perimetro disponibile e quindi stata eseguita su tutte le 90
righe demo.

- prima: `90` visite, `90` senza servizio, digest trattamenti
  `8b1607071997fbafe7990792954e1330`;
- durante, subito dopo il DDL: `90` visite, `90` senza servizio, stesso digest;
- dopo fixture e teardown: `90` visite, stesso digest;
- nessun riempimento retroattivo e nessun testo modificato.

## Controprove interfaccia

| Prova | Misura | Esito |
| --- | --- | --- |
| Modulo manuale | opzioni `Nessun servizio`, `Bagno`, `Toelettatura Completa`, tutte lette dal demo | PASS |
| Prezzo proposto | scelta `Bagno` propone `30,00`, valore corrente ripristinato del demo | PASS |
| Prezzo modificabile | campo abilitato; sostituito a mano con `25` senza cambiare servizio | PASS |
| Da appuntamento | `Bagno` selezionato automaticamente e costo `30,00` | PASS |
| Cambio a consuntivo | selezionato `Toelettatura Completa`; proposta aggiornata a `45,00` | PASS |
| Storico precedente | nessun avviso, badge o richiesta di completamento sulle righe senza servizio | PASS |
| Mobile 375 x 812 | overflow pagina `0`; griglia campi `321/321`; azioni `321/321` | PASS |

Nessuna lavorazione e stata salvata dal browser: le scritture misurate erano
fixture API separate e sono state rimosse.

## Advisor e sicurezza

- Funzione GH-60: `SECURITY INVOKER`, `search_path = ''`, nessuna esecuzione
  per `anon`, ACL invariata.
- Advisor Security: nessuna segnalazione nuova riferibile alla funzione GH-60.
  Restano gli avvisi gia presenti sulle RPC pubbliche intenzionali e sulla
  protezione password compromesse disabilitata. Riferimento:
  <https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>.
- Advisor Performance: soli avvisi preesistenti RLS/indici. Nessuna correzione
  fuori mandato. Riferimento:
  <https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select>.
- La suite richiede `delete_staff_appointment`, assente sul demo all'ingresso:
  la funzione GH-58 e stata installata temporaneamente, ha prodotto il noto
  warning `SECURITY DEFINER`, ed e stata rimossa. Finale: assente come prima.

## Pulizia e stato finale demo

- Fixture GH-60: `0` visite, `0` appuntamenti, `0` servizi.
- Listino Bagno ripristinato a `3000` centesimi.
- Sonde GH-04, GH-44 e GH-49: `0` Auth, identities, profiles e membership.
- Tenant estraneo GH-49: `0`.
- Audit GH-44 prodotti dalla suite: `2`, rimossi soltanto per UUID, etichetta e
  telefono della sonda; finale `0`.
- `visits.service_id`: assente, come all'ingresso.
- Migration GH-60 registrate sul demo: `0`.
- Server locale chiuso, scheda browser chiusa e viewport ripristinata.

## Verifiche tecniche

- `npm run build`: PASS; Vite 5.4.21, 159 moduli, bundle JS `712,85 kB`
  (gzip `201,27 kB`), 1,31 s. Warning non bloccanti: Browserslist datato e
  chunk oltre 500 kB.
- `git diff --check`: PASS, nessun errore di spaziatura o riga.
- `npm run lint`: non eseguibile perche il repository dichiara lo script ma
  non installa `eslint` (`eslint: command not found`). Nessuna dipendenza e
  stata aggiunta fuori mandato.

## Eccezioni e fuori istruzione

- Il primo avvio della prova API non poteva risolvere il dominio Supabase nel
  sandbox; il tentativo e fallito prima del login e senza scritture. Rilanciato
  con rete autorizzata.
- La suite RLS ha invalidato globalmente la sessione browser della stessa
  sonda durante il controllo. La pagina gia caricata ha comunque consentito
  le sole letture visive previste; nessun salvataggio browser e stato tentato.
- Nessuna modifica fuori istruzione rilevata nel worktree.

## Controllo finale di Luigi

Dopo l'applicazione della migration sul demo da parte di Cowork e un reload
dall'origine:

1. registrare una lavorazione da zero e valutare la rapidita della scelta;
2. chiudere un appuntamento e cambiare il servizio precompilato;
3. guardare una lavorazione vecchia e verificare che l'assenza del servizio sia
   neutra, senza inviti a completare lo storico.

La domanda resta `cosa non ti torna?`.

## Commit

Commit locale previsto: `feat: classify visits by service`. Hash nella
risposta finale. Nessun push.
