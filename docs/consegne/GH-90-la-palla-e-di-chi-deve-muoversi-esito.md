# GH-90 - La palla e' di chi deve muoversi: esito

## Esito e perimetro

**Mandato eseguito.** Le richieste pending hanno ora una sola classificazione
condivisa; pallino, suono, dashboard e `/requests` contano soltanto cio' che
richiede un'azione del salone. La vista completa continua a mostrare tutti i
pending. Build e banco browser verdi.

Root `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
Base `main`: **abd6c3623b96ea0876ac634109eb37a8df899253**.
Commit di codice e registro: `fix: classify appointment request ownership (GH-90)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-90-la-palla-e-di-chi-deve-muoversi-esito.md`.

Solo il demo **grooming-hub-demo**, ref **qttpinkslhenxrsbhhhg**, e' stato
letto per la controprova finale; nessuna tabella e' stata scritta. Produzione
mai letta o scritta. Nessun account creato, password cambiata, migrazione
applicata, policy, rotta o dipendenza aggiunta. Nessun push, merge o deploy.

## Tabella esaustiva dei file del commit

| File | Intervento / motivo |
|---|---|
| `src/apps/staff/lib/database.js` | Cinque campi risposta nella SELECT condivisa, classificazione unica, riepilogo e conteggi unici, mapping strutturato e legacy |
| `src/apps/staff/components/StaffRequestAlerts.jsx` | Pallino e set di identificativi sonori limitati alle richieste azionabili; meccanica audio invariata |
| `src/apps/staff/pages/Dashboard.jsx` | Riquadro operativo separato per da rispondere/da prenotare, dettaglio corrente e accesso rapido che conserva le attese |
| `src/apps/staff/pages/CustomerRequests.jsx` | Rimozione della seconda query di arricchimento, etichetta di responsabilita' sulle schede e statistiche coerenti |
| `supabase/migrations/20260913_gh89b_drop_legacy_respond_and_require_time.sql` | Seconda meta' GH-89 fornita da Luigi; inclusa immutata e non applicata da Codex |
| `docs/consegne/GH-90-la-palla-e-di-chi-deve-muoversi-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-90/browser-check.mjs` | Banco riproducibile con applicazione e SDK reali, HTTP in memoria |
| `docs/consegne/evidenze/GH-90/browser.json` | Stati, quattro dashboard, transizioni audio, conteggi e misure layout |
| `docs/consegne/evidenze/GH-90/live-browser-check.mjs` | Verifica `/requests` sul demo con account staff gia' documentato, senza password nel file |
| `docs/consegne/evidenze/GH-90/live-browser.json` | Conteggio UI vivo, ref e assenza di errori pagina |
| `docs/consegne/evidenze/GH-90/staff-invariants.sha256` | 26 impronte delle altre pagine/componenti staff |
| `docs/consegne/evidenze/GH-90/dashboard-new-375.png` | Dashboard con richiesta nuova |
| `docs/consegne/evidenze/GH-90/dashboard-waiting-375.png` | Dashboard con sola attesa della persona |
| `docs/consegne/evidenze/GH-90/dashboard-chosen-375.png` | Dashboard con slot scelto da prenotare |
| `docs/consegne/evidenze/GH-90/dashboard-declined-375.png` | Dashboard con proposte rifiutate |
| `docs/consegne/evidenze/GH-90/requests-three-states-375.png` | Tutti e tre gli stati visibili insieme |

Fuori da modifica, stage e commit:
`docs/incarichi/GH-90-la-palla-e-di-chi-deve-muoversi.md`, documento di
Luigi/Cowork. Nessun diario o altro mandato toccato.

Il file SQL e' stato autorizzato espressamente perche' `scripts/salva.sh` non
pubblica `supabase/`. Dichiarazione di Luigi: **applicato in produzione, non
ancora al demo**. Codex non ha verificato la produzione e non ha applicato il
file al demo. SHA-256 iniziale e finale:
`716f5b0a2f7613e683b19c6d48861c8564b95e81ae87332c42841b5ea862623e`.

## Un solo criterio

`APPOINTMENT_REQUEST_SELECT` legge ora insieme:
`chosen_date`, `chosen_time`, `chosen_time_preference`, `customer_response` e
`customer_responded_at`. La seconda SELECT che `CustomerRequests.jsx` usava
per arricchire la stessa lista e' stata rimossa.

`getAppointmentRequestStaffAction` e' l'unico classificatore e riusa, senza
modificarla, `currentAlternativeResponse`:

| Stato | Regola unica | Chi si muove |
|---|---|---|
| `needs_response` | Nessuna proposta corrente, risposta corrente `declined`, oppure richiesta legacy | Salone |
| `waiting_customer` | Proposte presenti e nessuna risposta corrente | Persona |
| `needs_booking` | Risposta corrente `accepted` e slot ancora fra le proposte | Salone subito |

`summarizePendingAppointmentRequests` e' l'unico riepilogo: restituisce le tre
raccolte, la raccolta `actionable` e i cinque conteggi. I consumer non
riclassificano e non contano autonomamente le righe. Una richiesta legacy e'
sempre `needs_response`.

Ricerca esaustiva:

```sh
rg -n "getAppointmentRequestStaffAction|summarizePendingAppointmentRequests|staff_action|counts\.actionable|actionable\.length|pendingRequests\.length" src/apps/staff/lib/database.js src/apps/staff/components/StaffRequestAlerts.jsx src/apps/staff/pages/Dashboard.jsx src/apps/staff/pages/CustomerRequests.jsx
```

Risultato: un classificatore e un riepilogo in `database.js`; tre consumer del
riepilogo; `actionable.length` soltanto dentro il riepilogo; zero conteggi
locali `pendingRequests.length` nei quattro file.

## Pallino e suono

Numeri misurati sui quattro casi singoli:

| Caso | Pallino |
|---|---:|
| Nuova, nessuna proposta | 1 |
| Proposta senza risposta | 0 |
| Slot scelto | 1 |
| Proposte rifiutate | 1 |

Transizione misurata mantenendo lo stesso identificativo:

1. primo caricamento con richiesta nuova: 0 toni, come prima;
2. il salone propone: il set azionabile passa da 1 a 0, **0 toni**;
3. la persona sceglie: lo stesso ID rientra nel set azionabile, pallino 1 e
   **2 avvii oscillatore**, cioe' lo stesso doppio tono di GH-81.

Non sono cambiati intervallo pubblico `60_000 ms`, visibilita', blocco
richieste concorrenti, memoria localStorage, silenzio iniziale, confronto per
`request_kind:id`, frequenze, forma d'onda o controllo di silenziamento.

## Dashboard e vista completa

Testi esatti nei quattro casi:

| Caso | Riquadro operativo | Riga | Accesso rapido |
|---|---|---|---|
| Nuova | `1 richiesta a cui rispondere` | `Rumba · 15/09 · da rispondere` | `1 da gestire` |
| Proposta senza risposta | **assente** | nessuna riga operativa | `0 da gestire · 1 in attesa della persona` |
| Slot scelto | `1 richiesta da prenotare` | `Rumba · 17/09 alle 17:30 · da prenotare` | `1 da gestire` |
| Proposte rifiutate | `1 richiesta a cui rispondere` | `Rumba · proposte rifiutate · da rispondere` | `1 da gestire` |

Questa e' la soluzione alla tensione del mandato: con sola attesa della
persona il riquadro terracotta non chiama il salone, ma la scheda di accesso
rapido dichiara che una richiesta esiste e indica chi deve muoversi. Aprendo
`/requests` la riga non sparisce.

La data desiderata compare soltanto nella richiesta nuova, dove e' ancora
utile. Dopo una scelta compare data+ora scelte. Dopo un rifiuto compare lo
stato corrente e **non** `15/09`, ormai superato.

Con tre fixture contemporanee, `/requests` mostra **3 schede su 3 righe
sorgente**: `Da rispondere`, `In attesa della persona`, `Da prenotare`.
Statistiche: `Da gestire 2`, `Da prenotare 1`, `In attesa persona 1`.
Pallino **2**, accesso rapido **2 da gestire**: conteggio e resa coincidono.

Una fixture legacy appare, conta 1 ed e' `Da rispondere`. Nel secondo giro,
con vecchia risposta accepted alle 05:01 e nuova proposta alle 05:02,
`currentAlternativeResponse` restituisce null: stato `waiting_customer`,
pallino 0. La regola GH-87 resta intatta.

## Misura viva demo

SQL read-only sul solo ref `qttpinkslhenxrsbhhhg`:

```text
structured pending: 0
legacy pending:     0
totale SQL:         0
```

Accesso browser con l'account staff gia' documentato, senza esporre o cambiare
la password: `/requests` mostra **0 schede**, pallino **0** e testo
`Nessuna richiesta in attesa`; **0 page error**. SQL e schermo coincidono
**0 = 0**. Durata prova viva 5,976 s. Il login non ha creato account ne'
modificato dati applicativi.

Nessuna suite RLS rieseguita, come prescritto. Ultima misura viva GH-89 del
13/09: **60 PASS, 0 FAIL, 0 SKIP**; non viene presentata come misura GH-90.

## Mobile e invarianti

Banco finale locale: app e SDK reali, HTTP Auth/REST in memoria, WebSocket
chiusi, font remoti neutralizzati; 0 destinazioni impreviste e 0 page error.
Sei stati puri, quattro dashboard, legacy, secondo giro e transizione audio;
durata **4,190 s**.

Cinque viste a 375x812: overflow orizzontale massimo **0 px**, overlap fra
copy e comandi Hero **0 px**, 0 controlli troncati, 0 nuovi target sotto
44 px. L'eccezione preesistente del link `Grooming Hub` resta esclusa come da
GH-87. Nessun colore, CSS o geometria modificati.

Durante il banco un primo screenshot mostrava glifi incompleti: non era un
overlap del prodotto ma un repaint provocato dal polling ridotto artificialmente
a 80 ms. Limitata l'accelerazione alla sola prova audio, le schermate a polling
reale sono complete; le scatole Hero misurate sono copy 247 px, comandi 92 px,
gap 10 px, overlap 0.

`src/apps/customer`: **0 file differenti** dalla base. Impronta di
`appointmentResponses.js` prima/dopo identica:
`ed167d97f5e5afc49e6f5a11c43ad193a0b076194a7e09ecd2d120f096b98bac`.

`Calendar.jsx` e `CalendarKit.jsx` non hanno diff:

- Calendar: `a11796d61136af77fa6467f042ac3af78b94f2c8e7c3032eb41c680e6a0ccbd0`
- CalendarKit: `029b08d5d9a80b762b0e9a24c49ed56bd76216729dfd1954e74cb6ceadc33088`

Fra pagine/componenti staff cambiano solo i tre file autorizzati. Le altre
**26 impronte** coincidono con la base e sono in `staff-invariants.sha256`.

`npm run build`: **165 moduli**, Vite 1,18 s, totale **1,55 s**. Avvisi non
bloccanti preesistenti: `caniuse-lite` da aggiornare e chunk JS oltre 500 kB.
Nessuna dipendenza aggiornata. `npm run lint` non e' stato ripetuto: GH-89 ha
gia' misurato che lo script dichiara `eslint`, ma il binario non e' installato.

Finestra dalla prima modifica applicativa al completamento delle prove:
**06:39:26-06:48:50 CEST, 9 min 24 s**; esclude ricognizione e stesura del
registro. Un singolo `apply_patch` sul banco temporaneo ha impiegato 17,7 s;
browser 3,5-4,2 s, build e filesystem successivi regolari. Nessun rallentamento
persistente osservato.

## Fonti, eccezioni e passo finale

Consultata la documentazione Supabase corrente su SELECT con contesto Auth e
RLS; nessuna API nuova, DDL o policy introdotta. L'indice
`https://supabase.com/changelog.md` non e' stato leggibile dal fetch per
content-type `text/markdown`; non incide su questa classificazione locale.

Nessuna estensione fuori mandato. L'unica inclusione aggiuntiva e' il SQL
GH-89b autorizzato, immutato e non applicato. Il mandato GH-90 resta fuori.

Resta lo sguardo di Luigi: proposta di tre ore, controllo dashboard, scelta
dal telefono e ritorno al gestionale. Verificare in due secondi se si capisce
chi deve muoversi e annotare **cosa non torna**, non un generico "funziona".
