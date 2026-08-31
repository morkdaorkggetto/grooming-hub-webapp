# Incarico GH-47 — I dati per chiudere le controprove di GH-46

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 30 agosto 2026
**Origine:** proposta di Codex nel registro `GH-46`, §«Soluzione consigliata a Cowork».

> **Forma breve, mandato di soli dati.** Nessuna modifica al codice, nessuna migration. Serve solo a rendere eseguibili due prove che `GH-46` chiedeva e che sul demo, allo stato, **non erano eseguibili**.

**Perimetro**: root dichiarata nel registro. **Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)**; la produzione non va né letta né scritta. Nessun push, merge o deploy. **Nessun file di codice modificato**: se ti trovi a cambiare un sorgente, ti sei perso.

## Perché serve

`GH-46` chiedeva due controprove vive che sul demo non erano possibili:

- **il messaggio d'invito per un cliente con nominativo numerico** — la misura iniziale ha trovato 7 clienti e **zero** nominativi composti da sole cifre. Il caso da dimostrare non esisteva;
- **la suite RLS completa** — la sonda staff di `GH-04` risulta **interamente smontata**: 0 utenti Auth, 0 profili, 0 membership. La suite si è fermata al bootstrap con `invalid_credentials`, **prima di qualunque scrittura**, restituendo `0 PASS, 1 FAIL`.

Codex ha rifiutato di riseminare la sonda perché `GH-46` non lo autorizzava, e non ha cercato strade alternative. **È il comportamento giusto**, ed è la ragione per cui questo mandato esiste invece di un aggiustamento improvvisato.

## Cosa è autorizzato — nominativamente

1. **Riapplicare il seed `GH-04` già versionato**, in modo idempotente, per riportare in vita la sonda staff del demo.
2. **Creare un cliente usa-e-getta con nominativo composto da sole cifre** e un cane collegato, entrambi marcati **`[DEMO GH-46]`**, con identificativi deterministici.
3. **Generare un solo invito dall'interfaccia**, leggere l'indirizzo `wa.me` precompilato e riportarne il testo nel registro.
4. **Rieseguire la suite RLS** per intero.
5. **Cancellare** invito, cane, cliente e sonda, con conteggi finali a zero.

Nient'altro. In particolare: nessun account reale toccato, nessun dato di produzione, nessuna modifica al codice consegnato con `GH-46`.

## Invarianti

**Le prove dimostrano ciò che GH-46 afferma.** In particolare, il messaggio generato per il cliente numerico **non deve contenere quel numero come saluto**, deve nominare **il salone** e **il cane**, e dichiarare la durata del collegamento.

**Il testo del messaggio va riportato per intero nel registro**, così com'è, perché la prova finale è che Luigi lo legga come lo leggerebbe chi lo riceve.

**Tutto ciò che crei porta un marcatore riconoscibile** e identificativi deterministici: se la sessione si interrompe prima dello smontaggio, deve essere possibile trovare i residui cercando una stringa sola.

**Primo e ultimo atto sono due conteggi**: quante righe esistono prima, quante dopo, sulle tabelle toccate — `auth.users`, `profiles`, `tenant_memberships`, `customers`, `pets`, `customer_invitations`. **Devono coincidere.**

**Se lo smontaggio non riesce**, non chiudere il mandato: dichiara cosa è rimasto e dove.

## Controprove

Nel registro, misurate:

- conteggi prima e dopo, tabella per tabella, **coincidenti**;
- il **testo integrale** del messaggio WhatsApp generato per il cliente numerico;
- la conferma che quel testo non contiene il nominativo numerico come saluto;
- suite RLS completa, con il numero di casi passati;
- residui `GH-46` e `GH-47`: **zero**.

## Passo finale — lo guarda Luigi (regola 5)

Il testo riportato nel registro va letto da Luigi **come lo leggerebbe un cliente che riceve un messaggio da un numero che forse non ha in rubrica**. Se sembra una truffa, non è pronto — e lo dice lui, non la suite.

## Chiusura

Registro in `docs/consegne/`, committato. Niente push, niente merge, niente deploy.
