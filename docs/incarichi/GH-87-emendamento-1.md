# Emendamento 1 a GH-87 — La conferma è un momento

**Da:** Luigi · **Per:** Codex · **Data:** 12 settembre 2026
**Corregge** `docs/incarichi/GH-87-la-conferma-e-un-momento.md`. Il resto del mandato resta valido parola per parola.

## Perché

L'interruzione al preflight è corretta e la causa è nel mandato, non nel demo.

Il mandato dichiarava la migrazione `gh87_customer_alternative_choice` **«già applicata in produzione da Cowork»** e nello stesso respiro confinava il lavoro **al solo demo**. Vero il primo pezzo, falso il secondo: Cowork l'aveva applicata **solo in produzione**, e al demo non arriva — quel progetto sta in un'organizzazione che Cowork non raggiunge.

**Hai fatto la cosa giusta a fermarti.**

## Cosa cambia

**1. La migrazione al demo la applica Luigi**, dall'editor SQL della dashboard, prima che tu riprenda. Il file è ora nel repository:

```
supabase/migrations/20260912165822_gh87_customer_alternative_choice.sql
```

È lo stesso testo applicato in produzione, ed è idempotente.

**Riprendi solo dopo che Luigi ti ha confermato l'esito.** Rifai il preflight: le quattro colonne e la funzione devono esserci. **Se manca ancora qualcosa, fermati di nuovo e dichiara cosa** — significherebbe che il demo è indietro oltre questa migrazione, e il riallineamento non è dentro questo mandato.

**2. Quel file entra nel tuo commit.** È l'unico documento del repository che descrive lo stato del database da cui GH-87 dipende, e `scripts/salva.sh` non copre `supabase/`, quindi nessun altro lo pubblicherebbe. **Mettilo nella tabella esaustiva del commit** con questo motivo.

**Resta l'esclusione** di tutto ciò che sta in `docs/incarichi/`, compreso questo emendamento: sono documenti di Luigi e Cowork.

**3. Non applicare tu nessuna migrazione, da nessuna parte.** Il perimetro sul database non cambia: leggi il demo, non lo modifichi con DDL. Le scritture ammesse restano quelle delle prove e della suite RLS.

## Una nota sulle controprove

Le controprove del mandato chiedono **«le quattro colonne lette dal database»**. Con la migrazione applicata al demo si leggono davvero: **fallo lì, e dichiara il progetto**. Non sostituirle con una lettura simulata in memoria — è il punto in cui questo mandato si distingue da `GH-86`, dove l'assenza di database era dichiarata e accettata.

Il resto delle prove può restare in memoria come da mandato.
