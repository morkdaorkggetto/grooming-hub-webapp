# Incarico GH-54 — La settimana di Roby: esecuzione della composizione CD-06

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 31 agosto 2026
**Realizza:** la composizione `CD-06`. **Priorità dichiarata dal salone.**
**Superficie:** `/calendar`. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy.

## Dove sono i materiali

`Prototipo/CD-06-consegna/` — fuori dal worktree: `CD-06-handoff.md`, `cd06-planning-kit.jsx`, `cd06-planning-viste.jsx`, `cd06-planning-note.jsx`, il canvas. **Da versionare in `design_handoff_staff_app/`.**

### ⚠ Due file già consegnati sono cambiati: vanno sostituiti, non affiancati

`CD-06` porta modifiche retroattive a materiali di giri precedenti. **Se in `design_handoff_staff_app/` esistono copie più vecchie, vanno sostituite con quelle di questa consegna:**

- **`gh15-ed-kit.jsx`** — `STATES` passa da 6 a 8 voci: **`completato` e `annullato` non esistevano**, pur essendo due delle etichette che teniamo esplicitamente. `annullato` è neutro, non `danger`: è un fatto, non un allarme.
- **`gh15-ed-kit.jsx`** — `StateTag` guadagna una guardia. Leggeva `STATES[s][0]` senza controllo: **una chiave sconosciuta azzerava l'intero documento** — pagina bianca. Ora degrada a un'etichetta neutra. Il componente è condiviso da `GH-15`, `CD-01` e `CD-06`.
- **`shared-ui.jsx`** — due icone nuove: `chevron-left` e `arrow-left`.

> **Attenzione, e va verificato prima di copiare**: `GH-53` ha **già introdotto** l'icona rivolta a sinistra nel codice di produzione. **Non duplicarla.** Riconcilia: nel prodotto ne esiste una sola.

## Verifica dei sette campi ⚠ — fatta da Cowork sui dati reali

| CD ha marcato | Esito misurato |
|---|---|
| `tenants.settings.postazioni` | **esiste**, ma la chiave è **`workstation_capacity`**. Valore **3** |
| ora precisa dell'appuntamento | **esiste**: `scheduled_at`, `timestamptz` |
| durata dell'appuntamento | **esiste**: `duration_minutes`, intero |
| servizio sull'appuntamento | **esiste**: `service_id` |
| istante della richiesta | **esiste** con l'ora → **il preavviso è calcolabile** |
| «entrati di solito» | **non è una colonna**: si calcola. Vedi sotto |
| orari e chiusure per fascia | **solo metà.** Vedi sotto |

### Le chiusure ci sono, gli orari no

`tenants.settings.booking_schedule` contiene **`closed_weekdays: ["sunday"]`**, **`closed_time_preferences: {monday: ["morning"]}`** e il fuso `Europe/Rome`. **Non contiene gli orari 9–13 e 13–19**: quelli sono la definizione di fascia unificata da `GH-39`, che vive nel codice.

**Invariante per questo mandato**: la griglia legge **le chiusure dal tenant** e **i confini delle fasce dalla definizione condivisa** introdotta da `GH-39` — **una sola, mai riscritta a mano qui**. Se ti trovi a scrivere «9» o «13» in questa vista, ti sei perso.

**Coda annotata, non da fare qui**: anche gli orari appartengono al tenant, come le chiusure. Arriveranno con la schermata delle impostazioni.

## Risposte alle domande aperte di CD-06

**9.1 — il margine. La divisione proporzionale fra le fasce non si fa.**

CD proponeva di calcolare gli «entrati di solito» sul giorno e dividerli fra mattina e pomeriggio in proporzione agli orari, dichiarandolo come stima. **Scartato**: è precisione inventata, ed è la stessa famiglia di errore che ha fermato la catena G6 quattro volte.

Al suo posto **due numeri veri, di natura diversa e dichiarata**:

- **per fascia**: quanti posti delle tre postazioni sono già occupati da appuntamenti in quella fascia. È **concorrenza**, ed è esatta;
- **per giorno**: quanti entrano di solito senza appuntamento. È **volume**, ed è storica.

Il secondo, misurato sulla produzione su 90 giorni di lavoro: **mediana 5**, nono decile **10**, record **14**, media ultimi due mesi **4,9**.

> **E il numero racconta una cosa che vale la pena sapere**: su 5,2 cani al giorno, **5,1 entrano senza appuntamento**. Il flusso diretto non è un caso residuo — è quasi tutto il lavoro del salone.

**Le due unità non si sommano e non si mescolano.** Se la composizione le mostra vicine, devono restare leggibili come due cose diverse.

**9.3 — le postazioni sono intercambiabili. Confermato da Davide**: ha due collaboratori, sono **sei mani** e chiunque può fare qualunque lavorazione. **«Tre» è un numero che dice la verità**, e la scelta di non nominare le postazioni resta.

> **E non implica tre account.** Gli altri operatori **non usano l'app**: sono mani, senza compiti di gestione. Chi registra e prenota resta il salone attraverso l'accesso esistente. Nessuna vista deve suggerire che a una postazione corrisponda una persona con un accesso.

**9.4 — chiusa da una misura.** `visits.appointment_id` esiste: **12 visite su 469** sono collegate a un appuntamento. «Entrati senza appuntamento» si conta **escludendo quelle collegate**. Il doppio conteggio che temeva non è inevitabile.

**9.5 — due settimane insieme: non ora.** Arriverà, e la forma a mezze giornate la regge. Coda.

**9.2 — Roby prenota oltre il margine, sempre**, con l'avviso. Confermata la scelta di CD: un avviso che blocca al banco, con una persona davanti, viene aggirato entro una settimana.

## Invarianti

I **quattordici punti del §7 di CD-06** sono dichiarati deliberati. **Non sono da migliorare.** Se uno ti sembra sbagliato, fermati e dichiaralo. In particolare, i tre che è più facile «semplificare» per sbaglio:

**La grana è la mezza giornata, non l'ora.** Una griglia oraria sarebbe vuota per l'ottanta per cento e direbbe a vista «sei quasi fermo» — falso e demoralizzante. **Non è una semplificazione provvisoria.**

**Le lavorazioni senza ora stanno nel piede, mai dentro una fascia.** Nemmeno dedotte da `created_at`. `visits.date` è una data secca: **la colonna resta muta**, e va bene così.

**Il margine non è spazio libero: è spazio tenuto**, e non si toglie quando la settimana è vuota — è lì che serve di più.

Più:

**Nessun numero di capienza, orario o volume scritto nel codice della vista.** Capienza e chiusure dal tenant, fasce dalla definizione condivisa, volume calcolato.

**«Prenota qui» apre il modulo esistente e non crea niente.** Precompila giorno, fascia e un'ora proposta; il cliente resta da scegliere, ed è lì che vivono i controlli su capienza, blacklist e doppioni. **Nessuna scorciatoia che salti la guardia di `GH-37` o l'avviso di `GH-41`.**

**Settimana e giorno sono due modi della stessa pagina**, con l'interruttore nella stessa posizione di `CD-03`, e **passando di modo resta la data**.

**Sul telefono la settimana si ribalta, non si rimpicciolisce** — e sul telefono **il «prenota qui» non c'è**: il telefono serve a leggere, si prenota al banco.

> **Vincolo di implementazione che CD ha imparato correggendo, e che va rispettato**: sotto i 640px le schede giorno vogliono `flex-shrink: 0` e il contenitore `min-height: 0`. Con i valori predefiniti le schede assorbono il deficit di altezza **restringendosi in silenzio**, e la prima cosa che sparisce è il piede «entrati senza appuntamento» — cioè la risposta alla domanda più difficile del brief, invisibile proprio nel formato di ripiego.

**Le parole del §10 sono approvate**, a partire dal titolo: **«Dove lo metto»**. Non «Planning», non «Vista settimanale». È la domanda che Roby si fa al banco.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- le **tre settimane** di `cd06-planning-viste.jsx` rese dal vivo: tipo, vuota, piena — più il modo giorno e il telefono;
- **domenica chiusa** e **lunedì mattina chiuso**, letti dal tenant e non scritti a mano;
- la **capienza cambiata nelle impostazioni** cambia il margine **senza ricostruire l'app**;
- una giornata con **appuntamenti e lavorazioni senza ora insieme**: i due gruppi restano distinti, e il piede **non sparisce sul telefono**;
- il conteggio «entrati senza appuntamento» **esclude** le visite collegate a un appuntamento;
- **«prenota qui»** apre il modulo e **non crea nulla**; provando a superare la capienza, la guardia di `GH-37` scatta come prima;
- **«Imminente» non compare** più da nessuna parte;
- `StateTag` con una **chiave sconosciuta** non azzera la pagina;
- **una sola icona** rivolta a sinistra esiste nel prodotto;
- build verde; suite RLS invariata — questa vista non tocca le policy.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, due cose da fare con gli occhi **su un computer**, che qui è il caso normale:

1. la **settimana prossima, vuota**: deve somigliare a una settimana, non a un errore;
2. una settimana con **due appuntamenti e cinque entrati senza appuntamento**: guardandola, si deve capire quanto è stata piena davvero quella giornata.

Poi la stessa cosa sul telefono, per verificare che il piede ci sia ancora.

## Chiusura

Registro in `docs/consegne/`, committato col codice, con i materiali di `CD-06` in `design_handoff_staff_app/`. Niente push, niente merge, niente deploy.
