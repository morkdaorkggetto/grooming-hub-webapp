// ═══════════════════════════════════════════════════════════
// CD-10 · KIT — la tessera rivista sul vero.
// Meno cerchi: sullo stato normale (niente ritratto, 1–4 timbri) la pagina
// non ne ha nessuno. I timbri restano timbri — cambia la forma, non il senso.
// Griglia dichiarata: base 4, un asse centrale, due margini.
// Nessun colore nuovo.
// ═══════════════════════════════════════════════════════════

// ── LA GRIGLIA. Ogni valore qui è normativo, e il kit non ne usa altri. ──
const G10 = {
  m: w => (w <= 340 ? 12 : 16),          // margine pagina
  pad: w => (w <= 340 ? 16 : 20),        // padding orizzontale della tessera
  padV: 24,                              // padding verticale della tessera
  head: 56,                              // altezza testata
  gapBlock: 12,                          // tessera ↔ pulsante ↔ invito
  r: { card: 22, tile: 10, ctl: 12, foto: 18 },
};
// Il ritmo verticale DENTRO la tessera, in ordine. Codex lo legge come tabella.
const V10 = { insegna: 20, ritratto: 14, nome: 4, chip: 12, frase: 24, sub: 6, timbri: 16, regola: 12, qr: 20 };

// ── Ritratto: un riquadro, non un medaglione. Senza foto NON c'è. ──
// L'iniziale in un cerchio era il cerchio più grande della pagina, per
// il cane che non ha niente da mostrare: la tessera senza foto comincia dal nome.
const Ritratto10 = ({ foto, tier }) => foto ? (
  <div style={{ width: 88, height: 88, borderRadius: G10.r.foto, overflow: 'hidden', background: 'linear-gradient(150deg,#cfc1c4,#9d8a8e)', display: 'grid', placeItems: 'center', boxShadow: tier ? `0 0 0 2px var(--color-surface-main), 0 0 0 3.5px ${TIER[tier].c}` : 'none' }}>
    <span style={{ fontSize: 8.5, color: '#fbf6f3', letterSpacing: '.12em', textTransform: 'uppercase' }}>ritratto</span>
  </div>
) : null;

// ── I TIMBRI: riquadri a larghezza piena, numerati. ──
// Fatto = pieno con la zampa. Prossimo = bordo pieno e numero in primary.
// Libero = bordo tratteggiato e numero grigio. Un posto, non un pallino.
const Tiles = ({ done, of }) => {
  const rows = of <= 6 ? [of] : [Math.ceil(of / 2), Math.floor(of / 2)];
  const h = of <= 6 ? 44 : 36;
  let k = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((n, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${rows[0]},1fr)`, gap: 6 }}>
          {Array.from({ length: n }).map(() => {
            const i = k++, fatto = i < done, prossimo = i === done;
            return (
              <div key={i} style={{ height: h, borderRadius: G10.r.tile, display: 'grid', placeItems: 'center', background: fatto ? 'var(--color-primary)' : '#fff', border: fatto ? 'none' : prossimo ? '1.5px solid var(--color-primary)' : '1.5px dashed var(--color-border)' }}>
                {fatto
                  ? <Icon name="paw" size={h * .42} color="#fbf6f3" stroke={1.8}/>
                  : <span style={{ fontSize: 13, fontWeight: 700, color: prossimo ? 'var(--color-primary)' : 'var(--color-text-secondary)', ...GH.num }}>{i + 1}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── La frase. Nuovo caso: l'ultimo passo. «La prossima è la quarta» +
// «il Bronzo arriva alla quarta» dicevano due volte la stessa cosa. ──
const ORD = ['prima', 'seconda', 'terza', 'quarta', 'quinta', 'sesta'];
const racconto10 = s => {
  if (s.tier === 'gold') return { t: `${s.pet} è Oro.`, sub: `${s.done} visite da noi negli ultimi tre anni.` };
  if (s.tier) {
    const next = { bronze: 'l’Argento', silver: 'l’Oro' }[s.tier];
    return { t: `${s.pet} è ${TIER[s.tier].n}.`, sub: s.carry ? `Queste visite contano già per ${next}: ${s.done} di ${s.of}.` : `Verso ${next}: ${s.done} visite di ${s.of}.` };
  }
  if (s.done === s.of - 1) return { t: 'La prossima è quella del Bronzo.', sub: `${s.done} visite fatte, ne basta una.` };
  if (s.done * 2 === s.of) return { t: 'A metà strada verso il Bronzo.', sub: `Il Bronzo arriva alla ${ORD[s.of - 1]} visita.` };
  return { t: `La prossima è la ${ORD[s.done]}.`, sub: `Il Bronzo arriva alla ${ORD[s.of - 1]} visita.` };
};

// ── La regola, su due righe DECISE. La data non si spezza mai. ──
const Regola = ({ s }) => (
  <div style={{ fontSize: 11.5, color: GH.mute, lineHeight: 1.5, textAlign: 'center' }}>
    {s.tier === 'gold' ? 'Il livello più alto della tessera.' : <>
      <div>Ogni visita da noi è un timbro.</div>
      {!s.dal && <div>Contano le visite <span style={{ whiteSpace: 'nowrap' }}>degli ultimi {s.win} mesi</span>.</div>}
    </>}
  </div>
);

const Tessera10 = ({ s, w = 375 }) => {
  const r = racconto10(s);
  return (
    <div style={{ background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}`, borderRadius: G10.r.card, padding: `${G10.padV}px ${G10.pad(w)}px`, boxShadow: '0 10px 26px rgba(43,37,37,.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.22em', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>Grooming Hub</div>
      {s.foto && <div style={{ marginTop: V10.insegna }}><Ritratto10 foto tier={s.tier}/></div>}
      <div style={{ marginTop: s.foto ? V10.ritratto : V10.insegna, fontSize: s.foto ? 32 : 40, color: GH.ink, lineHeight: 1.05, letterSpacing: '-.02em', ...GH.serifL }}>{s.pet}</div>
      <div style={{ marginTop: V10.nome, fontSize: 13, color: GH.mute, lineHeight: 1.3 }}>{s.breed}</div>
      {s.tier && <div style={{ marginTop: V10.chip }}><TierChip tier={s.tier}/></div>}
      <div style={{ marginTop: V10.frase, fontSize: 19, color: GH.ink, lineHeight: 1.25, ...GH.serif }}>{r.t}</div>
      <div style={{ marginTop: V10.sub, fontSize: 13, color: GH.mute, lineHeight: 1.45 }}>{r.sub}</div>
      {s.tier !== 'gold' && <div style={{ marginTop: V10.timbri, alignSelf: 'stretch' }}>{s.of <= 12 ? <Tiles done={s.done} of={s.of}/> : <Tacche done={s.done} of={s.of}/>}</div>}
      <div style={{ marginTop: V10.regola }}><Regola s={s}/></div>
      <div style={{ marginTop: V10.qr, padding: 6, border: `1px solid ${GH.bd}`, borderRadius: 10, background: '#fff' }}><FakeQR size={76} seed={s.pet.length}/></div>
    </div>
  );
};

// ── Testata: tre colonne SIMMETRICHE 44 | 1fr | 44. ──
// La colonna di destra è vuota apposta: è lei che tiene il titolo al centro.
const Testata = ({ w = 375 }) => (
  <div style={{ height: G10.head, padding: `0 ${G10.m(w)}px`, display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', flexShrink: 0 }}>
    <button aria-label="Indietro" style={{ width: 44, height: 44, borderRadius: G10.r.ctl, border: '1px solid var(--color-border)', background: 'var(--color-surface-main)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--color-text-primary)' }}><Icon name="chevron-left" size={20} stroke={2}/></button>
    <div style={{ textAlign: 'center', fontSize: w <= 340 ? 17 : 18, color: GH.ink, whiteSpace: 'nowrap', ...GH.serifL }}>ZavaRoby pet station</div>
    <span/>
  </div>
);

// ── «Mostra al banco»: l'unico pulsante pieno, e deve sembrarlo. ──
// --color-primary-hover su crema = 3,8:1. Basta per il testo GRANDE
// (≥ 18,66px grassetto): quindi l'etichetta è a 19px/700, su una riga.
const BancoBtn = () => (
  <button style={{ width: '100%', height: 54, borderRadius: 14, border: 'none', background: 'var(--color-primary-hover)', color: '#fbf6f3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 19, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', opacity: 1 }}>
    <Icon name="qr" size={20} stroke={2}/>Mostra al banco
  </button>
);

const Invito10 = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', padding: '14px 16px', border: `1px dashed ${GH.bd}`, borderRadius: 14, background: '#fff', textAlign: 'center' }}>
    <Icon name="tessera" size={22} color="var(--color-primary)" stroke={1.8}/>
    <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.45, textWrap: 'pretty' }}><b style={{ color: GH.ink }}>Tienila a portata.</b> Aggiungila alla schermata Home.</div>
  </div>
);

const Pagina10 = ({ s, w = 375, h = 812, invito }) => (
  <div style={{ width: w, height: h, background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: w > 400 ? 0 : 28, boxShadow: w > 400 ? 'none' : '0 18px 44px rgba(43,37,37,.16)' }}>
    <div style={{ height: w > 400 ? 0 : 24, flexShrink: 0 }}/>
    <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <Testata w={Math.min(w, 390)}/>
      <div style={{ padding: `4px ${G10.m(Math.min(w, 390))}px 0`, display: 'flex', flexDirection: 'column', gap: G10.gapBlock }}>
        <Tessera10 s={s} w={Math.min(w, 390)}/>
        <BancoBtn/>
        {invito && <Invito10/>}
      </div>
    </div>
  </div>
);

// ── Striscia in Home: il cerchio da 48 diventa la miniatura della tessera. ──
const HomeStrip10 = ({ s }) => {
  const r = racconto10(s);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 76, padding: '12px 14px', background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}`, borderRadius: 18 }}>
      {s.foto
        ? <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(150deg,#cfc1c4,#9d8a8e)', flexShrink: 0 }}/>
        : <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gh-tint)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="tessera" size={24} color="var(--color-primary)" stroke={1.8}/></div>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 700, color: 'var(--color-primary)' }}>la tessera di {s.pet}</div>
        <div style={{ fontSize: 15.5, color: GH.ink, marginTop: 4, lineHeight: 1.25, ...GH.serif }}>{r.t}</div>
      </div>
      <Icon name="chevron" size={18} color={GH.mute}/>
    </div>
  );
};

Object.assign(window, { G10, V10, Ritratto10, Tiles, ORD, racconto10, Regola, Tessera10, Testata, BancoBtn, Invito10, Pagina10, HomeStrip10 });
