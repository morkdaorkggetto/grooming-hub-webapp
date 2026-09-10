# GH-76 - Una fascia chiusa non nasconde

## Esito e perimetro

**Concluso.** Il planning staff mostra appuntamenti e richieste presenti in una
fascia chiusa, senza trasformare la chiusura in disponibilita. Il modulo
`Nuovo appuntamento` avvisa quando data e ora violano una chiusura del tenant e
lascia comunque salvare l'eccezione.

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`; worktree `webapp/`;
  branch `main`.
- Base dichiarata: **`766e9fa57ee8c3070d73782d9356f1e1045318d7`**.
- Database: demo `qttpinkslhenxrsbhhhg` e produzione
  `azgehoseiojodltcttfb` **non letti e non scritti**. Fixture esclusivamente in
  memoria; scritture database misurate: **0**.
- Nessuna migration, colonna, policy, rotta, push, merge o deploy.
- Emendamento 1 applicato: nessun tratteggio aggiunto alle schede fuori
  orario.
- Commit locale: ricavabile con
  `git log -1 --format=%H -- docs/consegne/GH-76-una-fascia-chiusa-non-nasconde-esito.md`
  e comunicato a Luigi alla chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/staff/components/CalendarKit.jsx` | Le bande chiuse non vuote mostrano contenuto, occupazione e marcatura fuori orario; i giorni interamente chiusi espongono le fasce solo quando contengono elementi. |
| `src/apps/staff/pages/Calendar.jsx` | Il modulo manuale deriva l'avviso da `getDateClosure` e dalla fascia dell'ora selezionata. |
| `src/apps/staff/pages/Calendar.css` | Fondo neutro e dicitura fuori orario, senza nuovi colori e senza cambiare il bordo pieno. |
| `docs/consegne/GH-76-una-fascia-chiusa-non-nasconde-esito.md` | Questo registro. |
| `docs/consegne/evidenze/GH-76/gh76-measures.json` | Misure e asserzioni del banco browser in memoria. |
| `docs/consegne/evidenze/GH-76/gh76-week-1365.png` | Prova a schermo desktop del caso Cipino. |
| `docs/consegne/evidenze/GH-76/gh76-week-1024.png` | Controprova tablet. |
| `docs/consegne/evidenze/GH-76/gh76-week-375.png` | Controprova telefono. |

Impronte SHA-256 dei sorgenti provati: `CalendarKit.jsx`
`029b08d5d9a80b762b0e9a24c49ed56bd76216729dfd1954e74cb6ceadc33088`;
`Calendar.jsx`
`a11796d61136af77fa6467f042ac3af78b94f2c8e7c3032eb41c680e6a0ccbd0`;
`Calendar.css`
`66a131ff772842453df8ad3427ad5dbb56cc660290a268e678cd65b58b528780`.

## Implementazione

`PlanningBand` distingue la presenza reale dalla sola chiusura. Se la fascia e
vuota conserva esattamente intestazione e parola `chiuso`; se contiene
elementi aggiunge le schede e il picco di postazioni occupate, ma non rende ne
`Prenota qui` ne il margine per chi arriva. Appuntamenti e richieste ricevono
la dicitura `fuori orario` e il fondo neutro `var(--gh-absent)`.

Il giorno interamente chiuso conserva il pannello storico quando e vuoto. Solo
se una sua fascia contiene elementi rende le due mezze giornate, entrambe
chiuse, permettendo alla fascia non vuota di mostrare la propria scheda.

Il modulo manuale combina la funzione condivisa `getDateClosure` con
`getBookingTimeWindowForTime`: una chiusura giornaliera avvisa a ogni ora; una
chiusura parziale avvisa soltanto se l'ora ricade nella fascia indicata. Il
flusso di salvataggio e le guardie di capienza e doppione restano invariati.

## Controprove browser

Banco Vite con il vero `Calendar`, dipendenze applicative reali e soli
adattatori dati in memoria. Orologio fissato al 12 ottobre 2026, configurazione
tenant con lunedi mattina e domenica chiusi, capienza 2. Fixture: Cipino alle
10:30 e 17:00 di lunedi, Bella martedi alle 10:00, Sole domenica alle 10:30.

| Prova | Misura | Esito |
| --- | --- | --- |
| Caso vero | Intestazione `4 prenotati`; schede appuntamento visibili `4` a 1365, 1024 e 375 px; Cipino 10:30 presente sotto `chiuso` | PASS |
| Fascia chiusa vuota | HTML identico alla base: sola intestazione Mattina 9-13 e `p.gh-planning-closed`; body, occupazione, margine e prenotazione `0` | PASS |
| Giorno intero chiuso | Domenica rende Sole 10:30 nella Mattina chiusa con `fuori orario`; le fasce compaiono solo perche esiste contenuto | PASS |
| Marcatura | Fondo fuori orario `rgba(207, 193, 196, 0.12)` contro fondo ordinario trasparente; dicitura `fuori orario` | PASS |
| Bordi, Emendamento 1 | Fuori orario e ordinaria entrambi `solid/solid/solid/solid`, spessori `1/1/1/3 px`; richiesta `dashed`; margine `dashed` | PASS |
| Comandi chiusi | Nella Mattina chiusa non vuota: `Prenota qui = 0`, margine `= 0` a tutti i viewport | PASS |
| Postazioni | Mattina chiusa: `1/2 postazioni occupate` | PASS |
| Tre ingressi | Intestazione, `Prenota qui` di una fascia aperta e `Nuovo per lo stesso cliente` mostrano lo stesso avviso sulla Mattina chiusa | PASS |
| Avviso di fascia | `Attenzione: mattina chiusa. Puoi confermare comunque se è un’eccezione voluta.` | PASS |
| Avviso giornaliero | `Attenzione: il salone risulta chiuso in questo giorno. Puoi confermare comunque se è un’eccezione voluta.` | PASS |
| Eccezione salvabile | Il mock reale di `addAppointment` riceve 1 creazione alle 10:30 e la UI mostra `Appuntamento creato. Il prossimo orario libero è già pronto.` | PASS |
| Orario aperto | Lunedi alle 17:00: testo avviso vuoto | PASS |
| Responsive | Overflow pagina `0 px` a 1365, 1024 e 375; errori console `0` | PASS |
| Bersaglio nella chiusura | Scheda Cipino: `146,56 x 65`, `124,28 x 65`, `306 x 65 px`; sempre almeno 44 px | PASS |

La prova principale e
`docs/consegne/evidenze/GH-76/gh76-week-1365.png`, **1365 x 900 px**,
SHA-256
`ee5f449c9482f3a909a14856f722b397643294edc40c26479e911da0f0dd44f9`.
Le controprove sono `1024 x 900 px` e `375 x 2599 px`. Tutte le 12
asserzioni del banco risultano vere.

## Verifiche tecniche e tempi

- `npm run build`: **PASS**, 159 moduli, Vite 1,35 s e **1,84 s reali**;
  restano i soli avvisi preesistenti su Browserslist e chunk oltre 500 kB.
- `git diff --check`: **PASS**.
- Suite RLS non rieseguita, come ordinato: nessuna policy toccata. Ultima
  misura viva dichiarata dal mandato: GH-74, **60 PASS**, 8 settembre 2026.
- Banco browser finale: **12/12 PASS in 5,62 s reali**.

Due esecuzioni preliminari del solo banco non hanno prodotto misure valide: la
prima si e fermata su due pulsanti omonimi `Chiudi`; la seconda ha rivelato che
il root temporaneo non elaborava il reset Tailwind e aggiungeva ai viewport il
doppio del padding. Sono stati corretti rispettivamente il selettore e il
`box-sizing` del banco, senza modifiche applicative. Nessun rallentamento:
server pronto in 112 ms, browser finale 5,62 s, build 1,84 s.

## Pulizia, eccezioni e passo finale

Il file non tracciato `docs/incarichi/GH-76-emendamento-1.md` e materiale di
mandato ricevuto durante il giro: viene lasciato fuori dallo stage e dal
commit. Il banco temporaneo in `/private/tmp/gh76-harness` e il server sulla
porta 4196 sono stati smontati alla chiusura. Nessuna attivita fuori
istruzione e nessun dato persistente creato.

**A Luigi, dopo rilascio e ricarica dall'origine con Opzione-Comando-R:** sulla
settimana del 12 ottobre verifica che Cipino delle 10:30 sia visibile, che la
marcatura fuori orario sia inequivocabile e che il modulo avvisi senza
impedire il salvataggio. La domanda resta: **cosa non ti torna?**
