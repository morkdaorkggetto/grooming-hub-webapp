# CD-02 — Brief per Claude Design: il report incassi

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 28 agosto 2026, sera
**Esito atteso:** composizione, non codice. Realizzerà Codex in `GH-33`.
**Rotta:** `/reports/weekly`, componente `WeeklyRevenue`.

## Perché adesso

Stasera la produzione è passata al nuovo schema. Il salone lavora sui dati veri migrati: 260 clienti, 282 cani, 456 visite.

**Questa è l'ultima schermata rimasta con la veste vecchia.** Tutto il resto — Dashboard, scheda cliente, form visita, calendario, rubrica, nuovo cliente, giornata, richieste, login — è già vestito. Il report è rimasto fuori dai giri precedenti perché è un report, e un report merita una composizione sua invece di un rivestimento affrettato.

È anche l'ultimo consumatore della vecchia fascia `AppHeader`: quando questa pagina cambia, quella fascia può sparire dal progetto. Non è materia tua, ma spiega perché la chiusura di questa pagina conta più di quanto la pagina stessa suggerisca.

## Rischio basso, e vale la pena saperlo

È una vista in **sola lettura**: nessuna scrittura, nessun gesto distruttivo, nessun dato in gioco. Puoi ripensarla senza le cautele che avevamo imposto su Dashboard e scheda cliente.

## Cosa c'è oggi — le ossa

Nell'ordine in cui appaiono:

1. **Fascia** con titolo e sottotitolo, più un ritorno alla Dashboard.
2. **Navigazione della settimana**: «Settimana prima», «Questa settimana», «Settimana dopo», con l'intervallo scritto per esteso.
3. **Quattro riquadri**: incasso totale · visite registrate · media per visita · **sconti applicati**.
4. **Andamento giornaliero**: sette schede, una per giorno, con numero di visite e incasso.
5. **Grafico incassi settimanali**: barre orizzontali giorno per giorno, con il picco dichiarato.
6. **Dettaglio delle visite**: cane, proprietario, importo, trattamenti scritti a mano, sconto se presente.

## Le misure — 456 visite, 25 settimane, dal 2 marzo al 24 agosto 2026

Contate stasera sulla produzione reale, non stimate.

| | valore |
|---|---:|
| settimane con almeno una visita | 25 |
| visite per settimana, media | **18,2** |
| visite per settimana, minimo | **1** |
| visite per settimana, massimo | **58** |
| incasso settimanale medio | ~472 € |
| incasso settimanale massimo | 1.495 € |
| visite senza importo | **0** |
| visite con annotazione in `issues` | 33 |
| **visite con uno sconto** | **0** |

### Prima cosa, e riguarda la composizione: un riquadro su quattro è morto

**«Sconti applicati» ha mostrato 0,00 € per 456 visite di fila.** Non è un caso raro: è la totalità della storia del salone. Un quarto dello spazio più prezioso della pagina è occupato da un numero che non è mai cambiato.

Non ti chiediamo di toglierlo: ti chiediamo di **decidere** e di dirci perché. Toglierlo, degradarlo a riga minore, o tenerlo perché un giorno servirà — sono tre risposte legittime e la scelta è editoriale, quindi tua.

### Seconda cosa: la settimana da 1 visita e quella da 58

Diciotto è la media, ma la realtà oscilla di quasi sessanta volte. Un grafico che sta bene a 18 barre può essere illeggibile a 58 righe di dettaglio e ridicolo con una sola.

**Compone bene chi compone prima i due estremi**, non la settimana media: la settimana quasi vuota — che nei periodi di chiusura è la norma — e la settimana da 58 visite.

E c'è un terzo stato che sarà frequente: **la settimana futura**, completamente vuota, perché il pulsante «Settimana dopo» esiste e qualcuno lo premerà.

### Terza cosa: gli importi hanno due gobbe, e c'è un buco in mezzo

| fascia | visite |
|---|---:|
| sotto 20 € (da 1 a 15) | 49 |
| **20-25 €** | **226** |
| 26-29 € | **0** |
| **30-35 €** | **150** |
| oltre 35 € (da 40 a 70) | 31 |

Il vuoto fra 26 e 29 non è un'anomalia: è la prova che il salone vende **due cose**, e lo confermano Davide e Roby — **il bagno** (20 €, 45 minuti) e **il taglio** (30 €, 90 minuti, che da listino nazionale comprende sempre il bagno). Sono i due soli servizi ora caricati a sistema.

Ti diciamo che il dato esiste; se debba comparire nel report — quante lavorazioni di un tipo e quante dell'altro — è una domanda che ti chiediamo di **nominare**, non necessariamente di risolvere. Con un avvertimento importante nel paragrafo seguente.

## Il campo dei trattamenti non è un listino: è un diario

Già dichiarato in `CD-01` e vale identico qui. `visits.treatments` è **testo libero scritto a mano dal salone**, e dentro non ci sono solo lavorazioni: ci sono anche «ha saltato l'appuntamento senza avvisare», «non è venuto», «appuntamento rimandato per ciclo», «bagnetto (paga 15 euro perché è la prima volta)».

Due conseguenze:

- **non si può classificare per servizio partendo da lì.** Se il report dovesse dire «12 bagni e 6 tagli», il numero sarebbe inventato. L'unico appiglio affidabile all'importo è la distribuzione qui sopra, e resta un'inferenza.
- **una riga del dettaglio a volte racconta un'assenza, non un lavoro.** Il dato è più sporco di quanto un prototipo lo immaginerebbe, e va composto per come è.

Lo stesso vale per `issues`, presente in 33 visite: sono note del salone, non una tassonomia.

## Cosa hai a disposizione per ogni visita

Dalla query reale, così componi solo su campi esistenti:

data (**solo giorno, nessun orario** — `visits.date` è di tipo `date`) · importo · percentuale di sconto · trattamenti scritti a mano · note `issues` · cane con nome e razza · proprietario con nome, cognome e telefono.

**Non esiste**: l'operatore che ha lavorato, la durata reale, il metodo di pagamento, il servizio in forma strutturata.

## Le domande che ti chiediamo di nominare

1. **A chi parla questa pagina?** Oggi si chiama «Controllo business» nella Dashboard. Serve a Davide per sapere quanto ha incassato questa settimana, o per capire come sta andando il salone nel tempo? Sono due pagine diverse, e oggi ne esiste una sola che prova a essere entrambe.
2. **La settimana è l'unità giusta?** Il salone lavora a giornate e ragiona a mesi. La settimana potrebbe essere l'unità del progettista, non la loro.
3. **Il confronto manca del tutto.** Oggi non si vede se questa settimana è andata meglio o peggio della precedente: bisogna premere un pulsante e ricordare il numero. Il dato per farlo c'è.
4. **Grafico e schede giornaliere dicono la stessa cosa due volte.** Sette schede con visite e incasso, e sotto sette barre con lo stesso incasso. Se sia ridondanza o rinforzo, dillo tu.

## Vincoli

- Eredita il vocabolario di `design_handoff_staff_app/`: token, scala tipografica, altezze, geometria, un solo punto di rottura a 640px. Il kit è già in produzione — `gh15-staff.css` e `StaffKit.jsx`.
- **Nessun colore nuovo** oltre i tre già dichiarati. Attenzione: la pagina attuale usa un arancione scritto a mano (`#b45309`) fuori dai token, proprio sul riquadro degli sconti.
- Densità: comprimi tipografia e spazio, mai il bersaglio. Nessun target sotto 44px sotto i 640px.
- **Nessuna rotta nuova**, e nessuna promessa che il database non regge.
- **Marca con ⚠ ogni campo che non sei certa esista.** La convenzione ha funzionato due volte: nel giro della veste staff dodici campi marcati, quattro inesistenti, esclusi prima che qualcuno ci costruisse sopra.
- Dichiara le domande aperte invece di risolverle in silenzio.

## Una nota sul salone, per il tono

Davide e Roby non leggono cruscotti. Registrano il lavoro a fine giornata, scrivono in un campo libero, chiamano «bagnetto» il bagno 129 volte su 298. Questa pagina è l'unica del gestionale che parla la lingua dei numeri invece di quella del lavoro.

**Se i numeri devono restare, che almeno dicano qualcosa che loro riconoscano** — non KPI, ma «questa settimana è andata come la scorsa», «martedì è stato il giorno pieno», «questi sono i cani passati».
