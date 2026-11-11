# GH-117 - Le fasce su due righe

**Esito:** implementato in `main` sulla base `131d735` (HEAD iniziale `1946535`, successivo solo documentale). Commit locale: quello che contiene questo registro (`git log -1 --format=%H -- docs/consegne/GH-117-le-fasce-su-due-righe-esito.md`). Nessun push, merge, deploy, migrazione o accesso al prodotto.

**Canone letto per intero:** versione 1.3, `~/Desktop/_metodo/CANONE.md`, MD5 `be5f2d64efa553ec5d34a194c71418b6`. Mandato MD5 `474a488f8ad358339fb8771675fd92a2`; handoff CD-13 MD5 `86ea87b99f7789c7156a62be73bef4cb`. Tutte le sei impronte iniziali del perimetro e le cinque del gestionale coincidevano con il mandato. Nessun file applicativo era modificato all'avvio.

## Scelta e file

Il titolo e scritto una sola volta in `BookingTimePreferenceChips`, che compone anche le due righe. Il nuovo campo per fascia si chiama `closedState`; `closedLabel` resta identico. `formatRangeHour` e ora esportata e usata sia dall'etichetta lunga preesistente sia dal pulsante. La formattazione non e duplicata.

| File nel commit | Modifica |
| --- | --- |
| `src/shared/tenant/bookingSchedule.js` | `closedState` (`chiusa` / `chiuso`) ed export della funzione oraria esistente. |
| `src/apps/customer/components/BookingTimePreferenceChips.jsx` | Titolo comune, due righe esplicite, etichetta accessibile della fascia chiusa. Nessun `Non disponibile` qui. |
| `src/apps/customer/pages/Book.jsx` | Solo passo 3: titolo fornito dal componente, rimossa frase fissa; hint WhatsApp invariato. |
| `src/apps/customer/pages/Book.css` | Griglia e tipografia delle sole fasce, stato scelto; regole globali dei chip non cambiate. |
| `src/apps/customer/components/PendingRequest.jsx` | Solo blocco fasce e frasi F3/F4: `Per me e uguale` corretto, iniziale minuscola nella frase; rimossa frase fissa. F5 intatta. |
| `src/shared/ui/DesiredDateStrip.css` | Selettore adiacente aggiornato al blocco con titolo e bordo scelto secondo CD-13. |
| `docs/consegne/GH-117-le-fasce-su-due-righe-esito.md` | Questo registro, nello stesso commit. |

## Prove misurate

| Controprova | Esito |
| --- | --- |
| Stringhe prima e dopo il primo edit, poi alla chiusura | `Mattina (9–13)`, `Pomeriggio (13–19)`, `Per me è uguale`; `Mattina`, `Pomeriggio`; `Mattina chiusa`, `Pomeriggio chiuso`: identiche. `getBookingTimePreferenceLabel`, `getBookingTimePreferenceName`, `getDateClosure` restituiscono gli stessi valori campione. `formatRangeHour` produce `9`, `13`, `19`. |
| Sette stati a 375px, prenotazione e foglio tessera | Nessun giorno: `Mattina / 9–13`, `Pomeriggio / 13–19`, `Per me / è uguale`; giorno aperto: uguale; lunedi: `Mattina / chiusa`, disabilitata; pomeriggio chiuso: `Pomeriggio / chiuso`, disabilitato; pomeriggio scelto: bordo 2px e nome 700; `Per me è uguale` scelto di lunedi: selezionabile; scelta tolta cambiando giorno: mattina chiusa, nessuna preferenza selezionata. Tutti i pulsanti 54px, due righe, nessuno sbordo. |
| Misure 375px | Prenotazione: riga 351px, colonne 111,66/111,67/111,66. Foglio della tessera: riga 335px, tre colonne 106,33px. Card Home (caso piu stretto): riga 285px, colonne 89,66/89,67/89,66; 79,67px utili nello stato scelto, `Pomeriggio` largo 71,30px, margine 8,37px. Titolo presente nei due posti, distanza titolo-fasce 8px. **Scoperta:** i 303px dell'handoff non sono la misura della Card Home attuale. |
| Stato scelto | Entrambi i contesti: bordo `2px solid rgb(94, 133, 128)` = `var(--color-primary-hover)`, fondo `rgba(111, 151, 146, 0.06)` = `var(--gh-tint)`, nome peso 700. Centro del nome del pomeriggio 187,49px sia aperto sia scelto a 375px; nessuno spostamento. |
| 1365px | Prenotazione: riga 682,80px, colonne 222,27px; foglio: riga 440px, colonne 141,33px. Altezze 54px, nessuno sbordo. |
| Passo 4 | Chip `pelo lungo`, `nodi`, `Non disponibile`: 44px, raggio 999px; rispettivamente fondo normale, primario, soft. Markup `SelectChip` e regole globali `.gh-book-chip` immutati. |
| F3/F4 | Con mattina: `Mattina (9–13)` nel sommario e `Hai indicato giovedì 19 novembre, mattina (9–13). Ora tocca al salone proporti un’alternativa.`; con flessibile: `Per me è uguale` nel sommario e `..., senza preferenza oraria.`; senza fascia: `Nessuna preferenza` e nessun inciso dopo la data. Test delle espressioni e revisione del JSX; nessun invio reale. |
| Riepilogo e WhatsApp | Righe `Book.jsx` 141 e 160 non modificate; `BOOKING_TIME_PREFERENCES[].label` identiche, quindi i testi prodotti restano quelli preesistenti. Nessuna richiesta inviata solo per verificare questa invariante. |
| Ricerca testi | `rg -n 'Non disponibile|Per quel giorno scegli un’altra preferenza' src/apps/customer`: solo `src/apps/customer/pages/Book.jsx:75` (passo 4); la frase sotto le fasce ha zero occorrenze. |
| Demo | Una sola chiave temporanea `tenants.settings.booking_schedule.closed_time_preferences.thursday=["afternoon"]`, nessuna riga creata. Dopo la prova: chiave assente, conteggio residui 0, MD5 di `settings::text` prima e dopo `26327442803a6426d07c74c8feca0f33`. Progetto `grooming-hub-demo` `qttpinkslhenxrsbhhhg`, stato `ACTIVE_HEALTHY`. |
| Build e pulizia | `npm run build` riuscito, 183 moduli; `git diff --check` pulito. Avvisi preesistenti Browserslist e chunk >500kB. `eslint` non presente in `node_modules/.bin`, quindi lint non eseguito; nessuna dipendenza aggiunta. `git diff --stat` prima del registro: solo i sei file autorizzati, 63 inserzioni e 36 rimozioni. |

**Cinque domande del canone.** (1) Il gesto resta possibile: click sulla fascia gia scelta produce valore vuoto, provato anche per `Per me è uguale`; la fascia chiusa e disabilitata. (2) Nome/orario del pulsante ed etichetta lunga derivano dagli stessi `BOOKING_TIME_WINDOWS` e dalla stessa `formatRangeHour`; `closedState` e `closedLabel` sono nello stesso oggetto, misurati concordi. (3) Prenotazione e riquadro condividono componente e `getDateClosure`. (4) Le fasce aperte restano selezionabili, la flessibile non si disabilita neanche con entrambe chiuse; invio e regole restano intatti. (5) Nessuna navigazione nuova; la prova di un flusso autenticato completo non e stata eseguita.

**Incompletezza accettata:** **scelta tolta senza avviso**. La frase proposta da CD-13 per il caso 7 e stata rinviata esplicitamente da Luigi; il pulsante mostra lo stato chiuso, ma nessun messaggio spiega la rimozione della scelta. F5 resta invariata.

**Scoperte:** 1 misura reale piu stretta nella Card Home. **Recuperi:** 1 banco di prova iniziale conteneva un nodo artificiale fra calendario e fasce, spezzando il selettore adiacente; corretto il banco e ripetuti i sette stati senza modificare il codice per quel falso rilievo. **Fuori istruzione:** nessuna modifica. I file SQL non versionati preesistenti sono rimasti fuori da stage e commit; non sono stati letti. Nessun accesso alla produzione.

**Passaggio a Luigi:** dopo il deploy, prova sul telefono giovedi/lunedi, scelta e deselezione, riquadro alternativa, e riferisci cosa non torna. La prova browser qui ha montato il componente reale e i layout CSS nel browser locale senza inserire credenziali o inviare richieste; non sostituisce quel controllo sul telefono. **Tempo:** avvio 07:58:02 CET, verifiche fino alle 08:13 CET, circa 15 minuti. Tempo della sola prova mirata non cronometrato separatamente, compreso nel totale.
