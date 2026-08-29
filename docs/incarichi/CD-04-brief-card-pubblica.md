# CD-04 — Brief per Claude Design: la card pubblica del cane

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 29 agosto 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex insieme al mandato QR.
**Rotta:** `/client-card/:qrToken`, componente `PublicPetCard`. **Nessuna rotta nuova.**

## Che pagina è

Un cartoncino stampato con un codice QR, consegnato al cliente. Lo inquadra col telefono e arriva qui. **Non passa dall'app: questa pagina è il primo contatto**, e spesso l'unico per mesi.

Le pagine del gestionale le guardano due persone che ci lavorano dentro. **Questa la guarda chi deve decidere se fidarsi.**

Ed è già in circolazione: le card stampate esistono, sono state distribuite, e sono state verificate funzionanti dopo la migrazione di ieri notte — inquadrando un cartoncino vero con un telefono vero.

## Non è mai passata da un giro di veste — misurato

`PublicPetCard.jsx` contiene **undici colori scritti a mano e nessun token**:

```
#ead7c5  #fffaf6  #d4a017  #cd7f32  #94a3b8
#ffffff  #f0e7de  #F4E3A1  #EBC9A7  #E5E7EB  #16a34a
```

Tre sono i livelli fedeltà — oro, bronzo, argento — e hanno una ragione semantica, ma restano da dichiarare.

**Il verde del pulsante è `#16a34a`**, il verde generico di Tailwind. **Non è il verde di WhatsApp** (`#25D366`): quindi non è nemmeno una citazione deliberata del marchio per dire dove porta il pulsante. È un verde «di successo» capitato lì, che somiglia a WhatsApp per caso.

**Nota sulla lingua.** Questa pagina appartiene al vocabolario dell'**app clienti**, non a quello del gestionale. Sono due lingue diverse e finora si sono incontrate solo qui. E parla **con la voce del salone**: «noi», mai «voi».

## Le due misure che cambiano il problema

### 1 · L'illustrazione non è un ripiego: è il volto del salone

**42 cani su 282 hanno una foto.** Gli altri 240 — l'**85%** — mostrano il disegno segnaposto.

Quindi non stai componendo una card con la foto del cane e un caso limite senza. Stai componendo **una card senza foto**, con una minoranza fortunata che ce l'ha. Il ritratto generico è la regola, e va trattato come tale invece che come mancanza.

### 2 · La progressione fedeltà promette a tutti che sono lontani

| | misurato |
|---|---:|
| visite del cane con più visite | **6** |
| visite medie per cane | 1,6 |
| cani con 12 visite o più | **0** |
| cani con 6-11 visite | **1** |
| intervallo mediano fra due visite | **49 giorni** |

I livelli chiedono **12, 24 e 36** visite. A un ritmo di 49 giorni:

- **Bronzo** ≈ 1 anno e 7 mesi
- **Argento** ≈ 3 anni e 3 mesi
- **Oro** ≈ 4 anni e 10 mesi

**Nessun cliente del salone può vedere altro che «Livello Base».** Oggi la card dedica la sua metà inferiore a una barra che dice «0 / 12», «0 / 24», «0 / 36», cioè tre volte «sei lontano», al primo incontro con chi non ci ha ancora messo piede.

Va detto onestamente: lo storico comincia a marzo 2026, quindi i conteggi sono tagliati dall'età dei dati, non dalla scarsa fedeltà dei clienti. Ma **il ritmo reale è quello**, e le soglie sono state scelte senza guardarlo.

**Non ti chiediamo di aggiustare la barra.** Ti chiediamo di dire se quel blocco debba essere il protagonista della pagina, e cosa dovrebbe esserci al suo posto se la risposta è no. La revisione delle soglie è una decisione di prodotto che Luigi porterà al salone: quello che serve a lui è sapere **cosa dovrebbero valere** per essere una promessa e non una distanza.

## Cosa c'è nei dati

Verificato: nome del cane · razza (277 su 282) · foto quando esiste (42) · numero di visite registrate · livello fedeltà e progressione · nome del salone.

**Non esiste** l'operatore che ha lavorato, la data della prossima visita, il prezzo, il servizio in forma strutturata. **Marca con ⚠ qualunque altro campo tu voglia usare**: la convenzione ha prodotto tre correzioni nel giro CD-02 e una in CD-03, di cui due sostanziali.

## I due gesti in fondo

**«Scrivi a Grooming Hub»** apre WhatsApp con il numero del salone. È l'azione vera della pagina: il salone lavora su WhatsApp, non su moduli.

**«Area riservata»** porta all'accesso cliente. La parola è amministrativa — è il registro di un ufficio, non di una toelettatura — e il cliente che la legge non sa ancora che esiste un'area, né perché dovrebbe volerla. **Le parole di questi due pulsanti sono materia tua.**

## Le domande che ti chiediamo di nominare

1. **Cosa deve capire in tre secondi** uno sconosciuto che ha appena inquadrato un cartoncino? Che il cane è schedato? Che il salone lo riconosce? Che esiste un'app?
2. **La pagina serve al cliente o al salone?** Oggi mostra al cliente dati che il cliente già sa (il nome del suo cane) e una distanza che non ha chiesto.
3. **Il telefono qui non è il ripiego: è il caso normale.** Un QR si inquadra col telefono, quasi sempre. La composizione a schermo largo è il caso raro, non il contrario — è l'opposto della regola che vale per il gestionale.
4. **Serve un secondo stato?** Un cliente che ha già l'accesso e uno che non ce l'ha vedono la stessa pagina. Forse non dovrebbero.

## Vincoli

- Nessun colore nuovo oltre quelli dichiarati; i tre metalli dei livelli vanno **dichiarati come token** se sopravvivono.
- Nessun target sotto 44px: qui, dove il telefono è il caso normale, vale doppio.
- Nessuna rotta nuova, nessuna promessa che il database non regge.
- Dichiara le domande aperte invece di risolverle in silenzio.
