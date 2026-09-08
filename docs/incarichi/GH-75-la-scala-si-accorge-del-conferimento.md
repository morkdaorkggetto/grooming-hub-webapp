# Incarico GH-75 — La scala si accorge del conferimento

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 8 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Superficie:** la scala fedeltà nella scheda del pet. File attesi: `apps/staff/lib/fidelity.js`, ed eventualmente il componente che rende la scala. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

`GH-73` è in produzione e funziona per due terzi. Luigi ha conferito il bronzo a **Clover** — Maltese, 3 visite — e la scheda dice due cose incompatibili:

> in alto: **`Livello Bronzo`** · **`Bronzo · conferito dal salone`**
> nella scala: riga bronzo **`3 / 6 visite in 12 mesi · 0 / 100 punti`**, e a destra **«3 visite oppure 100 punti»**

**Sopra c'è scritto che ha il bronzo, sotto che per il bronzo gli mancano tre visite.**

**Causa misurata**, in `getFidelityTierSnapshot`:

```js
const achieved = achievedByVisits || achievedByPoints;
```

La qualifica conferita entra **solo** nel livello complessivo — `currentTier`, `nextTier`, `currentTierSource` — e **non tocca le tre righe della scala**, che continuano a valutarsi con le sole visite e i soli punti.

> **Non è un difetto di esecuzione: è un buco del mandato precedente.** `GH-73` chiedeva nelle controprove che *«il prossimo livello mostrato sia l'argento»* — e quello è corretto, la prova unitaria lo dimostra. **Chiedeva il dato aggregato e non la resa della scala.** E la verifica visiva che avrebbe coperto la differenza è saltata: il banco browser non ha reso `ClientDetail` entro il limite, **zero screenshot**, dichiarati.

## Cosa fare

**Le righe della scala fino al livello effettivo compreso si leggono come raggiunte.**

Chi ha il bronzo conferito vede **il bronzo pieno** e **l'argento come traguardo** — esattamente quello che l'intestazione già dice.

**Per quelle righe, quanto manca è azzerato**: niente «3 visite oppure 100 punti» accanto a un livello che si possiede.

**I numeri restano quelli veri.** La riga del bronzo continua a mostrare **`3 / 6 visite in 12 mesi`**: Clover ha davvero tre visite, e nasconderlo sarebbe mentire su un fatto.

> **Il numero racconta la storia, lo stato racconta il diritto.** Sono due informazioni diverse sulla stessa riga e devono restare distinguibili.

**Le righe sopra il livello effettivo non cambiano**: continuano a mostrare quanto manca, calcolato come oggi.

**Il livello complessivo, la motivazione e il livello successivo non si toccano**: funzionano già.

**E si deve poter distinguere perché una riga è raggiunta.** Chi guarda deve capire se il bronzo di Clover viene dalle visite o dal salone — è la stessa esigenza che `GH-73` ha già soddisfatto nell'intestazione, e qui va conservata senza inventare una seconda grammatica.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere SQL, ti sei perso.

**Non si tocca la matematica**: soglie, finestre, conteggio delle visite, somma dei punti, e il calcolo di `currentTier` / `nextTier` / `currentTierSource` restano identici. **Si aggiunge una lettura, non si cambia un conto.**

**La qualifica non è scrivibile dal cliente**, e questo giro non la scrive affatto.

**Lato cliente nessuna distinzione fra guadagnato e conferito**, come in `GH-73`. Se il componente della scala è condiviso con la card pubblica o con il portale, **verificalo e dichiaralo**: la card mostra il livello, non la sua origine.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-74`.

## Controprove

Dichiara nel registro. **Numeri, non aggettivi — e questa volta anche a schermo.**

- **il caso di Clover, riprodotto**: 3 visite, bronzo conferito. La riga bronzo si legge **raggiunta**, **quanto manca è 0**, e **il numero `3 / 6` è ancora lì**. Riporta il testo esatto della riga;
- **la riga argento e la riga oro** nello stesso caso: invariate, con i loro «quanto manca» calcolati come prima — riporta i due valori;
- **argento conferito**: bronzo **e** argento raggiunti, oro no;
- **oro conferito**: tutte e tre raggiunte, e **nessun livello successivo**;
- **nessuna qualifica conferita**: la scala è **identica a prima di questo giro** — confronto misurato contro il commit base;
- **bronzo raggiunto per visite e argento conferito**: le prime due righe raggiunte, e **si distingue quale delle due viene dalle visite e quale dal salone**;
- **revoca**: la scala torna esattamente com'era prima del conferimento — confronto misurato;
- **lato cliente**: la card pubblica e il portale **non mostrano l'origine**; se il componente è condiviso, dimostralo;
- **una prova a schermo, non solo in memoria**: `ClientDetail` reso davvero, con **screenshot allegato** del caso di Clover. **È la prova che è mancata in `GH-73` ed è la ragione per cui questo mandato esiste.** Se il banco non riesce a renderlo, **fermati e dichiaralo** invece di consegnare senza;
- build verde. **Suite RLS: da non rieseguire** — nessuna policy o colonna toccata. La sonda ora è permanente (`GH-74`): dichiara l'ultima misura viva, che è **60 PASS dell'8/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R, **sulla scheda di Clover**:

1. **la scala e l'intestazione dicono la stessa cosa?** È l'unica domanda che conta;
2. **si capisce ancora che Clover ha tre visite vere?** Il conferimento non deve cancellare la storia;
3. **confronta con Benny di Gaetano**, che il bronzo l'ha guadagnato con 6 visite: si distinguono?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-75-la-scala-si-accorge-del-conferimento-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
