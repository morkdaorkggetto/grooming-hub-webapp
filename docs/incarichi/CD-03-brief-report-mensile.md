# CD-03 — Brief per Claude Design: la stessa pagina, a distanza di un mese

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 29 agosto 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex in `GH-35`.
**Rotta:** sempre `/reports/weekly`. **Nessuna rotta nuova.**

## È la tua proposta, accolta

Al §9.2 dell'handoff CD-02 avevi scritto che il mese sarebbe probabilmente l'unità giusta — *«loro ragionano a mesi; `weekly` è una scelta ereditata»* — e avevi proposto **questa stessa pagina ribaltata**, mesi come contenitore e settimane come righe, lasciandola a noi perché sarebbe stata una rotta nuova.

Luigi l'ha chiesta guardando la pagina in produzione. **E non serve una rotta nuova**: un interruttore *settimana / mese* sulla stessa pagina fa la stessa cosa, e dice una verità in più — è la stessa domanda, «come è andata», fatta a due distanze.

Il brief è breve perché la composizione esiste già. **Non ricomporre la pagina: dille cosa cambia quando l'unità cambia.**

## Costa poco, e vale la pena saperlo

`getWeeklyRevenueReport({ from, to })` accetta **un intervallo qualsiasi**: un mese è la stessa query con due date diverse. Nessun lavoro sul database, nessun campo nuovo. I componenti che hai fatto reggono già: le sette righe-giorno diventano quattro o cinque righe-settimana, la striscia delle ultime dodici settimane diventa dodici mesi, la distribuzione degli importi non cambia.

## I mesi veri — misurati stamattina sulla produzione

| mese | cani passati | incassato | giorni lavorati | settimane toccate |
|---|---:|---:|---:|---:|
| marzo 2026 | 67 | 1.611 € | 14 | 5 |
| aprile | **146** | **3.547 €** | 20 | 5 |
| maggio | 37 | 1.065 € | 10 | 4 |
| giugno | **29** | **800 €** | 10 | 5 |
| luglio | 110 | 3.030 € | 23 | 5 |
| agosto (incompleto) | 67 | 1.745 € | 11 | 4 |

**Sei mesi in tutto: la storia comincia il 2 marzo 2026.** Non ce ne sono altri, e per un anno la striscia dei dodici mesi sarà per metà vuota.

Due cose che si vedono solo a questa distanza e che a settimane non emergevano:

- **aprile e giugno differiscono di cinque volte.** Il salone ha stagioni, e il mese è l'unità in cui si vedono;
- **i giorni lavorati contano quanto i cani.** Luglio fa quasi il doppio dei cani di marzo, ma anche 23 giorni contro 14. Senza quel numero, «110 contro 67» dice una cosa falsa.

## Le domande di composizione — sono quattro

**1 · Cosa dice una riga-settimana.** È il cuore del brief. Hai da mostrare: l'intervallo di date, i giorni lavorati, i cani passati, l'incassato. Un giorno vuoto era un trattino; **una settimana vuota è un'altra cosa** — nei periodi di chiusura sarà una riga intera, e va detta senza sembrare un errore.

**2 · Il mese incompleto.** Oggi è il 29 agosto: il mese corrente non è finito, e confrontarlo con luglio pieno è ingannevole. Come lo dici — una riga che manca, una nota, un confronto pro-quota — è una tua scelta, ma **il numero non deve mentire per omissione**.

**3 · Il confronto.** A settimane è «la scorsa». A mesi, «il mese scorso» è utile ma **«lo stesso mese dell'anno prima» non esiste** e non esisterà fino a marzo 2027. Non promettere un confronto che i dati non reggono.

**4 · L'interruttore.** Settimana e mese sulla stessa pagina: dove sta, che forma ha, e cosa succede quando passi dall'una all'altro — resta la stessa data al centro, o si torna al periodo corrente? La navigazione avanti e indietro deve significare la stessa cosa in entrambi i modi.

## Cosa non cambia

Tutto ciò che il §7 di CD-02 dichiara deliberato resta deliberato: due numeri grandi e non quattro, la riga che è la barra, la striscia senza assi, gli sconti fuori dai numeri grandi, i trattamenti verbatim, le righe di assenza in elenco, `issues` come pallino.

E resta la regola dei giorni chiusi: **la domenica si può dire «chiuso»** perché `booking_schedule` la dichiara, il lunedì no perché chiudono solo la mattina, ogni altro giorno vuoto è un trattino. A distanza di mese la domenica sparisce come riga: **decidi se e come sopravvive** l'informazione «quanti giorni erano chiusi».

## Vincoli

- Eredita `design_handoff_staff_app/` e la tua stessa composizione CD-02: nessun componente nuovo se uno esistente regge.
- **Nessun colore nuovo.** I sei derivati d'opacità che avevi segnalato sono ora token dichiarati: usali per nome.
- Nessun target sotto 44px sotto i 640px.
- **Marca con ⚠ ogni campo che non sei certa esista.** Ha prodotto tre correzioni nel giro scorso, di cui una sostanziale.
- Dichiara le domande aperte invece di risolverle in silenzio.
