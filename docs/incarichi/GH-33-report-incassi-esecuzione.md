# Incarico GH-33 — Il report incassi: esecuzione della composizione CD-02

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026, sera
**Realizza:** la composizione `CD-02`, consegnata da Claude Design.
**Rotta:** `/reports/weekly`, componente `src/apps/staff/pages/WeeklyRevenue.jsx`. **Nessuna rotta nuova.**

> Dichiara le invarianti, non la procedura. La composizione è già decisa da CD-02: qui è scritto **cosa deve essere vero** quando hai finito, e cosa non puoi violare.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push, nessun merge. **Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)**. La produzione è fuori perimetro e non va né letta né scritta: la migrazione è avvenuta stasera e non si tocca.

## Dove sono i materiali

`/Users/luigimaisto/Desktop/grooming-hub-web/Prototipo/CD-02-consegna/` — **fuori dal worktree**:

| File | Cosa contiene |
|---|---|
| `CD-02-handoff.md` | l'handoff, dieci sezioni: colori, densità, componenti, responsive, stati, cosa non cambia, campi ⚠, domande, parole |
| `cd02-report-kit.jsx` | i componenti nuovi |
| `cd02-report-viste.jsx` | le viste: settimana da 1, da 58, futura, media, caricamento, telefono |
| `cd02-report-note.jsx` | le tavole delle decisioni |
| `CD-02 Report Incassi.html` | il canvas che monta tutto |

**Portali dentro il repo**: l'handoff e i file di composizione vanno versionati in `design_handoff_staff_app/`, come è stato fatto per `GH-15-handoff.md`. Un materiale che vive solo sulla Scrivania non esiste.

## Perché questa pagina conta più di quanto sembri

È **l'ultima superficie con la veste vecchia**, e da stasera gira sui dati veri della produzione. È anche l'**unico consumatore rimasto di `AppHeader`**: verificato: `src/apps/staff/components/AppHeader.jsx` è importato da `WeeklyRevenue.jsx` e da nessun altro file.

## Verifica dei sei campi ⚠ — fatta da Cowork sullo schema reale

CD ne ha marcati sei come incerti. Misurati sulla produzione. **Due nomi sono sbagliati e vanno corretti, uno era dato per assente e invece esiste.**

| CD ha scritto | Realtà misurata | Cosa fai |
|---|---|---|
| ⚠ `visits.discount_percentage` | la colonna è **`discount_percent`** | usa il nome vero; il campo esiste ma vale 0 in **tutte** le 456 visite |
| `visits.amount` (dato per certo) | la colonna è **`cost`** | usa il nome vero |
| ⚠ `visits.issues` | esiste, **33 visite** valorizzate | pallino, mai etichetta, come dice CD |
| ⚠ `week.previous_total` | **non è una colonna**: va calcolato | calcolalo, non cercarlo |
| ⚠ `visits→client` | esiste via `pets → customers`: `first_name`, `last_name`, `phone` | usalo |
| ⚠ `visits→dog.breed` | esiste: `pets.breed` | usalo |
| ⚠ `salone.closing_days` | **ESISTE** — vedi sotto | applica la regola sotto |

### La regola dei giorni chiusi — questa è la correzione più importante

CD ha scritto: *«"chiuso" e "non è passato nessuno" non sono la stessa cosa, e oggi il dato non distingue. Se lo schema non lo regge, quella parola va tolta ovunque. Meglio muti che bugiardi.»*

**Lo schema lo regge, in parte.** `tenants.settings.booking_schedule` contiene, misurato:

```
timezone: "Europe/Rome"
closed_weekdays: ["sunday"]
closed_time_preferences: { monday: ["morning"] }
```

Quindi la parola «chiuso» è vera **solo per la domenica**, ed è dichiarata, non dedotta. Ne discendono tre invarianti:

- **domenica senza visite → «chiuso»**, letto da `closed_weekdays`, mai scritto a mano nel codice;
- **lunedì senza visite → NON «chiuso»**: il salone chiude solo la mattina, il pomeriggio è aperto. Trattino;
- **qualunque altro giorno vuoto → trattino, mai «chiuso»**. Le chiusure occasionali — festivi, Natale, Ferragosto, ponti — **non sono modellate**, per decisione esplicita di Luigi del 27 agosto: si gestiscono nel messaggio WhatsApp, non nello schema. Dedurle sarebbe inventare.

Se un giorno le chiusure occasionali entreranno nel modello, questa pagina le leggerà dallo stesso posto senza cambiare forma.

## Invarianti

**La pagina resta in sola lettura.** Nessuna scrittura, nessun gesto distruttivo, nessuna mutazione. Se ti trovi a scrivere una `update`, ti sei perso.

**Nessun dato inventato.** In particolare: nessun conteggio per servizio ricavato da `treatments`, che è testo libero e serve al salone anche come diario; nessuna ora dedotta, perché `visits.date` è di tipo `date`; nessuna categoria ricavata da `issues`.

**Il testo dei trattamenti si stampa verbatim.** Non normalizzato, non mappato, non ripulito. Comprese le righe che raccontano un'assenza — «non è venuto», «appuntamento rimandato per ciclo» — che restano in elenco a 0 € e non si filtrano.

**Nessun colore nuovo** oltre i tre di GH-15. L'arancione `#b45309`, oggi scritto a mano in `WeeklyRevenue.jsx`, **sparisce insieme al riquadro che coloriva** e non va ricondotto a un token.

> **Rilievo di CD, terza volta che lo solleva**: i derivati d'opacità sono usati inline come `rgba(...)` sparsi. Chiede se dichiararli una volta per tutte come token. **Decisione: sì, dichiarali** — sono sei valori, tutti derivati da `--color-primary` e `--color-border`, elencati al §2 dell'handoff. Il valore non cambia, cambia solo dove è scritto.

**Nessun target sotto 44px sotto i 640px.** Le quattro altezze nuove sono al §3 dell'handoff.

**I tre vuoti restano tre.** Settimana passata deserta, settimana futura, giorno vuoto dentro una settimana piena: CD li ha distinti deliberatamente e non vanno fusi.

**`AppHeader` sparisce.** Quando `WeeklyRevenue` non lo importa più, `src/apps/staff/components/AppHeader.jsx` va rimosso. **Prima di cancellarlo, riverifica tu che non abbia altri consumatori**: la mia misura è di stasera, e stasera ho sbagliato tre misure su quattro. Se ne trovi anche uno solo, **non cancellare e dichiaralo**.

## Cosa non decidi tu

Il §7 dell'handoff elenca dodici scelte dichiarate come deliberate — due numeri grandi invece di quattro, la riga del giorno che è la barra, la striscia senza assi, gli sconti fuori dai numeri grandi. **Non sono da migliorare.** Se una ti sembra sbagliata, fermati e dichiaralo invece di correggerla.

Il §10 cambia delle parole: «Report incassi» → **«Come è andata»**, «Visite registrate» → **«Cani passati»**, «Picco» → **«giorno pieno»**, «0%» → **«come la scorsa»**, e la stessa cosa sulla tessera in Dashboard. **Sono approvate.** Sono tutte reversibili in una stringa.

## Le domande di CD — risposte

| | Domanda | Risposta |
|---|---|---|
| 9.1 | «Chiuso» esiste come dato? | **Sì per la domenica**, no per il resto. Vedi la regola sopra |
| 9.2 | Il mese sarebbe più utile della settimana? | Probabilmente sì, ma è una rotta nuova: **fuori da questo mandato**, annotata come coda |
| 9.3 | Quante lavorazioni per tipo? | **Non ricavabile**, confermato. Servirebbe un campo strutturato nel form visita |
| 9.4 | Le righe di assenza contano come «cani passati»? | **Per ora sì**, come oggi. Cambiare il conteggio cambierebbe un numero che Davide ha già visto, e non è questo il giro per farlo. Da riportare a Luigi come domanda per il salone |
| 9.5 | Serve stampare o esportare? | **Non ora.** Nessuno l'ha chiesto |

## Controprove

Dichiara nel registro, misurate sul demo:

- le **sei viste** di `cd02-report-viste.jsx` rese dal vivo: settimana da 1 visita, da 58, futura, media, caricamento, telefono;
- la **domenica** che dice «chiuso» leggendolo da `booking_schedule`, e un **lunedì vuoto** che dice trattino;
- una **riga di assenza** che resta in elenco a 0 € con il suo testo verbatim;
- il **confronto con la settimana precedente** calcolato, incluso il caso «come la scorsa»;
- **nessun `rgba` inline** rimasto: tutti a token;
- `AppHeader` rimosso, oppure **non rimosso con la ragione misurata**;
- build verde; suite RLS invariata — questa pagina non tocca le policy, e se le tocca hai sbagliato strada.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Se qualcosa non torna

Se una vista non è realizzabile con i campi esistenti, **fermati e dichiaralo** invece di riempire il buco con un dato plausibile. Stasera abbiamo imparato a caro prezzo che un numero senza il momento in cui vale è una trappola: vale anche per un numero senza la colonna da cui viene.

## Chiusura

Registro in `docs/consegne/`, committato col codice, con i materiali di CD-02 portati in `design_handoff_staff_app/`. **Niente push, niente merge, niente deploy**: sono gesti di Luigi.
