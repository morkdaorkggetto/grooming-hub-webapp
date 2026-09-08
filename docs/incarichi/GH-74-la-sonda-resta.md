# Incarico GH-74 — La sonda resta

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 8 settembre 2026
**Forma breve (regola 4).** **Nessun file applicativo.** Ambiente di prova soltanto.
**Perimetro**: database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`). **La produzione non si legge e non si scrive.** Nessun push, merge o deploy.

> **Attenzione, misurato in `GH-73`**: il collegamento locale della CLI Supabase **risulta puntato alla produzione**. Prima di qualunque comando, **verifica a quale progetto sei collegato e dichiaralo nel registro**. Se punta alla produzione, **non usare la CLI**: interroga indicando esplicitamente il ref del demo, come ha fatto `GH-73`.

## Da dove nasce

Due giri di fila si sono fermati sulla stessa cosa.

**`GH-72`**: la controprova viva sul deposito non è stata eseguita — `Invalid login credentials` sulla sonda staff.
**`GH-73`**: la suite RLS si è fermata all'avvio — **`0 PASS, 1 FAIL, 0 SKIP` in 0,96 s**, stesso motivo.

La sonda `staff.sonda@test.example` viene **creata e smontata dentro ogni giro** che ne ha bisogno, per igiene. Il risultato è che **ogni giro successivo la ritrova assente**, e chi ne ha bisogno deve ricostruirla o rinunciare.

> **L'igiene sta producendo il contrario dell'igiene**: due mandati di seguito hanno consegnato senza la loro copertura di regressione, e la suite RLS è ferma alla misura di `GH-63` — ormai vecchia di undici giri.

## La decisione

**La sonda smette di essere usa-e-getta e resta sul demo.**

Il demo **non contiene dati reali**: è l'ambiente di prova. Una credenziale di prova permanente lì dentro costa niente e **sblocca la suite RLS per sempre**.

**Vale solo per la sonda staff** e per le altre sonde che la suite si aspetta — non è un permesso generico a lasciare fixture in giro. **Le fixture di dato dei singoli mandati continuano a smontarsi come sempre.**

## Cosa fare

**Ricreare in modo idempotente sul demo le sonde che `scripts/rls-tests/run.mjs` si aspetta**, con gli identificativi già fissati dai teardown esistenti — `staff.sonda@test.example` ha già il suo UUID in `teardown-staff-probe.sql`: **si riusa quello, non se ne inventa uno nuovo.**

**Idempotente vuol dire**: eseguirlo due volte di seguito non crea duplicati e non cambia nulla la seconda volta. **Dimostralo eseguendolo due volte.**

**Poi eseguire la suite RLS completa** e riportarne l'esito.

**E rendere ripetibile il gesto**: uno script accanto ai teardown esistenti, in `scripts/rls-tests/`, così la prossima volta che qualcuno la trova assente sa cosa lanciare. **I teardown esistenti non si cancellano**: restano per il giorno in cui si vorrà davvero smontare tutto.

### Cosa cambia nel canone, e va scritto

**In `docs/consegne/README.md`**, una riga: **le sonde della suite RLS sul demo sono permanenti**; i mandati che le usano **non le smontano più**. Le fixture di dato continuano a smontarsi.

Senza quella riga, il prossimo mandato le smonta di nuovo per abitudine e torniamo qui.

## Invarianti

**Nessun file applicativo toccato.** Se ti trovi in `src/`, ti sei perso.

**Nessun account reale toccato.** Né operatori, né clienti, né in produzione né sul demo. Gli account della suite hanno indirizzi `@test.example`: **non se ne creano altri**.

**Nessuna migrazione, nessuna policy, nessuna colonna.** Questo giro crea utenti di prova e le righe minime che il modello richiede, niente altro.

**La produzione non si legge e non si scrive**, e il collegamento della CLI va verificato prima di cominciare.

**Nessun segreto nei file consegnati**: le password delle sonde stanno nelle variabili d'ambiente che la suite già usa. **Non le scrivere nel registro né nello script.**

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **a quale progetto era collegata la CLI** all'inizio, e cosa hai fatto di conseguenza;
- **stato di partenza**: quali sonde esistevano e quali no, contate;
- **lo script eseguito due volte di seguito**: la seconda esecuzione non crea niente e non cambia niente — conteggi identici, dimostrati;
- **la suite RLS completa**: numero di PASS, FAIL, SKIP e tempo. **È l'esito che questo mandato esiste per produrre**;
- **gli account reali sono intatti**: conteggio degli utenti Auth non `@test.example` prima e dopo, identico;
- **i dati del demo sono intatti**: pet, visite, clienti, appuntamenti prima e dopo;
- **la riga aggiunta al canone**, riportata testualmente.

> **Se la suite risultasse rossa su qualcosa che non c'entra con la sonda, non ripararlo qui.** Riportalo e fermati: sarebbe una regressione vera, nascosta da undici giri di suite non eseguita, e merita un mandato suo.

## Passo finale — lo guarda Luigi (regola 5)

Non c'è niente da guardare a schermo: questo giro non tocca il prodotto.

**Quello che serve è una riga nel registro**: da adesso la suite RLS si può eseguire quando serve, e i mandati che la richiedono non si fermano più all'avvio.

## Chiusura

Registro in `docs/consegne/GH-74-la-sonda-resta-esito.md`, committato. Niente push, niente merge, niente deploy.
