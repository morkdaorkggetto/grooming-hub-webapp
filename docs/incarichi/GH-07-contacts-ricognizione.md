# Incarico GH-07 — Contacts: ricognizione e proposta di assorbimento (Fase 1 di 2)

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 21 agosto 2026
**Perimetro Fase 1: SOLA LETTURA.** Branch `feat/customer-app`, base = HEAD post GH-06 (dichiararla). Demo interrogabile in lettura; **nessuna scrittura DB, nessuna modifica applicativa, nessuna migration, nessun commit di codice**. Prod intoccabile (le misure prod le ha già fatte Cowork, sotto). L'unico output è il registro di consegna con la proposta. La Fase 2 (esecuzione) avrà mandato proprio, scritto sulla tua proposta approvata da Luigi.

## Perché due fasi

GH-05 è stato interrotto perché il mandato conteneva un disegno non misurato. `contacts` è il pezzo più torbido rimasto (matching per telefono, fusioni, una pagina staff che ci vive sopra): stavolta il disegno lo scriviamo DOPO la ricognizione, non prima.

## Contesto misurato (Cowork, 21/8, su prod `grooming` — sola lettura)

301 contacts totali; **288 con telefono coincidente con un client** (specchi creati dall'automatismo rubrica); 10 senza telefono; 3 con telefono senza match. Il problema vero è il residuo (~13), non la massa. Decisione 3 Gate 5 (fonte: `supabase/docs/gate5-design-decisions.md`): contacts non è entità separata; i record migrano in `customers` con match per telefono/nome e fusione; la tabella si rimuove solo quando il codice non la referenzia più.

## Domande a cui la ricognizione deve rispondere (con misure, non impressioni)

1. **Demo**: quanti contacts, con che campi popolati, quanti match per telefono normalizzato (`normalize_phone_it`) e quanti per nome; casi ambigui (stesso telefono → più customer? contact che matcherebbe due persone?).
2. **Schema**: quali colonne ha `contacts` che `customers` non ha (es. stato `Contattato`, note lead, `linked_pet_id`)? Dove finiscono nella fusione — campo esistente, `operator_notes`, o si perdono (dichiararlo)?
3. **Codice**: cosa usa davvero `Contacts.jsx` oggi (elenco funzioni del gateway + colonne lette/scritte)? Cosa servirebbe per farla vivere su `customers` — e i "lead puri" (contact senza pet né match) come si rappresentano in un modello dove ogni customer nasce col suo pet via RPC? Questa è LA domanda di design: un customer può esistere senza pet, o i lead restano un concetto a parte con un'altra casa?
4. **Automatismo**: dove vive il flusso "nasce cliente → nasce voce rubrica" dopo GH-05-bis? Va spento, invertito o conservato?
5. **Prod-safety**: quali differenze tra demo (pochi record) e prod (301) cambierebbero l'atto di migrazione (duplicati, telefoni malformati — misurare sul demo, stimare per prod)?

## Forma della proposta (convenzione README consegne)

Soluzione raccomandata con: sequenza degli atti (dati → codice → rimozione tabella, o altro ordine motivato), regole di match e fusione esplicite (chi vince su quale campo), sorte dichiarata di ogni colonna e di ogni caso ambiguo, controprove per la Fase 2, rischi residui, e — se esistono più strade sul nodo "lead puri" — la raccomandata con i compromessi delle alternative. Le questioni che spettano a Luigi (es. se i lead meritino una casa propria) vanno nominate come decisioni, non risolte d'ufficio.

## Cosa NON fare

Nessuna scrittura, nemmeno "innocua". Nessuna fixture. Nessun tocco a `Contacts.jsx`. Nessuna anticipazione della Fase 2 nel worktree.
