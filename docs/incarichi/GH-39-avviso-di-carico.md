# Incarico GH-39 — L'avviso di carico, e una fascia oraria sola

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Segue:** `GH-37`, di cui usa la capienza. Da eseguire **dopo** che GH-37 è in produzione.

> **Forma breve** (regola 4 del canone): nessuna scrittura nuova, nessuna migrazione. Due voci, con la causa già misurata.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

---

## 1 · L'avviso di carico

**La richiesta, parole di Luigi dal salone**: *«un alert che comunque ti avvisi all'atto della prenotazione che in quel giorno e in quella fascia oraria hai già una lavorazione. Aiuta a capire il carico di lavoro.»*

**Perché serve**, ed è diverso da ciò che esiste: la guardia di `GH-37` dice **no** quando le postazioni sono piene. Non dice **quanto sei carico** mentre ti avvicini. Sono due informazioni distinte e oggi ce n'è una sola. Il salone ha ripreso a usare il calendario proprio oggi — nove appuntamenti in una mattina — quindi la domanda «com'è messa quella giornata?» è appena diventata reale.

**Invarianti**:

- **Non blocca mai.** È un'informazione, non un rifiuto. Se le postazioni sono piene parla la guardia esistente e l'avviso **non si ripete**: due messaggi per lo stesso fatto sono peggio di uno.
- **Compare appena data e ora sono scelte**, prima del salvataggio, nei **tre luoghi** dove oggi si calcola il conflitto: collocazione manuale, conferma di una richiesta cliente, e modifica dal dettaglio.
- **Dice due fatti, non un'opinione**: quante lavorazioni ci sono già **quel giorno in quella fascia**, e quante **postazioni restano libere all'orario scelto**. Nessuna valutazione del tipo «giornata piena» o «attenzione».
- **Tace quando non ha nulla da dire.** Fascia vuota, nessun avviso. Il silenzio è informazione.
- **Non conta le lavorazioni annullate**, coerentemente con la capienza.
- **Non compare mai nell'app clienti.** Il carico del salone è un fatto interno: al cliente non si dice quanto sono pieni.
- **Si distingue a vista dal rifiuto.** Il messaggio di conflitto è un impedimento; questo è una nota. Se hanno lo stesso peso visivo, l'invariante non è soddisfatta.

**Le parole**, in due frasi brevi, la seconda solo quando aggiunge qualcosa:

> Martedì mattina: **3 lavorazioni** già in programma.
> Alle 10:30 resta **1 postazione** libera.

Al singolare: «1 lavorazione», «restano 2 postazioni». Quando la capienza è satura parla il rifiuto, non questo.

---

## 2 · Una fascia oraria sola

**Misurato**: il confine fra mattina e pomeriggio è definito in **tre modi diversi** nel codice.

| Dove | Mattina | Pomeriggio |
|---|---|---|
| `CustomerRequests.jsx` (etichette viste dai clienti) | 9–13 | 13–19 |
| `Calendar.jsx` (orario predefinito) | 09:00 | **14:00** |
| `CustomerPortal.jsx` (portale legacy) | 09:00–12:00 | 14:00–17:30 |

**Invariante**: esiste **una sola definizione**, in un solo posto, e tutte le superfici la usano. Valore adottato: **mattina 9–13, pomeriggio 13–19** — è quella che i clienti già leggono nell'app, e l'unica che qualcuno fuori dal salone abbia visto.

Conseguenza da verificare: l'orario predefinito alla conferma di una richiesta «pomeriggio» **diventa coerente** con l'etichetta mostrata al cliente. Oggi il cliente legge «13–19» e il calendario propone le 14:00.

`CustomerPortal.jsx` è codice morto e **non va aggiornato**: se lo tocchi, dichiaralo e spiega perché.

> **Nota per il futuro, non in questo mandato**: anche gli orari di apertura appartengono al tenant, come i giorni di chiusura e la capienza. Finché sono uno solo, una costante condivisa basta.

---

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- **fascia vuota** → nessun avviso;
- **una lavorazione già presente** → avviso al singolare, con le postazioni libere giuste;
- **capienza satura** → parla **solo** il rifiuto, l'avviso non compare;
- l'avviso appare in **tutte e tre** le superfici di collocazione;
- **nessun avviso nell'app clienti**, verificato con una sessione customer reale;
- confermando una richiesta «pomeriggio», l'orario proposto è **coerente con l'etichetta 13–19**;
- una sola definizione di fascia nel codice, cercata e non trovata altrove;
- build verde; suite RLS invariata — questo mandato non tocca le policy.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Lascia nel registro una cosa da fare con gli occhi: **collocare due cani nella stessa mattina** e leggere l'avviso al secondo, poi provare il terzo per vedere che al posto dell'avviso arrivi il rifiuto. Il passaggio fra le due voci è tutto il senso di questo mandato.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
