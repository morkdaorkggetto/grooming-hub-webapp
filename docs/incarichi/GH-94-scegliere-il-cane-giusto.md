# Incarico GH-94 — Scegliere il cane giusto

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 14 settembre 2026
**Forma breve (regola 4).** Superficie sola: `apps/staff/components/CalendarKit.jsx` e chi gli passa le opzioni. **Nessuna migrazione, nessuna colonna, nessuna rotta.**
**Nasce da una domanda di Luigi**: come si associa il cane giusto quando arriva al banco, se del proprietario si conosce solo il cellulare.

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

Misurato in produzione il 14/9: **24 famiglie hanno più di un cane**, per **53 cani** in tutto, fino a tre a testa. Dentro una stessa famiglia **nessun cane ha lo stesso nome di un altro** — quindi nell'app del proprietario la scelta funziona.

**Al banco no.** Il selettore del pet mostra due sole cose:

```jsx
// CalendarKit.jsx:295-296
<strong>{pet.name}</strong>
<span>{pet.owner || 'Proprietario non indicato'}</span>
```

Su quei 53 cani: **12 hanno per nome una razza**, **7 hanno cifre nel nome** (`tassista 1`, `tassista 2`), e **132 clienti su 327 hanno per nome un numero di telefono**. Il risultato a schermo, per una famiglia così:

> **barboncino** · 3296167453
> **Barboncino** · 3296167453

**La razza è già nei dati e viene già usata per filtrare** — riga 184 — **ma non viene mostrata.** Nel momento in cui bisogna scegliere, l'app nasconde le informazioni che ha.

> **Non è un problema di dati sporchi: è che il dato pulito non arriva agli occhi.** La razza c'è per 52 di quei 53 cani.

## Cosa fare

**Ogni voce dell'elenco dice abbastanza da scegliere senza indovinare.**

Oltre a nome e proprietario, mostra:

- **la razza**, che c'è quasi sempre ed è il primo discriminante reale;
- **la foto di riconoscimento del salone** — `pets.photo_url`, quella che serve *«per identificare il pet da un particolare o da un difetto»*. Il componente esiste: `shared/ui/PetAvatar`, già usato nel modale del calendario;
- **l'ultima volta che è passato**, se il dato è disponibile senza una lettura in più. **Se non lo è, non aggiungerla e dichiaralo**: non vale una query per riga.

**Quando la foto manca — ed è il caso di 48 su 53 — l'elenco non deve mentire**: l'iniziale al posto della foto, come fa già `PetAvatar`. E **non deve suggerire di caricarla da lì**: non è il momento giusto, si sta cercando un cane, non si sta compilando una scheda.

**La ricerca non cambia**: filtra già su nome, proprietario, telefono e razza.

### Dove vale

**In tutti i punti che usano quel selettore.** Trovali con una ricerca e dichiarali: sono almeno il nuovo appuntamento e la registrazione della lavorazione.

**Se un chiamante non passa la foto o la razza fra le opzioni, va sistemato lì** — ma è una riga di dati, non una lettura nuova. **Se ti accorgi che servirebbe una lettura in più, fermati e dichiaralo** invece di aggiungerla.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Nessuna lettura nuova, nessuna query per riga.** Se il numero di letture all'apertura del modale cambia, ti sei perso.

**La foto di riconoscimento resta del salone**: non compare in nessuna superficie cliente, e non si tocca `src/apps/customer`. È l'invariante di `GH-77` e `GH-79`.

**Il comportamento di scelta non cambia**: stessi tasti, stessa ricerca, stessa creazione al volo.

**Nessun colore nuovo, nessuna geometria nuova** oltre a quella della voce d'elenco, e **nessun bersaglio sotto i 44px**. Restano gli invarianti di `GH-54` → `GH-93`, compresa l'eccezione dichiarata da `GH-87`.

## Controprove

Dichiara nel registro. **Testi e misure.**

- **la voce d'elenco nei quattro casi**: con foto e razza; senza foto; senza razza; senza né l'una né l'altra. Riporta cosa si vede, con prove a schermo;
- **due cani della stessa famiglia con nomi quasi uguali e proprietario che è un numero**: la prova a schermo che **adesso si distinguono**. È il caso che ha generato il mandato;
- **le letture**: quante all'apertura del modale prima e dopo. **Devono coincidere**;
- **tutti i punti che usano il selettore**: elencali con una ricerca, comando riportato, e misura ciascuno;
- **la ricerca funziona come prima**: per nome, proprietario, telefono e razza. Quattro prove;
- **`src/apps/customer` non ha diff**: dimostralo;
- **la foto di riconoscimento non compare in nessuna superficie cliente**: ricerca esaustiva, come in `GH-79`;
- **a 375px e a 1365px**: nessuno sbordamento, nessun troncamento, nessun bersaglio sotto i 44px. **Con dodici risultati aperti**, che è il massimo che l'elenco mostra;
- **le altre pagine staff**: impronte, come in `GH-92` e `GH-93`;
- build verde. **Suite RLS: da non rieseguire**, nessun dato né permesso toccato. Ultima misura viva: `GH-91`, **60 PASS del 13/9**.

## Passo finale — lo guarda Luigi (regola 5)

Sul gestionale, cercando una famiglia con due cani:

1. **li distingui senza aprire le schede?**
2. **e con la foto assente**, che è il caso di quasi tutti: hai comunque abbastanza?
3. **e la domanda che conta**: Roby riuscirebbe a scegliere **con il cane davanti e le mani bagnate**, o deve fermarsi a controllare?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

**Le foto mancano: 48 su 53.** Nessun mandato può inventarle. Questo giro fa in modo che, quando ci sono, servano — e che intanto la razza basti quasi sempre. Il resto è lavoro di cinque secondi per cane, al banco, e va chiesto a Davide come cosa finita: **quarantotto foto, non un'abitudine nuova.**

**E il gadget con il QR chiude la questione all'arrivo**: si legge la medaglietta e si apre la scheda di quel cane, senza scegliere niente.

## Chiusura

Registro in `docs/consegne/GH-94-scegliere-il-cane-giusto-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
