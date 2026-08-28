# Consegna GH-16 - Fase 1, confronto veste gestionale

**Stato:** checkpoint di Fase 1 completato; Fase 2 non iniziata.  
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web`  
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`  
**Branch:** `feat/customer-app`  
**Base Git:** `e509f86cbec07fcb054fba11ebf74271deebca3d`  
**Commit della consegna:** il commit documentale che contiene questo registro; hash comunicato a Luigi a chiusura.  
**Ambienti:** nessun accesso a Supabase o ad altri database; nessun deploy.  
**Push:** non eseguito.

## Perimetro ricevuto

Confronto fra la composizione CD GH-15 e il codice reale di:

1. `src/apps/staff/pages/Dashboard.jsx`;
2. `src/apps/staff/pages/ClientDetail.jsx`;
3. `src/apps/staff/pages/AddVisit.jsx`;
4. fondazione condivisa necessaria alle tre schermate.

Il mandato impone un checkpoint: produrre la misura e fermarsi prima di
qualsiasi modifica applicativa. Calendario, altre pagine staff, app customer,
route, flussi e database sono fuori perimetro.

## Fonti lette

- `design_handoff_staff_app/GH-15-handoff.md`;
- tutti i file di composizione in `design_handoff_staff_app/`, inclusi
  `gh15-ed-kit.jsx`, `gh15-ed-dashboard.jsx`, `gh15-ed-scheda.jsx`,
  `gh15-ed-visita.jsx`, `gh15-ed-riferimenti.jsx`, `gh15-staff.css`,
  `shared-ui.jsx`, `tokens.css`, `design-canvas.jsx` e canvas HTML;
- `docs/incarichi/GH-15-verifica-schema-campi-dubbi.md`;
- `docs/incarichi/GH-15-brief-claude-design-veste-staff.md`;
- implementazione corrente delle tre pagine, componenti da esse usati,
  routing staff e sole selezioni/mappature presenti nel codice di
  `src/lib/database.js`.

In caso di differenza fra JSX di composizione e CSS CD e' stata applicata la
precedenza normativa del mandato: vince `gh15-staff.css`.

## Baseline misurata

| Schermata | Righe | Blocchi `style={{` | Esito rispetto al mandato |
|---|---:|---:|---|
| Dashboard | 659 | 43 | confermato |
| Scheda cliente | 1.235 | 105 | confermato |
| Registrazione visita | 361 | 28 | confermato |

Nelle tre pagine e nei componenti di riga oggi usati non risultano
`tabular-nums`, `fontVariantNumeric` o impostazioni equivalenti.

## Tabella esaustiva degli scostamenti

`Allineare` significa che la Fase 2 puo' applicare il contratto CD senza
alterare dati o flussi. `Tenere` significa che il comportamento reale prevale
e va soltanto rivestito. `Decisione a Luigi` identifica una contraddizione o
un cambiamento di flusso che il presente mandato vieta di risolvere.

| Schermata / area | Codice reale misurato | Composizione CD | Esito | Motivo misurato / destinazione |
|---|---|---|---|---|
| Fondazione - font | Fraunces e sans sono gia' dichiarati nei token condivisi | serif per titoli e numeri, sans per testo e controlli | tenere | Riutilizzare i font esistenti; non serve una nuova dipendenza. |
| Fondazione - token | Mancano `--gh-bridge`, `--gh-border-60`, `--gh-border-35` | tre soli token nuovi ammessi | allineare | Aggiungere esattamente `#f7f1ea`, `rgba(207,193,196,.6)`, `rgba(207,193,196,.35)` nella futura Tappa 0. |
| Fondazione - CSS | Layout quasi interamente inline nelle tre pagine | classi `.gh-*` in `gh15-staff.css` | allineare | Spostare il layout nel CSS condiviso senza cambiare la logica. |
| Fondazione - breakpoint | Dashboard e Scheda usano `sm/md/lg/xl`; AddVisit non ha varianti responsive | un solo breakpoint a `640px` | allineare | Consolidare il solo comportamento delle tre viste sul contratto 640 px. |
| Fondazione - numeri | Nessuna variante tabulare | tutti i numeri tabulari | allineare | Applicare a statistiche, punteggi, date, costi e contatori. |
| Fondazione - stato focus | Focus e hover dipendono dalle classi locali | focus ring e stati coerenti del kit | allineare | Portare gli stati nel kit senza cambiare azioni o abilitazioni. |
| Dashboard - testata | `AppHeader` pieno teal, condiviso con altre pagine staff | Hero caldo editoriale, senza fascia teal piena | allineare | Creare `Hero` limitato alle tre viste; non modificare globalmente `AppHeader`, che allargherebbe il perimetro. |
| Dashboard - ordine macro | Header, alert richieste pending, ricerca/filtri, stato generale, aree, archivio | Hero, ricerca + stat strip, aree, archivio; alert non rappresentato | decisione a Luigi | L'alert pending e' un comportamento vivo; raccomandato tenerlo e rivestirlo, salvo rimozione esplicita. |
| Dashboard - ricerca | Campo grande in card con filtri separati | `SearchBar` compatta nel pannello | allineare | Stessa ricerca e stessi filtri, sola ricomposizione visiva. |
| Dashboard - filtri | Pill con conteggi e selezione | pill 32/40 px | allineare | Conservare categorie e conteggi, adeguando geometria e touch target. |
| Dashboard - statistiche | Tre card verticali | `StatStrip` orizzontale/compatto | allineare | Dati gia' disponibili; nessuna nuova query. |
| Dashboard - cinque aree | Cinque tile operative vive | Handoff impone cinque aree | tenere | Conservare le cinque destinazioni e il loro ordine. |
| Dashboard - sesta tile | Nessuna tile `Registra una visita` | `gh15-ed-dashboard.jsx` ne mostra una sesta | decisione a Luigi | Contraddice il vincolo esplicito delle cinque aree. Raccomandato non aggiungerla. |
| Dashboard - appuntamenti di oggi mobile | La Dashboard non carica gli appuntamenti odierni | composizione mostra righe orarie mobile | decisione a Luigi | Richiederebbe nuova lettura e nuova responsabilita' della pagina. Raccomandato rinviare a mandato dati/flow. |
| Dashboard - CTA nuovo cliente | Pulsante presso il titolo delle aree operative | CTA presso archivio e FAB mobile | decisione a Luigi | Lo spostamento modifica la memoria operativa del flusso. Raccomandato tenere posizione/azione e applicare soltanto veste; FAB solo con autorizzazione. |
| Dashboard - archivio | Griglia a tre colonne di `ClientCard` | righe dense `ClientRow` | allineare | Stessa collezione e stessa apertura scheda, con densita' coerente al gestionale. |
| Dashboard - loading | Spinner a pagina | skeleton con geometria delle righe | allineare | Nessuna modifica dati; sostituzione dello stato visivo. |
| Dashboard - vuoto | Card con icona cane e testo | empty state didattico | allineare | Conservare la CTA esistente, uniformare forma e tono. |
| Dashboard - errore | Avviso generico | errore esplicito non distruttivo | allineare | Conservare il messaggio e il contenuto gia' caricato quando disponibile. |
| Dashboard - tipografia | Titoli sans bold 20-24; statistiche sans bold circa 30 | H1 serif 32/25; pannello serif 16/500; area serif 18/500; numero serif 30 | allineare | Applicare puntualmente la tabella tipografica CD. |
| Dashboard - geometria | Card raggio 26-28, padding 24, gap 20-24 | pannello raggio 20, page padding 20/13, gap 14-16 | allineare | Ridurre volume e spazi senza alterare il contenuto. |
| Scheda - testata | `AppHeader` teal | Hero editoriale | allineare | Stessa soluzione locale proposta per Dashboard. |
| Scheda - struttura desktop | Un'unica colonna lunga, max width 4xl | griglia editoriale a due colonne | allineare | E' una ricomposizione desktop; contenuti e azioni restano invariati. |
| Scheda - numero sezioni | Sei nuclei stabili, piu' Promo e Note condizionali (fino a otto) | Handoff parla di sette sezioni, ma i file definiscono sei pannelli nominati | decisione a Luigi | Contraddizione interna della fonte. Raccomandato preservare tutti i nuclei reali e i due blocchi condizionali. |
| Scheda - ordine sezioni | Identita', Promo, Fidelity, Note, QR, Ponte digitale, Affidabilita', Visite | desktop: Identita/Visite/Affidabilita' a sinistra; Fidelity/QR/Ponte a destra | decisione a Luigi | Il mandato vieta di cambiare ordine. Raccomandato mantenere l'ordine semantico corrente anche nella griglia. |
| Scheda - mobile | Una pagina in scorrimento | tre schermate/viste mobili, senza controllo di navigazione definito | decisione a Luigi | Sarebbe una riorganizzazione di flusso. Raccomandato un solo scroll responsive finche' un mandato definisce navigazione e URL. |
| Scheda - azioni principali | Modifica, Appuntamento, WhatsApp, QR Card, Elimina; `Registra visita` e' un FAB separato | sei azioni nell'ordine Registra visita, Appuntamento, WhatsApp, Modifica, QR Card, Elimina | decisione a Luigi | Il numero totale e' sei ma ordine e collocazione divergono. Raccomandato includere il FAB nel gruppo solo dopo approvazione dell'ordine CD. |
| Scheda - affidabilita' | Le tre azioni reali sono presenti | le tre azioni vanno mantenute | tenere | Rivestire senza eliminare o fondere comandi. |
| Scheda - visite | Card complete con trattamenti e problemi | righe dense | allineare | Mappare `treatments` come testo principale e `issues` come seconda riga opzionale; nessun campo inventato. |
| Scheda - fedelta' | Dati reward separati, con fallback alle visite | pannello fidelity editoriale | tenere | Conservare esattamente il calcolo corrente; solo veste. |
| Scheda - Promo e Note | Blocchi condizionali reali | non rappresentati nella composizione | tenere | Non esiste autorizzazione a rimuoverli. Portarli nel linguaggio `Notice`/`Panel`. |
| Scheda - QR e ponte | Funzioni reali separate | pannelli distinti | allineare | Corrispondenza diretta, senza modifica URL o azioni. |
| Scheda - loading | Spinner | skeleton di riga/pannello | allineare | Allineamento visivo. |
| Scheda - not found / errore | Stato testuale e banner generici | `EmptyState`/`ErrorState` espliciti | allineare | Conservare retry/back e non distruggere dati visibili. |
| Scheda - tipografia | Nome sans bold circa 30; titoli sans bold 20-24 | nome pet serif 32/26; pannelli serif 16/500 | allineare | Applicare scala CD. |
| Scheda - geometria | Sezioni p24, gap/mb24; FAB 64 | pannelli r20, gap14; FAB 56 | allineare | Adeguamento geometrico; verificare 44 px minimi mobile. |
| Visita - superficie primaria | Route `/client/:id/add-visit` a pagina intera; nessun link UI trovato verso la route | desktop modal, mobile full-screen | decisione a Luigi | Il gesto reale apre invece il modal inline di `ClientDetail`. Raccomandato estrarre un unico form condiviso usato da modal e route, conservando entrambi. |
| Visita - campi | Data, trattamenti, problemi, costo | CD contempla anche servizi/chip e valuta campi dubbi | tenere | Conservare i quattro campi reali; non aggiungere operatore, durata, foto o prezzi servizio. |
| Visita - data | Input data nativo | day chips 48/54 | allineare | Puo' cambiare il controllo senza cambiare il valore salvato; mantenere accessibile anche l'inserimento valido. |
| Visita - servizi | `treatments` e' testo libero; catalogo servizi non e' parte del form | service chips 38/44 | tenere | Il catalogo non e' una fonte affidabile per questa visita. Tenere testo libero. |
| Visita - costo | Campo manuale `cost` | prezzo serif, nessun prezzo di listino | tenere | Il costo reale resta manuale e tabulare. |
| Visita - submit | Stato loading nel pulsante; errore sopra il form | stati loading/error del kit | allineare | Conservare valori compilati e blocco doppio invio. |
| Visita - tipografia | Label sans 14 bold e testo default | eyebrow 9.5; body 13; prezzo serif 16 | allineare | Applicare scala CD senza cambiare copy funzionale. |
| Visita - geometria | Form p32, gap24, radius 8/16; controlli circa 48 e CTA circa 56 | modal max 620, radius16, field 38/46, gap6-9 | allineare | Ridurre desktop, preservare almeno 44 px su mobile. |
| Tutte - touch target | Diversi pulsanti `py-2` risultano stimati sotto 44 px su mobile | nessun bersaglio sotto 44 px | allineare | Misurare a 390 e 320 nella Fase 2; usare altezze normative mobile. |
| Tutte - copy richiesta | Dashboard usa correttamente `da gestire` per le pending | composizione usa anche `da leggere` | tenere | Non esiste un flag unread: il dato e' una richiesta pending. Conservare `da gestire`. |

## Colori letterali presenti e destinazione

La posizione e' riferita alla base Git dichiarata. I bianchi e `#FBF6F3`
sono gia' colori del sistema CD; i tre nuovi token sono gli unici valori
aggiuntivi ammessi.

### `Dashboard.jsx`

| Posizione | Letterale / classe | Uso corrente | Destinazione proposta |
|---|---|---|---|
| 234, 357 | `#c2410c` | pending CTA / accento area | per uso: `--gh-warning-text` sull'avviso; `--gh-secondary` sulla CTA |
| 235, 318 | `#fff7ed` | sfondo warning | `--gh-warning-bg` |
| 286 | `rgba(251,246,243,.16)` | bordo header | Hero + `--gh-border-35` |
| 287, 432, 445, 577 | `#FBF6F3` | testo/superficie | token superficie/contrasto gia' ammesso |
| 288 | `rgba(251,246,243,.22)` | superficie header | eliminato dal nuovo Hero o trasparenza di sistema |
| 319 | `#fed7aa` | bordo warning | `--gh-warning-border` |
| 326, 368 | `#9a3412` | testo warning | `--gh-warning-text` |
| 330, 343 | `#7c2d12` | accento/CTA | `--gh-secondary` come indicato dall'handoff |
| 341, 366 | `#ffffff` | testo su CTA | bianco di contrasto ammesso |
| 342, 367 | `#fdba74` | bordo hover/CTA | `--gh-warning-border` |
| 443 | `rgba(251,246,243,.18)` | bordo tile | `--gh-border-35` |
| 300 | `bg-red-50 border-red-200` | errore | token danger bg/border |

### `ClientDetail.jsx`

| Posizione | Letterale / classe | Uso corrente | Destinazione proposta |
|---|---|---|---|
| 387 | `rgba(251,246,243,.16)` | bordo header | Hero + `--gh-border-35` |
| 388 | `#FBF6F3` | testo header | token superficie/contrasto ammesso |
| 389 | `rgba(251,246,243,.22)` | superficie header | eliminato dal nuovo Hero o trasparenza di sistema |
| 472, 773 | `#16a34a` | WhatsApp / esito positivo | `--gh-success-text` |
| 479, 674, 780 | `#2563eb` | QR / azione condizionale | QR: `--gh-secondary`; rimozione blacklist: stile outline semantico |
| 691 | `#ead7c5` | bordo | `--gh-border-60` |
| 766 | `#e11d48` | danger | `--gh-danger-text` |
| 780 | `#b91c1c` | danger | `--gh-danger-text` |
| 828, 937, 1138 | `#ffffff` | superficie/contrasto | bianco ammesso |
| 400 | `bg-red-50 border-red-200` | errore | token danger bg/border |
| 485, 1054 | `bg-red-500 bg-red-600` | eliminazione | token danger button/hover |
| 648 | `bg-amber-50 border-amber-400` | warning | token warning bg/border |

### `AddVisit.jsx`

| Posizione | Letterale / classe | Uso corrente | Destinazione proposta |
|---|---|---|---|
| 122 | `rgba(251,246,243,.16)` | bordo header | Hero + `--gh-border-35` |
| 123 | `#FBF6F3` | testo header | token superficie/contrasto ammesso |
| 124 | `rgba(251,246,243,.22)` | superficie header | eliminato dal nuovo Hero o trasparenza di sistema |
| 153 | `#ffffff` | superficie/contrasto | bianco ammesso |
| 135 | `bg-red-50 border-red-200` | errore | token danger bg/border |

## Inventario del kit condiviso

### Esistono gia' e possono essere conservati o estesi

| Contratto CD | Stato reale | Esito |
|---|---|---|
| `Button` / `Btn` | esiste `shared/ui/Button`; l'API e il nome CD divergono | decisione a Luigi: raccomandato estendere `Button` in modo retrocompatibile, non duplicare `Btn` |
| `Card` | esiste | estendere con classi GH senza rompere consumer |
| `Icon` | esiste | estendere il catalogo |
| `StatusBadge` / `StateTag` | esiste `StatusBadge`, copertura parziale | estendere per stati appointment, senza duplicare semantica |
| `Eyebrow` | esiste | allineare misure CD |
| `Skeleton` | esiste | comporre `SkeletonRow` |
| `Brandmark` | esiste | riusare nel nuovo Hero |
| `WarmNotice` / `Notice` | esiste `WarmNotice` | estendere/alias solo se serve, mantenendo API corrente |
| `AppHeader` | esiste ma e' teal e usato fuori perimetro | tenere per le altre pagine; creare `Hero` locale al kit GH |

### Mancano come primitive nominate dal contratto CD

`Hero`, `HeroBtn`, `PetAvatar`, `FidelityBadge`, `Panel`, `Field`,
`SearchBar`, `Pill`, `StatStrip`, `AreaTile`, `SlotRow`, `TierDot`,
`SkeletonRow`, `EmptyState`, `ErrorState`, `ClientRow`, `Fab` e le
composizioni specifiche di Scheda e Visita indicate nell'handoff.

L'attuale badge fedelta' e' inline in `ClientCard`, quindi non conta come
primitiva condivisa. `Icon` non contiene i nomi CD `search`, `plus`,
`calendar`, `user`, `qr`: vanno aggiunti nella Tappa 0; non e' una divergenza
di schema.

## Misura delle cinque aree operative (§9.7)

| Area | Route | Vista | Misura | Esito |
|---|---|---|---|---|
| Pianificazione | `/calendar` | `Calendar.jsx` | 1.572 righe; calendario settimanale/lista e dettagli implementati | viva |
| Team operativo | `/appointments/today` | `DailyAppointments.jsx` | 476 righe; lista giornaliera, approvazione e completamento | viva |
| Controllo business | `/reports/weekly` | `WeeklyRevenue.jsx` | 368 righe; report e dettaglio incassi settimanali | viva |
| Rubrica | `/contacts` | `Contacts.jsx` | 553 righe; direttorio customer/lead e azioni | viva |
| Area cliente | `/requests` | `CustomerRequests.jsx` | 468 righe; richieste, conferma/rifiuto e apertura cliente | viva |

Risposta misurata: **5/5 aree portano a viste implementate; nessuna porta a
una pagina vuota.** Non sono state modificate perche' fuori perimetro.

## Verifica dei campi contrassegnati con ⚠

La verifica Cowork e' **confermata dal codice**, senza interrogare il database:

- la visita seleziona e salva `date`, `treatments`, `issues`, `cost`; non ha
  relazione con operatore, durata o foto;
- `appointments` espone gli stati di conferma e la durata, ma questi campi non
  trasformano una visita in un appuntamento;
- esistono persone/ruoli in profili e membership, ma nessun riferimento a un
  operatore nella riga visita;
- `services` non e' la fonte del form visita corrente: il trattamento resta
  testo libero e il costo resta manuale;
- data ultima visita e conteggio visite sono derivati dalle visite gia'
  incluse dal caricamento pet; non e' stato rilevato un secondo fetch N+1;
- i punti fedelta' hanno fonte separata e l'interfaccia mantiene il fallback
  attuale;
- il contatore richieste indica `pending/da gestire`, non un campo `unread`.

Non e' emersa alcuna divergenza campo presente/assente rispetto alla misura di
Cowork. Il checkpoint puo' quindi essere consegnato; nessuna ragione di schema
autorizza o richiede una modifica.

## Decisioni richieste prima della Fase 2

1. **Dashboard, sesta area:** respingere o autorizzare la tile aggiuntiva
   `Registra una visita`. Raccomandazione: respingerla, per conservare le cinque
   aree imposte dal mandato.
2. **Dashboard, alert pending e slot odierni:** mantenere l'alert reale e non
   introdurre lo slot mobile che richiede nuovi dati. Raccomandazione: si'.
3. **Dashboard, CTA nuovo cliente:** confermare se puo' essere spostata/FAB.
   Raccomandazione: tenere il punto di ingresso attuale nel giro visivo.
4. **Scheda, sezioni:** risolvere la discordanza fra le "sette sezioni" dette
   dall'handoff, i sei pannelli del bundle e i sei nuclei reali piu' due
   condizionali. Raccomandazione: non rimuovere nulla e preservare l'ordine
   semantico corrente.
5. **Scheda mobile:** autorizzare esplicitamente tre viste con una navigazione
   definita oppure mantenere un solo scroll. Raccomandazione: un solo scroll,
   perche' il mandato vieta la riorganizzazione del flusso.
6. **Scheda, sei azioni:** decidere ordine e collocazione di `Registra visita`.
   Raccomandazione: conservare tutte e sei, ma non cambiare ordine/collocazione
   finche' non viene approvato puntualmente.
7. **Registrazione visita:** scegliere la superficie canonica fra route e modal.
   Raccomandazione: estrarre un unico form condiviso, continuare a usarlo nel
   modal reale e mantenere operativa la route esistente.
8. **Kit `Btn`:** decidere se il nome CD sia letterale. Raccomandazione:
   mantenere `Button` ed estenderlo, per non creare due primitive concorrenti.

## Soluzione consigliata a Cowork per il mandato esecutivo

Scrivere la Fase 2 come quattro tappe gia' previste, incorporando prima le otto
decisioni sopra. La modifica minima consigliata e': fondazione GH isolata,
nuovo `Hero` senza cambiare `AppHeader` globalmente, estensione retrocompatibile
dei componenti condivisi gia' esistenti, nuove primitive solo quando mancano,
poi ricomposizione delle tre pagine senza modificare query, mutazioni, route,
copy semantico o ordine dei flussi.

Per la visita, estrarre il form oggi duplicato fra route e modal e lasciare
entrambi i punti di ingresso. Le controprove devono includere sia il gesto
reale dalla Scheda sia l'apertura diretta della route. Rischi residui: una
ricomposizione a due colonne puo' cambiare implicitamente l'ordine di lettura;
la variante mobile a tre schermate non e' eseguibile in modo deterministico
finche' non viene definita la navigazione.

## File toccati

| File | Tipo | Motivo |
|---|---|---|
| `docs/consegne/GH-16-veste-gestionale-tre-schermate-fase-1.md` | nuovo | registro, misure e checkpoint Fase 1 |

Nessun file applicativo, di configurazione, di database o di design e' stato
modificato.

## Verifiche eseguite

- root, branch, base e pulizia iniziale del worktree;
- lettura integrale delle fonti obbligatorie;
- conteggio righe e `style={{` delle tre pagine;
- ricerca dei colori letterali e delle classi colore locali;
- inventario di `shared/ui/` e confronto con il kit CD;
- controllo route per route delle cinque aree operative e lettura delle viste;
- conferma dei campi ⚠ usando soltanto selezioni, mapping e submit presenti nel
  codice;
- controllo dell'assenza di nuove route o modifiche applicative.

`npm run build` e `npm run lint` non sono stati eseguiti: la Fase 1 e'
esclusivamente documentale e il mandato colloca build e prove visive nella
Fase 2. `eslint` resta inoltre non installato, come gia' dichiarato dal mandato.

## Eccezioni e fuori istruzione

- Nessuna eccezione.
- Nessuna attivita' fuori istruzione.
- Nessun accesso a database, nessuna migration, nessun deploy, nessun push.
- GH-14 non e' stato eseguito.
- La Fase 2 di GH-16 non e' stata iniziata.
