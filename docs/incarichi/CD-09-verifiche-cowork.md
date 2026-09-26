# CD-09 — Le verifiche di Cowork

**Da:** Cowork · **Per:** Claude Design, e il mandato di esecuzione che verrà
**Data:** 24 settembre 2026

Risposta ai sei campi marcati **⚠** nel §8 dell'handoff di CD-09. Quattro si chiudono leggendo il codice, due hanno richiesto una verifica esterna.

---

## 1 · Le visite nella finestra del livello successivo — **c'è**

`getFidelityTierSnapshot` in `apps/staff/lib/fidelity.js` restituisce, **per ogni livello**, sia `visitsInWindow` sia `remainingVisits`, calcolando la finestra di quel livello (12, 24 o 36 mesi). Il conteggio per «Verso l'Argento: 3 di 12» **esiste già**.

**Nota per il mandato**: il file sta in `apps/staff/lib/`. Per usarlo lato proprietario va spostato in `shared/`, **senza modificarlo**.

## 2 · La data del raggiungimento — **non c'è**

Non è fra i dati dello snapshot e non è in nessuna tabella: `pets` conserva solo `awarded_fidelity_tier`, cioè il livello assegnato a mano, senza data.

**Conseguenza confermata**: lo stato «appena raggiunto» oggi è indistinguibile da «ce l'ha». CD non l'ha composto, ed è la scelta giusta.

## 3 · Un livello raggiunto si perde — **sì**

**È la risposta al §9.1, ed è la più importante.**

`calculatedTier` viene **ricalcolato a ogni lettura** sulle visite dentro la finestra mobile. Se un cane scende sotto la soglia, **il livello sparisce**. Solo `awardedTier` — quello che Davide assegna a mano — resta per sempre.

**Quanto è fragile, misurato il 24/9**: hanno il Bronzo **4 cani su 374**, con una media di **1,8 visite per cane** negli ultimi 12 mesi. Chi raggiunge la soglia ci sta sopra per un soffio.

> **È una decisione di prodotto, non tecnica, e non è di CD.** La domanda per Davide: *un livello guadagnato è una conquista o una fotografia?* Se è una conquista non si perde più, e serve una migrazione che lo cristallizzi. Se è una fotografia resta com'è — ma allora la tessera deve dirlo **prima**, non dopo.

## 4 · `owner_photo_url` — **esiste**

Colonna su `pets` dal `GH-50`, ed è già l'unica foto che il lato proprietario legge (`GH-77`, `GH-79`). `photo_url`, la foto di riconoscimento del salone, **non esce dal gestionale**: ricerca esaustiva fatta in `GH-79`, zero occorrenze sotto `src/apps/customer`.

**Oggi è vuota per quasi tutti**: l'iniziale è lo stato normale, come CD ha previsto.

---

## 5 · L'icona separata sulla schermata del telefono — **funziona su iPhone, non su Android**

**iPhone, Safari.** Safari **non legge `start_url`** dal manifest: «Aggiungi alla schermata Home» usa **l'indirizzo della pagina che si sta guardando**. Quindi, stando sulla pagina della tessera, si ottiene **un'icona che apre la tessera**. È esattamente quello che CD sperava, e non costa niente.

**Android, Chrome.** Chrome **legge il manifest** e, per un'app installabile come la nostra (`display: standalone`, `start_url: "/"`), **installa l'app alla radice**. L'icona aprirebbe la Home, non la tessera. Le versioni recenti tendono a non offrire più la scorciatoia semplice alla pagina corrente.

**La via per Android esiste ed è standard**: il manifest ammette un elenco `shortcuts`. Una voce «La tessera» che punta alla pagina compare tenendo premuta l'icona dell'app, e da lì si può trascinare sulla schermata. **Gesto diverso, stesso risultato.** Non è stato provato su un telefono vero: va misurato dentro il mandato.

> **Da dire in chiaro nel testo dell'invito**, qualunque cosa si scelga: le istruzioni su iPhone e su Android **non sono le stesse**. Una frase sola che vale per entrambi sarebbe sbagliata per metà delle persone.

## 6 · Il blocco dello spegnimento dello schermo — **utilizzabile, con una riserva**

L'API esiste (`navigator.wakeLock`) ed è supportata da Safari su iOS **dalla 16.4** e da Chrome e Firefox.

**La riserva**: dentro le app installate su iPhone è rimasta **rotta fino a iOS 18.4**. Chi ha un iPhone più vecchio e usa la tessera dall'icona installata **non avrà il blocco**, e lo schermo si spegnerà come sempre.

**Quindi si usa, ma con la guardia** `if ('wakeLock' in navigator)` e accettando che su alcuni telefoni non faccia niente. **Non è un problema**: il vero strumento della modalità banco resta il fondo bianco pieno, come ha scritto CD al §9.4. Il blocco è un di più.

**Nel mandato**: nessuna promessa nel testo a schermo. Non si scrive «lo schermo resterà acceso», perché su una parte dei telefoni non è vero.

---

## Fonti delle due verifiche esterne

- [Apple Developer — What's new in web apps, WWDC23](https://developer.apple.com/videos/play/wwdc2023/10120/)
- [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [web.dev — The Screen Wake Lock API is now supported in all browsers](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers)
- [Can I use — Screen Wake Lock API](https://caniuse.com/wake-lock)
