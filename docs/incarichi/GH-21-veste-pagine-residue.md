# Incarico GH-21 — La veste delle pagine residue

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026

> **Mandato unico e ampio, senza passaggio da Claude Design.** Non è una scorciatoia: **il kit è già la composizione.** `gh15-staff.css`, `StaffKit`, `CalendarKit`, i token, le altezze, la scala tipografica, gli stati e il breakpoint unico esistono e sono stati applicati tre volte — Dashboard, scheda cliente, calendario. Qui non si compone nulla di nuovo: si applica una grammatica già decisa a schermate che il salone conosce.
>
> **Dichiara le invarianti, non la procedura.** Cosa deve essere vero alla fine è scritto; il metodo lo scegli tu.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessuna migration, nessun deploy, nessun push. Il demo è ammesso per le controprove.

## Perimetro

| File | Righe | Inline | Hex |
|---|---:|---:|---:|
| `pages/Contacts.jsx` | 553 | 52 | 5 |
| `pages/AddClient.jsx` | 535 | 33 | 1 |
| `pages/DailyAppointments.jsx` | 476 | 35 | **29** |
| `pages/CustomerRequests.jsx` | 468 | 36 | 5 |
| `components/Auth/LoginForm.jsx` | 455 | 25 | 0 |
| `pages/ClientCard.jsx` | 350 | 42 | 10 |
| `components/ClientCard.jsx` | 177 | 15 | 1 |
| `components/VisitCard.jsx` | 114 | 8 | 1 |

Circa 3.100 righe e 246 blocchi di stile inline. `DailyAppointments` è il caso peggiore per colori sparsi.

**Fuori perimetro, dichiarati e con motivo:**

- **`WeeklyRevenue.jsx`** — è un report, non un elenco: ha una grammatica che il kit non copre e Davide l'ha nominata fra le cose che gli interessano. Merita una composizione di Claude Design, non un'applicazione meccanica.
- **`CustomerPortal.jsx`, `CustomerLogin.jsx`, `CustomerInvite.jsx`, `PublicPetCard.jsx`** — non si toccano e non si rimuovono. I QR già stampati e gli inviti già spediti devono continuare a risolvere. La loro eventuale rimozione è un mandato a sé.
- L'intera app customer.

## La regola che governa tutto: stesse ossa, pelle nuova

Queste schermate, a differenza del calendario, **il salone le usa davvero**. Vale integralmente la regola di GH-16: nessuna riorganizzazione dei flussi, nessuna funzione spostata, rimossa o rinominata, nessuna route toccata. Cambia il peso visivo, non l'architettura dell'informazione.

Se durante il lavoro qualcosa ti sembra organizzato male, **segnalalo nel registro come proposta separata, non correggerlo.** Su Dashboard e scheda questa regola ha retto e non ci ha fatto perdere nulla.

## `AppHeader`: qui si chiude il debito

`AppHeader` è la vecchia fascia teal, ancora usata da `DailyAppointments`, `Contacts`, `AddClient`, `CustomerRequests` e `WeeklyRevenue`. In GH-17 non fu toccato di proposito, per non allargare il perimetro a pagine fuori mandato: si creò `Hero` locale al kit.

Adesso quel perimetro coincide quasi del tutto con i consumatori di `AppHeader`. **Le quattro pagine in perimetro passano a `Hero`.** `WeeklyRevenue` resta fuori, quindi `AppHeader` non si elimina: continua a servire lei finché non avrà la sua composizione. Dichiaralo nel registro come debito residuo con un solo consumatore rimasto.

## Invarianti — cosa deve essere vero alla fine

**Per ciascun file del perimetro**: zero blocchi `style={{` salvo valori realmente dinamici, zero colori letterali oltre i bianchi di sistema, layout uscito dal JSX e finito in CSS.

**Nessun colore nuovo.** I token esistenti conservano il nome `--color-*`; i soli tre nomi `--gh-*` ammessi restano `--gh-bridge`, `--gh-border-60`, `--gh-border-35`. **Non creare una famiglia `--gh-*` parallela ai token esistenti**: sarebbe introdurre colori nuovi sotto altro nome.

**Nessuna primitiva duplicata.** Il kit ha già `Hero`, `HeroButton`, `Panel`, `Field`, `SearchBar`, `Pill`, `StatStrip`, `AreaTile`, `ClientRow`, `VisitRow`, `StateTag`, `TierDot`, `EmptyState`, `ErrorState`, `SkeletonRow`, `Fab`, `DayChip`, `ScoreScale`. Se serve qualcosa che non c'è, **estendi** ciò che esiste; crea una primitiva nuova solo se davvero manca, e dichiaralo.

**Resa**: un solo breakpoint a 640px, nessun bersaglio interattivo sotto 44px sotto quella soglia, cifre tabulari su tutti i numeri, stati completi — caricamento con la geometria della riga vera, vuoto che insegna il gesto, errore che dice cosa resta salvo e **non svuota mai un form**.

**Comportamento**: nessuna query o mutazione modificata, nessun copy semantico cambiato. In particolare resta `da gestire` per le richieste pendenti, perché non esiste un flag di non letto.

**Dati**: nessun campo inventato. Se una schermata mostra qualcosa che lo schema non regge, fermati e dichiaralo — è successo tre volte con l'operatore delle visite e ogni volta è stato giusto fermarsi.

## Controprove

Dichiara nel registro, misurate: righe e stili inline prima e dopo per ciascun file; le tre larghezze — 1440, 390, 320 — senza overflow e senza bersagli sotto soglia; che ogni schermata è raggiungibile e funziona dal gesto reale, non dal codice; che nessuna route è cambiata; build verde.

Per `Contacts` e `AddClient` in particolare, prova il gesto completo dal demo — creazione di un cliente marcato e sua rimozione nella stessa sessione — perché passano dalla RPC atomica e un errore lì non è estetico.

Il metodo lo scegli tu. Se serve scrivere sul demo, fallo e ripulisci: **il demo è ammesso**.

## Se qualcosa non torna

Interruzione motivata: consegna valida. Vale soprattutto qui, dove il perimetro è largo — meglio consegnare cinque file su otto con il motivo del sesto che otto file frettolosi.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Un commit per file o per gruppo coerente, così ogni pezzo resti rivedibile da solo. Niente push.
