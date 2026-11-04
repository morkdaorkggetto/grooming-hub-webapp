# Incarico GH-112 — Un appuntamento chiuso ha la sua visita

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 4 novembre 2026
**Nasce da:** una segnalazione del salone del 4/11: nel calendario, **Leo** (labrador) risulta «Completato» il 5/11, il giorno dopo, e nella sua scheda non c'è nessuna visita del 5/11.

**Perimetro**: `src/apps/staff/components/CalendarKit.jsx` (il selettore del pet, punto 4), `src/apps/staff/pages/AddVisit.jsx`, `src/apps/staff/pages/ClientDetail.jsx` (eliminazione di una visita), `src/apps/staff/lib/database.js` (`completeAppointmentWithVisit`, `deleteVisit`), i punti del calendario che portano alla chiusura con visita, e **un file di migrazione**. **Database**, tre categorie distinte:

- **lettura del demo**: ammessa;
- **dati di prova temporanei sul demo**, e **applicazione della tua migrazione al demo**: ammessi, con ripristino verificato;
- **qualunque accesso al prodotto**: no. La migrazione nel prodotto la applica Cowork.

Nessun push, merge o deploy. Base: `a9b7f8c`.

## Da dove nasce — ricostruito da Cowork il 4/11

Dai registri del database del 3/11 (ore di Roma) e dalle tabelle:

| Ora | Evento |
|---|---|
| 12:39:50 | `complete_appointment_with_visit` sull'appuntamento di **Leo labrador del 5/11** (`098bbdd6-…`): appuntamento → `completed`, visita creata |
| 12:40:05 | `DELETE` di quella visita (`f874bcd4-…`) dalla scheda |
| 12:40:21 | `complete_appointment_with_visit` sull'appuntamento di **Leo barboncino** del 3/11 alle 10:30, l'altro Leo: visita da 30 € |

Il salone ha chiuso il Leo sbagliato, se n'è accorto e ha cancellato la visita. **L'appuntamento è rimasto `completed` senza visita**: il calendario dice «completato», la scheda no. *Il conteggio e ciò che si vede non coincidono* (canone, §2).

Cowork ha riportato quell'appuntamento a `scheduled` con un atto del 4/11 (`gh112_reopen_leo_labrador_20261105`). **Misure nel prodotto dopo l'atto, 4/11 alle 11:30:**

| Misura | Valore |
|---|---:|
| appuntamenti `completed` con data futura | 0 |
| appuntamenti `completed` senza visita collegata | 45 |
| … e senza nessuna visita dello stesso cane in quel giorno | 2 (Zac il 30/10, Dudù l'8/9: li controlla Davide) |
| nomi di pet usati da più di un cane | 74 |
| nomi di pet con spazi in testa o in coda | 29 (Leo labrador è «Leo ») |

I 45 «senza visita collegata» sono quasi tutti visite registrate a parte nello stesso giorno: è un modo legittimo di lavorare, **non va toccato**.

## Cosa fare

### 1. Non si chiude con visita un appuntamento futuro

`complete_appointment_with_visit` rifiuta un appuntamento il cui **giorno a Roma è successivo a oggi**, con un codice stabile in `DETAIL` (per esempio `GH112_APPOINTMENT_IN_FUTURE`). Lo stesso vale per `set_staff_appointment_status` quando si chiede `completed`.

Nel gestionale, **il gesto non è offerto** per un appuntamento futuro, e se ci si arriva comunque, per esempio da un indirizzo, il rifiuto si legge in italiano: «Questo appuntamento è di un giorno che non è ancora arrivato.» (proponi tu le parole migliori). **Oggi resta permesso**, anche prima dell'ora dell'appuntamento: un cane può arrivare in anticipo.

### 2. Eliminare la visita di un appuntamento lo riapre

Se si elimina una visita **collegata a un appuntamento** (`visits.appointment_id`), l'appuntamento torna `scheduled` **nella stessa operazione**: o tutte e due le cose, o nessuna. Prima di eliminare, il gestionale lo **dice**: «L'appuntamento del {giorno} tornerà da completare.»

Scegli tu dove farlo (una funzione nel database che fa le due cose insieme è la strada sicura; due chiamate dal browser non lo sono) e dichiaralo. Una visita **senza** appuntamento collegato si elimina come oggi.

### 3. Chiudendo, si vede quale cane

Nella pagina in cui si chiude un appuntamento con la visita, accanto al nome compaiono **razza e proprietario**, e **giorno e ora dell'appuntamento**. Davide deve poter vedere che sta chiudendo «Leo · Labrador · 5/11 ore 10:00» e non «Leo · Barboncino · 3/11 ore 10:30».

Usa i componenti che la pagina ha già. Se ti serve una composizione nuova, fermati e proponila.

**Gli spazi nei nomi** non si correggono qui: è un atto sui dati, lo farà Cowork a parte.

### 4. Il cane si sceglie solo toccandolo

*Aggiunto il 4/11 su proposta di Luigi e Davide: «gran parte di questi errori nascono dal completamento automatico».*

Nel selettore del pet (`CalendarKit.jsx`, intorno alle righe 278-307), usato da «Nuovo appuntamento» e da «Registra lavorazione», oggi ci sono due automatismi:

- **la scelta automatica** introdotta da `GH-101`: un nome esatto che appartiene a un solo pet viene scelto da solo (`exactMatches.length === 1`, riga ~300). Anche il mantenimento della scelta precedente mentre si scrive un prefisso dell'etichetta (`selectedStillDescribed`) è una scelta fatta al posto della persona;
- **la prima voce già evidenziata** (`setActiveIndex(… 0)`): premendo Invio si sceglie quella, anche se non è il cane giusto.

**Togli entrambi.** Scrivendo, l'elenco si **filtra** e basta; **un pet si sceglie solo con un gesto esplicito su una riga**: tocco o clic, oppure frecce e poi Invio su una riga che la persona ha evidenziato da sé. Ogni riga mostra **nome, razza e proprietario**. Se il testo cambia dopo una scelta, la scelta **si toglie** e si vede che si è tolta.

**Non torna il difetto di Clover** (`GH-100`, `GH-101`): il pulsante spento resta accompagnato dalla frase già scritta, «Scegli un pet dall'elenco per salvare l'appuntamento», leggibile prima di premere. Verificalo.

**Il caso di Leo del 3/11 non nasceva qui**: la chiusura con visita parte toccando la scheda di un appuntamento (`Calendar.jsx:1189`, `DailyAppointments.jsx:235`), senza nessun selettore. Per quel caso valgono i punti 1-3. Il punto 4 chiude un'altra porta.

## Le impronte del prodotto

Misurate da Cowork il **4/11/2026 alle 11:30:24 Europe/Rome**, algoritmo **MD5** di `pg_get_functiondef`, valore intero:

| Funzione | MD5 nel prodotto |
|---|---|
| `complete_appointment_with_visit(text,date,text,text,numeric,uuid)` | `848d3557add8cfc69b1e367dc161ca67` |
| `create_staff_visit(uuid,date,numeric,text,text,numeric,uuid,text)` | `9d87519547e553d211bba15a3845a003` |
| `gh103_finance_bridge()` | `bc62652be087008365c615bee911012d` |
| `set_staff_appointment_status(text,text)` | `47946d65580eda6691340f0b0ba3deec` |

Query:

```sql
select p.oid::regprocedure::text obj, md5(pg_get_functiondef(p.oid)) md5
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('complete_appointment_with_visit','create_staff_visit','set_staff_appointment_status','gh103_finance_bridge')
order by 1;
```

**Rifalla identica sul demo prima di cominciare.** Se una riga differisce, fermati e scrivilo.

## Compatibilità con la versione online

Fra l'atto nel prodotto e il deploy passa del tempo, e il salone lavora. **La versione online deve continuare a funzionare dopo l'atto**: stesse firme, oppure firme nuove senza lasciare due funzioni con lo stesso nome (PostgREST non sceglie fra due firme). Provalo per primo: con la migrazione applicata al demo, chiama le funzioni con gli argomenti esatti che manda oggi `database.js` alla base `a9b7f8c`.

**`GH-106` (l'omaggio) non è ancora stato eseguito** e cambierà anch'esso `complete_appointment_with_visit`. Questo incarico viene prima; `GH-106` partirà da qui.

## Invarianti

- **Chiudere oggi un appuntamento di oggi** funziona come adesso, con gli stessi testi.
- **Le 45 chiusure senza visita collegata** e le visite registrate a parte non cambiano.
- **Assenza** (`no_show`) e il suo punteggio: invariati.
- **Nessun colore nuovo**, nessuna classe tipografica scritta a mano.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Dati di prova sul demo, ripristino a zero.

- **appuntamento di domani**: il gesto di chiusura non è offerto; la chiamata diretta alla funzione è rifiutata con il codice; con `set_staff_appointment_status('completed')` lo stesso;
- **appuntamento di oggi, ora non ancora arrivata**: si chiude;
- **appuntamento di ieri**: si chiude;
- **elimina la visita di un appuntamento chiuso**: l'avviso si legge prima; dopo, la visita non c'è e l'appuntamento è `scheduled`, **nella stessa operazione**. Simula un errore a metà: nessuna delle due cose avviene;
- **elimina una visita senza appuntamento**: come oggi;
- **i due Leo** (dati di prova: stesso nome, razze e proprietari diversi): nella pagina di chiusura si leggono razza, proprietario, giorno e ora;
- **selettore, nome unico scritto per intero**: nessuna scelta automatica; il pulsante resta spento con la frase; un tocco sulla riga sceglie;
- **selettore, Invio senza aver evidenziato nulla**: nessuna scelta;
- **selettore, frecce e Invio su una riga**: sceglie quella riga;
- **selettore, testo modificato dopo una scelta**: la scelta si toglie, e si vede;
- **il caso di Clover ripetuto** (`GH-101`): scrivere il nome senza toccare la riga e provare a salvare → la frase spiega cosa manca;
- **la versione online sopra l'atto**: le chiamate della base `a9b7f8c` funzionano;
- **suite RLS**: rieseguila, perché tocchi funzioni che scrivono; riporta PASS, FAIL e SKIP;
- **a 375px e a 1365px**: nessuno sbordamento;
- build verde.

## Cosa consegnare a Cowork

In cima al registro: **l'ordine fra atto e deploy**, la **query di verifica** dopo l'atto con l'esito atteso, e **come si torna indietro** se l'atto fallisce a metà.

## Passo finale — lo guarda Luigi, con Davide

1. Prova a chiudere un appuntamento di domani: l'app te lo impedisce, e capisci perché?
2. Chiudi un appuntamento di oggi, poi elimina la visita: l'appuntamento torna da completare?
3. **E la domanda che conta**: se ieri ci fosse stata questa versione, Davide avrebbe chiuso il Leo sbagliato?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-112-un-appuntamento-chiuso-ha-la-sua-visita-esito.md`, committato col codice e con il file di migrazione. Niente push, niente merge, niente deploy.
