# Incarico GH-77 — Ogni fotografia ha i suoi occhi

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Chiude una decisione rimasta aperta da `CD-05`.** Superficie: app clienti, card pubblica. File attesi: `apps/customer/pages/Pet.jsx` e il suo CSS, una migrazione. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **La produzione non si tocca.** Fixture in memoria dove basta.

## Da dove nasce

**L'11 settembre è entrata la prima cliente vera del progetto.** Paola ha riscattato l'invito, ha aperto l'area, **e ha inviato la prima richiesta di prenotazione della storia** — Elliot, Shi-tzu, 17 settembre.

Guardandola usare l'app, Davide ha segnalato quattro cose. Due sono giri separati — le notifiche, e la spiegazione di cosa il cliente può modificare. Le altre due stanno qui, **e una ha aperto una questione più grande.**

### La decisione che mancava

`CD-05` aveva dichiarato la domanda invece di risolverla, come le era stato chiesto:

> **«Il proprietario vede la foto di riconoscimento?** È il suo cane, quindi nulla di riservato — ma è una foto fatta per uno scopo tecnico, spesso poco lusinghiera. Mostrarla, nasconderla o mostrarla altrove sono tre risposte legittime.»

**Nessuno l'ha mai chiusa.** L'implementazione ha scelto «mostrarla» per omissione, e da lì è disceso anche il ripiego della card pubblica introdotto da `GH-51`.

**Decisione di Luigi, su richiesta e con l'approvazione di Davide, 12 settembre:**

| fotografia | chi la mette | **chi la vede** |
|---|---|---|
| **ritratto** — affetto, vezzo, un motivo che col salone non c'entra | il proprietario | **proprietario · salone · card pubblica** |
| **riconoscimento** — il dettaglio storto, la macchia, l'orecchio piegato | il salone | **solo il salone** |
| **album** — il cane dopo il bagno | il salone, una per lavorazione | il proprietario · **mai** la card pubblica |

> **La foto di riconoscimento è uno strumento di lavoro, non un ritratto.** Non è riservata perché imbarazzante: è che non è stata fatta per essere guardata da chi al cane vuole bene.

**E il salone può vedere il ritratto**: l'asimmetria è voluta e va in una direzione sola.

## 1 — La foto di riconoscimento esce dalla vista del proprietario

**Nell'area clienti non compare più**, in nessuna forma: né sotto il ritratto, né come ripiego quando il ritratto manca.

> **Attenzione a non confondere due cose diverse.** Questo riguarda **solo** la foto di riconoscimento, `pets.photo_url`. **L'album — `visits.photo_url`, la foto di fine lavorazione — non è toccato da questo mandato**: resta nella sua galleria a parte, visibile al proprietario, esattamente com'è. L'unica cosa da verificare è che **la foto di riconoscimento non finisca dentro quella galleria**.

**Spariscono con lei:**

- la frase *«Questa è la foto che facciamo noi, per riconoscerlo. Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto.»* — **nomina una foto che il proprietario non vedrà più**;
- il comando **«Scambia le due foto»**: con la nuova regola **non ha più oggetto**, perché le due immagini non convivono davanti al proprietario;
- la condizione che lega l'invito alla foto del salone (vedi §2).

**Il dato non si cancella e non si sposta.** `pets.photo_url` resta dov'è e continua a servire il salone: **questo mandato cambia chi la guarda, non dove sta.**

## 2 — L'invito al ritratto diventa incondizionato

Oggi l'invito compare **solo dopo** che il salone ha messo la sua foto — la regola *«chiedere solo dopo aver dato»* di `CD-04`.

**Quella condizione non ha più senso**: il proprietario non vede più ciò che gliel'avrebbe data. E misurato, senza questo cambio resterebbe muta per quasi tutti: **42 pet su 347 hanno la foto del salone**, quindi **305 proprietari non vedrebbero mai nessun invito.**

Paola è una di loro: **Elliot non ha nessuna foto, e per questo lei non ha trovato nessun pulsante.**

**Il proprietario può mettere il suo ritratto sempre.**

- **senza ritratto**: compare l'invito. **Il testo va riscritto** — non può più nominare la foto del salone. Scrivilo nella lingua delle altre frasi dell'app clienti e **riportalo nel registro**;
- **con il ritratto**: resta il comando per cambiarlo;
- **e si può togliere**, tornando al medaglione disegnato. Oggi non si può: una foto messa per sbaglio resta per sempre.

**Nessun permesso nuovo**: la lista dei campi scrivibili dal cliente resta di tre — `owner_notes`, `coat_preferences`, `owner_photo_url` — imposta dal database. **Verificalo e dichiaralo.**

## 3 — La card pubblica smette di ripiegare sulla foto del salone

**Migrazione su `get_public_pet_card`.** Oggi:

```sql
COALESCE(p.owner_photo_url, p.photo_url) AS photo_url
```

Introdotto da `GH-51` quando la domanda di `CD-05` era ancora aperta.

**Conseguenza misurata il 12/9**: i ritratti sono **0** e le foto del salone **42**. Quindi **42 card pubbliche mostrano oggi la foto di riconoscimento a chiunque inquadri il QR** — compreso lo sconosciuto che trova il cane per strada, che è **il caso per cui la card esiste**.

**Dopo**: `photo_url` porta **soltanto** il ritratto. Se manca, la card mostra **il medaglione disegnato** di `CD-04`, che è già previsto e già funzionante.

**Nient'altro cambia nella funzione**: stesse 18 chiavi, stessa firma, stesso `SECURITY DEFINER`, stesso `search_path`, stessi privilegi. **Dichiara il confronto prima/dopo delle chiavi.**

> **Attenzione, verificato il 10/9**: questa funzione serve **347 card**. In `GH-73` è stata sostituita e provata eseguendola **su tutti i token**, non su un campione. **Si fa così anche qui.**

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro. **Nessuna scrittura in produzione, nessuna lettura della produzione.**

**Nessuna foto viene cancellata, spostata o riassegnata.** Le 42 restano dove sono: cambia chi le guarda.

**Nessun permesso nuovo, nessuna colonna, nessuna policy.**

**Il lato staff non si tocca**: al banco la foto di riconoscimento resta protagonista, come dice `CD-05`. E il salone continua a vedere **anche** il ritratto.

**L'album resta com'è**: visibile al proprietario, **mai** sulla card pubblica — decisione già presa in `CD-05`.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-76`, e in particolare: **l'informazione compare dove ha un lavoro da fare** — un campo vuoto non mostra un segnaposto.

## Controprove

Dichiara nel registro. **Numeri e testi esatti, più una prova a schermo.**

**Sulla vista del proprietario:**

- **il caso di Elliot riprodotto** — nessuna foto, nessuna specie: la riga sotto il nome **non nomina la specie** e **l'invito al ritratto c'è**. Riporta i due testi esatti;
- **pet con la sola foto del salone**: il proprietario **non la vede in nessun punto della pagina** — dimostralo sul DOM, non a schermo;
- **pet con solo il ritratto** e **pet con entrambe**: il proprietario vede **sempre e solo il ritratto**;
- **«Scambia le due foto» non esiste più**: ricerca nel codice, 0 corrispondenze;
- **il proprietario carica un ritratto**: `owner_photo_url` valorizzato **e `photo_url` invariato**, verificato sul valore della colonna;
- **il proprietario toglie il ritratto**: torna il medaglione, **e `photo_url` è ancora lì**;
- **la lista dei campi scrivibili dal cliente è ancora di tre**: impronta della funzione prima e dopo.

**Sulla card pubblica:**

- **card con solo la foto del salone**: mostra **il medaglione**, non la foto — è il caso delle 42;
- **card con il ritratto**: mostra il ritratto;
- **le 18 chiavi sono identiche** prima e dopo, e **la funzione gira su tutti i token del demo senza tornare nulla**;
- **l'album non compare** sulla card pubblica, in nessuno dei casi.

**Sull'album, che non deve cambiare:**

- **la galleria del proprietario è identica a prima di questo giro**: confronto misurato contro il commit base, con e senza foto di lavorazione;
- **la foto di riconoscimento non compare nella galleria**, in nessuno dei quattro casi di foto.

**Sul resto:**

- **la specie**: se manca sparisce; se c'è si mostra ancora — prova di non-regressione;
- **a 1365 e 375px** — il telefono è il caso normale per il cliente: nessuno sbordamento, **nessun bersaglio sotto i 44px**;
- **una prova a schermo con screenshot allegato** della scheda di Elliot come la vede Paola. **Se il banco non riesce a renderla, fermati e dichiaralo;**
- build verde. **Suite RLS rieseguita**: questo mandato tocca una funzione. Sonda permanente dal `GH-74`.

## Passo finale — lo guarda Luigi (regola 5)

**Sul telefono**, che per il cliente è il caso normale:

1. **apri la scheda di Elliot come la vede Paola**: si capisce che può mettere una foto, e non c'è traccia di foto del salone?
2. **mettine una e poi toglila**: si torna indietro senza chiedere aiuto?
3. **inquadra il QR di un cane fotografato dal salone** — uno dei 42: **compare il medaglione e non la foto di lavoro?**

**E poi falla provare a Paola**, che è la sola persona ad aver usato quest'app senza averla costruita.

La terza è quella che conta di più: **è l'unica visibile a qualcuno che non conosciamo.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-77-quello-che-paola-non-poteva-fare-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
