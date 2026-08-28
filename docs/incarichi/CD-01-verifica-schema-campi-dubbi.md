# CD-01 — Verifica in schema degli undici campi ⚠ del calendario

**Misurato da:** Cowork, 27 agosto 2026 · **Fonti:** produzione `grooming` (sola lettura), migration di Gate 2 e GH-08, sorgenti applicativi.
**Risponde a:** §8 dell'handoff `design_handoff_staff_app/CD-01-handoff.md`.

## Esito in una riga

**Otto campi su undici esistono.** Uno è decisivo e regge: **l'appuntamento confermato ha l'ora**, quindi gli oggetti del calendario restano tre e non due. Due campi non esistono e cadono; uno esiste come tabella ma è vuoto.

## Tabella

| # | Campo ⚠ | Esiste? | Misura |
|---:|---|---|---|
| 1 | `requests[]` | **SÌ** | `public.appointment_requests`, creata da GH-08 con RLS e due RPC. Colonne: `id`, `tenant_id`, `customer_user_id`, `pet_id`, `service_id`, `desired_date`, `time_preference`, `coat_condition_codes`, `coat_condition_notes`, `declared_pet_age`, `status`, `appointment_id`, `created_at`, `updated_at`. |
| 2 | `requests.fascia` | **SÌ** | `time_preference`, vincolata a `morning` / `afternoon` / `flexible`. Nullable: la fascia è facoltativa, come previsto. |
| 3 | `requests.manto[]` | **SÌ** | `coat_condition_codes text[]`, vincolata ai cinque codici: `some_knots`, `very_matted`, `heavy_shedding`, `sensitive_skin`, `clean_long`. Massimo cinque elementi. |
| 4 | `requests.nota` | **SÌ** | `coat_condition_notes`, massimo 500 caratteri. Vincolo aggiuntivo: **almeno uno fra codici e nota deve essere presente**, quindi una richiesta senza alcuna indicazione sul manto non può esistere. |
| 5 | `requests.age` | **SÌ** | `declared_pet_age text`, massimo 80 caratteri. È testo libero, non un numero: comporre di conseguenza. |
| 6 | `requests.state` | **SÌ** | `status`, vincolato a `pending` / `approved` / `rejected`. Coincide esattamente con i tre stati composti. |
| 7 | `requests→appointment` | **SÌ** | `appointment_id` UNIQUE con vincolo di riferimento verso `appointments`. Il legame dopo la conversione esiste ed è uno-a-uno. |
| 8 | **`appointments.time`** | **SÌ — ed è la risposta che salva il disegno** | `appointments.scheduled_at` è `timestamptz`: contiene data **e ora**. Esiste anche `duration_minutes`. **L'oggetto «appuntamento confermato» regge, e il calendario ha tre oggetti come composto.** |
| 9 | `visits.amount` | **SÌ** | `visits.cost numeric`, valorizzata su **464 visite su 464**. Non serve il ripiego `—`: il dato c'è sempre. |
| 10 | `message.sent_at` | **NO** | Nessuna tabella di messaggi, notifiche o invii esiste nello schema. Nessun campo `sent_at`, `message_sent` o `notified_at`. Vedi sotto: risponde anche alla domanda §9.2. |
| 11 | `promotions[]` | **tabella SÌ, contenuto ZERO** | `public.promotions` esiste con `title`, `body`, `image_url`, `valid_from`, `valid_to`, `cta_label`, `cta_url`, `display_order`, `is_active`. Sul progetto di prova ha **0 righe**. Le due promozioni viste finora vivevano solo sul demo. |

## Risposta misurata alla §9.2 — «il messaggio parte dall'app o si apre WhatsApp?»

**Si apre WhatsApp.** L'applicazione costruisce un collegamento `https://wa.me/<numero>?text=<messaggio>` e lo apre: il testo arriva già scritto, ma l'invio è un gesto che l'operatore compie **dentro WhatsApp**, fuori dall'applicazione, che non ne sa nulla.

Sommato al campo 10, la conseguenza è netta: **«confermato» oggi è dichiarato e non verificabile.** Nessun dato registra se il messaggio sia partito.

Questo è esattamente il rischio che CD segnalava al §10.3 di GH-15 e che questo disegno voleva chiudere. Non lo chiude da solo: senza una traccia, «Conferma e invia» resta un bottone che fa due cose di cui l'applicazione ne verifica una sola.

**Non è un difetto di composizione ed è fuori dal mandato di CD.** È una decisione di prodotto per Luigi, e ne vedo tre:

1. **Accettarlo e dirlo.** La conferma registra l'ora e apre WhatsApp; se l'operatore non invia, la richiesta resta in attesa e si rivede nella coda. Costo zero, onesto, ma dipende dalla disciplina di chi tocca lo schermo in un salone pieno.
2. **Registrare l'intenzione, non l'invio.** Un campo tipo `confirmation_opened_at` che segna che il messaggio è stato *preparato*. Dice meno di quanto sembri e rischia di sembrare una garanzia che non è: sconsigliato.
3. **Far partire davvero il messaggio dall'applicazione** con un servizio di messaggistica. È l'unica che rende «confermato» verificabile, ed è un capitolo di prodotto a sé — costo, numero mittente, consenso — non una rifinitura di questo giro.

Raccomandazione: **la prima adesso**, con la coda delle richieste in attesa come rete di sicurezza, e la terza annotata fra le cose da valutare quando il meccanismo sarà rodato — che è la stessa condizione che il salone ha posto per l'intero assetto.

## Le promozioni — risposta alla §9.1 di CD

La tabella esiste e ha una struttura completa: non sono «una cosa che tengono a mente». Ma in produzione **è vuota**, e nessuno l'ha mai popolata al di fuori del demo.

Il sospetto di CD resta però fondato nel merito: la domanda che il salone aveva in testa nominando le promozioni potrebbe non essere «mostrami le campagne attive» ma «chi non torna da un po'». Sono due viste diverse, e la seconda si costruirebbe sui dati che abbiamo già — 464 visite con date. **Domanda per Davide**, non risolvibile a tavolino.

Nel frattempo la scelta di CD di non comporle è quella giusta: comporre una vista su una tabella vuota, il cui scopo è incerto, è il modo migliore per buttare del lavoro.

## Regola per Codex

I campi 10 e 11 **non si compensano**. Nessuna traccia d'invio va inventata, nemmeno derivandola dall'apertura del collegamento WhatsApp; nessuna promozione va mostrata finché la tabella è vuota. Le righe sono dimensionate per reggere l'assenza — è scritto nel §8 dell'handoff.

Confermato inoltre, per la terza volta e in tre giri diversi: **`visit.operator` non esiste.** Il campo «Chi lavora» presente nella modale di conferma va rimosso.
