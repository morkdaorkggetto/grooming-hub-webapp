# GH-72 - La promozione ha una faccia

## Esito e perimetro

**Implementazione e controprove isolate concluse; controprova viva Storage sul demo non eseguibile per assenza della sonda staff.** Il codice e committibile, ma questa consegna non presenta come misurati i conteggi vivi che non e stato possibile leggere. Il controllo visivo di Luigi resta aperto. Nessun push, merge o deploy.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`, branch `main`.
- Base **`54c03393b193f306a362a14a2a120875920faaff`**, stato iniziale pulito.
- Mandato locale GH-72 letto integralmente. Perimetro dati: solo demo `qttpinkslhenxrsbhhhg`; produzione non letta e non scritta.
- Nessuna migration, tabella, colonna, policy, rotta o deposito aggiunto. Nessun secret incluso.
- Codice, registro ed evidenze nello stesso commit locale. Hash comunicato a Luigi alla chiusura e ricavabile con `git log -1 --format=%H -- docs/consegne/GH-72-la-promozione-ha-una-faccia-esito.md`.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/staff/lib/database.js` | Validazione file; riuso del caricatore condiviso; caricamento, sostituzione, rimozione e rollback delle immagini promozione; messaggio CTA corretto |
| `src/apps/staff/pages/PromotionsManager.jsx` | Casella immagine unica per creazione/modifica, anteprima, sostituzione, rimozione, esito parziale e miniatura condizionale |
| `src/apps/staff/pages/PromotionsManager.css` | Anteprima e miniatura responsive; soglia locale di 44 px per i controlli della pagina |
| `docs/consegne/GH-72-la-promozione-ha-una-faccia-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-72/gh72-db-measures.json` | Misure dell'orchestrazione dati e Storage simulati |
| `docs/consegne/evidenze/GH-72/gh72-ui-measures.json` | Misure DOM, errori, layout e componente cliente |
| `docs/consegne/evidenze/GH-72/gh72-live-measures.json` | Tentativo vivo demo e impedimento misurato |
| `docs/consegne/evidenze/GH-72/gh72-1365.png` | Modulo e lista staff a 1365 px |
| `docs/consegne/evidenze/GH-72/gh72-375.png` | Modulo staff a 375 px |
| `docs/consegne/evidenze/GH-72/gh72-edit-1365.png` | Immagine esistente in modifica e miniatura staff |
| `docs/consegne/evidenze/GH-72/gh72-customer-1365.png` | Componente cliente reale con promozione illustrata e promozione senza immagine |

Impronte SHA-256 dei tre sorgenti al momento delle prove: `database.js` `8132dce49b5f48db0cbfceb06ea4463da740783dbe9e3b7a539bfdee89ab565f`; `PromotionsManager.jsx` `03213954f3c8cc4c722fa969245f5d5128ccefd5ff03e4470f231ff67c1ff8a3`; `PromotionsManager.css` `94200da480adb49bd800cfc6ea01fd8f99545afeb6ac03578fa5c41734fa3311`.

## Implementazione e scelte

La casella accetta JPEG, PNG, WebP e GIF fino a 5 MiB. Il percorso e deterministico: `{tenant_id}/promotions/{promotion_id}.{estensione}` nel deposito esistente `pet-avatars`. L'URL pubblico porta un parametro di versione per evitare che il browser conservi l'immagine sostituita.

Il caricatore preesistente e stato reso parametrico e continua a servire le foto cliente tramite `uploadClientPhoto`; i due chiamanti precedenti conservano deposito e percorso originari. Non e stata introdotta una seconda macchina di upload.

In sostituzione con la stessa estensione viene aggiornato lo stesso oggetto: cardinalita invariata a 1 e bytes precedenti non piu presenti. Con estensione diversa viene prima collegato il nuovo oggetto, poi rimosso il vecchio; un errore di rimozione ripristina l'URL precedente e cancella il nuovo oggetto. La rimozione esplicita azzera prima il riferimento e, se Storage fallisce, lo ripristina. Un fallimento di upload non annulla titolo o testo della promozione e non espone l'errore grezzo.

**Scostamento dichiarato:** `pet-avatars` ora puo contenere anche immagini promozionali e il suo nome non descrive piu tutto il contenuto. E la scelta esplicita del mandato: il deposito ha gia lettura pubblica e ACL staff per cartella tenant. Un deposito dedicato avrebbe richiesto migration e policy nuove ed e rimasto fuori perimetro.

## Controprove

Banco dati Node isolato sul modulo reale, con Supabase/Auth simulati in memoria. Banco browser Chromium isolato sui componenti staff e cliente reali, con adattatore dati in memoria e CSS applicativo. Nessuna richiesta verso Supabase durante questi due banchi.

| Controprova | Misura / esito |
| --- | --- |
| Nuova con immagine | 1 upload in `11111111-1111-4111-8111-111111111111/promotions/promo-1.png`; `image_url` valorizzato; componente cliente: 2 schede, 1 immagine |
| Nuova senza immagine | `image_url = null`; 0 segnaposti nella riga staff e 0 nella scheda cliente senza immagine |
| Modifica senza toccare l'immagine | Impronta bytes prima/dopo `504e472d41` / `504e472d41`; URL e file invariati |
| Sostituzione stessa estensione | Operazione `update`, 1 oggetto prima e 1 dopo, bytes cambiati; prova di errore conserva i bytes precedenti e ripristina l'URL |
| Sostituzione con estensione diversa | Nuovo `.gif` presente, vecchio `.png` rimosso, 1 oggetto dopo |
| Rimozione | `image_url = null`, oggetto rimosso; prova di errore conserva oggetto e URL precedenti |
| File oltre 5 MiB | Rifiutato prima delle scritture con `L'immagine supera il limite di 5 MB.` |
| Tipo non ammesso | PDF rifiutato prima delle scritture con `Seleziona un'immagine JPEG, PNG, WebP o GIF.` |
| Upload fallito | Riga salvata con titolo `Testo salvo`, immagine nulla, avviso comprensibile; 0 errori Storage grezzi nel DOM |
| CTA | Nessuno: PASS; solo testo: reject; solo indirizzo: reject; entrambi: PASS |
| Testo CTA | Messaggio esatto `Testo e indirizzo del pulsante vanno compilati insieme.`; ricerca `rg -n "Etichetta" src`: 0 corrispondenze |
| Pulizia banco | 0 oggetti Storage in memoria a fine suite |
| Runtime browser | 0 errori JavaScript |

### Layout e bersagli

| Viewport | Controlli misurati | Sotto 44 px | Sbordamento |
| --- | ---: | ---: | ---: |
| 1365 px | 20 | 0 | 0 px |
| 1024 px | 20 | 0 | 0 px |
| 375 px | 20 | 0 | 0 px |

Le quattro immagini allegate sono state ispezionate. La promozione senza immagine non genera uno spazio riservato ne un invito a completarla.

### Verifiche tecniche

- `npm run build`: **PASS**, 159 moduli, Vite 1,05 s; restano gli avvisi non bloccanti su Browserslist e chunk oltre 500 kB.
- `git diff --check`: **PASS**.
- Lint dedicato non eseguito: il pacchetto locale non espone il comando `eslint` (`eslint: command not found`).
- Suite RLS non rieseguita, come ordinato. Ultima misura viva registrata in GH-63: **60 PASS, 0 FAIL, 0 SKIP**; non e una misura odierna.

## Eccezione viva e soluzione consigliata a Cowork

Il collegamento e stato vincolato al ref ammesso `qttpinkslhenxrsbhhhg`, ma il login della sonda `staff.sonda@test.example` ha risposto **`Invalid login credentials`**. La sonda era stata smontata nel proprio ciclo precedente. Il tentativo si e fermato prima di qualsiasi lettura o scrittura: **0 righe e 0 file creati**. Non sono stati usati account operativi reali e non e stato ricreato un utente Auth senza mandato. Di conseguenza, cardinalita iniziale/finale del deposito demo e visibilita customer viva restano **non misurate**, non sostituite dai valori del banco locale.

**Soluzione raccomandata:** un micro-mandato separato autorizza la ricreazione idempotente della sonda GH-04 esclusivamente sul demo, associata al tenant demo, e il suo smontaggio nella stessa verifica. Oggetti coinvolti: utente Auth della sonda e sole righe di profilo/membership richieste dal modello corrente; nessun account operatore o customer reale.

Controprove proposte: login staff; conteggio Storage prima; creazione con immagine; lettura cliente; modifica intatta con impronta; sostituzione con cardinalita 1; rimozione con cardinalita 0; conteggio finale uguale all'iniziale; teardown completo; login sonda successivamente rifiutato. Il rischio residuo e lasciare una credenziale o membership di prova: per questo creazione e teardown devono stare nello stesso mandato e il registro deve contare entrambi a zero. L'alternativa di usare l'account operatore reale ridurrebbe i passaggi ma allarga inutilmente il rischio ed e sconsigliata.

## Tempi, pulizia e passo finale

Il tempo totale di sessione non e stato rilevato dall'inizio e non viene ricostruito. Ultime misure puntuali: suite dati **0,18 s reali**, suite browser **3,60 s reali**, build **1,38 s reali**. Un precedente selettore di prova ha atteso 31,94 s prima di essere corretto; era un limite del banco, non un rallentamento iCloud. Un rilancio e stato inizialmente respinto dal sandbox con `listen EPERM` e ha poi impiegato 3,60 s con la sola porta locale autorizzata. Nessun rallentamento del workspace osservato.

Pulizia: 0 fixture sul database demo, 0 file creati sul suo deposito, 0 oggetti residui nel banco in memoria. Nessun server o browser del giro rimasto attivo sulla porta 4192. Gli script temporanei di prova vengono rimossi dopo il consolidamento delle evidenze. Nessuna attivita fuori istruzione.

**A Luigi, dopo rilascio e ricarica dall'origine con Opzione-Comando-R:** crea la prima promozione vera con immagine, riaprila per cambiarla o toglierla e guardala nella pagina cliente. **Cosa non ti torna?** La verifica resta esplicitamente affidata a Luigi.
