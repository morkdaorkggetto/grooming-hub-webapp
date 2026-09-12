# Incarico GH-78 — Un numero che si può chiamare

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Primo dei giri che preparano il lancio.** Superficie: la funzione di creazione cliente+pet e i telefoni già in archivio. **Nessuna rotta nuova, nessuna interfaccia nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **La produzione non si tocca.**

## Da dove nasce

Il salone sta per invitare **321 clienti**. **L'invito si aggancia per numero di telefono**: chi ha un numero inutilizzabile non lo riceverà mai, e **nessuno se ne accorgerà** — non ci sarà nessun errore da nessuna parte.

Misurato in produzione il 12/9:

| | |
|---|---:|
| clienti | **321** |
| numeri già corretti — 12 cifre con prefisso | **272** |
| **senza prefisso — 10 cifre che cominciano per 3** | **21** |
| da guardare a mano | 28 |
| **dei 21 recuperabili, creati a settembre** | **20** |

> **Non è un guasto storico: è una perdita in corso.** Venti dei ventuno numeri senza prefisso sono nati **questo mese**, al banco, dalla funzione che abbiamo scritto noi.

**La causa è una riga di `GH-57`**, e la responsabilità è di chi ha scritto quel mandato: la funzione **normalizza per confrontare** ma **salva il testo grezzo**.

```sql
v_phone text := NULLIF(pg_catalog.btrim(p_customer_phone), '');
```

`normalize_phone_it` **esiste in produzione**, viene usata per il confronto dei doppioni, e **non viene mai applicata in scrittura**.

## 1 — Fermare l'emorragia

**In `create_calendar_customer_pet`, il telefono si salva normalizzato.**

**Regole:**

- **si salva `normalize_phone_it(...)`** invece del testo grezzo;
- **se la normalizzazione non produce un numero utilizzabile**, si salva **quello che l'operatore ha scritto**, senza inventare niente. Un `+39alfredo` resta `+39alfredo`: è sbagliato, ma è **quello che il salone sa di quella persona**, e cancellarlo sarebbe peggio;
- **il confronto sui doppioni non cambia**: già oggi lavora sulle sole cifre, e funziona;
- **la dichiarazione «telefono non fornito» non cambia**: resta `NULL`, non diventa una stringa vuota.

**Nient'altro della funzione si tocca**: guardie, lock, tenant, atomicità, valori restituiti.

> **Perché non si valida di più.** Rifiutare un numero mal formato bloccherebbe il banco con una persona davanti, e produrrebbe la stessa famiglia di dati falsi del costo obbligatorio del 31 agosto — le tre visite da 1,00 €. **Si normalizza ciò che è normalizzabile, si conserva il resto, non si rifiuta niente.**

## 2 — Recuperare i ventuno

**Atto di dato, con tabella di appoggio**, nella forma di `GH-70`.

**Solo i numeri di 10 cifre che cominciano per 3** ricevono il prefisso `39`. Misurato: sono **21**, e **nessuno degli altri numeri in archivio collide** con il risultato — verificato, zero collisioni.

**Nient'altro viene toccato.** I 28 da guardare a mano — `+39alfredo`, `+395555`, i tre con due numeri concatenati — **restano esattamente come sono**: quelli li deve leggere Davide, e per alcuni il numero vero è dentro il campo del nome.

**I valori originali finiscono in una tabella di appoggio** con l'identificativo del cliente e la data, e **la SQL di ritorno va scritta nel registro** prima di eseguire — come per `GH-59` e `GH-70`.

> **Attenzione all'unicità.** Esiste `customers_tenant_phone_unique` su `(tenant_id, phone)` per i telefoni non nulli. Aggiungere il prefisso **potrebbe far collidere due righe che oggi convivono**. La misura dice **zero collisioni**, ma va **rifatta dentro la transazione**, non data per buona: se una collisione esistesse, **fermati e dichiarala** invece di risolverla scegliendo tu quale riga tenere.

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro. **Nessuna scrittura in produzione, nessuna lettura della produzione.**

**Nessun numero viene inventato, dedotto o cancellato.** Si aggiunge un prefisso a chi ha dieci cifre che cominciano per 3, e basta.

**Nessun cliente viene fuso, archiviato o modificato in altri campi.**

**Nessuna interfaccia toccata.** Questo giro non ha niente da guardare a schermo.

**Le tre colonne scrivibili dal cliente restano tre.**

**Restano gli invarianti di `GH-54` → `GH-77`.**

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

**Sulla funzione:**

- **numero scritto senza prefisso** — `3386191901`: la riga nasce con il numero **normalizzato**;
- **numero già con prefisso**: nasce identico, nessuna doppia normalizzazione;
- **numero con spazi e separatori** — `+39 333 456 7890`: nasce normalizzato;
- **testo non normalizzabile** — `alfredo`: nasce **come scritto**, non vuoto e non alterato;
- **telefono non fornito**: resta `NULL`;
- **doppione riconosciuto** fra un numero scritto con prefisso e uno senza: la funzione **non crea** e restituisce il cliente esistente — è la prova che le due correzioni non si pestano i piedi;
- **il resto della funzione è invariato**: firma, guardie, privilegi, valori restituiti, impronte prima e dopo.

**Sull'atto di dato:**

- **conteggio prima**: quanti a 12 cifre, quanti a 10 che cominciano per 3, quanti altri;
- **collisioni ricontrollate dentro la transazione**: se ne compare una, **il mandato si ferma**;
- **conteggio dopo**: i 21 diventano 12 cifre, **gli altri 28 identici** — impronta prima e dopo;
- **la tabella di appoggio contiene 21 righe** con i valori originali;
- **nessun cliente in più o in meno**, nessun pet toccato: conteggi prima e dopo;
- **la SQL di ritorno**, scritta per esteso nel registro.

**E poi:**

- **suite RLS rieseguita**: il giro tocca una funzione. Sonda permanente dal `GH-74`;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

Non c'è niente da guardare a schermo. Ma una cosa da fare c'è, ed è la sola che conti:

**dopo l'applicazione, contare quanti clienti hanno un numero utilizzabile.** Se il numero è passato da **272 a 293**, il giro ha fatto quello per cui esiste: **ventun persone in più riceveranno l'invito.**

E resta la coda per Davide: **i 28 da leggere a mano**, e il sospetto che per alcuni il numero vero sia nel campo del nome — dove **133 clienti su 321** se lo portano dietro.

## Chiusura

Registro in `docs/consegne/GH-78-un-numero-che-si-puo-chiamare-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
