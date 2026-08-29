# Incarico GH-35 — Il modo mese: esecuzione della composizione CD-03

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Realizza:** la composizione `CD-03`, consegnata da Claude Design.
**Rotta:** sempre `/reports/weekly`. **Nessuna rotta nuova.**

> Dichiara le invarianti, non la procedura. La composizione è già decisa: qui è scritto cosa deve essere vero, cosa è stato verificato al posto tuo, e cosa non puoi violare.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun push, nessun merge, nessun deploy. **Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)**; la produzione non va né letta né scritta.

## Dipendenza da rispettare

**`GH-34` deve essere chiuso prima di iniziare.** Tocca `WeeklyRevenue.jsx`, lo stesso file di questo mandato. Se il suo registro non è in `docs/consegne/`, fermati e dichiaralo.

## Dove sono i materiali

`/Users/luigimaisto/Desktop/grooming-hub-web/Prototipo/CD-03-consegna/` — **fuori dal worktree**: `CD-03-handoff.md` più `cd03-mese-kit.jsx`, `cd03-mese-viste.jsx`, `cd03-mese-note.jsx` e il canvas. **Vanno versionati in `design_handoff_staff_app/`** come già fatto per CD-02.

---

## 0 · Prima di tutto: una correzione già visibile in produzione

CD segnala al §1 del suo handoff che `eur()`, in `cd02-report-kit.jsx`, usava `toLocaleString('it-IT')` senza ottenere il separatore delle migliaia.

**Confermato sull'app viva**: la pagina mostra «massimo **1495 €** nella settimana del 27 luglio». Deve leggersi **1.495 €**.

**Invariante**: gli importi a quattro cifre si leggono con il separatore delle migliaia, ovunque compaiano, senza dipendere dalla localizzazione dell'ambiente. La versione corretta di `eur()` è nella consegna CD-03: **usa quella**.

---

## Verifica dei sei campi ⚠ — fatta da Cowork sui dati reali

| CD ha marcato | Esito misurato |
|---|---|
| ⚠ `getWeeklyRevenueReport(from,to)` | **confermato**: accetta un intervallo qualsiasi, il mese è la stessa query |
| ⚠ seconda chiamata per il mese in corso | **corretto**: non è un campo, è una chiamata in più. Ammessa |
| ⚠ giorni lavorati per settimana | **confermato**: `DISTINCT` su `visits.date`, non è una colonna |
| ⚠ giorni del mese nel rapporto | **risolto**, vedi sotto |
| ⚠ `booking_schedule` | **esiste**: `closed_weekdays: ["sunday"]`, `closed_time_preferences: {monday:["morning"]}`, `timezone: Europe/Rome` |
| ⚠ primo giorno di storia | **correzione: è il 6 marzo 2026, non il 2.** Il 2 marzo era l'inizio della settimana in una misura precedente, non il primo giorno di lavoro |

---

## Risposte alle domande aperte di CD-03

**9.1 — «20 giorni su 30»: calendario o apertura? → giorni di apertura.**

Si calcolano: giorni del mese meno le domeniche dichiarate in `booking_schedule`. Misurati sulla produzione:

| mese | giorni calendario | domeniche | **apertura** | lavorati |
|---|---:|---:|---:|---:|
| marzo 2026 | 31 | 5 | **26** | 14 |
| aprile | 30 | 4 | **26** | 20 |
| maggio | 31 | 5 | **26** | 10 |
| giugno | 30 | 4 | **26** | 10 |
| luglio | 31 | 4 | **27** | 23 |
| agosto | 31 | 5 | **26** | 11 |

Aprile fa **20 su 26**, esattamente l'esempio di CD. Il lunedì conta come giorno di apertura: chiudono solo la mattina.

**Il limite va conosciuto**: le chiusure occasionali — festivi, Natale, Ferragosto, ponti — **non sono modellate**, per decisione di Luigi del 27 agosto. Quindi il denominatore è un **massimo teorico**, non i giorni in cui hanno davvero aperto. Agosto dice 11 su 26 e non racconta le ferie. Resta comunque più vero di 11 su 31. **Non chiamarlo «giorni aperti»**: è il calendario meno le chiusure dichiarate.

**9.2 — Settimane tagliate al mese, che aprendole mostrano la settimana intera: confermato.** È la scelta giusta: le righe devono sommare al numero grande. L'alternativa — righe che non sommano — costringerebbe a spiegare un'aritmetica sbagliata.

**9.3 — Fin dove si torna indietro: la freccia sinistra si disattiva su marzo 2026.** Confermato. Prima non c'è storia, e una pagina vuota che sembra un mese magro è peggio di una freccia spenta.

**9.4 — Nessun modo «anno».** Confermato: con sei mesi sarebbe una pagina con una riga.

---

## Invarianti

**La pagina resta in sola lettura.** Nessuna scrittura, in nessuno dei due modi.

**Nessun numero stimato.** Niente pro-quota, niente proiezioni a fine mese, nessuno spazio apparecchiato per «lo stesso mese dell'anno prima». Per il mese in corso **cambia la base del confronto, non il numero** — e la base va dichiarata a schermo.

**Il confronto che fallisce non diventa un confronto sbagliato.** Se la seconda chiamata non torna, il numero grande si mostra **senza delta**.

**La striscia mostra i mesi che esistono**, sei oggi, non dodici caselle di cui sei vuote.

**Le due unità significano la stessa cosa.** Le frecce spostano di un'unità in entrambi i modi; passando da un modo all'altro **resta la data al centro**, non si torna al presente.

**Nessun componente di CD-02 viene sostituito.** `DayBar` e `TrendStrip` restano in uso nel modo settimana. `WeekRow` e `MonthTrend` sono componenti a sé, non varianti.

**Nessun colore nuovo, e nessun `rgba` scritto a mano.** I sei derivati sono ora token dichiarati — `--gh-bar-peak`, `--gh-bar`, `--gh-trend-off`, `--gh-band-off`, `--gh-tint`, `--gh-absent` — e si usano per nome.

**Nessun target sotto 44px sotto i 640px.** Le due altezze nuove sono al §3 dell'handoff.

## Cosa non decidi tu

Gli undici punti del §7 di CD-03, più tutto il §7 di CD-02, sono dichiarati deliberati. **Non sono da migliorare.** Se uno ti sembra sbagliato, fermati e dichiaralo.

Il §10 cambia delle parole — «Settimana»/«Mese» sull'interruttore, «Settimana piena», «Settimana ferma — non è passato nessuno», «Questo mese», «come il mese scorso», «Agosto non è finito». **Sono approvate.**

## Controprove

Dichiara nel registro, misurate sul demo:

- gli importi a quattro cifre con il separatore, **nei due modi**, e la vecchia resa non più riproducibile;
- le **quattro viste** di `cd03-mese-viste.jsx`: aprile, giugno, agosto incompleto, telefono;
- **le righe-settimana sommano al numero grande del mese**, giorni lavorati compresi — è la prova che le settimane tagliate funzionano;
- il rapporto giorni lavorati / giorni di apertura calcolato da `booking_schedule`, non scritto a mano;
- una **settimana ferma** dentro un mese pieno, resa come stato e non come errore;
- la **freccia sinistra disattivata** su marzo 2026;
- il passaggio fra i due modi che **conserva la data**, provato dal gesto;
- il confronto che fallisce e mostra il numero **senza delta**;
- build verde; suite RLS invariata.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Se qualcosa non torna

Se una vista non è realizzabile con i dati esistenti, **fermati e dichiaralo** invece di riempire il buco con un numero plausibile. Su una pagina che parla di soldi, un numero inventato che sembra misurato è il difetto peggiore possibile.

## Chiusura

Registro in `docs/consegne/`, committato col codice, con i materiali di CD-03 portati in `design_handoff_staff_app/`. **Niente push, niente merge, niente deploy**: sono gesti di Luigi.
