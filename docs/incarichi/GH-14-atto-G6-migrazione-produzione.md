# Incarico GH-14 — Atto G6: migrazione della produzione

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 24 agosto 2026
**Fonte della ricetta:** §9 del registro `docs/consegne/GH-13-catena-residua-e-fase-3.md`, provato su `grooming-prova-generale`.

> ## ⛔ NON ESEGUIBILE SU ORDINE GENERICO
>
> Questo mandato è **scritto e depositato, non ancora attivato**. Non rientra in un ordine del tipo «esegui l'ultimo elaborato»: richiede un'istruzione **esplicita e nominativa** di Luigi che citi GH-14 e dichiari soddisfatti i cancelli della sezione successiva.
>
> Se lo raggiungi tramite un ordine generico: fermati, dichiaralo, e considera come mandato corrente il primo GH-NN precedente ancora privo di registro. Se non ce n'è nessuno, rispondi che non ci sono task nuovi da eseguire.
>
> *(Convenzione «ultimo elaborato», `docs/consegne/README.md`, 24/8: un mandato di produzione non si attiva per scorrimento numerico.)*

> **Questo mandato è diverso da tutti i precedenti.** Fin qui un fallimento si ricominciava: il progetto temporaneo esisteva per essere rotto. Qui il bersaglio è la produzione, con 296 clienti reali e la memoria di lavoro di Davide e Roby. Non esiste «riprova»: esiste «fermati e ripristina». Leggere la sezione **Arresto e ripristino** prima di iniziare, non quando serve.

## Regola d'ingresso

**Primo atto della sessione**: dichiarare nel registro la root e il project ref bersaglio. Se la root non è `grooming-hub-web`, fermarsi. Una sola sessione lavora su questo mandato.

## Bersaglio e perimetro

- **Bersaglio unico: `grooming`, ref `azgehoseiojodltcttfb`.**
- Nella stessa organizzazione `Webapp_Project` vivono **`bea-scuola-musica` (`scbcpjtmgelpgtdjvmue`) e `caveabay-prenotazioni` (`nlratfznwohwjpmhroid`)**, che appartengono ad altri progetti e **non vanno né letti né scritti**. Il collegamento li espone per come è fatta l'organizzazione, non perché siano in perimetro. Ogni chiamata deve portare il ref esplicito del bersaglio: mai affidarsi a un progetto «corrente».
- Demo e progetto temporaneo: fuori perimetro.
- **Vietato `supabase db push`** in qualunque forma: ordina i file lessicalmente ed eseguirebbe la catena sbagliata (vedi §Ordine).

## Cancelli di Luigi — nessun atto inizia se manca anche uno solo

1. **Spot-check eseguito**: Luigi ha confrontato le 5 schede del §7 di GH-13 con la vecchia app in produzione e ha dato esito positivo per iscritto.
2. **Dump fresco**, preso da Luigi immediatamente prima dell'atto, con impronte SHA-256 dichiarate. Quello del 21/8 resta come secondo paracadute, non come primo.
3. **Codex autorizzato su `Webapp_Project`** — il suo collegamento è distinto da quello di Cowork e va concesso a parte. Va tolto subito dopo l'atto.
4. **Salone fermo** e Luigi presente per l'intera durata.

## Preflight — misurare prima di scrivere, come sempre

Prima di qualunque scrittura, verificare sul prod e riportare a registro:

| Verifica | Atteso |
|---|---:|
| clients | 296 |
| visits | 464 |
| contacts | 301 |
| utenti auth | 6 |
| appointments | 17 |
| profiles | 4 |
| migration registrate | 10, ultima `20260423123000` |

Verificare inoltre che l'impronta SHA-256 di **ogni file** della catena coincida con quella dichiarata nel §9 di GH-13. **Se anche una sola misura o impronta diverge, fermarsi e consegnare un'interruzione motivata**: la ricetta è calibrata su questa fotografia esatta, misurata da Cowork il 24/8, e una divergenza significa che la prova generale non è più rappresentativa.

## Ordine — la trappola da non calpestare

Applicare i **35 atti nell'ordine del §9 di GH-13**, che **non coincide con l'ordine alfabetico dei nomi file**: il primo atto è `20260824110000_prepare_legacy_data_prod`, il secondo `20260824100000_cleanup_test_records_prod`. Trascrivere l'ordine dalla tabella, un atto alla volta, verificando l'impronta prima di ciascuno.

Punti d'attenzione già misurati sul temporaneo:

- `20260520051506_add_service_id_to_appointments` è **prerequisito** di `appointment_requests` e va **immediatamente prima** di esso (posizioni 33 e 34). La sua omissione fu il difetto scoperto in GH-13: qui non deve ripresentarsi.
- La pulizia dei dati di prova va **prima** dello split; la cancellazione delle 8 schede irrecuperabili **dopo** lo split e **prima** di `phone NOT NULL`.
- L'hardening è l'ultimo atto della catena.

Per ogni atto: impronta verificata, applicato, misurato, **durata annotata**. Riferimento di durata dalla prova: 84,343 s di sole chiamate DB per l'intera catena.

## Arresto e ripristino

**Cosa è un fallimento**: un atto che ritorna errore; una cardinalità che non coincide con l'attesa; una guardia che scatta; qualunque risultato che non sappiate spiegare **prima** di procedere all'atto successivo.

**Cosa NON si fa mai**: improvvisare una correzione sul prod, allentare una guardia per farla passare, saltare un atto, disabilitare un trigger, aggirare `storage.protect_delete()`, «provare» una variante. Sul temporaneo era legittimo correggere e riapplicare; qui no.

**Cosa si fa**: fermarsi immediatamente, non eseguire altri atti, e consegnare un registro che dica esattamente **a quale atto** ci si è fermati, **quale era lo stato prima** e **quale dopo**. La decisione fra ripristinare e diagnosticare è **di Luigi**, non di Codex e non di Cowork.

**Vie di ripristino disponibili, in ordine di preferenza** (le esegue Luigi):
1. backup giornaliero automatico Supabase Pro, attivo dal trasferimento del 21/8;
2. dump fresco preso poco prima dell'atto;
3. dump del 21/8, valido perché il prod è misurato immutato.

La catena è costruita ad atti transazionali con guardie: un fallimento lascia il database all'ultimo atto riuscito, non a metà di uno. Questo rende il ripristino una scelta, non un obbligo — ma resta una scelta di Luigi.

## Dopo la catena — verifica prima di toccare l'app

| Verifica | Atteso |
|---|---:|
| customers | 260 |
| pets | 282 |
| visits | 452 |
| contacts | 287 |
| customers senza telefono | 0 |
| `customers.phone` nullable | NO |

Più: suite RLS con sonde usa-e-getta proprie, smontate nello stesso ciclo con controprova a zero residui; Advisor Security e Performance confrontati con il temporaneo (attesi 6 e 99); nessun account reale toccato.

**Nota sulle sonde**: qui vivono accanto a dati reali. Nomi marcati, perimetro dichiarato, smontaggio nella stessa sessione e controprova di zero residui su tutte le tabelle coinvolte. Nessuna sonda sopravvive all'atto.

## La finestra in cui l'app è rotta — attesa, non un guasto

La catena **droppa `clients`**, che l'app di produzione attualmente interroga. Fra la fine della migrazione e la promozione del nuovo frontend **l'app di produzione non funziona**. È aritmetica, non un incidente: con il salone chiuso è accettabile, ed è stato deciso da Luigi il 24/8.

Sequenza, senza pause fra i punti 1 e 2:

1. **Codex**: catena + verifiche sopra.
2. **Luigi**: merge `feat/customer-app` → `main`, push, build e promozione a Production sul progetto Vercel `grooming-hub-webapp`.
3. **Luigi**: verifica dal vivo — login staff, dashboard, una scheda pet, la rubrica.

Se si vuole accorciare la finestra, la build del nuovo frontend può essere preparata prima e solo promossa dopo la migrazione: è una scelta di Luigi, non un requisito.

## Code post-G6 (gesti di Luigi, non di Codex)

1. **Due oggetti Storage orfani** da rimuovere via Storage API — percorsi esatti nel §4 del registro GH-12. Non sono cancellabili via SQL e senza questo gesto restano foto senza scheda.
2. **Revocare a Codex l'accesso a `Webapp_Project`**, riportando entrambi i collegamenti su `morkdaorkggetto's Org`.
3. **Attivare «Leaked password protection»** sul prod, che ora è Pro e lo consente — deliberatamente **dopo** e non prima, per non toccare le password degli operatori durante la migrazione.
4. **Smontare il progetto temporaneo** solo a G6 riuscito e verificato.
5. **Decisione aperta**: separare la produzione Grooming in un'organizzazione dedicata. Non per costo, ma perché quando il prodotto sarà venduto ad altri saloni i dati di produzione dei clienti non possono condividere unità di accesso e fatturazione con gli altri lavori — come questo stesso mandato dimostra, dovendo elencare due progetti estranei da non toccare.

## Chiusura

Registro completo in `docs/consegne/`, committato con la convenzione consueta: atti, impronte verificate, durate, cardinalità prima e dopo ogni tratto, sonde e loro smontaggio, e la durata totale reale confrontata con gli 84,343 s della prova.

**Niente push, niente merge, niente deploy da parte di Codex**: sono gesti di Luigi, come sempre.
