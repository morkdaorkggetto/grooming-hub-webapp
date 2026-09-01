# Incarico GH-56 — Il peso del fatto, e le sue parole

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessun dato, nessuna policy.**
**Superficie:** `/calendar`. File attesi: `components/CalendarKit.jsx`, `pages/Calendar.css`. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; nessun push, merge o deploy.

> **Correzione di `GH-55`, non suo difetto.** Entrambe le voci nascono da istruzioni sbagliate mie. `GH-55` è stato eseguito alla lettera: era la lettera a essere storta.

---

## 1 — Il fatto arretra, non avanza

`GH-55` chiedeva «pieno, compatto, **nel neutro forte**». Il neutro più forte della tavolozza è quasi nero, e il risultato è `rgb(43, 37, 37)` con testo chiaro: **un blocco scuro, l'elemento più rumoroso della pagina.**

Due cose sbagliate insieme.

**La gerarchia è invertita.** Il peso visivo deve seguire **quanto si può agire su una cosa**, non a quale categoria appartiene. Un appuntamento è agibile: si sposta, si annulla, si conferma. Una lavorazione già registrata è **inerte** — è successa, non chiede niente a nessuno. È diventata la cosa che grida di più.

**E parla un dialetto suo.** Tutta la veste lavora a **campiture leggere**. Quel blocco è l'unico elemento pieno e scuro della vista: anche col peso giusto, resterebbe fuori lingua.

**Correzione.** La campitura **resta** — distingue, ed è ciò che serve — ma diventa **leggera**, nella stessa famiglia di velatura già usata dal riquadro del margine, con il testo nel secondario. L'appuntamento conserva contorno, barra d'accento e contrasto pieno.

Vale per **entrambe** le rese introdotte da `GH-55`: i puntini e la riga del piede in settimana, e le righe distese del modo giorno.

**Invariante nuovo, da tenere oltre questo giro:**

> **Il peso visivo segue l'agibilità, non la categoria.** Fra due elementi, pesa di più quello su cui si può agire. Ciò che è già accaduto si distingue **arretrando**.

## 2 — Le parole: chi arriva non è un intruso

Oggi la vista dice **«entrati senza appuntamento»**, e definisce il cliente **per ciò che gli manca** — in un salone dove per novanta giorni su novanta quello era il modo normale di venire. Il verbo «entrato» fa poi del cane il soggetto di un'intrusione: il salone non ha *subito* un ingresso, **ha preso in carico un cane sul momento**.

**Tre occorrenze, tutte in `CalendarKit.jsx`** (righe 64, 166, 213 alla base di questo mandato). **Nessuna nell'app clienti**: verificato, il cliente non legge mai questa formula.

**Nuovo lessico, e non ne esistono altre forme:**

| dove | prima | dopo |
|---|---|---|
| riepilogo in alto | `5 entrati senza appuntamento` | **`5 lavorati sul momento`** · `1 lavorato sul momento` |
| piede della giornata | `5 entrati senza appuntamento` | **`5 lavorati sul momento`** |
| intestazione modo giorno | `Entrati senza appuntamento` — `5 pet, nessuna ora` | **`Lavorati sul momento`** — `5 pet, **senza ora fissata**` |
| margine | `1 libera per chi entra` | **`1 libera per chi arriva`** |

**Perché due forme e non una.** Le prime tre parlano di **cani già passati**; il margine parla di **spazio futuro**, di gente che arriverà. Un oggetto solo, due tempi verbali: forma piena *lavorati sul momento*, forma corta *chi arriva*. **Nessun terzo nome**, che è l'errore già corretto in `GH-55`.

**E «senza ora fissata» al posto di «nessuna ora»**: anche lì c'era un buco al posto di un fatto. L'ora non manca — non è stata fissata, perché non serviva.

> **Perché «sul momento» e non «al banco».** Al banco arriva anche chi viene *solo a prenotare* per la settimana dopo: è il sottotitolo stesso della pagina. Usare la stessa parola per le due cose toglierebbe alla vista la distinzione per cui è nata.

---

## Invarianti

**Nessun dato toccato, nessuna migrazione, nessuna policy, nessuna query nuova.** Se ti trovi a scrivere SQL, ti sei perso.

**Nessun colore nuovo**, e nessuna tinta inventata: la velatura è quella che il riquadro del margine usa già.

**La parola «entrato» sparisce** da questa vista in ogni sua forma. Restano in uso **solo** `lavorati sul momento` e `chi arriva`.

**Resta intatto** tutto ciò che `GH-54` e `GH-55` hanno fissato: la grana è la mezza giornata; le lavorazioni senza ora non entrano mai in una fascia; il margine non si toglie quando la settimana è vuota; sotto i 640px `flex-shrink: 0` sulle schede e `min-height: 0` sul contenitore, **o il piede sparisce in silenzio**.

**Scostamento da dichiarare**: la voce 3 di `GH-55` è **sostituita**, non affinata. Nel registro va scritto così, perché il materiale in `design_handoff_staff_app/` porta ancora la resa scura.

## Controprove

Dichiara nel registro, misurate nel browser contro i componenti reali con fixture **solo in memoria**, rimosse a fine sessione:

- il fatto e il piano **restano distinguibili senza leggere**, ma il campione di colore del fatto è ora una **velatura chiara** con testo secondario: riporta i due valori misurati;
- **nessun elemento della vista** ha una campitura più scura di quelle già presenti prima di `GH-55`;
- **zero occorrenze** di `entrat`, `nessuna ora`, `chi entra` nell'app staff; presenti **solo** `lavorati sul momento`, `lavorato sul momento`, `chi arriva`, `senza ora fissata`;
- **singolare e plurale** corretti in tutti e quattro i punti, con 1 e con 5;
- **l'app clienti non contiene** nessuna delle due formule — riconferma;
- il **piede non sparisce** a 375px, e il contrasto del testo sulla velatura resta leggibile;
- build verde. Suite RLS: **da non rieseguire** — questa vista non tocca policy né query. Dichiara che l'ultima misura viva resta quella di `GH-54` (60 PASS), **e che è ora vecchia di due giri**.

## Passo finale — lo guarda Luigi (regola 5)

Due aperture, sul computer e poi sul telefono:

1. **una giornata con appuntamenti e lavorazioni insieme**: si distinguono ancora, e questa volta **è l'appuntamento a pesare di più**?
2. **il piede di una giornata piena**: la riga somiglia al resto della veste, o è ancora un corpo estraneo?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-56-il-peso-del-fatto-e-le-sue-parole-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
