# Incarico GH-48 — Nomi scritti per un quaderno, letti da un proprietario

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 30 agosto 2026
**Segue:** `GH-46`. **Da chiudere prima del primo invito a un cliente reale.**

> **Forma breve** (regola 4 del canone): nessuna migrazione, nessun dato modificato. Si aggiunge un ripiego e si sposta un'informazione più in alto.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova. **Nessuna scrittura sui dati anagrafici**: questo mandato non corregge nomi, li mostra.

## Il fatto

`GH-46` ha reso il messaggio d'invito sicuro rispetto ai **nominativi dei clienti**, che nel 63% dei casi contengono un numero di telefono. Restava scoperto il **nome del cane**, che il messaggio usa per intero.

**Misurato sulla produzione il 30/8, su 288 cani:**

| | |
|---|---:|
| nome **uguale o contenuto nella razza** | **63 (22%)** |
| nome che inizia in minuscolo | 53 |
| nome contenente cifre | 12 |

E i casi veri mostrano che non è un problema di forma, ma di **contenuto eterogeneo**:

```
chihuahua              [razza: chihuahua]    descrizione
Meticcio               [razza: meticcio]     descrizione
York                   [razza: York]         descrizione
barboncino nero        [razza: barboncino]   descrizione
Volpino bianco grande                        descrizione
2 spitz pizzeria                             descrizione + luogo
cane 25 anni           [razza: cane zoombie] annotazione
non pervenuto          [razza: da strippare] resa
Milo maltese           [razza: Maltese]      nome VERO + razza
charlie / loki / lucky                       nomi veri, minuscoli
```

> **La ragione profonda, e vale oltre questo mandato.** Quei campi sono stati scritti **per un quaderno, non per gli occhi del proprietario**: erano appunti privati — «il barboncino nero», «quello della pizzeria». Con il primo invito, **267 schede scritte in privato vengono mostrate alle persone che descrivono.** È un cambio di destinatario, non un problema di formattazione.

## Invarianti

**1 · Il ripiego scatta solo dove la certezza è totale.**

Il messaggio d'invito dice **«il tuo cane»** invece del nome **soltanto** quando il nome è vuoto, oppure **coincide esattamente con la razza** a meno di maiuscole e spazi. Nient'altro.

Copre `chihuahua`, `Meticcio`, `York` senza toccare `Milo maltese`, che un nome vero ce l'ha. **Non inventare euristiche più larghe**: un automatismo che indovina è peggio di uno che tace, e qui sbagliare significa scrivere a un cliente il nome sbagliato del suo cane.

Casi come `barboncino nero` o `2 spitz pizzeria` **resteranno com'è**: li risolve l'invariante 2, non il codice.

**2 · L'operatore vede cosa sta per mandare, prima di generarlo.**

Oggi il messaggio compare solo quando WhatsApp è già aperto — e a quel punto si correggerebbe **il messaggio**, non la scheda. Il riquadro dell'invito deve mostrare **prima della generazione**: nominativo del cliente, numero, **nome del cane**, e il testo che verrà composto.

Così chi legge «andrà a … per **Specie JackRussel**» corregge **il dato**, e la correzione resta per sempre.

> **È un'occasione, non solo una difesa.** La campagna inviti è l'unica volta in cui qualcuno guarderà quelle 267 schede una per una. Se il gesto mette sotto gli occhi nome del cane e nominativo del cliente, l'archivio si ripulisce da solo nel corso delle settimane — senza una giornata dedicata che nessuno farà mai.

**3 · Nessun dato viene corretto automaticamente.** Il mandato mostra e ripiega; non riscrive nomi, non normalizza maiuscole, non tocca l'anagrafica. Chi corregge è il salone, sapendo cosa sta correggendo.

**4 · Il ripiego vale ovunque compaia il nome del cane in un testo diretto al cliente**, non solo nell'invito. Se esistono altri messaggi che lo usano, si comportano allo stesso modo.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- cane con nome **uguale alla razza** → il messaggio dice «il tuo cane», e il **testo integrale** è riportato nel registro;
- cane con nome tipo **`Milo maltese`** → il messaggio **usa il nome**, perché non coincide con la razza;
- cane con **nome vuoto** → ripiego;
- cane con **nome normale** → nessun cambiamento rispetto a oggi;
- il riquadro dell'invito, **prima di generare**, mostra nominativo, numero, nome del cane e testo che verrà composto;
- **nessuna riga di anagrafica modificata** durante le prove: conteggi e valori invariati;
- build verde; suite RLS invariata.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro: **generare un invito per il cane chiamato come la sua razza e uno per un cane con nome vero**, e leggere i due messaggi di seguito. Il primo non deve sembrare impersonale, il secondo non deve sembrare automatico.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
