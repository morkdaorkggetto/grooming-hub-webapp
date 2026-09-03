# Incarico GH-71 — La rubrica dice solo quello che sa

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna policy, nessun dato scritto.**
**Chiesto dal salone.** Superficie: la pagina **Contatti**. File attesi: `pages/Contacts.jsx`, eventualmente il suo CSS e `apps/staff/lib/database.js` se la razza non è già caricata. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria**, non nel database.

## 1 — Le due pastiglie compaiono solo quando dicono qualcosa

Ogni scheda porta due etichette non cliccabili: **lo stato del rapporto** (`Lead`, `Contattato`, `Cliente`, `Archiviato`) e **l'origine** (`Manuale`, `WhatsApp`, `QR pubblico`).

Misurato in produzione il 2/9: **tutti e 295 i clienti sono `Cliente` + `Manuale`.** Nessuna eccezione.

> **Le stesse due parole su ogni scheda, sempre: informazione zero ripetuta 590 volte.** Non sono sbagliate — descrivono un mondo che non è ancora cominciato: nessun cartoncino stampato, nessun invito mandato, nessun contatto arrivato dal QR o da WhatsApp.

**Correzione: si mostrano solo quando differiscono dalla norma.**

- **stato**: nascosto quando è `Cliente`; mostrato per `Lead`, `Contattato`, `Archiviato`;
- **origine**: nascosta quando è `Manuale`; mostrata per `WhatsApp` e `QR pubblico`.

Così oggi spariscono, e il giorno in cui arriva il primo contatto dal QR **compare «QR pubblico» e significa qualcosa**, perché è l'unico ad averla.

**È la regola di `GH-68` applicata qui**: l'informazione compare dove ha un lavoro da fare. **Nessun colore nuovo, nessun componente nuovo**: le pastiglie esistenti, mostrate meno spesso.

## 2 — La razza entra fra i fatti della scheda

La scheda elenca `Pet`, `Telefono`, `Creato il`. **Si aggiunge `Razza`**, accanto a `Pet`.

**Quale pet, quando ce n'è più d'uno.** Misurato: **273 clienti su 295 hanno un solo pet**, 21 ne hanno due o tre, 1 nessuno. Per quei ventuno la scheda **ha già** un menù «Scegli pet»: **la razza segue quella scelta**, e cambia con lei. **Nessun comando nuovo.**

**Quando la razza manca** — 6 pet su 320 — la riga **non compare affatto**. Nessun «Da associare», nessun trattino, **nessun invito a completare**. Come per la scheda del calendario.

**Il dato non si normalizza e non si abbrevia**: si mostra com'è scritto. `GH-70` ha già sistemato le iniziali in archivio.

**Verifica prima se la razza è già caricata** con il contatto. Se lo è, **non aggiungere letture**. Se non lo è, aggiungila alla selezione esistente — **una selezione più larga, non una query in più** — e dichiaralo.

## 3 — Il sottotitolo dice a cosa serve la pagina

Oggi: *«Direttorio clienti e richieste WhatsApp, QR pubblico e lead da gestire.»*

Due problemi. È **un elenco di sostantivi** che mescola entità e canali; e **«Direttorio» è un calco dall'inglese** *directory*: in italiano quella cosa si chiama **rubrica**, ed è la parola che userebbero Davide e Roby.

Altrove la veste dice **a cosa serve la pagina** — *«La settimana a colpo d'occhio, per collocare chi arriva al banco»*. Nello stesso registro:

> **«Tutti i contatti del salone, e come richiamarli.»**

Dice il vero oggi — sono tutti clienti — e **non promette un flusso che non esiste**: niente lead da gestire, niente Card, dato che nessun cartoncino è mai stato stampato.

**Il titolo «Contatti» resta.**

## 4 — «Salva lead» diventa «Salva contatto»

Il pulsante che salva un contatto nuovo dice **«Salva lead»**. Nessuno è un lead, e la parola **non compare in nessun'altra parte del prodotto**.

**Diventa «Salva contatto».** E l'intestazione del riquadro, *«Inserisci una richiesta in rubrica»*, diventa **«Aggiungi un contatto alla rubrica»**: quello che si inserisce è un contatto, non una richiesta.

> **Il menù «Origine» del modulo resta com'è**: lì la scelta è vera, perché chi inserisce sta dichiarando da dove è arrivata quella persona.

## Invarianti

**Nessuna migrazione, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere `UPDATE`, ti sei perso.

**Nessuna query nuova.** Se la razza manca, si allarga una selezione esistente e si dichiara.

**I filtri e i conteggi in cima alla pagina non cambiano.** Continuano a contare `Lead` e `Contattati` come adesso: **nascondere una pastiglia non nasconde uno stato**.

**Non si toccano**: la ricerca della rubrica, il pulsante WhatsApp, «Apri scheda pet», il menù «Scegli pet», i comandi di stato.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-70`.

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **un contatto `Cliente` + `Manuale`**: **nessuna pastiglia** sulla scheda;
- **un `Lead`**, un **`Contattato`**, un **`Archiviato`**: la pastiglia dello stato compare, con il tono giusto;
- **un contatto con origine `QR pubblico`** e uno **`WhatsApp`**: la pastiglia dell'origine compare;
- **un contatto `Lead` + `QR pubblico`**: **entrambe** compaiono;
- **i conteggi «Da gestire» e «Contattati» e i filtri sono invariati** con e senza pastiglie visibili;
- **razza presente**: la riga compare accanto a `Pet`; **razza assente**: la riga **non compare**, e non c'è nessun segnaposto;
- **contatto con tre pet**: cambiando il menù «Scegli pet», **la razza cambia con lui**;
- **nessuna lettura aggiuntiva**: conta le chiamate all'apertura della pagina, prima e dopo;
- **i testi nuovi**, riportati testualmente: sottotitolo, pulsante, intestazione del riquadro. E **«Direttorio», «Salva lead» e «Inserisci una richiesta» non compaiono più** in `src/`: dimostralo con una ricerca;
- **a 1365, 1024 e 375px**: la scheda regge senza le pastiglie e con la riga in più; nessun bersaglio sotto i 44px, nessuno sbordamento;
- build verde. **Suite RLS: da non rieseguire.** Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **scorri la rubrica**: senza le due pastiglie ripetute, si legge meglio o sembra che manchi qualcosa?
2. **guarda una scheda con la razza**: serve davvero lì, o era utile solo sul calendario?
3. **rileggi il sottotitolo**: dice cosa ci fai in quella pagina?

La prima è quella che conta: **togliere due parole da 295 schede è una sottrazione, e le sottrazioni si giudicano solo guardandole.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-71-la-rubrica-dice-solo-quello-che-sa-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
