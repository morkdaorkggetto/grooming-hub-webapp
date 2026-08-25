# Consegna GH-17 - Veste del gestionale: esecuzione

**Stato:** completato.
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
**Branch:** `feat/customer-app`
**Base Git:** `1ed2c7ccce8a6654114b2ac97c4612f99277390d`
**Ambienti:** nessun accesso a Supabase o ad altri database; nessuna migration; nessun deploy.
**Push:** non eseguito.

## Perimetro eseguito

Eseguito il contratto approvato da GH-16 sulle tre superfici staff:
Dashboard, Scheda cliente e Registrazione visita. Sono state rispettate le
otto decisioni del mandato: cinque aree operative, alert pending mantenuto,
CTA nuovo cliente conservata, ordine e contenuti della Scheda invariati,
singolo scroll mobile, sei azioni complessive nella collocazione reale, form
visita condiviso e `Button` esteso senza introdurre una seconda primitiva.

Il FAB additivo per il nuovo cliente non e' stato usato: era facoltativo e,
alle larghezze minime, avrebbe coperto parte dell'ultima area operativa. Il
punto di ingresso gia' presente resta visibile e operativo.

## Commit delle quattro tappe

| Tappa | Commit | Contenuto |
|---|---|---|
| 0 - Fondazione | `d5ab7b4` | token, CSS staff, primitive e icone |
| 1 - Dashboard | `6d6b8ba` | rivestimento Dashboard e stati |
| 2 - Scheda cliente | `84c0727` | rivestimento Scheda, ordine e azioni preservati |
| 3 - Form visita | commit che contiene questo registro | form condiviso fra modal e rotta, verifiche e registro |

L'hash completo della Tappa 3 viene comunicato a Luigi alla chiusura, poiche'
il registro e' incluso nello stesso commit come richiesto.

## Misure prima e dopo

| Superficie | Righe prima | Righe dopo | `style={{` prima | `style={{` dopo |
|---|---:|---:|---:|---:|
| Dashboard | 659 | 377 | 43 | 0 |
| Scheda cliente | 1.235 | 746 | 105 | 0 |
| Registrazione visita | 361 | 133 | 28 | 0 |

Nelle tre pagine non restano colori esadecimali o `rgb/rgba` letterali. Il
CSS staff contiene un solo breakpoint, `max-width: 640px`. Numeri, date,
conteggi, punti e costi usano cifre tabulari tramite il kit.

## File toccati

| File | Tipo | Motivo |
|---|---|---|
| `src/index.css` | modificato | aggiunta degli unici tre token GH autorizzati |
| `src/main.jsx` | modificato | aggancio del foglio stile staff |
| `src/apps/staff/styles/gh15-staff.css` | nuovo | fondazione e layout responsive delle tre superfici |
| `src/apps/staff/components/StaffKit.jsx` | nuovo | primitive e composizioni locali al gestionale |
| `src/apps/staff/components/VisitForm.jsx` | nuovo | unico form controllato per modal e rotta |
| `src/apps/staff/pages/Dashboard.jsx` | modificato | veste editoriale, righe archivio e stati completi |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | ricomposizione responsiva senza riordino semantico |
| `src/apps/staff/pages/AddVisit.jsx` | modificato | uso del form visita condiviso |
| `src/shared/ui/Button.jsx` | modificato | estensione retrocompatibile per varianti GH |
| `src/shared/ui/Card.jsx` | modificato | estensione retrocompatibile per pannelli GH |
| `src/shared/ui/Eyebrow.jsx` | modificato | supporto alle classi del kit |
| `src/shared/ui/Icon.jsx` | modificato | icone `search`, `plus`, `calendar`, `user`, `qr`, `trash` |
| `src/shared/ui/Skeleton.jsx` | modificato | supporto geometria skeleton GH |
| `src/shared/ui/StatusBadge.jsx` | modificato | supporto agli stati staff |
| `src/shared/ui/WarmNotice.jsx` | modificato | variante Notice GH non distruttiva |
| `src/shared/ui/PetAvatar.jsx` | nuovo | avatar pet riusabile |
| `src/shared/ui/FidelityBadge.jsx` | nuovo | badge fedelta' riusabile |
| `docs/consegne/GH-17-veste-gestionale-esecuzione.md` | nuovo | registro unico della consegna |

Non sono stati modificati `AppHeader`, route, query, mutazioni, pagine staff
fuori perimetro o i quattro file customer espressamente vietati.

## Controprove eseguite

La verifica browser e' stata isolata con fixture locali e intercettazione
delle richieste Supabase: nessuna lettura o scrittura ha raggiunto il demo.

| Superficie | 1440 px | 390 px | 320 px |
|---|---|---|---|
| Dashboard | pass | pass | pass |
| Scheda cliente | pass | pass | pass |
| Form visita diretto | pass | pass | pass |

Per tutte le nove combinazioni: zero overflow orizzontale, zero
sovrapposizioni, zero bersagli interattivi sotto 44 px e zero errori console.

Verifiche funzionali isolate:

- ricerca Dashboard con `Luna`: una sola riga restituita;
- apertura Scheda dal gesto reale sulla riga: riuscita;
- apertura modal visita dal FAB reale della Scheda: riuscita;
- compilazione del form senza invio: il valore resta presente;
- apertura diretta di `/client/:id/add-visit`: stesso form condiviso;
- cinque aree operative e alert pending presenti;
- cinque azioni identita' nello stesso ordine e FAB visita separato;
- tutte le sezioni e i due blocchi condizionali della Scheda preservati.

`npm run build` e' verde. Restano i soli avvisi preesistenti su Browserslist
non aggiornato e chunk superiore a 500 kB. `npm run lint` non e' eseguibile
perche' `eslint` non e' installato; non sono state aggiunte dipendenze.

## Eccezioni e fuori-istruzione

La controprova "registrazione reale di una visita e successiva rimozione" non
e' stata eseguita: richiede due mutazioni sul database, mentre la regola
d'ingresso di GH-17 vieta esplicitamente qualsiasi uso del database. Sono
stati verificati il gesto, il form, la persistenza locale dei valori e i due
punti di ingresso senza inviare la mutazione.

Soluzione consigliata a Cowork: autorizzare un micro-mandato demo separato,
con una visita marcata `[DEMO][GH-17]`, verifica immediata sia nella Scheda sia
nella rotta diretta e cancellazione nella stessa sessione. In alternativa,
Luigi puo' eseguire manualmente lo stesso ciclo sul demo. Non serve una
migration ne' una modifica di codice.

Il bundle CD usa in alcuni punti spaziatura negativa delle lettere; e' stata
normalizzata a `letter-spacing: 0` per rispettare il vincolo UI superiore
della sessione. Non cambia contenuto, flusso o geometria funzionale.

Fuori-istruzione applicativi: nessuno. La sonda Playwright locale usata per le
nove verifiche e' stata rimossa e non entra nel commit. Nessun secret e'
stato stampato, aggiunto o committato.
