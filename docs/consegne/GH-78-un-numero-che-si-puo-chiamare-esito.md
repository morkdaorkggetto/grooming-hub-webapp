# GH-78 - Un numero che si puo chiamare

## Esito e perimetro

**Concluso.** La migration salva in forma canonica i telefoni utilizzabili
creati dal calendario e recupera soltanto i mobili italiani di dieci cifre.
I valori non normalizzabili restano letteralmente invariati.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`0ec804b876a4f122342cd083d02b029bcac5294c`**;
  stato iniziale pulito.
- Unico database letto e usato: demo `grooming-hub-demo`, ref
  `qttpinkslhenxrsbhhhg`. Produzione **mai letta e mai scritta**.
- La migration e stata provata in una transazione annullata e resta **non
  applicata**: history demo **0 righe**, nessun push, merge o deploy.
- Commit locale: ricavabile con `git log -1 --format=%H --
  docs/consegne/GH-78-un-numero-che-si-puo-chiamare-esito.md` e comunicato a
  Luigi alla chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `supabase/migrations/20260912045446_gh78_normalize_customer_phones.sql` | Funzione corretta, guardia collisioni, backup e backfill selettivo |
| `docs/consegne/GH-78-un-numero-che-si-puo-chiamare-esito.md` | Questo registro, inclusa la SQL di ritorno |
| `docs/consegne/evidenze/GH-78/gh78-demo-transaction.json` | Misure del banco SQL e stato indipendente dopo rollback |
| `docs/consegne/evidenze/GH-78/gh78-rls-result.json` | Esito suite RLS e pulizia |

SHA-256 migration:
`bc7f39ea43b4c9f4b6cfea501b3dbd85685a645718eeceec4a7d4b1a4c8288b4`.

## SQL di ritorno

Questa SQL e stata fissata nel registro **prima** della prima esecuzione della
migration, come richiesto. Rifiuta il ritorno se un valore originale e stato
nel frattempo assegnato a un altro cliente dello stesso tenant o se una riga
da ripristinare non e piu sul valore normalizzato registrato.

```sql
BEGIN;

DO $$
DECLARE
  v_collision_count integer;
  v_changed_after_migration integer;
BEGIN
  SELECT COUNT(*)::integer
  INTO v_collision_count
  FROM public.gh78_customer_phone_backup AS backup
  JOIN public.customers AS other
    ON other.tenant_id = backup.tenant_id
   AND other.id <> backup.customer_id
   AND pg_catalog.regexp_replace(
     COALESCE(public.normalize_phone_it(other.phone), ''),
     '[^0-9]',
     '',
     'g'
   ) = pg_catalog.regexp_replace(
     COALESCE(public.normalize_phone_it(backup.original_phone), ''),
     '[^0-9]',
     '',
     'g'
   );

  IF v_collision_count > 0 THEN
    RAISE EXCEPTION
      'GH78_ROLLBACK_COLLISION: % original phone values are now in use',
      v_collision_count
      USING ERRCODE = '23505';
  END IF;

  SELECT COUNT(*)::integer
  INTO v_changed_after_migration
  FROM public.gh78_customer_phone_backup AS backup
  LEFT JOIN public.customers AS customer ON customer.id = backup.customer_id
  WHERE customer.id IS NULL
     OR customer.tenant_id IS DISTINCT FROM backup.tenant_id
     OR customer.phone IS DISTINCT FROM backup.normalized_phone;

  IF v_changed_after_migration > 0 THEN
    RAISE EXCEPTION
      'GH78_ROLLBACK_DRIFT: % backed-up customers changed after migration',
      v_changed_after_migration
      USING ERRCODE = '40001';
  END IF;
END;
$$;

UPDATE public.customers AS customer
SET phone = backup.original_phone
FROM public.gh78_customer_phone_backup AS backup
WHERE customer.id = backup.customer_id
  AND customer.tenant_id = backup.tenant_id
  AND customer.phone = backup.normalized_phone;

DROP TABLE public.gh78_customer_phone_backup;

COMMIT;
```

La stessa SQL, senza i delimitatori esterni perche gia dentro il banco
rollback-only, ha ripristinato **21/21** valori e rimosso la tabella di
appoggio.

## Implementazione

La funzione calcola tre valori distinti: testo grezzo ripulito ai bordi,
risultato di `normalize_phone_it` e valore da salvare. Il normalizzato viene
usato solo se rispetta `^\+[0-9]{8,15}$`; altrimenti resta il testo grezzo.
La dichiarazione telefono non fornito continua a produrre `NULL`.

Il confronto doppioni, la guardia membership, l'advisory lock, tenant,
insert atomici e valori restituiti sono identici a GH-57. Il confronto
statico della funzione mostra come unica differenza il blocco di
inizializzazione di `v_phone`.

L'atto di dato opera solo sulle righe le cui cifre sono `^3[0-9]{9}$`. Prima
dell'update ricalcola le collisioni per tenant e interrompe con SQLSTATE
`23505`; poi registra `customer_id`, tenant, valore originale, normalizzato e
data nella tabella RLS `gh78_customer_phone_backup`, inaccessibile ai ruoli
client.

## Controprove funzione

| Ingresso | Esito misurato |
| --- | --- |
| `3386191901` | creato come `+393386191901` |
| `+393334567899` | creato identico, senza doppio prefisso |
| `+39 333 456 7890` | creato come `+393334567890` |
| `alfredo` | creato letteralmente come `alfredo` |
| telefono non fornito | riga creata con `NULL` |
| `+393334567892`, poi `3334567892` | seconda chiamata `phone_conflict`, stesso customer, 0 customer e 0 pet aggiuntivi |

Impronta funzione prima
`250c408be153951e71a30457ad979f78`, durante la prova
`87a247fc8d91b03ee5eb543c6ed2cef9`. Firma a 9 argomenti, forma del risultato,
nomi e modi degli argomenti, `SECURITY DEFINER`, `search_path=""` e ACL
`postgres`/`authenticated` risultano uguali prima e durante.

## Controprove dati

Il demo non contiene i 321 record produttivi e partiva da 7 numeri gia in
forma italiana a 12 cifre. Il banco ha aggiunto in transazione le cardinalita
del mandato: **21** mobili recuperabili e **28** testi manuali.

| Misura | Prima | Dopo backfill |
| --- | ---: | ---: |
| Customer | 56 | 56 |
| Pet | 7 | 7 |
| Italiani a 12 cifre | 7 | 28 |
| Mobili a 10 cifre da recuperare | 21 | 0 |
| Altri non null | 28 | 28 |
| Collisioni | 0 | 0 |
| Righe backup | 0 | 21 |

L'impronta dei 28 valori manuali e rimasta
`19cce1cda8339b954ad363926569fe15` prima e dopo. La SQL di ritorno ha
ripristinato 21 righe e tolto la tabella; l'eccezione finale attesa
`GH78_EXPECTED_ROLLBACK` ha poi annullato anche funzione e fixture.

Lettura indipendente finale: **7 customer, 7 pet, 90 visite, 8 appuntamenti**,
fixture GH-78 customer/pet **0/0**, support table assente, history GH-78 **0**,
impronta funzione tornata a `250c408be153951e71a30457ad979f78`.
Whitelist pet invariata a `3a098454689e2d8f94cf077aa4f5933f`; le tre
sonde permanenti GH-74 restano presenti.

## Verifiche, tempi ed eccezioni

- Banco SQL valido: **PASS in 4,0 s**; snapshot indipendente **5,3 s**.
- Sonda letterale separata: **PASS in 5,9 s**, poi rollback con residui 0/0.
- Suite RLS demo: **60 PASS, 0 FAIL, 0 SKIP in 25,85 s**; pulizia a zero.
- `npm run build`: **PASS**, 159 moduli, Vite 1,24 s e **1,62 s reali**.
- `git diff --check`: **PASS**.
- Restano i soli avvisi preesistenti Browserslist e chunk oltre 500 kB.

La prima prova SQL si e annullata prima delle asserzioni per una firma
abbreviata errata usata nella sola introspezione della whitelist; la firma
reale senza argomenti e stata poi usata nel banco valido. Una prima lettura
post-sonda conteneva una parentesi SQL mancante; la richiesta e stata
respinta senza scritture e ripetuta correttamente. Il primo avvio RLS
nel sandbox non risolveva il DNS del demo (`ENOTFOUND`); la stessa suite con
rete autorizzata e passata integralmente. Nessun residuo in entrambi i casi.

Nessuna UI, rotta, dipendenza o altro file applicativo e stato modificato.
Nessuna attivita fuori istruzione.

## Indicazione operativa a Cowork

Prima dell'applicazione in produzione ricontare, dentro la transazione, le
tre classi `272 / 21 / 28` e confermare collisioni `0`; se una cardinalita o
una collisione diverge, interrompere senza update. Dopo l'applicazione
verificare backup `21`, classe utilizzabile `293`, manuali `28` con impronta
invariata, metadati della funzione e conteggi customer/pet. Conservare la
tabella di appoggio fino alla verifica di Luigi.

## Passo finale Luigi

Dopo applicazione e rilascio, contare i customer con numero utilizzabile: il
traguardo e **293**, partendo da 272. I 28 valori manuali restano una coda
esplicita per Davide.
