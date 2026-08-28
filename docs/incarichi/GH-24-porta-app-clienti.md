# Incarico GH-24 — La porta dell'app clienti

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026

> **È il cancello principale di G6.** Senza questo giro, l'app clienti al lancio non è raggiungibile da nessun cliente.
>
> Dichiara le invarianti, non la procedura: cosa deve essere vero è scritto, il metodo lo scegli tu.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessuna migration, nessun deploy, nessun push. **Database ammesso: solo il demo**; produzione e progetto temporaneo vietati.

## Il fatto, misurato

L'app clienti costruita in queste settimane — home, promozioni, scheda pet, wizard di richiesta — **non ha un ingresso**.

- Il link d'invito generato dallo staff (`database.js:262`) punta a `${origin}/portal/invite/${token}`, cioè al **vecchio portale**. Chi lo apre finisce in `CustomerPortal.jsx`, che abbiamo deliberatamente escluso dal restyling.
- La QR card pubblica manda a `/portal` e `/portal/login`: stesso vecchio portale.
- `/u/redeem/:token` è **un segnaposto di 71 righe con zero chiamate al database**, scritto a maggio con l'annotazione «l'integrazione vera arriva in uno step successivo».
- L'unico consumatore reale di `accept_customer_invite` è il vecchio `CustomerInvite.jsx`.

Oggi l'app nuova si raggiunge **solo digitando `/u/login`**.

## L'ordine è vincolante

Il redirect della radice verso `/u/login` — che manda al posto sbagliato chi cerca il gestionale — **è attualmente l'unica porta dell'app clienti**. Spostarlo prima di aver aperto le altre lascerebbe i clienti senza ingresso.

Quindi: **prima si apre la porta nuova, poi si sposta la radice.** Se per qualsiasi ragione la prima parte non si completa, **la seconda non si fa**, e va dichiarato.

## Invarianti — cosa deve essere vero alla fine

**Un cliente invitato entra nell'app nuova.** Il percorso completo funziona dal gesto reale: lo staff genera l'invito, il link porta all'app clienti, il cliente stabilisce l'accesso e atterra nella home nuova. La RPC `accept_customer_invite` è quella già esistente e verificata: **non se ne scrive una seconda**, non si modifica lo schema.

**Il segnaposto diventa una pagina vera.** `/u/redeem/:token` gestisce i casi reali, non solo quello felice: token valido, token già usato, token inesistente o scaduto, utente già autenticato che apre un invito. Ogni esito dice cosa è successo e cosa fare, nel tono dell'app clienti — che informa e non sgrida.

**La pagina eredita la veste dell'app clienti.** Oggi ha stili inline e colori con valori di ripiego. Alla fine: zero stili inline salvo valori dinamici, zero colori letterali, nessun bersaglio sotto 44px sotto i 640px, stati di caricamento ed errore coerenti con le altre pagine `/u/`.

**La QR card porta il cliente dove deve.** Chi inquadra il codice e ha un'area cliente arriva nell'app nuova; chi non ce l'ha vede quello che vede oggi. **I codici già stampati devono continuare a risolvere**: la rotta pubblica `/client-card/:qrToken` non cambia.

**Solo dopo, la radice.** `/` porta al gestionale, che è il primo gesto quotidiano di Davide e Roby. I clienti arrivano dai loro percorsi — invito e QR — che a quel punto esistono.

**Nessuna rimozione.** `CustomerPortal.jsx`, `CustomerLogin.jsx`, `CustomerInvite.jsx` e le loro rotte **restano al loro posto e funzionanti**: gli inviti già spediti e i QR già stampati devono continuare a risolvere. La loro eventuale rimozione è un mandato separato, dopo un periodo di convivenza.

**Nessuna route rimossa o rinominata.** Nessuna query o mutazione alterata oltre alla costruzione degli URL. Nessun colore nuovo.

## Controprove

Dichiara nel registro, misurate: il **giro completo di un cliente nuovo sul demo** — invito generato dallo staff, link aperto, accesso stabilito, atterraggio nell'app nuova, e da lì almeno l'apertura di una scheda pet — con la fixture rimossa nella stessa sessione e zero residui; i quattro casi del token con il rispettivo esito; l'esito del QR reale per un cliente con area attiva e per uno senza; che la radice porta al gestionale **e che invito e QR continuano a funzionare dopo lo spostamento**; le tre larghezze sulla pagina d'invito; build verde.

Il metodo lo scegli tu. Il demo è ammesso: usa e ripulisci.

## Nota di metodo, per il registro

Questo buco è sopravvissuto a settimane di controprove rigorose perché **ogni verifica ha usato un account che esisteva già**. Le controprove misurano ciò che il mandato nomina: nessun mandato aveva mai nominato il primo accesso. Se durante il lavoro trovi altri percorsi che nessuno ha mai percorso da capo — non da rifare, solo da nominare — elencali in fondo alla consegna.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push.
