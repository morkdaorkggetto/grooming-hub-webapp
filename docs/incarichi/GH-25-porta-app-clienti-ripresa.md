# Incarico GH-25 — La porta dell'app clienti: ripresa

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026
**Riprende** `GH-24`, interrotto correttamente davanti a un blocco reale. Il registro dell'interruzione **è la diagnosi accettata** e non va rifatto.

> Dichiara le invarianti, non la procedura.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Migration ammessa**: una sola, idempotente. **Database ammesso: solo il demo**; produzione e progetto temporaneo vietati.

## Cancello di Luigi — nessun atto inizia senza

**Registrazione email/password abilitata sul demo, senza conferma via email.** È un gesto sul pannello Auth, non SQL, e resta di Luigi.

Decisione presa il 27/8 con la sua motivazione, da conservare: **la credenziale reale è il token dell'invito, non l'email.** Il link arriva su WhatsApp, a un numero che il salone già conosce e che è obbligatorio in anagrafica; le conferme delle richieste passano dallo stesso canale. Una conferma via email aggiungerebbe un passaggio, una dipendenza da un servizio di posta che non esiste, e un punto di rottura — in cambio di nulla, perché chi si registrasse senza token non otterrebbe alcuna membership e quindi nessun dato.

Conseguenza accettata: possono nascere auth user senza membership. Sono innocui per le RLS, vanno **contati e riportati**, non nascosti.

*(La stessa impostazione servirà in produzione: aggiunta ai cancelli di G6.)*

## Il blocco da rimuovere

Misurato in GH-24: `public.accept_customer_invite(text)` valida il token, crea il profilo, adotta il customer, collega il pet e marca l'invito — **ma non inserisce nulla in `tenant_memberships`**. Dal Gate 5 la membership è la fonte da cui l'app calcola il ruolo: `AuthProvider` legge solo quella, `useRequireCustomer` respinge chi non ha ruolo `customer`, `TenantProvider` non risolve il tenant.

**Il flusso d'invito è quindi rotto da GH-05-bis**, quando la fonte del ruolo è cambiata e questa funzione non è stata aggiornata. È rimasto invisibile perché nessuno ha mai accettato un invito nell'app nuova.

## Invarianti — cosa deve essere vero alla fine

**Una sola funzione, riscritta.** Non se ne crea una seconda: si riscrive `accept_customer_invite(text)` conservando firma, JSON di ritorno, `SECURITY DEFINER`, `search_path` pinnato e ACL limitata a `authenticated` e `service_role`. L'inserimento della membership avviene **dentro la stessa transazione** degli altri effetti: o riesce tutto, o non riesce nulla. Riapplicare la migration non produce righe doppie.

**La guardia del ruolo smette di fidarsi di un solo segnale.** Oggi controlla solo `profiles.role = 'operator'`, mentre questo progetto ha già misurato che profilo e membership possono divergere. Deve rifiutare anche chi possiede una membership `owner` o `staff`, **senza convertire silenziosamente il profilo di nessuno**.

**Un cliente invitato entra davvero.** Il giro completo funziona dal gesto reale: lo staff genera l'invito, il link porta all'app nuova, il cliente stabilisce l'accesso, ottiene esattamente **una** membership `customer` nel tenant dell'invito, e atterra nella home — senza che serva un ricaricamento manuale per vedersi riconosciuto.

**La pagina d'invito è una pagina vera**, non più il segnaposto di 71 righe. Gestisce token valido, già consumato, inesistente o scaduto, e utente già autenticato che apre un invito: **quattro esiti distinti e riconoscibili**, ciascuno che dice cosa è successo e cosa fare. GH-24 ha misurato che oggi token consumato e token inesistente ritornano lo stesso errore: se distinguerli richiede più della riscrittura autorizzata, dillo invece di forzare.

**Veste coerente con l'app clienti**: zero stili inline salvo valori dinamici, zero colori letterali, nessun bersaglio sotto 44px sotto i 640px, stati di caricamento ed errore come nelle altre pagine `/u/`.

**Il QR porta dove deve.** Chi inquadra e ha un'area cliente arriva nell'app nuova; chi non ce l'ha vede la card pubblica e trova un modo per accedere. **La rotta pubblica `/client-card/:qrToken` non cambia**: i codici stampati devono risolvere.

**Solo dopo tutto questo, la radice.** `/` porta al gestionale. **Se una qualsiasi delle invarianti precedenti non è soddisfatta, la radice non si sposta** — è lo stesso ordine vincolante di GH-24, che ha già evitato un danno.

**Nessuna rimozione.** Vecchio portale e sue rotte restano funzionanti: inviti già spediti e QR già stampati devono continuare a risolvere.

## Controprove

Le otto raccomandate da Codex in chiusura di GH-24, che adotto come contratto — signup dal link valido; esattamente una membership `customer` nel tenant giusto; profilo e membership divergenti rifiutati senza scritture; atterraggio su `/u/home` con apertura di una scheda pet; i quattro stati del token distinti; QR con e senza area cliente; **spostamento della radice solo dopo i passaggi precedenti**, con invito e QR riprovati dopo lo spostamento; advisor, suite RLS, tre larghezze, build e pulizia completa.

In più: **il conteggio degli auth user senza membership** prima e dopo il giro, che è la conseguenza accettata della decisione Auth e va misurata, non assunta.

Ogni fixture creata sul demo va rimossa nella stessa sessione con controprova di zero residui.

## Fuori perimetro, da nominare e non risolvere

GH-24 ha elencato quattro percorsi che nessuno ha mai percorso da capo. Restano fuori da questo mandato, ma il registro li richiami perché non si perdano: conferma email e ritorno al token; recupero password del cliente fino alla nuova sessione; QR aperto senza sessione con ritorno alla destinazione riservata; e soprattutto **la consegna reale del link** — oggi il gestionale lo genera e lo copia, ma non lo invia: qualcuno deve incollarlo a mano in WhatsApp, per ogni cliente.

## Se qualcosa non torna

Interruzione motivata: consegna valida. GH-24 lo ha appena dimostrato — ha costruito, misurato, trovato il blocco e ripristinato tutto lasciando diff zero. È il comportamento atteso, non un'eccezione.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push.
