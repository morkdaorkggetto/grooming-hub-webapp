# Consegna GH-41 - Questo cane ha gia un appuntamento

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `033a8f3`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, nuova rotta, dipendenza, scrittura permanente, push,
  merge o deploy.

## Esito

GH-41 e' completato. Il controllo e' per `pet_id` e considera il primo impegno
aperto fra:

- appuntamenti futuri non annullati e non rifiutati;
- richieste strutturate ancora `pending`;
- richieste legacy ancora `pending`.

La ricerca staff non e' limitata alla settimana visualizzata. Nella conferma
di una richiesta e nel dettaglio appuntamento, l'elemento corrente viene
escluso: l'avviso compare soltanto se esiste un altro impegno per lo stesso
cane.

Nel wizard cliente i pet con una richiesta pendente non sono piu disabilitati:
l'avviso informa e non blocca l'invio. Per lo spostamento e' disponibile un
collegamento WhatsApp gia compilato verso il numero del salone. Non esiste una
superficie cliente di riprogrammazione in-app e il mandato vietava una nuova
rotta; in assenza del numero salone il ripiego porta alla home.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/shared/appointments/openPetBookings.js` | aggiunto | Seleziona per cane il primo impegno aperto, applica le esclusioni e compone i testi staff/cliente. |
| `src/apps/customer/hooks/useOpenPetAppointments.js` | aggiunto | Legge via RLS gli appuntamenti futuri visibili al cliente autenticato. |
| `src/apps/customer/pages/Book.jsx` | modificato | Rimuove il blocco per richiesta pendente, mostra data o fascia e offre lo spostamento via WhatsApp. |
| `src/apps/customer/pages/Book.css` | modificato | Rende riconoscibile e raggiungibile l'azione di spostamento. |
| `src/apps/staff/lib/database.js` | modificato | Carica gli impegni aperti del tenant senza finestra settimanale. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Mostra il promemoria nelle tre superfici GH-39 ed esclude l'elemento corrente. |
| `src/apps/staff/pages/Calendar.css` | modificato | Distingue visivamente il doppione dalla nota neutra di carico. |
| `docs/consegne/GH-41-appuntamento-gia-preso-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex.

## Controprove vive sul demo

Fixture usa-e-getta impiegate: sei appuntamenti, una richiesta strutturata con
marker `[DEMO GH-41]` e la sonda staff canonica GH-04.

| Prova | Misurato | Esito |
| --- | --- | --- |
| Appuntamento futuro, collocazione manuale | `Luna ha gia un appuntamento giovedi 3 alle 10:00.` | PASS |
| Appuntamento futuro, conferma richiesta | Stesso testo prima della decisione; la richiesta corrente e' esclusa | PASS |
| Appuntamento futuro, dettaglio | Aprendo quello del 3, indica l'altro del 4 alle 11:00 | PASS |
| Richiesta pendente | `Pepe ha gia una richiesta per sabato 5, mattina.` | PASS |
| Due cani dello stesso cliente | Luna avvisata; Pepe senza avviso finche aveva solo passato e annullato | PASS |
| Annullato o passato | 0 avvisi su Pepe | PASS |
| Cliente reale Mario | Data/ora corrette per Luna e data/fascia corrette per Pepe | PASS |
| Spostamento cliente | Link WhatsApp presente con cane e impegno gia compilati | PASS |
| Carico e doppione insieme | 1 nota neutra GH-39 e 1 avviso GH-41, separati in due blocchi | PASS |
| Capienza satura | 1 rifiuto GH-37, 0 note carico, 0 avvisi doppione, salva disabilitato | PASS |
| Isolamento cliente | Mario legge 2 appuntamenti propri e 0 delle 2 fixture altrui | PASS |

Il controllo visivo desktop conferma che carico e doppione sono due frasi in
due blocchi distinti; il rifiuto di capienza li sostituisce entrambi.

## Integrita e pulizia

- Fixture GH-41 finali: 0 appuntamenti, 0 richieste.
- Sonda staff finale: 0 utenti Auth, 0 profili, 0 membership.
- Fixture della suite RLS: 0 residui secondo il teardown interno.
- Nessun dato reale e' stato modificato e nessun segreto e' entrato nei file.

## Verifiche eseguite

- Controlli puri su appuntamento futuro, richiesta pendente, cane diverso,
  annullato, passato, esclusione corrente e testi: `8 PASS`.
- Isolamento RLS specifico appuntamenti: `own=2`, `foreign=0`.
- Suite RLS demo: `30 PASS, 0 FAIL, 1 SKIP` previsto per secondo tenant
  assente.
- `npm run build`: PASS, Vite 5.4.21, 155 moduli trasformati, bundle JS
  673.16 kB (gzip 190.26 kB).
- `git diff --check`: PASS.
- Browser staff e cliente reale Mario: PASS, nessun errore applicativo.
- `npm run lint`: non eseguibile nella base, `eslint: command not found`.
- Warning build non bloccanti e preesistenti: Browserslist datato e bundle
  principale sopra 500 kB.

## Eccezioni e fuori istruzione

- Il primo tentativo di fixture e' stato fermato prima della scrittura in
  attesa dell'autorizzazione esplicita di Luigi. Il primo SQL autorizzato aveva
  una riga con cardinalita errata: la transazione e' fallita integralmente e ha
  lasciato zero dati; la versione corretta e' poi passata.
- Il primo test RLS specifico non ha raggiunto il demo per il DNS isolato
  della sandbox. Rilanciato con rete autorizzata, e' passato `own=2/foreign=0`.
- L'automazione browser non notificava React quando compilava il campo data
  nativo. La prova di carico e' stata quindi resa deterministica collocando la
  fixture nella data iniziale reale del modulo; nessuna logica applicativa e'
  stata aggirata.
- Nessuna attivita e' stata eseguita sulla produzione e nessuna estensione
  funzionale e' stata applicata fuori GH-41.

## Nota aperta e soluzione consigliata a Cowork

Durante la prova e' emersa una condizione di concorrenza preesistente in
`Calendar.jsx`: passando alla settimana successiva prima che termini la lettura
iniziale, la risposta piu vecchia puo sovrascrivere quella nuova. Il titolo
mostra la nuova settimana mentre le righe appartengono per un istante alla
precedente.

Soluzione minima raccomandata: micro-mandato separato sul solo
`src/apps/staff/pages/Calendar.jsx`, con un contatore `requestId` in `useRef`
oppure una guardia `active` nel `useEffect`; `setData`, `setError` e
`setLoading` devono accettare soltanto la richiesta piu recente. Controprova:
ritardare artificialmente la prima lettura, cambiare settimana, verificare che
titolo, righe e riepilogo appartengano sempre alla stessa settimana. Rischio
residuo basso e confinato alla lettura; nessuna modifica database necessaria.

## Passo umano di Luigi

Dopo il rilascio, fissare un appuntamento a un cane che ne ha gia uno e leggere
le due voci quando la fascia contiene altre lavorazioni. La domanda e': carico
del salone e appuntamento gia preso sembrano immediatamente due informazioni
diverse, non un unico paragrafo?

## Commit

Commit locale della consegna con messaggio
`feat: warn about existing pet bookings`. Nessun push eseguito.
