# Incarico GH-46 — Le parole dell'invito, e tre promesse da mantenere o togliere

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 30 agosto 2026
**Da chiudere prima del primo invito a un cliente reale.**

> **Forma breve** (regola 4 del canone): nessuna migrazione, nessun dato in gioco. Si cambiano delle parole e l'ordine in cui compaiono.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto

Tre frasi in due schermate dicono cose che non sono vere. Nessuna è un difetto di funzionamento: sono **promesse implicite**, la stessa famiglia del «Registrati» che invitava a controllare una mail che non parte.

| Dove | Cosa dice | Cosa è vero, misurato |
|---|---|---|
| generazione invito | **«Email cliente opzionale»** | il campo viene salvato e **non riletto mai**: non limita chi riscatta, non precompila nulla, non viene confrontato con l'email che il cliente sceglie |
| generazione invito | «Il cliente vedrà solo card, fidelity, prossimo appuntamento e contatto WhatsApp» | vedrà **tutti i propri cani** — non solo quello da cui parte l'invito — e **lo storico completo delle visite** |
| richieste clienti | «Quando gli ordini boutique avranno tabelle dedicate, finiranno qui» | la boutique esiste **solo in `CustomerPortal.jsx`**, il portale legacy che nessuno può più raggiungere. È un promemoria di sviluppo finito in produzione |

## 1 · Il riquadro dell'invito racconta la cosa sbagliata

**Quello che serve esiste già.** Dopo «Genera invito» il riquadro mostra destinatario, numero, collegamento, scadenza, e due pulsanti: **«Apri WhatsApp»**, che compone il messaggio verso il numero in rubrica, e «Copia link». Non c'è niente da costruire.

Il difetto è **l'ordine di ciò che si vede**: prima si chiede un'email che non serve, e solo dopo si scopre a chi andrà l'invito e come.

**Invarianti**:

- **Prima di generare, lo staff vede a chi va e per quale via**: nominativo, numero, e il fatto che partirà **via WhatsApp**. È l'informazione che serve a decidere; l'email non lo era.
- **Nessun campo chiede un dato che il sistema non usa.** Il campo email va rimosso, oppure reso vero — e «vero» significa che quell'indirizzo limita chi può riscattare. **Decisione di Luigi: si rimuove.** Il salone ha **zero email su 267 clienti**: sarebbe vuoto quasi sempre e, quando pieno, indurrebbe una convinzione sbagliata.
- **La descrizione dice cosa vedrà davvero il cliente**: tutti i suoi cani e lo storico delle visite. Chi legge quella frase sta decidendo se mandare un collegamento a una persona.
- **La scadenza è visibile prima e dopo.** Da `GH-45` dura **tre giorni**: chi manda un invito senza saperlo lo scopre quando il cliente non riesce più a entrare.
- Il gesto resta di chi lo compie: l'app **compone** il messaggio, **non lo invia**. Preme l'operatore.

## 2 · Il messaggio non può salutare per nome

**Misurato sulla produzione:**

| | |
|---|---:|
| clienti | 267 |
| nominativo che **contiene cifre** | **169 (63%)** |
| nominativo che **è solo un numero di telefono** | **105 (39%)** |
| nominativo pulito | 98 |

Esempi veri: `3333589030`, `Salvatore Russo 3420228050`, `mamma parrucchiera 3406800823`.

Il messaggio attuale è: *«Ciao {nome}, qui trovi l'accesso alla scheda di {cane}: {link}»*. Con questi dati, **a un cliente su tre arriverebbe «Ciao 3333589030»** — e un messaggio con un numero al posto del nome, che contiene un collegamento, somiglia moltissimo a una truffa.

**I cani invece hanno un nome**: 276 su 288 puliti, **96%**, nessuno senza nome. È il quaderno di una toelettatura — le persone si annotano col cellulare, gli animali si chiamano per nome.

**Invarianti**:

- **Il messaggio non saluta con il nominativo del cliente**, perché per la maggioranza è un numero di telefono. Se un giorno i nominativi verranno ripuliti, si potrà tornare a farlo.
- **Il messaggio dice chi scrive**: il nome del salone, preso dal tenant come tutto il resto — mai scritto nel codice. Un collegamento che arriva senza mittente è indistinguibile da una truffa, ed è la ragione principale di questa regola.
- **Il messaggio nomina il cane**, che è la cosa che il cliente riconosce e l'unico dato pulito che abbiamo.
- **Dice cosa si troverà** e **quanto dura il collegamento**, con la durata letta dall'invito, non scritta a mano.
- **Il testo è modificabile in un punto solo**, perché le parole definitive le darà Davide.

**Proposta di partenza** — da sottoporre a Davide, non definitiva:

> Ciao! Siamo **Grooming HUB**. Questa è la pagina di **Nina**: le sue visite, il prossimo appuntamento e le richieste. Il collegamento vale **3 giorni**. {link}

## 3 · La boutique

**Invariante**: nessuna schermata annuncia funzioni che non esistono. La frase va **rimossa** o sostituita con una che descrive quello che quella pagina fa oggi.

**Non rimuovere `CustomerPortal.jsx`** in questo giro: è codice morto ed è già una coda aperta, ma toglierlo è un'altra cosa e merita il suo mandato.

## Controprove

Dichiara nel registro, misurate sul demo:

- il riquadro invito, **prima di generare**, mostra nominativo, numero e via di invio;
- **nessun campo email** resta, e nessun riferimento a `customer_email` sopravvive nel percorso di creazione;
- la descrizione nomina **tutti i cani** e **lo storico**;
- la scadenza compare prima e dopo, e dice **tre giorni**;
- il messaggio WhatsApp generato per un cliente **il cui nominativo è solo un numero** non contiene quel numero come saluto — provato su un caso reale del demo;
- il messaggio contiene **il nome del salone letto dal tenant** e **il nome del cane**;
- il pulsante **compone** il messaggio senza inviarlo;
- nessuna schermata nomina più la boutique;
- build verde; suite RLS invariata.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro: **generare un invito di prova per un cliente il cui nominativo è un numero**, aprire WhatsApp e **leggere il messaggio come lo leggerebbe chi lo riceve**. Se sembra una truffa, non è pronto.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
