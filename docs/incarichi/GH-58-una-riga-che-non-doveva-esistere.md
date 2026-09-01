# Incarico GH-58 — Una riga che non doveva esistere

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu**: la scrivi, la provi sul demo, e la applica Cowork in produzione con autorizzazione esplicita di Luigi.
**Superficie:** il dettaglio appuntamento in `/calendar`. File attesi: `pages/Calendar.jsx`, `apps/staff/lib/database.js`, una migrazione nuova. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy. **La produzione non si tocca.**

## Da dove nasce

Oggi il salone ha un gesto solo per far sparire un appuntamento: **«Annulla appuntamento»**. Ma annullare e sbagliare non sono la stessa cosa.

**Il cliente ha disdetto** è un fatto, ed è successo: vale la pena conservarlo, perché il giorno in cui vorrete sapere quante disdette avete, quel numero deve essere vero.

**La riga non doveva esistere** è un errore di battitura. Non è storia, è sporcizia.

> **Registrare un errore di inserimento come disdetta inquina le disdette con gli errori di inserimento, e da quel momento nessuno dei due numeri dice più niente.**

Serve un secondo gesto: **«Elimina»**. E siccome è irreversibile, tutto il mandato è fatto di ciò che **non** deve poter eliminare.

## Cosa si può eliminare, e cosa no

Misurato in produzione il 1/9 — **35 appuntamenti in tutto**:

| stato | quanti | con visita collegata |
|---|---:|---:|
| `scheduled` | 18 | 0 |
| `completed` | **13** | **13** |
| `cancelled` | 3 | 0 |
| `no_show` | 1 | 0 |

E due tabelle puntano agli appuntamenti — `visits.appointment_id` e `appointment_requests.appointment_id` — **entrambe con `ON DELETE SET NULL`**. Il database quindi **non si oppone** a nessuna eliminazione: si limita a slegare in silenzio ciò che era legato. Le guardie devono stare tutte nella funzione.

### Le tre porte chiuse

**`completed` non si elimina.** Tutti e tredici i completati hanno una visita collegata. Eliminarli **slegherebbe una lavorazione vera dal suo appuntamento**, cancellando l'unica prova che quel lavoro era stato prenotato — e sono **13 collegamenti su 470 visite**, l'intero patrimonio di quel legame.

**`no_show` non si elimina.** È la trappola vera del mandato, e va capita prima di scrivere codice. `GH-52` muove il punteggio **sulla transizione, non sulla riga**: sparita la riga, **il punto tolto al cane resta tolto per sempre**, e nessuno saprà più perché quel barboncino è a −2.

> **La chiusura non è compensare: è vietare.** Un'assenza si disfa prima con **«Annulla assenza»** — che il punto lo ridà già, per la strada che esiste — e solo dopo si elimina. Così **l'aritmetica del punteggio resta tutta dentro `GH-52`** e non nasce una seconda strada per toccarla. Se ti trovi a scrivere `no_show_score` in questa migrazione, **fermati e dichiaralo**: vuol dire che stai aprendo quella seconda strada.

**Ciò che non ha creato il salone non si elimina.** Se l'appuntamento nasce da una richiesta del cliente (`appointment_source` diverso da `operator`, oppure con una riga in `appointment_requests` che lo indica), eliminarlo lo farebbe sparire **anche dalla sua area, senza che nessuno gliel'abbia detto**. Quello si **annulla**. Oggi tutti e 35 sono `operator` e le richieste sono **zero**, quindi il caso non si presenta: **la regola va scritta adesso, prima che i clienti comincino a prenotare**, non dopo.

**Resta eliminabile**: `scheduled` e `cancelled`, creati dal salone, senza visita collegata. Oggi sono **21 su 35**.

## La conferma nomina la cosa

Un «sei sicuro?» generico non lo legge nessuno. La conferma dice **quale cane, che giorno e a che ora**:

> **Elimini l'appuntamento di Nina di martedì 1 settembre alle 15:30?**
> Sparisce del tutto. Se invece il cliente ha disdetto, usa «Annulla appuntamento»: resta come fatto.

**La seconda riga è parte del gesto, non decorazione**: è lì che si intercetta chi sta per eliminare una disdetta vera.

E i due gesti **non stanno vicini**. «Annulla appuntamento» resta dov'è; «Elimina» è distinto e visivamente più quieto — **si usa raramente, e chi lo cerca lo trova**.

## La migrazione

Una funzione `SECURITY DEFINER`, con la disciplina di tutte le altre della catena: `search_path` fissato, `auth.uid()` verificato, **membership staff sul tenant dell'appuntamento** verificata, `REVOKE` da `PUBLIC` e `anon`, `EXECUTE` ai soli `authenticated`, oggetti qualificati.

**Rifiuta con un errore parlante e distinto per ciascun caso** — completato, assenza, non creato dal salone, visita collegata — perché l'interfaccia deve poter dire *perché* invece di «non si può».

**Non tocca `pets`. Non tocca `visits`. Non tocca `appointment_requests`.** Elimina la riga dell'appuntamento, o non fa niente.

## Invarianti

**La migrazione non la applichi.** Provala sul demo, lasciala nel repository, dichiarala nel registro. **Nessuna scrittura in produzione, nessuna lettura della produzione.**

**Nessun `DELETE` dal browser.** L'eliminazione passa solo dalla funzione: un `delete()` diretto scavalcherebbe ogni guardia scritta sopra.

**`set_staff_appointment_status` non si modifica.** Il punteggio resta affare suo.

**Nessun colore nuovo, nessuna rotta nuova**, e restano intatti gli invarianti di `GH-54` → `GH-57`: la grana è la mezza giornata, le lavorazioni senza ora non entrano in una fascia, il margine non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px, e il lessico ammesso è **solo** `lavorati sul momento`, `chi arriva`, `senza ora fissata`.

**Il peso visivo segue l'agibilità, non la categoria**, e **l'arretramento appartiene al contenitore, non alle lettere**.

## Controprove

Dichiara nel registro, misurate **sul demo** con fixture usa-e-getta, rimosse a fine sessione:

- **si elimina** un `scheduled` creato dal salone: la riga sparisce, e **il piede degli annullati e i conteggi si aggiornano** senza ricaricare la pagina;
- **si elimina** un `cancelled`: idem;
- **`completed` rifiutato**, con errore proprio; e **la visita collegata è ancora legata**: `appointment_id` **non** è diventato `NULL`;
- **`no_show` rifiutato**, con errore proprio; **il punteggio del cane non si muove di un punto**, misurato prima e dopo;
- **percorso completo dell'assenza**: «Annulla assenza» → il punto torna → ora si elimina → **il punteggio finale è identico a quello di partenza**. È la prova che giustifica il divieto: falla e riportala;
- **appuntamento non creato dal salone rifiutato**, con errore proprio;
- **appuntamento di un altro tenant**: `42501`, zero scritture;
- **cliente autenticato del portale** che chiama la funzione: `42501`, zero scritture;
- `anon` **non può eseguirla**; `authenticated` sì;
- la conferma **nomina cane, giorno e ora** ed è quella vera dell'elemento, non un segnaposto;
- **nessun `DELETE` diretto** su `appointments` resta nel codice del browser: dimostralo con una ricerca;
- **suite RLS rieseguita**: questo mandato porta una funzione;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

Sul computer:

1. **apri un appuntamento passato e completato**: il gesto di eliminare è assente o spiegato? Un pulsante che c'è e rifiuta sempre è peggio di un pulsante che non c'è;
2. **prova a eliminare l'assenza di Ciccio**: il messaggio ti dice *cosa fare prima*, o solo che non si può?
3. **elimina un appuntamento vero**: la conferma ti ha dato modo di accorgerti che stavi eliminando quello sbagliato?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-58-una-riga-che-non-doveva-esistere-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
