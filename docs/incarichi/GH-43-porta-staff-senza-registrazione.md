# Incarico GH-43 — La porta dello staff non è una porta d'ingresso

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026

> **Forma breve** (regola 4 del canone): nessuna migrazione, nessun dato in gioco. Si toglie una cosa e si smette di dire una bugia.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto, seguito passo per passo

Sulla pagina di accesso dello staff c'è **«Non hai un account? Registrati»**. Premendolo, misurato il 29/8:

1. `supabase.auth.signUp` crea l'utente;
2. il trigger `on_auth_user_created` crea il profilo con ruolo **`customer`** — il commento nella funzione lo dichiara: *«default post-signup è customer; lo staff viene creato via invite/seed»*;
3. l'app chiama `ensureOperatorProfile`, che **non crea nulla**: legge il profilo, lo trova `customer` e solleva un errore, **che viene ingoiato** e finisce solo nella console;
4. a schermo compare **«Registrazione completata! Controlla la tua email per confermare»**;
5. ma la conferma email è **disattivata** in produzione — spenta di proposito il 28/8 perché serve al flusso degli inviti. **Quella mail non arriva mai.**

**Non c'è esposizione di dati**: l'accesso passa dalle membership, e una registrazione spontanea non ne crea nessuna. Chi entra vede il vuoto.

**Ma restano tre cose sbagliate:** un messaggio che promette una mail inesistente; una porta di registrazione sulla pagina dello **staff**, dove nessuno deve potersi iscrivere da sé; e un utente orfano in `auth.users` per ogni curioso, che resta lì per sempre e non lo conta nessuno.

## Invarianti

**Dalla pagina di accesso dello staff non si crea un account.** Gli operatori nascono per invito o per seed, come il database stesso dichiara. Il percorso di registrazione va **rimosso**, non nascosto: se resta raggiungibile per altra via, l'invariante non è soddisfatta.

**Nessun messaggio promette qualcosa che non accade.** In particolare: nessuna schermata deve dire di controllare la posta finché non esiste un invio che funziona davvero.

**Nessun errore viene ingoiato in silenzio** su questa superficie. Se un gesto fallisce, chi lo ha fatto deve saperlo. Un `catch` che scrive solo in console è, per chi guarda lo schermo, un successo.

**Le registrazioni restano abilitate a livello di progetto.** Non toccare le impostazioni Auth: servono ai clienti invitati per crearsi l'accesso, ed è lo stesso progetto Supabase. **La correzione è togliere il pulsante da questa pagina, non chiudere la porta a tutti.**

**Chi arriva qui senza account deve capire cosa fare.** Non un vicolo cieco: una riga che dica che l'accesso allo staff lo apre il salone. Le parole sono tue, il senso è questo.

## Cosa misurare senza correggere — «Password dimenticata?»

Sulla stessa pagina c'è **«Password dimenticata?»**, e quel percorso dipende dall'invio di email, che è **la stessa cosa che oggi non funziona**.

**Non sistemarlo in questo mandato.** Misura e riporta soltanto: cosa fa oggi quel gesto, che messaggio mostra, e se l'email parte davvero — cioè se esiste un servizio di invio configurato o se ci si appoggia a quello predefinito di Supabase, che ha limiti severi e non è pensato per la produzione.

Serve per decidere: se anche quella è una porta che promette e non mantiene, va chiusa o riparata, ma con un mandato che sappia cosa sta riparando. **È la chiave del salone: se il giorno che serve non funziona, Davide resta fuori dalla propria app.**

## Controprove

Dichiara nel registro, misurate sul demo:

- dalla pagina di accesso staff **non esiste più alcun percorso** che crei un account — cercato e non trovato;
- l'accesso di un operatore esistente funziona esattamente come prima;
- nessun messaggio residuo parla di email di conferma;
- un errore di accesso **compare a schermo**, non solo in console;
- il conteggio degli utenti sul demo è **invariato** prima e dopo le prove;
- l'app clienti e il percorso di invito **non sono toccati**: un invito continua a creare l'accesso del cliente. È la prova che non abbiamo chiuso la porta sbagliata;
- build verde; suite RLS invariata.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Nota

Il flusso con cui un **cliente** arriva a registrarsi è materia del mandato successivo, e va definito prima degli inviti. Questo mandato tocca **soltanto** la porta dello staff.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
