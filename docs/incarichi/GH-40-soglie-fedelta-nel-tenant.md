# Incarico GH-40 — Le soglie fedeltà: una sola scala, dentro il tenant

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Decisione del salone**: Davide, 29 agosto.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto: la scala è scritta due volte, e non lo sa nessuno

**Misurato.** Le soglie esistono in **due posti indipendenti**, con gli stessi numeri per coincidenza e nessun meccanismo che li tenga allineati:

| Dove | Cosa contiene |
|---|---|
| `src/apps/staff/lib/fidelity.js` | `visitsRequired` 12 / 24 / 36, `monthsWindow` 12 / 24 / 36, `pointsRequired` 100 / 250 / 500 |
| funzione `get_public_pet_card` nel database | gli stessi numeri, scritti a mano dentro il `plpgsql` |

Il primo governa quello che vede **il salone**, il secondo quello che vede **il cliente sul cartoncino**. Se qualcuno cambiasse uno solo dei due, per settimane nessuno se ne accorgerebbe: il cliente e l'operatore vedrebbero due livelli diversi per lo stesso cane, ciascuno convinto di avere ragione.

## Perché si cambia — la misura che ha convinto il salone

Storico misurato sulla produzione il 29/8, su 30 cani osservati per almeno quattro mesi:

| | |
|---|---:|
| ritmo mediano | **8,45 visite l'anno** |
| intervallo mediano fra due visite | 49 giorni |
| cani che tengono 12 visite l'anno | **3 su 30** |
| cani con almeno 12 visite negli ultimi 12 mesi | **0 su 288** |

Con le soglie di allora — 12 visite in 12 mesi per il Bronzo — **nessun cliente del salone poteva vedere altro che «Livello Base»**, e il Bronzo distava circa un anno e sette mesi. La card pubblica dedicava la sua metà inferiore a tre barre che dicevano tre volte «sei lontano».

Criterio adottato, formulato da Claude Design in CD-04: **una soglia è una promessa solo se qualcuno l'ha già superata. Finché nessuno l'ha fatto, è un annuncio.**

## La decisione di Davide

| Livello | Prima | **Adesso** | Finestra |
|---|---:|---:|---:|
| Bronzo | 12 | **6** | 12 mesi |
| Argento | 24 | **12** | 24 mesi |
| Oro | 36 | **36** | 36 mesi |

Le finestre restano invariate. **L'Oro resta severo per scelta**: 36 visite in 36 mesi è una al mese per tre anni, un ritmo che oggi tiene un cliente abituale su dieci.

*Effetto atteso al momento del cambio, misurato sulla produzione*: **un cane** raggiunge il Bronzo — quello con sei visite. Il livello nasce quasi vuoto e si riempie nei mesi: al ritmo mediano si arriva a sei visite in circa otto mesi e mezzo, e lo storico è lungo sei.

## Invarianti

**Una sola scala.** Dopo questo mandato le soglie stanno **in un posto solo**, e sia il gestionale sia la funzione pubblica leggono da lì. Il posto è `tenants.settings`, accanto a `booking_schedule`, `workstation_capacity` e `whatsapp_phone`. **Non deve essere possibile cambiarne una senza cambiare l'altra**, perché non ci sono più due cose.

**Cambiare le soglie non richiede una build.** È la stessa ragione della capienza: il prossimo salone avrà un altro ritmo, e questo stesso salone potrebbe voler correggere fra sei mesi guardando i dati veri.

**La scala è coerente per costruzione.** Soglie strettamente crescenti, finestre strettamente crescenti, valori interi positivi. Una configurazione incoerente va **rifiutata dal database**, come già accade per la capienza: se accettassimo un Argento più basso del Bronzo, il livello «corrente» diventerebbe indeterminato.

**Il salone e il cliente vedono lo stesso livello per lo stesso cane.** È l'invariante che dà senso a tutto il resto, e va **provata dal vivo** su un cane con visite: livello letto dal gestionale e livello letto dalla card pubblica, confrontati.

**Nessuna visita viene toccata.** Cambiano le soglie, non i conteggi.

## La strada dei punti — decisione

Esiste un secondo modo di salire di livello: 100 / 250 / 500 **punti premio**. Misurato: la tabella `reward_points` contiene **sei righe in tutta la produzione**, e nessun cane si avvicina a 100. È un binario costruito e mai usato.

**Non si rimuove in questo giro** — toglierlo tocca la logica in tre punti e non è ciò che il salone ha chiesto. Ma **le sue soglie seguono le altre nelle impostazioni del tenant**: se restano scritte a mano mentre le altre si spostano, fra un mese avremo di nuovo due posti invece di uno, che è esattamente il difetto che questo mandato chiude.

Da riportare nel registro come domanda aperta per Luigi: **cosa sono i punti premio, e chi li assegna.** Finché non ha risposta, quel binario resta inerte.

## Controprove

Dichiara nel registro, misurate sul demo:

- soglie lette dal tenant in **entrambe** le superfici, e **nessun numero di soglia rimasto scritto a mano** in `fidelity.js` o nella funzione pubblica — cercato e non trovato;
- un cane con **6 visite negli ultimi 12 mesi** risulta **Bronzo** sia nel gestionale sia sulla card pubblica, confrontati fianco a fianco;
- lo stesso cane, con la soglia riportata a 12 **cambiando solo l'impostazione e senza ricostruire l'app**, torna Base in entrambe;
- una configurazione incoerente — Argento più basso del Bronzo — viene **rifiutata dal database**;
- i conteggi visite restano invariati prima e dopo;
- build verde; suite RLS invariata o estesa.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, una cosa da fare con gli occhi dopo il rilascio: **aprire la scheda del cane con più visite nel gestionale e poi la sua card pubblica**, e verificare che dicano la stessa cosa. È l'unica prova che il cliente e il salone stiano guardando lo stesso mondo.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy. **Le soglie in produzione le scriverà Luigi, o Cowork su sua autorizzazione, dopo il rilascio.**
