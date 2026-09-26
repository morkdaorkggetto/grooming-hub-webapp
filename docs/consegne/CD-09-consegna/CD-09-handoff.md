# CD-09 · Handoff — la tessera del cane

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 24 settembre 2026
**Esito:** composizione. Non codice.
**Superficie:** app del proprietario — pagina nuova della tessera + striscia in `apps/customer/pages/Home.jsx`. **La barra resta a tre voci.**
**Contratto «prima» misurato su:** `shared-ui.jsx` (`FidelityBadge`, `Icon`), `cd04-card-kit.jsx` (`BigGesture`), `gh15-ed-kit.jsx`.

---

## 1 · I file di composizione

| File | Cosa contiene |
|---|---|
| `cd09-tessera-kit.jsx` | `TIER`, `Phone375`, `Ritratto`, `TierChip`, `Timbri`, `Tacche`, `FakeQR`, `racconto()`, `Tessera`, `TabBar`, `HomeStrip` |
| `cd09-tessera-viste.jsx` | Gli stati della tessera, la modalità banco, la Home prima e dopo |
| `cd09-tessera-note.jsx` | Le tavole: giudizio, storico, livelli, premio, QR, accesso, cosa non torna, campi ⚠ |
| `CD-09 La Tessera.html` | Il canvas |

**Dipendenze:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo `QRow`), `cd04-card-kit.jsx` (solo `BigGesture`).

**Due cose da non portare in produzione:** `FakeQR` è un segnaposto (un disegno che somiglia a un QR, **non un codice**); `Phone375` è la cornice di presentazione.

**Modifica a un file già consegnato:** `shared-ui.jsx` ha l'icona nuova **`tessera`**. Se Codex ha zip precedenti, quel file va sostituito.

---

## 2 · Colori — nessuno nuovo

- **Metalli:** `--tier-bronze`, `--tier-silver`, `--tier-gold`.
- **Fondi chiari e inchiostri:** quelli già presenti in `FidelityBadge` (`#f6e7d7`/`#8a5a2a`, `#eceef2`/`#4a5668`, `#faedc4`/`#7a5a0a`). Raccolti in `TIER`, non inventati.
- **⚠ L'argento del token (`#94a3b8`) su bianco fa 2,6:1.** Va usato per pieni e tratti, **mai per il testo**: il testo d'argento usa `#4a5668`.
- **Un livello non raggiunto è neutro:** timbro bianco, bordo tratteggiato `--color-border`. Non grigio, non spento.

---

## 3 · Densità — regola dell'app clienti

Il telefono a 375px è il caso normale. **Il gesto principale è a 54px**, come in CD-04; nessun bersaglio sotto i 44px.

| Elemento | Valore |
|---|---:|
| «Mostra al banco» (pulsante pieno) | 54 |
| Tasto indietro · «Chiudi» | 44 |
| Striscia in Home (tutta toccabile) | ≥ 76 |
| Voce della barra | 64 d'altezza, un terzo di larghezza |
| Timbro (fino a 6) | 38 |
| Timbro (fino a 12) | 30 |
| Tacca (oltre 12) | 14 d'altezza |
| QR sulla tessera | 54 + bordo |
| QR al banco | **300 su 375** |

Timbri e tacche **non sono bersagli**: si leggono, non si toccano.

---

## 4 · Componenti

**Riusati senza toccarli:** `GH`, `Icon`, `Eyebrow`, `RefCard`, `QRow`, `BigGesture`.

**Nuovi:**

| Nome | Cosa fa |
|---|---|
| `TIER` | Metallo, fondo e inchiostro di ogni livello, da token e `FidelityBadge` |
| `Ritratto` | Il ritratto del **proprietario**, oppure l'iniziale. Anello nel colore del livello |
| `TierChip` | Il livello come pastiglia: pallino di metallo + nome |
| `Timbri` | Un timbro per visita, fino a 12. Il prossimo ha il bordo pieno |
| `Tacche` | Oltre 12: tacche su due righe da 18 |
| `racconto(s)` | **La frase.** Guarda avanti di un passo, non dice mai «mancano» |
| `Tessera` | L'oggetto intero |
| `HomeStrip` | L'accesso dalla Home, al posto del blocco «Punti» |
| `TabBar` | La barra a tre voci **com'è oggi** — solo per mostrare che non cambia |

**`PetAvatar` non è stato usato:** i suoi fondi (`#EBC9A7`, `#E5E7EB`, `#F4E3A1`) sono tre dei letterali già tolti in CD-04.

---

## 5 · Responsive

**375 è la norma.** Oltre, la tessera **si centra in una colonna di massimo 390px**, come la card pubblica di CD-04. Non si divide in due colonne.

---

## 6 · Stati

| Stato | Frase (`racconto`) | Sotto |
|---|---|---|
| **All'inizio** — 1 di 6 (la maggioranza) | «La prossima è la seconda.» / «Il Bronzo arriva alla sesta visita.» | 6 timbri, 1 pieno |
| **A metà** — 3 di 6 | «A metà strada verso il Bronzo.» / «3 visite. Il Bronzo è alla sesta.» | 6 timbri, 3 pieni |
| **Bronzo raggiunto** | «Luna è Bronzo.» / «Queste visite contano già per l'Argento: 6 di 12.» | 12 timbri, 6 pieni |
| **Bronzo dato a mano** | «Miele è Bronzo.» / «Verso l'Argento: 3 visite di 12.» | 12 timbri, 3 pieni |
| **Argento** | «Argo è Argento.» / «Verso l'Oro: 14 visite di 36.» | 36 tacche |
| **Oro** | «Kira è Oro.» / «41 visite da noi negli ultimi tre anni.» | **niente timbri** |
| **Senza ritratto** | — | iniziale al posto del ritratto. **È lo stato di quasi tutti** |
| **Al banco** | — | vedi §7.7 |

Sotto i timbri c'è sempre **la regola**: «Ogni visita da noi è un timbro · contano quelle degli ultimi {12/24} mesi». All'Oro: «Il livello più alto della tessera».

**Punti:** una riga **solo se il cane ha almeno un punto** — «C'è anche un'altra strada: 100 punti. {Nome} ne ha 40.» Altrimenti niente.

**L'invito ad aggiungere la tessera alla schermata del telefono** compare **una volta, sotto la tessera**, e non all'apertura dell'app.

---

## 7 · Cosa NON cambia — deliberato

1. **Timbri, non una barra.** La barra misura quanto manca, i timbri contano quanto c'è. Non convertirli in percentuale «per semplicità».
2. **La frase non dice mai «mancano».** Guarda avanti di un passo: «la prossima è la seconda». La distanza resta leggibile dai posti vuoti e dalla riga sotto.
3. **«Contiamo da settembre» non compare.** Sarebbe falso per una parte dei cani, e mette in faccia al cliente un problema del salone.
4. **Se il livello c'è, quanto manca riguarda quello dopo.** La soglia del livello già raggiunto **non compare mai**, da nessuna parte della tessera.
5. **Livello calcolato e livello dato a mano hanno la stessa tessera.** Nessun segno, nessuna data, nessuna frase diversa.
6. **All'Oro non ci sono timbri.** Una barra piena sarebbe un traguardo che non porta da nessuna parte.
7. **Al banco il QR prende tutto lo schermo:** fondo bianco pieno, nero puro, 300px, «GROOMING HUB» sopra, il nome del cane grande sotto. Il resto sparisce. Il bianco pieno è la luce più forte che lo schermo può dare, dato che dal web la luminosità non si alza.
8. **Sulla tessera il QR è piccolo.** Da solo il protagonista è il cane, al banco il codice: sono due momenti e due schermate.
9. **Un solo pulsante pieno:** «Mostra al banco».
10. **La barra resta a tre voci.** La tessera è un oggetto che si tira fuori, non un luogo come la Home.
11. **La striscia in Home prende il posto del blocco «Punti»**: stesso punto, non una sezione in più. Una striscia per cane.
12. **Ritratto: solo `owner_photo_url`.** Mai `photo_url`, che è la foto di riconoscimento e non esce dal gestionale.
13. **Nessun premio, nessuna parola che lo prometta** — né «sblocca», né «vantaggi».
14. **Nessuna continuità grafica con la medaglietta.** Decisione di Luigi.
15. **Le insegne — decisione di Luigi del 24/9:**
    - **fuori dalla tessera** c'è l'azienda: **«ZavaRoby pet station»**, serif, centrato, in cima alla pagina e in testa alla Home;
    - **dentro la tessera** c'è il servizio: **«GROOMING HUB»**, sans serif, maiuscolo spaziato, colore primary. Nessuna didascalia sotto;
    - **al banco** solo «GROOMING HUB» sopra il QR, perché lì è la tessera ingrandita.

    Grooming Hub è uno dei servizi di ZavaRoby pet station, e la tessera è sua: la gerarchia si legge senza spiegarla. **Non invertirle e non affiancarle.**
16. **Tutto centrato**, come nella schermata originale dell'app.

---

## 8 · Campi da verificare — 6 marcati ⚠

| Campo | Cosa serve |
|---|---|
| ⚠ **visite nella finestra del livello successivo** | per «Verso l'Argento: 3 di 12». Da confermare che lo snapshot dia il **conteggio** anche sulle finestre da 24 e 36 mesi, oltre a «quante ne mancano» |
| ⚠ **data in cui il livello è stato raggiunto** | non c'è fra i dati dello snapshot. Senza, lo stato «appena raggiunto» è uguale a «ce l'ha» |
| ⚠ **un livello raggiunto resta, o si ricalcola?** | cambia tutto il senso della tessera — vedi §9.1 |
| ⚠ `owner_photo_url` | chiesta in CD-05: esiste ora? Senza, l'iniziale per tutti — che è comunque lo stato di quasi tutti |
| ⚠ **pagina di avvio dell'icona sulla schermata del telefono** | un manifest ha una pagina d'avvio sola. La verifica è di Cowork |
| ⚠ **blocco dello spegnimento dello schermo** | per la modalità banco, sui telefoni che lo supportano |

---

## 9 · Cosa non torna — dichiarato a parte

**9.1 · I timbri scadono.** Con dodici mesi mobili, un cane che salta un'estate perde timbri, e il proprietario vede tornare vuoto un posto che era pieno. Per questo la regola è scritta sulla tessera fin dal primo giorno. **La domanda vera è a monte: un livello raggiunto si perde?** Se il Bronzo sparisce quando la finestra scorre, «Luna è Bronzo» un mese e non il successivo è peggio della barra al 17%.

**9.2 · Il regalo si può dedurre.** Il cartoncino pubblico stampa la scala con le soglie: chi sa che il Bronzo è a 6 visite e legge «Verso l'Argento: 3 di 12» può capire che il suo Bronzo non è calcolato. Dalla tessera non si deduce. **La soluzione non è di questa pagina: è non stampare le soglie sul cartoncino.**

**9.3 · «Appena raggiunto» non si sa.** Senza una data la tessera non festeggia, e infatti non l'ho fatto. Se si vuole quel momento, serve la data — e basterebbe una riga, mostrata una volta.

**9.4 · La luminosità non si alza dal web.** Lo schermo bianco pieno è il massimo che si può fare. Se al banco non basta, la risposta non è di composizione: è la medaglietta.

**9.5 · Il premio.** La tessera regge senza, ma regge meno di quanto potrebbe: sei timbri verso un nome sono un gioco gentile, sei timbri verso qualcosa sono una ragione. **Decisione di Davide.** Se arriverà, il posto c'è già: una riga sotto la frase, nella stessa voce.

**9.6 · Più cani per proprietario.** Una tessera per cane, una striscia per cane in Home. Non ho composto il passaggio da una tessera all'altra.

---

## 10 · Le parole

- **«La prossima è la seconda.»** Non «ti mancano 5 visite».
- **«A metà strada verso il Bronzo.»** Solo a metà esatta.
- **«{Nome} è Bronzo.»** Il livello è del cane, non del proprietario né del «cliente».
- **«Queste visite contano già per l'Argento.»** Solo per chi l'ha raggiunto davvero: dice che non si riparte da zero.
- **«Ogni visita da noi è un timbro · contano quelle degli ultimi 12 mesi.»** La regola, non una scusa.
- **«Mostra al banco»**, con sotto «il codice a tutto schermo, da far leggere a noi».
- **«Tienila a portata.»** L'invito all'icona sul telefono.
- **«la tessera di {Nome}»** sulla striscia in Home.

Voce di `GH-83`: il salone parla a una persona. Tutte reversibili in una stringa.

---

## Verifiche fatte prima di consegnare

- Console pulita; tutti i token risolvono. **Zero colori nuovi**, verificato.
- Contrasto dell'argento controllato: il token resta ai pieni, il testo usa l'inchiostro.
- Le insegne sono state riviste con Luigi in tre passaggi: da entrambe dentro la tessera, a entrambe fuori, alla forma finale del §7.15.
