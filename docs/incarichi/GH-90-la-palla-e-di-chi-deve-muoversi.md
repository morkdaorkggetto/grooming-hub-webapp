# Incarico GH-90 — La palla è di chi deve muoversi

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 13 settembre 2026
**Superficie**: `apps/staff/lib/database.js`, `apps/staff/components/StaffRequestAlerts.jsx`, `apps/staff/pages/Dashboard.jsx`, `apps/staff/pages/CustomerRequests.jsx`.
**Trovato da Luigi usando GH-89 sulla produzione**, un'ora dopo il rilascio.

**Perimetro**: nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta. Database ammesso **solo il demo**; nessun push, merge o deploy.

## Da dove nasce

Luigi ha proposto tre orari a una richiesta di Rumba e ha guardato la dashboard. Misurato a schermo:

- riquadro terracotta: **«1 richiesta cliente da confermare»**, con la riga **«Rumba · 15/09 · data desiderata»**;
- pallino nell'intestazione: **1**;
- scheda *Richieste clienti*: **«1 da gestire»**.

Ma il salone **aveva già risposto.** La palla è della persona.

Dentro `/requests` la scheda lo dice — `In attesa della scelta` — perché `GH-87` e `GH-89` l'hanno messo lì. **Fuori, nessuno lo sa.** `getPendingAppointmentRequests` filtra su `status = 'pending'` e basta, e quel filtro alimenta **tutti e tre** i punti sopra.

> `GH-87` aveva misurato esattamente questo — *«lista staff pending 1 prima / 1 dopo la proposta»* — e Cowork l'aveva rinviato in coda. **Era una valutazione sbagliata**: un avviso che chiama il salone per una cosa che non gli compete, ripetuto due volte, insegna a ignorare l'avviso.

E rende visibile il difetto gemello: **manca lo stato opposto.** Quando la persona **ha scelto**, quella richiesta è la più urgente che il salone abbia — manca solo la prenotazione — e oggi è indistinguibile da una richiesta appena arrivata.

## I tre stati

Una richiesta `pending` non è una cosa sola:

| stato | come si riconosce | chi deve muoversi |
|---|---|---|
| **da rispondere** | nessuna alternativa proposta | il salone |
| **in attesa della persona** | alternative proposte, nessuna risposta corrente | **la persona** |
| **da prenotare** | la persona ha scelto uno slot | il salone, **subito** |

`declined` — la persona ha rifiutato tutte — **torna al salone**: rientra in *da rispondere*.

**La logica per distinguerli esiste già**: `currentAlternativeResponse` in `apps/customer/lib/appointmentResponses.js`, che `CustomerRequests.jsx` usa. Tiene già conto del caso in cui il salone ha riproposto dopo una risposta. **Riusala. Non scriverne una seconda.**

## Cosa fare

### Un solo posto che classifica

`getPendingAppointmentRequests` oggi **non legge** `chosen_date`, `chosen_time`, `chosen_time_preference`, `customer_response`, `customer_responded_at`: `GH-87` le aveva lette a parte, nella sola pagina delle richieste. Ora servono anche al pallino e alla dashboard.

**Portale nella lettura condivisa e classifica una volta sola.** È la regola di `GH-81`: **non deve nascere un secondo criterio di conteggio**. Se ti trovi a contare in due posti, ti sei perso.

Le richieste **legacy** non hanno alternative: sono sempre *da rispondere*. Dichiaralo.

### Cosa conta e cosa no

**Il pallino e il suono contano solo ciò che tocca al salone** — *da rispondere* più *da prenotare*. **Le richieste in attesa della persona non suonano e non si contano**: il salone ha già fatto la sua parte.

**Il riquadro della dashboard** dice le due cose separatamente, e **non chiama «da confermare» ciò che è in attesa della persona.** Le parole le scegli tu e le dichiari — devono dire **chi deve muoversi**, non quante righe ci sono.

**La scheda *Richieste clienti*** negli accessi rapidi: stessa misura del pallino, non un terzo numero.

**Se non c'è niente per il salone, il riquadro non compare** — anche se ci sono richieste in attesa della persona. Ma quelle **non devono sparire dalla vista**: chi apre `/requests` le trova, e la dashboard non deve far credere che non esistano. Come risolvere questa tensione lo decidi tu e **lo dichiari**.

### La riga del dettaglio

Nel riquadro, oggi si legge **«Rumba · 15/09 · data desiderata»** anche dopo che il salone ha proposto altro. **Deve dire lo stato attuale**: la data che la persona ha scelto se ha scelto, altrimenti che si è in attesa. **Non la data ormai superata.**

### Da prenotare si vede

Una richiesta in cui la persona ha già scelto **si distingue dalle altre**, sia in `/requests` sia nella dashboard. È lo stato in cui basta un tocco e qualcuno sta aspettando.

**Nessun colore nuovo**: usa quelli che ci sono.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Un solo criterio di conteggio**, e una sola funzione che classifica.

**Nessuna modifica al comportamento del suono** oltre a cosa lo fa scattare: intervallo, memoria della scelta, silenzio al primo caricamento e confronto per identificativo restano quelli di `GH-81`.

**`/requests` continua a mostrare tutte le richieste `pending`**, dei tre stati. Non si nasconde niente.

**Il lato cliente non cambia**: nessun diff sotto `src/apps/customer`, **salvo** l'eventuale riuso di `appointmentResponses.js`, che **non si modifica** — se lo tocchi, fermati e dichiaralo.

**Il calendario non cambia.**

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-89`, **compresa l'eccezione dichiarata da `GH-87`**: il link `Grooming Hub` sotto i 44px è preesistente e non si tocca qui.

**La lingua è quella di `GH-83`**: nessuno chiama la persona «cliente».

## Controprove

Dichiara nel registro. **Numeri e testi esatti.**

- **i tre stati, uno per uno**: come vengono riconosciuti, e la prova su fixture di ciascuno;
- **il conteggio del pallino** nei quattro casi — nuova, proposta senza risposta, scelta, rifiutata — riportato come numero. **Proposta senza risposta: non conta**;
- **il suono**: una proposta del salone **non fa suonare niente**. Misuralo;
- **e la prova che conta**: la persona sceglie → **il pallino sale e il suono parte**, perché ora tocca al salone;
- **la dashboard**: i testi esatti nei quattro casi, e il caso **solo attesa della persona**, dove il riquadro non chiama il salone;
- **la riga del dettaglio**: i testi con e senza scelta. **Non contiene una data superata**;
- **la scheda *Richieste clienti***: lo stesso numero del pallino. Riportali affiancati — **il conteggio e ciò che si vede devono coincidere**, regola del canone del 10/9;
- **`/requests` mostra tutte e tre**: conteggio a schermo e conteggio SQL sul demo, affiancati;
- **una richiesta legacy**: classificata *da rispondere*. Misurala;
- **un secondo giro di proposte dopo una risposta**: torna in attesa della persona. È il caso che `currentAlternativeResponse` già gestisce — **dimostra che lo gestisce ancora**;
- **una sola sorgente**: ricerca esaustiva che mostri che nessun punto conta le richieste per conto proprio. Riporta il comando;
- **`appointmentResponses.js` non ha diff**: impronta prima e dopo;
- **`src/apps/customer` non ha diff**: dimostralo;
- **le altre pagine staff**: impronte, come in `GH-87` e `GH-89`;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px;
- build verde. **Suite RLS: da non rieseguire**, questo mandato non tocca permessi né dati. Ultima misura viva: `GH-89`, **60 PASS del 13/9**.

## Passo finale — lo guarda Luigi (regola 5)

Gestionale su un dispositivo, telefono sull'altro:

1. **proponi tre orari** e guarda la dashboard: ti sta ancora chiedendo di fare qualcosa?
2. **accetta dal telefono**: adesso ti chiama? E si capisce che manca solo la prenotazione?
3. **e la domanda che conta**: guardando la dashboard di prima mattina, **capisci in due secondi cosa tocca a te?**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-90-la-palla-e-di-chi-deve-muoversi-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
