# GH-114 — Misure del prodotto, allegato all'audit

**Da:** Cowork · **Per:** Codex, e il mandato d'audit GH-114 che verrà dopo GH-113
**Misurate nel prodotto** (`azgehoseiojodltcttfb`, salone `0211c475-…`) il **4/11/2026 alle 17:23:55 Europe/Rome**, in sola lettura. Solo conteggi: nessun nome, telefono o dato personale.

## I numeri

| Misura | Valore | Cosa racconta |
|---|---:|---|
| proprietari | 400 | |
| cani | 431 | |
| **proprietari senza nessun cane** | **2** | invisibili nel gestionale, e il loro numero blocca la creazione di un cliente nuovo (caso di Vittoria, 4/11) |
| **contatti in rubrica «convertiti» che non puntano più a nessuna scheda** | **5** | la scheda a cui erano collegati **è stata eliminata**: sono 5 eliminazioni di cani **oltre** a quella del 4/11, che Cowork ha già ricreato e ricollegato e che quindi non è in questo conto |
| appuntamenti completati senza visita collegata | 45 | per lo più visite registrate a parte, nello stesso giorno: modo legittimo di lavorare |
| … e senza nessuna visita del cane in quel giorno | 2 | Zac (30/10) e Dudù (8/9), già segnalati a Davide |
| appuntamenti ancora «programmati» con data passata | 0 | la rete di `GH-98` funziona |
| visite senza appuntamento collegato | 497 | storico e visite registrate senza agenda: non è un difetto in sé, ma rende ambigua la riconciliazione agenda/visite |
| nomi di cani con spazi in testa o in coda | 29 | es. «Leo » (`GH-112`) |
| nomi di cani usati da più di un cane | 74 | rischio di confusione nei selettori e nelle chiusure |
| stesso nome, stesso proprietario | 0 | |
| cani il cui nome è un numero di telefono | 4 | |
| proprietari il cui nome è un numero di telefono | 122 | il foglio `nomi-da-recuperare` di settembre è ancora quasi tutto da fare |
| appuntamenti annullati | 31 | lo stato `cancelled` è già in uso |
| appuntamenti futuri aperti | 87 | |

## La query

```sql
with t as (select '0211c475-1bc4-4f3f-a212-2f94e440ed2f'::uuid id)
select now() at time zone 'Europe/Rome' misurato,
 (select count(*) from customers c, t where c.tenant_id=t.id and not exists (select 1 from pets p where p.customer_id=c.id)) proprietari_senza_cani,
 (select count(*) from customers c, t where c.tenant_id=t.id) proprietari,
 (select count(*) from pets p, t where p.tenant_id=t.id) cani,
 (select count(*) from appointments a, t where a.tenant_id=t.id and a.status='completed' and not exists (select 1 from visits v where v.appointment_id=a.id)) completati_senza_visita_collegata,
 (select count(*) from appointments a, t where a.tenant_id=t.id and a.status='completed' and not exists (select 1 from visits v where v.appointment_id=a.id) and not exists (select 1 from visits v where v.pet_id=a.pet_id and v.date=(a.scheduled_at at time zone 'Europe/Rome')::date)) completati_senza_visita_quel_giorno,
 (select count(*) from appointments a, t where a.tenant_id=t.id and a.status='scheduled' and a.scheduled_at < date_trunc('day', now() at time zone 'Europe/Rome') at time zone 'Europe/Rome') programmati_nel_passato,
 (select count(*) from visits v, t where v.tenant_id=t.id and v.appointment_id is null) visite_senza_appuntamento,
 (select count(*) from pets p, t where p.tenant_id=t.id and p.name <> btrim(p.name)) nomi_con_spazi,
 (select count(*) from (select lower(btrim(name)) from pets p, t where p.tenant_id=t.id group by 1 having count(*)>1) x) nomi_condivisi,
 (select count(*) from (select customer_id, lower(btrim(name)) from pets p, t where p.tenant_id=t.id group by 1,2 having count(*)>1) x) stesso_nome_stesso_proprietario,
 (select count(*) from contacts ct, t where ct.tenant_id=t.id and ct.status='converted' and ct.linked_pet_id is null) contatti_convertiti_senza_scheda,
 (select count(*) from pets p, t where p.tenant_id=t.id and p.name ~ '^[0-9 +]{6,}') nomi_cane_numerici,
 (select count(*) from customers c, t where c.tenant_id=t.id and c.first_name ~ '^[0-9 +]{6,}$') proprietari_nome_numero,
 (select count(*) from appointments a, t where a.tenant_id=t.id and a.status='cancelled') annullati,
 (select count(*) from appointments a, t where a.tenant_id=t.id and a.status='scheduled' and a.scheduled_at > now()) futuri_aperti;
```

## Nota — rettificata da Cowork alle 17:40 dello stesso giorno

**I 5 contatti orfani.** Una seconda misura ha controllato, per ciascuno, se con lo stesso telefono esiste oggi un cane: **sì, per tutti e 5**, con lo stesso nome o quasi («Ziku» → «Ziky», «Whihky» → «Whisky »). Quindi la scheda eliminata era, con ogni probabilità, **un doppione**, e il cane è ancora in archivio. Restano però 5 eliminazioni di cui non si sa né quando né cosa abbiano portato via, ed è proprio quello che il registro di `GH-113` renderà leggibile.

**I 2 proprietari senza cani** non sono clienti veri: sono due record di prova o di appoggio, con «telefoni» non validi (`+39Alfredo3`, `+395555`) e nomi come «Cane da modificare». Non bloccano nessun cliente reale. La loro pulizia è una decisione di Luigi e Davide, non di questo audit.
