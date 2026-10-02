# Incarico GH-107 — La tessera del cane

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 ottobre 2026
**Nasce da:** `CD-09`, composizione di Claude Design consegnata il 24/9 (`docs/consegne/CD-09-consegna/`), e le verifiche di Cowork dello stesso giorno (`docs/incarichi/CD-09-verifiche-cowork.md`). Decisioni di Luigi del 1/10.

**Perimetro**: `src/apps/customer/` (pagina nuova e striscia in `pages/Home.jsx`), `src/shared/` (dove sposti `fidelity.js` e il generatore del QR), gli usi staff di `fidelity.js` (`components/ClientCard.jsx`, `pages/ClientDetail.jsx`, `pages/AddVisit.jsx`, `pages/Dashboard.jsx`) solo per l'import e per la regola del punto 2, `public/manifest.webmanifest`. **Nessuna migrazione, nessuna policy.** **Dati**: sul demo sono ammessi **dati di prova temporanei** e una **modifica temporanea delle impostazioni del salone demo**, con ripristino verificato. **La produzione non si tocca**: l'atto sulle impostazioni del prodotto lo fa Cowork (punto 2). Nessun push, merge o deploy.

## Da dove nasce

Luigi credeva che l'app del proprietario avesse già la vista col QR. **Non c'è**: ricerca di Cowork del 1/10 su `src/apps/customer`, zero occorrenze di QR o tessera. Le pagine sono Home, Promozioni, Pet, Prenota e accesso (`CustomerApp.jsx:45-57`). CD l'ha composta, Cowork l'ha verificata, **il mandato di esecuzione mancava**: aspettava una decisione sui livelli. Ora c'è.

## La composizione: si segue CD-09

L'handoff è `docs/consegne/CD-09-consegna/CD-09-handoff.md`. **Seguilo come contratto**: densità (§3), componenti (§4), responsive (§5), stati (§6), **le sedici cose che non cambiano (§7)**, le parole (§10). In particolare:

- **una tessera per cane**, una pagina nuova; dalla Home **una striscia per cane, al posto del blocco «Punti»**;
- **la barra resta a tre voci**;
- **«Mostra al banco»**: il QR a tutto schermo, fondo bianco pieno, nero puro, 300px su 375, «GROOMING HUB» sopra e il nome del cane grande sotto. **Un solo pulsante pieno**;
- **timbri, non una barra**; la frase non dice mai «mancano»; all'Oro niente timbri;
- **ritratto solo da `owner_photo_url`, mai `photo_url`**;
- insegne come §7.15: «ZavaRoby pet station» fuori, «GROOMING HUB» dentro.

**Da non portare in produzione** (handoff §1): `FakeQR` e `Phone375`.

**Il QR è vero e uguale a quello del cartoncino**: codifica l'indirizzo pubblico del cane, `getPublicPetUrl(qrToken)` in `apps/staff/lib/qrCode.js`, con lo stesso generatore (`qrcode-generator`, già fra le dipendenze). Lo sposti in `shared/` senza cambiarlo. **Un QR della tessera e uno stampato sul cartoncino dello stesso cane devono essere identici**: è una controprova.

**Le verifiche di Cowork** (`CD-09-verifiche-cowork.md`) valgono come premesse misurate il 24/9, **da rimisurare**: snapshot dei livelli (punto 1), `owner_photo_url` (punto 4), icona sul telefono (punto 5), blocco dello spegnimento dello schermo (punto 6, solo con la guardia `if ('wakeLock' in navigator)`, **nessuna promessa a schermo**).

## Cosa fare

### 1. La tessera e la modalità banco

Come da CD-09. La pagina della tessera ha **un indirizzo suo**, per cane, così che su iPhone «Aggiungi alla schermata Home» stando sulla tessera crei un'icona che apre la tessera (verifica 5). Per Android aggiungi al manifest una voce `shortcuts` «La tessera», come descritto nella verifica 5. L'invito a tenere la tessera sul telefono compare **una volta, sotto la tessera**, con istruzioni **diverse per iPhone e Android**, mai una frase sola per entrambi.

### 2. La regola dei livelli: decisioni di Luigi del 1/10

Oggi il livello si calcola contando le visite in una finestra mobile: Bronzo 6 in 12 mesi, Argento 12 in 24, Oro 36 in 36, oppure 100, 250 o 500 punti (impostazioni del salone, `tenants.settings.fidelity_tiers`, lette da Cowork nel prodotto il 1/10). **Ma lo storico del database parte dal 6 marzo 2026**: meno di sette mesi. Misure di Cowork nel prodotto, 1/10:

| Misura | Valore |
|---|---|
| prima visita registrata | 2026-03-06 |
| mesi osservati al 1/10 | 6,87 |
| cani con almeno una visita | 360 |
| Bronzo con la regola di oggi | **4** |
| cani con frequenza proiettata ≥ 6 l'anno (≥ 4 visite in 6,87 mesi) | **46** |

La regola misura la memoria dell'app, non la fedeltà del cane. Luigi ha deciso:

- **Bronzo: frequenza proiettata sullo storico disponibile.** Se lo storico del salone è più corto della finestra del livello, la finestra è lo storico e la soglia si riduce in proporzione, **arrotondata per eccesso**: con H mesi di storico e finestra W, servono `ceil(visite_richieste × min(H, W) / W)` visite contate da inizio storico. Quando lo storico raggiunge la finestra, la regola **torna identica a quella di oggi**, da sola.
- **Argento e Oro: esattamente la regola di oggi, nessuna proiezione e nessun vincolo nuovo.** 12 visite contate negli ultimi 24 mesi, 36 negli ultimi 36: la finestra è il **massimo** arco su cui si contano, **non un minimo di anzianità**. Un cane con 12 visite in sette mesi è Argento, come oggi. Per i clienti storici, che l'app conosce solo da marzo, c'è **il livello assegnato a mano** da Davide, che resta per sempre. *(Correzione di Cowork del 1/10: la prima stesura parlava di «durata che non si proietta» e prescriveva un vincolo di durata mai deciso. Vedi «Correzione» in fondo.)*
- **I punti restano la seconda strada, invariata.**
- **Un livello calcolato si può perdere** quando le visite nella finestra scendono sotto la soglia: è la regola di oggi, e la tessera lo dice con la regola scritta sotto i timbri (CD-09 §6).

**Da dove si legge l'inizio dello storico** *(forma superata: vedi «Correzione 2» in fondo)*: da due impostazioni nuove del salone, **non** dalla prima visita del database (che cambierebbe se un giorno si importasse il cartaceo):

```json
"fidelity_history_start": "2026-03-06",
"fidelity_tiers": { "bronze": { ..., "project_short_history": true } }
```

**Se le impostazioni mancano, il comportamento è identico a quello di oggi.** Nel prodotto le scrive Cowork con un atto sui dati, dopo la tua consegna; sul demo le metti tu, temporaneamente.

**Una sola regola per tutti**: tessera del proprietario e gestionale (scheda, card, dashboard) leggono la stessa funzione in `shared/`. *Le due sorgenti devono essere d'accordo* (canone §3, le cinque domande, n. 3).

### 3. Timbri con la soglia proiettata

I timbri del Bronzo sono **tanti quanti la soglia in vigore**: oggi 4, non 6. La regola sotto i timbri dice la verità, per esempio «Ogni visita da noi è un timbro · contano quelle dal 6 marzo 2026», finché lo storico è più corto di 12 mesi; poi torna «…degli ultimi 12 mesi». **Le parole esatte proponile tu nel registro**, nella voce di CD-09 §10; le confermano Luigi e CD.

## Cosa non torna, dichiarato prima

**I timbri del Bronzo crescono nel tempo.** Con la proiezione la soglia sale da 4 a 6 mese dopo mese, fino a marzo 2027. Un proprietario può vedere comparire un timbro vuoto in più senza aver fatto niente. È il prezzo della scelta, e Luigi la conosce. **Non nasconderlo**: misura quando la soglia cambia (le date in cui passa da 4 a 5 e da 5 a 6) e scrivilo nel registro.

## La premessa più rischiosa

**La regola del punto 2, applicata ovunque.** Se tessera e gestionale dicono livelli diversi per lo stesso cane, Davide al banco legge una cosa e il proprietario un'altra. Provala per prima: con le impostazioni sul demo, per un insieme di cani di prova, il livello calcolato dalla funzione condivisa, quello mostrato nel gestionale e quello mostrato sulla tessera devono coincidere.

## Cosa non è in questo incarico

- **Importare lo storico cartaceo.** Per i clienti storici si usa il livello assegnato a mano.
- **Un premio legato ai livelli** (CD-09 §9.5): decisione di Davide, non presa.
- **La data in cui un livello è stato raggiunto** (verifica 2): non esiste, e la tessera non festeggia.
- **Togliere le soglie dal cartoncino pubblico** (CD-09 §9.2): incarico a sé.
- **Il passaggio da una tessera all'altra** per chi ha più cani (CD-09 §9.6): una striscia per cane in Home basta.
- **`GH-106`** e l'atto B di `GH-103`.

## Invarianti

- **Senza le impostazioni nuove, nessun livello cambia** per nessun cane, nel gestionale e altrove.
- **Il proprietario non legge nessun importo e nessuna foto di riconoscimento** (`GH-103`, `GH-79`).
- **La barra a tre voci, la Home** salvo la striscia al posto dei punti, **le altre pagine del proprietario**: invariate.
- **Nessun colore nuovo** (CD-09 §2), nessuna classe tipografica scritta a mano (`GH-105`).
- **Il cartoncino pubblico e i QR stampati** non cambiano.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Dati di prova sul demo, ripristino a zero, impostazioni del demo ripristinate e rilette.

- **regola, senza impostazioni**: livelli di un insieme di cani di prova identici prima e dopo il tuo diff;
- **regola, con impostazioni** (inizio storico a 6,87 mesi fa): 3 visite → nessun livello; 4 → Bronzo; un cane con 12 visite in 6,87 mesi → **Argento, come con la regola di oggi**: la proiezione tocca solo il Bronzo;
- **ritorno alla regola di oggi**: con un inizio storico più vecchio di 12 mesi, la soglia del Bronzo è 6;
- **le date di cambio soglia**: quando passa da 4 a 5 e da 5 a 6, con l'inizio al 6/3/2026;
- **livello assegnato a mano e livello a punti**: mostrati sulla tessera come da CD-09 §7.5;
- **gestionale e tessera d'accordo** sullo stesso cane, per ogni stato di CD-09 §6;
- **QR**: decodificato da un'immagine della tessera e del cartoncino dello stesso cane, stesso contenuto;
- **modalità banco**: QR 300px su 375, fondo bianco pieno, un solo pulsante pieno; blocco dello schermo richiesto solo se disponibile, nessun testo che lo prometta;
- **icona sul telefono**: su iPhone non lo puoi provare tu, dichiaralo; manifest con `shortcuts` valido;
- **foto**: nessun `photo_url` letto da `src/apps/customer`, ricerca esaustiva;
- **a 375px e a 1365px** (tessera centrata in colonna di 390px): nessuno sbordamento, bersagli come CD-09 §3;
- build verde; **suite RLS**: non serve rieseguirla se non tocchi letture del proprietario oltre a quelle di oggi. Se aggiungi una lettura, rieseguila.

## Cosa consegnare a Cowork

In cima al registro: **il testo esatto delle due impostazioni** da scrivere nel prodotto, e la query con cui Cowork verifica dopo l'atto quanti cani hanno il Bronzo.

## Passo finale — lo guarda Luigi, con Davide

1. Apri l'app del proprietario di un cane con quattro visite: la tessera dice Bronzo, e il gestionale dice lo stesso?
2. Premi «Mostra al banco» e fai leggere il QR al telefono di Davide: si apre la scheda del cane giusto?
3. Aggiungi la tessera alla schermata del telefono: l'icona apre la tessera?
4. **E la domanda che conta**: un cliente che viene da anni, e che l'app conosce da marzo, si riconosce in quella tessera?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Correzione — Cowork, 1 ottobre 2026

La prima stesura di questo incarico conteneva un errore di Cowork, trovato da Codex all'ingresso: affermava che l'Argento «chiede la stessa frequenza mantenuta per due anni» e prescriveva come controprova che 12 visite in 6,87 mesi dessero Bronzo e non Argento. **È falso per la regola di oggi**: la finestra di 24 mesi è un tetto, non un'anzianità minima, e quella prova avrebbe imposto un vincolo di durata che Luigi non ha deciso.

**Vale il testo corretto sopra**: Argento e Oro identici a oggi; la proiezione riguarda solo il Bronzo. **Non costruire nessun vincolo di durata.** Se ritieni che uno serva, proponilo nel registro come domanda per Luigi.

Errore di chi scrive l'incarico, contato come **recupero** (canone §3, «Come si misura l'effetto»): l'informazione era leggibile in `fidelity.js` prima di scrivere.

## Correzione 2 — Cowork, 1 ottobre 2026: dove stanno le impostazioni

Codex ha trovato che il database rifiuta `project_short_history` dentro `fidelity_tiers`: il vincolo `tenants_fidelity_tiers_valid` (`CHECK (is_valid_fidelity_tiers(settings -> 'fidelity_tiers'))`, presente anche nel prodotto, letto da Cowork il 1/10) non ammette chiavi in più. **Il conflitto l'ha creato questo incarico**, che prescriveva quella forma e vietava le migrazioni. Codex ha fatto bene a non aggirarlo.

**Le impostazioni nuove stanno fuori da `fidelity_tiers`**, in una chiave sola di primo livello che nessun vincolo oggi controlla:

```json
"fidelity_projection": {
  "history_start": "2026-03-06",
  "tiers": ["bronze"]
}
```

Vale tutto il resto del punto 2. `fidelity_tiers` **non si tocca**. Se `fidelity_projection` manca, ha una data non valida o una lista vuota, **nessuna proiezione**: comportamento identico a oggi. Il controllo di validità lo fa la funzione condivisa; **nessuna migrazione** in questo incarico. Un vincolo sul database per la chiave nuova, se servirà, sarà un atto di Cowork a parte.

Nella consegna a Cowork riporta il testo esatto di questa chiave per il prodotto.

## Chiusura

Registro in `docs/consegne/GH-107-la-tessera-del-cane-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
