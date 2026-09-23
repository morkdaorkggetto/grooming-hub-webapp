# Incarico GH-97 — Ritirare, e basta

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 19 settembre 2026
**Forma breve (regola 4).** Superficie sola: `apps/customer/components/PendingRequest.jsx`. **Nessuna migrazione, nessuna colonna, nessuna rotta, nessuna logica di dati.**
**Trovato da Luigi provando l'app come cliente**, il giorno del rilascio di `GH-96`.

**Perimetro**: nessun database, nemmeno il demo. Nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

`GH-96` ha dato al proprietario il ritiro della richiesta in attesa. Ma **non esiste «ritira e basta»**: dopo il ritiro l'app porta via di peso.

```js
// PendingRequest.jsx:121
navigate(`/u/book?petId=${request.pet_id}`, { replace: true });
```

E la conferma dà per scontato il seguito:

> *«Vuoi ritirare questa richiesta? **Potrai sceglierne subito una nuova.**»*

**È un errore di mandato, non di esecuzione.** `GH-96` chiedeva testualmente *«portacelo: chi ritira una data sbagliata vuole rifarla giusta, non tornare alla Home»* — scritto guardando **un caso solo**, la correzione di una data sbagliata, che era la domanda di Davide. Chi ritira perché ha cambiato idea, o perché non gli serve più, non era stato considerato.

Due conseguenze, e la seconda è la peggiore:

- **l'app decide al posto della persona** cosa fare dopo;
- **`replace: true` toglie la Home dalla cronologia**: chi tocca «indietro» non torna da dove veniva. L'unica uscita è la barra di navigazione.

> Contraddice il principio deciso il 18/9 e scritto in `GH-96`: **chi avvisa va agevolato, non incanalato.** Un ritiro che costringe a riprenotare insegna a non ritirare.

## Cosa fare

**Dopo il ritiro si resta dove si era**, e la persona sceglie.

- **la richiesta ritirata sparisce** dalle richieste aperte, come già succede;
- **compare una conferma** che dice cosa è successo — è la regola di `GH-87`: una cosa che sparisce senza spiegazione è un difetto;
- **accanto alla conferma, un comando per scegliere un'altra data.** Un'offerta, non un passaggio obbligato. Porta dove portava prima, con lo stesso pet già scelto;
- **nessuna navigazione automatica, e nessun `replace`.**

**La frase della conferma non presume più il seguito.** «Potrai sceglierne subito una nuova» era vera e insieme una spinta: ora la scelta è nel comando, non nella domanda. **Il testo lo scrivi tu e lo dichiari.**

**Tutto il resto di `GH-96` non si tocca**: la funzione chiamata, la conferma prima del ritiro, i messaggi d'errore, la frase dopo la conferma del salone, il lato staff.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Nessuna chiamata nuova al database**: si ritira come prima, con la stessa funzione e gli stessi controlli.

**Il lato staff non cambia**: nessun diff sotto `src/apps/staff`. I ritiri restano visibili 5 giorni e fuori dai conteggi.

**Il pallino e il suono non cambiano.**

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-96`, compresa l'eccezione dichiarata da `GH-87` sul link `Grooming Hub`.

**La lingua è quella di `GH-83`**: è il salone che parla al proprietario, e **nessun testo spinge né minaccia**. Se ti viene da scrivere «devi» o «altrimenti», riscrivila.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **i testi nuovi, per esteso**: la domanda di conferma, la conferma dopo il ritiro, il comando per riprenotare;
- **dopo il ritiro si resta sulla stessa pagina**: misura l'URL prima e dopo. **Devono coincidere**;
- **la cronologia non è stata toccata**: dopo il ritiro, «indietro» porta dove portava prima. Misuralo;
- **il comando porta a `/u/book` con il pet già scelto**, solo se lo si tocca. Riporta la destinazione;
- **la richiesta ritirata non compare più** fra quelle aperte, e **la conferma dice cosa è successo**;
- **una sola chiamata alla funzione**, come in `GH-96`: annullando la conferma, **zero**;
- **il rifiuto di una richiesta già gestita** mostra ancora il testo non tecnico di `GH-96`;
- **`src/apps/staff` non ha diff**: dimostralo;
- **le altre superfici customer**: impronte, come in `GH-96`;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px — **misurando l'area toccabile, non il contenuto**, come hai fatto in `GH-96`;
- build verde. **Suite RLS: da non rieseguire**, nessun dato né permesso toccato. Ultima misura viva: `GH-96`, **60 PASS del 19/9**.

## Passo finale — lo guarda Luigi (regola 5)

Dal telefono:

1. **ritira una richiesta e non fare altro**: dove ti trovi? Ti sembra finita?
2. **ritirane un'altra e riprenota**: il comando c'è dove te lo aspetti?
3. **e la domanda che conta**: se avessi cambiato idea sul serio, l'app ti lascerebbe in pace?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-97-ritirare-e-basta-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
