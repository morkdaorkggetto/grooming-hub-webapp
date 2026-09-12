# GH-81 - Il pallino e il suono

## Esito e perimetro

**Concluso lato implementazione e banco automatico.** Tutti gli `Hero` del
gestionale ricevono da un solo provider il numero delle richieste cliente in
attesa. A zero l'avviso non esiste; da uno in poi il numero apre `/requests`
e il controllo adiacente permette di silenziare il suono ricordando la scelta.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`7375b942c6ed55fc4d1340233e60f3b55092118a`**;
  stato iniziale pulito.
- Commit locale: ricavabile con `git log -1 --format=%H --
  docs/consegne/GH-81-il-pallino-e-il-suono-esito.md` e comunicato a Luigi
  alla chiusura.
- Nessun database letto o scritto durante le prove: fixture esclusivamente in
  memoria. Produzione non letta e non scritta.
- Nessuna migration, colonna, policy, rotta, pagina o dipendenza aggiunta.
- Nessun push, merge o deploy.
- Suite RLS non rieseguita come richiesto. Ultima misura viva dichiarata dal
  mandato: GH-78, **60 PASS del 12/9**.

La sola persistenza introdotta e una preferenza locale del browser,
`gh:staff-request-sound-enabled`; non e un dato Supabase e non contiene dati
personali.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/staff/StaffApp.jsx` | Montaggio unico del provider per tutto il gestionale autenticato come operatore |
| `src/apps/staff/components/StaffRequestAlerts.jsx` | Polling, confronto ID, visibilita, memoria audio e doppio tono |
| `src/apps/staff/components/StaffKit.jsx` | Indicatore e controllo suono dentro il solo componente `Hero` condiviso |
| `src/apps/staff/styles/gh15-staff.css` | Aspetto con colori esistenti, focus e bersagli da 44 px |
| `src/shared/ui/Icon.jsx` | Icone `volume` e `volume-off` nel vocabolario esistente |
| `docs/consegne/evidenze/GH-81/gh81-browser-measures.json` | Misure complete del banco in memoria |
| `docs/consegne/evidenze/GH-81/indicator-three-1365.png` | Prova a schermo con tre richieste |
| `docs/consegne/evidenze/GH-81/indicator-zero-1365.png` | Prova a schermo senza richieste |
| `docs/consegne/GH-81-il-pallino-e-il-suono-esito.md` | Questo registro |

## Contratto dell'avviso

- Destinazione: `/requests`, rotta gia esistente.
- Testo accessibile con una richiesta: `1 richiesta in attesa. Apri
  richieste`.
- Testo accessibile con tre richieste: `3 richieste in attesa. Apri
  richieste`.
- A **99** mostra `99`; da **100** mostra `99+`, mantenendo il numero esatto
  nel nome accessibile. Con 120: `120 richieste in attesa. Apri richieste`.
- Controllo acceso: `Disattiva suono nuove richieste`.
- Controllo spento: `Attiva suono nuove richieste`.
- A zero non sono renderizzati ne il pallino ne il controllo audio. L'`Hero`
  torna identico alla base.
- Sono stati riusati `--color-warning-border`, `--color-warning-text`,
  `--color-warning-bg`, `--color-surface-soft` e `--color-primary`: nessun
  colore nuovo.

Il pallino e un link circolare da 44 x 44 px con il solo numero. Il controllo
audio e un secondo pulsante circolare da 44 x 44 px: restano un gruppo
secondario davanti alle azioni gia proprie della pagina, senza sostituirle.

## Polling condiviso

Intervallo scelto: **60.000 ms, un minuto**. Il provider e montato una sola
volta sopra le route staff e chiama l'API gia esistente
`getPendingAppointmentRequests`. Un aggiornamento logico legge insieme la
sorgente strutturata `appointment_requests` e la compatibilita legacy in
`appointments`, esattamente come la dashboard; non nasce un secondo criterio
di conteggio.

- Un ref `inFlight` impedisce di avviare un ciclo mentre il precedente non e
  terminato.
- Cambiare pagina non rimonta il provider: attraversando le dieci route il
  banco ha contato **1 intervallo avviato, 1 attivo, massimo 1 attivo**.
- Con risposta rallentata a 260 ms e intervallo di prova a 120 ms, massimo
  richieste logiche concorrenti: **1**.
- A scheda nascosta l'intervallo viene cancellato: chiamate prima/dopo 420 ms
  nascosti **15/15**.
- Tornando visibili parte una lettura immediata: chiamate **15 -> 16** e poi
  riprende l'intervallo.
- Una risposta completata quando la scheda e gia nascosta viene ignorata: il
  conteggio affidabile e rimasto `120 richieste in attesa` fino al ritorno.
- Su errore il conteggio e rimasto **3**, nessun messaggio e comparso e gli
  errori console sono rimasti **0**.

Il confronto usa gli identificativi composti `request_kind:id`, non la sola
cardinalita. Percio una nuova richiesta viene riconosciuta e suona anche se,
nello stesso intervallo, un'altra viene chiusa e il totale resta uguale.

## Suono e memoria

Il suono e un doppio tono sinusoidale Web Audio: **659,25 Hz** e **783,99
Hz**, 150 ms ciascuno, distanziati di 160 ms. Il browser prepara l'audio alla
prima interazione `pointerdown` o `keydown`, nel rispetto del blocco autoplay;
il click che riattiva il controllo lo prepara ugualmente.

| Caso | Misura |
| --- | ---: |
| Primo caricamento con 3 richieste gia presenti | 0 avvii tono |
| Arrivo di una quarta richiesta | 2 avvii tono, un doppio tono |
| Nuovo ID con totale ancora 4 | altri 2 avvii tono |
| Suono spento, arrivo della quinta | 0 nuovi avvii tono |
| Valore memorizzato | `false` |
| Ricaricamento | controllo ancora su `Attiva suono nuove richieste` |
| Nuova richiesta dopo reload, ancora spento | 0 avvii tono |
| Riattivazione e richiesta seguente | 2 avvii tono |

Il primo caricamento stabilisce soltanto gli ID noti e non suona, anche se il
conteggio iniziale e maggiore di zero. Un errore di lettura non modifica gli
ID noti e non produce audio.

## Dieci pagine e azioni invariate

Ricerca esaustiva:

```sh
rg -l '<Hero' src/apps/staff/pages -g '*.jsx' | sort
rg -n '<Hero' src/apps/staff/pages -g '*.jsx' | wc -l
```

Risultato: **10 file pagina**, **25 invocazioni di `Hero`**. Con conteggio
zero, il banco ha attraversato le dieci route corrispondenti e ha trovato
**0 indicatori in ognuna**:

```text
/dashboard
/requests
/client/fixture
/add-client
/client/fixture/add-visit
/calendar
/appointments/today
/reports/weekly
/contacts
/promotions
```

Il collegamento e stato attivato da `/dashboard`, `/calendar` e `/contacts`:
tutte e tre le destinazioni misurate sono `/requests`.

Nessun file sotto `src/apps/staff/pages/` ha diff. Le impronte SHA-256 base e
worktree coincidono:

| Pagina | SHA-256 base e dopo |
| --- | --- |
| `AddClient.jsx` | `34968b6a4728f4297df562641c5a341fa828afeb536f93910ebcc8c0e5802ac2` |
| `AddVisit.jsx` | `075e58e4f33504156ba39aff3dd3a774cbd34c69532dbfec742143003ab0732a` |
| `Calendar.jsx` | `a11796d61136af77fa6467f042ac3af78b94f2c8e7c3032eb41c680e6a0ccbd0` |
| `ClientDetail.jsx` | `570954add9bcdce96e31bd4ce067195660febb4e2490f052d64cafeef0bca89f` |
| `Contacts.jsx` | `1eb2a0ea6ca24a5e7dd58e96b57b7b59b92c8494bf8d1a1f3e77368fd3e1ed39` |
| `CustomerRequests.jsx` | `0b2ce8be6d54d2ea63196c81e23f31e855a38cb3c3022879b5dfecafe4a30fde` |
| `DailyAppointments.jsx` | `1e25a8e5b15b701fa975392329029973cb46918d9e27636c4e955650dbbfed29` |
| `Dashboard.jsx` | `df8a2c8083cd6398d34d04cb87f0499acde490284ce81333a2f72bef567541bf` |
| `PromotionsManager.jsx` | `03213954f3c8cc4c722fa969245f5d5128ccefd5ff03e4470f231ff67c1ff8a3` |
| `WeeklyRevenue.jsx` | `9ed93bacf322c8bbbeeb87ecc05e12321725dd4baf76ad94428c1876123e2c49` |

Questo confronto conserva integralmente titoli, sottotitoli, callback e
pulsanti degli `Hero` della base.

## Responsive e prova a schermo

| Viewport | Overflow orizzontale | Pallino | Controllo audio |
| ---: | ---: | ---: | ---: |
| 1365 px | 0 px | 44 x 44 px | 44 x 44 px |
| 1024 px | 0 px | 44 x 44 px | 44 x 44 px |
| 375 px | 0 px | 44 x 44 px | 44 x 44 px |

Le due schermate richieste sono state renderizzate e ispezionate a dimensione
originale. Con tre richieste il gruppo resta a destra dell'azione della
pagina; a zero scompare interamente e lascia l'`Hero` invariato.

## Verifiche, tempi ed eccezioni

- Banco Chromium finale: **PASS**, **5,85 s reali**, zero errori console.
- `npm run build` finale: **PASS**, 160 moduli, Vite **1,30 s**, **1,82 s
  reali**.
- `git diff --check`: **PASS**.
- Revisione React: un solo provider e listener globale, cleanup completo,
  lavoro transitorio nei ref, valori di contesto memorizzati, nessuna
  waterfall o render costoso: **PASS**.
- Verifica della forma `select('*', { count: 'exact', head: true })` sulla
  documentazione Supabase corrente: nessuna modifica necessaria, perche GH-81
  riusa l'API applicativa esistente e deve conoscere gli ID, non il solo
  conteggio.
- Avviso build non bloccante e preesistente: bundle JavaScript oltre 500 kB.
- Il lint mirato non e stato eseguito: `package.json` dichiara `eslint`, ma
  `node_modules/.bin/eslint` non e presente. Non sono state installate
  dipendenze fuori mandato.

Due passate del solo banco sono state scartate e dichiarate. La prima, **2,48
s**, dereferenziava il link durante l'istante precedente alla sua comparsa; e
stato corretto il test con una guardia nulla. La seconda, **4,87 s**, sommava
agli avvii audio anche i conteggi preparatori `1`, `3` e `99+`; la prova del
silenzio iniziale e stata isolata con un reload su tre richieste gia presenti.
Nessuno dei due casi ha richiesto una correzione applicativa.

Non sono emersi rallentamenti del pacchetto: Vite del banco pronto in 171 ms,
banco finale 5,85 s, build finale 1,82 s reali. Nessuna attivita fuori
istruzione.

## Indicazione operativa a Cowork

Quando `CD-07` introdurra la barra di navigazione, non va creato un secondo
polling. La traslazione minima e montare nella barra lo stesso renderer che usa
`useStaffRequestAlerts`, lasciando `StaffRequestAlertsProvider` dov'e e
rimuovendo il renderer dall'`Hero`. Cosi conteggio, ID noti, silenzio iniziale,
visibilita e preferenza audio restano una sola fonte condivisa.

## Passo finale Luigi

Su una pagina ricaricata dall'origine con `Option-Command-R`:

1. da una pagina diversa dalla dashboard, far arrivare una richiesta reale e
   verificare se il doppio tono si sente nelle condizioni del salone;
2. aprire il pallino e verificare che porti alle richieste;
3. spegnere il suono, ricaricare e verificare che resti spento;
4. riportare il conteggio a zero e controllare che l'`Hero` torni identico.

La domanda resta: `cosa non ti torna?`.
