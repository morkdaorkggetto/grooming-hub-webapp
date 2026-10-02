// ═══════════════════════════════════════════════════════════
// CD-10 · TAVOLE — misure sul vero · prima/dopo · regola · scostamenti
// ═══════════════════════════════════════════════════════════

const P10 = ({ children }) => <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>{children}</div>;

// Una schermata vera con sopra le misure lette. Le coordinate sono in px
// dell'immagine (1:1). Rosso = deviazione dalla griglia, verde = conforme.
const Misura = ({ src, w, marks }) => (
  <div style={{ position: 'relative', width: w, height: 680, overflow: 'hidden', border: `1px solid ${GH.bd}`, borderRadius: 10, background: '#fff', flexShrink: 0 }}>
    <img src={src} width={w} height={900} style={{ display: 'block' }} alt=""/>
    {marks.map((m, i) => {
      const bad = m.bad, c = bad ? 'var(--color-danger-text)' : 'var(--color-success-text)';
      return (
        <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, width: m.w || 0, height: m.h || 0, border: `1.5px ${bad ? 'solid' : 'dashed'} ${c}`, borderRadius: 3 }}>
          <span style={m.inside ? { position: 'absolute', top: 3, [m.inside]: 3, whiteSpace: 'nowrap', fontSize: 10, fontWeight: 700, color: '#fff', background: c, borderRadius: 4, padding: '2px 5px' } : { position: 'absolute', [m.side || 'left']: '100%', top: -2, marginLeft: m.side === 'right' ? 0 : 4, marginRight: m.side === 'right' ? 4 : 0, whiteSpace: 'nowrap', fontSize: 10, fontWeight: 700, color: '#fff', background: c, borderRadius: 4, padding: '2px 5px' }}>{m.n}</span>
        </div>
      );
    })}
  </div>
);

const DEV = [
  ['1', 'pulsante alto 64, non 54 — la seconda riga di sottotitolo lo allunga', true],
  ['2', 'a 375 il pulsante è più chiaro che a 1365: sembra un’opacità o uno stato hover rimasto attivo', true],
  ['3', 'il pulsante indietro non c’è', true],
  ['4', 'a 320 il titolo è spostato di ~26px a destra', true],
  ['5', 'margine 10 a 320, 16 a 375: due regole diverse', true],
  ['6', 'la regola spezza la data: «6 / marzo 2026»', true],
  ['7', 'frase e sottotitolo dicono entrambi «quarta»', true],
  ['8', 'cerchi: anello del ritratto + iniziale + 4 timbri = 6 cerchi su 10 elementi', true],
  ['9', 'margine pagina 16 a 375 · tessera 343 · conforme', false],
];

const CD10_Misure = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'flex', gap: 18 }}>
    <Misura src="uploads/tessera-375.png" w={375} marks={[
      { n: '9', x: 0, y: 51, w: 16, h: 30 },
      { n: '8', x: 150, y: 98, w: 76, h: 76, bad: true, side: 'right' },
      { n: '7', x: 64, y: 262, w: 248, h: 46, bad: true },
      { n: '8', x: 94, y: 322, w: 188, h: 38, bad: true, side: 'right' },
      { n: '6', x: 44, y: 374, w: 288, h: 30, bad: true },
      { n: '1', x: 16, y: 511, w: 343, h: 64, bad: true, inside: 'left' },
      { n: '2', x: 16, y: 511, w: 343, h: 64, bad: true, inside: 'right' },
      { n: '3', x: 16, y: 6, w: 44, h: 38, bad: true },
    ]}/>
    <Misura src="uploads/tessera-320.png" w={320} marks={[
      { n: '4', x: 97, y: 12, w: 180, h: 26, bad: true },
      { n: '5', x: 0, y: 51, w: 10, h: 30, bad: true },
      { n: '6', x: 22, y: 374, w: 278, h: 30, bad: true },
    ]}/>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <RefCard title="Misurate sulle schermate vere — dove deviano">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {DEV.map(([n, t, bad]) => (
            <div key={n} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
              <span style={{ minWidth: 20, height: 18, borderRadius: 4, background: bad ? 'var(--color-danger-text)' : 'var(--color-success-text)', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{n}</span>
              <span style={{ fontSize: 12, color: GH.ink, lineHeight: 1.45 }}>{t}</span>
            </div>
          ))}
        </div>
      </RefCard>
      <RefCard title="Di chi sono">
        <P10>
          <b>Miei:</b> 6, 7 e 8. I cerchi li ho disegnati io, e su un cane senza ritratto con tre timbri diventano la forma dominante — avevi ragione. La frase doppia del 7 è un caso che la mia funzione non prevedeva: con il Bronzo a quattro, l’ultimo passo diceva «quarta» due volte.<br/><br/>
          <b>Dell’esecuzione:</b> 1–5. Il 2 va verificato a mano: un pulsante più chiaro solo a una larghezza di solito è un <span style={GH.num}>:hover</span> rimasto attivo nella cattura, o un’opacità ereditata.<br/><br/>
          <b>Il 6 nessuno poteva prevederlo:</b> la regola è cambiata il 1/10.
        </P10>
      </RefCard>
    </div>
  </div>
);

const Riga = ({ k, prima, dopo }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12, padding: '8px 0', borderTop: `1px solid ${GH.bdSoft}`, alignItems: 'baseline' }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: GH.ink }}>{k}</span>
    <span style={{ fontSize: 11.5, color: GH.mute, lineHeight: 1.45 }}>{prima}</span>
    <span style={{ fontSize: 11.5, color: GH.ink, lineHeight: 1.45 }}>{dopo}</span>
  </div>
);

const CD10_Cerchi = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Meno cerchi — da sei a zero, sullo stato normale">
      <P10>
        <b>Il cerchio più grande era per il cane che non ha niente da mostrare.</b> L’iniziale in un anello da 76px è un segnaposto vestito da ritratto: occupa il posto d’onore per dire «qui manca una foto». <b>Senza foto, il ritratto non c’è</b>, e la tessera comincia dal nome — che sale a 40px e diventa lui l’intestazione. È il gesto di una tessera vera: il nome è la cosa scritta più grande.<br/><br/>
        <b>Con la foto, un riquadro e non un medaglione:</b> 88×88, raggio 18. È la forma di una foto su un documento. Il livello, se c’è, è un filo di metallo attorno (1,5px), non un anello che compete.<br/><br/>
        <b>I timbri diventano riquadri a larghezza piena, numerati.</b> Restano timbri — uno per visita, contati in avanti — ma la fila non è più una collana di pallini al centro: è <b>una striscia di caselle</b>, come una tessera da punzonare. Il numero nei posti liberi fa contare senza leggere la frase.<br/><br/>
        <b>Anche il pulsante indietro</b> è un riquadro da 44 col raggio dei controlli (12). Resta un solo tondo nella pagina: nessuno.
      </P10>
    </RefCard>
    <RefCard title="Il numero dei timbri non è fisso — e la forma lo regge">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {[[3, 4, 'oggi'], [3, 5, 'dal 7 novembre'], [3, 6, 'dal 7 gennaio 2027']].map(([d, o, l]) => (
          <div key={o} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{l}</span>
            <Tiles done={d} of={o}/>
          </div>
        ))}
      </div>
      <P10>
        Le caselle dividono sempre tutta la larghezza: a quattro sono larghe, a sei più strette, <b>la fila non si sposta e non si allunga</b>. Con i cerchi centrati, un quinto timbro avrebbe allargato la collana di 49px da un giorno all’altro.<br/><br/>
        <b>Ma un posto vuoto in più resta un posto vuoto in più</b>, e il proprietario lo vedrà comparire. La regola scritta sotto («contano le visite dal 6 marzo 2026») è la spiegazione onesta; non ne aggiungo un’altra. Vedi «Cosa non torna», 1.
      </P10>
    </RefCard>
  </div>
);

const CD10_Valori = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="La griglia della tessera — valori">
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12, paddingBottom: 6 }}>
        <Eyebrow>elemento</Eyebrow><Eyebrow>375 e oltre</Eyebrow><Eyebrow>320</Eyebrow>
      </div>
      <Riga k="margine pagina" prima="16" dopo="12"/>
      <Riga k="padding tessera" prima="24 sopra/sotto · 20 ai lati" dopo="24 sopra/sotto · 16 ai lati"/>
      <Riga k="colonna" prima="max 390, centrata" dopo="piena"/>
      <Riga k="testata" prima="56 · colonne 44 | 1fr | 44" dopo="56 · titolo 17px"/>
      <Riga k="asse" prima="uno, centrale: tutto centrato tranne l’invito" dopo="uguale"/>
      <div style={{ marginTop: 10 }}><Eyebrow>ritmo verticale dentro la tessera</Eyebrow></div>
      <Riga k="GROOMING HUB → nome" prima="20 (→ ritratto 20, ritratto → nome 14)" dopo="uguale"/>
      <Riga k="nome → razza" prima="4" dopo="4"/>
      <Riga k="razza → chip" prima="12, solo se c’è un livello" dopo="12"/>
      <Riga k="→ frase" prima="24 — sostituisce il filetto, che è tolto" dopo="24"/>
      <Riga k="frase → sub" prima="6" dopo="6"/>
      <Riga k="sub → timbri" prima="16" dopo="16"/>
      <Riga k="timbri → regola" prima="12" dopo="12"/>
      <Riga k="regola → QR" prima="20" dopo="20"/>
      <Riga k="blocchi fuori" prima="12 fra tessera, pulsante, invito" dopo="12"/>
    </RefCard>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <RefCard title="La regola lunga — due righe decise">
        <div style={{ padding: 12, border: `1px solid ${GH.bd}`, borderRadius: 10, background: '#fff', marginBottom: 11, width: 264 }}>
          <Regola s={{ dal: '6 marzo 2026' }}/>
        </div>
        <P10>
          <b>Non una frase che va a capo dove capita: due frasi.</b> «Ogni visita da noi è un timbro.» / «Contano le visite dal 6 marzo 2026.» La seconda sta in 264px a 11,5px, e la data ha <span style={GH.num}>white-space: nowrap</span>: se mai mancasse lo spazio va a capo «Contano le visite», non «6 marzo».<br/><br/>
          Dopo marzo 2027 la seconda riga torna «Contano le visite degli ultimi 12 mesi», stessa forma.
        </P10>
      </RefCard>
      <RefCard title="I tre scostamenti — com’era inteso">
        <P10>
          <b>1 · «Mostra al banco».</b> Fondo <span style={GH.num}>--color-primary-hover</span> (#5e8580), testo #fbf6f3, <b>opacità 1</b> in ogni stato tranne il disabilitato. Il contrasto è 3,8:1: <b>basta solo per testo grande</b>, quindi l’etichetta è 19px/700 su una riga. Il sottotitolo è tolto: era lui a portare il pulsante a 64. Altezza <b>54</b>.<br/><br/>
          <b>2 · Il pulsante indietro.</b> 44×44, raggio 12, fondo <span style={GH.num}>--color-surface-main</span>, bordo 1px <span style={GH.num}>--color-border</span>, icona <span style={GH.num}>chevron-left</span> 20px in <span style={GH.num}>--color-text-primary</span>. Nella prima colonna della testata.<br/><br/>
          <b>3 · Il titolo a 320.</b> La testata ha <b>tre colonne simmetriche</b> 44 | 1fr | 44: la terza è vuota apposta, ed è lei che tiene il titolo al centro.
        </P10>
      </RefCard>
    </div>
  </div>
);

const CD10_NonTorna = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Cosa non torna">
      <QRow n="1" q="Il 7 novembre compare un timbro vuoto in più, senza che il proprietario abbia fatto niente. Chi aveva «3 di 4» si ritrova «3 di 5»."
        mine="la forma lo regge, il senso no del tutto: per chi era a un passo dal Bronzo, il Bronzo si allontana. Il caso più delicato è proprio «la prossima è quella del Bronzo» il 6 novembre e «la prossima è la quarta» il 7. Se si può, la soglia cresca solo per chi non è all’ultimo passo — ma è una regola, non un disegno: decide Luigi."/>
      <QRow n="2" q="Senza ritratto la tessera è più corta di 102px: nome a 40px al posto del ritratto da 88 + 14."
        mine="lo considero un pregio — la tessera senza foto è più compatta, non più vuota. Ma la striscia in Home e la tessera cambiano altezza secondo il cane: se si scorre fra più cani, si vede."/>
      <QRow n="3" q="Il pulsante a 3,8:1 è al limite: va bene per l’etichetta a 19px grassetto, non per un’etichetta più piccola."
        mine="se qualcuno lo rimpicciolisce, il contrasto non regge più. Va scritto nel mandato: 19px/700 è un vincolo, non una misura estetica."/>
      <QRow n="4" q="Lo scostamento 2 non è dimostrato. Il pulsante chiaro a 375 e normale a 1365 può essere la cattura, non il codice."
        mine="prima di correggerlo, Codex verifichi stato e opacità calcolati sull’elemento. Se è la cattura, non c’è niente da fare."/>
    </RefCard>
    <RefCard title="Cosa resta come in CD-09 — e cosa cambia">
      <P10>
        <b>Resta:</b> le sedici voci del §7. Un solo pulsante pieno; timbri, non una barra; all’Oro niente timbri; la frase non dice mai «mancano»; ritratto solo dalla foto del proprietario; insegne come §7.15; barra a tre voci; nessun colore nuovo.<br/><br/>
        <b>Cambia:</b> la forma del ritratto (riquadro, e assente senza foto), la forma dei timbri (caselle numerate a larghezza piena), il filetto sotto la razza (tolto), il sottotitolo del pulsante (tolto), la regola (due righe), un caso nuovo della frase (l’ultimo passo), la testata (simmetrica, pulsante visibile), il margine a 320 (12).<br/><br/>
        <b>Striscia in Home:</b> toccata, perché aveva lo stesso cerchio — diventa un riquadro da 48 con l’icona tessera, o la miniatura del ritratto. <b>Modalità banco: non toccata</b>, come chiesto.
      </P10>
    </RefCard>
  </div>
);

Object.assign(window, { CD10_Misure, CD10_Cerchi, CD10_Valori, CD10_NonTorna });
