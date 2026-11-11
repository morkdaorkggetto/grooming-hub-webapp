#!/usr/bin/env python3
# CD-13 — genera le tavole .dc.html (markup statico, solo var(--token)) e il tokens.css della tela.
import json, os, sys, datetime
ROOT = '/home/claude/cd13/root/project'
TOK = '/mnt/user-data/uploads/grooming-hub-web/Prototipo/DS-consegna/project/tokens.json'
H = json.load(open(os.path.join(os.path.dirname(__file__), 'altezze.json'))) if os.path.exists(os.path.join(os.path.dirname(__file__), 'altezze.json')) else {}

# ── tokens.css della tela, compilato da tokens.json del design system ──
t = json.load(open(TOK))
al = lambda v: 'var(--' + v[1:-1] + ')' if v.startswith('{') else v
css = ['/* Grooming Hub — generated from tokens.json */', ':root {']
for f in ('color', 'shadow', 'radius', 'fontSize'):
    for k in t[f]['tokens']: css.append(f"  --{k['name']}: {al(k['value'])};")
for k, v in t['type']['families'].items(): css.append(f"  --font-{k}: {v};")
css.append('}')
s = t['type']['groups'][0]['styles'][0]
css.append(f".{s['name']} {{ font-family: var(--font-{t['type']['groups'][0]['family']}); font-size: {s['fontSize']}; font-weight: {s['fontWeight']}; letter-spacing: {s['letterSpacing']}; }}")
open(f'{ROOT}/ds/groominghub/tokens.css', 'w').write('\n'.join(css) + '\n')
open(f'{ROOT}/ds/groominghub/tokens.json', 'w').write(open(TOK).read())

FR = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap">'

def pagina(file, titolo, w, corpo):
    h = H.get(file, 600)
    html = f'''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>{titolo}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/groominghub/tokens.css">
</head>
<body>
<x-dc>
<helmet>
{FR}
<style>
body{{margin:0}}
</style>
</helmet>
<div data-radice style="width: {w}px; height: {h}px; box-sizing: border-box; background: var(--color-bg-main); color: var(--color-text-primary); font-family: var(--font-sans)">
{corpo}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''
    open(f'{ROOT}/{file}', 'w').write(html)

# ── LE FASCE (dopo) ──
B = 'box-sizing: border-box; min-width: 0; min-height: 54px; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-radius: 12px; font-family: inherit; text-align: center'
ST = {
 'aperta': f'{B}; padding: 6px 4px; border: 1px solid var(--color-border); background: var(--color-surface-main); color: var(--color-text-primary); cursor: pointer',
 'scelta': f'{B}; padding: 5px 3px; border: 2px solid var(--color-primary-hover); background: var(--gh-tint); color: var(--color-text-primary); cursor: pointer',
 'chiusa': f'{B}; padding: 6px 4px; border: 1px dashed var(--color-border); background: var(--color-surface-soft); color: var(--color-text-secondary); cursor: not-allowed',
}
NOME = 'display: block; font-size: 12.5px; line-height: 16px; font-weight: {w}'
ORE = 'display: block; font-size: 11.5px; line-height: 14px; font-weight: 500; font-variant-numeric: tabular-nums'
STATO = 'display: block; font-size: 11.5px; line-height: 14px; font-weight: 600; color: var(--color-warning-text)'
FASCE = {'mat': ('Mattina', '9–13', 'chiusa'), 'pom': ('Pomeriggio', '13–19', 'chiuso')}

def pulsante(chi, stato):
    w = 700 if stato == 'scelta' else 600
    attr = f'type="button" data-fascia="{chi}" aria-pressed="{"true" if stato == "scelta" else "false"}"' + (' disabled' if stato == 'chiusa' else '')
    if chi == 'ug':
        return f'<button {attr} style="{ST[stato]}"><span data-riga="nome" style="{NOME.format(w=w)}">Per me<br>è uguale</span></button>'
    nome, ore, ch = FASCE[chi]
    due = f'<span data-riga="stato" style="{STATO}">{ch}</span>' if stato == 'chiusa' else f'<span data-riga="ore" style="{ORE}">{ore}</span>'
    return f'<button {attr} style="{ST[stato]}"><span data-riga="nome" style="{NOME.format(w=w)}">{nome}</span>{due}</button>'

TITOLO = '<p data-titolo style="margin: 0; font-size: 13px; line-height: 18px; font-weight: 700">Mattina o pomeriggio? (facoltativo)</p>'
def fasce(mat='aperta', pom='aperta', ug='aperta', tolta=None, extra=''):
    riga = f'<div data-fasce role="group" aria-label="Preferenza oraria facoltativa" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 8px">{pulsante("mat", mat)}{pulsante("pom", pom)}{pulsante("ug", ug)}</div>'
    nota = ''
    if tolta:
        nota = f'<p data-tolta role="status" style="margin: 8px 0 0; font-size: 12px; line-height: 17px; font-weight: 600; color: var(--color-warning-text)">{tolta} in quel giorno: abbiamo tolto la tua preferenza. Scegline un’altra, o lascia così.</p>'
    return f'<div data-blocco>{TITOLO}{riga}{nota}{extra}</div>'

# ── LE FASCE (oggi), ricostruite da Book.css 169–204 e DesiredDateStrip.css 19–21 ──
OB = 'box-sizing: border-box; min-width: 0; min-height: 54px; margin: 0; padding: 6px 4px; border-radius: 12px; font-family: inherit; font-size: 12.5px; font-weight: 600; white-space: normal; text-align: center'
def oggi_p(testo, stato):
    st = {'aperta': f'{OB}; border: 1px solid var(--color-border); background: var(--color-surface-main); color: var(--color-text-primary)',
          'scelta': f'{OB}; border: 2px solid var(--color-primary); background: var(--gh-tint); color: var(--color-text-primary)',
          'chiusa': f'{OB}; border: 1px dashed var(--color-border); background: var(--color-surface-soft); color: var(--color-text-secondary)'}[stato]
    small = '<small style="display: block; margin-top: 2px; font-size: 9px; font-weight: 700; line-height: 1.1; text-transform: uppercase">Non disponibile</small>' if stato == 'chiusa' else ''
    return f'<button type="button" data-oggi{" disabled" if stato == "chiusa" else ""} style="{st}">{testo}{small}</button>'
def oggi(mat, pom, ug, mt):
    return f'<div data-fasce-oggi style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: {mt}px">{oggi_p("Mattina (9–13)", mat)}{oggi_p("Pomeriggio (13–19)", pom)}{oggi_p("Per me è uguale", ug)}</div>'

# ── IL CALENDARIO (contesto: GH-116, non oggetto di questa tavola) ──
CH = lambda d: f'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{d}"/></svg>'
def calendario(scelto, incassato=False):
    alt = 40 if incassato else 44
    fr = 'width: 44px; height: 44px; padding: 0; display: grid; place-items: center; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface-main); color: var(--color-text-primary)'
    testa = f'<div style="display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: center; gap: 4px"><button type="button" aria-label="Mese precedente" disabled style="{fr}; opacity: .35">{CH("M15 6l-6 6 6 6")}</button><strong style="font: 500 19px/1.2 var(--font-serif); text-align: center; text-transform: lowercase">novembre 2026</strong><button type="button" aria-label="Mese successivo" style="{fr}">{CH("M9 6l6 6-6 6")}</button></div>'
    gg = ''.join(f'<span style="height: 18px; text-align: center; font-size: 11px; font-weight: 700; line-height: 18px; text-transform: uppercase{"; opacity: .5" if g == "dom" else ""}">{g}</span>' for g in ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'])
    celle = [None] * 6 + list(range(1, 31)) + [None] * 6
    out = ''
    for i, d in enumerate(celle):
        base = f'box-sizing: border-box; width: 100%; height: {alt}px; padding: 0; display: grid; place-items: center; border: 0; background: transparent; color: var(--color-text-primary); font: inherit'
        if d is None: out += f'<span aria-hidden="true" style="{base}"></span>'; continue
        dom = i % 7 == 6; passato = d <= 11
        num = 'position: relative; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums'
        if dom or passato: num += '; opacity: .45'
        if d == scelto: num += '; background: var(--color-primary-hover); color: var(--color-surface-main); font-weight: 700'
        oggi_seg = '<span aria-hidden="true" style="position: absolute; bottom: 4px; width: 14px; height: 2px; border-radius: 2px; background: var(--color-primary)"></span>' if d == 11 else ''
        out += f'<button type="button" aria-pressed="{"true" if d == scelto else "false"}"{" disabled" if dom or passato else ""} style="{base}"><span style="{num}">{d}{oggi_seg}</span></button>'
    leg = '<div style="min-height: 20px; margin-top: 6px; padding-top: 7px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; column-gap: 4px; row-gap: 4px; border-top: 1px solid var(--gh-border-35); color: var(--color-text-secondary); font-size: 11.5px; text-align: center"><span>dom chiuso</span><span aria-hidden="true">·</span><span>lun solo pomeriggio</span></div>'
    pan = 'box-sizing: border-box; width: 100%' + ('' if incassato else '; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 18px; background: var(--color-surface-main)')
    nomi = {19: 'giovedì 19 novembre', 23: 'lunedì 23 novembre', 26: 'giovedì 26 novembre'}
    sel = f'<p role="status" style="margin: 9px 0 0; color: var(--color-text-secondary); font-family: var(--font-serif); font-size: 15px; line-height: 1.35; text-align: center">Hai scelto {nomi[scelto]}</p>'
    return f'<div data-calendario aria-label="Scegli la data desiderata" style="box-sizing: border-box; width: 100%; color: var(--color-text-primary)"><div style="{pan}">{testa}<div aria-hidden="true" style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); margin: 4px 0 2px">{gg}</div><div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr))">{out}</div>{leg}</div>{sel}</div>'

# ── 1 · Prenotazione, passo 3, un lunedì ──
passo = f'''<div style="padding: 20px 12px 24px">
<div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 10px"><span style="color: var(--color-primary); font-family: var(--font-serif); font-size: 20px; font-style: italic; line-height: 1">3</span><div><h2 style="margin: 0; font-size: 15px; font-weight: 700; line-height: 1.25">Quando ti andrebbe bene?</h2></div></div>
<p style="margin: 0 0 10px; color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.5">È un desiderio: l’ora te la conferma il salone su WhatsApp.</p>
{calendario(23)}
<div style="margin-top: 10px">{fasce(mat='chiusa')}</div>
<p style="margin: 7px 0 0; color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.5">L’orario preciso lo concordiamo noi su WhatsApp.</p>
</div>'''
pagina('Main.dc.html', 'Prenotazione, passo 3: un lunedì', 375, passo)

# ── 2 · Riquadro «Scegli un'altra data» ──
TS = 'margin: 8px 0 0; font-size: 14px; line-height: 1.5; color: var(--color-text-secondary)'
GH = 'box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; width: 100%; padding: 10px 18px; border: 1px solid var(--color-border); border-radius: var(--r-md); background: transparent; color: var(--color-primary); font-family: inherit; font-size: 15px; font-weight: 600; white-space: normal'
riq = f'''<div style="padding: 0 15px 24px">
<div style="box-sizing: border-box; padding: 4px 20px 20px; border: 1px solid var(--color-border); border-top: 0; border-radius: 0 0 var(--r-lg) var(--r-lg); background: var(--color-surface-main); box-shadow: var(--shadow-sm)">
<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px">
<p style="{TS}">Quando ti andrebbe bene invece?</p>
<p style="{TS}">Se vuoi, indica una nuova data: aiuta il salone a proporti orari più adatti.</p>
<div style="margin-inline: -3px">{calendario(26, incassato=True)}</div>
{fasce(pom='scelta')}
<button type="button" style="{GH}">Invia la nuova disponibilità</button>
<button type="button" style="{GH}">Rifiuta senza indicare una data</button>
<button type="button" style="{GH}">Torna agli orari</button>
</div>
</div>
</div>'''
pagina('Riquadro.dc.html', 'Riquadro «Scegli un’altra data»: un giovedì', 375, riq)

# ── 3 e 4 · La matrice degli stati ──
CAP = 'margin: 0; font-size: 11px; line-height: 15px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-text-primary)'
SUB = 'margin: 2px 0 10px; font-size: 12px; line-height: 17px; color: var(--color-text-primary)'
STATI = [
 ('1 · Nessun giorno scelto', 'Nessuna fascia è chiusa: senza giorno non c’è chiusura.', dict()),
 ('2 · Giorno con tutte le fasce aperte', 'Giovedì 26. Uguale al caso 1.', dict()),
 ('3 · Giorno con la mattina chiusa', 'Lunedì 23. La seconda riga dice lo stato al posto dell’orario.', dict(mat='chiusa')),
 ('4 · Giorno con il pomeriggio chiuso', 'Caso di prova: oggi nel salone non esiste.', dict(pom='chiusa')),
 ('5 · Una fascia scelta', 'Giovedì 26, pomeriggio. Toccarla di nuovo la toglie.', dict(pom='scelta')),
 ('6 · «Per me è uguale» scelta', 'Lunedì 23: resta accesa accanto alla mattina chiusa, senza altre parole.', dict(mat='chiusa', ug='scelta')),
 ('7 · Fascia scelta che si spegne', 'Era scelta la mattina di giovedì 26; si passa a lunedì 23.', dict(mat='chiusa', tolta='Mattina chiusa')),
]
def matrice(file, titolo, lato, fondo):
    righe = ''.join(f'<section data-stato="{i + 1}" style="padding: 16px 0; border-top: 1px solid var(--color-border)"><p style="{CAP}">{c}</p><p style="{SUB}">{s}</p>{fasce(**k)}</section>' for i, (c, s, k) in enumerate(STATI))
    pagina(file, titolo, 375, f'<div style="padding: 8px {lato}px 16px; background: var({fondo}); min-height: 100%; box-sizing: border-box">{righe}</div>')
matrice('Stati-prenotazione.dc.html', 'Le fasce nella prenotazione: i sette stati', 12, '--color-bg-main')
matrice('Stati-riquadro.dc.html', 'Le fasce nel riquadro: i sette stati', 36, '--color-surface-main')

# ── 5 · Prima → dopo, un lunedì ──
def colonna(tit, w, dentro, fondo):
    return f'<div style="width: {w}px"><p style="{CAP}; margin-bottom: 10px">{tit}</p><div style="padding: 12px 0">{dentro}</div></div>'
LAB = 'margin: 0; font-size: 13px; font-weight: 700'
oggi_book = f'<div data-prima="book"><p style="{LAB}">Mattina o pomeriggio?</p>{oggi("chiusa", "aperta", "aperta", 8)}<p style="margin: 12px 0 0; color: var(--color-warning-text); font-size: 12px; font-weight: 600; line-height: 1.45">Mattina chiusa. Per quel giorno scegli un’altra preferenza.</p><p style="margin: 7px 0 0; color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.5">L’orario preciso lo concordiamo noi su WhatsApp.</p></div>'
dopo_book = f'<div data-dopo="book">{fasce(mat="chiusa")}<p style="margin: 7px 0 0; color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.5">L’orario preciso lo concordiamo noi su WhatsApp.</p></div>'
oggi_riq = f'<div data-prima="riq">{oggi("chiusa", "aperta", "aperta", 0)}<p style="{TS}; margin-top: 18px">Mattina chiusa. Per quel giorno scegli un’altra preferenza.</p></div>'
dopo_riq = f'<div data-dopo="riq">{fasce(mat="chiusa")}</div>'
SCH = 'box-sizing: border-box; padding: 20px 24px; background: var(--color-surface-main); border: 1px solid var(--color-border); border-radius: var(--r-md)'
pd = f'''<div style="padding: 24px; display: flex; flex-direction: column; gap: 24px">
<div style="display: flex; gap: 40px; align-items: flex-start"><div style="width: 351px"><p style="{CAP}">Prenotazione · oggi</p><div style="margin-top: 12px">{oggi_book}</div></div><div style="width: 351px"><p style="{CAP}">Prenotazione · dopo</p><div style="margin-top: 12px">{dopo_book}</div></div></div>
<div style="{SCH}; display: flex; gap: 40px; align-items: flex-start"><div style="width: 303px"><p style="{CAP}">Riquadro · oggi</p><div style="margin-top: 12px">{oggi_riq}</div></div><div style="width: 303px"><p style="{CAP}">Riquadro · dopo</p><div style="margin-top: 12px">{dopo_riq}</div></div></div>
</div>'''
pagina('Prima-dopo.dc.html', 'Prima e dopo, un lunedì', 790, pd)

# ── canvas.json ──
ora = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
ordine = ['Main.dc.html', 'Riquadro.dc.html', 'Stati-prenotazione.dc.html', 'Stati-riquadro.dc.html', 'Prima-dopo.dc.html']
tit = {'Main.dc.html': 'Prenotazione · passo 3, un lunedì', 'Riquadro.dc.html': 'Riquadro «Scegli un’altra data»', 'Stati-prenotazione.dc.html': 'Stati · prenotazione (colonne da 111,7)', 'Stati-riquadro.dc.html': 'Stati · riquadro (colonne da 95,7)', 'Prima-dopo.dc.html': 'Prima → dopo, un lunedì'}
boards, x = {}, 0
for f in ordine[:4]:
    boards[f] = {'x': x, 'y': 0, 'w': 375, 'h': H.get(f, 600), 'title': tit[f]}; x += 375 + 80
y2 = max(b['h'] for b in boards.values()) + 120
boards['Prima-dopo.dc.html'] = {'x': 0, 'y': y2, 'w': 790, 'h': H.get('Prima-dopo.dc.html', 600), 'title': tit['Prima-dopo.dc.html']}
canvas = {'v': 3, 'createdOnFiles': {'v': 1, 'at': ora}, 'title': 'CD-13 · Come si leggono le fasce', 'launch': {'view': 'canvas'}, 'pages': [], 'boards': boards, 'order': ordine,
 'notes': {'titolo': {'x': 0, 'y': -300, 'text': 'CD-13 · Come si leggono le fasce', 'kind': 'title1', 'maxW': x - 80},
           'sintesi': {'x': -440, 'y': 0, 'w': 360, 'text': 'Due righe per pulsante: il nome, e sotto l’orario. Nel giorno in cui una fascia è chiusa, la seconda riga dice «chiusa» al posto dell’orario.\n\nLa chiusura si dice due volte, non tre: come regola nella legenda del calendario, come stato nel pulsante. La frase sotto le fasce compare solo quando una scelta è stata tolta.\n\n«Per me è uguale» non cambia mai.\n\nIl titolo «Mattina o pomeriggio? (facoltativo)» va in tutti e due i posti.\n\nMisure, frasi e cosa non torna: CD-13-handoff.md.'}},
 'designSystems': [{'title': 'Grooming Hub', 'namespace': 'groominghub', 'artifact': 'https://claude.ai/artifact/Q1XXHLBwnSL6Yn1SJGfBuV', 'version': '1794376076-d217', 'copiedAt': ora}]}
json.dump(canvas, open(f'{ROOT}/canvas.json', 'w'), ensure_ascii=False, indent=1)
print('ok', ora)
