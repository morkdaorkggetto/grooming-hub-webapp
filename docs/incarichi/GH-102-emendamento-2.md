# Emendamento 2 a GH-102 — Cosa può raggiungere un cliente

**Da:** Luigi · **Per:** Codex · **Data:** 27 settembre 2026
**Corregge** il mandato e l'Emendamento 1 in un punto solo: **l'invito inoltrato non è più un motivo per fermarsi.** Il resto vale parola per parola.

## Cosa è stato deciso

Il riscatto di un invito inoltrato a un account senza scheda — osservato da te il 27/9 — **è un rischio accettato, per scelta consapevole di Luigi.**

Il motivo è misurato: **dei 347 clienti ancora senza account, nessuno ha un'email.** L'unica identità che il salone conosce è il telefono. Legare l'invito all'email non si può fare, e verificare il telefono richiede un fornitore di SMS che oggi non c'è.

**Quindi il link resta una chiave al portatore**, e se ne riduce il danno:

- la **validità** degli inviti nuovi è passata **da 30 a 7 giorni**, applicata da Cowork in produzione il 27/9;
- il **messaggio WhatsApp** dirà che il link è personale;
- il **salone vedrà** chi si è collegato a quale scheda, e potrà scollegarlo.

Gli ultimi due pezzi entrano nel mandato di correzioni che verrà **dopo** questo audit. **La verifica via SMS resta la cura**, quando si sceglierà un fornitore di messaggi.

## Cosa cambia per te

**Questo caso non ti ferma più.** È registrato e deciso. Se lo reincontri — per esempio variandolo — **annotalo e prosegui**.

**Ti fermi ancora**, come da Emendamento 1, se trovi un modo **diverso** per leggere o scrivere dati di un altro cliente: uno che **non** richieda di avere in mano un link valido destinato a quella persona.

> La distinzione è questa: **avere la chiave di qualcuno** è il rischio accettato. **Entrare senza chiave** è un difetto, e lì ti fermi.

## Cosa resta da fare

Le parti ancora non percorse:

- le **funzioni sulle richieste altrui**: `respond_appointment_request_slot` e `withdraw_appointment_request` chiamate da un cliente su una richiesta di un altro;
- gli **altri casi degli inviti**: usato due volte, scaduto, aperto con un'altra sessione già nel browser;
- il **confine staff/cliente**: porta chiusa o porta finta;
- **quello che la suite RLS non copriva**, e **cosa non hai potuto stabilire**.

## Cosa consegnare

Lo stesso registro, **completo**. In cima la risposta secca:

> **possiamo invitare trecentoventi persone senza che nessuna di loro veda qualcosa di qualcun altro — salvo chi riceve un link che non era suo?**

E sotto, **l'elenco completo di quello che va corretto prima del lancio**, in ordine di gravità.
