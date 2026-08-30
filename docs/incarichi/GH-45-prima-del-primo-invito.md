# Incarico GH-45 — Le due cose da chiudere prima del primo invito

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026

> **Nessuna delle due è urgente oggi. Entrambe diventano vere il giorno del primo invito a un cliente reale**, e da quel giorno non si possono più rimandare.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

---

## 1 · Le foto stanno nel secchio sbagliato

**Misurato sulla produzione il 29/8:**

| | |
|---|---:|
| oggetti in `client-photos` (secchio legacy) | **51** |
| oggetti in `pet-avatars` (secchio nuovo) | **0** |
| foto dei cani che risiedono in `client-photos` | **42 su 42** |

Il secchio `pet-avatars`, creato durante G6, ha permessi scritti bene: il cliente può inserire, modificare e cancellare **solo** gli oggetti dei propri cani, con il percorso `{tenant_id}/{pet_id}/…` verificato contro il database; lo staff opera sul proprio salone; la lettura è pubblica perché serve alla card. **Ed è vuoto.**

Il secchio `client-photos`, dove risiedono tutte le foto vere, porta quattro policy con nomi generati automaticamente — `client_photos_auth_all 1jb8i4j_0/1/2/3` — che concedono **`INSERT`, `UPDATE`, `SELECT` e `DELETE` a qualunque utente autenticato**, senza controllo di proprietà e senza controllo di salone.

**Conseguenza**: dal momento in cui il primo cliente riscatta un invito, quella persona può **cancellare tutte e 42 le foto dei cani del salone**, o sostituirne una qualsiasi con un'immagine a scelta — che comparirebbe sulla scheda staff **e sulla card pubblica** di un cane qualunque.

**Oggi non è sfruttabile**: gli account esistenti sono tre, tutti del salone. È il primo invito ad accendere il problema.

**Perché è sopravvissuto all'irrigidimento di agosto**: `GH-10` e l'atto di hardening guardavano funzioni, tabelle e policy dello schema `public`. **I permessi dei secchi non erano in perimetro.** Vale la pena scriverlo, perché è il tipo di angolo che si ripete.

### Invarianti

- **Un cliente non può toccare oggetti che non appartengono ai propri cani.** Vale in entrambi i secchi, e va provato con una sessione cliente reale — non ragionando sulle policy.
- **Un utente autenticato qualunque non può cancellare né sostituire alcunché** in `client-photos`. Le quattro policy permissive vanno rimosse.
- **La lettura pubblica resta**, in entrambi i secchi: le foto compaiono sulla card pubblica, che è pubblica per progetto. Toglierla romperebbe la card.
- **Nessuna foto esistente smette di vedersi.** Le 42 attuali devono continuare a comparire nella scheda staff, nella card pubblica e nell'app clienti. **Contate prima e dopo.**
- **Nessun file viene spostato in questo mandato.** Se ritieni che le foto debbano migrare da un secchio all'altro, **dichiaralo come proposta e non farlo**: spostare 51 oggetti e riscrivere 42 riferimenti è un mandato suo, con il suo paracadute.
- Lo staff continua a caricare e sostituire le foto **come adesso**, senza passaggi in più.

> **Attenzione ai due oggetti orfani** già noti — percorsi nel §4 di `GH-12`, in attesa di rimozione manuale da parte di Luigi. Non toccarli e non contarli come anomalia: sono previsti.

---

## 2 · L'invito dura tre giorni, non trenta

**Il fatto**: `createCustomerPortalInvite` fissa la scadenza a **30 giorni**, scritti nel codice.

**Decisione di Luigi, 29/8: tre giorni.** La ragione è il canale: il collegamento viaggia in una chat WhatsApp, dove **sopravvive agli inoltri, agli screenshot e ai cambi di telefono**. Un mese è una finestra che nessuno sorveglia; tre giorni sono il tempo di leggere un messaggio.

### Invarianti

- **La durata vive in `tenants.settings`**, accanto a capienza, orari, soglie fedeltà e recapito. **Mai nel codice.** Valore iniziale: **3 giorni**.
- **Cambiarla non richiede una build**, e vale per gli inviti generati **da quel momento in poi**: quelli già emessi conservano la propria scadenza.
- **Il valore è un numero intero positivo di giorni**, rifiutato dal database se non lo è — come già accade per la capienza e per le soglie.
- **Chi genera l'invito vede quando scade.** Se lo staff manda un collegamento senza sapere che dura tre giorni, la scadenza corta diventa un fastidio invece di una difesa.
- **La pagina di riscatto continua a distinguere «scaduto» da «già usato»**: sono due stati diversi e due messaggi diversi, ed esistono già.

---

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

**Sulle foto:**

- una **sessione cliente reale** non riesce a cancellare né sostituire un oggetto che non appartiene ai propri cani, in **nessuno dei due secchi** — provato dal gesto, non dedotto;
- la stessa sessione **riesce** su un proprio cane, come deve;
- un utente autenticato **senza alcun legame** con il salone non riesce a scrivere né cancellare nulla;
- le foto restano **visibili senza autenticazione** sulla card pubblica;
- conteggio degli oggetti **prima e dopo**: invariato;
- lo staff carica e sostituisce una foto come prima.

**Sulla scadenza:**

- un invito generato con la durata a **3** scade dopo tre giorni e non dopo trenta — verificato sul valore memorizzato, non sull'attesa;
- cambiando la durata **nelle impostazioni**, i nuovi inviti la rispettano **senza ricostruire l'app**;
- un valore non valido nelle impostazioni viene **rifiutato dal database**;
- un invito emesso prima del cambio **conserva la propria scadenza**;
- riscatto di un invito scaduto e di uno già usato: **due messaggi distinti**.

Build verde; suite RLS estesa con i casi nuovi. Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, una cosa da fare con gli occhi dopo il rilascio: **aprire la card pubblica di un cane che ha la foto** e verificare che si veda ancora. È l'unica superficie dove un errore sui permessi si manifesta come un riquadro vuoto invece che come un errore.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy. **La migration in produzione la applica Luigi, o Cowork su sua autorizzazione, prima del rilascio del frontend.**
