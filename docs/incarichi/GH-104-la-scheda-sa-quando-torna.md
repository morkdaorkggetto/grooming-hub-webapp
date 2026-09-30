# Incarico GH-104 — La scheda sa quando torna

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.1 (`~/Desktop/_metodo/CANONE.md`).
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 30 settembre 2026
**Nasce da:** una richiesta di Davide dal banco, riportata da Luigi il 30/9.

**Perimetro**: `src/apps/staff/pages/ClientDetail.jsx`, `src/apps/staff/lib/database.js`, `src/apps/staff/pages/Calendar.jsx` e, se servono, i loro fogli di stile. **Nessuna migrazione, nessuna policy, nessuna colonna.** Database ammesso **solo il demo**, per fixture sintetiche con ripristino a zero. Nessun push, merge o deploy.

## Da dove nasce

Davide apre la **scheda cliente** di un cane e non sa se e quando quel cane torna. Per saperlo deve andare in calendario e cercarlo.

Oggi la scheda **non mostra gli appuntamenti futuri**. Ha il pulsante «Appuntamento», che apre il calendario per fissarne uno nuovo (`ClientDetail.jsx:539-546`), e il riquadro delle **assenze passate** (`noShowAppointments`, caricato in `getClientById`, `database.js:1415-1417`). Del futuro, niente.

**Misure di Cowork nel prodotto, 30/9 alle 14:03 UTC**, con questa query:

```sql
with f as (select pet_id, count(*) n from appointments
  where scheduled_at>=now() and status='scheduled' and approval_status='approved' group by pet_id)
select (select count(*) from appointments where scheduled_at>=now() and status='scheduled') futuri,
 (select count(*) from f) pet_con_futuri, (select count(*) from f where n>1) pet_con_piu_di_uno,
 (select max(n) from f) massimo,
 (select count(*) from appointment_requests where status='pending') richieste_in_attesa;
```

| Misura | Valore |
|---|---|
| appuntamenti futuri in agenda | **93** |
| cani con almeno un appuntamento futuro | **93** |
| cani con più di uno | **0** |
| richieste dei clienti con stato `pending` | **0** |

Oggi quindi il caso reale è **uno o nessuno**. Ma il salone può fissare due appuntamenti allo stesso cane, e l'app cliente sta per aprirsi: il riquadro deve reggere anche i casi che oggi valgono zero.

**Base del codice**: `8b51c0e` su `main`, misurata da Cowork con `git log --oneline -1` il 30/9. Rimisurala tu all'apertura.

## Cosa fare

### 1. Un riquadro «Prossimo appuntamento» nella scheda

Nella scheda cliente, **vicino all'intestazione** — dove Davide guarda per primo — un riquadro che dice **quando questo cane torna**.

**Quali appuntamenti**: quelli **di questo cane**, confermati (`approval_status='approved'`), non chiusi (`status='scheduled'`), **da oggi in avanti**. «Oggi» vuol dire **dall'inizio della giornata a Roma**, non dall'istante attuale: un appuntamento di stamattina ancora `scheduled` è un cane atteso o in lavorazione, e deve comparire. Dichiara nel registro come lo hai calcolato e perché.

**Cosa mostra ogni riga**: giorno, ora e servizio, nel formato che il gestionale usa già per le date. Un tocco sulla riga porta al **calendario, su quel giorno**.

**Se ce ne sono più di uno**: **tutti, in ordine di data**. Niente «+2 altri» che ne nasconde qualcuno: *il conteggio e ciò che si vede devono coincidere* (canone, §2).

**Se non ce ne sono**: una riga sola, **«Nessun appuntamento in agenda»**, con il gesto per fissarne uno (il pulsante che esiste già). Non un riquadro vuoto, non un riquadro che sparisce.

**Solo questo cane.** La scheda è di un cane; gli altri cani dello stesso proprietario restano fuori. Se Davide vorrà vederli, sarà un incarico a sé.

### 2. Una richiesta aperta non sembra un appuntamento

Se per questo cane c'è una **richiesta di un cliente ancora aperta**, compare **nello stesso riquadro, sotto gli appuntamenti, distinta**: con la parola «Richiesta» e lo stato in cui si trova. **Una richiesta non è un posto preso**, e non deve sembrarlo.

**Che cosa conta come «aperta» non lo decidi qui.** Il gestionale ha già una definizione: quella con cui la dashboard mostra le richieste da gestire e quelle in attesa del cliente (le letture su `appointment_requests` in `database.js`, dalla riga 1137 in poi). **Usa la stessa**, non una nuova: *le due sorgenti devono essere d'accordo* (canone, §3, le cinque domande, n. 3). Se trovi che le definizioni in uso sono più d'una, **fermati e dichiaralo**.

Un tocco sulla richiesta porta dove il salone la gestisce oggi.

### 3. Il calendario si apre su un giorno

Oggi `Calendar.jsx` legge dall'indirizzo solo `clientId` (riga 643). Per il punto 1 serve che si possa aprire **su un giorno preciso**. Il modo lo scegli tu; dichiaralo. Due condizioni:

- **un giorno non valido nell'indirizzo** non rompe il calendario: si apre su oggi, come adesso;
- **il comportamento attuale di `clientId` resta identico.**

## La premessa più rischiosa

**La definizione di «richiesta aperta» (punto 2).** È la più rischiosa perché è l'unica in cui il riquadro nuovo può dire una cosa diversa dalla dashboard. Verificala **per prima**, prima di comporre il riquadro: canone §3, «La prova mirata prima di implementare». Se la contesti, dillo.

## Cosa non è in questo incarico

- **Gli altri cani dello stesso proprietario.**
- **L'app cliente**: nessun diff sotto `src/apps/customer`.
- **Una composizione nuova.** Usa i componenti che la scheda ha già (`Panel` e i suoi fratelli). Se ti serve una superficie che non esiste, **fermati e proponila**: la compone Claude Design.
- **L'atto B di GH-103** e tutto ciò che riguarda gli importi.

## Invarianti

- **Nessuna migrazione, nessuna policy, nessuna colonna, nessuna rotta nuova.**
- **Il pulsante «Appuntamento» e il riquadro delle assenze** si comportano come oggi.
- **Nessun colore nuovo, nessuna geometria toccata** fuori dal riquadro nuovo; restano gli invarianti di `GH-54` → `GH-103`.
- **Il pallino e il suono di `GH-81` non cambiano.**
- **Il caricamento della scheda non diventa più lento in modo percepibile**: se aggiungi letture, falle in parallelo a quelle esistenti e dichiara quante sono.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Fixture sintetiche sul demo, ripristino a zero.

- **nessun appuntamento**: il testo esatto che si legge, e il gesto per fissarne uno;
- **un appuntamento domani**: giorno, ora, servizio; il tocco apre il calendario **su domani**;
- **tre appuntamenti**: tutti e tre, in ordine; **il numero delle righe mostrate e quello in agenda coincidono** — riporta i due numeri;
- **stamattina, ora già passata, ancora `scheduled`**: compare. **Ieri**: non compare. **Cancellato, assenza, completato**: non compaiono;
- **un appuntamento di un altro cane dello stesso proprietario**: non compare;
- **una richiesta aperta**: compare distinta, con la parola «Richiesta»; e **la dashboard la mostra nello stesso stato**. Riporta cosa dicono i due posti;
- **una richiesta ritirata o già risolta**: non compare;
- **calendario con un giorno non valido nell'indirizzo**: si apre su oggi, nessun errore;
- **`clientId` come prima**: il pulsante «Appuntamento» fa esattamente quello che faceva;
- **a 375px e a 1365px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px;
- **`src/apps/customer` senza diff**: dimostralo;
- build verde. **Suite RLS: da non rieseguire**, nessun permesso toccato; ultima misura viva `GH-103`, 62 PASS sul demo.

## Passo finale — lo guarda Luigi, con Davide

1. Apri la scheda di un cane che **torna la settimana prossima**: lo vedi senza cercarlo?
2. Tocca l'appuntamento: arrivi **su quel giorno** in calendario?
3. Apri la scheda di un cane **senza appuntamenti**: capisci cosa fare?
4. **E la domanda che conta**: al banco, con il proprietario davanti che chiede «quando ci rivediamo?», Davide risponde **senza lasciare la scheda**?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-104-la-scheda-sa-quando-torna-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
