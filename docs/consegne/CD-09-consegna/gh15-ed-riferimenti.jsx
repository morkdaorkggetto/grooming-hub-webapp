// ═══════════════════════════════════════════════════════════
// GH-15 · TAVOLE DI RIFERIMENTO — misurabili a vista
// 1 · stati (7)  2 · densità in numeri  3 · token e colori  4 · campi incerti
// ═══════════════════════════════════════════════════════════

const RefCard = ({ title, children, span }) => (
  <div style={{ gridColumn: span ? `span ${span}` : undefined, background: '#fff', border: `1px solid ${GH.bd}`, borderRadius: GH.r.panel, padding: 16 }}>
    <div style={{ fontSize: 16, color: GH.ink, marginBottom: 11, ...GH.serif }}>{title}</div>
    {children}
  </div>
);

const RefRow = ({ k, v, mono }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, minHeight: 24, borderBottom: `1px solid ${GH.bdSoft}`, paddingBottom: 3 }}>
    <span style={{ fontSize: 12, color: GH.mute }}>{k}</span>
    <span style={{ fontSize: 12.5, fontWeight: 700, color: GH.ink, ...(mono ? GH.num : {}), textAlign: 'right' }}>{v}</span>
  </div>
);

// ── Tavola 1 · i sette stati ──
const StatesBoard = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, alignContent: 'start' }}>
    <RefCard title="Stati appuntamento" span={2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[['confermato', 'Appuntamento confermato dal salone'], ['attesa', 'Richiesta arrivata, non ancora confermata'], ['noshow', 'Cliente non presentato — score −1']].map(([s, d]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ minWidth: 92 }}><StateTag s={s}/></span>
            <span style={{ fontSize: 12, color: GH.mute }}>{d}</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 2, textWrap: 'pretty', borderTop: `1px solid ${GH.bdSoft}`, paddingTop: 9 }}>
          Nelle liste dense lo stato è un <b>pallino 7px</b> (verde/warning/neutro); il tag testuale compare solo nelle schede singole e nelle righe con spazio.
        </div>
      </div>
    </RefCard>
    <RefCard title="Stati cliente" span={2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[['attivo', 'Score ≥ 0 — default, NON si stampa in lista'], ['rischio', 'Score negativo, non ancora blacklist'], ['blacklist', 'Score ≤ −3 — automatico']].map(([s, d]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ minWidth: 92 }}><StateTag s={s}/></span>
            <span style={{ fontSize: 12, color: GH.mute }}>{d}</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 2, textWrap: 'pretty', borderTop: `1px solid ${GH.bdSoft}`, paddingTop: 9 }}>
          Mostrare «Attivo» su 129 righe di 132 è rumore: in lista si stampa solo ciò che devia dal default.
        </div>
      </div>
    </RefCard>
    <RefCard title="Caricamento" span={2}>
      <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden' }}>
        {[0, 1, 2].map(i => <SkeletonRow key={i} i={i}/>)}
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 9, textWrap: 'pretty' }}>Scheletro con la <b>stessa geometria della riga vera</b> (44px, avatar 30, due linee): niente spinner, niente salto di layout all'arrivo dei dati.</div>
    </RefCard>
    <RefCard title="Vuoto">
      <div style={{ border: `1px dashed ${GH.bd}`, borderRadius: GH.r.field }}>
        <EmptyState title="Ancora nessuna visita." body="Si registrano da qui, anche a lavoro finito."/>
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 9, textWrap: 'pretty' }}>Il vuoto <b>insegna il gesto</b>, non si scusa. Titolo serif, nessun tono d'errore.</div>
    </RefCard>
    <RefCard title="Errore">
      <ErrorState body="Connessione assente. I dati inseriti restano in schermata: riprova."/>
      <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 9, textWrap: 'pretty' }}>L'errore dice <b>cosa non è successo</b> e cosa resta salvo. Mai svuotare un form per un errore di rete.</div>
    </RefCard>
  </div>
);

// ── Tavola 2 · densità, token, campi incerti ──
const SpecBoard = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignContent: 'start' }}>
    <RefCard title="Densità, in numeri">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 5 }}>
          <Eyebrow>elemento</Eyebrow><div style={{ display: 'flex', gap: 18 }}><Eyebrow>banco</Eyebrow><Eyebrow>telefono</Eyebrow></div>
        </div>
        {[['Riga di lista', '44', '60'], ['Bottone', '38', '46'], ['Campo / search', '38 / 40', '46'], ['Pill filtro', '32', '40'], ['Chip data', '48', '54'], ['Chip servizio', '38', '44'], ['FAB', '—', '56'], ['Riga slot orario', '30', '30']].map(([k, a, b]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, minHeight: 22, borderBottom: `1px solid ${GH.bdSoft}` }}>
            <span style={{ fontSize: 12, color: GH.mute }}>{k}</span>
            <div style={{ display: 'flex', gap: 18 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: GH.ink, ...GH.num, minWidth: 46, textAlign: 'right' }}>{a}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-primary)', ...GH.num, minWidth: 34, textAlign: 'right' }}>{b}</span>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 7, textWrap: 'pretty' }}>
          <b>La densità comprime la tipografia, non il bersaglio.</b> Riga da 44px con testo a 13px: densa da leggere, generosa da toccare. Area attiva estesa oltre il testo, mai testo più grasso.
        </div>
      </div>
    </RefCard>
    <RefCard title="Ritmo verticale e geometria">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <RefRow k="Gap tra pannelli" v="14–16 px" mono/>
        <RefRow k="Gap tra controlli" v="6–9 px" mono/>
        <RefRow k="Padding pagina" v="20 / 13 px" mono/>
        <RefRow k="Testa pannello" v="12 · 16 px" mono/>
        <RefRow k="Corpo pannello" v="13 px" mono/>
        <RefRow k="Tessera area" v="16 px" mono/>
        <RefRow k="Raggio campo" v="12 px" mono/>
        <RefRow k="Raggio bottone" v="14 px" mono/>
        <RefRow k="Raggio striscia / modale" v="16 px" mono/>
        <RefRow k="Raggio pannello e tessera" v="20 px" mono/>
        <RefRow k="Raggio pill / FAB" v="999 px" mono/>
        <RefRow k="Colonne archivio" v="1.5fr 1.4fr .9fr 84 74 20" mono/>
        <RefRow k="Colonne scheda desktop" v="1fr / 440 px" mono/>
        <RefRow k="Modale desktop" v="620 px" mono/>
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 7, textWrap: 'pretty' }}>Il customer usa raggi 24–28: là è casa del cliente. Qui 20 — stessa famiglia, un grado più operativo.</div>
      </div>
    </RefCard>
    <RefCard title="Tipografia">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <RefRow k="Eyebrow" v="9.5 / .19em / 700"/>
        <RefRow k="H1 pagina" v="serif 32 · 25 mob"/>
        <RefRow k="Titolo pannello" v="serif 16 / 500"/>
        <RefRow k="Titolo tessera" v="serif 18 / 500"/>
        <RefRow k="Nome cane · scheda" v="serif 32 · 26 mob"/>
        <RefRow k="Nome cane · riga" v="serif 16 / 500"/>
        <RefRow k="Numero panoramica" v="serif 30 / 400"/>
        <RefRow k="Prezzo visita" v="serif 16 / 500"/>
        <RefRow k="Corpo / riga" v="sans 13"/>
        <RefRow k="Meta / nota" v="sans 11–12"/>
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 7, textWrap: 'pretty' }}>
          <b>Serif</b> = nomi propri e cifre che si guardano. <b>Sans</b> = tutto ciò che si scandisce. Nel dubbio: sans.<br/>
          Minimo <b>11px per il testo corrente</b>. Eccezioni dichiarate: eyebrow uppercase <b>9.5</b> (solo con letter-spacing .19em), tag di stato <b>10</b>, soglie e orari secondari <b>10.5</b>. Sotto 9.5 nulla, mai. Tutti i numeri con <span style={GH.num}>tabular-nums</span>.
        </div>
      </div>
    </RefCard>
    <RefCard title="Colori — nessuno inventato, tre dichiarati" span={2}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 18px' }}>
        <div>
          <Eyebrow style={{ marginBottom: 6 }}>già in tokens.css — usati così come sono</Eyebrow>
          {['--color-primary', '--color-primary-hover', '--color-secondary', '--color-secondary-hover', '--color-surface-main', '--color-surface-soft', '--color-border', '--color-text-primary', '--color-text-secondary', '--color-placeholder', '--color-success-text / -bg', '--color-danger-text / -bg', '--color-warning-text / -bg / -border', '--tier-bronze / -silver / -gold', '--font-sans / --font-serif'].map(t => (
            <div key={t} style={{ fontSize: 11.5, color: GH.ink, ...GH.num, lineHeight: 1.7 }}>{t}</div>
          ))}
        </div>
        <div>
          <Eyebrow style={{ marginBottom: 6 }}>nuovi — da aggiungere a index.css, nome e valore esatti</Eyebrow>
          {[['--gh-bridge', '#f7f1ea', 'fondo del solo pannello «Area cliente digitale»'], ['--gh-border-60', 'rgba(207,193,196,.6)', 'bordo standard = --color-border @60%'], ['--gh-border-35', 'rgba(207,193,196,.35)', 'separatore di riga = --color-border @35%']].map(([n, v, d]) => (
            <div key={n} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: v, border: `1px solid ${GH.bd}`, flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: GH.ink, ...GH.num }}>{n} · {v}</div>
                <div style={{ fontSize: 11, color: GH.mute }}>{d}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: GH.mute, textWrap: 'pretty', marginTop: 4 }}>
            Derivati d'opacità usati inline, non nuovi colori: <span style={GH.num}>rgba(79,139,103,.35)</span> bordo success · <span style={GH.num}>rgba(184,94,105,.5)</span> bordo danger · <span style={GH.num}>rgba(103,56,63,.08)</span> fondo operatore attivo · <span style={GH.num}>rgba(43,37,37,.34)</span> velo modale · <span style={GH.num}>rgba(111,151,146,.45)</span> ombra FAB. Tutti ricavati da token esistenti: se preferite, dichiarateli.
          </div>
        </div>
      </div>
    </RefCard>
    <RefCard title="Campi da verificare in schema prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[['visit.operator', 'chi ha lavorato — già mancato in GH-09'], ['visit.amount', 'incasso per visita'], ['visit.duration', 'durata'], ['visit.photos', 'foto prima/dopo'], ['appointment.state', 'confermato / attesa / no-show'], ['services[]', 'listino con prezzo'], ['operators[]', 'elenco operatori'], ['client.lastVisit', 'data ultima visita in lista'], ['client.visitCount', 'contatore visite in lista'], ['fidelity.points', 'punti premio separati dalle visite'], ['requests.unread', 'contatore «2 da leggere»']].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', ...GH.num, whiteSpace: 'nowrap' }}>{f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 4, textWrap: 'pretty' }}>Se un campo non esiste: <b>non inventarlo e non inferirlo</b>. La colonna sparisce e il resto della riga non si muove — le griglie sono dimensionate per reggerlo.</div>
      </div>
    </RefCard>
  </div>
);

Object.assign(window, { RefCard, RefRow, StatesBoard, SpecBoard });
