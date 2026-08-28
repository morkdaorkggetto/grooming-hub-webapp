# Consegna GH-24 - Porta app clienti: interruzione motivata

**Esito:** interrotto prima dello spostamento della radice
**Data:** 27 agosto 2026
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Branch:** `feat/customer-app`
**Base Git:** `f936989d3c07258580cb127fd0c67dd702ec6734`
**Commit:** presente commit; hash finale riportato nella risposta di consegna per evitare un riferimento circolare nel file committato.

## Perimetro ricevuto

Eseguito il mandato `GH-24-porta-app-clienti.md` fino alla prima invariante non
soddisfatta. Erano vietate migration, deploy, push e accessi a produzione o al
progetto temporaneo; unico database ammesso il demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`). L'ordine vincolante del mandato imponeva di aprire
prima invito e QR e di spostare `/` verso il gestionale soltanto dopo il giro
cliente completo.

Il progetto demo e stato verificato `ACTIVE_HEALTHY`, PostgreSQL
`17.6.1.084`. Produzione non e stata consultata.

## File della consegna

| File | Stato | Funzione nella consegna |
|---|---|---|
| `docs/incarichi/GH-24-porta-app-clienti.md` | nuovo, acquisito | Mandato ricevuto da Cowork e autorizzato da Luigi; non modificato da Codex. |
| `docs/consegne/GH-24-porta-app-clienti-interruzione.md` | nuovo | Registro della misura, cleanup e soluzione consigliata. |

Durante la ricognizione erano state preparate modifiche a `Redeem.jsx`, un
nuovo `Redeem.css`, gli URL invito/QR e la radice in `App.jsx`. La pagina
temporanea costruiva ed era corretta alle tre larghezze, ma e stata ripristinata
integralmente quando la controprova database ha dimostrato che la prima porta
non poteva completarsi. Il diff applicativo finale rispetto alla base e zero.

`docs/diario-progetto.md` e `scripts/salva.sh` sono modifiche parallele di
Cowork esplicitamente escluse da Luigi: non sono state messe in stage ne
incluse nel commit GH-24.

## Fatto bloccante misurato

La funzione viva `public.accept_customer_invite(text)`:

1. valida autenticazione e token;
2. crea/aggiorna `profiles.role = customer`;
3. adotta o crea il customer;
4. collega il pet;
5. marca l'invito accettato;
6. **non inserisce alcuna riga in `public.tenant_memberships`**.

La tabella `tenant_memberships` espone soltanto due policy `SELECT`
(`tenant_memberships_own_select` e `tenant_memberships_staff_select`): il
frontend non puo correggere la mancanza con un inserimento client. Non esiste
un trigger su `customers`, `profiles` o `customer_invitations` che crei la
membership. Il solo trigger Auth crea il profilo.

Questo rende incompatibili RPC e app nuova:

- `AuthProvider` calcola `currentRole` esclusivamente dalle membership;
- `useRequireCustomer` respinge una sessione senza ruolo `customer`;
- `TenantProvider` non puo leggere il tenant senza membership;
- le RLS customer dipendono dallo stesso accesso tenant.

## Controprova viva

Fixture esclusivamente demo:

- customer `[DEMO GH-24] Nuovo Cliente`, telefono `+390000024001`;
- pet `[DEMO GH-24] Porta Pet`;
- invito `ghi_*` generato dal gesto reale staff;
- auth user usa-e-getta `gh24.fixture@test.example`, privo di membership;
- sonda staff `staff.sonda@test.example` ricreata e poi smontata.

| Passaggio | Esito misurato |
|---|---|
| Login staff e creazione cliente | Gesto reale riuscito; archivio da 7 a 8 clienti. |
| Generazione invito | Gesto reale riuscito; durante la prova il link prodotto puntava a `/u/redeem/ghi_*`. |
| Pagina invito temporanea | 1440, 390 e 320 px: nessun overflow, overlay o controllo sotto 44 px; zero stili inline e zero colori letterali nel sorgente. |
| Signup dal browser | Il demo risponde `Signups not allowed for this instance`. Nessun auth user creato da quel tentativo. |
| Accesso con auth fixture | Login riuscito dal form invito. |
| RPC `accept_customer_invite` | Riuscita: invito accettato, customer adottato, pet collegato. |
| Membership dopo RPC | `0` righe per il nuovo utente. |
| Atterraggio | Il reload necessario a ricalcolare il contesto finisce su `/u/login?redirect=%2Fu%2Fhome`, non sulla home cliente. |
| Token inesistente/scaduto | La pagina temporanea mostrava uno stato informativo non punitivo. |
| Token consumato | L'RPC restituisce lo stesso errore di token non valido/scaduto; senza membership non e possibile riconoscere il caso come account gia collegato. |

La prova dimostra che il difetto non e nel refresh del provider: anche dopo un
reload completo il dato autorizzativo necessario non esiste.

## Ordine vincolante rispettato

La prima parte non si e completata. Di conseguenza:

- il redirect `/` e rimasto verso `/u/login`;
- gli URL prodotti dagli inviti sono rimasti verso `/portal/invite/:token`;
- i percorsi QR sono rimasti quelli precedenti;
- `CustomerPortal.jsx`, `CustomerLogin.jsx`, `CustomerInvite.jsx` e tutte le
  route legacy sono invariati.

Nessun comportamento parziale e stato lasciato nel codice.

## Secondo prerequisito Auth

Sul demo le registrazioni email/password pubbliche sono disabilitate. Il ramo
`Crea account` del vecchio `CustomerInvite.jsx` e della pagina nuova preparata
riceve `Signups not allowed for this instance`. La controprova completa ha
quindi usato un auth user usa-e-getta creato come atto dati controllato.

Questo non richiede una migration, ma prima della ripresa serve una decisione
esplicita sulla configurazione Auth del demo e poi della produzione. Abilitare
il signup consente account senza accesso tenant quando il token e invalido;
non espone dati grazie a membership e RLS, ma puo creare auth user orfani. Una
soluzione piu controllata richiede un invito Auth server-side e quindi un
backend privilegiato dedicato.

## Soluzione consigliata a Cowork

### Modifica minima raccomandata

Autorizzare **una migration idempotente** che riscriva la funzione esistente
`accept_customer_invite(text)`, senza crearne una seconda, conservando:

- firma e JSON di ritorno;
- `SECURITY DEFINER`;
- `search_path = pg_catalog, public, auth`;
- ACL solo `authenticated, service_role`;
- logica adottiva e atomicita attuali.

Dopo la validazione dell'account e prima di marcare l'invito, la funzione deve
inserire atomicamente:

```sql
insert into public.tenant_memberships (tenant_id, user_id, role)
values (v_invitation.tenant_id, v_user_id, 'customer')
on conflict (tenant_id, user_id, role) do nothing;
```

Nella stessa riscrittura va chiuso il controllo ruolo: oggi la RPC guarda solo
`profiles.role = 'operator'`, mentre il progetto ha gia misurato che
`profiles.role` e `tenant_memberships.role` possono divergere. La guardia deve
rifiutare anche chi possiede una membership `owner` o `staff`, senza convertire
silenziosamente il profilo.

### Decisione Auth raccomandata

Per il lancio piu vicino, abilitare signup email/password con conferma email e
redirect autorizzati verso `/u/redeem/:token`, accettando che un token invalido
possa lasciare un auth user senza membership e quindi senza accesso ai dati.
Registrare e monitorare questi account orfani. L'alternativa piu rigorosa e un
flusso Auth Admin/Edge Function invite-only, ma ha piu superficie e non e una
correzione minima per G6.

### Controprove del mandato di ripresa

1. signup demo dal link valido;
2. RPC crea esattamente una membership `customer` nel tenant dell'invito;
3. profilo e membership divergenti staff vengono rifiutati senza scritture;
4. reload atterra su `/u/home` e apre la scheda pet;
5. token usato, inesistente/scaduto e utente gia autenticato hanno stati
   distinti e coerenti;
6. QR con customer attivo porta all'app nuova, QR senza area conserva la card
   pubblica e propone l'accesso;
7. solo dopo questi passaggi `/` viene spostata a `/login`;
8. advisor security, suite RLS, tre larghezze, build e cleanup completo.

Il rischio residuo principale e la creazione di auth user senza membership se
la conferma email avviene ma il token non puo essere consumato. Non va risolto
allargando le RLS o concedendo INSERT client su `tenant_memberships`.

## Cleanup e stato finale

Tutte le fixture sono state rimosse nella stessa sessione. Stato finale demo:

- customer totali `7`;
- pet totali `7`;
- inviti `ghi_*` `0`;
- auth user GH-24/sonda `0`;
- identities fixture `0`;
- profiles fixture `0`;
- membership fixture `0`;
- customer/pet marker GH-24 `0`.

Nessun account reale e stato modificato. Nessuna password o chiave e stata
scritta nei file o nei commit.

## Verifiche ed eccezioni

- Build temporanea con la pagina pronta: PASS, 145 moduli trasformati.
- Build finale sul codice ripristinato: PASS, 144 moduli trasformati.
- `git diff --check`: PASS.
- Diff applicativo finale: zero.
- `npm run lint`: non eseguibile nell'ambiente corrente perche il comando
  configurato richiede `eslint`, non installato (`eslint: command not found`).
  Le dipendenze non sono state modificate fuori mandato.
- QR e radice non provati dopo uno spostamento perche lo spostamento era
  espressamente vietato dopo il fallimento della prima parte.
- Nessuna migration, deploy, push o accesso a produzione/progetto temporaneo.

## Percorsi da nominare per giri futuri

Oltre al primo accesso emerso in GH-24, restano da percorrere da capo:

- conferma email e ritorno effettivo al token dopo il signup;
- recupero password customer dall'email fino alla nuova sessione;
- QR da browser senza sessione, login e ritorno alla destinazione riservata;
- consegna reale del link al cliente: oggi il gestionale lo genera e lo copia,
  ma non invia automaticamente email o messaggi.
