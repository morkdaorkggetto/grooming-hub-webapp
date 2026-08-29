# CD-04 · Handoff — la card pubblica del cane

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 29 agosto 2026
**Esito:** composizione. Non codice. Realizzerà Codex insieme al mandato QR.
**Rotta:** `/client-card/:qrToken`, componente `PublicPetCard`. **Nessuna rotta nuova.**
**Contratto «prima» misurato su:** `PublicPetCard.jsx` come descritto nel brief (undici colori, tre barre) — non su una mia work-directory.

**Nota di registro:** è la prima pagina di questo progetto che non parla a chi ci lavora dentro. Vocabolario **app clienti**, voce del salone: «noi», mai «voi».

---

## 1 · I file di composizione

| File | Cosa contiene |
|---|---|
| `cd04-card-kit.jsx` | I componenti nuovi: `Medallion`, `TierMark`, `RelationLine`, `BigGesture`, `CardShell`, `SalonMark` |
| `cd04-card-viste.jsx` | `CardBody` e i cinque stati + la ricostruzione del «prima» |
| `cd04-card-note.jsx` | Le tavole: quattro domande, fedeltà, undici colori, campi ⚠ |
| `CD-04 Card Pubblica.html` | Il canvas che monta tutto |

**Dipendenze, tutte già consegnate:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo `QRow`).

`CardPrimaVeste` in `cd04-card-viste.jsx` **è la ricostruzione della pagina attuale**, con i suoi undici letterali dentro. Serve al confronto e **non va portata in produzione**.

---

## 2 · Colori — zero token nuovi

**Nessun colore nuovo, e nemmeno un token nuovo.** I tre metalli erano già dichiarati dal giro GH-15: `--tier-bronze`, `--tier-silver`, `--tier-gold`.

Gli undici letterali, uno per uno:

| Letterale | Dove va |
|---|---|
| `#ead7c5` | **sparito** — era il fondo del blocco fedeltà |
| `#F4E3A1` | **sparito** — era il fondo delle barre |
| `#fffaf6` | `--color-bg-main` |
| `#f0e7de` | `--gh-tint` |
| `#EBC9A7` | `--color-border` |
| `#E5E7EB` | `--tier-silver` — **era un grigio d'interfaccia Tailwind**, il token è un argento vero |
| `#cd7f32` | `--tier-bronze` |
| `#d4a017` | `--tier-gold` |
| `#94a3b8` | `--color-text-secondary` |
| `#ffffff` | `--color-surface-main` |
| `#16a34a` | `--color-primary` — vedi §7.5 |

Due `rgba` inline nel kit, entrambi da `--color-primary`: `rgba(111,151,146,.30)` (anello del medaglione senza livello, e bordo della scheda criterio). **Se volete zero rgba, è un settimo token** — ma stavolta è uno solo e non ho voluto dichiararlo per conto vostro.

---

## 3 · Densità — è l'unica pagina che NON eredita la scala del gestionale

La grammatica densa vale al banco. **Qui vale l'opposto**, e va detto esplicitamente perché è una regola invertita dentro lo stesso prodotto.

| Elemento | Valore |
|---|---:|
| Gesto (pulsante pieno larghezza) | **54** |
| Nome del cane | 30 serif |
| Insegna del salone | 21 serif |
| Riga della relazione | 15,5 serif |
| Medaglione | 132 |
| Testo minimo in pagina | 11 (solo la nota di chiusura) |

**Nessun target sotto 54px** — non 44. Qui non c'è un banco: c'è una mano sola che tiene il telefono e un cane che tira.

La colonna è larga **al massimo 390px anche a schermo largo**. Non è un vincolo tecnico: è la forma della card.

---

## 4 · Componenti

**Riusati senza toccarli:** `GH`, `Phone`, `Eyebrow`, `Icon`, `RefCard`, `QRow`.

**Da estendere:** nessuno.

**Nuovi — sei:**

| Nome | Cosa fa |
|---|---|
| `SalonMark` | L'insegna in testa: chi ha inquadrato non sa dove è finito |
| `Medallion` | Il ritratto. Cornice progettata **per il caso senza foto**, che è l'85% |
| `TierMark` | Il livello come segno accanto al nome, non come blocco |
| `RelationLine` | La riga che sostituisce le tre barre. Due forme: con visite, a zero |
| `BigGesture` | Il gesto: 54px, larghezza piena, con sottotitolo |
| `CardShell` | Una colonna sola, sempre. A schermo largo si centra |

**Nessuno stato nuovo**, nessuna tabella di stati: questa pagina non ha stati di riga.

---

## 5 · Responsive — non c'è un punto di rottura, e non è una dimenticanza

**Il telefono è il caso normale.** Composta a 390 e allargata, che è **l'inverso** della regola del gestionale.

A schermo largo la card **si centra dentro un cartoncino** (bordo, raggio 22, fondo `--color-surface-main`) e non si divide in due colonne: un desktop non è un motivo per riempire la larghezza, è la stessa card guardata da un posto insolito.

**Attenzione all'implementazione:** nel caso telefono la colonna deve **estendersi in altezza** (`align-items: stretch` sul contenitore, `min-height: 100%` sulla colonna), altrimenti il `margin-top: auto` del blocco gesti non ha spazio da distribuire e il pulsante WhatsApp resta a metà schermo. È il difetto che il mio primo giro conteneva — su una pagina il cui argomento è *un gesto a portata di pollice*, il gesto stava fuori portata.

---

## 6 · Stati — cinque, e sono stati di contenuto

| Stato | Cosa cambia |
|---|---|
| **Norma** — nessuna foto, alcune visite | il caso dell'85%. Medaglione col glifo, anello neutro |
| **Zero visite** | la riga diventa «Non ci siamo ancora conosciuti. La prima volta è la prossima.» |
| **Con foto** | stessa cornice, dentro la foto. Il medaglione non cambia forma |
| **Con livello** | anello del medaglione in metallo + `TierMark` accanto al nome |
| **Con accesso attivo** | cambia **solo il secondo gesto**: «Entra nella sua pagina» invece di «Vedi le visite di…» |

**Caricamento:** non composto. La pagina è quattro dati: se serve, uno scheletro del medaglione e due righe basta — non `SkeletonRow` del gestionale, che ha la geometria di una tabella.

**Errore / token non valido:** ⚠ **non composto, e lo dichiaro come mancanza mia.** Un cartoncino perso o un token revocato porta qui, e questa pagina non ha niente da dire in quel caso. Va progettato prima di andare in produzione: è l'unico ingresso pubblico del prodotto.

---

## 7 · Cosa NON cambia — deliberato

1. **Prima il nome del salone, poi il cane.** Chi ha inquadrato un cartoncino non sa dove è finito. Non è un dettaglio di gerarchia: è la prima cosa che rende la pagina credibile.
2. **Il nome del cane non è l'informazione, è la prova.** Serve a dimostrare che il riconoscimento è vero, non a informare chi già lo sa. Non va promosso a titolo della pagina.
3. **Le tre barre non tornano.** La riga della relazione dice quello che è già vero. Non aggiungere «ancora 9 visite per il Bronzo» accanto: è la stessa distanza in caratteri più piccoli.
4. **I livelli restano fuori dal centro.** Un segno in metallo accanto al nome, per chi ce l'ha davvero — oggi una persona su 282.
5. **Un solo pulsante pieno.** Il secondo gesto è a bordo, non compete. Se diventano due pieni, la pagina non ha più un obiettivo.
6. **Niente verde di WhatsApp** (`#25D366`). Questa card è l'unica superficie del salone che il cliente vede per mesi: dare il suo unico pulsante pieno al colore di un'altra azienda è una perdita. **Dove porta lo dicono il glifo, la parola «WhatsApp» e il sottotitolo** — tre segnali bastano.
7. **Il medaglione è progettato per il caso senza foto.** Non è un placeholder in attesa: è la forma normale, e la foto è l'eccezione che ci entra dentro.
8. **Target a 54px, non 44.**
9. **Massimo 390px di colonna, anche su desktop.**
10. **Non si nominano** operatore, prossima visita, prezzo, servizio strutturato — **nemmeno come spazio vuoto**.
11. **La nota di chiusura resta** («Questo cartoncino è di…»): è la sola riga che spiega a uno sconosciuto cos'ha in mano.

---

## 8 · Campi che potrebbero non esistere — 5 marcati ⚠

| Campo | Cosa serviva |
|---|---|
| ⚠ **il cliente ha un accesso attivo?** | la seconda versione del gesto. **Senza il dato si mostra sempre quella che spiega**: a chi ha l'accesso costa una riga, all'altro l'alternativa costerebbe l'intera offerta |
| ⚠ `MIN(visits.date)` | «la prima volta a marzo». Se non c'è, la riga perde il rimando e **resta valida** |
| ⚠ numero WhatsApp del salone | il pulsante esiste già, quindi il dato c'è: da confermare che sia **per tenant** e non fisso |
| ⚠ nome del salone | oggi è scritto in pagina? In SaaS multi-tenant deve venire dal tenant |
| ⚠ razza mancante (5 su 282) | la riga sotto il nome sparisce, il medaglione non si muove |

Dati per certi perché misurati da voi: nome, razza (277/282), foto (42/282), numero di visite, livello e progressione, nome del salone.

---

## 9 · Domande aperte — dichiarate, non risolte

**9.1 · Chi disegna il ritratto generico?**
È la regola per l'85% dei cani, e oggi è un glifo — un segnaposto di segnaposto. Serve **un'illustrazione vera, commissionata**, non un disegno fatto col codice. Il medaglione è dimensionato per riceverla.

**9.2 · Il cartoncino può girare prima della prima visita?**
Ho composto la pagina per questo caso perché è il primo contatto per definizione. Se la card si consegna solo dopo la prima visita, «non ci siamo ancora conosciuti» non si vede mai. **È una domanda sul processo del salone, non sul disegno.**

**9.3 · «Vedi le visite di Nina» promette un elenco. L'area cliente lo mostra?**
Se non lo mostra, **cambia la parola, non la pagina**. Non prometto con un pulsante quello che non c'è dietro.

**9.4 · La card è la stessa per tutti i saloni in SaaS?**
Composta come card di **un** salone, con l'insegna in testa. Se il tenant porta un suo colore, l'unico punto che cambia è il pulsante pieno — **un'altra ragione per non aver usato il verde di WhatsApp**.

**9.5 · La pagina è pubblica per costruzione, e nessuno l'ha ancora chiamata così.**
Chi inquadra la card di un cane che non è suo vede nome, razza, quante volte è venuto. Il token è opaco, quindi il rischio è il cartoncino perso, non l'indirizzo indovinato. **Non ho toccato nulla, ma lo nomino.**

**9.6 · Lo stato «token non valido» non esiste.** Vedi §6.

---

## 10 · Le parole — e la fedeltà

**«Scrivi a Grooming Hub» → «Scrivici su WhatsApp»**, con sottotitolo «rispondiamo qui, non su moduli». Voce del salone («scrivici»), canale nominato, e il sottotitolo dice **come si lavora** — che è la cosa che il cliente deve capire.

**«Area riservata» → «Vedi le visite di {nome}»**, sottotitolo «visite, promemoria, richieste di appuntamento». «Area riservata» è il registro di un ufficio: non dice cosa c'è dentro, e chi legge non sa ancora che esiste un'area. La nuova formula **nomina il contenuto** e usa il nome del cane, che è la cosa a cui il cliente tiene.

Per chi ha già l'accesso: **«Entra nella sua pagina»**, senza sottotitolo. Chi c'è già non ha bisogno che gli si spieghi.

**«Livello Base · 0 / 12» → «È venuto 3 volte da noi».** Con, sotto, «la prima volta a marzo».

**A zero visite: «Non ci siamo ancora conosciuti. La prima volta è la prossima.»**

### Cosa dovrebbero valere le soglie — per Luigi, da portare al salone

Non è una decisione mia, ma il criterio sì:

> **Una soglia è una promessa solo se qualcuno l'ha già superata.** Finché nessuno l'ha fatto, è un annuncio.

| Livello | Oggi | Proposta | A 49 giorni | Chi ci arriva oggi |
|---|---:|---:|---|---|
| Bronzo | 12 | **3** | ≈ 5 mesi | alcuni, subito |
| Argento | 24 | **6** | ≈ 8 mesi | uno, subito |
| Oro | 36 | **10** | ≈ 1 anno e 3 mesi | nessuno, ma è a vista |

Il criterio non è «più facile»: è che **il giorno in cui il salone cambia le soglie, qualcuno diventa Argento** — e i livelli smettono di essere un'idea e diventano una cosa che si vede in negozio.

**Con le soglie attuali il Bronzo sta a un anno e sette mesi**, cioè oltre l'orizzonte in cui una persona ricorda di aver iniziato qualcosa.

Se il salone vuole soglie alte proprio perché premino pochi, la scelta è legittima — **ma allora il posto di quella promessa non è la prima pagina che un estraneo vede**: è dentro, dopo l'accesso, dove chi c'è già può ambire.

---

## Verifiche fatte prima di consegnare

- Console pulita. Tutti i token risolvono, compresi i tre `--tier-*` e i sei `--gh-*`: **la dichiarazione «zero token nuovi» è verificata**, non asserita.
- Nessun artboard tagliato (13 su 13).
- **Difetto trovato e corretto:** la colonna non si estendeva in altezza, quindi il blocco gesti non si ancorava in basso e il pulsante WhatsApp restava a metà schermo con un terzo di telefono vuoto sotto. Vedi §5 — è una nota di implementazione, non solo una mia correzione.
