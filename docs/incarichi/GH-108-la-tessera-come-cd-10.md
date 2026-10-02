# Incarico GH-108 — La tessera come CD-10

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 ottobre 2026
**Nasce da:** `GH-107` (commit `8cdb70f`, non pubblicato) e dalla revisione di Claude Design **CD-10**, consegnata il 2/10 in `docs/consegne/CD-10-consegna/`.

**Perimetro**: le superfici della tessera create in `GH-107` (`src/apps/customer/pages/PetCard.jsx`, `components/PetCard*.jsx`, `components/pet-card.css`, `lib/petCardCopy.js`, la striscia in `pages/Home.jsx`) e `src/shared/ui/Icon.jsx` per l'icona `tessera`. **Nessun database, nessuna migrazione, nessuna policy.** Dati di prova temporanei sul demo **ammessi** per le controprove, con ripristino a zero. Nessun push, merge o deploy.

## Da dove nasce

Luigi, guardando la tessera di `GH-107`: *«ha un mucchio di difetti di allineamento e troppi cerchi»*. CD ha misurato le schermate vere e ha ricomposto. Dei difetti, **i cerchi e la frase doppia erano della composizione**, gli altri dell'esecuzione (handoff CD-10, §10).

## Il contratto

**`docs/consegne/CD-10-consegna/CD-10-handoff.md`**, con il kit `cd10-tessera-kit.jsx` e le tavole. Sostituisce CD-09 **solo dove lo dice**; per il resto CD-09 resta valido, modalità banco compresa (non si tocca).

Applica in particolare:

- **la griglia** del §3: margini, padding, testata `44 | 1fr | 44`, ritmo verticale riga per riga;
- **la tabella prima → dopo** del §4, elemento per elemento;
- **la frase dell'ultimo passo** del §5: «La prossima è quella del Bronzo.» / «{n} visite fatte, ne basta una.»;
- **le caselle che dividono sempre tutta la larghezza** del §6;
- **le decisioni del §7**, con i valori;
- **l'icona `tessera`**: è in `shared-ui.jsx` di CD (riga 35). Portala in `Icon.jsx` senza cambiarla.

## Decisioni di Luigi del 2/10, oltre all'handoff

1. **La soglia del Bronzo cresce per tutti** (handoff §9.1, accettato). Il 7/11 e il 7/1 chi è a un passo vede comparire una casella in più. **Nessuna soglia per singolo cane.** La tessera legge la soglia del giorno dalla funzione condivisa di `GH-107`, mai scritta nel codice (handoff §8).
2. **L'invito: il titolo di CD, e sotto le istruzioni per telefono.** CD propone «Tienila a portata. Aggiungila alla schermata Home.». Ma la verifica di Cowork del 24/9 (`CD-09-verifiche-cowork.md`, §5) stabilisce che **su iPhone e su Android il gesto è diverso**, e una frase sola è sbagliata per metà delle persone. Quindi: titolo e composizione centrata di CD; **sotto**, le istruzioni distinte per iPhone e Android che hai già scritto in `GH-107` (`InstallHint`). Sul computer, solo il titolo.
3. **La riga della finestra.** La data «dal 6 marzo 2026» non compare più (handoff §7.4). Quando la soglia **non è proiettata** compare la riga della finestra: «Contano le visite degli ultimi 12 mesi» per il Bronzo dal 6/3/2027, 24 per l'Argento, 36 per l'Oro come in CD-09. Mentre il Bronzo è proiettato, **solo** «Ogni visita da noi è un timbro.».

## La verifica prima di correggere

**Il pulsante più chiaro (handoff §9.3).** CD non sa se lo scostamento fosse vero o un effetto della cattura. **Prima di toccarlo misura** con `getComputedStyle`, nello stato di riposo, a 375px e a 1365px: colore di fondo, opacità dell'elemento e dei genitori, e se c'è uno stato `:hover` o `:focus` attivo. Dichiara la causa. Poi applica i valori del §7.1.

## Cosa non è in questo incarico

- **La modalità banco**: invariata.
- **La regola dei livelli**: invariata, è quella di `GH-107`.
- **Il gestionale**: nessun diff sotto `src/apps/staff`.
- **Una soglia ricordata per ogni cane** (§9.1 di CD): scartata da Luigi.

## Invarianti

- **Nessun colore nuovo**: solo token, `--color-primary-hover` per il pulsante.
- **Nessun cerchio nello stato normale** (senza ritratto, pochi timbri), come dice l'handoff §4.
- **Ritratto solo da `owner_photo_url`.**
- **Contrasto del pulsante**: l'etichetta resta **19px / 700 su una riga** (handoff §7.1). Se a 320px non ci sta, **fermati e dichiaralo**: non rimpicciolirla.
- **Le controprove di `GH-107`** restano vere: livelli concordi fra gestionale e tessera, QR identico al cartoncino, regola senza impostazioni identica a oggi.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **griglia**: misura sulle schermate nuove, a 320, 375 e 1365px, ogni distanza della tabella del §3; per ciascuna il valore di CD e il tuo. **Coincidono**, oppure dichiari lo scarto e il perché;
- **senza ritratto**: nessun elemento tondo nella tessera e nella striscia; conta gli elementi con `border-radius` ≥ metà del lato, risultato 0;
- **con ritratto**: riquadro 88×88, raggio 18, filo del livello;
- **caselle**: 4, 5 e 6 timbri occupano la **stessa larghezza**; 8 vanno su due righe; oltre 12 le tacche;
- **ultimo passo**: con 3 visite su 4, «La prossima è quella del Bronzo.» / «3 visite fatte, ne basta una.»;
- **cambio di soglia**: con la data simulata al 6/11 e al 7/11, stessi 3 timbri pieni: 4 caselle, poi 5; frase che passa a «La prossima è la quarta.»;
- **riga della finestra**: assente col Bronzo proiettato; presente dopo il 6/3/2027 simulato («ultimi 12 mesi»), con Argento («24») e Oro;
- **pulsante**: la causa del §9.3, poi i valori del §7.1; contrasto misurato;
- **indietro e titolo**: visibili e centrati a 320, 375, 1365;
- **invito**: titolo di CD; istruzioni iPhone e Android distinte; sul computer solo il titolo;
- **striscia in Home**: riquadro 48 raggio 12, miniatura o icona `tessera`;
- **le controprove di `GH-107`** ripetute con i suoi script: tutte PASS;
- **schermate** a 320, 375 e 1365px, stato senza ritratto e con ritratto, **accanto alla tavola di CD-10**;
- build verde. **Suite RLS: non serve**, nessuna lettura nuova.

## Passo finale — lo guarda Luigi

Apri la tessera sul telefono: **sembra quella della tavola di CD?** E quella di un cane con la foto?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-108-la-tessera-come-cd-10-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
