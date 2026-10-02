# CD-11 · Handoff — la tessera apre l'app

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 2 ottobre 2026
**Esito:** composizione. Non codice. Tutto CD-10 resta valido, testata a parte.
**Superficie:** `apps/customer/pages/Home.jsx`.

---

## 1 · I file

| File | Cosa contiene |
|---|---|
| `cd11-home-kit.jsx` | `Testata11`, `Avviso`, `Foglio`, `Richiesta`, `HomeUno`, `HomePiu`, `Piega` |
| `cd11-home-note.jsx` | Le tavole: misure, la scelta, l'avviso, cosa non torna |
| `CD-11 La Tessera Apre L'App.html` | La tela |

**Dipendenze:** quelle di CD-10 più `cd10-tessera-kit.jsx` (riusa `Tessera10`, `BancoBtn`, `Invito10`, `HomeStrip10`, `G10`). Nessun file già consegnato è stato modificato.

`Piega` e `Ghost11` servono solo alla tela: non vanno in produzione.

---

## 2 · La decisione

**La tessera non è una pagina davanti alla Home: è la cima della Home**, per chi ha un cane solo. L'app si apre su Home come sempre.

| | Prima (CD-10) | Dopo (CD-11) |
|---|---|---|
| Prima pagina, un cane | Home, tessera in fondo come striscia | **Home con la tessera intera in cima** |
| Prima pagina, più cani | Home, strisce in fondo | **Home: richieste da fare, poi strisce, poi il resto** |
| Barra | 3 voci | **3 voci, Home accesa** |
| Testata (un cane) | `44 \| ZavaRoby \| 44` con «indietro» | **stessa griglia, colonne vuote, niente «indietro»** |
| Testata pagina tessera (più cani) | con «indietro» | **invariata** |
| Saluto «Buongiorno, …» (un cane) | c'era | **tolto** |
| Striscia tessera in Home (un cane) | c'era | **tolta** (la tessera è già in cima) |
| Schede richieste da fare (un cane) | nella Home | **tolte**: le fa l'avviso |
| Schede richieste da fare (più cani) | nella Home | **in cima alla Home**, con il nome del cane |
| QR sulla tessera | solo da guardare | **toccabile**: apre la modalità banco |
| Invito «Tienila a portata» | sotto il pulsante | **invariato**, sotto il pulsante |

Così la barra resta a tre voci senza una quarta, e la testata non ha bisogno di un «indietro» che porterebbe avanti.

---

## 3 · L'avviso

**Dove:** tra la testata e la tessera, larghezza della tessera, gap 12 sotto.
**Forma:** alto **56**, raggio 14, fondo `--color-warning-bg`, bordo 1px `--color-warning-border`. Campanella 17px in `--color-warning-text` su riquadro bianco 32×32 raggio 10. Testo **14px / 650 in `--color-warning-text`, una riga**, `nowrap` con ellissi. Freccia a destra.

| Caso | Testo |
|---|---|
| la data chiesta non è disponibile | **Scegli un'altra data** |
| il salone ha proposto altri orari | **Scegli un orario** |
| più d'una insieme | **Due richieste aspettano te** + numero sulla campanella (pallino 18px, `--color-warning-text`) |

**Senza il nome del cane:** compare solo a chi ha un cane solo, e il nome è già scritto grande nella tessera subito sotto. Con il nome, un nome medio («Briciola») veniva tagliato dall'ellissi.

**Mai una pila:** più richieste = un avviso solo.
**Non ha la ×:** sparisce quando il gesto è fatto.
**Non è un avviso:** una richiesta in attesa del salone, un appuntamento confermato.

---

## 4 · Il tocco fa il gesto — il foglio

Il tocco sull'avviso apre **un foglio dal basso** sopra la Home: velo `rgba(43,37,37,.42)`, foglio `--color-surface-main` raggio 22 in alto, maniglia 40×4.

| Caso | Contenuto del foglio |
|---|---|
| data | titolo «Scegli un'altra data», sotto «La data chiesta non è disponibile.» · giorni · fasce mattina/pomeriggio · **Invia la richiesta** (pieno, 54) · Annulla |
| orari | titolo «Scegli un orario», sotto «Il salone propone questi due.» · i due orari, da toccare (54) · «Nessuno va bene: chiedi un'altra data» · Annulla |
| più d'una | titolo «Due richieste aspettano te» · una riga per richiesta (60), col gesto e il perché, che apre il foglio di quel caso · Annulla |

**Annulla chiude il foglio, non l'avviso.**

La scelta di giorni e fasce è composta in forma semplice: **la prende Codex dal flusso che esiste già** in `PendingRequest`.

---

## 5 · Le misure — prese sul rendering

**Primo schermo** = dall'inizio del contenuto (stato + testata 56 + 4) al bordo alto della barra (64). Misure fino al fondo di «Mostra al banco».

| Fino al pulsante | 375 × 812 · 664 | 375 × 667 · 519 | 320 × 568 · 420 |
|---|---|---|---|
| tessera senza ritratto · 482 | entra · 182 | entra · 37 | fuori · 62 |
| + l'avviso · 550 | **entra · 114** | **fuori · 31** | fuori · 130 |
| ritratto e livello · 665 | fuori · 1 | fuori · 146 | fuori · 245 |

**Su 667 con l'avviso il QR finisce a 536, sopra la barra a 603**: per questo il QR è toccabile e apre la modalità banco. L'invito sta sotto il pulsante e non sposta niente.

---

## 6 · Cosa NON cambia

1. **Tutto CD-10**: tessera, griglia, ritmo, valori, insegne.
2. **La modalità banco.**
3. **Le sedici voci del §7 di CD-09.**
4. **Nessun colore nuovo**: l'avviso usa i token warning già in uso dalla coda richieste di CD-01.
5. **La pagina della tessera di CD-10** resta per chi ha più cani, aperta da una striscia, **con il suo «indietro»**.

---

## 7 · Campi da verificare

| Campo | Cosa serve |
|---|---|
| ⚠ **richieste «da fare» di un cane** | la definizione esatta la prende Codex dal codice; i due casi composti sono quelli che chiedono un gesto |
| ⚠ **numero di cani del proprietario** | decide quale Home si apre |
| ⚠ **QR toccabile** | apre la stessa modalità banco del pulsante, nessuna modalità nuova |

---

## 8 · Cosa non torna

**8.1 · Sui telefoni da 667 con l'avviso «Mostra al banco» va 31px sotto la barra.** Il QR toccabile lo copre, perché resta nel primo schermo. Ma chi non sa che il codice si tocca deve scorrere. L'alternativa sarebbe stringere la tessera quando c'è un avviso, e CD-10 dice di non toccarla.

**8.2 · La tessera con ritratto e livello è al limite già su 812** (il pulsante tocca la barra), e su 667 resta sotto anche il QR. È la minoranza; se cresce, da rivedere è il ritratto da 88 quando c'è anche il livello.

**8.3 · Chi ha un cane solo perde il saluto.** Tolto per misura: con il saluto il pulsante usciva anche su 812 con l'avviso. Se il salone ci tiene, il posto è la testata.

**8.4 · Con un cane solo, in Home non resta traccia della richiesta a parte l'avviso.** È voluto: la scheda ripeteva l'avviso. L'avviso non si chiude finché il gesto non è fatto.

---

## Verifiche

- Console pulita, nessun colore nuovo.
- Misure ricalcolate **sul rendering** dopo la prima stesura, che le stimava dai valori della griglia: su 667 lo scarto vero era più del doppio. Tabella, etichette e note sono allineate ai numeri misurati.
- Le modifiche richieste da Luigi il 2/10 sono incluse: avviso su una riga senza nome, scheda in basso senza nome per un cane solo, poi tolta del tutto perché l'avviso fa il gesto, segnaposto della Home ridotto a una riga.
