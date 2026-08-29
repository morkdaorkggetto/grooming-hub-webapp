# Consegna GH-42 - Il calendario e le risposte che arrivano in ritardo

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `33d144c`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, nuova rotta, dipendenza, scrittura permanente, push,
  merge o deploy.

## Esito

GH-42 e' completato. Ogni lettura settimanale riceve un identificativo
monotono conservato in `useRef`: soltanto la richiesta con l'identificativo
piu recente puo aggiornare dati, errore e stato di caricamento. Il cambio di
settimana e lo smontaggio della pagina invalidano inoltre la richiesta ancora
in corso.

La stessa guardia copre sia i cambi di settimana sia i ricaricamenti manuali
successivi a un'operazione. Una risposta vecchia viene scartata integralmente:
non puo piu mostrare righe della settimana precedente, sostituire un errore o
spegnere il caricamento della richiesta corrente.

Il percorso normale non cambia: struttura JSX, testi, stili, query e dati
restituiti restano identici. E' cambiato soltanto il diritto delle risposte
asincrone di aggiornare lo stato.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Introduce l'identificativo dell'ultima lettura e scarta dati, errori e chiusure del caricamento provenienti da richieste superate. |
| `docs/consegne/GH-42-calendario-risposte-in-ritardo-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex.

## Controprove sul demo

Le settimane usate per distinguere le risposte sono state misurate sul demo:
`24-30 agosto 2026` contiene una visita, mentre `31 agosto-6 settembre 2026`
non contiene visite, appuntamenti o richieste pendenti.

| Prova | Prima della correzione | Dopo la correzione | Esito |
| --- | --- | --- | --- |
| Prima lettura ritardata, poi cambio settimana | Titolo `31 ago-6 set`, righe provenienti da `24-30 ago` (`1` riga) | Titolo e righe restano entrambi sulla settimana nuova | PASS |
| Percorso veloce | La risposta corrente aggiorna dati e chiude il caricamento | Stesso risultato; nessun nodo JSX o stile modificato | PASS |
| Tre cambi rapidi consecutivi | Una risposta precedente puo prevalere se termina per ultima | Vince sempre la terza e ultima richiesta | PASS |
| Caricamento con risposta vecchia tardiva | La vecchia `finally` produce `loading=false` mentre l'ultima richiesta e' ancora pendente | La risposta scartata non modifica `loading` | PASS |
| Errore di una richiesta superata | Puo sostituire lo stato della settimana corrente | L'errore superato viene scartato | PASS |

Il controllo deterministico della guardia ha prodotto `4/4` esiti positivi:
risposta vecchia scartata, ultima di tre richieste vincente, caricamento
preservato e errore vecchio scartato.

## Verifiche eseguite

- Suite RLS demo: `30 PASS, 0 FAIL, 1 SKIP`; lo skip e' quello previsto per
  l'assenza di un secondo tenant reale.
- Pulizia fixture della suite: `0` pet, `0` visite, `0` customer, `0`
  richieste, `0` note pet e `0` note customer.
- Sonda staff dopo lo smontaggio: `0` utenti Auth, `0` identita, `0` profili,
  `0` membership, `0` collegamenti customer e `0` pet posseduti.
- `npm run build`: PASS, Vite 5.4.21, 155 moduli trasformati, bundle JS
  673.29 kB (gzip 190.26 kB).
- `git diff --check`: PASS.
- Warning build non bloccanti e preesistenti: Browserslist datato e bundle
  principale sopra 500 kB.

## Eccezioni e fuori istruzione

- Il mandato originale vietava scritture, mentre la suite RLS richiede una
  sonda staff e fixture usa-e-getta. Codex si e' fermato prima di crearle e
  Luigi ha autorizzato esplicitamente l'eccezione limitata al solo demo e alla
  controprova RLS. La sonda canonica e' stata ricreata senza collegamenti
  customer, la suite ha rimosso le proprie fixture e la sonda e' stata
  smontata nella stessa sessione; tutti i conteggi finali sono zero.
- Nessuna credenziale o segreto e' stato scritto nei file o incluso nel
  commit.
- Nessun difetto ulteriore e' emerso nel file durante l'intervento.
- Nessuna attivita e' stata eseguita sulla produzione e nessuna estensione
  funzionale e' stata applicata fuori GH-42.

## Passo umano di Luigi

Dopo il rilascio, cambiare settimana rapidamente due o tre volte e osservare
la destinazione finale. La domanda e': titolo, righe e riepilogo restano
sempre riferiti all'ultima settimana scelta, senza lampi di quella precedente?

## Commit

Commit locale della consegna con messaggio
`fix: discard stale calendar responses`. Nessun push eseguito.
