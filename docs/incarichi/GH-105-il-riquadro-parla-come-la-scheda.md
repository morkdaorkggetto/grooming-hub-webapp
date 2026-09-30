# Incarico GH-105 — Il riquadro parla come la scheda

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 30 settembre 2026
**Nasce da:** `GH-104`, commit `f673e3d`. Luigi, guardando il riquadro nuovo: *«i font non sono quelli usati nell'UI design system»*.

**Perimetro**: `src/apps/staff/pages/ClientDetail.jsx` e `src/apps/staff/pages/ClientDetail.css`, **solo nel riquadro «Prossimo appuntamento»**. Nessun database, nessuna altra pagina. Nessun push, merge o deploy.

## Da dove nasce

Il riquadro di `GH-104` usa `Panel`, e il titolo in serif è corretto: è `.gh-panel-title` del sistema (`styles/gh15-staff.css:36-58`). Ma **tutto il resto non usa le classi del sistema**. Letto da Cowork nel diff di `f673e3d`:

| Elemento del riquadro nuovo | Oggi | Nel resto della scheda |
|---|---|---|
| intestazione | solo `title`, **senza `eyebrow`** | ogni `Panel` della scheda ha un occhiello: «Affidabilità appuntamenti», «Area cliente digitale», «Promozione visite» (`ClientDetail.jsx`, 831-833 e seguenti) |
| «Nessun appuntamento in agenda» | `<p>` **senza classe**: eredita la dimensione del documento | testo corrente `.gh-body`, 13px (`gh15-staff.css:103-107`) |
| riga appuntamento: data e ora | `<strong>` senza classe | `.gh-body` con il peso del sistema |
| riga appuntamento: servizio | `<span>` senza classe | testo secondario `.gh-meta`, 11,5px, colore secondario (`gh15-staff.css:109-113`) |
| riga richiesta | come sopra | come sopra |

Il risultato, nello screenshot di Luigi, è un testo **più grande e più piatto** del resto della scheda: si capisce che è un pezzo arrivato da fuori.

## Cosa fare

**Il riquadro usa le classi tipografiche che la scheda usa già. Nessuna classe nuova per il testo, nessuna dimensione o font scritti a mano.**

1. **Occhiello**: aggiungi `eyebrow="Agenda"` al `Panel`. Il titolo resta «Prossimo appuntamento».
2. **Stato vuoto**: la frase prende `.gh-body`.
3. **Righe degli appuntamenti**: data e ora in `.gh-body`, con il peso che la scheda usa per un dato in evidenza; il servizio in `.gh-meta`. Le date restano con `.gh-num` se la scheda la usa per i numeri, come nel resto della pagina: verificalo e dichiaralo.
4. **Righe delle richieste**: stessa regola. «Richiesta · stato» come la data, il dettaglio come il servizio.
5. **`ClientDetail.css`**: resta solo quello che è impaginazione del riquadro (spazi, allineamenti, bersagli, spazio per il pulsante mobile). **Nessuna regola `font-family`, `font-size` o colore del testo.** Se oggi ce n'è una, toglila.

## Invarianti

- **Il comportamento di `GH-104` non cambia**: stesse righe, stesso ordine, stessi collegamenti, stesso stato vuoto, stesse richieste.
- **Nessun colore nuovo, nessuna classe tipografica nuova**, nessuna modifica a `gh15-staff.css` o a `StaffKit.jsx`.
- **Bersagli**: le righe e il pulsante restano almeno 44px.

## Controprove

- **Stili calcolati**, misurati nel browser con `getComputedStyle`, **prima e dopo**, per: occhiello, frase vuota, data di una riga, servizio di una riga, stato di una richiesta. Accanto, **gli stessi valori** di un elemento equivalente di un altro riquadro della scheda («Affidabilità appuntamenti»): `font-family`, `font-size`, `font-weight`, `line-height`, `color`. **Dopo, devono coincidere**;
- **una ricerca** in `ClientDetail.css` di `font-family|font-size|color:`: risultato vuoto, o solo per il colore di un collegamento che la scheda usa già;
- **screenshot** a 375px e a 1365px, stato vuoto e stato con un appuntamento e una richiesta, **accanto al riquadro «Affidabilità appuntamenti»**;
- le controprove di comportamento di `GH-104` ripetute con lo stesso script (`docs/consegne/evidenze/GH-104/browser-checks.mjs`): tutte PASS;
- build verde. Suite RLS: da non rieseguire.

## Passo finale — lo guarda Luigi

Apri la scheda: il riquadro nuovo **sembra nato con gli altri**, oppure si nota ancora?

## Chiusura

Registro in `docs/consegne/GH-105-il-riquadro-parla-come-la-scheda-esito.md`, committato col codice. Niente push.
