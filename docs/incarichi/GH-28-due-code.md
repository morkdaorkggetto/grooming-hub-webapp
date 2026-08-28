# Incarico GH-28 — Due code: la porta sbagliata e la premialità che declassa

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026

> Mandato corto. Due riparazioni indipendenti, entrambe misurate, **entrambe individuate da Cowork e non portate nel mandato GH-27**: sono una dimenticanza di chi scrive, non un residuo di chi esegue.
>
> Dichiara le invarianti, non la procedura.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Database ammesso: solo il demo**; produzione e progetto temporaneo vietati.

---

## 1. Il cliente autenticato finisce nel portale vecchio

**Misurato**: in `src/apps/staff/StaffApp.jsx` due punti mandano a `/portal` chiunque sia autenticato e non risulti operatore — la guardia di rotta e il calcolo della destinazione predefinita.

Finché la radice del sito portava a `/u/login`, un cliente non attraversava mai il gestionale e quel comportamento non si vedeva. **Da GH-25 la radice porta a `/login`**, quindi è diventato il percorso normale per un cliente che digita l'indirizzo o lo ha nei preferiti: viene preso in carico dal gestionale, riconosciuto come non-operatore, e spedito nel **portale di maggio** — quello che abbiamo deliberatamente escluso dal restyling. Ci finisce anche Codex durante le verifiche locali.

**Invarianti**: un cliente autenticato che raggiunge una qualunque rotta del gestionale arriva **all'app clienti nuova**, non al portale vecchio. Chi non ha alcun ruolo riconosciuto continua a essere trattato come oggi.

**Il portale vecchio non si tocca e non si rimuove**: le sue rotte restano raggiungibili, perché inviti già spediti e QR già stampati devono continuare a risolvere. Cambia soltanto **dove viene mandato chi non ha chiesto di andarci**.

**Controprove**: sessione cliente su una rotta staff e sulla radice; sessione operatore invariata; sessione senza ruolo invariata; le rotte del portale vecchio ancora raggiungibili scrivendole direttamente.

---

## 2. I punti fedeltà declassano invece di elevare

**Misurato** in `src/apps/staff/lib/fidelity.js`:

```js
const useRewardPoints = rewardPointsTotal > 0;
const achieved = useRewardPoints
  ? rewardPointsTotal >= tier.pointsRequired
  : visitsInWindow >= tier.visitsRequired;
```

Appena un cliente ha **anche un solo punto**, le visite smettono del tutto di contare. Un cliente con 30 visite è Argento; dandogli 10 punti come gesto di cortesia scende a **Base**, perché 10 è sotto la soglia di Bronzo, che è 100. **La leva nata per elevare declassa** — e lo fa in silenzio, proprio nel momento in cui il salone voleva fare un complimento.

**L'intento dichiarato da Luigi (28/8)**: i punti servono a *«elevare a piacere il livello di fedeltà senza alterare quello delle visite, che vengono calcolate in automatico»*. Il codice fa l'opposto.

**Misura sulla produzione**: i due soli usi reali sono **500 punti** (soglia esatta dell'Oro) e **150** (poco sopra quella del Bronzo). Nessun cliente è attualmente declassato, ma quelle cifre dicono che il meccanismo viene già usato **per raggiungere un livello**, non per accumulare — quindi il difetto è latente e scatterebbe al primo uso moderato.

**Invarianti**: il livello raggiunto è **il migliore fra i due** — quello ottenuto con le visite nella finestra e quello ottenuto con i punti. **I punti possono solo alzare, mai abbassare.** Il conteggio automatico delle visite continua a funzionare da solo, indipendentemente dai punti.

Restano visibili entrambe le informazioni là dove già compaiono: quante visite mancano al livello successivo, e il saldo punti. **Nessuna soglia e nessun premio inventati**: i benefici dei livelli non sono ancora definiti dal salone, e finché non lo sono nessun testo deve promettere qualcosa.

**Controprove**: cliente con molte visite e pochi punti — il livello **non scende**; cliente con pochi visite e molti punti — il livello sale, e i due casi reali del prod restano Oro e Bronzo; cliente senza punti — comportamento identico a oggi; cliente al confine esatto di una soglia, da entrambe le vie.

---

## Chiusura

Registro in `docs/consegne/`, committato col codice. Fixture rimosse nella stessa sessione con controprova di zero residui. Niente push.
