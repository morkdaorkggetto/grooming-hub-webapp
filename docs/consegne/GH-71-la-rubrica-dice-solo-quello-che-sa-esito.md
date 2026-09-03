# GH-71 - La rubrica dice solo quello che sa

## Esito e perimetro

**Implementazione e controprove locali concluse.** Il blocco iCloud e superato; questo registro sostituisce l'interruzione provvisoria. Accettazione visiva di Luigi ancora da fare. Nessun push, merge o deploy.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`, branch `main`.
- Base **`e5404b5486efc72cf51480b5faa8609019020770`**, stato iniziale pulito. Alla ripresa presenti soltanto le modifiche di questo giro.
- Mandato locale GH-71 letto integralmente. Prove con fixture in memoria: **0 accessi a demo o produzione, 0 scritture DB, 0 credenziali lette o modificate**. Nessuna migration, policy, rotta, query o componente nuovo.
- Codice, registro ed evidenze nello stesso commit locale. Hash comunicato a Luigi alla chiusura; identificabile con `git log -1 --format=%H -- docs/consegne/GH-71-la-rubrica-dice-solo-quello-che-sa-esito.md`.

## File del commit

| File relativo a webapp/ | Intervento |
| --- | --- |
| `src/apps/staff/pages/Contacts.jsx` | Condizioni delle etichette, razza del pet selezionato, tre testi richiesti; rientro del blocco JSX |
| `src/apps/staff/lib/database.js` | Una sola frase di errore: rubrica contatti al posto di direttorio clienti; query invariata |
| `src/apps/staff/styles/gh15-staff.css` | 8 righe, solo sotto .gh-directory-page: controlli almeno 46 px, filtri almeno 44 px |
| `docs/consegne/GH-71-la-rubrica-dice-solo-quello-che-sa-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-71/misure.json` | Fixture, hash SHA-256 dei tre sorgenti, richieste, toni, conteggi e misure prima/dopo |
| `docs/consegne/evidenze/GH-71/multi-1365.png` | Tre pet, razza della seconda scelta, nessuna etichetta standard |
| `docs/consegne/evidenze/GH-71/standard-1024.png` | Scheda ordinaria senza etichette, razza presente |
| `docs/consegne/evidenze/GH-71/multi-375.png` | Scheda multipet mobile, schermata completa dopo scorrimento |
| `docs/consegne/evidenze/GH-71/exceptions-1365.png` | Lead manuale e Lead + QR, una e due etichette |

## Scelte e controprove

Banco Chromium isolato: componente Contacts e adattatore dati reali, prima dalla base Git e dopo dai sorgenti modificati, stessi 9 contatti sintetici. Auth getCurrentUser simulato; risposte REST intercettate su localhost. Nessuna misurazione nuova su dati del salone. Evidenze complessive circa 228 KiB, non log integrali.

| Controprova | Misura / esito |
| --- | --- |
| Cliente + Manuale | 2 etichette prima, 0 dopo; nessun contenitore vuoto |
| Lead, Contattato, Archiviato | 1 etichetta ciascuno: warning, neutral, neutral; classi e colori calcolati identici alla base |
| Cliente QR, Cliente WhatsApp | 1 etichetta origine ciascuno; colore invariato |
| Lead + QR | 2 etichette, entrambe conservate; totale sul banco 18 prima, 7 dopo |
| Conteggi e cinque filtri | Tutti 9, Lead 2, Contattati 1, Clienti 5, Archiviati 1; Da gestire 2 e Contattati 1 invariati. Identici anche gli insiemi restituiti dai filtri |
| Razza presente | Maltese e barboncino conservati testualmente, anche la minuscola; dopo Pet sulla stessa riga desktop, immediatamente sotto su mobile |
| Razza assente | Nessuna riga per null, stringa vuota, soli spazi e contatto senza pet; nessun segnaposto Razza |
| Tre pet | Alfa: Barboncino; Beta: Barboncina bianca e nera; Gamma: riga assente. Tre cambi, sempre 2 letture totali |
| Letture all'apertura | 2 REST prima e 2 dopo: tenant_memberships + customers; richieste e selezioni identiche. Auth simulato separatamente, non incluso nel conteggio |
| Ricerca / azioni | 4 ricerche prima/dopo, risultati identici. Etichette dei comandi confrontate in 4 stati; URL WhatsApp identico e intercettato senza invio. Apri scheda pet punta a /client/second dopo scelta Beta |
| Modulo | Origine conserva le 3 opzioni e il valore manual. Tre testi esatti verificati nel DOM |
| Build / diff | npm run build PASS, 159 moduli; git diff --check PASS |
| Rete / runtime browser | 0 richieste verso database esterni, 0 richieste inattese, 0 errori JavaScript |

`getCustomerDirectory` caricava gia `pets(id,name,breed,photo_url,created_at)`: nessuna selezione allargata. La razza usa il pet scelto o il primo gia ordinato nell'adattatore. `trim()` decide soltanto se la riga esiste; il testo visualizzato resta quello originale. Il fatto Pet continua a mostrare l'elenco esistente dei nomi.

Testi esatti:
- `Tutti i contatti del salone, e come richiamarli.`
- `Aggiungi un contatto alla rubrica`
- `Salva contatto`

Ricerca `rg -ni 'direttorio|salva lead|inserisci una richiesta' src`: **0 corrispondenze**, exit 1 atteso. Titolo Contatti invariato.

### Layout e bersagli

| Viewport | Bersagli sotto 44 px, prima -> dopo: standard / multipet | Modulo aperto + 9 schede | Sbordamento dopo |
| --- | --- | --- | --- |
| 1365 x 900 | 9 -> 0 / 10 -> 0 | 41 controlli, minimo 44 px | 0 px |
| 1024 x 900 | 9 -> 0 / 10 -> 0 | 41 controlli, minimo 44 px | 0 px |
| 375 x 900 | 0 -> 0 / 0 -> 0 | 41 controlli, minimo 44 px | 0 px |

I controlli desktop preesistenti erano alti 32-38 px: correzione CSS circoscritta alla rubrica per rispettare la controprova esplicita, senza cambiare logica dei filtri o componenti condivisi. Input ricerca interno 44 px, involucro e pulsanti 46 px, filtri 44 px; textarea conserva il minimo superiore. Larghezza minima misurata 67,16 px. Razza lunga non troncata in nessuna delle tre larghezze. Screenshot ispezionati.

## Tempi e interruzioni

- Primo tentativo **03/09/2026 05:41:17-05:45:45 CEST**, 4 min 28 s inclusa attesa: compilazione bloccata 130,01 s, user 0,05 s; file Tailwind e README marcati dataless. Processi arrestati e problema comunicato.
- Secondo tentativo **05:57:30-05:58:32 CEST**, 1 min 2 s: ancora 305 file node_modules e 2.671 file .git dataless, oltre a .gitignore. Git arrestato dopo 63,84 s, banco dopo 56,84 s: tempi sovrapposti, non sommabili.
- Dopo lo scaricamento forzato da Luigi, controllo precedente alla ripresa: 0 file dataless nelle aree ricontrollate. **Ripresa 07:04:24-07:11:30 CEST**, 7 min 6 s fino alle evidenze e all'arresto del server. Pulizia finale, stesura del registro e commit successivi esclusi. Intervalli fra i tentativi esclusi; nessun totale artificiale delle ore intercorse.
- Alla ripresa Git status **0,12 s**; banco prima **0,50 s**, ultimo banco dopo **0,30 s**; ultima suite browser **2,03 s reali** (1,77 s misurati nello script); build finale **1,37 s reali**, Vite **1,07 s**.
- Un primo test browser ha atteso 30 s per un selettore di test troppo restrittivo su Scegli pet; corretto il selettore, non il menu applicativo. Non era un nuovo blocco iCloud.
- Nessuna reinstallazione o modifica a iCloud. Restano gli avvisi build non bloccanti su Browserslist e bundle oltre 500 kB.

## Limiti, pulizia e passo finale

Suite RLS **non rieseguita**, come richiesto. Ultima misura viva: GH-63, **60 PASS, 0 FAIL, 0 SKIP**; non presentata come misura odierna.

Nessun login reale o salvataggio, nessuna prova Safari live. Banco della pagina senza shell staff e senza schermata di dettaglio pet: verificata la destinazione della navigazione, non il dettaglio. Comandi di stato confrontati e lasciati invariati, non eseguiti per evitare scritture. Nessun messaggio WhatsApp inviato.

**Eccezione di file dichiarata:** database.js non serviva per caricare breed, gia presente, ma conteneva l'ultima occorrenza minuscola di direttorio. Modificata solo quella frase per soddisfare la ricerca globale richiesta. Nessun altro ampliamento funzionale. CSS previsto dal mandato, limitato alla soglia di 44 px.

**Pulizia:** 0 fixture DB create; 0 server e browser di questo giro rimasti attivi. Rimosso /tmp/gh71 dopo aver conservato le evidenze: build.mjs, serve.mjs, fixtures.mjs, verify.mjs, evidence.mjs, bundle before/after, misure grezze e screenshot intermedi. Nessun processo su 4191. Nessun secret nei file consegnati.

**A Luigi, dopo il rilascio e una ricarica dall'origine (Opzione-Comando-R):** scorri Contatti senza le etichette ripetute, guarda una razza e rileggi il sottotitolo. **Cosa non ti torna?** Questo controllo resta aperto, non e stato simulato come accettazione.
