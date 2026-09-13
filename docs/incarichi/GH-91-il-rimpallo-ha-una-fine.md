# Incarico GH-91 — Il rimpallo ha una fine

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 13 settembre 2026
**Superficie**: `apps/customer/`, `apps/staff/pages/Dashboard.jsx`, `apps/staff/lib/database.js`.
**Trovato da Luigi usando GH-90 sulla produzione**, mezz'ora dopo il rilascio.

**Perimetro**: la migrazione `gh91_decline_carries_a_date` è **già applicata in produzione da Cowork**; al demo la applica Luigi prima che tu cominci. Database ammesso **solo il demo**; nessuna migrazione, nessuna colonna nuova; nessun push, merge o deploy.

## Da dove nasce

Luigi ha proposto tre orari a una richiesta e ha guardato il risultato dai due lati. Due difetti, opposti fra loro.

**Il rimpallo non finisce.** Nell'app c'è **«Nessuna di queste mi va bene»**, e quel no **non porta nessuna informazione**: il salone riceve un rifiuto secco e deve indovinare di nuovo. Parole di Luigi: *«la palla ripassa al salone in un loop che rischia di diventare faticoso e ingestibile»*.

**E la dashboard è diventata muta.** `GH-90` toglieva il riquadro terracotta quando la palla è della persona — giusto — ma ha lasciato come unica traccia una riga piccola in fondo a una scheda: *«0 da gestire · 1 in attesa della persona»*. Parole di Luigi: *«sono costretto ad andare in richieste clienti per sapere che c'è una risposta attesa»*.

> **Il mandato precedente ha curato il rumore e ha prodotto il silenzio.** Un'attesa non è un allarme, ma non è nemmeno niente: è una cosa che il salone deve poter vedere senza andarla a cercare.

## Tre pezzi

### 1. Il rifiuto porta una data

Chi tocca **«nessuna di queste mi va bene»** non manda più solo un no: gli si chiede **quando gli andrebbe bene invece**.

Il selettore è **quello che già usa per prenotare** — `DesiredDateStrip` e le fasce in `Book.jsx`, con le chiusure già disattivate. **Non costruirne un altro.**

La funzione accetta già i due argomenti nuovi:

```
respond_appointment_request_slot(p_request_id, p_response, p_date, p_time,
                                 p_time_preference, p_new_desired_date, p_new_time_preference)
```

Con `declined` e una data nuova, il database **sostituisce** `desired_date` e `time_preference` della richiesta, dopo aver controllato che sia futura e non in una chiusura. **Rifiutare senza indicare una data resta possibile** — non si obbliga nessuno — ma l'app deve **chiederlo**, non nasconderlo.

### 2. Un rifiuto solo, poi ci si parla

`alternatives_round` conta quante volte il salone ha proposto: la funzione lo incrementa da sé.

**Si può rifiutare una volta sola.** Il pulsante si offre **al primo giro di proposte**; dal secondo in poi **non c'è più**. Al suo posto **«Meglio sentirci»**, con il collegamento WhatsApp del salone **che esiste già** in `Home.jsx`.

Le scelte restano sempre: chi vuole accettare uno degli orari lo può fare a qualunque giro. **Sparisce solo la possibilità di dire no una seconda volta.**

Il perché, deciso da Luigi il 13/9: **il secondo giro nasce già da un'indicazione della persona** — la data nuova che ha dato rifiutando. Se nemmeno quella porta a un orario buono, il problema non si risolve con un terzo scambio di messaggi: si risolve parlandosi.

**Il numero è uno, e sta in un posto solo e dichiarato**, perché può cambiare: se Davide dice due, si cambia una riga.

> **Da sapere**: la richiesta già in attesa in produzione ha `alternatives_round = 0` pur avendo alternative proposte — la colonna è nata dopo. Riparte da zero e avrà un rifiuto a disposizione. **È accettato, non è un difetto da correggere.**

### 3. La dashboard mostra l'attesa

Un pannello suo, **quieto**: non il terracotta, che resta riservato a ciò che tocca al salone. Dice **a chi** hai proposto, **cosa** e **da quanto**:

> *Rumba · proposto il 13/09 alle 06:28 · 15/09 11:00 · 16/09 10:30 · 18/09 09:00*

**Dopo 48 ore senza risposta** cambia tono e diventa una cosa da fare: nessuno ha risposto, conviene telefonare. **Le parole le scegli tu e le dichiari.**

**Ma non entra nel pallino e non suona.** La palla resta della persona: `GH-90` ha appena stabilito che il pallino conta solo ciò che tocca al salone, e quella regola **non si scavalca** per un caso di sollecito. Se ti sembra sbagliato, **fermati e dichiaralo** invece di deciderlo tu.

**Anche 48 sta in un posto solo e dichiarato**, come il due.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Un solo criterio di conteggio e una sola classificazione**: `getAppointmentRequestStaffAction` e `summarizePendingAppointmentRequests` di `GH-90`. Se ti trovi a classificare altrove, ti sei perso.

**Il pallino e il suono non cambiano**: né cosa contano, né intervallo, né memoria, né silenzio iniziale.

**Il salone continua a prenotare.** Niente nasce da solo.

**`currentAlternativeResponse` non si modifica**: impronta prima e dopo.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-90`, **compresa l'eccezione dichiarata da `GH-87`** sul link `Grooming Hub`.

**La lingua è quella di `GH-83`**: è il salone che parla al proprietario, e nessuno chiama la persona «cliente».

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **tutti i testi nuovi, per esteso**, uno per uno, dei due lati;
- **rifiuto con data nuova**: le colonne rilette dal demo — `desired_date` e `time_preference` **cambiate**, `customer_response = 'declined'`, stato ancora `pending`;
- **rifiuto senza data**: `desired_date` **invariata**. Riporta il confronto;
- **una data nuova in un giorno chiuso**: la funzione rifiuta, e **il testo non tecnico** che vede la persona;
- **il contatore**: `alternatives_round` dopo la prima e dopo la seconda proposta. Riporta i due valori;
- **al primo giro il rifiuto c'è; al secondo non c'è più**: prove a schermo di entrambi, e la prova che **le scelte restano toccabili in tutti e due**;
- **«Meglio sentirci»**: il testo, e che il collegamento porti al numero del salone letto dalle impostazioni;
- **il numero uno e il numero 48**: dove stanno. Un posto solo, riportato con il percorso del file;
- **il pannello dell'attesa**: i testi prima e dopo le 48 ore, e i due casi a schermo;
- **il pallino non cambia** in nessuno dei due casi: misuralo. **Zero toni**;
- **il salone vede la data nuova**: dove compare in `/requests`, e che si distingua da quella iniziale;
- **`currentAlternativeResponse`**: impronta identica;
- **le altre pagine staff e le altre pagine customer**: impronte, come in `GH-90`;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px. **Il selettore della data nuova è il punto da guardare**;
- build verde. **Suite RLS: da rieseguire, e le sue scritture temporanee sul demo sono autorizzate** — cambia la firma del varco di scrittura del cliente. Ultima misura viva: `GH-89`, **60 PASS del 13/9**.

## Passo finale — lo guarda Luigi (regola 5)

Gestionale su un dispositivo, telefono sull'altro:

1. **rifiuta tre orari indicando una data nuova**: il salone la riceve, e si capisce che è cambiata?
2. **fatti riproporre**: il pulsante del rifiuto è sparito? Cosa trovi al suo posto?
3. **guarda la dashboard mentre aspetti**: sai a che punto sei **senza aprire le richieste**?
4. **e la domanda che conta**: dopo il secondo giro, la conversazione è finita in un posto sensato o ti sembra di essere stato buttato fuori?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-91-il-rimpallo-ha-una-fine-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
