# Incarico GH-60 — Bagno o taglio

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Chiesto dal salone oggi.** Superficie: il modulo della lavorazione. File attesi: `components/VisitForm.jsx`, `pages/AddVisit.jsx`, `apps/staff/lib/database.js`, una migrazione nuova. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy. **La produzione non si tocca.**

## Da dove nasce

Il salone dice che l'app non registra se una lavorazione è stata un bagno o un taglio. **Non è un difetto: quel campo non è mai esistito.** `visits` ha `date`, `treatments` (testo libero), `issues`, `cost`, `photo_url`. **L'appuntamento sa il servizio — `appointments.service_id` — la lavorazione no.**

Ed è la lavorazione a generare l'incasso e la storia.

### Cosa ha prodotto il testo libero, misurato su 470 lavorazioni

| come l'hanno scritto | quante |
|---|---:|
| `bagnetto` | **88** |
| `Bagnetto` | **44** |
| testi contenenti «bagno» | 168 |
| testi contenenti «taglio» / «tosat» | 125 |
| bagno **e** taglio insieme | 15 |
| `Toelettatura` / `Toelettatura completa` | 10 |
| **vuoto** | **15** |

> **Sei grafie per due servizi.** Il testo libero non classifica: ricorda soltanto. Chi domanda «quanti bagni a luglio?» e cerca «bagno» ne perde **132** scritti «bagnetto». Cowork ci è cascato nella prima interrogazione, il 1/9.

**I servizi sono due e vivono in tabella**: `Bagno` 20 € / 45 min, `Taglio` 30 € / 90 min. **Nessuno dei due va scritto nel codice.**

## 1 — La colonna che manca

**Migrazione**: `visits.service_id`, annullabile, chiave esterna a `services` con `ON DELETE SET NULL` — un servizio cancellato non deve portarsi via lo storico.

**Annullabile e basta**, senza valore predefinito: le 470 lavorazioni esistenti restano **senza servizio**, ed è corretto che si veda.

> **Nessun riempimento retroattivo, e non è un rinvio: è una decisione di Luigi dell'1/9.** Le modifiche valgono **da adesso in avanti**. Dedurre il servizio dal testo di 470 lavorazioni sarebbe un'inferenza scritta sopra dati veri, e il salone non l'ha chiesta. **Non è una coda: non si farà.** Lo storico resta la storia di come si lavorava prima.

**E `complete_appointment_with_visit` guadagna il parametro del servizio.** È l'altra strada per creare una lavorazione, e se resta senza, chiudere un appuntamento produce una visita senza servizio **proprio nel caso in cui il servizio era già noto** — il peggiore dei due.

Disciplina della catena: `search_path` fissato, staff verificato, tenant verificato, privilegi invariati rispetto a com'è oggi. **Non cambiarne il comportamento su nient'altro.**

## 2 — Il modulo

**Si sceglie il servizio** fra quelli letti da `services` — non un elenco scritto a mano.

**Il costo si propone dal listino e resta modificabile.** Misurato: il costo medio reale è **23,51 €** per il solo bagno contro un listino di 20, e **32,52 €** per il solo taglio contro 30. **Il salone applica spesso più del listino, e ha ragione lui.** Un prezzo imposto produrrebbe dati falsi — lo abbiamo già visto il 31 agosto con il costo obbligatorio e le tre visite da 1,00 €.

**Quando la lavorazione chiude un appuntamento, il servizio arriva già compilato dall'appuntamento**, e resta modificabile: il cane era prenotato per un bagno e alla fine gli hanno fatto anche il taglio.

**Il testo libero resta, e non in alternativa.** Il servizio è la **classificazione**; «bagno, unghie, aveva molti nodi» è la **descrizione**. Servono entrambe, e il campo «Trattamenti eseguiti» non si tocca.

**Il servizio non diventa obbligatorio.** Se un giorno il salone fa qualcosa che non è nessuno dei due, deve poter registrare la lavorazione lo stesso. **Un campo obbligatorio che non si può soddisfare onestamente produce dati falsi** — è la lezione del 31 agosto, e vale anche qui.

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro.

**Nessun riempimento dello storico.** Le 470 lavorazioni esistenti restano com'erano: `service_id` nullo, `treatments` intatto. Se ti trovi a scrivere un `UPDATE` su `visits`, **fermati e dichiaralo**.

**Nessun prezzo, durata o nome di servizio scritto nel codice.** Tutto da `services`.

**Il costo resta modificabile**, e `treatments` resta dov'è.

**Nessun colore nuovo, nessuna rotta nuova**, e restano intatti gli invarianti di `GH-54` → `GH-59`: i moduli che nascono dalla griglia si accostano e quelli dell'intestazione restano centrati; grana a mezza giornata; lavorazioni senza ora mai dentro una fascia; `flex-shrink: 0` e `min-height: 0` sotto i 640px; lessico ammesso **solo** `lavorati sul momento`, `chi arriva`, `senza ora fissata`; il peso visivo segue l'agibilità; l'arretramento appartiene al contenitore.

## Controprove

Dichiara nel registro, misurate **sul demo** con fixture usa-e-getta, rimosse a fine sessione:

- **una lavorazione nuova con servizio**: la riga porta `service_id`, e `treatments` resta quello scritto a mano;
- **una lavorazione nuova senza servizio**: si salva, `service_id` resta nullo, **niente blocca**;
- **il costo proposto** cambia scegliendo il servizio, **e sovrascrivendolo a mano resta quello scritto**: salva 25 € su un bagno da 20 e rileggi la riga;
- **chiudendo un appuntamento**, il servizio arriva precompilato **dall'appuntamento**, e cambiandolo la lavorazione salva quello scelto, non quello prenotato;
- **cambiando il listino nelle impostazioni dei servizi**, la proposta cambia **senza ricostruire l'app**;
- **lo storico è intatto**: conteggio delle 470 lavorazioni con `service_id` nullo prima e dopo il giro, e `treatments` invariato — è la prova che nessun riempimento è avvenuto;
- **un servizio eliminato** non porta via la lavorazione: `service_id` diventa nullo e la riga resta;
- `complete_appointment_with_visit` **non ha cambiato comportamento** su nient'altro: la visita nasce, l'appuntamento si chiude, il collegamento regge;
- **suite RLS rieseguita**: questo mandato tocca una funzione e una tabella;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **registra una lavorazione partendo da zero**: scegliere il servizio è più veloce che scrivere «bagnetto», o è un passaggio in più?
2. **chiudi un appuntamento**: il servizio precompilato è quello giusto, e si cambia senza fatica?
3. **guarda una lavorazione vecchia**: il servizio assente si legge come una cosa che non veniva registrata, senza allarmi né buchi da riempire?

Sulla terza, per chiarezza: **lo storico resta com'è per decisione presa**, e non deve invitare nessuno a rimediare — non un avviso, non un «da completare», non un campo evidenziato in giallo.

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-60-bagno-o-taglio-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
