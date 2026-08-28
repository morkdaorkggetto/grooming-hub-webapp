# Incarico GH-17 — Veste del gestionale: esecuzione

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 25 agosto 2026
**Continua** `GH-16` dopo il checkpoint di Fase 1. La tabella degli scostamenti del registro `docs/consegne/GH-16-veste-gestionale-tre-schermate-fase-1.md` **è approvata** ed è il contratto di questo mandato.

## Regola d'ingresso

**Primo atto della sessione**: dichiarare nel registro la root. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun database, nessuna migration, nessun deploy, nessun push.

## Le otto decisioni, risolte

Vincolanti. Dove divergono dalla raccomandazione di Fase 1, il motivo è dichiarato.

1. **Sesta tile «Registra una visita» in Dashboard: RESPINTA.** Una visita non è registrabile senza aver prima scelto un cliente: la tile porterebbe a un elenco clienti, cioè a ciò che la Dashboard già è — aggiungerebbe un passo invece di toglierlo. Contraddice inoltre il §7.4 dell'handoff CD. Restano **cinque** aree.
2. **Alert pending: si tiene e si riveste. Slot orari di oggi in Dashboard: non si introducono.** Richiederebbero una lettura nuova e una responsabilità nuova della pagina, e sarebbero comunque vuoti: zero appuntamenti dal 23 aprile.
3. **CTA nuovo cliente: resta dov'è.** Il FAB mobile **è ammesso** perché additivo e non sposta il punto d'ingresso esistente — a condizione che non copra alcuna azione, come CD stessa impone al §7.10. *(Qui il mandato è più permissivo della raccomandazione di Fase 1.)*
4. **Sezioni della scheda: non si rimuove nulla e non si riordina.** L'handoff dice sette, il bundle ne disegna sei, il codice ha sei nuclei più due condizionali (Promo, Note). **Vince il codice.** I due condizionali si portano nel linguaggio `Notice`/`Panel`.
5. **Scheda mobile: un solo scroll responsive.** Le tre viste di CD risolvono un problema reale — sette sezioni non stanno in due schermi senza comprimersi — ma arrivano senza navigazione definita, e improvvisarla sarebbe una riorganizzazione di flusso. **Rinviato a CD** perché lo specifichi: è materia da annotare nell'errata del bundle staff, non da inventare qui.
6. **Le sei azioni della scheda: ordine e collocazione invariati** — cinque nel gruppo più il FAB `Registra visita`. Cambia solo il peso visivo. È deliberatamente il caso «sembra migliorabile»: si segnala, non si corregge. Candidato a un giro successivo.
7. **Registrazione visita: si estrae un form condiviso**, usato dal modal reale nella scheda e dalla rotta esistente. Entrambi i punti d'ingresso restano operativi.
8. **`Button` si estende in modo retrocompatibile; `Btn` non si crea.** Due primitive che fanno la stessa cosa sono un debito che nasce già vecchio. Vale in generale: dove una primitiva condivisa esiste già, si estende — non si duplica con il nome CD.

## Scoperta di Fase 1 che cambia la terza tappa

`AddVisit.jsx` (361 righe) **è una pagina che nessuno raggiunge**: la stringa `add-visit` compare nel codice una volta sola, nella registrazione della rotta. Nessun pulsante e nessun link vi navigano. Le 464 visite dello storico sono state registrate tutte dal form dentro `ClientDetail.jsx`.

Perciò la terza tappa non riveste `AddVisit.jsx` come pagina: **estrae il form** e lo fa usare da entrambe le superfici. È l'unica strada che non lascia due form divergenti destinati a separarsi.

## Correzione ai nomi dei token — leggere prima della Tappa 0

La tabella dei colori di Fase 1 propone destinazioni come `--gh-warning-text`, `--gh-secondary`, `--gh-danger-text`, `--gh-success-text`, `--gh-warning-bg`, `--gh-warning-border`. **Quei token non esistono e non vanno creati.**

I token esistenti conservano il loro nome `--color-*` (`--color-warning-text`, `--color-secondary`, `--color-danger-text`, `--color-success-text`, `--color-warning-bg`, `--color-warning-border`). I **soli tre** nomi nuovi ammessi sono quelli dichiarati da CD al §2:

```css
--gh-bridge:     #f7f1ea;
--gh-border-60:  rgba(207,193,196,.6);
--gh-border-35:  rgba(207,193,196,.35);
```

Creare una famiglia `--gh-*` parallela ai token esistenti sarebbe introdurre colori nuovi sotto altro nome. Le destinazioni della tabella restano valide: cambiano solo i nomi con cui si scrivono.

## Le quattro tappe, un commit ciascuna

**Tappa 0 — Fondazione.** I tre token nuovi in `index.css`. `gh15-staff.css` portato in `src/` e agganciato. Le primitive mancanti nominate dall'inventario di Fase 1 (`Hero`, `HeroBtn`, `Panel`, `Field`, `SearchBar`, `Pill`, `StatStrip`, `AreaTile`, `TierDot`, `SkeletonRow`, `EmptyState`, `ErrorState`, `ClientRow`, `Fab`, `PetAvatar`, `FidelityBadge`, e le composizioni di scheda e visita). Estensione retrocompatibile di `Button`, `Card`, `Icon`, `StatusBadge`, `Eyebrow`, `Skeleton`, `WarmNotice`. I nomi icona CD mancanti (`search`, `plus`, `calendar`, `user`, `qr`) aggiunti al catalogo.

`Hero` è **locale al kit GH**: `AppHeader` non si modifica, perché è usato da pagine fuori perimetro.

Nessuna schermata toccata in questa tappa.

**Tappa 1 — Dashboard.** **Tappa 2 — Scheda cliente.** **Tappa 3 — Form visita condiviso**, usato da modal e rotta.

## Invarianti da verificare a ogni tappa

- zero colori letterali oltre i bianchi di sistema e i tre token nuovi;
- layout uscito dal JSX e finito in CSS — misura prima/dopo di righe e blocchi `style={{`;
- nessun bersaglio tattile sotto 44px sotto i 640px, misurato a 390 e 320;
- `tabular-nums` su tutti i numeri;
- stati completi: caricamento con la geometria della riga vera, vuoto che insegna il gesto, errore che dice cosa resta salvo e **non svuota mai un form**;
- nessuna route nuova, rinominata o rimossa; nessuna query o mutazione modificata; copy semantico invariato — incluso `da gestire`, che resta tale perché non esiste un flag di non letto.

`CustomerPortal.jsx`, `CustomerLogin.jsx`, `CustomerInvite.jsx` e `PublicPetCard.jsx` non si toccano.

## Controprove finali

Le cinque della chiusura dell'handoff CD, più: verifica visiva a 1440, 390 e 320 senza overflow sulle tre superfici; ricerca in Dashboard funzionante; apertura di una scheda; **registrazione di una visita di prova dal gesto reale della scheda, poi rimossa**, e apertura diretta della rotta per provare che il form condiviso regge entrambe; `npm run build` verde.

*(`npm run lint` resta non eseguibile: `eslint` non è installato. Dichiararlo, senza aggiungere dipendenze.)*

## Se qualcosa si rompe

Se un'invariante non è raggiungibile senza toccare flussi, query o route — fermati e dichiaralo. Un'interruzione motivata è una consegna valida; una scorciatoia sul flusso no.

## Chiusura

Registro in `docs/consegne/`, committato insieme al codice. Niente push.
