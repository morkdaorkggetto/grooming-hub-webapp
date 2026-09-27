# Emendamento 1 a GH-102 — Cosa può raggiungere un cliente

**Da:** Luigi · **Per:** Codex · **Data:** 27 settembre 2026
**Corregge** `docs/incarichi/GH-102-cosa-puo-raggiungere-un-cliente.md` in un punto solo: **quando fermarsi.** Il resto del mandato vale parola per parola.

## Perché

L'audit si è fermato **due volte** ed è ancora a metà. Entrambe le interruzioni erano corrette secondo il mandato, e la colpa è della regola, non dell'esecuzione.

La regola diceva: *«se trovi un buco, fermati e scrivilo»*. Era scritta pensando a **una fuga fra clienti**, ed è giusta per quella. Ma un audit serve a sapere **tutto quello che c'è**: fermarsi a ogni crepa significa non arrivare mai in fondo, e correggere una cosa alla volta senza vedere l'insieme.

**Le due interruzioni sono state entrambe utili** — la prima ha scoperto che il demo non somigliava alla produzione dal 28 agosto, la seconda che i dati economici sono leggibili dal cliente. Nessuna delle due era una fuga fra persone.

## La regola nuova

**Ti fermi solo se un cliente può leggere o scrivere dati di un altro cliente**, o se un anonimo può leggere dati personali di chiunque. In quel caso: fermati, scrivilo **in cima al registro**, e non andare avanti.

**Per tutto il resto — annota e prosegui.** Ogni rilievo va nel registro con la stessa disciplina di sempre: osservato, possibile o escluso, con la prova. Ma l'audit continua.

## Cosa resta da fare

Le parti non ancora percorse:

- le **funzioni sulle richieste altrui**: `respond_appointment_request_slot` e `withdraw_appointment_request` chiamate da Luca su una richiesta di Mario;
- i **cinque casi degli inviti**: inoltrato, usato due volte, scaduto, aperto da chi ha già un account, aperto con un'altra sessione nel browser;
- il **confine staff/cliente**: un cliente su `/dashboard`, `/calendar`, `/contacts` — **porta chiusa o porta finta**;
- **quello che la suite RLS non copriva**, e **cosa non hai potuto stabilire**.

## Sul rilievo economico già trovato

**È registrato e non va riparato qui.** Luigi ha deciso il 27/9: gli importi e gli sconti vanno protetti **prima del lancio**, seguendo lo schema già usato per le note interne. Sarà un mandato suo, scritto **dopo** che questo audit sarà completo, così da correggere tutto quello che trovi in un giro solo invece che uno alla volta.

**Quindi non ti serve approfondirlo oltre.** Se incontri altri campi nella stessa condizione — righe protette, colonne no — **elencali**: entreranno nello stesso mandato.

## Cosa consegnare

Lo stesso registro, **completo**. In cima, prima di tutto, la risposta alla domanda del mandato:

> **possiamo invitare trecentoventi persone senza che nessuna di loro veda qualcosa di qualcun altro?**

E subito sotto, **l'elenco di tutto quello che va corretto prima del lancio**, anche quando non riguarda altri clienti — in ordine di gravità, con la tua valutazione.
