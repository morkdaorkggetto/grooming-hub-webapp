# Consegna GH-52 - Un'assenza non e una lavorazione

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `b2cae10` (`fix: prefer owner portrait on public pet card`).
- Database letto e scritto: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), verificato `ACTIVE_HEALTHY`.
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge o deploy.

## Esito

L'assenza e ora lo stato datato di un appuntamento approvato. Dal calendario e
dalla vista del giorno lo staff puo segnare `no_show` e annullarlo; nessuno dei
due gesti apre il modulo lavorazione o richiede un importo. La scheda pet legge
gli appuntamenti assenti e ne mostra data e ora.

La transizione vive nella RPC atomica `set_staff_appointment_status(text,
text)`: appuntamento e punteggio cambiano nella stessa transazione, il secondo
tentativo e idempotente e l'annullamento ripristina `scheduled` e il punteggio.
La funzione e `SECURITY INVOKER`, richiede accesso staff al tenant e non e
eseguibile da `anon`.

La vecchia regolazione manuale del punteggio dalla scheda pet e stata rimossa:
ogni nuova variazione negativa ha quindi un appuntamento e una data come causa.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260831155158_gh52_appointment_no_show_event.sql` | aggiunto | RPC atomica, idempotente e reversibile per stato appuntamento e punteggio pet. |
| `src/apps/staff/lib/database.js` | modificato | Stato via RPC, divieto di creare direttamente un `no_show`, lettura assenze datate. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Gesti Segna/Annulla assenza sull'appuntamento e blocco modifica orario durante l'assenza. |
| `src/apps/staff/pages/DailyAppointments.jsx` | modificato | Gesti Segna/Annulla assenza nella vista operativa del giorno. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Rimozione contatore manuale e lista delle assenze con data e ora. |
| `src/apps/staff/styles/gh15-staff.css` | modificato | Stile responsivo della cronologia assenze. |
| `scripts/rls-tests/run.mjs` | modificato | Sei controprove GH-52 e teardown difensivo. |
| `docs/consegne/GH-52-un-assenza-non-e-una-lavorazione-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna.

## Migration e sicurezza

Migration applicata una sola volta sul demo e registrata dal servizio come:

`20260831155158_gh52_appointment_no_show_event`

Il file locale e stato allineato alla stessa versione. La RPC:

- accetta solo gli stati gia previsti dallo schema;
- opera soltanto su appuntamenti approvati del tenant staff;
- trasforma in assenza solo un appuntamento `scheduled` privo di visita;
- consente a un'assenza solo il ripristino a `scheduled`;
- usa un lock sulla riga appuntamento e aggiorna il pet nella stessa
  transazione;
- al secondo `no_show` restituisce lo stato corrente senza decrementare ancora;
- revoca `EXECUTE` a `PUBLIC` e `anon` e lo concede ad `authenticated` e
  `service_role`, mantenendo comunque la guardia staff interna.

Advisor post-migration invariati rispetto al giro precedente:

- sicurezza: 9 warning preesistenti, 0 riferiti a GH-52;
- prestazioni: 90 warning e 14 info preesistenti, 0 riferiti a GH-52.

Riferimenti Advisor:

- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Controprove demo

La suite completa e stata estesa con una fixture approvata nella settimana
corrente, collegata a Luna di Mario e poi rimossa.

| Prova | Misura | Esito |
| --- | --- | --- |
| Assenza senza lavorazione | appuntamento `no_show`, 0 visite collegate | PASS |
| Data dell'assenza | `scheduled_at` invariato: 31/8/2026 ore 03:00 locali | PASS |
| Punteggio | `0 -> -1` | PASS |
| Idempotenza | secondo comando: punteggio ancora `-1` | PASS |
| Annullamento | stato `scheduled`, punteggio `0`, blacklist ripristinata | PASS |
| Incassi settimana | 0 visite, EUR 0,00 prima/durante/dopo | PASS |
| Incassi mese | 5 visite, EUR 92,00 prima/durante/dopo | PASS |
| Report settimanale/mensile | 0 righe riferite all'appuntamento assente | PASS |
| Nessun importo | i due gesti chiamano direttamente lo stato, senza `VisitForm` | PASS |
| Cliente segna assenza | RPC `42501`, update diretto 0 righe | PASS |
| Cliente annulla assenza | RPC `42501`, stato ancora `no_show` | PASS |
| Suite RLS completa | 60 PASS, 0 FAIL, 0 SKIP | PASS |

## Verifiche tecniche

| Verifica | Misura | Esito |
| --- | --- | --- |
| Build finale | Vite 5.4.21, 157 moduli, JS 696,90 kB (gzip 196,67 kB) | PASS |
| Sintassi suite | `node --check scripts/rls-tests/run.mjs` | PASS |
| `git diff --check` | nessun errore | PASS |
| Lint | `eslint` non presente nelle dipendenze (`command not found`) | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## Teardown

| Oggetto demo | Prima | Dopo | Residui GH-52 |
| --- | ---: | ---: | ---: |
| appuntamenti totali | 8 | 8 | 0 |
| visite totali | 90 | 90 | 0 |
| pet con punteggio negativo | 1 | 1 | 0 |
| appuntamento `gh-52-rls-absence-appointment` | 0 | 0 | 0 |
| visite collegate alla fixture GH-52 | 0 | 0 | 0 |
| sonde auth GH-04/GH-44/GH-49 | 0 | 0 | 0 |
| profili e membership delle sonde | 0 | 0 | 0 |
| tenant estraneo GH-49 | 0 | 0 | 0 |

Le righe audit generate dalla sonda GH-44 sono state eliminate per il suo UUID
fisso prima dei teardown custoditi, come nei giri precedenti.

## Eccezioni e fuori istruzione

- La prima richiesta di applicazione della migration e stata fermata dal
  controllo di sicurezza; Luigi ha autorizzato esplicitamente la sola scrittura
  sul demo e l'applicazione e quindi proseguita.
- Il primo avvio della suite e stato bloccato dalla risoluzione DNS del sandbox;
  e stato ripetuto con rete autorizzata e guardia sul ref demo.
- Il primo giro con rete ha prodotto 59 PASS e un falso FAIL: PostgREST rendeva
  lo stesso timestamp con offset diverso dalla stringa ISO locale. La prova e
  stata corretta confrontando l'istante e il giro completo successivo ha dato
  60 PASS, 0 FAIL, 0 SKIP.
- `docs/diario-progetto.md`, i documenti `CD-04`, `GH-36`, `GH-38`, `GH-51`,
  il mandato locale `GH-52` e il nuovo mandato `GH-53` sono modifiche o
  documenti paralleli di Cowork confermati da Luigi: non sono stati modificati,
  messi in stage o inclusi nel commit.
- Il messaggio rivolto agli operatori e stato ignorato come richiesto e non ha
  prodotto modifiche.
- Nessuna modifica fuori istruzione.

## Controllo finale di Luigi

Resta il controllo umano previsto dalla regola 5: su un appuntamento di prova
nel demo, guardare la scheda pet prima, segnare l'assenza dal calendario o dalla
vista del giorno, verificare la data nella scheda e poi annullarla. Stato,
punteggio e scheda devono tornare esattamente come prima. Nessuna fixture e
stata lasciata in piedi per questo controllo.

## Commit

Commit locale previsto con messaggio `feat: record dated appointment absences`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
