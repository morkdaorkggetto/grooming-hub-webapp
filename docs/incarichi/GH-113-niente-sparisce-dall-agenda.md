# Incarico GH-113 — Niente sparisce dall'agenda

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.3.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 4 novembre 2026
**Base:** `0cba05a` (pubblicazione di `GH-112`, già nel prodotto).

**Perimetro**: `src/apps/staff/lib/database.js` (`deleteAppointment` e vicini), `src/apps/staff/pages/Calendar.jsx` e `DailyAppointments.jsx` per il gesto e il ripristino, e **un file di migrazione**. **Database**, tre categorie distinte:

- **lettura del demo**: ammessa;
- **dati di prova temporanei sul demo e applicazione della tua migrazione al demo**: ammessi, con ripristino verificato;
- **qualunque accesso al prodotto**: no. La migrazione nel prodotto la applica Cowork.

Nessun push, merge o deploy.

## Da dove nasce

Il 4/11 Davide segnala che **una prenotazione per due chihuahua è sparita**. Cowork non è riuscito a ricostruire quale fosse. I registri del server dicono **quando** si elimina un appuntamento, non **quale**:

| Quando (Roma) | Evento nei registri |
|---|---|
| 2/11, 8:48 | `rpc/delete_staff_appointment` → **400** |
| 2/11, 10:46 e 10:52 | `rpc/delete_staff_appointment` → **200**, dal Mac del salone |
| 4/11, 9:01 | `rpc/delete_staff_appointment` → **200**, dal Mac del salone |

`delete_staff_appointment` (prodotto, letto da Cowork il 4/11) **cancella la riga** con `DELETE`, dopo aver escluso gli appuntamenti completati, le assenze, quelli nati da una richiesta del cliente e quelli con una visita (guardie `GH58_*`). **Dopo, non resta niente**: né il cane, né il giorno, né chi l'ha tolto. Lo stesso succede, a cascata, eliminando un cane (`appointments.pet_id … ON DELETE CASCADE`).

Lo stato `cancelled` invece **esiste già** (31 appuntamenti annullati nel prodotto) e il calendario lo mostra a parte (`Calendar.jsx:479-480`).

`GH-100` aveva proposto un registro delle scritture. **Non è mai stato costruito.** Questo incarico lo costruisce, almeno per gli appuntamenti.

## Cosa fare

### 1. Un registro che non si può cancellare

Una tabella nuova, per esempio `appointment_events`, **in sola aggiunta**:

- una riga per **ogni** inserimento, modifica ed eliminazione di un appuntamento, **da qualunque percorso**: le funzioni, le scritture dirette del gestionale, la cascata da un cane eliminato. Quindi un **trigger** sulla tabella `appointments`, non una chiamata dal codice del browser;
- in ogni riga: **quando**, **chi** (`auth.uid()`, o «sistema» se non c'è), **quale azione**, l'appuntamento, il salone, il cane **con il suo nome copiato** (perché il cane può sparire), e **prima e dopo** dei campi che contano: stato, giorno e ora, durata, servizio, cane, note;
- **nessuno può modificarla o cancellarla**: nessun permesso di `UPDATE` o `DELETE` per nessun ruolo dell'app, `INSERT` solo dal trigger;
- **legge solo lo staff del proprio salone**. Il cliente e l'anonimo non vedono niente.

Il trigger **non deve mai far fallire** la scrittura dell'appuntamento per un motivo suo: se c'è un dubbio fra «registro incompleto» e «salvataggio fallito», la seconda è peggio, perché è la causa dei cani fantasma. Dichiara come l'hai garantito.

### 2. «Elimina» diventa «Annulla»

- `delete_staff_appointment` **non cancella più**: porta l'appuntamento a `cancelled`. Tiene **lo stesso nome e gli stessi argomenti**, così la versione online, che la chiama così, continua a funzionare dopo l'atto e prima del deploy. Le guardie `GH58_*` restano;
- nel gestionale il gesto si chiama **«Annulla appuntamento»**, con una conferma che dice cane, giorno e ora;
- un appuntamento annullato si può **ripristinare** dal calendario, se il posto è ancora libero. Il controllo delle postazioni lo fa già il database (`enforce_appointment_workstation_capacity`): **verifica** che un annullato non occupi postazioni e che il ripristino le ricontrolli;
- **eliminare un cane** resta com'è, ma ora la cascata lascia la sua traccia nel registro.

### 4. Eliminare un cane non porta via l'agenda di nascosto

*Aggiunto il 4/11 da Cowork, dopo aver ricostruito il caso dei due chihuahua.* Il 4/11 alle 9:07:30 (Roma) il gestionale ha eseguito `DELETE /rest/v1/pets?id=eq.1d4dbe24-…`, la scheda «2Chiwawa» della cliente Vittoria, preceduta alle 9:06:58 e alle 9:07:16 dall'eliminazione di due sue visite. La cascata ha portato via **l'appuntamento di venerdì**, senza che nessuno lo sapesse: la conferma di oggi (`ClientDetail.jsx:332`) dice soltanto «Eliminerai il cliente e tutte le sue visite. Sei sicuro?», e **degli appuntamenti non dice niente**. La cliente Vittoria è rimasta in archivio senza cani.

Quindi:

- se il cane ha **appuntamenti futuri non annullati**, l'eliminazione **non procede**: il gestionale li elenca (giorno e ora) e chiede di annullarli o spostarli prima. La guardia sta **nel database**, non solo nel browser;
- se non ne ha, la conferma dice **cosa si perde davvero**: visite, appuntamenti passati, foto. Le parole proponile tu;
- in ogni caso la cascata lascia la sua traccia nel registro del punto 1.

Aggiungi alle controprove: **cane con un appuntamento futuro** → eliminazione rifiutata, appuntamento elencato; **dopo averlo annullato** → eliminazione possibile, e nel registro le righe dell'annullamento e della cascata.

### 5. Un proprietario senza cani non diventa invisibile

*Aggiunto il 4/11 da Cowork.* Dopo l'eliminazione della scheda, Vittoria è rimasta in `customers` **senza nessun pet**. Il gestionale elenca i pet, non i proprietari: lei non compariva da nessuna parte, e alle 16:23, 16:24 e 16:25 `add_customer_with_pet` ha risposto **409** tre volte, perché il suo telefono era già usato. **Il salone non poteva ricreare la scheda.** Cowork l'ha ricreata con un atto sui dati (`gh113_restore_vittoria_pet_card`, 4/11). Nel prodotto restano **2 proprietari senza cani**.

Quindi:

- creando un cliente con un telefono che appartiene a **un proprietario senza cani**, il gestionale lo dice e propone di **aggiungere il cane a quel proprietario**, invece di fallire;
- un 409 da questa funzione non arriva mai a schermo come errore muto: il testo dice cosa succede e cosa fare.

Controprova: proprietario senza cani, nuovo cane con il suo numero → il cane si aggiunge a lui; nessun 409 visibile.

*Estensione del perimetro autorizzata da Luigi il 4/11, su domanda di Codex: `src/apps/staff/pages/AddClient.jsx`, e una fixture sintetica temporanea sul solo demo (proprietario senza pet, poi nuovo pet), con ripristino e conteggi nel registro.*

### 3. La lettura del registro

Per ora **nessuna pagina nuova**. Il registro lo legge Cowork, con una query che consegni pronta nel registro di consegna: «gli appuntamenti annullati o eliminati fra il giorno X e il giorno Y, con cane, giorno, ora e chi». Se pensi che serva una vista nel gestionale, **proponila**: la compone Claude Design.

## Le impronte del prodotto

Misurate da Cowork il **4/11/2026 alle 16:48:15 Europe/Rome**, **MD5** di `pg_get_functiondef`:

| Funzione | MD5 nel prodotto |
|---|---|
| `complete_appointment_with_visit(text,date,text,text,numeric,uuid)` | `e11fb0645ab8c0721439ef84e7806ff8` |
| `delete_staff_appointment(text)` | `9cafa4463f44b813fa01c79f3255eba1` |
| `delete_staff_visit_reopen_appointment(text,uuid)` | `980489a4240bc55af73fa20598cba1f9` |
| `enforce_appointment_workstation_capacity()` | `ee50b77d740c925114c6b7709e057e8b` |
| `set_staff_appointment_status(text,text)` | `e3ed83d0a820a253929de287c688d276` |

Query, da rifare identica sul demo:

```sql
select p.oid::regprocedure::text obj, md5(pg_get_functiondef(p.oid)) md5
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('delete_staff_appointment','set_staff_appointment_status','enforce_appointment_workstation_capacity',
  'complete_appointment_with_visit','delete_staff_visit_reopen_appointment')
order by 1;
```

**Differenza attesa e già accettata**, che non ti ferma: sul demo l'atto B di `GH-103` è applicato e nel prodotto no (`gh103_finance_bridge()` e le tre colonne legacy degli importi). Non è fra le funzioni sopra, ma se la tua migrazione tocca `appointments` non deve dipendere da quegli oggetti. **Ogni altra differenza: fermati.**

## Compatibilità con la versione online

Fra atto e deploy il salone lavora. Dopo l'atto, **la versione online** (base `0cba05a`) deve continuare a funzionare: il suo «Elimina» chiama `delete_staff_appointment` e ora annullerà invece di cancellare. **Provalo per primo**, con gli argomenti esatti di `database.js` alla base, e dichiara cosa vede il salone in quel caso: l'appuntamento compare fra gli annullati invece di sparire. È il comportamento voluto.

## Invarianti

- **Nessun appuntamento esistente cambia** con l'atto.
- **Completati, assenze, richieste del cliente, visite**: le guardie di oggi restano.
- **Il trigger del registro non rallenta né blocca** salvataggi, spostamenti e chiusure.
- **Il cliente non legge il registro.**
- **Nessun colore nuovo**, nessuna classe tipografica scritta a mano.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Dati di prova sul demo, ripristino a zero. **Il registro di prova sul demo si svuota solo con un'operazione amministrativa dichiarata**, non con i permessi dell'app: è la prova che l'app non può farlo.

- **inserimento, spostamento, cambio di stato, chiusura con visita**: una riga ciascuno nel registro, con prima e dopo;
- **«Annulla»** dal gestionale: l'appuntamento resta, `cancelled`, visibile fra gli annullati; una riga nel registro con chi e quando;
- **la versione online sopra l'atto**: il suo «Elimina» annulla e non cancella;
- **ripristino** di un annullato con posto libero: torna `scheduled`; con il posto occupato: rifiuto spiegato;
- **eliminazione di un cane** con due appuntamenti: due righe di eliminazione nel registro, con il nome del cane;
- **l'app non può modificare né cancellare il registro**: tentativi diretti come staff, cliente e anonimo, tutti rifiutati;
- **il cliente non lo legge**; **lo staff di un altro salone nemmeno**;
- **un errore dentro il trigger** (simulato): dichiara cosa succede al salvataggio, coerentemente con il punto 1;
- **la query per Cowork** del punto 3, eseguita sui dati di prova, con il risultato;
- **suite RLS**: rieseguila, aggiungendo le prove del registro; PASS, FAIL e SKIP;
- **a 375px e a 1365px**: conferma e ripristino senza sbordamenti;
- build verde.

## Cosa consegnare a Cowork

In cima al registro: **l'ordine fra atto e deploy**, la **query di verifica** dopo l'atto con l'esito atteso, **come si torna indietro**, e la **query di lettura** del punto 3.

## Passo finale — lo guarda Luigi, con Davide

1. Annulla un appuntamento di prova: lo vedi ancora, fra gli annullati?
2. Ripristinalo: torna al suo posto?
3. **E la domanda che conta**: se domani una prenotazione «sparisce», Cowork può dirti in un minuto chi l'ha tolta e quando?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-113-niente-sparisce-dall-agenda-esito.md`, committato col codice e con il file di migrazione. Niente push, niente merge, niente deploy.
