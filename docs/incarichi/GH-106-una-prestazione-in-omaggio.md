# Incarico GH-106 — Una prestazione in omaggio

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 ottobre 2026
**Nasce da:** una domanda di Luigi, 1/10: *«l'app non permette di regalare una prestazione al pet, vero?»*.

**Perimetro**: il modulo della visita e i suoi usi (`components/VisitForm.jsx`, `pages/AddVisit.jsx`, `pages/ClientDetail.jsx` per la modifica di una visita, la chiusura di un appuntamento dal calendario), `lib/database.js`, `pages/WeeklyRevenue.jsx`, e **un file di migrazione** se serve (punto 3). **Dati**: sul demo sono ammessi **dati di prova temporanei**, con ripristino a zero verificato; i dati esistenti del demo non si modificano. **La produzione non si tocca**: la migrazione la applica Cowork, con l'autorizzazione di Luigi. Nessun push, merge o deploy.

## Da dove nasce

Oggi una visita **deve** costare più di zero, in tre punti (letti da Cowork il 1/10 sulla base `8e96e69`):

| Dove | Controllo |
|---|---|
| `AddVisit.jsx:53-55` | «Il costo è obbligatorio e deve essere un numero positivo» |
| `database.js:911` (`addVisit`) e `:941` (`completeAppointmentWithVisit`) | costo maggiore di zero |
| funzioni `create_staff_visit` e `complete_appointment_with_visit` (atto A di `GH-103`) | `p_cost<=0` → errore `22023` |

Per una prestazione regalata Davide ha due strade, entrambe sbagliate: **un importo finto**, e l'incasso mente; oppure **non registrarla**, e il cane perde la visita nello storico e nel livello.

Ogni visita ha però già, accanto al costo, uno **sconto in percentuale** (`visit_financials.discount_percent`, dall'atto A di `GH-103`). Nel prodotto è **0 su tutte le visite** (misura di Cowork del 27/9: somma degli sconti 0,00) e il modulo non lo mostra. Il report settimanale **calcola già il netto**: `WeeklyRevenue.jsx:116-118`, costo × (1 − sconto/100); e alla riga 357 mostra «Sconto N%» quando c'è.

## Decisioni di Luigi, 1/10

- **Un omaggio è una visita con il prezzo pieno e lo sconto al 100%.** Incassato: 0 €. Il valore regalato resta leggibile.
- **L'omaggio conta come visita**: nello storico e nel conteggio del livello. Il cane al salone c'è venuto.
- **Il proprietario vede la visita come le altre**, senza la parola «Omaggio». Gli importi il proprietario non li vede già, dopo `GH-103`.

## Cosa fare

### 1. Un gesto esplicito, non uno zero

Nel modulo della visita, un controllo **«Omaggio»** chiaro e separato dal costo. Quando è attivo:

- il costo resta **il prezzo pieno** (quello del servizio scelto, come oggi, o quello scritto);
- lo sconto diventa **100**;
- accanto si legge che cosa succede: *non si incassa niente, la visita resta nello storico*.

**Uno zero scritto a mano nel costo continua a essere rifiutato**, con lo stesso messaggio di oggi. È proprio lo zero battuto per sbaglio che la regola attuale protegge, e deve continuare a farlo.

**La forma la scegli tu dentro i componenti che il modulo ha già** (`Field` e i suoi fratelli in `StaffKit.jsx`). Se ti serve una composizione nuova, fermati e proponila: la compone Claude Design.

### 2. Vale ovunque si registra una visita

- **visita nuova** (`AddVisit`);
- **chiusura di un appuntamento dal calendario** (`completeAppointmentWithVisit`);
- **modifica di una visita esistente** dalla scheda: si può trasformare in omaggio e tornare indietro.

**Censisci con una ricerca** tutti i punti che salvano o modificano costo e sconto, non a memoria.

### 3. Il database: un solo atto, compatibile con la versione online

La chiusura di un appuntamento oggi passa sconto **0** fisso: `complete_appointment_with_visit` chiama `create_staff_visit(..., 0, ...)`. Per l'omaggio deve poter passare lo sconto.

Scrivi **una migrazione** che lo permetta. Vincoli:

- **nessuna funzione omonima in due versioni**: PostgREST non sceglie fra due firme dello stesso nome. Se cambi la firma, togli la vecchia nello stesso atto;
- **la versione online, che chiama la funzione senza sconto, deve continuare a funzionare** dopo l'atto e prima del deploy: il parametro nuovo ha un valore predefinito 0;
- **lo sconto accetta solo da 0 a 100**: controllato nella funzione e, se non c'è già, con un vincolo sulla tabella. Prima di aggiungere un vincolo, **misura sul demo** che nessuna riga lo violi;
- **il costo resta maggiore di zero**: un omaggio ha il prezzo pieno, non zero;
- **non toccare le colonne `visits.cost` e `visits.discount_percent`**: sono quelle che l'atto B di `GH-103` toglierà. La migrazione deve funzionare **sia prima sia dopo** l'atto B. Dichiara come lo hai verificato.

**Ordine per Cowork**, in cima al registro: atto, deploy, e la query di verifica con l'esito atteso.

### 4. Il report dice quanto si è regalato

Nel report settimanale:

- un omaggio **non entra nell'incassato** — oggi è già così per il calcolo del netto: **verificalo con una prova**, non dal codice;
- la riga della visita dice **«Omaggio»**, non «Sconto 100%»;
- nel riepilogo della settimana compare **quanto è stato regalato**, in euro, **solo se** nella settimana c'è almeno un omaggio. Nessuna riga a zero.

## Cosa non è in questo incarico

- **Omaggi parziali o sconti diversi dal 100%.** Lo sconto resta nascosto nel modulo, salvo l'omaggio.
- **L'app del proprietario**: nessun diff sotto `src/apps/customer`.
- **I punti e i livelli**: l'omaggio conta come visita perché è una visita; nessuna regola di livello cambia.
- **L'atto B di `GH-103`.**
- **L'arrotondamento a euro intero del riepilogo settimanale**, misurato in `GH-103`: preesistente, fuori da qui.

## Invarianti

- **Una visita normale si registra esattamente come oggi**, con gli stessi testi.
- **Lo zero scritto nel costo resta rifiutato.**
- **Gli incassi delle settimane passate non cambiano di un centesimo**: nessuna visita esistente ha uno sconto.
- **Nessun colore nuovo, nessuna classe tipografica scritta a mano** (vedi `GH-105`).
- **Il proprietario non legge nessun importo**: le regole di `GH-103` restano intatte.

## Le impronte del prodotto

Misurate da Cowork nel prodotto il **1/10/2026 alle 09:29:41 UTC**. Algoritmo **MD5** di `pg_get_functiondef`, valore intero:

```sql
select p.oid::regprocedure::text obj, md5(pg_get_functiondef(p.oid)) md5
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('complete_appointment_with_visit','create_staff_visit','gh103_finance_bridge')
order by 1;
```

| Funzione | MD5 nel prodotto |
|---|---|
| `complete_appointment_with_visit(text,date,text,text,numeric,uuid)` | `848d3557add8cfc69b1e367dc161ca67` |
| `create_staff_visit(uuid,date,numeric,text,text,numeric,uuid,text)` | `9d87519547e553d211bba15a3845a003` |
| `gh103_finance_bridge()` | `bc62652be087008365c615bee911012d` |

**Rifai la stessa query sul demo prima di cominciare.** Se una riga differisce, fermati e scrivilo: canone §3, il triplo controllo.

## La premessa più rischiosa

**Il punto 3, la compatibilità.** Fra l'atto e il deploy passa del tempo, e il salone lavora: la chiusura di un appuntamento dalla versione online **non deve fallire**. È la stessa causa dei cani fantasma. Provala **per prima**: con la funzione nuova applicata al demo, chiama la funzione con gli argomenti esatti che manda oggi `database.js` alla base `8e96e69`, e dimostra che salva.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Dati di prova sul demo, ripristino a zero.

- **visita normale**: si salva come oggi, sconto 0;
- **zero scritto a mano**: rifiutato, testo esatto;
- **omaggio da visita nuova**: costo pieno, sconto 100, nello storico della scheda, conta nel livello: riporta il conteggio delle visite prima e dopo;
- **omaggio chiudendo un appuntamento**: stesso esito, e l'appuntamento risulta chiuso;
- **modifica**: visita normale → omaggio → di nuovo normale. Costo e sconto giusti a ogni passo;
- **la versione online sopra l'atto**: la chiamata della base `8e96e69` salva, con sconto 0;
- **sconto fuori misura** (−1, 101) chiamando la funzione direttamente: rifiutato;
- **report**: una settimana con una visita normale e un omaggio. Incassato = solo la normale; riga «Omaggio»; «regalato» = il prezzo pieno dell'omaggio. Una settimana senza omaggi: **nessuna riga «regalato»**;
- **settimane passate**: incassato identico prima e dopo, al centesimo, su almeno tre settimane del demo;
- **app del proprietario**: Mario vede la visita in omaggio nello storico, **senza** la parola «Omaggio» e senza importi;
- **a 375px e a 1365px**: modulo e report senza sbordamenti, bersagli almeno 44px;
- **`src/apps/customer` senza diff**;
- build verde; **suite RLS**: rieseguila, perché tocchi una funzione che scrive dati economici. Riporta PASS, FAIL e SKIP.

## Passo finale — lo guarda Luigi, con Davide

1. Registra un omaggio: è chiaro cosa stai facendo, e cosa succede all'incasso?
2. Prova a scrivere 0 nel costo: l'app ti ferma?
3. Apri il report della settimana: vedi quanto hai regalato?
4. **E la domanda che conta**: un omaggio fatto a un cliente affezionato, fra un mese, risulta ancora da qualche parte?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-106-una-prestazione-in-omaggio-esito.md`, committato col codice e con il file di migrazione. Niente push, niente merge, niente deploy.
