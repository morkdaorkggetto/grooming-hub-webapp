# Incarico GH-92 — I campi affiancati si allineano

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 13 settembre 2026
**Forma breve (regola 4).** Superficie sola: **una regola CSS e un'etichetta.** Nessuna migrazione, nessun dato, nessuna logica, nessuna rotta.
**Trovato da Luigi guardando il modale di conferma** dopo il ciclo completo di GH-91.

**Perimetro**: nessun database, nemmeno il demo. Nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

Nel modale **Conferma appuntamento** i tre campi — Giorno, Ora, Durata — non stanno sulla stessa riga: il terzo è più in basso degli altri due.

Misurato:

```css
.gh-dialog-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.gh-dialog-fields--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

Tre colonne uguali, e dentro ciascuna l'etichetta sopra il campo. **«Durata prevista (min)» non ci sta su una riga**, va a capo, e porta giù il proprio campo. Gli altri due restano in alto.

> **Non è un problema di spazio: è che i campi si allineano sull'etichetta invece che su sé stessi.** Se una parola cambia, la riga si rompe.

## Cosa fare

Due interventi, e il secondo è quello che conta.

**L'etichetta si accorcia.** «Durata prevista (min)» dice tre cose dove ne bastano due. Il testo lo scegli tu e lo dichiari: deve stare su una riga anche a 375px, e **non deve perdere l'unità di misura** — chi legge deve sapere che sono minuti.

**E la riga si difende da sola.** Anche con l'etichetta corta, la griglia deve reggere un'etichetta che va a capo senza scomporsi: **i campi si allineano fra loro**, e le etichette stanno sopra ciascuno alla propria altezza.

> Vale come regola, non come rattoppo di questo modale: **i campi affiancati si allineano sulla riga del campo, non su quella dell'etichetta.** È parente della regola di `GH-67` — l'arretramento appartiene al contenitore, non alle lettere.

**Applicala a tutti i gruppi di campi affiancati**, non solo a quello a tre: `.gh-dialog-fields` regge anche i modali a due colonne e le righe delle alternative di `GH-89`.

## Cosa non si tocca

**Nessun colore, nessun carattere, nessuna spaziatura fra i gruppi.** Non è un ridisegno del modale: la fascia del carico, il testo di aiuto, i pulsanti e le loro posizioni restano dove sono.

**Sotto i 640px la griglia diventa a una colonna** e lo resta: quella regola esiste già e non si tocca.

**Nessun comportamento.** Se un diff tocca qualcosa che non sia CSS o una stringa, **fermati e dichiaralo**.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato, nessuna rotta, nessuna dipendenza.**

**Nessun colore nuovo, nessuna geometria nuova** oltre all'allineamento: non cambiano altezze dei controlli, raggi, bordi o distanze.

**Nessun bersaglio scende sotto i 44px.** Restano gli invarianti di `GH-54` → `GH-91`, **compresa l'eccezione dichiarata da `GH-87`** sul link `Grooming Hub`, che non si tocca qui.

## Controprove

Dichiara nel registro. **Misure in pixel, non aggettivi.**

- **la posizione verticale dei tre campi** nel modale di conferma, prima e dopo: devono **coincidere**. Riporta i tre valori nei due stati;
- **l'etichetta nuova**, per esteso, e la prova che **sta su una riga a 375px e a 1365px**;
- **la prova che la regola regge da sola**: forza un'etichetta lunga su uno dei tre campi e dimostra che **i campi restano allineati** lo stesso. È la controprova che distingue la regola dal rattoppo;
- **gli altri gruppi di campi affiancati**: elencali tutti con una ricerca — comando riportato — e misura che nessuno sia peggiorato;
- **le righe delle alternative di `GH-89`**: data e ora allineate;
- **sotto i 640px**: una colonna, come prima;
- **prove a schermo** del modale di conferma a 375px e 1365px, ispezionate;
- **nessun bersaglio sotto i 44px**, e nessuno sbordamento;
- **il diff contiene solo CSS e stringhe**: dimostralo;
- **le pagine staff e customer**: impronte, come in `GH-90` e `GH-91`;
- build verde. **Suite RLS: da non rieseguire**, questo mandato non tocca dati né permessi. Ultima misura viva: `GH-91`, **60 PASS del 13/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Apri il modale di conferma dal telefono e dal computer**:

1. i tre campi sono sulla stessa riga?
2. si capisce ancora che la durata è in minuti?
3. **e la domanda che conta**: il modale sembra composto, o sembra aggiustato?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-92-i-campi-affiancati-si-allineano-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
