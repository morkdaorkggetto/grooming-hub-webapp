# Incarico GH-73 — Una qualifica che si conferisce

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 8 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Chiesto dal salone — Davide.** Superficie: scheda del pet lato staff, e il livello mostrato al cliente. File attesi: una migrazione, `apps/staff/lib/fidelity.js`, `apps/staff/lib/database.js`, `pages/ClientDetail.jsx`, l'app clienti dove il livello compare. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy. **La produzione non si tocca.**

## Da dove nasce

Davide vuole **conferire uno status ai clienti storici**, per scelta sua, indipendentemente dalle soglie.

E i numeri dicono perché serve. Misurati in produzione l'8/9, su **335 pet**:

| livello raggiunto per soglia | pet |
|---|---:|
| oro | **1** |
| argento | 0 |
| bronzo | 3 |
| **nessuno** | **331 — il 98,8%** |
| visite in 12 mesi, media | **1,6** |
| il cane più assiduo del salone | **7** |

La soglia del bronzo è **6 visite in 12 mesi**, e **il migliore ne ha sette**. Non è una taratura sbagliata: è che ogni cane torna ogni 49 giorni in mediana, quindi **circa sette volte l'anno è il massimo strutturale**.

**Le soglie non si toccano** — decisione di Luigi, confermata. **Il livello resta del cane**, non del padrone.

> **L'unico «oro» esistente non è un cliente affezionato**: sono tre movimenti di prova sullo stesso pet (`lucky`, 22 aprile: +30, +500, −30). Sono gli unici punti mai assegnati in tutto l'archivio.

### Perché non si usano i punti

Tecnicamente basterebbero: il livello si raggiunge per visite **oppure** per punti, quindi 100 punti fanno un bronzo.

**Ma il conferimento sarebbe espresso in una moneta il cui cambio può cambiare.** Se Davide desse 100 punti a venti clienti storici e un domani la soglia del bronzo si spostasse a 150, **quei venti perderebbero in silenzio lo status che il salone aveva dato loro.**

**Un riconoscimento discrezionale non deve dipendere da una taratura.**

## Cosa fare

### 1 — La qualifica conferita

**Migrazione**: una colonna su `pets` che porta la qualifica conferita — `bronze`, `silver`, `gold` — oppure nulla. **Vincolo sui valori ammessi**, e i valori sono **le stesse chiavi già usate** in `fidelity_tiers`: non inventarne di nuove.

**Annullabile e senza valore predefinito**: i 335 pet esistenti restano **senza qualifica conferita**, ed è corretto che si veda.

**Non è scrivibile dal cliente.** La lista dei campi che un cliente può aggiornare è chiusa a tre — `owner_notes`, `coat_preferences`, `owner_photo_url` — ed è imposta dal database. **Verifica che resti chiusa** e dichiaralo: una colonna nuova non deve aprirla.

### 2 — Il livello effettivo è il più alto dei due

In `getFidelityTierSnapshot` la qualifica conferita entra **accanto** al calcolo esistente, non al suo posto.

**Il livello effettivo è il più alto fra quello raggiunto e quello conferito.** Così un cane che poi arriva davvero alle visite **non retrocede mai**, e uno premiato dal salone non perde il premio se smette di venire.

**Non si toccano**: le soglie, il conteggio delle visite nella finestra, i punti, e il calcolo di *quanto manca* al livello successivo. **Si aggiunge una fonte, non si cambia la matematica.**

**Il livello successivo va calcolato rispetto a quello effettivo**: chi ha l'argento conferito deve vedersi mancare l'oro, non l'argento che ha già.

### 3 — Il salone vede la differenza, il cliente no

**Per il cliente il livello è il suo livello**, e basta: nessuna distinzione fra guadagnato e conferito. Non deve leggere «te l'hanno regalato».

**Per il salone la differenza è il punto**: sulla scheda del cane si legge **perché** quel livello è lì.

- `Oro · 36 visite negli ultimi 36 mesi`
- `Oro · conferito dal salone`

**E si può togliere.** Un conferimento che non si revoca è una decisione irreversibile presa in due secondi.

**Chi può conferire**: lo staff, con le guardie già in uso per gli altri gesti sulla scheda del pet.

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro. **Nessuna scrittura in produzione, nessuna lettura della produzione.**

**Nessun ritocco alle soglie**, né in `tenants.settings` né nel codice. **Nessun valore di soglia scritto nella vista.**

**Nessun punto assegnato o rimosso.** `reward_points` non si tocca: i tre movimenti di prova su `lucky` restano dove sono, e sono una coda separata.

**Il livello resta del pet.** Non aggregare per cliente, nemmeno per comodità di visualizzazione.

**La lista dei campi scrivibili dal cliente resta di tre.**

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-72`, e in particolare: **l'informazione compare dove ha un lavoro da fare** — un pet senza qualifica conferita non mostra segnaposti né inviti a conferirne una.

## Controprove

Dichiara nel registro, misurate **sul demo**. **Numeri, non aggettivi.**

- **pet senza niente**: nessun livello, e **nessun invito a conferirne uno**;
- **pet con qualifica conferita `bronze` e zero visite**: livello effettivo bronzo; **il prossimo livello mostrato è l'argento**, non il bronzo;
- **pet che raggiunge l'oro per visite e ha `bronze` conferito**: livello effettivo **oro** — il calcolo vince, il conferimento non fa retrocedere;
- **pet con `gold` conferito e oro anche per visite**: nessuna doppia visualizzazione, nessun conteggio raddoppiato;
- **revoca**: tolta la qualifica, il livello torna a quello calcolato, **e le visite non sono state toccate** — impronta prima e dopo;
- **la scheda staff dice perché**: riporta testualmente le due diciture, per un livello guadagnato e per uno conferito;
- **lato cliente non compare nessuna distinzione**: dimostralo con una ricerca nel codice dell'app clienti;
- **un cliente autenticato non può scrivere la colonna nuova**: prova diretta, `42501` o rifiuto del whitelist; e **la lista dei campi scrivibili è ancora di tre**;
- **valori non ammessi rifiutati** dal vincolo del database: una prova con un valore inventato;
- **i punti non sono cambiati**: conteggio dei movimenti e somma, prima e dopo;
- **le soglie non sono cambiate**: `fidelity_tiers` identico prima e dopo;
- **suite RLS rieseguita**: questo mandato porta una colonna su una tabella con policy;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **conferisci l'oro a un cane e poi toglilo**: il gesto è chiaro, e si capisce che è una decisione del salone e non un calcolo?
2. **guarda la scheda di un cane con l'oro conferito**: si distingue da uno che l'ha guadagnato?
3. **guarda come lo vedrà il cliente**: sembra un premio, o sembra un'etichetta?

La terza è quella che conta: **è un riconoscimento, e deve somigliare a un riconoscimento.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-73-una-qualifica-che-si-conferisce-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
