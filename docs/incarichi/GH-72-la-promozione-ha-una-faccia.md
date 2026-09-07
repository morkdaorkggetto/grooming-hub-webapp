# Incarico GH-72 — La promozione ha una faccia

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 7 settembre 2026
**Forma breve (regola 4).** **Nessuna migrazione, nessun deposito nuovo, nessuna policy.**
**Chiesto dal salone — Davide.** Superficie: `PromotionsManager`. File attesi: `pages/PromotionsManager.jsx`, `apps/staff/lib/database.js`, eventualmente `pages/PromotionsManager.css`. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria** dove basta; **fixture nel deposito** solo se una controprova lo richiede, e rimosse.

## Da dove nasce

Davide sta scrivendo la prima promozione del salone e ha chiesto di poterci mettere **un'immagine**. Le promozioni in produzione sono **zero**: questa è la prima.

## 1 — La casella dell'immagine, e una colonna scritta da un modulo che non la mostra

**Misurato il 7/9, ed è costruito per tre quarti:**

- `promotions.image_url` **esiste** nel database;
- il modulo dello staff la porta **già** nel proprio stato (`INITIAL_FORM` e mappatura di modifica);
- `normalizePromotionPayload` **la scrive a ogni salvataggio**;
- l'app clienti **la mostra già** (`apps/customer/pages/Promotions.jsx`).

**Manca solo la casella dove si scrive.**

> **E questo è un difetto, non solo un pezzo mancante.** Il salvataggio scrive sempre `image_url` prendendolo dal modulo, e il modulo quella casella non ce l'ha. Oggi è innocuo perché il valore viene ricaricato in modifica e riscritto uguale; **diventa una perdita di dati silenziosa** il giorno in cui un'immagine ci finisce per un'altra via. **Mostrare ciò che si scrive chiude il difetto.**

### Caricamento, non un indirizzo da incollare

Un campo con l'indirizzo costerebbe una riga, ma Davide dovrebbe ospitare l'immagine altrove: **non la userebbe mai**. Serve il caricamento, come per le foto dei cani.

**La macchina esiste e va riusata**, non riscritta: `uploadPhoto` e i due depositi con le loro regole.

**Deposito: `pet-avatars`.** Misurato: la sua policy per lo staff è **`FOR ALL` con `has_tenant_any_staff_access(foldername[1])`** — autorizza tutto ciò che sta **sotto la cartella del salone**, non solo le foto dei cani. E la lettura pubblica copre l'intero deposito.

**Percorso: `{tenant_id}/promotions/{id}.{est}`.**

> **Scostamento dichiarato, e va scritto nel registro**: il deposito si chiama `pet-avatars` e conterrà immagini che non sono avatar di pet. **Il nome smette di descrivere il contenuto.** L'alternativa — un deposito nuovo — richiederebbe una migrazione con le sue policy per una sola immagine. **Scelta: si riusa**, e si annota che il nome è diventato impreciso.

**Non scegliere `client-photos`**: la sua regola per lo staff è legata a `auth.uid()`, quindi l'immagine risulterebbe di chi l'ha caricata e non del salone.

### Cosa deve fare la casella

- **compare in creazione e in modifica**, con lo stesso comportamento: il modulo è uno solo;
- **in modifica mostra l'immagine già presente**, se c'è;
- **si può togliere**: e togliendola `image_url` torna nullo;
- **sostituendo l'immagine, la vecchia si cancella dal deposito.** Abbiamo già due foto orfane da `GH-12`: non se ne aggiungano altre;
- **è facoltativa.** Una promozione senza immagine si salva come oggi, e **non compare nessun avviso né invito a completare**;
- rispetta i limiti del deposito: **5 MB**, e i tipi `jpeg`, `png`, `webp`, `gif`. Se il file non li rispetta, **lo dice con parole comprensibili** — non con l'errore grezzo del deposito.

**Se il caricamento fallisce, la promozione si salva lo stesso** e lo dichiara, come già fa la visita con la sua foto. **Non si perde il testo scritto.**

## 2 — Una parola nel messaggio d'errore

Il controllo sul pulsante **esiste già** ed è corretto:

```js
if (Boolean(ctaLabel) !== Boolean(ctaUrl)) {
  throw new Error('Etichetta e indirizzo del pulsante vanno compilati insieme.');
}
```

Ma il modulo chiama quelle caselle **«Testo pulsante»** e **«Indirizzo pulsante»**. Il messaggio dice **«Etichetta»**, che sul modulo non esiste: **chi lo legge cerca un campo che non c'è.**

**Il messaggio diventa:** `Testo e indirizzo del pulsante vanno compilati insieme.`

**Il controllo non si tocca**: funziona, ed è stato letto da Davide come un blocco solo perché nominava la casella sbagliata.

> **Non è in questo mandato**: le categorie delle promozioni. Con zero promozioni si classificherebbe una cosa che non esiste. Si decide dopo che Davide ne avrà scritte tre o quattro — o si vedrà che non servono.

## Invarianti

**Nessuna migrazione, nessun deposito nuovo, nessuna policy, nessuna colonna.** Se ti trovi a scrivere SQL di schema, ti sei perso.

**Nessuna riscrittura della macchina delle foto**: si riusa quella dei cani.

**Nessun file orfano**: ogni sostituzione o rimozione cancella il file precedente.

**Il controllo sul pulsante resta identico**: cambia una parola nel messaggio, non la logica.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-71`, e in particolare: **l'informazione compare dove ha un lavoro da fare** — una promozione senza immagine non mostra segnaposti.

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **promozione nuova con immagine**: il file finisce in `{tenant}/promotions/…`, `image_url` è valorizzato, e **l'app clienti la mostra** — verifica il componente cliente, non solo il campo;
- **promozione nuova senza immagine**: si salva, `image_url` nullo, **nessun segnaposto** nella lista né lato cliente;
- **modifica di una promozione con immagine**: la casella mostra quella presente; salvando senza toccarla **il file e il valore restano identici** — impronta prima e dopo;
- **sostituzione**: nuovo file presente, **vecchio file assente dal deposito**; conta gli oggetti prima e dopo;
- **rimozione**: `image_url` nullo **e** file cancellato;
- **file troppo grande** e **tipo non ammesso**: due prove, due messaggi comprensibili, **nessun errore grezzo del deposito a schermo**;
- **caricamento fallito**: la promozione si salva, il testo scritto **non si perde**, e l'esito è dichiarato all'utente;
- **il messaggio del pulsante** riporta testualmente `Testo e indirizzo del pulsante vanno compilati insieme.`, e la parola `Etichetta` **non compare più** in `src`: dimostralo con una ricerca;
- **il controllo del pulsante funziona ancora** in tutti e quattro i casi: nessuno dei due, solo testo, solo indirizzo, entrambi;
- **a 1365, 1024 e 375px**: il modulo con la casella in più regge, nessun bersaglio sotto i 44px, nessuno sbordamento;
- build verde. **Suite RLS: da non rieseguire** — nessuna policy toccata. Dichiara l'ultima misura viva.
- **pulizia**: zero file residui nel deposito del demo a fine sessione, contati.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **crea la prima promozione vera con un'immagine**: il caricamento è ovvio, o si cerca dove premere?
2. **riaprila in modifica**: l'immagine c'è, e si capisce come cambiarla o toglierla?
3. **guarda come la vedrà il cliente**: l'immagine sta bene con il testo, o la promozione sembra una cosa diversa da quella che avevi scritto?

La terza è quella che conta: **è la prima cosa che i clienti vedranno entrando**, e finora nessuno l'ha mai vista.

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-72-la-promozione-ha-una-faccia-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
