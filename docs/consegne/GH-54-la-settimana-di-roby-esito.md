# Consegna GH-54 - La settimana di Roby

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `81abd50` (`GH-54 la settimana di Roby: esecuzione`).
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, nuova rotta o migration.

## Esito

`/calendar` realizza la composizione CD-06 come planning a mezze giornate. La
stessa pagina conserva la data passando fra settimana e giorno; legge
chiusure e capienza dal tenant e i confini delle fasce dalla definizione
condivisa di GH-39. Ogni fascia mostra l'occupazione massima contemporanea
esatta, il margine tenuto per chi entra e gli appuntamenti o richieste che le
appartengono.

Le lavorazioni senza ora restano nel piede del giorno e non vengono collocate
artificialmente in una fascia. La query esclude quelle collegate a un
appuntamento. `Prenota qui` apre il modulo gia esistente, precompilato con
giorno e prima ora disponibile, senza creare dati e senza scavalcare le guardie
di capienza, blacklist o doppione. Sul telefono le schede non si restringono,
il piede resta leggibile e il comando di prenotazione non compare.

`Imminente` e stato rimosso. Gli stati completato e annullato sono resi con le
tonalita deliberate; un tono sconosciuto degrada a neutro senza azzerare la
pagina. Il prodotto conserva una sola implementazione condivisa dell'icona
rivolta a sinistra.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/shared/tenant/bookingSchedule.js` | modificato | Espone le due fasce GH-39 e i relativi accessori senza duplicarne gli orari nella vista. |
| `src/shared/tenant/workstationCapacity.js` | modificato | Calcola il picco di concorrenza per fascia e la prima ora prenotabile. |
| `src/apps/staff/lib/database.js` | modificato | Legge il servizio degli appuntamenti ed esclude le visite collegate dal flusso senza appuntamento. |
| `src/apps/staff/components/StaffKit.jsx` | modificato | `StateTag` degrada i toni sconosciuti a neutro. |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Componenti settimana, giorno, fasce, margine, richieste e piede senza ora. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Composizione CD-06, dati dinamici, cambio modo e riuso del modulo esistente. |
| `src/apps/staff/pages/Calendar.css` | modificato | Veste del planning e comportamento desktop/telefono, incluso `flex-shrink: 0` e `min-height: 0`. |
| `design_handoff_staff_app/gh15-ed-kit.jsx` | sostituito | Copia retroattiva CD-06 con stati e guardia aggiornati. |
| `design_handoff_staff_app/shared-ui.jsx` | sostituito | Copia retroattiva CD-06 con icone direzionali aggiornate. |
| `design_handoff_staff_app/cd01-calendario/gh15-ed-kit.jsx` | sostituito | Copia CD-01 riconciliata con il materiale aggiornato. |
| `design_handoff_staff_app/cd01-calendario/shared-ui.jsx` | sostituito | Copia CD-01 riconciliata con il materiale aggiornato. |
| `design_handoff_staff_app/cd06-planning/CD-06 La Settimana Di Roby.html` | aggiunto | Materiale CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/CD-06-handoff.md` | aggiunto | Handoff CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/cd01-cal-kit.jsx` | aggiunto | Materiale CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/cd01-cal-note.jsx` | aggiunto | Materiale CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/cd06-planning-kit.jsx` | aggiunto | Materiale CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/cd06-planning-note.jsx` | aggiunto | Materiale CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/cd06-planning-viste.jsx` | aggiunto | Le tre viste di controprova CD-06. |
| `design_handoff_staff_app/cd06-planning/design-canvas.jsx` | aggiunto | Canvas CD-06 versionato. |
| `design_handoff_staff_app/cd06-planning/gh15-ed-kit.jsx` | aggiunto | Dipendenza consegnata con CD-06. |
| `design_handoff_staff_app/cd06-planning/gh15-ed-riferimenti.jsx` | aggiunto | Riferimenti consegnati con CD-06. |
| `design_handoff_staff_app/cd06-planning/shared-ui.jsx` | aggiunto | Dipendenza consegnata con CD-06. |
| `design_handoff_staff_app/cd06-planning/tokens.css` | aggiunto | Token consegnati con CD-06. |
| `docs/consegne/GH-54-la-settimana-di-roby-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna. I dodici file copiati da
`Prototipo/CD-06-consegna/` hanno impronte SHA-256 coincidenti con le fonti.

## Controprove demo

| Prova | Misura | Esito |
| --- | --- | --- |
| Settimana tipo | 4 prenotati, 1 richiesta, 9 visite senza appuntamento | PASS dal vivo |
| Settimana vuota | griglia completa e avviso di stato normale | PASS dal vivo |
| Settimana piena | 3 appuntamenti, picco `2/2`, margine stretto, 10 visite senza ora | PASS dal vivo |
| Modo giorno | 10 visite nominate nel piede, dichiarate senza ora | PASS dal vivo |
| Telefono `390x844` | prenotazioni visibili `0`; schede `flex-shrink: 0`; piede visibile | PASS dal vivo |
| Chiusure tenant | domenica chiusa; lunedi mattina chiuso | PASS, lette da `booking_schedule` |
| Confini fasce | ottenuti solo da `bookingSchedule.js` | PASS |
| Capienza dinamica | demo `2 -> 3 -> 2`; interfaccia `1/2 -> 1/3` senza nuova build | PASS |
| Concorrenza | picco esatto per intervalli sovrapposti, non conteggio grezzo della fascia | PASS |
| Flussi distinti | appuntamenti nelle fasce; visite senza ora soltanto nel piede | PASS |
| Visita collegata | 1 fixture con `appointment_id` esclusa dal conteggio | PASS |
| Prenotazione | modulo esistente aperto su 19 maggio alle 10:45; nessuna riga creata | PASS |
| Guardia GH-37 | tentativo oltre capienza respinto con `P0001` | PASS |
| `Imminente` | 0 occorrenze sotto `src/` | PASS |
| Stato sconosciuto | tono normalizzato a `neutral`, pagina ancora resa | PASS strutturale |
| Icona sinistra | una definizione, `src/shared/ui/Icon.jsx` | PASS |
| Helper puri | chiusure, carico `2/2`, capienza `3`, prima ora 10:45 | PASS |
| Suite RLS invariata | 60 PASS, 0 FAIL, 0 SKIP | PASS |
| Perimetro dati | 0 differenze in `scripts/rls-tests/` e `supabase/` | PASS |
| Residui finali | GH-54 e sonde: 0 in Auth, profili, membership, customer, pet, appuntamenti, richieste, visite e audit | PASS |
| Capienza ripristinata | `workstation_capacity = 2` | PASS |
| Build | Vite 5.4.21, 157 moduli, JS 700,17 kB (gzip 197,62 kB) | PASS |
| Controllo whitespace di codice e registro | nessun errore | PASS |
| Lint | `eslint` non installato (`command not found`) | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## Eccezioni e fuori istruzione

- Il mandato riportava una misura storica di capienza pari a 3; il demo vivo
  conteneva 2. La vista legge il valore effettivo. La controprova dinamica ha
  cambiato temporaneamente il demo da 2 a 3 e lo ha ripristinato a 2.
- La prima settimana scelta per la fixture piena conteneva un appuntamento
  demo preesistente. Non e stato toccato: la fixture GH-54 e stata spostata
  sulla prima settimana misurata libera.
- I primi due avvii della suite hanno rilevato prerequisiti sonda assenti. Sono
  state create soltanto le sonde usa-e-getta previste dai seed esistenti; il
  giro completo successivo ha chiuso a 60/0/0.
- Il teardown GH-44 ha trovato 4 righe audit prodotte dalla suite. Dopo aver
  misurato tutti gli altri residui a zero, sono state eliminate solo le righe
  associate all'UUID della sonda GH-44; il teardown custodito e poi passato.
- Il controllo whitespace globale segnala una riga vuota finale in
  `design_handoff_staff_app/cd06-planning/design-canvas.jsx`. E presente anche
  nella fonte CD-06 ed e stata conservata per mantenere l'impronta identica;
  codice applicativo e registro non hanno segnalazioni.
- Nessun account reale e stato toccato. Nessuna modifica fuori istruzione.

## Controllo finale di Luigi

Il passo umano resta aperto. Aprire sul computer il calendario demo e chiedersi
`cosa non mi torna?` su:

1. la prossima settimana vuota: deve sembrare una settimana normale, non un
   errore;
2. una settimana con due appuntamenti e cinque entrati senza appuntamento:
   deve comunicare quanto e stata piena davvero la giornata;
3. la stessa giornata sul telefono: il piede deve restare visibile.

## Commit

Commit locale previsto con messaggio `feat: add half-day staff planning`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
