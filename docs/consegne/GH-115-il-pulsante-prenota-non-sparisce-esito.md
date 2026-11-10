# GH-115 - Il pulsante della prenotazione non sparisce

**Esito: codice pronto, con eccezioni esplicite di collaudo e metadato demo.** Base locale `4c377715ccdd32062ff9f05435db8b117fb28d8a` su `main`; nessun push, merge, deploy o accesso al prodotto. Il commit locale e quello che contiene questo registro (`git log -1 --format=%H -- docs/consegne/GH-115-il-pulsante-prenota-non-sparisce-esito.md`). Canone adottato e corrente 1.3, fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md`, SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43` (misurato il 10/11 alle 12:19 CET).

## Misura iniziale e modifica

Nel codice della base il riepilogo e nascosto sotto 640px e il pulsante mobile esiste solo con `canSubmit=true`: con un campo mancante non appare nulla. `canSubmit` e rimasto invariato. Il pulsante ora resta presente, ha `aria-disabled` e `type=button` quando incompleto; un tocco porta al primo campo mancante. Non uso `disabled` in quello stato perche impedirebbe il tocco. Durante l'invio uso `disabled` nativo; `handleSubmit` blocca comunque l'invio incompleto. La riga `Manca:` elenca i campi nell'ordine dei passi, nel riepilogo desktop e sopra il pulsante mobile, con `aria-live` e `aria-describedby`. Il fondo del modulo mobile riserva 300px per ultimo campo ed errore. Nessun token o classe tipografica nuova.

## Verifiche

| Controprova | Stato |
| --- | --- |
| Vuoto a 375px: pulsante visibile, grigio e tocco al passo 1 | `Manca: il pet, cosa serve, la data, come sta il pelo.`; `aria-disabled=true`, `type=button`, `opacity=0.55`, pulsante 48px alto, fondo 92px sopra la nav. Tocco dal fondo: focus `gh-book-pet-step`, top circa 0px dopo scroll. |
| Solo eta mancante | `Manca: l'eta di Pepe.` (in UI apostrofo tipografico); tocco: focus `declared-pet-age`. La data di nascita di Pepe e stata resa temporaneamente nulla sul solo demo, con autorizzazione separata di Luigi. |
| Solo passo 4 mancante | `Manca: come sta il pelo.`; tocco: focus `gh-book-coat-step`, top circa 0px dopo scroll. |
| Modulo completo | Riga `Manca:` assente, `aria-disabled=false`, `type=submit`, `opacity=1`. Una richiesta `pending` per Pepe/Bagno/16-11-2026, marker `[DEMO GH-115]`, e stata creata dall'app. Schermata: `Ci pensiamo noi da qui.` |
| Pulizia richiesta | `select count(*) from public.appointment_requests` sul solo demo: 0 prima, 1 dopo l'invio, 0 dopo il DELETE sull'ID esatto `5234be39-fbc9-4463-ba4a-3d86c8539dff`; marker GH-115: 0 finale. Nessun'altra richiesta creata. |
| Layout 375px | `document.documentElement.scrollWidth=375` con viewport 375. Alla fine del modulo, textarea bottom 467px, footer top 629px, nav top 725px: nota visibile e separata. Con pulsante attivo, textarea bottom 503px, footer top 672px. |
| Layout 1365px | `scrollWidth=1365` con viewport 1365. Riepilogo desktop visibile, riga `Manca:` leggibile, pulsante dentro la colonna (x 842-1248); azione mobile `display:none`. Tocco sul pulsante incompleto: focus al passo 1. |
| Errore d'invio | **Non provocato dal vivo**: avrebbe richiesto un secondo invio/guasto artificiale oltre la fixture ammessa. Il blocco errore resta dopo il passo 4 e prima del padding mobile di 300px; geometria dell'ultimo campo misurata come sopra. Questo controllo e strutturale, non una controprova di errore reale. |
| Build | `npm run build`: riuscito, 183 moduli; avvisi Browserslist e chunk >500 kB. |
| Statico | `git diff --check`: riuscito. |

**Ripristino del pet demo.** Prima della prova, Pepe (`869bf0fc-9a09-4254-8a98-6220f96383e0`) aveva `birth_date=2021-03-15`, `updated_at=2026-08-28 04:40:42.460517+00` e `md5(row_to_json(p)::text)=7fc11a1192e6774b90b5d3d99f65cff0`. Dopo la prova la data e tornata `2021-03-15`, e il confronto di tutte le altre colonne e esatto: sostituendo **solo** `updated_at` nel testo di `row_to_json(p)` con il valore originario, l'MD5 torna `7fc11a1192e6774b90b5d3d99f65cff0`. Il trigger `update_pets_timestamp` ha pero lasciato `updated_at=2026-11-10 11:37:05.815598+00`; l'MD5 reale e `f3d275ad0508c0cc2d0c4bdadcd467fc`. Il tentativo di ripristinare anche il timestamp tramite parametro di sessione e stato rifiutato con `42501 permission denied`; nessuno schema o trigger e stato modificato. **Scostamento residuo dichiarato: solo il timestamp del pet demo.**

## File consegnati

| File | Stato |
| --- | --- |
| `src/apps/customer/pages/Book.jsx` | Pulsante persistente, elenco mancanze e rimando al campo. |
| `src/apps/customer/pages/Book.css` | Posizione mobile, stile attenuato e spazio finale. |
| `docs/consegne/GH-115-il-pulsante-prenota-non-sparisce-esito.md` | Questo registro, nello stesso commit del codice. |

**Eccezioni e fuori istruzione:** nessuna modifica fuori dai due file codice e dal registro. L'estensione temporanea sul dato di Pepe e stata autorizzata da Luigi, senza migrazione. Restano aperti solo il timestamp demo e la prova di errore non riprodotta; non sono presentati come superati. Il mandato non versionato, `docs/incarichi/CD-12-il-calendario-del-mese.md`, le altre migrazioni non versionate e le cartelle private del salone sono rimasti fuori da modifiche, stage e commit. Nessuna lettura dei materiali personali. **Scoperte:** 1 (nessun pet collegato a cliente demo senza data di nascita, query di conteggio sul demo = 0). **Recuperi:** 0. **Passaggi richiesti a Luigi:** 2 (accesso cliente demo; data di nascita temporaneamente nulla). **Tempo misurato:** prima ora rilevata 10/11 alle 12:19:38 CET; ripresa alle 12:29:08 CET; verifica finale alle 12:39:37 CET, almeno 15 minuti documentati. Il controllo sulla data assente e il suo ripristino hanno aggiunto circa 4 minuti, dal cambio alle 12:33 al ripristino alle 12:37 CET.
