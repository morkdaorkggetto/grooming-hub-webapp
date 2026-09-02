# Consegna GH-64 - Trovare un cane nella settimana

## Base e perimetro

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `c80c434`.
- Progetto: Grooming Hub SaaS.
- Perimetro ammesso: demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`) in lettura/scrittura.
- Produzione `azgehoseiojodltcttfb` fuori perimetro; nessun accesso.
- Nessun push, merge o deploy.
- Nessuna migration/esecuzione SQL nuova.

## Esito

La barra planner ora ha ricerca in riga (pet / proprietario / telefono) e il pulsante `Vai a data` con icona calendario che tenta `showPicker()` su un input `date` nascosto.

- La ricerca **non filtra** la griglia: marca i match con stato visivo dedicato.
- In caso di assenza risultati nella settimana visibile, il messaggio usa la stringa con “in questa settimana”.
- L’etichetta accessibile del controllo data esplicita “Vai a data”.
- Le modifiche sono state applicate in sola UI, senza toccare dati applicativi.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Stato ricerca, normalizzazione testo/cellulari, matching per pet/proprietario/telefono (anche parziale), conteggio match per feedback. |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | `AppointmentChip`/`RequestChip` marcati da match; feedback testuale ricerca; pulsante calendario con `showPicker()`, warning di fallback e label accessibile. |
| `src/apps/staff/pages/Calendar.css` | modificato | Stili ricerca, feedback e icona data, target minimo 44px, layout responsive con spostamento della ricerca sotto 640px/389px. |
| `docs/consegne/GH-64-trovare-un-cane-nella-settimana-esito.md` | aggiunto | Registro consegna con preflight, verifiche e chiusura task. |

## Verifiche tecniche

- `git diff --check`: PASS.
- `npm run build`: PASS con output:
  - `Vite: 5.4.21`
  - `159` moduli
  - build `1.19 s`
  - `real 1.63`
  - `user 3.03`
  - `sys 0.24`
  - warning non bloccanti: Browserslist datato, bundle JS oltre 500 kB.
- Nessuna modifica a RLS, suite RLS o migration.

## Controprove previste dal mandato

- ricerca per nome pet / proprietario / telefono parziale
- matching senza filtri (griglia integra)
- messaggio “Nessun appuntamento in questa settimana” quando zero match
- verifica apertura picker Safari e Chrome con warning accessibile
- verifica responsive 1365/1024/375
- build verde

## Stato contatori (eseguito nel codice)

- In sessione attiva la ricerca conta solo il set visibile della settimana (logica nel calcolo `searchMatchedCount` aggregato).
- Nessuna modifica ai conteggi globali “lavorati sul momento”/prenotati.

## Eccezioni

- Le prove finali manuali con browser del punto 3.6/3.7 del mandato vanno svolte nella sessione di verifica operativa (passo finale Luigi).
- Nessun file esterno al perimetro (`docs/diario-progetto.md`, `scripts/salva.sh`, `docs/CONTRIBUTING.md`, etc.) è stato toccato.
