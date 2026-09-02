# Incarico GH-68 — Che cane è

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna query nuova, nessun dato toccato.**
**Chiesto dal salone — Roby e Davide.** Superficie: la scheda dell'appuntamento nel planner. File attesi: `components/CalendarKit.jsx`, `pages/Calendar.jsx`, `pages/Calendar.css`. **Nessuna rotta nuova.**

**Perimetro**: nessun accesso alla produzione; nessun push, merge o deploy. **Fixture in memoria**, non nel database.

## Da dove nasce

Il salone chiede **un elemento in più per distinguere il pet**: i nomi si ripetono. Misurato in produzione il 2/9: **128 pet su 320 condividono il nome con un altro** — dodici «barboncino», sei fra «kira» e «kyra», sei «Leo».

E aggiungono una seconda ragione, che è quella che decide: **la razza serve anche a capire il tipo di lavorazione.** Un bagno su un barboncino grande e un bagno su un maltese non sono lo stesso lavoro.

### Perché la razza e non il proprietario

Entrambi erano candidati. Misurati:

| | razza | proprietario |
|---|---:|---:|
| copertura | 314 / 320 — **98%** | 320 / 320 |
| entro 14 caratteri | 271 — 86% | 261 — 88% |
| **che contengono cifre** | **0** | **133 — 45%** |
| ambiguità residue | 19 gruppi | 1, ed è un doppione |
| serve anche a… | **capire il lavoro** | solo identificare |

Il proprietario disambigua meglio, **ma il campo è il quaderno trascritto**: `Anna che lavora al bar +39 389 215`, `Ragazza straniera (che piace a Rosaria`, `vigilessa3387731252`. La razza no: **zero cifre su 314 valori**, e i più lunghi sono `barboncino grande`, `Barboncino medio`, `Barboncina bianca e nera` — cioè taglia e colore, che è esattamente ciò che serve a stimare la lavorazione.

> **E c'è un argomento che ieri non esisteva: adesso la ricerca c'è.** Per capire *quale* Leo si scrive il proprietario e la scheda si accende. **Il colpo d'occhio non deve più portare l'identità: deve portare quello che la ricerca non dà — che cane è.**

## Cosa fare

**Sulla scheda dell'appuntamento, la razza prende il posto della parola «Appuntamento».**

- con razza: `barboncino · 60′`
- **senza razza — sei pet su 320: resta `Appuntamento · 60′`**, identica a oggi. Nessun buco, **nessun avviso, nessun invito a completare**;
- il nome del pet, il servizio aggiunto da `GH-61` e le etichette restano dove sono.

**La razza si legge dal dato, non si normalizza.** In archivio convivono `barboncino` e `Barboncino`, `maltese` e `Maltese`: **si mostra come è scritta.** Ripulire le grafie è un'altra faccenda, e non si fa passando di qui.

**La troncatura la fa il foglio di stile, con i puntini.** Nessun conteggio di caratteri nel codice: è il tipo di numero scritto nella vista che vietiamo da otto mandati. Così in **vista giorno** `Barboncina bianca e nera` si legge intera, e nella colonna stretta si accorcia da sola. **Il valore completo resta disponibile per esteso** a chi ci passa sopra e a chi legge con uno screen reader.

**Il proprietario non va sulla scheda**: resta nel dettaglio e nella ricerca, dove è già.

## Invarianti

**Nessuna migrazione, nessuna query nuova, nessun dato toccato.** La razza è già caricata con il pet nella vista: **non aggiungere letture.** Se ti trovi a scrivere SQL, ti sei perso.

**Nessun nome di razza scritto nel codice.** Tutto dal dato.

**Non si toccano**: la marcatura della ricerca al 45% (`GH-67`), la normalizzazione del telefono (`GH-65`), il segnaposto `pet, proprietario, cell` (`GH-66`), il servizio sulla scheda (`GH-61`), le frecce e il ritorno a oggi.

**Nessun colore nuovo, nessuno spessore nuovo, nessuna riga in più sulla scheda**: la razza **sostituisce** una parola, non se ne aggiunge una.

**Restano gli invarianti di `GH-54` → `GH-67`**: grana a mezza giornata, lavorazioni senza ora mai in fascia, margine che non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px, lessico ammesso solo `lavorati sul momento`, `chi arriva`, `senza ora fissata`, il peso segue l'agibilità, l'arretramento appartiene al contenitore.

## Controprove

Dichiara nel registro, misurate con **fixture in memoria**. **Numeri, non aggettivi.**

- **scheda con razza** e **scheda senza razza** nella stessa settimana: riporta il testo esatto che si legge su entrambe;
- **razza lunga in colonna stretta** a 1365 e 1024px: riporta **cosa si legge davvero**, parola per parola, e che il valore intero resta disponibile;
- **vista giorno**: la razza lunga si legge intera;
- **l'altezza della scheda non cambia**: misurata prima e dopo, in entrambi i casi;
- **il servizio di `GH-61` è ancora sulla sua riga** e non è stato spostato né sostituito;
- **nessuna lettura nuova**: dimostra che la razza arriva dal dato già caricato, senza query aggiunte;
- **le grafie non sono state normalizzate**: una `barboncino` e una `Barboncino` si mostrano come sono;
- **non regressioni**: ricerca per nome, proprietario e cellulare parziale; marcatura al 45% invariata; conteggi in alto invariati;
- **a 375px**: la scheda regge, il piede non sparisce;
- build verde. **Suite RLS: da non rieseguire.** Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **guarda una settimana intera**: adesso che c'è la razza, si capisce a colpo d'occhio che giornata sarà — o è solo un'altra parola?
2. **cerca i due Leo**: fra `barboncino` e l'altro, capisci quale è quale senza aprirli?
3. **una scheda senza razza**: sembra normale, o sembra mancante?

La prima è quella che conta: **la razza è entrata per dire che lavoro ti aspetta, non solo per distinguere due nomi uguali.** Se guardando la settimana non lo dice, abbiamo messo la parola giusta nel posto sbagliato.

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-68-che-cane-e-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
