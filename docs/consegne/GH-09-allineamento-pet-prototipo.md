# GH-09 - Allineamento Scheda pet al prototipo

**Stato:** completato e verificato
**Data:** 24 agosto 2026
**Branch:** `feat/customer-app`
**Base dichiarata:** `caf50e4d64f6eaa73108a7f5e96ba4700d85c84d`
**Commit:** commit unico GH-09, soggetto `feat: align customer pet page with prototype`; hash riportato nella risposta di consegna per evitare un riferimento circolare al commit che contiene questo registro
**Ambiente dati:** solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`) per le controprove; produzione non consultata e non modificata
**Push:** non eseguito

## Fonti lette

- `docs/incarichi/GH-09-allineamento-pet-prototipo.md`;
- `design_handoff_customer_app/00-ERRATA.md`;
- `design_handoff_customer_app/04-schermate.md`, sezione 04.2;
- `design_handoff_customer_app/05-design-tokens.md`;
- `design_handoff_customer_app/reference/pet-page.jsx`, variante V1 Editoriale;
- `design_handoff_customer_app/reference/proto/proto-dashboard.jsx`, `PetScreen`;
- `design_handoff_customer_app/reference/tokens.css`;
- implementazione corrente `src/apps/customer/pages/Pet.jsx`;
- hook corrente `src/apps/customer/hooks/usePetVisits.js` e schema/migration di `visits`.

## Misure iniziali

- `Pet.jsx`: 704 righe, 60 prop `style`, di cui 42 letterali inline e 18 riferite a oggetti; 17 oggetti `*Style` locali.
- Hero corrente: avatar 132 px desktop / 112 px mobile; nome Fraunces 48 px desktop / 38 px mobile, weight 500.
- Riferimento GH-09/token: nome Fraunces circa 56 px desktop / 40 px mobile, weight 500. V1 usa avatar 140 px desktop / 88 px mobile.
- Colori letterali in `Pet.jsx`: `#fff`, fallback `#3f6658` e `#8f3f49` (questi ultimi due vietati da ERRATA 8).
- Prezzi resi nel DOM: zero. Il campo `cost` viene pero ancora selezionato dall'hook customer.
- Storico corrente: data, `treatments`, `issues`; nessun operatore.
- Schema `visits`: non contiene un riferimento a operatore/groomer. L'hook seleziona solo colonne native della visita e non esiste una derivazione attendibile del nome operatore.

## Tabella esaustiva degli scostamenti

| Area | Implementazione corrente | Riferimento | Esito proposto | Motivo / intervento Fase 2 |
|---|---|---|---|---|
| Variante compositiva | Scheda funzionale a card, senza adesione esplicita a V1 | V1 Editoriale e 04.2 sono la fonte | **Allineare** | Usare la gerarchia editoriale V1 senza copiare dati fittizi o parti fuori scope. |
| Shell globale | Usa routing, `CustomerNav` e larghezza app reale | Il canvas include una top bar dimostrativa propria | **Tenere** | La top bar del canvas e' scaffolding del prototipo; duplicarla romperebbe la navigazione reale. |
| Sfondo e contenitore | `BackgroundDecor`, fondo `bg-main`, max-width 1040 | V1 usa superficie chiara; `proto-dashboard` usa `bg-main` e max-width 1040 | **Tenere** | Il secondo riferimento conferma il contenitore reale e mantiene coerenza con le altre pagine customer. |
| Hero desktop | Flex, avatar 132, titolo 48 | V1: avatar 140, titolo 56; token: circa 56 | **Allineare** | Avatar 140 e titolo 56 tramite token, mantenendo il wrapping robusto. |
| Hero mobile | Avatar 112, titolo 38, layout orizzontale finche' possibile | V1: avatar 88, titolo 34; token/`proto-dashboard`: titolo circa 40 | **Allineare in parte** | Titolo 40 da token; avatar 88 come V1. Conservare il layout responsivo reale e verificare a 390/320. |
| Peso e tracking titolo | Weight 500 e letter-spacing 0 | Token: weight 500; V1 storico usa tracking negativo | **Tenere** | Weight gia corretto; tracking 0 rispetta il sistema applicativo corrente e non altera la leggibilita. |
| Meta hero | Specie, razza, eta | 04.2: specie, razza, eta | **Tenere** | Contratto gia coincidente; non aggiungere frasi o conteggi fittizi del mockup. |
| CTA prenotazione | `Richiedi appuntamento` nel gruppo azioni hero | 04.2: `Prenota per {nome}`, fissa mobile / sticky desktop | **Allineare** | Copy personalizzata e destinazione esistente `/u/book?petId=...`; barra fissa mobile e azione sticky desktop, senza promettere disponibilita. |
| Contatto negozio | Assente | Presente solo nella V1 desktop | **Tenere assente** | Non richiesto da 04.2 e manca un recapito tenant affidabile nel perimetro GH-09. |
| Appuntamento futuro | Assente | Card fittizia nel prototipo V1 | **Tenere assente** | GH-09 non autorizza una nuova query; 04.2 richiede storico e CTA, non questa card. |
| Fedelta e statistiche | Assenti | V1 e `proto-dashboard` mostrano fedelta/stats | **Tenere assenti** | ERRATA 2: fedelta e profilo esteso fuori scope Fase 1. |
| Ordine sezioni | Hero; anagrafica + preferenze/note; storico | 04.2: hero, anagrafica, preferenze, note, storico, CTA | **Allineare** | Rendere l'ordine leggibile anche nel DOM/mobile; CTA resta persistente come prescritto. |
| Anagrafica | Card con 6 campi read-only | 04.2 richiede gli stessi 6 campi | **Tenere dati, allineare presentazione** | Dati completi e permessi corretti; passare a lista/griglia editoriale meno pesante. |
| Campi inventati dal prototipo | Nessun cibo preferito, tier o conteggio fittizio | Il mockup contiene campi non presenti nel contratto corrente | **Tenere assenti** | Non inventare dati e non estendere schema/API. |
| Preferenze e note | Due card, editate dentro un unico modo globale | 04.2: sezioni distinte, modifica inline per sezione; evitare form onnicomprensivo | **Allineare** | Conservare draft, guard e salvataggio ma offrire azione per sezione; nessun cambio al contratto DB. |
| Foto | Upload disponibile solo dopo `Modifica` globale | Foto modificabile con controllo contestuale | **Allineare** | Rendere l'azione foto contestuale, conservando resize, preview, cleanup e stati busy/error. |
| Stati | Skeleton, errore, 404/RLS, saving, saved, save error | 04.2 richiede gli stessi stati | **Tenere** | Funzionalita GH-02-ter piu completa del mockup; regressione vietata. |
| Guard modifiche | Guard navigazione e conferma annullamento | Non dettagliata nel mockup | **Tenere** | Protezione funzionale GH-02-ter esplicitamente da conservare. |
| Storico: origine dati | Query `visits`, ordinata desc | 04.2 parla di appointments; piano applicativo GH-02 usa `visits` | **Tenere** | Il modello vivo e le RLS correnti sono su visite concluse; GH-09 vieta migration/refactor architetturale. |
| Riga visita: gerarchia | Data lunga in colonna, trattamento, issue sotto | V1: blocco giorno/mese, servizio, operatore e nota | **Allineare** | Adottare il ritmo V1: data compatta, servizio e nota post-visita; niente prezzo. |
| Riga visita: operatore | Assente | Candidato `Bagno - Giulia` | **Decisione a Luigi** | Lo schema `visits` non registra l'operatore. Raccomandazione: non mostrarlo in GH-09; demandare un eventuale `performed_by_user_id` a un mandato dati separato. |
| Riga visita: dettaglio | Riga non cliccabile | 04.2 cita modal read-only; V1 non lo implementa | **Tenere senza modal** | I dati disponibili sono gia visibili nella riga; un modal duplicativo eccede l'allineamento meccanico. |
| Prezzi | Non visualizzati; `cost` ancora richiesto in rete | ERRATA 3: nessun prezzo customer, mai | **Allineare completamente** | Rimuovere `cost` e `discount_percent` anche dalla select customer e provare grep/DOM a zero. |
| Colori | Tre hex/fallback locali, inclusi due fuori palette | Solo token; ERRATA 8 | **Allineare** | Usare `--color-success-text`, `--color-danger-text`, `--color-surface-main`; zero hex in `Pet.jsx`. |
| Raggi e ombre | Valori misti numerici e rgba locali | Radii token e ombre tenui | **Allineare** | Ricondurre meccanicamente a token esistenti; nessuna nuova palette. |
| Stili inline | 60 applicazioni, 42 letterali | Mandato: riduzione meccanica | **Allineare** | Spostare layout/stati responsivi in CSS della pagina; lasciare inline solo valori realmente dinamici (es. dimensione avatar/preview). Nessun refactor shared. |
| Responsive | JS `innerWidth < 720`, flex auto-wrap | Verifica obbligatoria 1440/390; V1 ha composizioni dedicate | **Allineare** | Preferire media query per il layout e mantenere JS solo se necessario ai valori dinamici; nessun overflow. |
| Accessibilita azioni | Label foto, title e live region gia presenti | Controlli comprensibili e stati leggibili | **Tenere** | Non sacrificare semantica e feedback nel riallineamento visivo. |

## Decisione accettata da Luigi

Luigi ha approvato la Fase 2 con questa sola eccezione esplicita:

- **operatore nella riga visita:** escluso da GH-09, perche il dato non esiste nello schema e non e' derivabile in modo corretto. Se l'informazione sara desiderata, la soluzione consigliata a Cowork resta un micro-mandato dati separato che definisca provenienza, backfill e RLS di un riferimento stabile (per esempio `visits.performed_by_user_id`), senza usare un nome libero o attribuire tutte le visite all'operatore del tenant.

La Fase 2 e stata eseguita senza migration e senza cambiare il contratto dei provider o delle API applicative.

## Risultato Fase 2

- composizione editoriale V1 adottata su hero, sezioni e righe visita;
- hero misurato tramite token a 56 px desktop / 40 px mobile, avatar 140 / 88 px;
- ordine DOM: hero, anagrafica, preferenze, note, visite, CTA;
- CTA `Prenota per Luna` diretta a `/u/book?petId=...`, sticky desktop e fissa sopra la bottom navigation mobile;
- anagrafica read-only conservata con i sei campi reali;
- preferenze e note ora hanno modifica inline per sezione, senza form globale;
- upload foto contestuale conservato con preview, resize, salvataggio e cleanup;
- visita resa con giorno/mese, trattamento e nota; operatore e prezzo assenti;
- `cost` e `discount_percent` rimossi anche dalla query `usePetVisits`;
- stili JSX ridotti da 60 prop `style` a 1 solo stile dinamico per lo skeleton; layout spostato in CSS dedicato;
- colori, raggi, ombre e dimensioni hero ricondotti ai token.

ERRATA applicate: voce 2 (fedelta fuori Fase 1), voce 3 (nessun prezzo customer), voce 8 (nessun colore fuori palette). La voce 9 non richiede interventi GH-09.

## File esaustivi

| File | Intervento | Commit |
|---|---|
| `src/apps/customer/pages/Pet.jsx` | gerarchia V1, editing contestuale, CTA persistente, righe visita, stati e guard conservati | questo commit |
| `src/apps/customer/pages/Pet.css` | nuovo layout editoriale e responsive 1440/390/320 | questo commit |
| `src/apps/customer/hooks/usePetVisits.js` | rimossi `cost` e `discount_percent` dalla select customer | questo commit |
| `src/shared/tokens/tokens.css` | token hero e ombre prescritti dal bundle | questo commit |
| `docs/consegne/GH-09-allineamento-pet-prototipo.md` | confronto Fase 1 promosso a registro finale | questo commit |

## Controprove finali

| # | Verifica | Esito misurato |
|---|---|---|
| 1 | Tabella scostamenti | PASS: tabella completa sopra, accettata da Luigi come contratto della Fase 2. |
| 2 | Zero hex in `Pet.jsx` | PASS: grep senza corrispondenze; success, danger e superficie usano token. |
| 3 | Zero prezzi | PASS: grep `cost|discount_percent|price|prezzo|EUR|euro` senza corrispondenze in `Pet.jsx` e `usePetVisits.js`; DOM a 1440/390/320 con 0 occorrenze prezzo. |
| 4 | Visuale 1440 | PASS: hero 56 px weight 500, avatar 140 x 140, CTA `position: sticky`, `scrollWidth=1440`, nessun overflow. |
| 5 | Visuale 390 | PASS: hero 40 px, avatar 88 x 88, CTA `position: fixed` sopra la nav; sovrapposizione CTA-nav 0 px, `scrollWidth=390`. |
| 6 | Regressione 320 | PASS: hero 40 px, `scrollWidth=320`, nessun overflow, sovrapposizione CTA-nav 0 px. |
| 7 | Edit e guard | PASS: nota modificata con marker temporaneo; Salva attivo; click Home ha aperto `confirm`; dialog annullato, URL e testo preservati. |
| 8 | Salvataggio e F5 | PASS: marker salvato, visibile dopo hard reload sulla rotta pet; nota demo originale poi ripristinata e riletta. |
| 9 | Foto | PASS: PNG sintetico 1600 x 1600 ridimensionato in anteprima a 1024 x 1024, caricato e riletto 1024 x 1024; `photo_url` riportato a `NULL`, oggetto eliminato, conteggio residuo 0, placeholder riletto dopo reload. |
| 10 | Operatore escluso | PASS: grep `operator|groomer` senza corrispondenze nei due file customer interessati. |
| 11 | Build e warning | PASS: `npm run build`, 138 moduli. Restano solo Browserslist datato e chunk oltre 500 kB, entrambi preesistenti. |
| 12 | Console | PASS funzionale: zero errori; solo i due warning React Router future flags preesistenti. |

## Pulizia demo

- nota Luna ripristinata a `[DEMO GH-02] Luna preferisce pause brevi durante l asciugatura.`;
- `pets.photo_url` di Luna ripristinato a `NULL`;
- oggetto Storage sintetico GH-09 eliminato, corrispondenze residue 0;
- nessun account, membership, appuntamento o altro record creato;
- nessuna modifica o interrogazione sulla produzione.

## Eccezioni e fuori istruzione

- Nessun file applicativo e stato toccato prima dell'accettazione del checkpoint.
- Il primo controllo automatico del guard e rimasto in attesa del dialogo nativo perche il click era atteso prima della lettura del dialogo. Il tab e stato abbandonato senza scritture; la prova e stata ripetuta coordinando click e dialogo ed e passata.
- La prima resa mobile ha rivelato che la CTA fissa ereditava `top` dal desktop; aggiunto l'override minimo `top: auto`, quindi ripetute con successo le prove 390 e 320.
- `npm run lint` non e eseguibile: lo script esiste ma `eslint` non e installato (`sh: eslint: command not found`). Nessuna dipendenza aggiunta fuori mandato.
- Le modifiche parallele di Cowork in `docs/diario-progetto.md` e `docs/incarichi/GH-11-prova-generale-migrazione.md`, comparse durante GH-09 e confermate da Luigi, sono state ignorate e restano fuori stage/commit.
- Nessuna migration, modifica di schema, refactor architetturale, deploy o push.
- Nessun secret letto, scritto o committato.
- La misura Cowork di 45 blocchi inline e la baseline post GH-08 non erano direttamente equivalenti: sul file risultavano 42 letterali inline, 60 prop `style` totali e 17 oggetti stile locali. La misura finale ripetibile e 1 prop `style` dinamica.

## Suggerimento per Cowork

Non aggiungere il nome operatore come testo libero o come derivazione dal tenant. Un eventuale mandato futuro dovrebbe introdurre un riferimento stabile sulla visita, definire il comportamento per le visite storiche senza operatore, verificare RLS staff/customer e solo dopo aggiornare la select e la riga UI. Fino ad allora l'assenza del dato e il comportamento corretto.
