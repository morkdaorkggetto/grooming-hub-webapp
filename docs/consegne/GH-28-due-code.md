# Consegna GH-28 - Due code

**Root dichiarata come primo atto:** `/Users/luigimaisto/Desktop/grooming-hub-web/`

**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`

**Stato:** completato

**Branch:** `feat/customer-app`

**Base Git:** `838f63d5fcb0bb4dafc45a3d954e6cbc3e248bff`

**Database usato per le sole sonde:** demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`)

**Commit:** `HEAD` del commit che contiene questo registro; hash riportato
anche nella consegna a Luigi.

Nessuna lettura o modifica a produzione e progetto temporaneo. Nessun deploy,
push, migration o modifica di schema.

## File della consegna

| File | Intervento |
| --- | --- |
| `docs/consegne/GH-28-due-code.md` | Registro di esecuzione, prove e cleanup. |
| `src/apps/staff/StaffApp.jsx` | Le deviazioni automatiche di un customer puntano a `/u/home`; il comportamento senza ruolo resta invariato. |
| `src/apps/staff/components/Auth/LoginForm.jsx` | Il login dalla porta staff riconosce il customer senza disconnetterlo; operatori e utenti senza ruolo conservano le verifiche precedenti. |
| `src/apps/staff/lib/fidelity.js` | Ogni livello e' raggiunto con visite **oppure** punti; il livello corrente e' il migliore dei due e conserva entrambe le misure. |
| `src/apps/staff/pages/ClientDetail.jsx` | Saldo punti, avanzamento visite/punti e via di raggiungimento sono leggibili insieme. |
| `src/apps/staff/pages/ClientCard.jsx` | Card interna: punti e visite restano entrambi visibili. |

## Controprove routing

| Caso | Esito misurato |
| --- | --- |
| Login customer dalla porta principale `/login` | `mario.rossi@test.example` arriva a `/u/home`; prima della correzione aggiuntiva `LoginForm` lo disconnetteva tentando `ensureOperatorProfile`. |
| Customer sulla radice `/` | Destinazione `/u/home`, heading `Bentornato, Mario.`. |
| Customer su rotta staff `/dashboard` | Deviazione a `/u/home`, nessun passaggio da `/portal`. |
| Customer su `/portal` scritto direttamente | Resta su `/portal`; portale storico caricato con heading `Area cliente`. Inviti e link preesistenti restano quindi risolvibili. |
| Staff sulla radice `/` | Sonda staff instradata a `/dashboard`, heading `Dashboard clienti`. |
| Utente senza ruolo | Login respinto come prima con `Account privo di membership staff`, permanenza su `/login` e sessione rimossa. |

La correzione aggiuntiva in `LoginForm.jsx` e' necessaria per l'invariante del
mandato: il solo cambio dei due `Navigate` portava il customer verso la nuova
app, ma il form staff lo aveva gia' disconnesso dopo il login.

## Controprove fidelity

Prova deterministica in memoria con visite tutte interne alle finestre. Esito:
**12/12 PASS**.

| Caso | Atteso e ottenuto |
| --- | --- |
| 30 visite + 10 punti | Argento; nessun declassamento a Base. |
| 36 visite + 1 punto | Oro; il punto non abbassa il livello. |
| 2 visite + 500 punti | Oro; elevazione tramite punti. |
| 12 visite + 0 punti | Bronzo; comportamento senza punti invariato. |
| Soglia visite 12 / 24 / 36 | Bronzo / Argento / Oro. |
| Soglia punti 100 / 250 / 500 | Bronzo / Argento / Oro. |
| Valore reale prod 150, simulato senza leggere prod | Bronzo. |
| Valore reale prod 500, simulato senza leggere prod | Oro. |

Lo snapshot espone inoltre `achievedByVisits`, `achievedByPoints`, livello
massimo per ciascuna via, saldo punti e visite mancanti. Non sono stati
aggiunti benefici, premi o soglie.

## Fixture e cleanup demo

Create solo per il browser:

- sonda staff esistente e idempotente `staff.sonda@test.example`, con membership
  `staff`;
- sonda GH-28 `norole.sonda@test.example`, senza membership e senza customer.

Rilettura finale dopo teardown:

| Residuo sonde | Conteggio |
| --- | ---: |
| `auth.users` | 0 |
| `auth.identities` | 0 |
| `auth.sessions` | 0 |
| `profiles` | 0 |
| `tenant_memberships` | 0 |
| `customers` | 0 |
| `customer_invitations` | 0 |

Controprova account customer reale di test non alterato: Mario conserva
1 membership customer e 1 riga customer.

## Verifiche locali

- `npm run build`: verde, 147 moduli; solo warning noto sul chunk oltre 500 kB
  e database Browserslist non aggiornato.
- `git diff --check`: verde.
- Controllo React sulle superfici modificate: nessun nuovo hook, waterfall,
  listener globale o dipendenza pesante; rendering derivato senza nuovo stato.
- `npm run lint`: non eseguibile per configurazione preesistente,
  `eslint: command not found`; nessuna dipendenza aggiunta fuori mandato.

## Fuori istruzione ed eccezioni

- `scripts/salva.sh` e' una modifica parallela preesistente gia' nota: non e'
  stato letto per GH-28, messo in stage o incluso nel commit.
- Il mandato individuava i due redirect in `StaffApp.jsx`; la prova reale ha
  scoperto il secondo blocco in `LoginForm.jsx`. E' stato corretto per chiudere
  l'invariante, senza cambiare signup, reset password o login senza ruolo.
