# CD-12 — Il calendario del mese

**Da:** Luigi · **Per:** Claude Design · **Data:** 10 novembre 2026
**Nasce da:** la prima prova di prenotazione di un cliente vero (9/11) e la decisione di Luigi e Davide del 10/11.
**Esito atteso:** composizione, non codice. Consegna in `Prototipo/` (Cowork la copia in `docs/consegne/CD-12-consegna/`), nella forma di CD-10 e CD-11: tela, kit e handoff.

## Da dove nasce

Nella pagina di richiesta dell'app cliente, «Quando ce lo porti?» (`apps/customer/pages/Book.jsx`, passo 3, «Quando ti andrebbe bene?»), la data si sceglie da una **striscia di giorni** (`shared/ui/DesiredDateStrip`). Ecco come funziona oggi:

- la striscia contiene i **12 giorni a partire da domani**;
- **sul telefono se ne vedono solo 6** (dal 7° in poi sono nascosti), domenica compresa, che è chiusa: in pratica una settimana;
- **non si può andare avanti**: nessuna freccia, nessun mese.

Luigi, provandola, non riusciva a scegliere una data oltre la settimana. Davide vuole dare ai clienti **più libertà**.

## La decisione

1. **La striscia diventa un calendario del mese**, con frecce per passare al mese prima e a quello dopo.
2. **Il cliente può scegliere fino a 2 mesi da oggi.** Oltre il limite il calendario non va. È un'impostazione del salone: Davide potrà cambiarla, e la composizione non deve dipendere dal numero.

## Cosa il calendario deve far leggere

Le regole che sono già nell'app restano tutte; sono i dati con cui comporre:

| Giorno | Cosa vede il cliente |
|---|---|
| oggi e i giorni passati | non selezionabili (si prenota da domani) |
| domenica | chiuso |
| lunedì | selezionabile, ma **solo il pomeriggio**: la mattina è chiusa (oggi lo dicono le fasce sotto il calendario) |
| oltre i 2 mesi | non selezionabile, ed è chiaro perché |
| periodi pieni (Natale, Capodanno, Ferragosto) | selezionabili, con l'avviso «Periodo pieno» che oggi compare sotto |
| meno di 7 giorni da oggi | selezionabili, con l'avviso «Sei un po' a corto di preavviso» |
| il giorno scelto | evidente |

Il giorno scelto resta una **data desiderata**: l'ora la conferma il salone su WhatsApp. Il testo della pagina lo dice già; il calendario **non deve sembrare un sistema di posti liberi**. Non mostra disponibilità reale, e non deve far credere che una data scelta sia confermata.

## Cosa ti chiediamo

1. **Il calendario mensile a 375px**, dentro il passo 3, con le frecce tra i mesi, il nome del mese e i casi della tabella. Vale anche a 1365px, nella colonna del modulo accanto al riepilogo.
2. **Il primo mese mostrato**: di norma quello corrente. Decidi cosa succede negli ultimi giorni del mese, quando i giorni selezionabili sono quasi tutti nel mese dopo.
3. **I due posti dove compare.** Oltre alla pagina di prenotazione, la stessa scelta della data c'è nella scheda in cui il cliente indica un'altra data dopo che il salone ha proposto alternative o rifiutato la data (`components/PendingRequest.jsx`). Componi entrambi, oppure dichiara perché la scheda può restare com'è.
4. **Il rapporto con le fasce** di orario (mattina, pomeriggio, «Per me è uguale»), che restano sotto il calendario, e con gli avvisi che oggi compaiono sotto la striscia.

## Cosa non cambia

- **Il resto della pagina**: i passi 1, 2 e 4 e il riepilogo.
- **Il pulsante «Invia la richiesta».** Lo sta correggendo Codex con `GH-115`: resta sempre visibile, è grigio quando manca qualcosa, e una riga dice cosa manca. Componi il calendario sapendo che in fondo allo schermo c'è quel pulsante fisso.
- **Nessun colore nuovo.** Le sedici voci del §7 di CD-09.

## Consegna

Tela, kit e handoff, con la **tabella prima → dopo** e i valori. Dichiara a parte **cosa non torna**.
