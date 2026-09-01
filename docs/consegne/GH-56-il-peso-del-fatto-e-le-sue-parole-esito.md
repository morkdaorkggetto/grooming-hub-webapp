# Consegna GH-56 - Il peso del fatto e le sue parole

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `347a216` (`GH-56: il peso del fatto e le sue parole`).
- Nessun database letto o scritto.
- Nessun push, merge, deploy, nuova rotta, migration, policy o query.

## Esito

Le lavorazioni gia avvenute restano distinguibili dagli appuntamenti, ma
arretrano nella gerarchia: piede settimanale e righe del modo giorno usano la
stessa velatura chiara del margine, con testo secondario e punto nell'accento
esistente. Gli appuntamenti conservano contorno, barra d'accento e testo
primario e risultano quindi piu agibili e visivamente piu importanti.

Il lessico della vista usa soltanto `lavorato/lavorati sul momento` per il
passato, `chi arriva` per il margine futuro e `senza ora fissata` nel dettaglio
giornaliero. Le precedenti formule definite per sottrazione sono state rimosse
dall'intera app staff e non compaiono nell'app clienti.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Sostituisce le quattro formule con singolare, plurale e tempi verbali deliberati. |
| `src/apps/staff/pages/Calendar.css` | modificato | Fa arretrare piede e righe del fatto usando velatura, testo e accento gia esistenti. |
| `docs/consegne/GH-56-il-peso-del-fatto-e-le-sue-parole-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna. I due file del banco browser locale
con fixture in memoria sono stati rimossi prima della chiusura.

## Scostamento sostitutivo da GH-55

La voce 3 di GH-55 e **sostituita**, non affinata. Il fatto non usa piu il
neutro forte pieno: conserva una campitura, ma adotta la velatura chiara del
margine e il testo secondario. Il materiale in
`design_handoff_staff_app/` continua a documentare la resa scura superata.

## Controprove

| Prova | Misura | Esito |
| --- | --- | --- |
| Campione del fatto | Sfondo `rgba(111, 151, 146, 0.06)`; testo `rgb(127, 111, 115)` | PASS |
| Campione del piano | Sfondo trasparente; testo `rgb(43, 37, 37)`; barra d'accento conservata | PASS |
| Gerarchia | Il fatto usa esattamente lo sfondo del margine e non introduce campiture piu scure della veste precedente a GH-55 | PASS |
| Riepilogo, singolare/plurale | `1 lavorato sul momento`; `5 lavorati sul momento` | PASS browser |
| Piede, singolare/plurale | `1 lavorato sul momento`; `5 lavorati sul momento` | PASS browser |
| Modo giorno, singolare/plurale | `Lavorati sul momento - 1 pet, senza ora fissata`; stessa formula con `5 pet` | PASS browser |
| Margine, singolare/plurale | `1 libera per chi arriva`; `5 libere per chi arriva` | PASS browser |
| Lessico staff rimosso | 0 occorrenze case-insensitive di `entrat`, `nessuna ora`, `chi entra` sotto `src/apps/staff/` | PASS |
| Lessico ammesso | Presenti solo `lavorato/lavorati sul momento`, `chi arriva`, `senza ora fissata` | PASS |
| App clienti | 0 occorrenze delle formule nuove sotto app customer, portal e shared | PASS |
| Telefono 375 px | Documento senza overflow; piede presente, riepilogo alto 44 px, velatura e testo leggibili | PASS browser |
| Invarianti GH-54/GH-55 | `flex-shrink: 0`, `min-height: 0`, fasce e margine restano invariati | PASS strutturale |
| Build | Vite 5.4.21, 157 moduli, 1,09 s; JS 701,88 kB (gzip 198,27 kB) | PASS |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## RLS e dati

La suite RLS non e stata rieseguita, come prescritto dal mandato: i due file
applicativi modificati non contengono query, policy o accessi ai dati. L'ultima
misura viva resta GH-54, `60 PASS, 0 FAIL, 0 SKIP`, ed e ora vecchia di due
giri applicativi, GH-55 e GH-56. Nessuna fixture database e stata creata.

## Eccezioni e fuori istruzione

- Nessuna eccezione di implementazione.
- Nessuna modifica fuori istruzione.
- Nessun rallentamento anomalo durante il giro: letture circa 0,1 s, server
  locale pronto in 129 ms e build in 1,09 s.

## Controllo finale di Luigi

Il passo umano resta aperto. Aprire prima sul computer e poi sul telefono:

1. una giornata con appuntamenti e lavorazioni insieme: devono distinguersi,
   ma l'appuntamento deve pesare di piu;
2. il piede di una giornata piena: deve appartenere alla stessa veste del
   resto della pagina.

La domanda da porre e: `cosa non ti torna?`.

## Commit

Commit locale previsto con messaggio `fix: soften walk-in calendar facts`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
