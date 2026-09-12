# GH-86 - Il cliente recupera la sua password

## Esito e perimetro

**Implementato e verificato in memoria. Mandato non ancora chiuso:** suite
RLS sospesa in attesa dell'autorizzazione alle sue scritture temporanee;
consegna effettiva dell'email e prova finale di Luigi ancora da verificare.
Non considerare sbloccato il lancio.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp/`.
- Branch `main`; base `a3e1bbb4c99034906a23a7cac825d63f5a0e5279`.
- Mandato: versione locale non versionata di GH-86, nominata da Luigi.
- Demo ammesso `qttpinkslhenxrsbhhhg`: `get_project` lo ha restituito
  `ACTIVE_HEALTHY`. Nessuna query sui dati, nessuna scrittura reale, nessuna
  modifica Auth/SMTP. Produzione e altri progetti non consultati.
- Nessuna migration, schema, policy, funzione database o dipendenza nuova.
  Nessuna storageKey; `shared/supabase/client.js` intatto. Whitelist pet
  intatta: `owner_notes`, `coat_preferences`, `owner_photo_url`.

## Implementazione

`/u/forgot` chiede l'email e invia la richiesta Auth con destinazione
`${window.location.origin}/u/reset-password`. La nuova pagina usa il medesimo
hook estratto dal reset staff, con testi e ritorno customer. Dopo l'update
della password e il signOut, ritorna a `/u/login`; il successivo accesso porta
a `/u/home`. La separazione delle sessioni di GH-84 NON e' anticipata.

La parte comune conserva i default staff: testi, validazioni, updateUser,
signOut e ritorno a `/login` dopo 1200 ms. Solo la variante customer blocca
il form senza sessione o con errore recovery nell'URL e usa errori non tecnici.
Il markup dello staff non e' stato riscritto.

Il layout riusa la cornice di Forgot, Card e Brandmark esistenti, token e
misure dei controlli customer. Nessun CSS globale o token modificato;
larghezza della card vincolata al contenitore, nessun colore nuovo.

## File del commit

| File relativo a webapp | Intervento |
|---|---|
| `src/apps/customer/CustomerApp.jsx` | Unica nuova rotta `/u/reset-password`. |
| `src/apps/customer/pages/Forgot.jsx` | Email, chiamata recovery, risposta neutra e stato di indisponibilita'. |
| `src/apps/customer/pages/ResetPassword.jsx` | Pagina customer che usa la logica condivisa. |
| `src/apps/customer/components/RecoveryLayout.jsx` | Cornice riusata dalle due pagine, stili locali e ritorno customer. |
| `src/shared/auth/usePasswordReset.js` | Estrazione della logica staff, destinazione e messaggi parametrizzati. |
| `src/apps/staff/pages/ResetPassword.jsx` | Solo import/invocazione dell'hook al posto della logica inline; JSX identico. |
| `scripts/gh86-browser-check.mjs` | Banco riproducibile con App e SDK reali, HTTP simulato e baseline staff fissata alla base. |
| `docs/consegne/evidenze/GH-86/gh86-browser-measures.json` | Misure finali, richieste senza credenziali, impronte e fingerprint staff. |
| `docs/consegne/evidenze/GH-86/gh86-staff-baseline.json` | Misure con il componente reset staff originale caricato dalla base Git. |
| `docs/consegne/evidenze/GH-86/forgot-375.png` | Modulo email mobile. |
| `docs/consegne/evidenze/GH-86/forgot-response-375.png` | Risposta neutra mobile. |
| `docs/consegne/evidenze/GH-86/reset-375.png` | Nuova password mobile. |
| `docs/consegne/evidenze/GH-86/expired-375.png` | Link scaduto mobile. |
| `docs/consegne/evidenze/GH-86/forgot-1365.png` | Modulo email desktop. |
| `docs/consegne/evidenze/GH-86/reset-1365.png` | Reset desktop. |
| `docs/consegne/GH-86-il-cliente-recupera-la-sua-password-esito.md` | Registro nello stesso commit. |

## Prove locali

Chromium headless, app completa e Supabase SDK installato; nessun mock dei
componenti o dei metodi Auth. Il trasporto HTTP verso il solo ref demo e'
intercettato e risposto in memoria; qualunque altra destinazione imprevista
viene bloccata. Chiave API volutamente fittizia, env reali disabilitate nel
banco. Nessuna email spedita, nessuna password reale modificata. Le password
nel test sono stringhe sintetiche, non credenziali delle sonde.

| Prova | Misura |
|---|---|
| Percorso customer | `http://127.0.0.1:5173/u/login` -> `/u/forgot` -> `/u/reset-password` -> `/u/login` -> `/u/home`, sempre sulla stessa origine. URL completi e ricaricamenti nel JSON. |
| Destinazione richiesta email | Esattamente `http://127.0.0.1:5173/u/reset-password`, misurata nel parametro HTTP `redirect_to` prodotto dall'SDK. |
| Email vuota | Submit nativo impedito, 0 richieste recovery. |
| Email esistente/inesistente | Fixture esistente 200, inesistente 400 user_not_found: stesso testo integrale sotto. Nessun messaggio API riportato a schermo. |
| Indisponibilita' | 500, 429 e rete assente: errore operativo generico; nessuna conferma di invio. |
| Password mancanti/corta/diversa | Tre testi distinti, 0 update prima del superamento delle validazioni. |
| Update rifiutato | Errore generico, non il dettaglio API; poi nuovo tentativo riuscito. |
| Ricaricamento recovery | Pagina ricaricata dopo consumo del frammento: sessione disponibile, form utilizzabile. |
| Sessione assente/link scaduto | Nessun campo password; link per richiedere un nuovo recupero. |
| Link scaduto con sessione preesistente | `?error_code=otp_expired` blocca il form invece di usare la vecchia sessione. |
| Vecchio link staff | Recovery con destinazione `/reset-password`, update e ritorno `/login` riusciti in memoria. |
| Mobile/desktop | 12 misure di layout, viewport 375x812 e 1365x900: overflow massimo 0 px, target minimo 44 px, 0 controlli troncati. |
| Runtime | 0 pageerror, 0 destinazioni di rete impreviste. Gli HTTP d'errore sono deliberati nel banco, non si dichiara una console senza messaggi di rete. |

**Risposte identiche misurate:**

- Esistente: «Se questo indirizzo è associato al tuo account, riceverai un link per scegliere una nuova password. Controlla anche la posta indesiderata.»
- Inesistente: «Se questo indirizzo è associato al tuo account, riceverai un link per scegliere una nuova password. Controlla anche la posta indesiderata.»

Questa e' una prova dell'interfaccia, non un audit anti-enumerazione del server
Auth o dei tempi di risposta. Errori infrastrutturali restano distinguibili
come indisponibilita', senza dire se l'indirizzo appartiene a qualcuno.

## Testi introdotti nella superficie customer

1. «Recupera la tua password»
2. «Inserisci l'indirizzo che usi per accedere alla tua area.»
3. «Il tuo indirizzo email»
4. «Invia il link»
5. «Invio in corso...»
6. «Se questo indirizzo è associato al tuo account, riceverai un link per scegliere una nuova password. Controlla anche la posta indesiderata.»
7. «Non riusciamo a inviare la richiesta in questo momento. Attendi un po’ e riprova.»
8. «Scegli la tua nuova password»
9. «Usa almeno 6 caratteri per proteggere la tua area.»
10. «Nuova password»
11. «Conferma la nuova password»
12. «Salva la nuova password»
13. «Salvataggio in corso...»
14. «Stiamo verificando il tuo link...»
15. «Questo link non è valido o è scaduto. Richiedine uno nuovo per scegliere la tua password.»
16. «Scrivi e conferma la tua nuova password.»
17. «Scegli una password di almeno 6 caratteri.»
18. «Le password non coincidono. Controlla e riprova.»
19. «La tua password è stata aggiornata. Ora puoi accedere alla tua area.»
20. «Non siamo riusciti ad aggiornare la tua password. Riprova o richiedi un nuovo link.»
21. «Richiedi un nuovo link»
22. «Torna ad accedere»
23. «Vai alla home» (nome accessibile del marchio, riusato).

Nessuno chiama la persona "cliente". I testi staff nell'hook sono quelli
precedenti e restano fuori dalla variante customer.

## Impronte staff e invarianti

SHA-256 prima/dopo:

| Oggetto | Prima | Dopo |
|---|---|---|
| LoginForm.jsx | `3df5cacca45ec1a35710ad4fa90ea073e4d0aa468f476814534fd57a44c63a50` | identico |
| Staff ResetPassword.jsx | `660df614e27e0478f03b88ba5e240c5936fe3103e43d6248a7c9e99d911280c2` | `2faf42a3931c2a3447dac8e9ad73e801de33b6b319eb70f138917a55f61bc938` |
| JSX restituito dal reset staff (estrazione AST) | `abeca55610225a9498df8cef25a25319b6c4f05fdb86b14803f768ac65a688ed` | identico |
| DOM runtime reset staff pronto | `0ec4807788c2fbc5108ff4950a9aaa40d6b2ec4151cc2b17d05cbb55db50c2cf` | identico alla baseline caricata da Git |
| shared/supabase/client.js | `b7beec0348b3555cb2684588e9dd0afbc364b050048d9e717f74e74fe722019f` | identico |

`git diff --name-only -- src/apps/staff src/shared/supabase supabase` restituisce
solo `src/apps/staff/pages/ResetPassword.jsx`: l'estrazione dichiarata.
StaffApp e LoginForm non cambiano; vecchia rotta e destinazione email intatte.

Il fingerprint runtime GH-79 e' stato rieseguito sul componente crop reale,
senza modificare file o upload: descrizione originale, frame **280x280**,
`rounded-3xl`, non circolare, pulsanti «Chiudi», «Annulla», «Usa questa foto».
Impronte immutate del componente e helper nei JSON. La nuova rotta customer
e' l'unica aggiunta; nessuna lettura/scrittura a pets aggiunta.

## Email reale, RLS e indicazioni a Cowork

**Non e' provato che un'email arrivi.** Non e' stato generato o seguito un
link reale, ne' usato l'account personale indicato nel passo finale. Il link
vecchio provato e' equivalente per destinazione e formato recovery, ma ha
token sintetici: non e' un'email storica del salone.

Configurazione SMTP letta: **nessuna**. Il collegamento disponibile restituisce
stato del progetto, non configurazione SMTP/Auth. Host, mittente, porta,
abilitazione custom SMTP, template e allowlist redirect restano **non verificati**;
nessuna credenziale SMTP cercata, letta o modificata.

Prima della prova manuale, Cowork/Luigi devono verificare che l'origine scelta
con `/u/reset-password` sia ammessa e che il template recovery rispetti la
destinazione richiesta. SMTP non e' l'unica causa possibile di mancato recapito
o ritorno sbagliato: anche limiti invio, allowlist e template vanno distinti.
Fonti consultate: [redirect e template](https://supabase.com/docs/guides/auth/redirect-urls),
[SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
e [updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser).
L'indice changelog .md non e' stato recuperato (content-type non supportato dal
browser di ricerca, DNS non disponibile nella shell sandbox); API confrontate
con documentazione e SDK locale, nessun aggiornamento dipendenze.

**RLS non eseguita.** `scripts/rls-tests/run.mjs` non e' read-only: crea pet,
visite, richieste e oggetti Storage, aggiorna marker e poi ripristina. Il
mandato richiede la suite ma vieta qualsiasi scrittura e ammette solo fixture
in memoria. Ho chiesto a Luigi un'eccezione circoscritta; nessuna risposta
ricevuta al momento di questo registro. Non ho interpretato le scritture come
implicitamente consentite. I 60 PASS di GH-78 restano una misura storica,
non una prova GH-86.

Soluzione consigliata: autorizzare soltanto l'esecuzione della suite esistente
sul demo con ripristino verificato, senza creare nuovi account o toccare le
password. Se l'eccezione non e' concessa, mantenere questa consegna parziale:
una simulazione non sostituisce la prova RLS viva. Separazione storageKey e
ambiguita' del login staff restano nel mandato successivo, non in questo.

## Verifiche, tempi e chiusura locale

- Banco finale: **PASS**, 5 gruppi di percorso, 12 misure layout, fingerprint
  GH-79; durata **5,583 s**. Baseline reset staff: **5,372 s**.
- Build finale: **PASS**, 163 moduli, **1,05 s Vite / 1,25 s wall**. Soli
  warning preesistenti Browserslist e chunk oltre 500 kB.
- `git diff --check`: PASS. Nessun lint dichiarato come eseguito.
- Intervallo cronometrato: **12/9/2026 09:43:11-09:53:43 UTC**, **10 min 32 s**,
  da consultazione tecnica iniziale al completamento delle prove. Include
  scrittura codice, correzioni del banco e attese tool; esclude letture
  precedenti non cronometrate e stesura/commit del registro successivi.
- Nessun rallentamento disco rilevato nelle letture. Il primo avvio browser
  richiedeva permesso di ascolto localhost; il banco e' stato poi avviato con
  autorizzazione dello strumento.
- Errori del banco corretti: campi tecnici null aggiunti dall'SDK al payload
  password; selezione testuale del return confusa con cleanup, sostituita con
  parser AST. Un comando di riepilogo aveva una parentesi in eccesso, corretto.
  Una patch iniziale e' stata respinta prima di applicarsi. Nessuno di questi
  passaggi ha scritto dati reali o modificato il perimetro applicativo.

Per ripetere: `GH_PLAYWRIGHT_MODULE=<percorso assoluto al modulo Playwright>
node scripts/gh86-browser-check.mjs`; con `GH86_BASELINE=1` viene caricato il
vecchio reset staff dalla base dichiarata. Playwright usa il runtime Codex
gia' disponibile, non e' una nuova dipendenza del progetto. Agent-browser non
era disponibile nel PATH, per questo il banco usa Playwright direttamente.

Server locale lasciato disponibile: `http://127.0.0.1:4177/u/forgot` (HTTP 200).
Le env di questo server sono state verificate puntare al **demo**; diversamente
dal banco, un invio manuale da questa pagina fa una richiesta Auth reale.
Nessun modulo e' stato inviato da Codex sul server live.

Esclusi e intatti: i documenti non versionati GH-84, GH-85 e CD-08 confermati
da Luigi; anche GH-86, mandato nominato ma non file da pubblicare per Codex.
Nessuna attivita' fuori istruzione. Nessun push, merge o deploy.

Commit locale identificabile con `git log -1 --format=%H --
docs/consegne/GH-86-il-cliente-recupera-la-sua-password-esito.md`; hash
effettivo comunicato a Luigi. Codice e registro nello stesso commit.

## Passo Luigi ancora aperto

Dopo verifica configurazione e sul browser senza sessione operatore:
richiedere il recupero dall'area proprietario, controllare l'arrivo della mail,
seguire il link, cambiare password e rientrare nell'area proprietario.
L'account indicato dal mandato va usato solo nell'ambiente a cui appartiene;
non e' stato cercato o ricreato nel demo. Domanda finale: **cosa non ti torna?**
