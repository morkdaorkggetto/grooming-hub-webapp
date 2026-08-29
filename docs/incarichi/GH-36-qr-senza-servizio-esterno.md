# Incarico GH-36 — Il QR si genera in casa

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026

> ## ⛔ NON ESEGUIBILE SU ORDINE GENERICO
>
> **Mandato depositato, in attesa di `CD-04`.** Decisione di Luigi del 29/8: il QR e la veste della card pubblica si fanno **in un giro solo**. Questo testo verrà assorbito nel mandato definitivo quando Claude Design consegna la composizione.
>
> Se lo raggiungi per scorrimento numerico: fermati, dichiaralo, e considera corrente il primo `GH-NN` precedente ancora privo di registro.

> **Forma breve** (regola 4 del canone): nessun dato in gioco, nessuna migrazione, nessuna scrittura. Una voce sola, con la causa già misurata.

**Perimetro**: root da dichiarare nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`), produzione esclusa; nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto, misurato sul pacchetto in produzione

Nel bundle pubblicato:

```
dS = "https://api.qrserver.com/v1/create-qr-code/"
```

**L'immagine del QR non è generata dall'app: viene chiesta a un servizio esterno gratuito** a ogni visualizzazione e a ogni stampa della card. Due conseguenze reali:

- **dipendenza**: se quel servizio è irraggiungibile, il salone non riesce a stampare una card;
- **il `qr_token` del cane esce dall'app** e transita da un fornitore che nessuno ha scelto. Non è una falla — la card è pubblica per progetto e il token non è un segreto — ma è un dato dei clienti che passa da terzi senza ragione.

Verificato nello stesso pacchetto: `VITE_PUBLIC_APP_URL` è correttamente `https://grooming-hub-webapp.vercel.app`, e gli unici altri indirizzi presenti sono l'app stessa e `azgehoseiojodltcttfb.supabase.co`. **`api.qrserver.com` è l'unica chiamata a terzi rimasta.**

## Invarianti

**Il QR si genera dentro l'app.** Nessuna richiesta di rete verso terzi per disegnarlo, né a schermo né in stampa. Quale libreria usare lo decidi tu, con tre vincoli: licenza permissiva, funzionamento **senza rete**, e resa a dimensione arbitraria — il percorso di stampa oggi chiede l'immagine a 900px e la disegna su una tela.

**Il contenuto codificato non cambia di un carattere.** Resta `{origine pubblica}/client-card/{qr_token}`, con l'origine presa da `VITE_PUBLIC_APP_URL` come adesso.

> **Non è una cautela astratta, è un vincolo misurato.** Il 29/8 Luigi ha inquadrato con il telefono **un cartoncino già stampato e consegnato**: si è aperta la card del cane giusto, con i dati aggiornati dopo la migrazione. Quindi le card in circolazione esistono, i token sono sopravvissuti a G6, e **ogni cartoncino già dato ai clienti dipende da questa riga**. Se l'URL codificato cambia, diventano carta straccia.

**L'aspetto non cambia.** Stessa posizione, stessa dimensione a schermo, stessa card in stampa. Questa non è una modifica di veste: se si vede una differenza, l'invariante non è soddisfatta.

**Nessuna chiamata a terzi resta nel pacchetto.** A build fatta, `api.qrserver.com` non deve comparire da nessuna parte.

**Il peso non esplode.** Il bundle principale è già oltre i 500 kB e la build lo segnala. Se la libreria scelta lo fa crescere in modo sensibile, **dichiara di quanto** e, se serve, caricala solo dove serve.

## Controprove

Dichiara nel registro, misurate:

- il pacchetto costruito **non contiene** `api.qrserver.com`;
- il QR mostrato a schermo e quello esportato in stampa codificano **esattamente** l'URL di prima, riletto dall'immagine e non dedotto dal codice;
- la card si genera **con la rete verso terzi bloccata** — è il punto di tutto il mandato;
- peso del bundle prima e dopo, in kB;
- build verde; suite RLS invariata.

## Passo finale — lo guarda Luigi (regola 5)

Al termine, lascia nel registro le due cose da fare con gli occhi:

1. aprire la scheda di un cane e confrontare il QR a schermo con quello di prima;
2. **stampare una card e inquadrarla col telefono**, verificando che apra la scheda pubblica giusta.

La seconda è l'unica prova che conta davvero, e non può farla il codice.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
