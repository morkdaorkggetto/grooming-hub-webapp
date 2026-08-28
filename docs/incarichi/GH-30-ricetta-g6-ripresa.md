# Incarico GH-30 — La ricetta di G6: ripresa, con la protezione mancante

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026
**Riprende** `GH-29`, interrotto correttamente sulla condizione di arresto che il mandato stesso prevedeva.

> L'interruzione era giusta e la diagnosi è accettata: **verificata da Cowork riga per riga**, non solo creduta. Non va rifatta.
>
> Dichiara le invarianti, non la procedura.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Produzione e progetto temporaneo vietati.** Questo mandato **scrive file, non li applica**; il demo può essere letto per verifiche, non modificato.

## Cosa è stato accertato

`20260511070742` proteggeva due cose. La catena G6 ne copre una sola:

| Protezione | Nella catena G6 | Esito |
|---|---|---|
| `pets.internal_notes` | `trg_pets_customer_update_whitelist` ripristina l'intera riga da `OLD` e riapre solo tre campi | coperta, **meglio** dell'originale |
| `customers.operator_notes` | `enforce_customer_directory_fields_staff_only` ripristina **solo** `acquisition_source` e `relationship_status`, e il trigger scatta **solo** su quelle due colonne | **scoperta** |

Con `customers_self_update` che consente al cliente di aggiornare la propria riga, e le policy che non sanno limitare le singole colonne, **un cliente potrebbe scrivere nelle note che il salone tiene su di lui**. Sul demo la protezione c'è, in produzione mancherebbe: è una **regressione introdotta dalla catena**, non un difetto ereditato.

*(Errore di Cowork all'origine: il 27/8 aveva confrontato i **nomi** dei trigger invece del loro contenuto e aveva dichiarato la copertura equivalente.)*

## 1. La protezione mancante — invarianti

**Un cliente non può modificare `customers.operator_notes`, in nessun modo**: né aggiornando quella colonna insieme ad altre, né aggiornando **solo** quella. Il secondo caso è quello che oggi sfugge, perché il trigger non scatta affatto.

**Lo staff continua a scrivere liberamente.** La protezione riguarda chi non ha accesso staff sul tenant.

**Non si reintroduce la migration legacy.** La sua metà sui pet è ridondante — la whitelist è più restrittiva — e le sue funzioni `SECURITY DEFINER` contraddirebbero il preflight dichiarato dell'hardening prod. Si estende ciò che esiste.

**L'atto è idempotente** e conserva il profilo di sicurezza già stabilito: `SECURITY INVOKER`, `search_path` pinnato, le revoche esistenti.

**Collocazione**: dopo `20260824140000_absorb_contacts_customer_first_prod` — che crea la funzione da estendere — e prima di `20260824150000_security_hardening_prod`, che verifica lo stato finale delle funzioni.

**Controprove**: un non-staff che aggiorna solo `operator_notes` non lo modifica; un non-staff che lo aggiorna insieme ad altre colonne non lo modifica; lo staff lo modifica; nessuna regressione sui due campi già protetti; nessun cambiamento sul trigger dei pet.

## 2. Il resto di GH-29, invariato

Riprende il mandato precedente dal punto in cui si è fermato. Le sue invarianti restano valide e non si ripetono qui: **varianti prod-safe** delle quattro migration mancanti — `gh22`, `gh25`, e le due di `gh27` — senza identificativi o cardinalità del demo, con particolare attenzione a `gh22`, che semina impostazioni del tenant e in produzione troverà un identificativo diverso; **seed di `services`** con le due righe decise con Davide; **esclusione dichiarata** di `20260511070742`, che ora ha una ragione completa da scrivere: la sua metà pet è coperta meglio, la sua metà customer è sostituita dall'atto del punto 1.

**La ricetta finale** è un elenco unico e ordinato, con impronta e provenienza di ogni atto, che deve poter essere **trascritto senza dedurre nulla**. Comprende anche ciò che non è una migration: i tre dump di partenza, il seed, e i gesti che restano a Luigi. Dove l'ordine non coincide con quello alfabetico dei nomi file — e non coincide — va detto perché.

## Fuori perimetro, da non risolvere ma da non perdere

Cercando la protezione in scrittura è emerso che **non esiste alcuna protezione in lettura**: `customers_self_select` restituisce al cliente l'intera propria riga, `operator_notes` compreso, e lo stesso vale per `pets.internal_notes` attraverso la scheda del proprio cane. L'app non le mostra, ma l'app non è il confine.

**Non è una regressione**: esiste già oggi, sul demo come in produzione, ed è teorica finché nessun cliente reale usa l'app. Ma diventa concreta al primo invito.

Non toccarla in questo mandato: la soluzione non è una revoca di colonna — per il database staff e clienti sono lo stesso ruolo — ma una vista o una tabella separata, ed è una decisione di Luigi. **Richiamala nel registro** perché resti scritta.

## Chiusura

Registro in `docs/consegne/`, con la ricetta completa. È il documento da cui Cowork riscriverà il mandato G6. Niente push.
