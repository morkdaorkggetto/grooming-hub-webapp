# Incarico GH-93 — L'errore si legge dove si è sbagliato

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 14 settembre 2026
**Superficie**: `apps/staff/pages/Calendar.jsx`.
**Segnalato da Davide**, che ha provato a ripristinare un appuntamento annullato e ha visto il pulsante non fare niente.

**Perimetro**: nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta. Database ammesso **solo il demo**; nessun push, merge o deploy.

## Da dove nasce

Parole di Davide, 14 settembre:

> *«nel riquadro a destra quello piccolino mi dava la possibilità di riprendere l'appuntamento ma non lo ha salvato: mi ha proposto lui la scorciatoia ma non me la salvava»*

**Ricostruito dai dati di produzione**, stesso cane, stesso slot:

| appuntamento | quando | stato | aggiornato |
|---|---|---|---|
| creato il 2/9 | giovedì 17/09 09:00 UTC | **annullato** | 14/09 **10:40:39** |
| creato oggi | giovedì 17/09 09:00 UTC | programmato | 14/09 **10:41:30** |

Ha annullato e rifatto **nello stesso slot**, a 51 secondi di distanza. Poi ha toccato «Ripristina programmato» sull'annullato.

**Il rifiuto era corretto.** In quella finestra ci sono già tre lavorazioni in parallelo — `tassista 1` che la attraversa, il `barboncino` appena rifatto e `Whisky` — cioè **tre su tre postazioni**. Il ripristino ne avrebbe fatte quattro, e il vincolo del database lo ha respinto.

**Il difetto è che Davide non l'ha mai saputo.**

```jsx
// Calendar.jsx:815 — dentro <main>, fuori dal modale
{error && <div className="gh-calendar-notice gh-calendar-notice--error" role="alert">{error}</div>}
```

**Il messaggio compare in cima alla pagina, dietro al modale aperto.** Il modale è rimasto identico, e la spiegazione è finita sotto. Da dove guardava lui, il pulsante non faceva niente.

> `GH-89` ha sistemato esattamente questo per il modale di approvazione delle richieste — *«il modale resta aperto e mostra…»*. **Nel calendario è rimasto**, ed è il modale che il salone apre cento volte al giorno.

E c'è un terzo strato. Anche se l'avesse letto, **«le postazioni sono tutte occupate» sarebbe stato fuorviante**: la ragione vera non è che il salone è pieno, è che **quel cane ha già un appuntamento in quello slot**, creato da lui un minuto prima.

## Cosa fare

### 1. L'errore si legge dentro il modale

**Ogni azione avviata da dentro un modale mostra il proprio esito dentro quel modale**, accanto al comando che l'ha prodotto: cambio di stato, spostamento, promemoria, tutto.

**Il precedente esiste già nel file**: `deleteError` è mostrato dentro il modale di eliminazione. **Segui quella forma**, non inventarne una nuova.

**Chiudendo il modale l'errore sparisce**: non deve restare appeso in cima alla pagina come un avviso senza contesto. È la regola che `GH-89` ha già applicato.

**L'avviso in cima alla pagina resta** per ciò che nasce fuori dai modali — il caricamento della settimana, la ricerca.

### 2. Il ripristino dice la ragione vera

Quando il ripristino viene respinto, **il messaggio deve distinguere due situazioni diverse**:

- **esiste già un appuntamento attivo per lo stesso pet che si sovrappone a questo** — è il caso di Davide, e il messaggio deve dirlo: l'appuntamento è già stato rifatto, questo annullato non serve più;
- **non c'è posto** per altre ragioni: resta il messaggio della capienza che già esiste.

**Il dato per distinguerli è già caricato**: la settimana in memoria contiene gli appuntamenti, e la sovrapposizione si calcola con gli strumenti di `shared/tenant/workstationCapacity.js`. **Non nasce un secondo criterio di occupazione**, e non si aggiunge nessuna lettura.

**In produzione i casi sono due**, misurati il 14/9: due annullati che hanno un gemello attivo sovrapposto. Pochi, ma sono esattamente quelli su cui si tocca quel pulsante.

### 3. Il pulsante dice prima cosa succederà

**Se il ripristino non può riuscire, si vede prima di premere** — il comando resta visibile ma dichiara il perché, invece di fallire al tocco.

**Non nasconderlo**: un comando che sparisce senza spiegazione è il difetto di partenza in un'altra forma.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Il vincolo del database resta l'ultima parola**: questo mandato **anticipa** il rifiuto, non lo sostituisce. Se il controllo in memoria e il database dissentono, **vince il database** e il suo messaggio arriva comunque all'operatore — dentro il modale.

**Un solo criterio di occupazione**, quello di `shared/tenant/workstationCapacity.js`.

**Nessuna azione cambia comportamento**: annullare, ripristinare, spostare, eliminare fanno esattamente quello che facevano. **Cambia dove si legge l'esito.**

**Il lato cliente non cambia**: nessun diff sotto `src/apps/customer`.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-92`, **compresa l'eccezione dichiarata da `GH-87`** sul link `Grooming Hub`.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **riproduci il caso di Davide** sul demo: pet con un annullato e un attivo sovrapposto, poi ripristino. Riporta **il testo esatto** che legge l'operatore e **dove appare**, con prova a schermo;
- **il caso capienza senza gemello**: un annullato in una fascia piena per altri motivi. Testo esatto, e che **sia diverso** dal precedente;
- **il caso che riesce**: un annullato ripristinabile. Si ripristina, e il modale lo dice;
- **l'errore non sopravvive alla chiusura del modale**: misuralo;
- **le altre azioni del modale** — sposta, elimina, promemoria, assenza — mostrano il proprio esito **dentro**. Elencale tutte con una ricerca, comando riportato, e dichiara per ciascuna dove appare l'esito prima e dopo;
- **l'avviso in cima alla pagina funziona ancora** per ciò che nasce fuori dai modali: misura almeno un caso;
- **il pulsante dichiara prima**: i due stati a schermo;
- **il database resta l'ultima parola**: forza una condizione in cui il controllo in memoria dice sì e il vincolo rifiuta, e **dimostra che il messaggio arriva dentro il modale**;
- **`Calendar.jsx` è l'unico file applicativo con diff**, oppure dichiara gli altri con il motivo;
- **`src/apps/customer` non ha diff**: dimostralo;
- **le altre pagine staff**: impronte, come in `GH-90` e `GH-92`;
- **a 375px**: il messaggio dentro il modale non sborda, non tronca, non copre i comandi. **È il caso del banco**;
- build verde. **Suite RLS: da non rieseguire**, questo mandato non tocca dati né permessi. Ultima misura viva: `GH-91`, **60 PASS del 13/9**.

## Passo finale — lo guarda Luigi (regola 5)

Sul gestionale, riproducendo quello che ha fatto Davide:

1. **annulla un appuntamento e rifallo nello stesso slot**, poi prova a ripristinare l'annullato: capisci cosa sta succedendo?
2. **il messaggio ti dice cosa fare**, o solo cosa non si può fare?
3. **e la domanda che conta**: Davide avrebbe ancora scritto «non me la salvava»?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

**Gli annullati con un gemello attivo restano nel piede della giornata.** Sono due oggi, e non danno fastidio; ma se diventassero molti, il piede del calendario si riempirebbe di righe che non servono più a nessuno. Da guardare fra un mese, non adesso.

## Chiusura

Registro in `docs/consegne/GH-93-l-errore-si-legge-dove-si-e-sbagliato-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
