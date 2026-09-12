# Incarico GH-83 — L'app è del proprietario, e la lingua è del salone

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **solo parole.** Nessuna migrazione, nessuna colonna, nessuna logica, nessuna rotta.
**Trovato da Luigi usando l'app come cliente.** Superficie: `apps/customer/`. **Nessun comportamento cambia.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

Luigi ha guardato la scheda di Rumba dal telefono e ha visto due frasi vicine:

> **«Note del proprietario»** · *«Dopo il prossimo bagno troverai qui la sua foto»*

**La seconda parla a lui. La prima parla di lui, in terza persona** — è la dicitura di una scheda che il salone tiene su un cliente.

> **L'app è del proprietario, ma la lingua è quella dello schedario.** Nessuno chiama sé stesso «il proprietario», e nessuno pensa a sé come a «un cliente» mentre guarda la foto del proprio cane.

Non è un difetto di scrittura: è un'eredità. L'app clienti è nata dallo stesso modello dati del gestionale e **ne ha preso i nomi delle colonne**.

## La voce, decisa da Luigi il 12 settembre

**È il salone che parla al proprietario.** Non un'applicazione che lo descrive, e nemmeno una voce neutra da modulo.

Discende dalla definizione che Luigi ha dato dell'app: *«un servizio e un'interfaccia con il salone»*. Quell'area **è il salone che si affaccia sul telefono di una persona**, ed è il tono che `CD-04` aveva già trovato per il cartoncino.

**La voce esiste già** in tre o quattro punti — l'album, l'invito al ritratto — **e questi non si toccano**: sono il modello.

> *«Dopo il prossimo bagno troverai qui la sua foto»* · *«Metti qui il ritratto di Elliot»* · *«Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto»*

**Estendere quella voce, non inventarne una.**

## L'inventario, misurato il 12/9

Sedici punti in `apps/customer/pages/`:

| file | cosa dice oggi |
|---|---|
| `Pet.jsx` | **«Note del proprietario»** · «Nessuna nota del proprietario.» |
| `Pet.jsx` | **«Anagrafica»** · «Scheda pet» *(due volte)* |
| `Pet.jsx` | «Nessuna visita **registrata**.» |
| `Home.jsx` | «Bentornato, **cliente**» — ripiego quando manca il nome |
| `Home.jsx` | «Non hai ancora un pet **registrato**.» |
| `Home.jsx` | «movimenti **registrati** dal salone» |
| `Redeem.jsx` | «area **cliente**» · «invito **cliente**» · «home **cliente**» · «account **cliente**» *(più volte)* |

**Il caso peggiore è `Redeem`**: è **la prima cosa che una persona legge** dell'app, e la chiama con il nome che il negozio usa nel gestionale — *«Ti portiamo alla home cliente»*.

**E «Bentornato, cliente» è il peggiore in assoluto**: è il saluto a qualcuno di cui non sappiamo il nome, e gli diamo dell'utente. **Se il nome manca, si saluta e basta.**

## Cosa fare

**Riscrivere quei punti nella voce decisa**, e **dichiarare nel registro ogni testo nuovo, per esteso.** Luigi li legge prima che li legga un cliente.

**Direzione, non dettatura** — i testi li scrivi tu:

- **«Note del proprietario»** → sono le note **che quella persona ha lasciato al salone**;
- **«Anagrafica»** → è **quello che il salone sa di quel cane**, non una scheda anagrafica;
- **«registrato»** → il salone non registra: **annota, prende nota, tiene**;
- **«cliente»** → sparisce come modo di chiamare la persona. Resta ammesso solo dove indica **una cosa** e non qualcuno, se proprio serve.

**Nessuna parola nuova inventata per il gusto**: se una frase funziona già, si lascia.

### Cosa non si tocca

**Il comportamento.** Nessuna logica, nessun campo, nessuna condizione. **Se un diff tocca qualcosa che non sia una stringa o la sua formattazione, fermati e dichiaralo.**

**Il lato staff.** Lì «proprietario», «anagrafica» e «cliente» sono **le parole giuste**: è lo schedario, e il salone parla la sua lingua fra sé.

**Le frasi che già hanno la voce giusta**, elencate sopra.

**I messaggi di errore tecnici** che indicano un'azione precisa — «Esci e accedi con l'account personale» — dove la chiarezza vale più del tono. **Ma il contorno di quelle frasi si riscrive lo stesso.**

## Invarianti

**Solo parole.** Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessun comportamento.

**Nessun testo nuovo che prometta qualcosa che non c'è.** È la regola che ha retto da `GH-64` a `GH-69`: non dire che una cosa esiste, o non esiste, quando non lo sai.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-82`.

## Controprove

Dichiara nel registro. **Testi esatti, e una ricerca — non tre esempi.**

- **ricerca esaustiva in `src/apps/customer`** di `proprietario`, `Anagrafica`, `registrat`, `cliente`: **elenca ogni occorrenza rimasta e perché resta**. Riporta il comando. È la regola del canone del 10/9;
- **tutti i testi nuovi, per esteso**, uno per uno;
- **«Bentornato» senza nome**: riporta il testo esatto, e **non contiene «cliente»**;
- **il percorso di riscatto** letto per intero nei suoi sei stati: riporta i testi e verifica che **nessuno chiami la persona «cliente»**;
- **il lato staff è intatto**: ricerca che dimostri che nessuna stringa di `apps/staff` è cambiata;
- **il diff contiene solo stringhe**: dimostralo;
- **le frasi modello sono invariate**: album, invito al ritratto — impronte prima e dopo;
- **a 375px**: i testi nuovi non sbordano e non troncano — **è il caso normale per il cliente**. Riporta i punti più lunghi;
- build verde. **Suite RLS: da non rieseguire.** Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Sul telefono**, e questa volta la prova è di lettura, non di funzionamento:

1. **percorri la scheda di Rumba dall'alto in basso**: c'è ancora un punto in cui l'app parla **di te** invece che **a te**?
2. **rileggi il riscatto**: se fosse la prima cosa che vedi di questo salone, ti sembrerebbe scritta da loro o da un sistema?
3. **e la domanda che conta**: sembra l'area di un negozio che ti conosce, o la tua scheda in un archivio?

**E poi falla leggere a Paola**, che non sa cosa c'era scritto prima.

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-83-l-app-e-del-proprietario-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
