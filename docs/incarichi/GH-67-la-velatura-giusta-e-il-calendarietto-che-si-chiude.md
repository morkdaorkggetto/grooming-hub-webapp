# Incarico GH-67 — La velatura giusta, e il calendarietto che se ne va

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna query, nessun dato toccato.**
**Superficie:** la scheda trovata e il comando data del calendario. File attesi: `pages/Calendar.css`, `components/CalendarKit.jsx`. **Nessuna rotta nuova.**

**Perimetro**: nessun accesso alla produzione; nessun push, merge o deploy. **Fixture in memoria**, non nel database.

## 1 — La velatura al 5% non si vede

`GH-66` ha velato la marcatura con il primario al **5%**, resa `#f8fafa`. Misurato contro il fondo del pannello: **1,05:1**. Non è tenue — **a occhio non c'è**, e Luigi l'ha confermato guardandola.

La marcatura poggia quindi tutta sul **bordo scuro**, che è un indicatore valido ma è **la stessa leva che aveva fallito in `GH-64`**: lì più verde, qui più scuro, ma sempre il solo bordo.

**La scala è più compressa di quanto sembri** — misurata sul primario `#6f9792` contro il pannello:

| primario | contrasto |
|---:|---:|
| **5%** (oggi) | **1,05:1** — invisibile |
| 25% | 1,29:1 |
| 50% | 1,69:1 |
| **100%** (`GH-65`) | **3,00:1** — respinto: troppo carico |

**La fascia utile è fra 1,3 e 1,8:1**, cioè primario indicativamente fra il 25% e il 50%. **Sotto 1,3 non si vede; a 3,0 è il blocco già respinto.** Trova il valore dentro la fascia e **dichiara quello scelto con la sua misura.**

### Il vincolo che si sveglia alzando la velatura, e come si scioglie

Il testo secondario `#7f6f73` sulla velatura al 5% misura **4,53:1**: **è già al limite** dei 4,5. Qualunque velatura più carica lo porta sotto.

> **Precisazione della regola di `GH-56`, non sua eccezione.** «L'arretramento appartiene al contenitore, non alle lettere» nasceva da un testo **smorzato** fin sotto la soglia. Qui è l'opposto: **scurire il secondario ne aumenta il contrasto.** Smorzare peggiora, scurire migliora — non è lo stesso gesto.

Quindi: **se sulla velatura scelta il secondario scende sotto 4,5:1, può scurirsi**, e la sua nuova misura va dichiarata. Se resta sopra, **non si tocca**.

**Il bordo scuro resta com'è**: funziona, supera i 3:1, e non va né ingrossato né aggiunto di contorni. **Nessun colore nuovo.**

## 2 — Il calendarietto si toglie

Decisione di Luigi del 2/9, presa dopo tre giri di riparazioni: **il comando «vai a data» esce dal calendario.**

**Non è una resa davanti a un difetto: è una misura.** Contati in produzione il 2/9:

| appuntamenti futuri | **57** |
|---|---:|
| il più lontano | **10 giorni** |
| media | 3,6 giorni |
| oltre due settimane | **0** |
| oltre un mese | **0** |

**L'intero orizzonte di prenotazione del salone sta dentro due clic della freccia.** Il selettore serve a saltare lontano, e nessuno va lontano. Sul telefono è già nascosto da `GH-55` e non è mancato a nessuno.

> **La lezione, e vale oltre questo comando.** Tre giri spesi a far funzionare qualcosa che nessuno usa. La misura che l'avrebbe evitato — *quanto lontano prenotano?* — era disponibile dall'inizio: non è stata fatta perché il comando c'era già, e ci si è chiesti **come farlo funzionare** invece di **se servisse**.

**Cosa se ne va con lui**: il popup che resta aperto su Safari, il pulsante che resta acceso, la regola `:focus-within`, l'icona, il campo nascosto, il ripiego con l'avviso, e le proprietà `dateValue` / `onDate` di `CalendarNavigation` — che diventano **codice morto e vanno rimosse, non lasciate inerti**.

**Cosa resta e non si tocca**: le frecce, il ritorno a oggi sull'intervallo (`GH-55`), l'interruttore Settimana/Giorno, il campo di ricerca.

**In modo giorno si arriva a una data** toccando il giorno nella settimana, oppure con le frecce. **Verifica che quella strada esista e funzioni** prima di togliere il comando: se non ci fosse, **fermati e dichiaralo.**

**E la riga guadagna spazio**: misura cosa succede alla barra a 1365, 1024 e 375px adesso che un comando da 44px non c'è più — in particolare **se il campo di ricerca risale di riga** sul telefono. Dichiara il risultato, non ottimizzarlo: è un effetto da osservare, non una nuova composizione.

## Invarianti

**Nessuna migrazione, nessuna query, nessun dato toccato.**

**Non si toccano**: la normalizzazione del telefono e l'oggetto passato al confronto (`GH-65`), il segnaposto `pet, proprietario, cell` (`GH-66`), le frecce, il ritorno a oggi sull'intervallo, l'interruttore.

**Nessun residuo del comando rimosso.** Né CSS orfano, né proprietà inerti, né stringhe: se resta qualcosa, il prossimo che legge crede sia in uso.

**La ricerca continua a marcare e non filtrare**: non nasconde niente, **non smorza le schede non corrispondenti**, i conteggi in alto non cambiano.

**Nessun colore nuovo, nessuno spessore aumentato, nessun contorno aggiunto alla scheda trovata.**

**Restano gli invarianti di `GH-54` → `GH-66`.**

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **la velatura scelta**: percentuale, colore reso, e **contrasto contro il fondo del pannello — dentro 1,3–1,8:1**;
- **il testo secondario sulla velatura**: misura, **≥ 4,5:1**; se è stato scurito, il valore prima e dopo; se non è stato toccato, dimostralo;
- **conteggio dei pixel** trovata contro vicina, con il metodo di `GH-65`, e **dichiarando cosa sta contando** — è la nota di onestà che `GH-66` ha aggiunto e va conservata;
- **bordi e contorni misurati**: nessuno spessore cambiato, nessun contorno nuovo;
- **una settimana con dieci schede e una corrispondenza**: si individua senza scorrere a 1365 e 1024px;
- **le schede non corrispondenti sono identiche** a prima della ricerca;
- **il comando data non esiste più**: nessun pulsante, nessuna icona, nessun campo nascosto, **nessun residuo** in JSX o CSS. Dimostralo con una ricerca su `date-jump`, `showPicker`, `dateValue`, `onDate`, `focus-within`;
- **si arriva ancora a un giorno preciso**: dal modo settimana toccando il giorno, e con le frecce in modo giorno — due prove;
- **la barra dopo la rimozione** a 1365, 1024 e 375px: posizione del campo di ricerca, righe occupate, bersagli sotto i 44px, sbordamento. **Dichiara se il campo è risalito di riga sul telefono**;
- **non regressioni**: ricerca per nome, proprietario e telefono parziale in formato diverso (`7890`, `333456`);
- build verde. **Suite RLS: da non rieseguire.** Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R, **su Safari**:

1. **cerca un cane in una settimana piena**: si trova a colpo d'occhio, senza sapere già dov'è?
2. **guardala accanto alle vicine**: è una scheda marcata, o è diventata una scheda di un altro tipo?
3. **la barra senza il calendarietto**: è più leggibile, o manca qualcosa?
4. **prova ad arrivare a un giorno preciso** senza di lui: quante mosse ci vogliono, e ti sembrano troppe?

La prima è la decisione sulla velatura: **se devi sapere dov'è per vederla, è ancora troppo bassa.**

La quarta è la verifica della decisione di toglierlo: **se ti dà fastidio già al primo tentativo, l'abbiamo tolto a torto** — e la misura sui 10 giorni riguardava le prenotazioni, non tutto quello che si fa guardando un calendario.

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-67-la-velatura-giusta-e-il-calendarietto-che-si-chiude-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
