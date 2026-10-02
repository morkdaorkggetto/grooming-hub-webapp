# CD-11 — La tessera apre l'app

**Da:** Luigi · **Per:** Claude Design · **Data:** 2 ottobre 2026
**Nasce da:** `CD-10` e `GH-108`, pubblicati il 2/10. Luigi ha provato la tessera sul telefono.
**Esito atteso:** composizione, non codice. Consegna in `docs/consegne/CD-11-consegna/` (o nella cartella `Prototipo/` come per CD-10), nella stessa forma: tela, kit, handoff.

## La decisione

Provando la tessera sul telefono Luigi l'ha trovata **in fondo alla Home**, sotto la scheda di una richiesta, al posto del vecchio blocco «Punti» come da CD-09. Prima di CD-09 aveva chiesto che fosse **«individuabile facilmente sul telefono»**.

**Decisione di Luigi del 2/10: la tessera diventa la pagina con cui si apre l'app**, per chi ha un cane solo. Chi ne ha più d'uno apre la Home, all'altezza delle tessere.

## Il problema che questa scelta apre

La Home oggi è anche il posto dove il proprietario trova **le cose che aspettano lui**. Nella Home vera di Luigi, il 2/10, c'era «**Richiesta da riprogrammare** — La data chiesta per Rumba non è disponibile. Scegli un'altra data e riproviamo.». Se l'app si apre sulla tessera, quella richiesta resta nascosta, e il salone aspetta senza saperlo.

**Quindi, sulla tessera, quando c'è qualcosa da fare, compare un avviso che porta lì.** Solo allora: quando non c'è niente da fare, la tessera è come in CD-10.

## Cosa c'è da fare, oggi

Sono i casi in cui la Home mostra una scheda che **chiede un gesto al proprietario** (`apps/customer/pages/Home.jsx`, letto da Cowork il 2/10):

| Caso | Cosa chiede oggi la Home |
|---|---|
| il salone ha proposto altri orari | scegliere uno degli orari proposti, oppure chiedere un'altra data (`PendingRequest`) |
| la data chiesta non è disponibile | «Scegli un'altra data» |

**Non sono «da fare»**: una richiesta in attesa del salone, un appuntamento confermato. Lì il proprietario aspetta, non agisce. La definizione esatta la prende Codex dal codice; tu componi l'avviso per i due casi sopra, sapendo che **possono essere più d'uno insieme**.

## Cosa ti chiediamo

1. **L'avviso sulla tessera.** Dove sta, come si legge, cosa dice nei due casi, e quando sono più d'uno. Un tocco porta al posto dove si agisce. **Non deve rubare la scena alla tessera**, ma non deve nemmeno potersi ignorare: è l'unico modo in cui il proprietario sa che il salone aspetta lui.
2. **Il ritorno alla Home.** Oggi dalla tessera si torna alla Home con il pulsante indietro della testata (CD-10 §7.2). Se la tessera diventa la prima pagina, «indietro» non ha più senso: **ripensa la testata**. La barra resta a tre voci (CD-09 §7.10): decidi se e come la tessera ci entra senza diventare una quarta voce.
3. **La Home**, adesso che non è più la prima pagina: rivedila solo se la scelta lo richiede, per esempio la striscia della tessera che oggi chiude la pagina.

## Cosa non cambia

- **Tutto CD-10**, tessera e griglia comprese, salvo la testata se la ripensi.
- **La modalità banco.**
- **Nessun colore nuovo.** Le sedici voci del §7 di CD-09.

## Consegna

Tela, kit e handoff, con la **tabella prima → dopo** e i valori, come CD-10. Dichiara a parte **cosa non torna**.
