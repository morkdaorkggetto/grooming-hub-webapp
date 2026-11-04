# Incarico GH-111 — Il calendario dice perché

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 25 ottobre 2026
**Nasce da:** una schermata dal salone, mandata da Luigi il 25/10: nel calendario, sopra la settimana, l'avviso rosso **«Non riesco a distinguere le lavorazioni negli appuntamenti passati.»**

**Perimetro**: `src/apps/staff/pages/Calendar.jsx` e, per la lettura delle visite, `src/apps/staff/lib/database.js` (`getRevenueReportData` o una lettura nuova dedicata). **Database**, tre categorie distinte:

- **lettura del demo**: ammessa;
- **dati di prova temporanei sul demo**: ammessi, con ripristino a zero verificato;
- **scritture vere e qualunque accesso al prodotto**: no.

Nessuna migrazione, nessuna policy. Nessun push, merge o deploy. Base: `6dd5d84`.

## Da dove nasce

L'avviso viene da `Calendar.jsx:318`. Il calendario, per il riquadro «Appuntamenti rimasti programmati» di `GH-98` (la rete contro i cani fantasma), carica **tutte le visite** con `getRevenueReportData()` senza intervallo (`Calendar.jsx:316`), e le usa per decidere se un appuntamento passato ha già la sua visita (`Calendar.jsx:517-537`). Se quella lettura fallisce, il riquadro sparisce e compare l'avviso.

**Misure di Cowork nel prodotto, 25/10 alle 05:07 UTC:**

- 856 visite, 856 righe in `visit_financials`, nessuna visita senza pet, nessuna senza importo;
- registri del server delle ultime 24 ore: **tutte** le letture di `/rest/v1/visits` con questa forma hanno risposto **200**. Nessun errore lato server visto;
- il browser del salone, dai registri, è **Chrome 116 su macOS**.

**Quindi la causa è nel browser, e oggi non si conosce.** Tre cose però si leggono nel codice:

1. **la causa viene buttata via**: il `.catch` di `Calendar.jsx:318` sostituisce l'errore con una frase fissa, senza registrarlo da nessuna parte;
2. **la lettura si fa una volta sola** per tutta la vita della pagina (`visitIndexRequestRef`, `Calendar.jsx:315`): se fallisce una volta, l'avviso resta finché non si ricarica, anche se la rete è tornata;
3. **la lettura non è paginata**. Con 856 visite oggi, e circa un centinaio in più al mese, **supererà il limite di righe per richiesta del server** (di norma 1000: verificalo sul demo) entro qualche settimana. Da quel momento la lettura **non fallirà**: restituirà le prime 1000 righe e basta, e il riquadro segnerà come «senza visita» appuntamenti che la visita ce l'hanno. **È il difetto più grave dei tre, perché non si vede.** `GH-104` ha già risolto lo stesso problema per gli appuntamenti con una lettura paginata: usa lo stesso schema.

## Cosa fare

### 1. Trovare la causa, prima di correggere

Prova a riprodurre l'avviso, e dichiara cosa hai provato e cosa è successo:

- **Chrome 116**, se riesci a procurartene uno (Playwright permette di scegliere la versione di Chromium): apri il calendario del demo e guarda se l'avviso compare e con quale errore;
- **rete interrotta** durante il primo caricamento;
- **sessione scaduta** o rinnovata a metà caricamento.

Se nessuna riproduce l'avviso, **dillo**: non inventare una causa. La correzione dei punti 2–4 vale comunque.

### 2. La causa resta scritta

Quando la lettura fallisce, l'errore vero va **nella console**, con la sua classe e il suo messaggio, e il testo dell'avviso resta in italiano per chi lo legge. Nessun messaggio grezzo a schermo (regola di `GH-103`).

### 3. Riprova, da sola e a mano

- **un nuovo tentativo automatico** quando la pagina torna visibile o la rete torna disponibile;
- accanto all'avviso, **un pulsante «Riprova»** che rifà la sola lettura delle visite, senza ricaricare la pagina;
- mentre riprova, l'avviso dice che sta riprovando; se riesce, l'avviso sparisce e il riquadro compare.

Usa i componenti che il calendario ha già. Nessuna composizione nuova.

### 4. Tutte le visite, non le prime mille

La lettura delle visite per il riquadro è **paginata**, come in `GH-104`, e **legge solo quello che serve al riquadro** (`pet_id` e `date`), non pet, proprietari e importi. Un errore su una pagina successiva **non** produce un elenco parziale: produce l'avviso.

**Il report incassi** (`WeeklyRevenue`) chiama la stessa funzione con un intervallo di date: **misura** se anche lì il limite di righe può essere raggiunto, e dichiaralo. Correggilo solo se è nella stessa funzione e la correzione è la stessa; altrimenti scrivilo come rilievo.

## Invarianti

- **Il riquadro «Appuntamenti rimasti programmati»** mostra gli stessi appuntamenti di oggi, quando la lettura riesce.
- **La settimana, la prenotazione, il salvataggio**: invariati.
- **Gli incassi** del report: identici al centesimo prima e dopo, su almeno tre settimane del demo.
- **Nessun colore nuovo**, nessuna classe tipografica scritta a mano.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **riproduzione** (punto 1): ogni tentativo, con il suo esito;
- **lettura fallita**: l'errore vero in console; l'avviso in italiano; nessun testo grezzo a schermo;
- **«Riprova»**: dopo un errore simulato, un tocco ripristina il riquadro senza ricaricare la pagina; conta le richieste fatte;
- **ritorno della rete**: il riquadro torna da solo;
- **oltre il limite**: con più righe del limite di una richiesta (dati di prova sul demo, oppure lettura simulata se crearne tante non è ragionevole: dichiara quale), il riquadro riconosce **tutte** le visite; un appuntamento la cui visita sta oltre la prima pagina **non** compare come «da verificare»;
- **errore su una pagina successiva**: avviso, nessun elenco parziale;
- **report incassi**: totali identici prima e dopo; misura del limite;
- **a 375px e a 1365px**: avviso e pulsante senza sbordamenti, pulsante almeno 44px;
- build verde. **Suite RLS: non serve** se non aggiungi letture nuove oltre a `visits(pet_id, date)`, che lo staff già legge; se ne aggiungi, rieseguila.

## Passo finale — lo guarda Luigi, con Davide

Sul Mac del salone, a pagina ricaricata: l'avviso c'è ancora? Se torna, adesso c'è un «Riprova»: funziona?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-111-il-calendario-dice-perche-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
