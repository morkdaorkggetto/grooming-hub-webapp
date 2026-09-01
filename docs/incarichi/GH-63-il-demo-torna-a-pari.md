# Incarico GH-63 — Il demo torna a pari

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Forma breve (regola 4).** **Nessun codice applicativo.** Solo allineamento dell'ambiente di prova.
**Perimetro**: database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`). **Produzione `azgehoseiojodltcttfb`: non leggerla e non scriverla.** Nessun push, merge o deploy.

## Da dove nasce

Le migrazioni le applica Cowork **in produzione**, su autorizzazione di Luigi. Il demo le riceve solo in prestito: installate a mano e rimosse a fine giro. Dopo quattro giri il divario è di **quattro migrazioni**, e `GH-61` ci ha già rinunciato a una controprova visiva perché sul demo `visits.service_id` non esiste.

> **Il demo dovrebbe essere il palcoscenico di prova, ed è diventato l'ambiente più vecchio dei due.**

## Cosa fare

**Applicare al demo, in quest'ordine**, dalla cartella `webapp/supabase/migrations/`:

1. `20260901044304_gh57_calendar_customer_pet.sql`
2. `20260901060131_gh58_delete_staff_appointment.sql`
3. `20260901070901_gh59_appointments_staff_no_direct_delete.sql`
4. `20260901113254_gh60_visit_service.sql`

**E registrarle nel registro delle migrazioni del demo**, così il divario non si riapre al giro dopo. È la parte che finora non abbiamo mai fatto.

### Prima, il preflight — e vale come autorizzazione a fermarsi

Le migrazioni presuppongono uno stato preciso. **Misuralo prima di applicare qualsiasi cosa:**

- `customers.phone` è `NOT NULL`?
- esiste `public.normalize_phone_it`? **Senza, `gh57` fallisce a metà;**
- esiste la policy `appointments_staff_all` `FOR ALL`? **`gh59` la elimina senza `IF EXISTS`;**
- `complete_appointment_with_visit` esiste con la firma a **cinque** parametri, e in **una sola** versione? **`gh60` elimina esattamente quella;**
- `visits.service_id` è assente, `delete_staff_appointment` e `create_calendar_customer_pet` sono assenti?
- quante righe ha già il registro delle migrazioni, e quali.

**Se una sola di queste non corrisponde, fermati e dichiaralo.** Non adattare i file: sono gli stessi identici applicati in produzione, e devono restare tali — un demo allineato a un file diverso non è un demo allineato.

> **`supabase db push` è vietato anche qui.** Il registro del demo non corrisponde ai nomi dei file: un push non applicherebbe le quattro mancanti, proverebbe a rieseguire **l'intera catena dall'inizio**, G6 compreso. Stessa trappola della produzione, ambiente diverso.

## Invarianti

**Nessun file applicativo toccato.** Se ti trovi in `src/`, ti sei perso.

**I quattro file non si modificano.** Nemmeno una riga, nemmeno un `IF EXISTS` di comodo.

**Nessun dato del demo cancellato o riscritto.** Le migrazioni aggiungono colonne, funzioni e policy: non toccano righe. Dimostralo.

**Le sonde e le fixture dei giri precedenti restano fuori**: questo mandato non ne crea.

## Controprove

Dichiara nel registro, misurate sul demo:

- **il preflight**, voce per voce, **prima** di applicare;
- dopo: `customers.phone` annullabile; `create_calendar_customer_pet`, `delete_staff_appointment` presenti; `visits.service_id` presente e **tutta nulla**; `complete_appointment_with_visit` in **una sola** versione a sei parametri;
- **le policy di `appointments`**: sei in tutto — tre staff `SELECT`/`INSERT`/`UPDATE`, tre cliente invariate, **nessuna su `DELETE`, nessuna `FOR ALL`**;
- **conteggi prima e dopo**: clienti, pet, visite, appuntamenti — **identici**;
- **impronta di `treatments` e `issues`** prima e dopo: identica;
- **le quattro migrazioni compaiono nel registro del demo**, con i loro nomi;
- **suite RLS rieseguita** sul demo allineato;
- **e la controprova rinviata da `GH-61`**, ora possibile: una visita con `issues` storico **si legge ancora** nella scheda pet caricata dal browser.

## Passo finale — lo guarda Luigi (regola 5)

Non c'è niente da guardare a schermo: questo giro non cambia il prodotto.

**Quello che serve è una riga nel registro**: da adesso il demo è allineato alla produzione, e il prossimo mandato che deve provare qualcosa **non dovrà installare niente in prestito**.

## Chiusura

Registro in `docs/consegne/GH-63-il-demo-torna-a-pari-esito.md`, committato. Niente push, niente merge, niente deploy, **e la produzione non è stata toccata né letta.**
