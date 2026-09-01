# Incarico GH-59 — La porta di servizio, e la griglia che resta

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Porta una migrazione, e questa volta cambia una policy.** **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Superficie:** `/calendar` e i suoi modali. File attesi: `pages/Calendar.jsx`, `shared/ui/Modal.jsx` (+ CSS), `pages/Calendar.css`, una migrazione nuova. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy. **La produzione non si tocca.**

> **Attenzione, e vale per tutto il mandato**: una policy sbagliata su `appointments` **chiude fuori il salone dal proprio calendario**. È la classe di atto più pericolosa che abbiamo fatto dopo G6. Se una controprova non ti torna, **fermati e dichiaralo**: l'interruzione motivata qui vale più di una consegna completa.

---

## 1 — La porta di servizio

`GH-58` ha messo quattro guardie sull'eliminazione di un appuntamento: completato, assenza, richiesta del cliente, visita collegata. **Ma non sono guardie del database: sono guardie dell'applicazione.**

Misurato in produzione il 1/9:

```
appointments_staff_all → FOR ALL → has_tenant_any_staff_access(tenant_id)
```

`ALL` comprende `DELETE`. Chiunque abbia una sessione staff può **cancellare qualunque appuntamento direttamente**, scavalcando tutte e quattro. Non è uno scenario di malintenzionati: è che stiamo chiamando garanzia del database una promessa del nostro codice, e regge finché l'unico programma che parla con l'API è il nostro.

**La correzione**: `appointments_staff_all` viene sostituita da policy che coprono **`SELECT`, `INSERT`, `UPDATE`** con **esattamente le stesse condizioni**. Nessuna policy copre `DELETE` → da quel momento **l'unica strada per eliminare è `delete_staff_appointment`**.

**Le policy dei clienti non si toccano.** Sono tre — `appointments_customer_select`, `appointments_customer_request_insert`, `appointments_customer_request_update` — e restano identiche.

### Le due cose che vanno misurate prima, non dedotte

**a. La cascata dei pet.** `appointments.pet_id → pets` è **`ON DELETE CASCADE`**, e il salone il gesto «elimina pet» ce l'ha. In teoria la cascata la esegue il sistema e le policy non la toccano — **ma «in teoria» non è una misura**, e la cosa in gioco è la capacità del salone di cancellare un cane.

**Dimostralo sul demo**: dopo la chiusura, eliminare un pet che ha appuntamenti **toglie ancora i suoi appuntamenti**. Se non fosse così, **il mandato si ferma qui** e la voce 1 non si applica.

**b. Il fallimento è silenzioso.** Un `DELETE` negato da RLS **non solleva errore**: riporta successo e cancella zero righe. Misuralo e scrivilo nel registro con queste parole, perché è il difetto che qualcuno inseguirà fra sei mesi.

### E scrivi il ritorno

Nel registro, la **SQL esatta per ripristinare `appointments_staff_all`** com'era. Non perché prevedo di usarla: perché su una policy di produzione il modo di tornare indietro si scrive **prima**, non mentre serve.

## 2 — I moduli che nascono dalla griglia si accostano

`GH-57` ha accostato «Nuovo appuntamento». Ma **il dettaglio dell'appuntamento copre la griglia peggio**, perché è quello che si apre *mentre si guarda la settimana*, per decidere se spostare quel cane e dove.

**Il criterio, e non è un elenco:**

> **I moduli che nascono dalla griglia si accostano. Quelli che nascono dall'intestazione restano centrati.**

Quindi: **si accostano** «Nuovo appuntamento» aperto da «Prenota qui» o dal pulsante, e **il dettaglio dell'appuntamento**. **Restano centrati** «Registra lavorazione» dall'intestazione, «Conferma richiesta», e tutti i modali fuori dal calendario — lì la griglia non serve a decidere niente.

Vale anche per i moduli futuri, senza doverli elencare uno per uno.

**Sotto i 640px nulla cambia**: resta il foglio a tutto schermo.

> **Il dettaglio è più fitto del modulo di prenotazione**: ha due file di pulsanti — «Promemoria / Google / Apple / Apri cliente», poi «Registra lavorazione / Nuovo per lo stesso cliente» — che a pannello stretto vanno a capo più volte. **Misura l'altezza del pannello a 1280 e a 1024** e dichiarala. Se a 1024 il pannello supera l'altezza della finestra, dillo invece di comprimere i pulsanti.

**Fatto nuovo da tenere presente**: al banco il salone ha **uno schermo da 27 pollici**. Il caso normale è più largo di quanto abbiamo misurato finora.

---

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro.

**Le policy dei clienti non cambiano.** Nemmeno di una parola.

**`delete_staff_appointment` non si modifica**, e nemmeno `set_staff_appointment_status`: il punteggio delle assenze resta affare di `GH-52`.

**Le condizioni di `SELECT`, `INSERT`, `UPDATE` restano identiche a quelle di oggi.** Questo mandato **toglie** un permesso, non ne ridefinisce altri. Se ti trovi a migliorare una condizione, fermati e dichiaralo.

**Nessun colore nuovo, nessuna rotta nuova**, e restano intatti gli invarianti di `GH-54` → `GH-58`: grana a mezza giornata, lavorazioni senza ora mai dentro una fascia, margine che non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px, lessico ammesso **solo** `lavorati sul momento`, `chi arriva`, `senza ora fissata`.

**Il peso visivo segue l'agibilità, non la categoria**; **l'arretramento appartiene al contenitore, non alle lettere**.

## Controprove

Dichiara nel registro, misurate **sul demo** con fixture usa-e-getta, rimosse a fine sessione.

**Sulla policy — nell'ordine, e la prima è bloccante:**

- **cancellare un pet con appuntamenti toglie ancora i suoi appuntamenti**: conteggi prima e dopo. **Se fallisce, il mandato si ferma**;
- lo staff **legge, crea e modifica** appuntamenti come prima: una prova per ciascuna delle tre;
- un `DELETE` diretto da sessione staff **cancella zero righe e non solleva errore**: riporta il numero di righe e l'assenza di eccezione;
- `delete_staff_appointment` **funziona ancora** su una riga eliminabile;
- le **quattro guardie** di `GH-58` rifiutano ancora, con i loro dettagli distinti;
- il **cliente** legge, richiede e modifica la propria richiesta come prima: le sue tre policy sono intatte;
- **suite RLS completa** rieseguita;
- nel registro, la **SQL di ripristino** di `appointments_staff_all`.

**Sull'accostamento:**

- **sopra 640px**: dettaglio appuntamento accostato, **la settimana resta interamente visibile**; misura larghezze e sovrapposizione a `0`;
- **«Registra lavorazione» dall'intestazione resta centrato**, e con lui gli altri: elencali;
- **altezza del pannello del dettaglio a 1280 e a 1024**, dichiarata;
- **sotto 640px** identico a prima; il **piede non sparisce**;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R — perché altrimenti si giudica la consegna precedente:

1. **apri il dettaglio di un appuntamento**: si vede la settimana intorno, abbastanza da decidere dove spostarlo?
2. **il dettaglio a schermo piccolo**: i due gruppi di pulsanti reggono, o il pannello diventa una colonna infinita?
3. **elimina un pet che ha appuntamenti** e guarda il calendario: sono spariti anche loro?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-59-la-porta-di-servizio-e-la-griglia-che-resta-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
