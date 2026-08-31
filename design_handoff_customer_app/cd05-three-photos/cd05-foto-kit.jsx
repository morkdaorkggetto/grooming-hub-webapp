// ═══════════════════════════════════════════════════════════
// CD-05 · KIT LE TRE FOTOGRAFIE
// Non ricompongo il medaglione di CD-04: dico come si comporta quando
// le fotografie diventano due. Nessun colore nuovo, nessun token nuovo.
// ═══════════════════════════════════════════════════════════

// ── Segnaposto fotografia. Grigi diversi per distinguerle a vista: ──
// nessuna imagery disegnata, il posto è dimensionato per riceverla.
const Ph = ({ kind = 'ritratto', r = 0, bare, style = {} }) => {
  const g = {
    ritratto: 'linear-gradient(150deg,#cfc1c4,#9d8a8e)',
    banco: 'linear-gradient(150deg,#b9c4c2,#7d918e)',
    album: 'linear-gradient(150deg,#d8cbc4,#a2938c)',
  }[kind];
  return (
    <div style={{ width: '100%', height: '100%', background: g, borderRadius: r, display: 'grid', placeItems: 'center', ...style }}>
      {!bare && <span style={{ fontSize: 9, color: 'rgba(251,246,243,.9)', letterSpacing: '.14em', textTransform: 'uppercase' }}>{kind === 'banco' ? 'riconoscimento' : kind}</span>}
    </div>
  );
};

// ── IL MEDAGLIONE A DUE FOTOGRAFIE ────────────────────────────────
// CD-04 intatto. Cambia una cosa sola: una pastiglia in basso a destra,
// il CONTROCAMPO. Chi sta al centro dipende da chi guarda.
// Toccare la pastiglia scambia le due — nessuna pagina, nessuna rotta.
const DualMedallion = ({ size = 132, main, side, tier, label }) => {
  const ring = tier && tier !== 'base' ? `var(--tier-${tier})` : 'rgba(111,151,146,.30)';
  const pill = Math.round(size * .34);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `2px solid ${ring}`, padding: 5 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 999, overflow: 'hidden', background: 'var(--gh-tint)', display: 'grid', placeItems: 'center' }}>
          {main ? <Ph kind={main}/> : <Icon name="paw" size={size * .42} color="var(--color-primary)" stroke={1.5}/>}
        </div>
      </div>
      {side && (
        <div style={{ position: 'absolute', right: -2, bottom: -2, width: pill, height: pill, borderRadius: 999, border: '2px solid var(--color-bg-main)', overflow: 'hidden', background: 'var(--gh-tint)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Ph kind={side} bare/>
        </div>
      )}
      {label && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -22, textAlign: 'center', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 700, color: GH.mute }}>{label}</div>
      )}
    </div>
  );
};

// ── Il pulsante album. Non c'è quando l'album è vuoto: ──
// un pulsante spento ripetuto 288 volte è la barra fedeltà di CD-04 da capo.
const AlbumGesture = ({ n, pet }) => (
  <BigGesture icon="camera" sub={n === 1 ? 'dall’ultima lavorazione' : `le ultime ${n} lavorazioni`}>
    {n === 1 ? `La foto di ${pet}` : `Le foto di ${pet}`}
  </BigGesture>
);

// ── LA GALLERIA — sovrapposizione, non pagina. ──
// Una foto sola è lo stato normale per mesi: se fosse una pagina, si
// navigherebbe verso una pagina con un'immagine e un pulsante indietro.
const AlbumSheet = ({ shots, pet, aperta }) => {
  const uno = shots.length === 1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,37,.52)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: 'var(--color-bg-main)', borderRadius: '20px 20px 0 0', maxHeight: '88%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '15px 18px 12px' }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.19em', fontWeight: 700, color: 'var(--color-primary)' }}>dopo il bagno</div>
            <div style={{ fontSize: 20, color: GH.ink, marginTop: 3, ...GH.serifL }}>{uno ? `${pet}, l’ultima volta` : `${pet} da noi`}</div>
          </div>
          <button style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${GH.bd}`, background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: GH.mute, fontSize: 17, fontFamily: 'inherit' }}>×</button>
        </div>
        <div style={{ padding: '0 18px 18px', overflow: 'hidden' }}>
          {aperta ? (
            <>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden' }}><Ph kind="album"/></div>
              <div style={{ textAlign: 'center', marginTop: 11 }}>
                <div style={{ fontSize: 16, color: GH.ink, ...GH.serif }}>{shots[0].d}</div>
                <div style={{ fontSize: 12, color: GH.mute, marginTop: 2 }}>{shots[0].rel}</div>
              </div>
              <div style={{ marginTop: 14 }}><BigGesture icon="arrow" sub="si apre il menù del telefono">Salva o inoltra</BigGesture></div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: uno ? '1fr' : '1fr 1fr', gap: 11 }}>
                {shots.map((s, i) => (
                  <div key={i} style={{ cursor: 'pointer' }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden' }}><Ph kind="album"/></div>
                    <div style={{ fontSize: 13, color: GH.ink, marginTop: 6, textAlign: 'center', ...GH.serif }}>{s.d}</div>
                    <div style={{ fontSize: 11, color: GH.mute, textAlign: 'center' }}>{s.rel}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: GH.mute, textAlign: 'center', marginTop: 14, lineHeight: 1.5, textWrap: 'pretty' }}>
                {uno
                  ? <>Ne aggiungiamo una a ogni bagno. <b>Toccala</b> per salvarla o mandarla a qualcuno.</>
                  : <>Le ultime quattro. <b>Toccane una</b> per salvarla o mandarla a qualcuno.</>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Il gesto del salone: ALLEGA, non scatta. E sta dove il salone già è. ──
const AttachSlot = ({ done, mobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minHeight: mobile ? 60 : 44, border: `1px dashed ${done ? 'var(--color-primary)' : GH.bd}`, borderRadius: GH.r.field, padding: mobile ? '9px 12px' : '0 12px', background: done ? 'var(--gh-tint)' : '#fff', cursor: 'pointer' }}>
    <div style={{ width: mobile ? 40 : 32, height: mobile ? 40 : 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--gh-tint)', display: 'grid', placeItems: 'center' }}>
      {done ? <Ph kind="album" r={8} bare/> : <Icon name="camera" size={17} color={GH.mute} stroke={1.8}/>}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 650, color: GH.ink }}>{done ? '1 foto allegata' : 'Allega una foto dalla galleria'}</div>
      <div style={{ fontSize: 11.5, color: GH.mute }}>{done ? 'la vedrà il proprietario nella sua pagina' : 'quella che avete già mandato su WhatsApp'}</div>
    </div>
    {!done && <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--color-primary)' }}>Scegli</span>}
  </div>
);

Object.assign(window, { Ph, DualMedallion, AlbumGesture, AlbumSheet, AttachSlot });
