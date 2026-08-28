# Incarico GH-29 — La ricetta di G6, aggiornata

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026

> La ricetta di produzione è ferma al 24 agosto. Da allora sono nate **quattro migration** e una decisione di prodotto che richiede un seed. Finché la ricetta non è giusta, tutto ciò che ci poggia sopra è sbagliato — **incluso il mandato G6**, che Cowork riscriverà da questo registro.
>
> Dichiara le invarianti, non la procedura.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Produzione e progetto temporaneo vietati**: questo mandato **scrive file, non li applica a nessun database**. Il demo può essere letto per verifiche, non modificato.

## Da dove si parte

La ricetta vigente è il **§9 del registro `GH-13`**: 35 atti ordinati con impronta SHA-256, più i tre dump del 21/8. Ha una proprietà da conservare: **l'ordine è intenzionale e non coincide con l'ordine alfabetico dei nomi file**. Un `supabase db push` eseguirebbe la catena sbagliata.

## Cosa manca — misurato

Migration nate dopo quella ricetta e **assenti da essa**:

| Migration | Cosa introduce |
|---|---|
| `20260827091536_gh22_booking_schedule_and_staff_duration` | chiusure ricorrenti in `tenants.settings`, RPC di conferma con durata scelta dallo staff |
| `20260827170005_gh25_accept_customer_invite_membership` | riscrittura di `accept_customer_invite`: membership atomica, guardia ruolo, stati del token |
| `20260828043652_gh27_prelaunch_repairs` | fuso del salone, QR atomico, controproposte, blocco duplicati, chiusura atomica visita-appuntamento |
| `20260828044014_gh27_qr_backfill_privileged_fix` | correzione del backfill QR bloccato dal trigger whitelist |

Più due cose che **non esistono in nessuna forma**:

- **il seed di `services`**, senza il quale al lancio il wizard non ha nulla da offrire e nessun cliente può inviare una richiesta;
- **la dichiarazione dell'esclusione** di `20260511070742_enforce_staff_only_notes_columns`, oggi assente dalla ricetta senza che sia scritto perché.

## Invarianti — cosa deve essere vero alla fine

### Le varianti prod-safe

Ogni migration mancante ha la sua variante applicabile alla produzione, **senza identificativi, riferimenti o cardinalità del demo scritti dentro**. Il caso critico è noto: `gh22` semina le impostazioni del tenant, e **in produzione il tenant nascerà con un identificativo diverso** — la selezione deve avvenire per una chiave stabile, non per un valore copiato dal demo.

Dove una migration è già scritta in modo neutro, **non se ne crea una copia inutile**: si dichiara che è applicabile così com'è. Meno file ci sono nella ricetta, meno cose possono andare storte alle sei del mattino.

### Il seed dei servizi

Due righe, decise con Davide il 28/8 e misurate contro un anno di incassi — la distribuzione mostra **due gruppi netti con zero visite fra 26 e 29 euro**, cioè due lavorazioni distinte e non un continuo di prezzi:

| Nome | Descrizione | Prezzo base | Durata base |
|---|---|---:|---:|
| Bagno | solo bagno | 20,00 € | 45 min |
| Taglio | include il bagno | 30,00 € | 90 min |

Sono **valori di partenza**, non un listino: al cliente non compaiono mai — decisione «solo incassi» del 21/8, confermata da Davide con *«ogni utente paga un prezzo diverso»* — e allo staff servono come proposta modificabile. Il seed è idempotente e **non sovrascrive righe già presenti** se qualcuno le avesse create nel frattempo.

### L'esclusione dichiarata

`20260511070742_enforce_staff_only_notes_columns` resta fuori dalla ricetta. La ragione, già misurata sul progetto temporaneo: le sue protezioni sono coperte da `trg_customers_protect_directory_fields` e `trg_pets_customer_update_whitelist`, che la catena applica comunque. **Va scritto nella ricetta**, non lasciato implicito: chi trascriverà i trentacinque e passa atti il giorno di G6 deve sapere che quella riga manca **apposta**.

Se verificando trovi che la copertura **non** è equivalente, fermati e dichiaralo: sarebbe un buco di sicurezza in produzione, e vale più di questo mandato.

### La ricetta come documento

Un elenco unico, ordinato, con l'impronta di ogni atto e la sua provenienza. Deve poter essere **trascritto senza pensare**: chi lo esegue non deve dedurre nulla. Dove l'ordine è controintuitivo — e lo è — va detto perché.

Devono comparire anche gli atti che **non sono migration** e che oggi vivono solo nella prosa dei registri: i tre dump di partenza, il seed dei servizi, e i gesti che restano a Luigi.

## Controprove

Dichiara nel registro, misurate: che ogni file della ricetta esiste e la sua impronta corrisponde; che nessuna variante prod-safe contiene identificativi o valori del demo; che il seed dei servizi è idempotente e non sovrascrive; che la copertura delle protezioni note è equivalente senza la migration esclusa; che l'ordine dichiarato non coincide con l'ordine alfabetico, e dove.

**Nessuna applicazione a database.** Questo mandato produce file e un documento: la prova che la catena funzioni davvero è già stata fatta su `grooming-prova-generale`, e non va rifatta qui.

## Se qualcosa non torna

Se una variante prod-safe non è scrivibile senza conoscere dati che solo la produzione ha, **fermati e dichiaralo**: quella diventa una misura da fare in apertura di G6, non un'ipotesi da incorporare nella ricetta.

## Chiusura

Registro in `docs/consegne/`, con la ricetta completa e ordinata. È il documento da cui Cowork riscriverà il mandato G6. Niente push.
