# Incarico GH-02-quater — Fix deadlock AuthProvider su hard reload

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Nuovo mandato** che adotta la soluzione consigliata nella consegna `docs/consegne/GH-02-ter-fix-storage-e-chiusura.md` (§ Eccezione misurata). Perimetro: branch `feat/customer-app` (base `3254c95`), **un solo file autorizzato: `src/shared/auth/AuthProvider.jsx`**. Demo `grooming-hub-demo` solo per le controprove. Prod intoccabile. Niente migration.

## Perché

Con sessione esistente, l'hard reload di qualunque rotta customer resta nello skeleton: il callback `onAuthStateChange` è `async` e attende `refreshMemberships()` sullo stesso client Supabase — deadlock documentato dalla guida ufficiale Supabase citata nel registro GH-02-ter. Il fix precede il push e il redeploy della preview: non si consegna al salone una preview dove F5 rompe l'app.

## Disegno (dalla proposta Codex, adottata da Luigi)

- Il callback `onAuthStateChange` diventa sincrono e aggiorna soltanto la sessione.
- `refreshMemberships(userId)` si sposta in un `useEffect` separato dipendente dall'id utente, con guard di annullamento (cleanup che ignora risposte arrivate dopo unmount o cambio utente).
- Nessun cambiamento al contratto pubblico del provider: i consumer (`CustomerApp`, `StaffApp`, hook) non si toccano. Se il contratto dovesse cambiare, fermati e consegna interruzione motivata.

## Controprove obbligatorie (dal registro GH-02-ter)

1. Login Mario → apertura Luna → **hard reload**: skeleton scompare, 3 visite visibili.
2. Hard reload su `/u/home` e `/u/promotions`.
3. Logout e nuovo login: nessuna membership o ruolo obsoleti residui.
4. Login operator e login customer: routing di ruolo bidirezionale intatto.

Più: build verde, zero warning nuovi in console.

## Condizioni di consegna

Registro in `docs/consegne/`: base dichiarata, diff limitato al file autorizzato, hash commit, esiti misurati delle 4 controprove, eccezioni e fuori-istruzione. Commit atomico `fix:`. Niente push — al termine il push unico dei 5 commit e il redeploy preview sono gesti di Luigi che chiudono G2.
