# GH-15 — Verifica in schema dei campi ⚠ dichiarati da Claude Design

**Misurato da:** Cowork, 24 agosto 2026 · **Fonte:** produzione `grooming` (`azgehoseiojodltcttfb`), sola lettura.
**Risponde a:** §8 dell'handoff `Prototipo/GH-15-consegna/GH-15-handoff.md`.

> **Nota sulla validità dopo G6.** Le misure sono prese sullo schema legacy di produzione. La migrazione aggiunge a `visits` le colonne `tenant_id` e `pet_id` e ne rimuove `client_id`, ma **non tocca le colonne di contenuto** (`date`, `treatments`, `issues`, `cost`, `discount_percent`). Ogni risposta qui sotto resta perciò valida anche dopo la migrazione.

## Colonne reali di `visits`

`id · client_id → pet_id · date · treatments · issues · cost · discount_percent · created_at · updated_at`

Nient'altro. Non esistono operatore, durata, foto.

## Esito campo per campo

| Campo ⚠ | Esiste? | Misura | Conseguenza per la composizione |
|---|---|---|---|
| `visit.operator` | **NO** | nessuna colonna in `visits`; nessuna derivazione attendibile | **La colonna sparisce**, come previsto da CD. È lo stesso campo mancato in GH-09: la decisione di allora — niente dato inventato, niente attribuzione al tenant — resta valida. Anche il pick «Chi ha lavorato» nel form non è salvabile. |
| `visit.amount` | **SÌ** | `visits.cost`, valorizzata su **464 visite su 464**, media **25,86 €** | Importo e totale di periodo si possono mostrare. È il campo meglio alimentato dell'intero storico. |
| `visit.duration` | **NO** | non in `visits`. Esiste `appointments.duration_minutes`, ma è un'altra tabella e un altro oggetto | Il campo «Durata» esce dal form. |
| `visit.photos` | **NO** | esiste una sola foto **del pet** (`clients.photo` → `pets.photo_url`), su 48 clienti di 296. Non esistono foto legate alla visita | «Foto prima / dopo» esce dal form. |
| `visit.note` | **SÌ, ma sono due** | `treatments` valorizzato su **453/464**, `issues` su **34/464** | Non esiste un campo unico «nota». `treatments` è il contenuto della riga; `issues` è l'eccezione rara. Comporre la seconda riga sapendo che nel 93% dei casi `issues` è vuoto. |
| `appointment.state` | **SÌ, ma sono due** | `status` (3 valori in uso: scheduled, completed, cancelled) e `approval_status` (`pending`, introdotto da GH-08) | Il pallino è alimentabile. Attenzione: «in attesa» vive su `approval_status`, non su `status`. Sono assi diversi e vanno letti insieme. |
| `services[]` con prezzo | **NO, di fatto** | la tabella `services` esiste nello schema nuovo ma è **vuota**; e la decisione «solo incassi» (Luigi, 21/8) esclude un listino esposto | Il chip servizio **perde il suffisso di prezzo**. L'incasso si digita, non si sceglie. Non è una mancanza tecnica: è il modello del salone, che non fissa prezzi in anticipo. |
| `operators[]` | **SÌ come persone, NO come collegamento** | `profiles` (4 righe con `role`) e `tenant_memberships` (3) danno l'elenco | Si può elencare chi lavora, ma **non si può registrare chi ha fatto quella visita**: manca il campo su `visits`. Elencarli senza poterli salvare sarebbe una promessa non mantenuta. |
| `client.lastVisit` | **derivabile** | da `visits.date`; GH-05-bis già la deriva lato client | Sostenibile. Verificare il costo su 282 schede quando la lista non è più il dataset pilota. |
| `client.visitCount` | **derivabile** | idem | Idem. |
| `fidelity.points` | **SÌ, ma quasi inutilizzata** | tabella `reward_points` presente: **6 righe in tutto**, su 296 clienti | Il dato è distinto dalle visite, quindi la domanda di CD ha risposta: sono due cose diverse. Ma il pannello vestirebbe una funzione praticamente mai usata. |
| `requests.unread` | **SÌ, alimentabile** | `appointment_requests` esiste (GH-08) con RLS e RPC; 0 righe perché il lato clienti non è ancora in produzione | Il contatore funzionerà, ma **parte da zero** e resterà a zero finché i clienti non saranno invitati. Prevedere che lo stato normale delle prime settimane sia «nessuna richiesta». |

## Risposte misurate alle domande aperte del §9

**§9.4 — «Lo score di affidabilità è mai stato usato?»** Sì. **11 clienti su 296 hanno uno score diverso da zero e 1 è in blacklist.** Uso modesto ma reale: non è una funzione morta. Si somma alla tesi di CD nel §10.2 — lo score serve nel momento in cui si decide se confermare una richiesta, e finora quel momento non esisteva. Il pannello resta.

**§9.3 — «"Ultima visita" è utile o decorativa?»** Non rispondibile dai dati: non abbiamo telemetria d'uso. Domanda per Davide.

**§9.2 — «"Salva e nuova" serve?»** Non rispondibile dai dati. Domanda per Davide, con un indizio a favore: 464 visite e zero appuntamenti da maggio suggeriscono registrazione a consuntivo, possibilmente in blocco a fine giornata.

**§9.7 — «Le cinque aree operative sono tutte vive?»** Da verificare route per route in Fase 1, insieme al resto del confronto.

## Osservazione non richiesta, ma misurata

`visits.discount_percent` è **valorizzata in 0 visite su 464**. Lo sconto esiste nello schema e non è mai stato usato. Se compare nel form della visita, è un campo morto: vale la pena decidere se toglierlo o lasciarlo, ma non vestirlo senza saperlo.

## Regola per Codex

Ogni riga «NO» di questa tabella significa **la colonna sparisce e il resto non si ricompone** — CD ha dimensionato le griglie proprio per reggerlo. Nessun campo mancante va inferito, derivato per approssimazione o riempito con un valore plausibile.
