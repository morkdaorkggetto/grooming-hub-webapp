# Incarico GH-57 — Il banco non deve inventare

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Superficie:** `/calendar` e il modulo «Nuovo appuntamento». File attesi: `pages/Calendar.jsx`, `components/CalendarKit.jsx`, `pages/Calendar.css`, `shared/ui/Modal.jsx` (+ suo CSS), `apps/staff/lib/database.js`, una migrazione nuova.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy. **La produzione non si tocca.**

---

## 1 — Il contrasto: arretra il contenitore, non le lettere

`GH-56` ha portato il fatto alla velatura chiara con **testo secondario** `#7f6f73`. Misurato: sopra la velatura su `--color-surface-main` fa **4,19:1**, sopra `--color-bg-main` fa **3,89:1**. Per testo di quel corpo ne servono **4,5**.

**Istruzione sbagliata mia, non esecuzione sbagliata tua** — la terza di fila.

**Correzione**: il testo del fatto torna al **primario**. L'arretramento resta, ma lo fa **il contenitore**: campitura leggera, nessuna barra d'accento, nessun bordo pieno.

> **Invariante, oltre questo giro: l'arretramento appartiene al contenitore, non alle lettere.** Smorzare il testo non fa arretrare l'informazione — la rende solo più difficile da leggere per tutti, e per primo per chi lavora in negozio sotto luce non sua.

**Riporta i due rapporti misurati**, prima e dopo.

## 2 — Il modulo si accosta invece di coprire

Premendo «Prenota qui» il modulo si apre al centro e **copre la griglia**, cioè la cosa che serve per scegliere l'ora. Il modulo nasconde la risposta alla domanda che sta facendo.

**Sopra i 640px il modulo si accosta a un lato**: la griglia si stringe e resta **interamente visibile**, il modulo sta appoggiato al bordo. **Sotto i 640px nulla cambia**: resta il foglio a tutto schermo che è già.

**È una variante di `Modal`, non una sostituzione.** `Modal` è condiviso da tutta l'app staff: aggiungi una variante e usala **solo** nel flusso di prenotazione del calendario. Tutti gli altri modali restano identici — dichiaralo misurando che non sono cambiati.

**Il velo dietro si schiarisce**; **il pannello resta opaco.** Testo su fondo semitrasparente ha un contrasto che dipende da ciò che scorre dietro: smette di essere una proprietà del componente e diventa un caso. Dopo la voce 1, non introduciamo una superficie il cui contrasto non si può calcolare.

## 3 — Un pet nuovo si crea dove ci si accorge che non c'è

Oggi il campo «Pet» è un menù semplice con **292 voci**, senza ricerca. Al banco, con una persona davanti, **creare è più veloce che trovare**. Ecco cosa ha prodotto, misurato in produzione:

| | |
|---|---:|
| pet in elenco | **292** |
| che condividono il nome con un altro | **110** (38%) |
| chiamati **«barboncino»** | **12** |
| «maltese» 5 · «chihuahua» 4 · «kira»/«kyra» | 3+3 |
| pet il cui nome è un numero | 6 |

**Il campo diventa cercabile**, e la creazione vive **in coda a una ricerca vuota**, non in testa all'elenco: in testa competerebbe col cercare e vincerebbe sempre.

> scrivi `Ari` → *Ari · Rosaria*, *Ariel · Emy*, *Ariel · Signora capodichino*, *ARIEL · Signora mai contenta* → e sotto: **«Nessun altro pet per "Ari" — creane uno nuovo»**

**Il campo è il comando più usato della giornata**: deve funzionare da tastiera — frecce, invio, esc — e annunciare i risultati. Non un menù che si apre solo col mouse.

### La creazione deve essere un atto solo

Oggi `addPetToCustomer` fa **inserimenti diretti dal browser** e, quando un passo successivo fallisce, **rimedia a mano**: cancella il pet appena creato, rimette lo stato del cliente com'era. Non è una transazione — è una pulizia scritta a mano, che funziona finché non si interrompe a metà. Al banco, con un cane al guinzaglio, è lo scenario in cui si interrompe.

**Migrazione**: una funzione `SECURITY DEFINER` che **crea cliente e pet in un atto solo** e restituisce il pet. Come le altre della catena: `search_path` fissato, accesso staff verificato, tenant verificato, `REVOKE` da `PUBLIC` e `anon`.

### Il telefono è la chiave, e oggi perde

Esiste `customers_tenant_phone_unique` — **UNIQUE (tenant_id, phone) WHERE phone IS NOT NULL**. Due difetti misurati:

**L'unicità è sul testo, non sulle cifre.** Lo stesso numero scritto in due modi passa.

**E il campo contiene cose che numeri non sono.** Su 271 clienti:

| cifre | quanti | cosa sono |
|---:|---:|---|
| 12 | 250 | `+39` + dieci cifre, corretti |
| 22 e 20 | 6 | **due numeri in un campo solo** |
| 11 e 13 | 8 | una cifra in più o in meno |
| 2 e 3 | 7 | **non sono numeri**: `+39alfredo`, `+39Alfredo`, `+39ClienteAlfredo`, `+39ragazzoclienteAlfredo` |

**Circa 21 clienti su 271 — l'8% — non hanno un telefono utilizzabile.**

**Quindi, nella funzione:**

- il confronto avviene **sulle sole cifre**, non sul testo;
- se un cliente di questo salone ha già quelle cifre, **non si crea niente**: la funzione torna indietro con **nome e cognome di quel cliente**, e l'interfaccia chiede — **«Questo numero è di Rosaria. È un altro suo pet?»**. Se sì, si aggiunge il pet al cliente esistente con la strada che esiste già;
- se le cifre sono **meno di otto**, il confronto **non si fa** e non si blocca niente: quei 21 clienti non devono impedire di lavorare;
- **la funzione non modifica nessun cliente esistente.** Non normalizza, non riscrive, non ripulisce niente. La pulizia degli storpi è un altro giro.

### E il telefono non si inventa

Il telefono si chiede. Ma **non può essere obbligatorio e basta**: lo abbiamo già imparato il 31 agosto, quando un costo obbligatorio ha prodotto tre visite da 1,00 € con dentro «non è venuto».

> **Un campo obbligatorio che non si può soddisfare onestamente produce dati falsi.**

Quindi: o si scrive il numero, **oppure** si dichiara esplicitamente che non è stato dato, e resta vuoto. **Un'assenza dichiarata, non una casella vuota e non un numero inventato.** Nessuna terza via, e nessun `0000000000`.

---

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro. **Nessuna scrittura in produzione, nessuna lettura della produzione.**

**Una migrazione sola in questo giro.** L'eliminazione di un appuntamento arriva in `GH-58` e ha la sua.

**La funzione non tocca dati esistenti.** Crea, oppure si ferma e riferisce. Non ripara.

**Nessuna scorciatoia che salti le guardie esistenti**: capienza di `GH-37`, avviso di `GH-41`, blacklist. Un pet appena creato passa dagli stessi controlli di uno vecchio.

**Nessun colore nuovo. Nessuna rotta nuova.** Restano intatti gli invarianti di `GH-54`, `GH-55` e `GH-56`: la grana è la mezza giornata, le lavorazioni senza ora non entrano in una fascia, il margine non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px **o il piede sparisce in silenzio**, e il lessico ammesso è **solo** `lavorati sul momento`, `chi arriva`, `senza ora fissata`.

## Controprove

Dichiara nel registro, misurate **sul demo** con fixture usa-e-getta, rimosse a fine sessione:

- **contrasto** del testo del fatto: valore prima e dopo, sopra entrambi i fondi; **≥ 4,5:1**;
- **sopra 640px** il modulo di prenotazione è accostato e **la griglia resta interamente visibile**; **sotto 640px** è identico a prima; **gli altri modali dell'app staff non sono cambiati** — dillo elencandoli;
- il **velo** è più chiaro e il **pannello è opaco**: riporta i due valori;
- il campo pet **si cerca**, e funziona **da sola tastiera**: frecce, invio, esc;
- ricerca **con risultati** → la creazione è **in coda**, non in testa; ricerca **vuota** → la creazione è **l'unica cosa offerta**;
- **creazione riuscita**: cliente e pet nascono **insieme**, e il nuovo pet è **subito selezionabile** nello stesso modulo, senza riaprirlo;
- **creazione interrotta a metà** (simula il fallimento del secondo passo): **nessun cliente orfano e nessun pet orfano** restano nel demo. È la prova che giustifica la migrazione: falla e riportala;
- **telefono già presente**, scritto in un formato diverso da quello in archivio: la funzione **non crea**, e restituisce il nome del cliente esistente;
- **telefono con meno di otto cifre**: il confronto non si fa, la creazione riesce, niente si blocca;
- **telefono non dato**: si può salvare solo dichiarandolo; il campo resta vuoto e **nessun numero finto viene scritto**;
- **la funzione non ha modificato nessun cliente preesistente**: confrontalo prima e dopo;
- un appuntamento su un pet **appena creato** incontra le guardie di `GH-37` e `GH-41` come uno vecchio;
- **suite RLS rieseguita** — è vecchia di due giri e questo mandato porta una funzione: la misura ereditata di `GH-54` (60 PASS) **non vale più**;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

Sul computer:

1. **prenota da una fascia**: si vede ancora la settimana mentre scegli l'ora?
2. **cerca «ari»**: i quattro Ariel si distinguono fra loro, o servirebbe altro accanto al nome?
3. **crea un pet nuovo con un numero che esiste già**: la domanda su Rosaria arriva al momento giusto, o arriva troppo tardi?

Poi sul telefono: il modulo è rimasto quello di prima?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-57-il-banco-non-deve-inventare-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
