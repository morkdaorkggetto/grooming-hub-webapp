# GH-103 - Prima degli inviti

## Ordine degli atti rispetto al deploy

**NON ESEGUIBILE: preflight incompleto, nessun rilascio preparato.**
Sequenza prescritta dal mandato, non ricetta operativa gia verificata:

1. Prima di modificare codice/schema: confronto delle impronte demo/produzione.
2. Prima del deploy: atto economico solo additivo, copia verificata e compatibilita
   con le scritture della vecchia app.
3. Deploy di Luigi: app con URL firmati, nuovo accesso ai dati economici e
   correzioni inviti/errori; verifica salvataggi, foto e conti.
4. Dopo il deploy: atto economico di chiusura delle colonne legacy.
5. Dopo deploy e verifica del funzionamento degli URL firmati: atto separato
   che rende privato client-photos.
6. Chiusura delle due policy legacy appointments solo dopo la ricerca dei
   consumer e la controprova del percorso richieste; collocazione da verificare.

**Nessun file di migrazione creato:** nomi definitivi, query post-atto e rollback
non sono ancora consegnabili. Non applicare questa sequenza come ricetta.
Non essendo iniziato alcun atto, non occorre rollback ne ripristino di fixture.

## Interruzione al preflight

Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp/`.
Base `9822fa9985e94bafcf9cbdb6514df53e30f5203e`, branch `main`.
Letto integralmente il mandato locale GH-103 nominato da Luigi.
Accesso consentito solo al demo `qttpinkslhenxrsbhhhg`; nessun accesso alla
produzione, nemmeno in lettura.

**Non e stata osservata una divergenza: manca il termine di confronto prod.**
Il mandato riporta conteggi di produzione, non le impronte dei seguenti
oggetti. Le sei parita comunicate per GH-102 e il riallineamento del 27/9
riguardano altri oggetti: non dimostrano la parita di questa funzione/policy.
Ricerca mirata in mandato, registro GH-102, environment-map, diario (sola
lettura) e intestazione dello script di riallineamento: nessuna impronta
prod corrispondente reperita.

### Impronte demo misurate il 27/9

| Oggetto | MD5 demo | Produzione |
|---|---|---|
| public.complete_appointment_with_visit(text,date,text,text,numeric,uuid) | 96951ebfc651744e0fa1cf0be29821a6 | non fornita |
| public.appointments / appointments_customer_request_insert | 44731e892b0572fffe74dff50465c9bc | non fornita |
| public.appointments / appointments_customer_request_update | 4db2578d99030079105793c1364a8e5d | non fornita |
| storage.objects / Client photos staff select | ed7e8d9ab62c4b47d3ba2037628be5dd | non fornita |

La policy Storage e una dipendenza del percorso firmato, non una modifica gia
decisa. Questo e il nucleo minimo certo del preflight, non una dichiarazione
che nessun altro oggetto sara coinvolto nella soluzione definitiva.
Per le funzioni: MD5 di `pg_get_functiondef`. Per le policy, che non sono
funzioni: espressioni `pg_get_expr`, comando, permissivita e nomi dei ruoli
ordinati; niente OID dipendenti dall'ambiente.

### Passo consigliato a Cowork

Eseguire in produzione questa **sola lettura** e riportarne le quattro righe.
Codex non la esegue sulla produzione. Lo stesso testo e stato usato sul demo:

```sql
select 'function' as kind,
       n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as object,
       md5(pg_get_functiondef(p.oid)) as fingerprint
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='complete_appointment_with_visit'
union all
select 'policy',
       n.nspname || '.' || c.relname || '/' || p.polname,
       md5(jsonb_build_object(
         'command',p.polcmd,'permissive',p.polpermissive,
         'roles',(select jsonb_agg(case when r=0 then 'PUBLIC' else pg_get_userbyid(r)::text end order by case when r=0 then 'PUBLIC' else pg_get_userbyid(r)::text end) from unnest(p.polroles) as roles(r)),
         'using',pg_get_expr(p.polqual,p.polrelid),
         'check',pg_get_expr(p.polwithcheck,p.polrelid)
       )::text)
from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace
where (n.nspname='public' and c.relname='appointments' and p.polname in ('appointments_customer_request_insert','appointments_customer_request_update'))
   or (n.nspname='storage' and c.relname='objects' and p.polname='Client photos staff select')
order by 1,2;
```

Alla ripresa confrontare nuovamente il demo con l'esito prodotto da Cowork:
qualsiasi differenza blocca il lavoro. Prima di toccare ulteriori funzioni o
policy, estendere il confronto anche a quelle. Non dedurre la parita dai
soli nomi, dai file di migrazione o da conteggi coincidenti.

Altro input da fornire per la consegna finale: i **9 percorsi orfani prod**
di client-photos. Il mandato ne indica solo il numero; Codex non puo ricavarli
dal demo o accedere alla produzione. Nessun oggetto Storage da cancellare.

## File, verifiche e limiti

| File toccato | Destino |
|---|---|
| docs/consegne/GH-103-prima-degli-inviti-esito.md | unico file del commit documentale di interruzione |

Mandato GH-103 e tutti i materiali Cowork/Luigi gia esclusi restano immutati,
fuori da stage/commit; cartelle con dati reali non lette. Nessun codice,
migrazione, policy, funzione, account, password o dato applicativo modificato.
Sul demo eseguita **una SELECT di metadati**; zero fixture create, zero residui
di questo giro per costruzione, nessun teardown necessario.

Ricerca iniziale economica sotto src eseguita solo per identificare il target
certo del preflight: non presentata come censimento finale dell'implementazione.
Build, browser e suite RLS non eseguiti: implementazione non iniziata.
Nessun push, merge o deploy. Nessuna attivita fuori mandato.

Tempo misurato dalla ricerca mirata al controllo finale prima della stesura:
**53 secondi**; esclusi lettura iniziale e redazione/commit.
Commit: quello che introduce questo registro, identificabile con
`git log -1 --format=%H -- docs/consegne/GH-103-prima-degli-inviti-esito.md`.

**Stato: interrotto al prerequisito, GH-103 non completato.**

