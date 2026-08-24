# Incarico GH-11 — Prova generale della migrazione prod su dump fresco

**Per:** Codex + Cowork + Luigi · **Da:** Luigi · **Data:** 21 agosto 2026
**Ordine:** dopo GH-10, prima dell'atto G6. È la prova che rende pensabile la finestra del 27-28/8.

## Prerequisiti (gesti di Luigi)

1. I tre dump del 21/8 sono già sulla Scrivania (`grooming-prod-{dump,data,auth}-20260821.sql`). Se la prova slitta oltre il 25/8 e il salone risulta aver scritto (improbabile: chiuso), rifare il dump — stessa procedura.
2. Creare il **progetto temporaneo** `grooming-prova-generale` nell'org free `morkdaorkggetto's Org` (lo slot c'è: liberato dal transfer). Regione indifferente, password DB nel password manager.
3. Fornire a Codex l'accesso al progetto temporaneo (stesso meccanismo del demo). Il temporaneo è **usa-e-getta dichiarato**: si smonta a prova conclusa.

## Fase 0 — Preflight contacts (Cowork, sul prod, sola lettura)

Le 10 misure della checklist §8 di GH-07-bis sulle 301 righe reali: cardinalità e impronte, telefoni nulli/malformati/duplicati post-normalizzazione, distribuzione match per priorità, conflitti, lead puri, valori fuori dominio, note duplicate vs divergenti, conteggi attesi. Esito: report nel registro + elenco dei casi da risolvere a mano PRIMA della finestra (attesi ~13). Le risoluzioni manuali le decide Luigi caso per caso.

## Fase 1 — Ricostruzione (Codex, sul temporaneo)

Restore dei tre dump nel progetto temporaneo (schema → dati → auth; metodo a discrezione, dichiarato). Controprova: cardinalità = prod (296 clients, 464 visits, 301 contacts, 6 utenti — rimisurate al restore), impronte ripetibili.

## Fase 2 — La catena completa (Codex, sul temporaneo)

Applicare nell'ordine l'intera catena che il prod riceverà in G6:
1. le migration dello schema multi-tenant nella **variante prod-safe** (backfill `clients`→`customers`+`pets` con `legacy_client_id`, seed memberships da `profiles.role`, riferimento: sezione prod di `migration-plan.md`);
2. le migration di Fase 1 (whitelist, storage fix, RPC, campi GH-07-bis nella **variante senza guardia demo**, hardening GH-10 variante prod);
3. il backfill contacts con le regole GH-07-bis, alimentato dagli esiti del preflight (i casi manuali risolti da Luigi entrano come atti espliciti).

Ogni atto: applicato, misurato, annotato. Un fallimento NON si aggira: si corregge la variante prod e si può ripartire da capo (il temporaneo si ricrea dal dump — è il suo scopo).

## Fase 3 — Verifica del risultato

1. Conteggi finali attesi e spiegati: clients storici → customers+pets (con multi-pet), contacts assorbiti, clienti-test di Luigi e account `sofaj` gestiti secondo decisione (rimozione pre o post migrazione — decisione a Luigi nel registro di Fase 0).
2. Suite RLS adattata eseguita sul temporaneo (con sonde usa-e-getta proprie, smontate).
3. L'app (build feat) puntata temporaneamente al progetto temporaneo in locale: login staff con account migrato di prova, dashboard con i dati veri migrati, spot-check di 5 clienti reali confrontati con la vecchia app.
4. **Il numero che conta**: durata totale della catena, misurata — dimensiona la finestra del 27-28.

## Chiusura

Registro completo (atti, misure, durate, correzioni fatte alle varianti prod, casi manuali residui = 0) → **l'atto G6 si scrive da questo registro**. Smontaggio del progetto temporaneo dichiarato. Niente push senza ok.
