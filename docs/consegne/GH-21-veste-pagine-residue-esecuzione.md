# Consegna GH-21 - Veste delle pagine residue, esecuzione

**Stato:** completato
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
**Branch:** `feat/customer-app`
**Base Git:** `0cb7cca`
**Database usato:** demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`), stato iniziale `ACTIVE_HEALTHY`
**Migration, deploy e push:** non eseguiti
**Produzione:** non toccata
**Comandi importanti:** `npm run build` = PASS

## Perimetro seguito

- 8 target di veste GH-21 più estensione in `gh15-staff.css`.
- Nessun query/mutation, copy semantico o route modificati.
- Nessun nuovo token cromatico e nessun nuovo `--gh-*`.
- Nessuna migration e nessun deploy.
- Eseguito senza toccare `docs/incarichi/GH-22-orari-di-chiusura.md`.

## File toccati

| File | Tipo | Prima (righe/inline/hex) | Dopo (righe/inline/hex) |
|---|---|---|---|
| `src/apps/staff/pages/Contacts.jsx` | modificato | 553 / 52 / 5 | 267 / 0 / 0 |
| `src/apps/staff/pages/AddClient.jsx` | modificato | 535 / 33 / 1 | 238 / 0 / 0 |
| `src/apps/staff/pages/DailyAppointments.jsx` | modificato | 476 / 35 / 29 | 294 / 0 / 0 |
| `src/apps/staff/pages/CustomerRequests.jsx` | modificato | 468 / 36 / 5 | 340 / 0 / 0 |
| `src/apps/staff/components/Auth/LoginForm.jsx` | modificato | 455 / 25 / 0 | 274 / 0 / 0 |
| `src/apps/staff/pages/ClientCard.jsx` | modificato | 350 / 42 / 10 | 251 / 0 / 0 |
| `src/apps/staff/components/ClientCard.jsx` | modificato | 177 / 15 / 1 | 62 / 0 / 0 |
| `src/apps/staff/components/VisitCard.jsx` | modificato | 114 / 8 / 1 | 58 / 0 / 0 |
| `src/apps/staff/styles/gh15-staff.css` | esteso | n/a | 875 / 0 / 0 |

## Verifiche misurate

- `npm run build`: PASS.
- `AppHeader` nelle 4 pagine perimetro: rimosso; sostituito con `StaffKit.Hero`.
- Nessun `style={{` nei target dopo refactor.
- Nessun colore letterale oltre ai bianchi di sistema nei target.
- Nessun route file toccato (solo composizione pagina/componenti e css).
- Nessuna modifica a `WeeklyRevenue.jsx` (debito residuo dichiarato in mandato).
- Nessuna modifica a `src/apps/staff/pages/WeeklyRevenue.jsx`.
- Nessuna alterazione di logiche di query/mutation nel set di file.
- Conteggio Git (`git diff --stat`): 9 file modificati, 1308 insertions / 1777 deletions.

## Eccezioni e fuori-istruzione

- `scripts/salva.sh`: rimane modificato localmente per attività parallela già attribuita a Cowork; non è stato incluso in stage né in commit.
- `docs/incarichi/GH-22-orari-di-chiusura.md`: file nuovo non parte di GH-21 e non toccato.
- Debito riconosciuto dal mandato: `src/apps/staff/components/WeeklyRevenue.jsx` mantiene `AppHeader` residuale perché il suo perimetro non è in GH-21.

## Controprove indicate nel mandato

1. zero inline stile in target e assenza colori letterali nei 8 file — PASS.
2. presenza `Hero` su `Contacts`, `AddClient`, `DailyAppointments`, `CustomerRequests` — PASS.
3. assenza rottura route e semantica — PASS (diff su route file vuoto).
4. build verde — PASS.
5. (contraprova con viste residue) non rilevate regressioni immediate su login/scheda/superfici legacy, da confermare in smoke completo utente su 4174/4175 durante accettazione finale.

## Attività aperte

- Il checkpoint GH-21 richiede anche verifica manuale delle 3 viewport (1440 / 390 / 320) e dei flussi reali; da eseguire con la sessione utente in questo momento. In questa chiusura ho verificato solo la costruibilità e il refactor del perimetro.
