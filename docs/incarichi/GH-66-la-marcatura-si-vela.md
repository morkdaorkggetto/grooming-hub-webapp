# Incarico GH-66 — La marcatura si vela

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna query, nessun dato toccato.**
**Superficie:** la scheda trovata e il campo di ricerca del calendario. File attesi: `pages/Calendar.css`, `components/CalendarKit.jsx`. **Nessuna rotta nuova.**

**Perimetro**: nessun accesso alla produzione; nessun push, merge o deploy. **Fixture in memoria**, non nel database — come in `GH-65`, e questa volta è scritto.

## Da dove nasce

`GH-65` ha risolto il difetto di `GH-64`: la scheda trovata adesso **si vede**. Misurato sui pixel: 86,5% della superficie contro l'1,8% della vicina, quarantasette volte.

**Ma guardandola, Luigi la trova troppo carica.** Tre segnali impilati — campitura piena, contorno da 2px, bordo scurito — dove ne basta uno che porti l'area.

E c'è un effetto collaterale che tradisce l'eccesso: **la campitura piena ha costretto a scurire le scritte secondarie** della sola scheda trovata, per salvarne il contrasto. È precisamente ciò che `GH-56` ha vietato — **l'arretramento, e la marcatura, appartengono al contenitore, non alle lettere.** Se una scelta di superficie obbliga a ritoccare il testo, la scelta è troppo forte.

## 1 — Velata, e senza spessori nuovi

| | oggi | dopo |
|---|---|---|
| campitura | primario **pieno** | **velata** |
| bordo | scuro, spessori 1/1/1/3 | scuro, **spessori invariati** |
| contorno aggiunto | 2px, offset 1px | **via** |
| testo secondario della trovata | scurito | **invariato**, come tutte le altre schede |

**Il segnale sta nell'area, non nell'intensità.** È la misura di `GH-65` a dirlo: quello che fa saltare all'occhio la scheda è **quanta superficie** cambia, non quanto è carico il colore. Una velatura conserva l'area e perde solo la violenza.

### La condizione, ed è l'unica cosa non negoziabile

La campitura piena stava a **3,00:1** rispetto al fondo del pannello — esattamente la soglia che vale per gli **indicatori non testuali**. Velando si scende sotto, e senza un'altra sponda si torna al bordo invisibile di `GH-64`.

> **La velatura porta l'area, il bordo porta il contrasto.** Il bordo resta **scurito nel colore e invariato nello spessore**: su una scheda chiara supera i 3:1 senza pesare. **Almeno un elemento della marcatura deve stare a ≥ 3:1 contro ciò che gli sta intorno, e va dichiarato con il numero.**

**Nessun colore nuovo.**

## 2 — Il segnaposto si accorcia

Il campo dice **«Cerca pet, proprietario, telefono»**: 33 caratteri in un campo da 201px, e si tronca.

**Due tagli, non uno:**

- `telefono` → **`cell`**, che è la parola del banco;
- **via «Cerca»**, perché accanto al campo c'è già l'etichetta visibile *Cerca*: il segnaposto la ripeteva.

Risultato: **`pet, proprietario, cell`** — 23 caratteri, un terzo in meno.

**L'etichetta visibile e il nome accessibile non si toccano.**

## Invarianti

**Nessuna migrazione, nessuna query, nessun dato toccato.**

**La ricerca continua a marcare e non filtrare**: non nasconde niente, **non smorza le schede non corrispondenti**, i conteggi in alto non cambiano.

**La normalizzazione del telefono e la correzione di `GH-65`** — l'oggetto con `phoneDigits` passato al confronto — **non si toccano**: sono il motivo per cui la ricerca funziona.

**L'apertura e chiusura del calendarietto non si tocca**, né il suo ripiego con avviso e campo visibile.

**Restano gli invarianti di `GH-54` → `GH-65`**: grana a mezza giornata, lavorazioni senza ora mai in fascia, margine che non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px, lessico ammesso solo `lavorati sul momento`, `chi arriva`, `senza ora fissata`, il peso segue l'agibilità, **l'arretramento appartiene al contenitore, non alle lettere**.

## Controprove

Dichiara nel registro, misurate con **fixture in memoria**. **Numeri, non aggettivi.**

- **conteggio dei pixel** della scheda trovata contro la vicina non trovata, con lo stesso metodo di `GH-65`: riporta le due percentuali e il rapporto;
- **contrasto della marcatura** contro ciò che le sta intorno: almeno un elemento **≥ 3:1**, con il valore;
- **il testo della scheda trovata è identico** a quello delle altre: colori misurati, nessuno scurimento;
- **nessuno spessore aumentato**: bordi e contorni misurati prima e dopo;
- **la settimana con dieci schede e una corrispondenza**: si individua ancora senza scorrere a 1365 e 1024px;
- **le schede non corrispondenti sono identiche** a prima della ricerca;
- **il segnaposto** misurato: testo esatto, e **non troncato** a 1365, 1024 e 375px;
- **non regressioni**: ricerca per nome, per proprietario e per **telefono parziale in formato diverso** (`7890`, `333456`) trovano ancora; il calendarietto apre e chiude tre volte;
- build verde. **Suite RLS: da non rieseguire.** Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **cerca un cane in una settimana piena**: si trova ancora a colpo d'occhio, adesso che è velata?
2. **guardala accanto alle altre**: è una scheda marcata, o è diventata una scheda di un altro tipo?
3. **il campo di ricerca**: si legge tutto il segnaposto?

La prima e la seconda insieme sono il punto: **la marcatura deve dire «questa è quella che cerchi», non «questa è diversa dalle altre».**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-66-la-marcatura-si-vela-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
