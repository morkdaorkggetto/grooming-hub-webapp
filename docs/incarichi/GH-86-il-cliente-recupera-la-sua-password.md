# Incarico GH-86 — Il cliente recupera la sua password

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Nasce dall'interruzione di `GH-84`.** Superficie: `apps/customer/pages/Forgot.jsx` e una rotta nuova sotto `/u`. **Nessuna colonna, nessuna funzione database.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

> **Blocca il lancio.** I clienti del salone non vengono invitati finché questo non è chiuso.

## Da dove nasce

`GH-84` si è fermato al cancello delle rotte condivise e nel farlo ha misurato una cosa più grande del suo oggetto:

> `src/apps/customer/pages/Forgot.jsx` — **«Il flusso di recupero password arriverà presto. Per il momento, contatta direttamente il salone per assistenza.»**

**Il recupero password per i clienti non esiste.** L'unico flusso funzionante parte da `LoginForm.jsx:23` — cioè da `/login`, **la porta del gestionale** — e riporta l'utente a `/login` dopo il reset (`ResetPassword.jsx:69-70`), anche quando è un cliente.

La pagina attuale è onesta: non promette un'email che non arriva. Ma la conseguenza è che **ogni persona che dimentica la password telefona al salone**, e stiamo per invitarne trecentoventi.

## Cosa fare

**Il cliente recupera la propria password restando nella propria area, dall'inizio alla fine.**

Tre pezzi, e nessuno di più:

1. **`/u/forgot` smette di essere un cartello.** Chiede l'indirizzo e chiama `resetPasswordForEmail`, con destinazione **dentro `/u`**;
2. **una pagina di reset sotto `/u`**, che raccoglie la nuova password sulla sessione di recupero;
3. **il ritorno finisce nell'area cliente**, non su `/login`.

### Il componente si riusa, la superficie no

`ResetPassword.jsx` fa già il lavoro: legge la sessione, chiama `updateUser({ password })`. **Non riscriverlo.** Se serve, estrai la parte comune e lascia allo staff il comportamento identico.

**Ma la pagina cliente è del cliente**: la lingua è quella di `GH-83` — è il salone che parla al proprietario — e l'aspetto è quello dell'app cliente, non del gestionale.

### Cosa questo mandato apparecchia per dopo

`GH-84` si era fermato perché `/reset-password` non ha un confine di ruolo. **Questo mandato ne crea uno per il cliente.** Non lo completa: `/login` continuerà ad autenticare entrambi i ruoli, e la separazione delle sessioni resta un mandato futuro.

**Non anticiparla.** Nessuna `storageKey`, nessuna modifica a `shared/supabase/client.js`. Se ti trovi lì, ti sei perso.

### Il vecchio percorso non si rompe

Chi ha in mano un link di recupero già inviato, o arriva da `/login`, **deve continuare a funzionare**. Il percorso staff resta esattamente com'è.

### Il limite che non puoi verificare tu

Le email partono solo se il progetto ha un SMTP configurato. **Non è nel tuo perimetro e non devi toccarlo.** Ma **dichiara nel registro** cosa hai potuto misurare e cosa no: se la prova dell'invio reale non l'hai fatta, dillo — **non scrivere che il recupero funziona se hai verificato solo la chiamata.**

È la regola che ha retto da `GH-64`: non dire che una cosa esiste quando non lo sai.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna funzione database, nessun dato scritto.**

**Nessuna modifica a `shared/supabase/client.js`.**

**Il percorso staff è intatto**: `/login`, `/reset-password` e `LoginForm.jsx` si comportano identici. Se il riuso del componente li tocca, **impronte prima e dopo**.

**Nessun indirizzo email confermato o negato all'utente.** Chiedere se un'email esista è un modo per scoprire chi è cliente del salone: la risposta è la stessa in entrambi i casi.

**La whitelist customer resta di tre colonne**: `owner_notes`, `coat_preferences`, `owner_photo_url`.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-85`.

## Controprove

Dichiara nel registro. **Testi esatti e misure, non aggettivi.**

- **il percorso intero del cliente**, passo per passo, con **l'URL a ogni passo**: da `/u/login` fino al rientro nell'area cliente. Nessun passo deve finire su una pagina del gestionale;
- **tutti i testi nuovi, per esteso**, uno per uno. Sono nella voce di `GH-83`: **nessuno chiama la persona «cliente»**;
- **la destinazione dell'email**: l'URL esatto passato come `redirectTo`, e la prova che **sta sotto `/u`**;
- **indirizzo inesistente e indirizzo esistente danno la stessa risposta**: riporta i due testi e verifica che siano identici;
- **il ritorno dopo il reset**: dove finisce. **Non `/login`**;
- **il percorso staff è intatto**: impronte di `LoginForm.jsx` e `ResetPassword.jsx`, o la parte condivisa dichiarata con impronte prima e dopo. Il fingerprint runtime staff resta quello di `GH-79`;
- **un link di recupero vecchio** — generato con la destinazione precedente — **non si rompe**;
- **cosa non hai potuto misurare**: l'invio reale dell'email. Dichiara la configurazione SMTP che hai potuto leggere e quella che non hai potuto;
- **`src/apps/staff` non ha diff**, oppure il diff è solo l'estrazione dichiarata: dimostralo;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio sotto i 44px;
- build verde. **Suite RLS: da rieseguire** — questo mandato tocca il recupero credenziali. Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

Con l'account cliente `ggetto@me.com`, **su un browser dove non sei operatore**:

1. **chiedi il recupero da `/u/forgot`**: arriva l'email? *(se non arriva, il difetto è l'SMTP, non questo mandato — ma è comunque un cancello del lancio)*
2. **segui il link**: la pagina che si apre sembra la tua app, o il gestionale?
3. **cambiata la password, dove ti ritrovi?**
4. **e la domanda che conta**: una persona che ha dimenticato la password arriva in fondo **senza telefonare al salone?**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-86-il-cliente-recupera-la-sua-password-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
