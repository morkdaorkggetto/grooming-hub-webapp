# Incarico GH-38 — La card pubblica, il QR, e il nome del salone

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Realizza:** la composizione `CD-04` e **assorbe `GH-36`**, che resta come documento di storia.
**Rotta:** `/client-card/:qrToken`, componente `PublicPetCard`. **Nessuna rotta nuova.**

> Dichiara le invarianti, non la procedura. Tutto ciò che segue è **misurato**, non supposto: dove il mandato è grande, è perché non poggia su assunzioni.

## Regola d'ingresso

Root dichiarata nel registro. Una sola sessione. Nessun push, merge o deploy. **Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)**; produzione esclusa.

## Dove sono i materiali

`Prototipo/CD-04-consegna/` — fuori dal worktree: `CD-04-handoff.md`, `cd04-card-kit.jsx`, `cd04-card-viste.jsx`, `cd04-card-note.jsx`, il canvas. **Da versionare in `design_handoff_customer_app/`**, non in quello staff: questa pagina appartiene alla lingua dell'app clienti.

`CardPrimaVeste` in `cd04-card-viste.jsx` è la ricostruzione della pagina attuale a scopo di confronto. **Non va portata in produzione.**

---

## 1 · Il QR si genera in casa

Nel pacchetto pubblicato: `dS = "https://api.qrserver.com/v1/create-qr-code/"`. **L'immagine del QR viene chiesta a un servizio esterno gratuito** a ogni visualizzazione e a ogni stampa: dipendenza da un terzo per un gesto quotidiano del salone, e il `qr_token` del cane che transita da un fornitore che nessuno ha scelto.

**Invarianti**: il QR si disegna dentro l'app, senza rete verso terzi, né a schermo né in stampa; libreria a licenza permissiva, funzionante offline, resa a dimensione arbitraria (la stampa chiede 900px su tela). A build fatta, `api.qrserver.com` non compare più da nessuna parte. Se il peso del bundle cresce in modo sensibile, **dichiara di quanto**.

**Il contenuto codificato non cambia di un carattere**: resta `{origine pubblica}/client-card/{qr_token}`.

> **Vincolo misurato, non cautela astratta.** Il 29/8 Luigi ha inquadrato **un cartoncino già stampato e consegnato**: si è aperta la card del cane giusto con i dati aggiornati dopo la migrazione. Le card in circolazione esistono e dipendono da questa riga. Se l'URL cambia, diventano carta straccia.

---

## 2 · La veste della card pubblica

Realizza `CD-04`. Le sue undici scelte deliberate (§7 dell'handoff) **non sono da migliorare**: se una ti sembra sbagliata, fermati e dichiarala.

Punti che il mandato ribadisce perché sono controintuitivi rispetto al resto del prodotto:

- **La densità è invertita.** Qui il telefono è il caso normale e il banco l'eccezione. **Nessun target sotto 54px**, non 44. Colonna al massimo 390px anche a schermo largo.
- **Il medaglione è progettato per il caso senza foto**, che è l'85% (42 cani su 282 ne hanno una). Non è un segnaposto in attesa: è la forma normale.
- **Le tre barre della progressione spariscono.** Nessuna variante testuale del tipo «ancora 9 visite»: è la stessa distanza scritta più piccola.
- **Niente verde di WhatsApp.** Il pulsante pieno usa `--color-primary`. Dove porta lo dicono il glifo, la parola «WhatsApp» e il sottotitolo.
- **Nessun token nuovo**: i tre metalli `--tier-*` erano già dichiarati in GH-15. Verificalo invece di darlo per buono.

**Nota di implementazione da CD, non ignorabile** (§5 dell'handoff): nel caso telefono la colonna deve estendersi in altezza, altrimenti il blocco dei gesti non si ancora in basso e **il pulsante WhatsApp resta a metà schermo**. È il difetto che il suo primo giro conteneva, su una pagina il cui argomento è un gesto a portata di pollice.

**Le parole del §10 sono approvate**: «Scrivici su WhatsApp», «Vedi le visite di {nome}», «È venuto 3 volte da noi», «Non ci siamo ancora conosciuti. La prima volta è la prossima.»

---

## 3 · Il nome del salone è sbagliato in produzione

**Misurato.** La funzione `get_public_pet_card` costruisce l'insegna così:

```sql
COALESCE(pr.business_name, 'Grooming Hub')
FROM pets p LEFT JOIN profiles pr ON pr.id = p.owner_user_id
```

Cioè prende il nome dal **profilo dell'operatore che ha creato la scheda**. E i tre profili contengono:

| account | `business_name` |
|---|---|
| frogletinpond@gmail.com | `frogletinpond` |
| ggetto@gmail.com | `ggetto` |
| zavaroby@gmail.com | `zavaroby` |

**Quindi oggi un cliente che inquadra un cartoncino legge «FROGLETINPOND» o «ZAVAROBY».** Verificato dal vivo su due card reali.

Il nome vero esiste ed è **`tenants.name` = «Grooming HUB»**. Non lo legge nessuno.

**Invarianti**: l'insegna della card pubblica viene dal **tenant del pet**, non dal profilo di chi ha creato la scheda. Se il tenant non ha un nome, si mostra un ripiego neutro — mai l'indirizzo email di una persona. Il cambio riguarda la funzione, quindi va fatto con una migration sul demo: **firma e permessi invariati**, la funzione resta pubblica e continua a non richiedere autenticazione.

**Non toccare `profiles.business_name`**: è usato altrove e non è compito di questo mandato ripulirlo.

---

## 4 · Il numero di telefono del salone: due valori, nessuno nel posto giusto

**Misurato nel pacchetto in produzione**, due numeri diversi:

| Dove | Valore | Usato da |
|---|---|---|
| `apps/staff/lib/whatsapp.js` | `393332979797` (ripiego di `VITE_PUBLIC_GROOMING_WHATSAPP`, non impostata) | card pubblica |
| `apps/customer/pages/Home.jsx` | **`+393331112233`** | home dell'app clienti |

**Il secondo è un numero finto** — 333 111 22 33 — scritto a mano in una costante e finito in produzione. Chi tocca quel pulsante apre una conversazione verso un numero che non esiste.

**Invarianti**: esiste **un solo** numero del salone in tutto il prodotto, e viene dal **tenant**, non dal codice né da una variabile di build. Nessun numero scritto a mano resta nei sorgenti. Se il tenant non ha un numero, **il gesto WhatsApp non si mostra**: un pulsante che non porta da nessuna parte è peggio di un pulsante assente.

**Il valore, confermato da Luigi il 29/8**: **`+39 333 297 9797`**, cioè `393332979797`. È lo stesso che la card pubblica usa già come ripiego; **quello dell'app clienti è finto e va rimosso**, non corretto.

Va scritto nelle impostazioni del tenant `grooming-hub` — **sul demo in questo giro**, sulla produzione con un gesto separato di Luigi dopo il rilascio.

---

## 5 · Le domande di CD — risposte

| | Domanda | Risposta |
|---|---|---|
| 8.⚠ | il cliente ha un accesso attivo? | **Non usare il dato del proprietario**: esporlo su una pagina pubblica direbbe a chiunque scansiona se quel cliente ha un account. Usa invece la **sessione di chi guarda** — la pagina già distingue visitatore, cliente e operatore. Chi è collegato come cliente vede «Entra nella sua pagina»; tutti gli altri la versione che spiega |
| 8.⚠ | `MIN(visits.date)` | esiste; se lo vuoi nella card va aggiunto alla funzione pubblica. Se non c'è, la riga resta valida senza il rimando |
| 8.⚠ | numero WhatsApp per tenant | **oggi non lo è**: vedi §4 |
| 8.⚠ | nome del salone dal tenant | **oggi non lo è**: vedi §3 |
| 8.⚠ | razza mancante | confermato, **5 cani su 282** |
| 9.1 | chi disegna il ritratto generico | fuori mandato: è una commissione, non codice. Il medaglione resta dimensionato per riceverla |
| 9.2 | la card gira prima della prima visita? | domanda al salone, non al disegno. Lo stato «non ci siamo ancora conosciuti» si compone comunque |
| 9.3 | «Vedi le visite di {nome}» promette un elenco | **verificalo tu** nell'area cliente. Se l'elenco non c'è, **cambia la parola, non la pagina**, e dichiara cosa hai trovato |
| 9.4 | colore per tenant | fuori mandato |
| 9.5 | la pagina è pubblica per costruzione | preso atto, nessun cambiamento. Il token è opaco: il rischio è il cartoncino perso, non l'indirizzo indovinato |
| 9.6 | **stato «token non valido» non composto** | vedi sotto |

**Sul 9.6.** CD lo dichiara come propria mancanza, e ha ragione a segnalarlo: è **l'unico ingresso pubblico del prodotto**, e oggi un cartoncino con un token revocato o storpiato non trova niente da dire. Non blocchiamo il giro per questo: **componi uno stato sobrio con i componenti esistenti** — insegna del salone, una frase che dice che quel cartoncino non è più valido, e il gesto WhatsApp. **Dichiaralo come provvisorio** nel registro: la versione definitiva sarà un `CD-05`.

---

## Controprove

Dichiara nel registro, misurate sul demo:

- il pacchetto costruito **non contiene** `api.qrserver.com`, e la card si genera **con la rete verso terzi bloccata**;
- il QR codifica **esattamente** l'URL di prima, riletto dall'immagine e non dedotto dal codice;
- peso del bundle prima e dopo, in kB;
- i **cinque stati** di CD-04 resi dal vivo, più lo stato «token non valido»;
- **sul telefono il pulsante WhatsApp sta in fondo**, non a metà schermo;
- l'insegna mostra il **nome del tenant**, provata su un pet il cui `owner_user_id` ha un `business_name` diverso — è il caso che oggi sbaglia;
- **nessun numero di telefono scritto a mano** resta nei sorgenti; con il numero assente nel tenant, il gesto WhatsApp **non compare**;
- nessun token nuovo introdotto;
- build verde; suite RLS invariata o estesa; la funzione pubblica resta accessibile senza autenticazione.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Lascia nel registro tre cose da fare con gli occhi, sul telefono e non sul banco:

1. inquadrare **un cartoncino già stampato** e leggere l'insegna: deve dire il nome del salone;
2. arrivare in fondo alla pagina **senza scorrere** e toccare il gesto WhatsApp con il pollice;
3. aprire la card di un cane **senza foto** — che è l'85% — e dire se il medaglione regge.

## Chiusura

Registro in `docs/consegne/`, committato col codice, con i materiali di CD-04 in `design_handoff_customer_app/`. Niente push, niente merge, niente deploy.
