# Incarico GH-34 — Tre rifiniture dell'interfaccia staff

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Origine:** osservazioni di Luigi sull'app in produzione, la mattina dopo G6.

> Dichiara le invarianti, non la procedura. Tre difetti piccoli, tutti con la causa già misurata: il mandato dice dove guardare, non cosa sembra storto.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun push, nessun merge, nessun deploy. **Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)** — la produzione non va né letta né scritta. Nessuna rotta nuova.

---

## 1 · L'indirizzo e il pulsante «Esci» non sono sulla stessa riga

**Dove**: `Dashboard.jsx` compone `heroRight` con l'indirizzo dell'operatore e il pulsante «Esci» dentro `.gh-hero__right`.

**Causa misurata**: in `gh15-staff.css`, `.gh-hero__right` ha `align-items: flex-start`. L'indirizzo è testo da 11,5px, il pulsante è alto quanto un bersaglio: allineati in cima, il testo resta appeso al bordo superiore invece di stare in asse col pulsante.

**Invariante**: sul banco i due elementi stanno **sulla stessa linea ottica**. Sotto i 640px non cambia nulla: lì `.gh-hero__right` diventa una colonna e `.gh-hero__account` è già nascosto.

---

## 2 · Le righe del report non portano alla scheda del cane

**Dove**: il dettaglio «I cani passati» in `WeeklyRevenue.jsx`, componente `VisitLine` di CD-02.

**Fatto misurato**: la scheda esiste già alla rotta **`/client/:clientId`**, e in questo modello l'identificativo è quello del **pet** — la stessa rotta che apre l'archivio dalla Dashboard. Ogni riga del report porta già `pet_id`. **Nessuna rotta nuova serve.**

**Invarianti**:

- da ogni riga si arriva alla scheda del cane;
- **la riga resta una riga**, non diventa un pulsante: il bersaglio è l'intera riga, e l'aspetto non cambia se non per un accenno al passaggio del mouse e uno stato di fuoco visibile da tastiera;
- **anche le righe che raccontano un'assenza sono raggiungibili**: il cane esiste pure se quel giorno non è venuto;
- la pagina resta in **sola lettura**: se ti trovi a scrivere, ti sei perso.

---

## 3 · Il ritorno alla pagina iniziale manca dove serve

**Misurato su tutte le pagine staff.** Hanno il ritorno alla Dashboard: Calendario, Scheda cliente, Scheda pet, Richieste clienti, Operatività giornaliera, Come è andata. **Non ce l'hanno: Contatti, Nuovo cliente, Nuova visita.** Le altre senza pulsante — login, reimposta password, scheda pubblica del cane, portale legacy — non devono averlo.

Su Contatti il posto è occupato da «Nuovo contatto», e ogni pagina che aggiunge un'azione propria si porta via il ritorno. Aggiungere un pulsante caso per caso ripara oggi e si rompe di nuovo alla prossima pagina.

**La soluzione è nel componente, non nelle pagine.** `Hero`, in `StaffKit.jsx`, stampa `Grooming Hub` come occhiello su **ogni** pagina staff.

**Invarianti**:

- **l'occhiello «Grooming Hub» riporta alla Dashboard da qualunque pagina staff**, senza togliere spazio alle azioni di pagina;
- è un collegamento vero — raggiungibile da tastiera, apribile in una scheda nuova, con un nome comprensibile a chi non vede lo schermo. Non un `div` con un `onClick`;
- **sulla Dashboard stessa non è un collegamento**: un rimando alla pagina in cui sei già è rumore;
- **non compare dove non deve**: login, reimposta password e scheda pubblica del cane non portano a una Dashboard che il visitatore non può vedere. Se `Hero` è usato anche lì, distinguilo;
- l'aspetto dell'occhiello **non cambia** finché non ci si passa sopra. Questa è una rifinitura, non un nuovo elemento.

Fatto questo, **non aggiungere pulsanti «Dashboard» a Contatti, Nuovo cliente e Nuova visita**: sarebbero due strade per la stessa cosa.

---

## Controprove

Dichiara nel registro, misurate sul demo:

- indirizzo e «Esci» in asse sul banco, e invariati sotto i 640px;
- una riga del report che apre la scheda del cane giusto, **provata dal gesto**, non dedotta dal codice; e una riga di assenza che fa lo stesso;
- l'occhiello che riporta alla Dashboard da **Contatti, Nuovo cliente e Nuova visita**, provato da tutte e tre;
- l'occhiello **non** cliccabile sulla Dashboard e **non** presente dove non deve;
- percorso da tastiera verificato su almeno una delle due novità;
- build verde; suite RLS invariata — nessuno di questi tre tocca le policy, e se le tocca hai sbagliato strada.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Se qualcosa non torna

Se una delle tre cause misurate non corrisponde a quello che trovi nel codice, **fermati e dichiaralo**: la misura è mia e va corretta, non aggirata.

## Chiusura

Registro in `docs/consegne/`, committato col codice. **Niente push, niente merge, niente deploy**: sono gesti di Luigi.
