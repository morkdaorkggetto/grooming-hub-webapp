# Incarico GH-102 — Cosa può raggiungere un cliente

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 settembre 2026

> **Audit. Questo mandato non cambia niente.** Nessuna riga sotto `src/`, nessuna migrazione. **La consegna è il registro.** Stessa forma di `GH-100`.

**Perimetro**: lettura del codice e del database **del solo demo**; le scritture temporanee della suite RLS sono ammesse e dichiarate. **La produzione non si tocca, nemmeno in lettura.** Nessun push, merge o deploy.

## Da dove nasce

Stiamo per invitare **circa 320 persone**. Da quel momento ognuna avrà un account vero, con il proprio cane, il proprio telefono e la propria storia dentro lo stesso database degli altri.

**È il solo rischio irreversibile che abbiamo.** Un difetto di prenotazione si corregge la settimana dopo; un cliente che ha visto il cane di un altro, o il numero di telefono di un altro, **è una cosa già successa**.

E il motivo per cui va guardato adesso è nel modo in cui l'abbiamo costruito: **un pezzo alla volta, ciascuno verificato da solo.** La whitelist di tre colonne sui pet, `respond_appointment_request_slot`, `withdraw_appointment_request`, la scheda pubblica del QR, gli inviti, le promozioni, i punti. **La superficie intera non l'ha mai guardata nessuno.**

**Inventario misurato da Cowork il 27/9**, da cui partire e che va verificato:

| | |
|---|---:|
| tabelle in `public` | 19 |
| tabelle **senza** RLS | **0** |
| policy totali | 45 |
| funzioni `SECURITY DEFINER` | 14 |
| di cui **senza `search_path` fissato** | **0** |
| funzioni eseguibili da `anon` | **4** |
| funzioni eseguibili da `authenticated` | 23 |

Le quattro raggiungibili **senza alcun accesso** sono: `get_public_pet_card`, `get_public_salon_identity`, `ensure_pet_qr_token`, `prevent_duplicate_pending_appointment_request`.

**I numeri sono buoni.** Questo audit non serve a cercare un disastro: serve a stabilire, con le prove in mano, **che non c'è**. E a trovare le crepe piccole prima che ci passino dentro trecentoventi persone.

## Le domande

### 1. Cosa vede un cliente che non dovrebbe vedere

**Per ogni tabella**, con una sessione cliente autenticata: cosa restituisce una lettura diretta, senza passare dall'interfaccia. **Non fidarti di ciò che la app chiede**: un cliente con il browser aperto può chiedere altro.

Interessano in particolare: **pet di altri**, **clienti** e i loro telefoni, **appuntamenti** altrui, **visite**, **note interne dello staff**, **punti**, **inviti**, **promozioni non pubblicate**, e le tabelle di servizio — comprese **le tabelle di backup** che Cowork ha lasciato in produzione, `gh78_customer_phone_backup`, `pets_breed_backup_gh70`, `gh95_customer_name_backup`.

> Per quelle tre, la domanda precisa è: **esistono anche sul demo, e sono raggiungibili?** In produzione Cowork le ha create con RLS attiva e i permessi revocati, ma **è una cosa dichiarata, non verificata da altri.**

### 2. Cosa può scrivere

**La whitelist dei pet è di tre colonne** — `owner_notes`, `coat_preferences`, `owner_photo_url` — imposta da un trigger. **Provala per davvero**: tentare di scrivere ogni altra colonna, una per una, e misurare cosa succede.

Poi: può un cliente **creare** un pet? **cancellarlo**? Toccare un appuntamento? Una visita? I propri punti? **Le promozioni?**

E le due funzioni nuove: `respond_appointment_request_slot` e `withdraw_appointment_request`. Cowork le ha scritte perché il cliente non avesse policy di scrittura dirette. **Verifica che sia vero**, e che le funzioni non permettano di toccare la richiesta di qualcun altro.

### 3. Cosa raggiunge chi non ha nessun accesso

Le quattro funzioni aperte ad `anon`, una per una: **cosa restituiscono davvero**, con quali parametri, e **cosa si può ricavare provando**.

**`get_public_pet_card` è quella che conta**: è il QR che stiamo per stampare su 351 medagliette, e chiunque trovi un cane per strada può leggerlo. **Cosa mostra oggi? Il nome del proprietario? Il telefono? L'indirizzo?** `GH-77` ha tolto la foto di riconoscimento del salone — verifica che non sia rimasto altro.

E la domanda che vale la pena porsi: **i token si possono indovinare?** Guarda come sono fatti e dichiara se tentarli a caso sia praticabile o no, con un numero.

**`ensure_pet_qr_token`** è un trigger: perché è eseguibile da `anon`? Probabilmente non è raggiungibile in pratica — **dimostralo**.

### 4. Gli inviti

Il link d'invito è la chiave che consegna un account. **Cosa succede se**: viene inoltrato a un'altra persona; viene usato due volte; è scaduto — sono **30 giorni**; viene aperto da qualcuno che ha già un account; viene aperto mentre nel browser c'è già la sessione di un altro.

**L'ultima è la più probabile al banco**, e `GH-84` si era fermato proprio lì: gestionale e app cliente condividono la sessione del browser.

### 5. Il confine fra salone e cliente

Le pagine del proprietario vivono in parte dentro `apps/staff/` — `/portal`, `/portal/login`, `/portal/invite`. **Un cliente autenticato cosa raggiunge di `/dashboard`, `/calendar`, `/contacts`?** Viene respinto dall'interfaccia, dal database, o da entrambi? **Se solo dall'interfaccia, dillo**: è la differenza fra una porta chiusa e una porta finta.

## Come lavorare

**Stessa disciplina di `GH-100`**: ogni esito marcato **osservato**, **possibile** o **escluso**, e per ognuno la prova.

**Non fidarti dell'interfaccia.** Le prove vanno fatte **contro il database**, con una sessione cliente vera, come se qualcuno scrivesse le richieste a mano. È l'unico modo per distinguere «l'app non lo mostra» da «non si può leggere».

**La suite RLS esistente è un punto di partenza, non la risposta.** 60 prove verdi dicono che quello che è stato pensato funziona; questo audit serve a trovare **quello che non è stato pensato**. Se la suite copre già un caso, dichiaralo e vai oltre.

**Non riparare niente.** Se trovi un buco, **fermati e scrivilo** — e se ti sembra grave abbastanza da non poter aspettare, **dichiaralo in cima al registro**, che è la prima cosa che leggerà Luigi.

## Invarianti

**Nessun file sotto `src/`, nessuna migrazione, nessuna policy, nessuna funzione modificata.**

**La produzione non si tocca, nemmeno in lettura.** Le misure d'inventario qui sopra le ha già fatte Cowork; se ne serve un'altra, **chiedila**.

**Nessun account nuovo, nessuna password cambiata.** Usa le utenze di prova che la suite già conosce.

**Nessun dato reale nel registro.** Se una prova espone un telefono o un nome, **riportane la forma, non il contenuto**.

## Cosa consegnare

- **La matrice**: per ogni tabella, cosa può leggere e cosa può scrivere un cliente, e un anonimo. Misurata, non dedotta;
- **le quattro funzioni pubbliche**, cosa restituiscono e cosa se ne può ricavare;
- **la whitelist dei pet provata colonna per colonna**;
- **gli inviti nei cinque casi** sopra;
- **il confine staff/cliente**: porta chiusa o porta finta, per ciascuna rotta;
- **quello che la suite RLS non copriva**, e che ora sappiamo;
- **cosa non hai potuto stabilire**, e cosa servirebbe;
- **in cima, se c'è**: la cosa che non può aspettare il lancio.

## Passo finale — lo legge Luigi

Non c'è niente da provare al telefono. La domanda è una sola:

**possiamo invitare trecentoventi persone senza che nessuna di loro veda qualcosa di qualcun altro?**

Se la risposta è sì, va detto con le prove. Se è no, va detto cosa manca.

## Chiusura

Registro in `docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md`, committato da solo. Niente push, niente merge, niente deploy.
