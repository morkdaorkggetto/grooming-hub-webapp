# Incarico GH-13 — Catena residua e Fase 3: la durata che dimensiona G6

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 24 agosto 2026
**Continua** GH-12 dagli Atti 5-7 del mandato `docs/incarichi/GH-12-chiusura-prova-generale.md`, che si erano fermati al checkpoint previsto.

## Regola d'ingresso

**Primo atto della sessione**: dichiarare nel registro la root su cui stai lavorando e il project ref bersaglio. Se la root non è `grooming-hub-web`, fermarsi e segnalarlo. Una sola sessione lavora su questo mandato; se rilevi atti concorrenti non tuoi, fermati e consegna un'interruzione motivata.

## Bersaglio e divieti

- **Solo** il progetto temporaneo `grooming-prova-generale`, ref `xkieyzuhtpiysjugtdik`.
- **Produzione vietata**: nessuna query, nessun atto. Demo `grooming-hub-demo` fuori perimetro.
- I due oggetti Storage orfani elencati in `docs/consegne/GH-12-...md` §4 **non si toccano**: sono un gesto di Luigi via Storage API dentro G6.
- Nessun push.

## Stato di partenza (da confermare all'apertura)

| Entità | Atteso |
|---|---:|
| customers | 260 |
| pets | 282 |
| visits | 452 |
| contacts | 287 |
| `customers.phone` nullable | NO |
| conflitti di preflight | 0 |

Se non coincide, fermarsi: qualcuno ha operato dopo GH-12.

## Il deliverable di questo mandato

Non è il database migrato — quello è già quasi fatto. È **la durata end-to-end della catena**, misurata e sommata, perché è il numero che dimensiona la finestra di manutenzione di G6. Ogni atto va cronometrato. Nel registro finale distinguere **somma delle chiamate DB** da **tempo di parete**, e dichiarare che ai fini di G6 andranno aggiunti i gesti manuali di Luigi (Storage API, merge, deploy, promozione).

## Atto 1 — Preflight contatti, con arresto condizionato

Rieseguire il preflight §8 GH-07-bis sul risultato pulito di GH-12. **Attesi 0 casi manuali e 0 conflitti.**

- Se il risultato è **0/0**: prosegui senza fermarti fino all'Atto 4 compreso.
- Se resta **anche un solo** caso o conflitto: **fermati, consegna il registro, chiudi la sessione e attendi un mandato separato.** Non inventare risoluzioni automatiche e non allargare le regole di matching per farle tornare.

Riportare comunque nel registro le 10 misure del §8, anche quando tutte a zero: servono come controprova che il preflight è stato eseguito e non assunto.

## Atto 2 — Backfill contatti in variante prod-safe

Portare i contatti dentro il modello customer-first con le regole GH-07-bis.

- **Rimuovere la guardia hardcoded sul tenant demo** presente in `20260821055259_gh07_absorb_contacts_customer_first.sql`: per costruzione rende quella migration inapplicabile al prod. La variante va in `supabase/prod-migrations/` con la numerazione coerente alla ricetta.
- **`contacts` non si droppa**: resta per osservazione, come da sequenza expand/contract decisa in GH-07. Il drop sarà un atto separato, a valle di un periodo di esercizio.
- Nessuna nota copiata alla cieca: la ricognizione GH-07 aveva misurato che le note dei contatti sono spesso duplicati esatti delle note del pet. Il registro GH-11 §10 ne contava 30 duplicate esatte e 1 divergente — trattare la divergente secondo le regole, e se non è trattabile è un caso manuale (vedi Atto 1).

Misurare prima e dopo: contatti, customers, pets, lead senza pet, duplicati per telefono normalizzato.

## Atto 3 — Catena residua

Applicare in quest'ordine, ciascuno in variante prod-safe dove serve, misurando e cronometrando:

1. whitelist update pets — `20260818060158`
2. fix qualificazione path policy Storage — `20260818063103`
3. RPC `add_customer_with_pet` — `20260821031654`
4. campi e RPC GH-07-bis residui (se non già assorbiti nell'Atto 2)
5. `appointment_requests` con RLS e le 2 RPC — `20260821090000`
6. hardening — `20260824090000`

**Per il punto 6 il registro GH-10 prescrive un preflight, non un'applicazione cieca**: confrontare su questo temporaneo firme, `prosecdef`, `proconfig`, ACL e dipendenze trigger in `pg_proc`; mantenere il grant `anon` su `get_public_pet_card` solo se il QR pubblico usa quella RPC; mantenere `authenticated` su invito e helper RLS solo se consumer e policy coincidono; creare i due indici FK solo se le FK prod coincidono; verificare `client-photos` e `pet-avatars` come decisioni distinte. Il temporaneo è il gemello di prod: ciò che si misura qui vale per G6.

## Atto 4 — Fase 3, verifica

1. **Suite RLS** adattata al temporaneo, con sonde usa-e-getta proprie, smontate nello stesso ciclo con controprova di zero residui.
2. **Advisor** Security e Performance finali, confrontati con la baseline demo post-GH-10 (Security 6, Performance 113). Le differenze sono informazione su prod, non necessariamente difetti: spiegarle.
3. **App puntata in locale al temporaneo**: build della branch, login staff con un account migrato, dashboard sui dati veri.
4. **Spot-check di 5 clienti reali**: estrarre dal temporaneo cinque schede complete (intestatario, pet, visite, contatto assorbito) e riportarle nel registro in forma leggibile. Il confronto con la vecchia app in produzione **lo fa Luigi**, che è l'unico ad avere accesso al prod: tu prepara il materiale, non tentare di raggiungere la produzione.
5. **Durata totale**: somma delle chiamate DB e tempo di parete, come da sezione «deliverable».

## Chiusura

Registro completo in `docs/consegne/`, committato insieme ai file prod-safe secondo la convenzione. I registri GH-11, GH-12 e GH-13 insieme **sono la ricetta da cui si scrive l'atto G6**: la sezione finale deve elencare in ordine tutti i file della catena, con impronta, così che G6 sia una trascrizione e non una ricostruzione.

**Smontaggio del temporaneo: non eseguire.** Serve finché Luigi non ha fatto lo spot-track di confronto e finché G6 non è andato a buon fine.
