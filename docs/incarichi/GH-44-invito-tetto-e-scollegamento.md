# Incarico GH-44 — Un tetto alle richieste, e un modo per tornare indietro

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Da chiudere prima del primo invito a un cliente reale.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Da dove nasce

Domanda di Luigi, 29 agosto: *«possiedo il link di invito e inizio a registrare cani fantasma per danneggiarti — come mi difendo?»*

**La risposta misurata è che non si può.** Le policy in produzione danno al cliente, su `pets`, soltanto `SELECT` e `UPDATE`: **nessuna `INSERT`, nessuna `DELETE`**. Lo stesso vale per `customers` e per `visits`, dove il cliente può solo leggere. La decisione è di aprile ed è scritta nel file delle policy: *«nessuna policy INSERT customer-side: no self-service pet in Fase 1»*.

**L'unica cosa che un cliente può creare è una richiesta di appuntamento.** È lì che si sposta il problema, ed è l'unica superficie da difendere.

Perimetro del danno possibile, misurato: **una sola scheda cliente**, perché l'invito è nominale, monouso, legato a un numero di telefono, e rifiuta chi prova a rivendicare una scheda già collegata a un altro utente.

## 1 · Un tetto alle richieste aperte

**Il fatto**: un cliente può creare richieste di appuntamento senza alcun limite. Restano in attesa — non entrano nel calendario, non occupano postazioni, non toccano dati — ma **riempiono la coda che il salone deve svuotare a mano**. La guardia sulle postazioni di `GH-37` non le tocca, perché agisce solo sugli appuntamenti approvati.

**Invarianti**:

- **Esiste un tetto al numero di richieste contemporaneamente aperte per cliente**, e superarlo viene **rifiutato**. Questo è un caso in cui il rifiuto è giusto: non è un'informazione, è una difesa.
- **Il tetto vive in `tenants.settings`**, accanto a capienza, orari, soglie e recapito — mai nel codice. Valore iniziale **3**.
- **Il controllo è nel database**, non nell'interfaccia. Chi volesse abusarne non passerebbe dall'app.
- **Contano solo le richieste ancora aperte.** Una richiesta confermata, rifiutata o annullata non occupa il tetto: il conto si libera da solo, e un cliente onesto non lo incontra mai.
- **Il tetto è per cliente, non per cane.** Chi ha tre cani non ha diritto a nove richieste aperte.
- **Il messaggio spiega, non accusa.** Chi lo legge è quasi sempre una persona confusa, non un malintenzionato: deve capire che ha già delle richieste in sospeso e che il salone risponderà.

## 2 · Il gesto di scollegamento

**Il fatto**: quando un account viene collegato a una scheda cliente, **non esiste alcun modo di tornare indietro**. Nessuna schermata lo fa. Vale per qualunque errore, non solo per un abuso: la persona sbagliata che riscatta un collegamento inoltrato, un cliente che perde l'accesso alla propria email, un numero riassegnato a un'altra persona.

Ed è già previsto altrove che serva: la funzione di riscatto, quando trova un telefono già collegato a un altro utente, si ferma e dice **«contatta il salone per riassegnare l'anagrafica»** — cioè rimanda a un gesto che oggi non esiste.

**Invarianti**:

- **Dalla scheda cliente lo staff può scollegare l'account** che vi è associato. Dopo il gesto quella persona non vede più nulla di quella scheda.
- **Scollegare non cancella niente**: né la scheda, né i cani, né lo storico, né l'account della persona. Toglie solo il legame.
- **Dopo lo scollegamento si può generare un invito nuovo**, e il riscatto funziona come la prima volta.
- **Il gesto chiede conferma** e dice cosa comporta, in una riga. Non è distruttivo ma è raro: chi lo usa deve sapere perché.
- **Solo lo staff può farlo.** Un cliente non può scollegare se stesso né altri.
- **Resta traccia**: nel registro va dichiarato dove e come, perché il giorno che qualcuno chiede «chi ha staccato questo account» ci deve essere una risposta.

## Cosa questo mandato NON fa

**Non introduce la registrazione autonoma dei clienti.** Oggi l'unico modo di generare un invito parte da un cane già in archivio, dalla scheda cliente. La strada del cliente nuovo — e la distinzione fra chi il salone conosce già e chi arriva da una vetrina — è una decisione di prodotto ancora aperta, non un mandato.

**Non tocca le policy su `pets`, `customers` e `visits`.** Sono la ragione per cui l'attacco descritto è impossibile, e vanno lasciate esattamente dove sono.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- un cliente con **tre richieste aperte**: la quarta viene **rifiutata dal database**, non dall'interfaccia — provata chiamando direttamente, non solo dall'app;
- **chiudendone una** (confermata o rifiutata), la successiva passa;
- un cliente con **tre cani** non ottiene nove richieste: il tetto è suo, non dei suoi cani;
- il tetto **cambiato nelle impostazioni** cambia il comportamento **senza ricostruire l'app**;
- **scollegamento**: prima il cliente vede i suoi cani, dopo non vede nulla; scheda, cani, visite e account **tutti ancora presenti**, contati prima e dopo;
- dopo lo scollegamento, **un invito nuovo funziona** e il riscatto ricollega correttamente;
- un cliente **non riesce** a scollegare né sé stesso né altri;
- build verde; suite RLS estesa con i casi nuovi.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, una cosa da fare con gli occhi: **scollegare un account di prova dalla scheda e rileggerla**. Deve sembrare una scheda normale che non è mai stata collegata, non una scheda rotta.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy. **Le impostazioni in produzione le applica Luigi, o Cowork su sua autorizzazione, dopo il rilascio.**
