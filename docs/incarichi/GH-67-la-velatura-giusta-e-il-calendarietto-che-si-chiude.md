# Incarico GH-67 — La velatura giusta, e il calendarietto che si chiude

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

## 2 — Il calendarietto resta aperto su Safari

`GH-66` ha **riprodotto e diagnosticato** il difetto su Safari 26.5 reale, e **non l'ha corretto**: il secondo clic lascia il mini calendario visibile, e nella sequenza osservata resta anche dopo Esc e dopo un clic esterno.

**Causa misurata**: il contratto di chiusura basato su `blur()` e sul campionamento dello stato nativo **non è affidabile su Safari**.

**La raccomandazione è già scritta nel registro di `GH-66` §Safari, e vale come istruzione:** chiusura esplicita centralizzata, con rimozione temporanea del campo dal rendering, ripristino del valore e del fuoco sul comando, verificando l'ordine `pointerdown` / `focusout` / `click` **nei due browser**.

> **Due cose che il registro precedente ha dichiarato e che vanno rispettate**: **non basta sostituire un `blur()`**, e **non basta un ritardo arbitrario**. E la tecnica del `display:none` è stata verificata **solo in isolamento**: se nell'applicazione vera non regge, **fermati e dichiaralo** invece di adattarla finché passa.

**Il ripiego resta**: se `showPicker()` manca o fallisce, avviso più campo data visibile e modificabile. **Non si tocca.**

## 3 — Il pulsante resta acceso dopo il clic

Misurato leggendo il foglio di stile:

```css
.gh-calendar-date-jump:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**`:focus-within` reagisce anche al mouse.** Dopo un clic il fuoco resta dentro il riquadro — e `openDatePicker` ce lo mette pure esplicitamente nel ramo di ripiego — quindi **il contorno verde resta acceso** e il comando sembra premuto.

**Il contorno non si toglie**: è l'indicatore di fuoco per chi naviga da tastiera, e rimuoverlo sarebbe un peggioramento vero.

**Deve comparire per la tastiera e non dopo un clic del mouse.** La strada è `:focus-visible` sui comandi interni, o `:has(:focus-visible)` sul contenitore — **verifica il supporto sul Safari del banco prima di sceglierla**, e dichiara quale hai usato.

## Invarianti

**Nessuna migrazione, nessuna query, nessun dato toccato.**

**Non si toccano**: la normalizzazione del telefono e l'oggetto passato al confronto (`GH-65`), il segnaposto `pet, proprietario, cell` (`GH-66`), il ripiego del selettore con avviso e campo visibile.

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
- **Safari 26.5 reale**: tre cicli sullo stesso pulsante, clic esterno, Esc, selezione effettiva di una data, apertura successiva, uso da tastiera, cambio vista, smontaggio senza popup residuo. **Ripeti tutto su Chromium.** Se una sola sequenza non chiude, **è un FAIL dichiarato, non un dettaglio;**
- **il pulsante non resta acceso dopo un clic del mouse**, e **resta visibile navigando da tastiera**: due prove distinte, in entrambi i browser;
- **non regressioni**: ricerca per nome, proprietario e telefono parziale in formato diverso (`7890`, `333456`);
- build verde. **Suite RLS: da non rieseguire.** Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R, **su Safari**:

1. **cerca un cane in una settimana piena**: si trova a colpo d'occhio, senza sapere già dov'è?
2. **guardala accanto alle vicine**: è una scheda marcata, o è diventata una scheda di un altro tipo?
3. **apri e chiudi il calendarietto tre volte**, poi cambia settimana: resta qualcosa a schermo?
4. **dopo aver cliccato l'icona**: il pulsante è tornato spento?

La prima è la decisione: **se devi sapere dov'è per vederla, la velatura è ancora troppo bassa.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-67-la-velatura-giusta-e-il-calendarietto-che-si-chiude-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
