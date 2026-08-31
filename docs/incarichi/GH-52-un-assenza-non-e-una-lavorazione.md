# Incarico GH-52 — Un'assenza è un evento con una data, non una lavorazione con un prezzo

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 31 agosto 2026
**Origine:** segnalazione del salone, riportata da Luigi il 31/8. **Problema attivo**: si è presentato adesso, da quando il calendario è tornato in uso.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto, con le parole del salone

*«Quando un cane non viene portato a un appuntamento e lo segnano come no-show, la scheda chiede per forza di inserire la somma. Come fanno a segnare che l'utente non è venuto e a fissare la data di questa occorrenza?»*

**Non possono.** Misurato:

- il **modulo visita** ha il costo **obbligatorio** — `Costo (€) *`, con validazione;
- il pulsante **«Segna No-show»** cambia soltanto un punteggio di ±1 sulla scheda del cane: **nessuna data, nessun evento, nessuna memoria**. Dopo averlo premuto, alla domanda «quando è successo?» non risponde nessuno;
- lo stato **`no_show` degli appuntamenti esiste nel database e non è mai stato usato**: `0` occorrenze su tutta la produzione, perché **non esiste un gesto per impostarlo**.

## Cosa hanno fatto, e si vede nei dati

| costo | quante | testo della lavorazione |
|---:|---:|---|
| **1,00 €** | 3 | «non è venuto» · «ha saltato l'appuntamento senza avvisare» · «appuntamento rimandato per ciclo» |
| 0,10 € | 1 | *(nessun testo)* |

**Si sono inventati un euro per superare un campo obbligatorio.** È l'unica strada che l'app lascia aperta, e produce due danni:

**Quattro euro che non esistono entrano negli incassi** e compaiono in «Come è andata».

**Le assenze diventano invisibili**: restano nascoste dentro le visite, in un campo di testo libero che il salone usa anche come diario.

> **Un campo obbligatorio che non si può soddisfare onestamente produce dati falsi.** Non è disciplina che manca: è il modulo che chiede una cosa che in quel caso non esiste.

## Invarianti

**Segnare un'assenza non crea una lavorazione.** Nessuna riga in `visits`, nessun importo, nessun effetto sugli incassi. L'assenza è un **appuntamento** che ha cambiato stato.

**L'assenza ha una data**, ed è quella dell'appuntamento mancato. È la cosa che oggi manca del tutto: senza data non si può dire «tre volte quest'anno», che è l'unica ragione per cui si registrano le assenze.

**Il gesto sta dove il salone guarda la giornata**: sull'appuntamento, nel calendario e nella vista del giorno. Non in una schermata sua, e non dentro il modulo visita.

**Si torna indietro.** Un'assenza segnata per sbaglio si toglie, e togliendola si annulla anche l'effetto sul punteggio. È la lezione dello scollegamento account: **ciò che si può dare si deve poter togliere**, e chi sbaglia a fine giornata è stanco, non distratto.

**Nessun doppio conteggio.** Segnare due volte lo stesso appuntamento non porta il punteggio a −2. Lo stato è dell'appuntamento, non un contatore che si incrementa a ogni clic.

**Il punteggio resta coerente con il meccanismo esistente**: `no_show_score` e la soglia della blacklist non cambiano regola. Cambia solo che adesso il punteggio ha **una causa datata** invece di essere un numero che qualcuno ha mosso.

**Gli appuntamenti assenti non entrano negli incassi** in nessuna vista, né settimanale né mensile.

**Nessuna richiesta di importo, in nessun punto del gesto.**

## Cosa questo mandato NON fa

**Non tocca le quattro visite finte esistenti.** Sono in produzione e vanno ripulite con un gesto deliberato, non da una migration: `0,10 €` e tre da `1,00 €`. **Coda annotata**, da fare prima che qualcuno legga il report di quei mesi.

**Non copre l'assenza senza appuntamento.** Se il cliente aveva solo detto «passo martedì» su WhatsApp, non c'è niente da marcare. Oggi è ancora il caso più frequente — gli appuntamenti sono 14 — ma la direzione è chiara: da sabato il salone prenota. **Se dopo qualche settimana il caso resta comune, sarà un mandato suo.**

**Non rende il punteggio automatico.** Resta una valutazione del salone: il database non sa distinguere «non è venuto» da «non abbiamo chiuso la scheda», e questa distinzione l'abbiamo già presa il 29/8.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- un appuntamento segnato come **assenza**: nessuna riga nuova in `visits`, incassi della settimana **invariati**, contati prima e dopo;
- l'assenza **compare con la sua data** dove il salone la può leggere;
- il punteggio del cane scende di **uno**, non di due, segnando due volte;
- **annullando** l'assenza, punteggio e stato tornano come prima;
- l'appuntamento assente **non compare** nel report settimanale né in quello mensile;
- **nessun campo importo** viene richiesto in nessun passaggio del gesto;
- un cliente **non può** segnare né annullare un'assenza;
- build verde; suite RLS estesa con i casi nuovi.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro: **segnare un'assenza su un appuntamento di prova e poi annullarla**, guardando la scheda del cane prima, durante e dopo. Deve tornare esattamente com'era — e il salone deve poter dire, guardandola, *quando* è successo.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
