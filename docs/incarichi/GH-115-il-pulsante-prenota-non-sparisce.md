# Incarico GH-115 — Il pulsante della prenotazione non sparisce

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.3.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 10 novembre 2026
**Base:** `4c37771` (GH-113 nel prodotto).

**Perimetro:** `src/apps/customer/pages/Book.jsx` e `src/apps/customer/pages/Book.css`. Nient'altro.

**Database**, nelle tre categorie del canone:

- **lettura del demo:** ammessa;
- **dati di prova temporanei sul demo:** ammessi solo per la controprova dell'invio (una richiesta di prova), con ripristino verificato e conteggi nel registro;
- **qualunque accesso al prodotto:** no.

Nessuna migrazione, nessun push, merge o deploy.

## Da dove nasce

Il 9/11 alle 16:12 il primo cliente vero ha attivato l'app dall'invito: account creato e collegato correttamente alla scheda del suo cane. Dalle 16:13 alle 16:20 ha aperto **otto volte** `/u/book`, ma il suo telefono non ha mai inviato una richiesta. Al salone ha detto che **non compariva il pulsante per prenotare**.

Nel codice alla base:

- sotto i 640px la colonna di riepilogo è nascosta (`.gh-book-summary-column { display: none; }`);
- il pulsante mobile `gh-book-mobile-submit` viene **renderizzato solo se `canSubmit` è vero** (`Book.jsx`, `{canSubmit ? (<button …>) : null}`);
- `canSubmit` chiede cane, servizio, data aperta, una fascia non chiusa, **almeno una voce del passo 4 o una nota** e, **se il cane non ha la data di nascita, l'età dichiarata**;
- il cane del cliente non ha la data di nascita: gli era chiesta anche l'età.

Sul telefono, quindi, finché manca un campo non c'è **nessun pulsante e nessun avviso**. Il cliente crede che l'app sia rotta.

## Cosa fare

Decisione di Luigi: **il pulsante non sparisce mai; quando i dati non sono completi è grigio e non attivo.**

1. **Il pulsante mobile c'è sempre**, nella stessa posizione fissa di oggi, anche con il modulo vuoto. Se mancano dati è disattivato (`disabled`) e ha l'aspetto disattivato che il CSS ha già (`.gh-book-mobile-submit:disabled`). Quando tutto è compilato si attiva, senza salti di layout.
2. **Dice cosa manca.** Vicino al pulsante, sia su mobile sia nel riepilogo desktop, una riga breve elenca i campi mancanti nell'ordine dei passi. Per esempio: «Manca: l'età di Fred, come sta il pelo». Quando non manca niente, la riga sparisce. Le parole proponile tu, nel tono della pagina.
3. **Un tocco sul pulsante grigio non resta muto.** Toccandolo, la pagina scorre al primo campo mancante. Se il pulsante `disabled` non può ricevere il tocco, scegli tu come ottenerlo (per esempio `aria-disabled` al posto di `disabled`) e dichiaralo; l'invio deve comunque restare impossibile finché `canSubmit` è falso.
4. **Niente copre il modulo.** Con il pulsante sempre presente, l'ultimo campo (la nota del passo 4) e l'eventuale errore d'invio devono restare visibili sopra il pulsante e sopra la barra delle schede. Verifica il padding in fondo a `.gh-book-page`.
5. **L'accessibilità resta.** Il pulsante disattivato si annuncia come tale, e la riga «Manca:» è leggibile da uno screen reader.

**Invarianti.** Le regole di `canSubmit` non cambiano: età e passo 4 restano obbligatori. Nessun colore nuovo e nessuna classe tipografica scritta a mano: usa i token e le classi del design system. Il desktop resta com'è, salvo la riga «Manca:» nel riepilogo.

## Controprove

Dichiara nel registro testi esatti e misure.

- **A 375px**, modulo vuoto: il pulsante si vede, è grigio, e un tocco porta al passo 1.
- **Cane senza data di nascita**: con tutto compilato tranne l'età, la riga dice cosa manca e un tocco porta al campo dell'età.
- **Tutto compilato tranne il passo 4**: la riga lo dice e un tocco porta al passo 4.
- **Tutto compilato**: il pulsante si attiva e l'invio crea una richiesta. È dato di prova sul demo: va rimosso e i conteggi tornano a zero.
- **A 375px e a 1365px**: nessuno sbordo, e l'ultimo campo e l'errore non finiscono sotto il pulsante.
- **Build verde.**

## Chiusura

Registro in `docs/consegne/GH-115-il-pulsante-prenota-non-sparisce-esito.md`, committato insieme al codice. Niente push, niente merge, niente deploy.
