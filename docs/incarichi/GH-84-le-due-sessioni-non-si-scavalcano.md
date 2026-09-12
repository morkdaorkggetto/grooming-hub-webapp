# Incarico GH-84 — Le due sessioni non si scavalcano

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Trovato da Luigi che non riusciva più a entrare come operatore.** Superficie: `shared/supabase/client.js` e la mappa delle rotte. **Nessuna rotta nuova, nessuna pagina nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

> **Blocca il lancio.** Prima di invitare i clienti del salone, questo deve essere chiuso.

## Da dove nasce

Luigi si è registrato come cliente con `ggetto@me.com` alle **08:59**. Un minuto prima, alle **08:58**, era entrato nel gestionale con `ggetto@gmail.com`. Poi non è più riuscito a rientrare come operatore.

**Non è un problema di permessi.** Misurato in produzione il 12/9:

| account | `profiles.role` | membership |
|---|---|---|
| `ggetto@gmail.com` | `operator` | `owner` del tenant |
| `ggetto@me.com` | `customer` | nessuna |

I dati sono corretti. **È la sessione del browser a essere una sola.**

```js
// shared/supabase/client.js:28
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Senza `storageKey` esplicito, il client scrive in `localStorage` sotto la chiave predefinita `sb-<project-ref>-auth-token`. **`localStorage` è uno per origine, non per percorso**: gestionale e app cliente stanno sullo stesso dominio, quindi **il secondo accesso sovrascrive il primo**.

## Perché non può restare così

Al salone succederà in continuazione, e in due modi:

1. **Roby apre il link di un cliente** per aiutarlo al telefono → il gestionale si scollega;
2. **Davide prova l'app col proprio cane** → stessa cosa, e al ritorno nel gestionale potrebbe **non accorgersene**, perché la pagina lo rimanda semplicemente al login.

Il secondo caso è il peggiore: **non c'è nessun segnale che dica cosa è successo.**

## Cosa fare

### Una chiave per superficie

**Il client sceglie la chiave di sessione in base alla superficie su cui la pagina è stata caricata.** Due valori distinti ed espliciti — non il predefinito — così le due sessioni convivono in `localStorage` senza toccarsi.

**Un solo file cambia la costruzione del client.** Se ti trovi a modificare i ventidue moduli che importano `supabase`, ti sei perso: non è questa la strada.

### La mappa delle rotte, e qui devi misurare tu

Il confine **non coincide con le cartelle**. `App.jsx` manda `/u/*` a `CustomerApp` e tutto il resto a `StaffApp`, ma dentro `StaffApp` vivono rotte che sono del cliente:

```
/portal            /portal/login            /portal/invite/:token            /portal/demo
```

e rotte che non sono di nessuno dei due:

```
/client-card/:qrToken     (pubblica, senza autenticazione)
/reset-password           (da verificare: serve a entrambi i ruoli?)
```

**Produci la tabella completa**: ogni rotta dichiarata in `App.jsx` e in `StaffApp.jsx`, a quale delle due sessioni appartiene, e **perché**.

> **Fermati e dichiaralo** se trovi anche **una sola rotta che serve a entrambi i ruoli** — `/reset-password` è la candidata. Quel caso non si risolve dentro questo mandato: si misura, si scrive, e si decide dopo.

### Il limite noto, da dichiarare non da risolvere

La superficie si stabilisce **al caricamento della pagina**. Se dentro la stessa sessione del browser si passa da una superficie all'altra **senza ricaricare**, la chiave resta quella iniziale.

**Misura se questo passaggio è possibile oggi** — cerca collegamenti interni che attraversino il confine — e **dichiara il risultato**. Se non esiste nessun percorso che lo faccia, dillo con la ricerca in mano. Se esiste, **non ripararlo qui**: scrivilo.

### Le sessioni già aperte

Chi ha oggi una sessione sotto la chiave predefinita, dopo questo cambio **si ritroverà slegato**: la chiave nuova è vuota. **È accettabile** — sono cinque persone e rifanno l'accesso — **ma dev'essere pulito**, non un errore.

**Misura cosa vede una persona che aveva la sessione vecchia** e apre il gestionale: deve trovarsi al login, senza schermate rotte e senza errori in console. **Non scrivere codice di migrazione della chiave vecchia**: la si lascia dov'è.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere SQL, ti sei perso.

**Nessuna rotta nuova, nessuna pagina nuova, nessuna dipendenza nuova.**

**Il comportamento di ciascuna superficie, presa da sola, non cambia.** Chi entra nel gestionale e basta non deve accorgersi di niente; chi entra nell'app cliente e basta, nemmeno.

**La whitelist customer resta di tre colonne**: `owner_notes`, `coat_preferences`, `owner_photo_url`.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-83`.

## Controprove

Dichiara nel registro. **Numeri e chiavi, non aggettivi.**

- **le due chiavi**, riportate per esteso, e la prova che **nessuna delle due è il predefinito**;
- **la prova che genera il difetto**, nell'ordine esatto in cui è successo a Luigi: entra come operatore, poi come cliente sulla stessa origine, **poi torna al gestionale**. Riporta **le chiavi presenti in `localStorage` dopo ogni passo** e verifica che alla fine l'operatore sia **ancora dentro**;
- **e la simmetrica**: entra come cliente, poi come operatore, poi torna all'app cliente;
- **la tabella completa delle rotte** → superficie → motivo. **Ogni rotta, non un campione**: è la regola del canone del 10/9. Riporta il comando della ricerca;
- **le rotte pubbliche** — la scheda QR — **continuano a funzionare senza nessuna sessione**: misuralo con `localStorage` vuoto;
- **`/reset-password`**: a chi serve. Se serve a entrambi, **fermati e dichiaralo**;
- **l'attraversamento senza ricaricare**: la ricerca dei collegamenti interni che varcano il confine, e l'esito;
- **la sessione vecchia**: cosa vede chi ce l'ha. Nessun errore in console, nessuna schermata rotta;
- **l'uscita**: uscendo da una superficie, **l'altra sessione resta intatta**. Misura entrambe le chiavi prima e dopo;
- **le dieci pagine del gestionale e le pagine cliente sono invariate**: impronte, come in `GH-81`;
- build verde. **Suite RLS: da rieseguire** — questo mandato tocca l'autenticazione, e le cinque utenze di prova sono il banco giusto. Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

Sullo stesso browser, senza finestre private:

1. **entra nel gestionale**, poi **apri l'app cliente e accedi**, poi **torna al gestionale**: sei ancora operatore?
2. **esci dall'app cliente**: il gestionale è ancora aperto?
3. **e la domanda che conta**: se Roby apre il link di un cliente mentre lavora, perde il lavoro che sta facendo?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-84-le-due-sessioni-non-si-scavalcano-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
