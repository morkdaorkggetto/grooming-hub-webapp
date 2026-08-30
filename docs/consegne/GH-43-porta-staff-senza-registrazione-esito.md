# Consegna GH-43 - La porta dello staff non e' una porta d'ingresso

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `c88146a`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), misurato `ACTIVE_HEALTHY`.
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, nuova rotta, dipendenza, impostazione Auth, scrittura
  permanente, push, merge o deploy.

## Esito

GH-43 e' completato. La pagina `/login` dello staff non contiene piu una
modalita di registrazione: sono stati rimossi lo stato che la attivava, il
gestore `handleSignUp`, la chiamata `supabase.auth.signUp`, il pulsante
`Registrati` e il messaggio che prometteva una conferma email.

Il modulo esegue soltanto `handleSignIn`. Chi non possiede un account legge:
`L'accesso allo staff viene attivato dal salone.` Il login esistente, il
recupero password e il completamento di una sessione staff priva di ruolo
restano disponibili. Tutti i `catch` della superficie conducono a uno stato
di errore visibile tramite `ErrorState`; non resta un percorso che riporti un
errore soltanto in console.

Le impostazioni Auth del progetto non sono state cambiate. Il percorso cliente
e quello di invito conservano la propria registrazione controllata.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/components/Auth/LoginForm.jsx` | modificato | Rimuove integralmente la registrazione staff e sostituisce il richiamo con l'indicazione operativa del salone. |
| `docs/consegne/GH-43-porta-staff-senza-registrazione-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex.

## Controprove sul demo

| Prova | Misurato | Esito |
| --- | --- | --- |
| Percorso di creazione account dalla porta staff | Nel componente e nella rotta `/login`: `0` chiamate `signUp`, `0` gestori o stati signup, `0` pulsanti o testi di registrazione | PASS |
| Login operatore esistente | Sonda canonica GH-04 autenticata come `0b33da67-01cd-43f5-8f6b-301084c0c001` | PASS |
| Login errato | API rifiutata con `Invalid login credentials`; il `catch` compone `Errore login: ...` e `ErrorState` rende `error` a schermo | PASS |
| Promesse di conferma email | `0` corrispondenze residue per registrazione o conferma nel componente staff | PASS |
| Indicazione per chi non ha account | Presente `L'accesso allo staff viene attivato dal salone.` | PASS |
| Invito cliente invariato | Signup con sessione immediata, `accept_customer_invite` accettata, profilo `customer=1`, membership `customer=1`, customer collegato `1`, pet `1`, invito accettato `1` | PASS |
| Conteggio utenti Auth | `3` prima; `5` al massimo durante le due sonde; `3` dopo il teardown | PASS |

Il controllo statico deterministico della porta staff ha prodotto `7 PASS`:
signup assente, registrazione assente, conferma email assente, submit diretto
al login, indicazione del salone presente, errore reso a schermo e rotta staff
collegata unicamente a `LoginForm`.

## Ricognizione password dimenticata

Nessuna correzione e' stata applicata a questo flusso, come richiesto.

- Con l'indirizzo tecnico `staff.sonda@test.example`, Supabase rifiuta la
  richiesta prima dell'invio con `Email address ... is invalid`; la pagina
  mostra `Errore reset password: ...`.
- Con l'indirizzo Gmail valido della fixture, la richiesta `/recover` ha
  restituito HTTP `200`; la pagina mostra
  `Ti ho inviato il link per reimpostare la password.`
- I log Auth registrano sia `user_recovery_requested` sia `mail.send`, con
  tipo `recovery` e destinatario corretto. L'invio e' quindi partito dal
  servizio; la consegna finale nella casella non e' stata verificata da un
  accesso alla posta.
- Il mittente misurato e' `noreply@mail.app.supabase.io`: il demo si appoggia
  al servizio email predefinito di Supabase, non a un SMTP del salone.
- La documentazione Supabase corrente dichiara per il servizio predefinito un
  limite complessivo di `2 email/ora` e disponibilita best-effort, e raccomanda
  SMTP personalizzato per la produzione.

Conclusione della sola ricognizione: il gesto oggi invia davvero sul demo e il
messaggio non e' falso nel caso valido, ma il recupero della chiave operativa
dipende da un servizio condiviso con limiti non adatti alla produzione. La
scelta fra chiuderlo o dotarlo di SMTP affidabile resta fuori da GH-43.

## RLS, build e pulizia

- Suite RLS demo: `30 PASS, 0 FAIL, 1 SKIP`; lo skip e' quello previsto per
  l'assenza di un secondo tenant reale.
- Fixture suite RLS: `0` residui marker secondo il teardown interno.
- Fixture GH-43 finali: `0` utenti sonda, `0` identita, `0` profili, `0`
  membership, `0` customer, `0` pet e `0` inviti.
- Utenti Auth finali: `3`, identici al conteggio iniziale.
- `npm run build`: PASS, Vite 5.4.21, 155 moduli trasformati, bundle JS
  672.56 kB (gzip 190.08 kB).
- `git diff --check`: PASS.
- Warning build non bloccanti e preesistenti: Browserslist datato e bundle
  principale sopra 500 kB.
- Nessun segreto o credenziale usa-e-getta e' stato scritto nei file o incluso
  nel commit.

## Eccezioni e fuori istruzione

- Il primo tentativo di creare la sonda staff e' stato bloccato prima di ogni
  scrittura perche il mandato dichiarava `nessun dato in gioco`. Luigi ha poi
  autorizzato esplicitamente le sole fixture usa-e-getta GH-43 sul demo, con
  teardown nella stessa sessione. L'eccezione e' stata applicata entro questi
  limiti e tutti i conteggi sono tornati alla base.
- Il primo controllo statico aveva una sostituzione involontaria della shell
  nella stringa di prova e ha prodotto un falso `FAIL` sul solo verificatore,
  senza eseguire codice applicativo ne modificare file. La prova e' stata
  riscritta senza interpolazione e ha chiuso `7 PASS`.
- Nessuna attivita e' stata eseguita sulla produzione e nessuna estensione
  funzionale e' stata applicata fuori GH-43.

## Nota aperta e soluzione consigliata a Cowork

Il recupero password staff funziona sul demo ma usa il mailer condiviso di
Supabase. Per la futura chiave operativa del salone, la soluzione raccomandata
e' un mandato separato che configuri un SMTP transazionale del salone e provi
consegna, link di ritorno e cambio password completo. File applicativi
probabili: `LoginForm.jsx` e `ResetPassword.jsx`; oggetto esterno: Auth SMTP e
redirect URL del progetto. Controprove minime: invio reale, ricezione in
casella, apertura del link, password nuova valida, vecchia password rifiutata,
rate limit e messaggio d'errore visibile. Rischi residui: deliverability,
scadenza o scansione automatica del link e dipendenza dal provider email.

## Passo umano di Luigi

Dopo il rilascio, aprire `/login` staff e cercare una via di registrazione.
La domanda e': e' chiaro che l'accesso viene attivato dal salone, senza che la
pagina sembri un vicolo cieco?

## Commit

Commit locale della consegna con messaggio
`fix: remove staff self-registration`. Nessun push eseguito.
