// ═══════════════════════════════════════════════════════════
// CD-11 · KIT — la tessera apre l'app.
// Decisione: la tessera non diventa una pagina in più davanti alla Home.
// DIVENTA LA CIMA DELLA HOME, per chi ha un cane solo. L'app si apre su
// Home come sempre, la barra resta a tre voci con Home attiva, e quello
// che la Home mostrava prima continua SOTTO la tessera, nella stessa pagina.
// Riusa CD-10 senza toccarlo. Nessun colore nuovo.
// ═══════════════════════════════════════════════════════════

const DEV11 = { w: 375, h: 812, status: 24 };

// ── Testata della Home: niente «indietro», perché non c'è un prima. ──
// Stessa griglia simmetrica 44 | 1fr | 44 di CD-10: le due colonne restano
// vuote e tengono il titolo al centro, come su tutte le altre pagine.
const Testata11 = () => (
  <div style={{ height: G10.head, padding: '0 16px', display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', flexShrink: 0 }}>
    <span/>
    <div style={{ textAlign: 'center', fontSize: 18, color: GH.ink, whiteSpace: 'nowrap', ...GH.serifL }}>ZavaRoby pet station</div>
    <span/>
  </div>
);

// ── L'AVVISO. Sta SOPRA la tessera, prima cosa letta dopo l'insegna. ──
// Fondo e testo warning: non un errore (danger) e non un'informazione
// (neutro) — è «tocca a te». Una riga sola, alto 56: non ruba la scena
// alla tessera, ma è la prima cosa che si incontra e non si chiude.
// Senza il nome del cane: l'avviso compare solo nella Home di chi ha un cane
// solo, e il nome è già scritto grande nella tessera subito sotto. Così il
// testo è fisso e corto, e non dipende da quanto è lungo un nome.
const CASI = {
  data: { t: () => 'Scegli un’altra data', a: 'Scegli un’altra data' },
  orari: { t: () => 'Scegli un orario', a: 'Scegli un orario' },
};
const NUM = ['', 'Una', 'Due', 'Tre', 'Quattro'];

const Avviso = ({ items, pet }) => {
  if (!items || !items.length) return null;
  const uno = items.length === 1;
  const c = uno ? CASI[items[0]] : null;
  return (
    <button style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', borderRadius: 14, border: '1px solid var(--color-warning-border)', background: 'var(--color-warning-bg)', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}>
      <span style={{ position: 'relative', width: 32, height: 32, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name="bell" size={17} color="var(--color-warning-text)" stroke={2}/>
        {!uno && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 999, background: 'var(--color-warning-text)', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'grid', placeItems: 'center', ...GH.num }}>{items.length}</span>}
      </span>
      <span style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 650, color: 'var(--color-warning-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {uno ? c.t(pet) : `${NUM[items.length] || items.length} richieste aspettano te`}
      </span>
      <Icon name="chevron" size={18} color="var(--color-warning-text)" stroke={2}/>
    </button>
  );
};

// ── IL FOGLIO: l'avviso fa il gesto, non porta a una scheda. ──
// Sale dal basso sopra la Home. Il perché sta nella prima riga del foglio,
// non nell'avviso. Si chiude con «Annulla»: l'avviso resta finché il gesto
// non è fatto.
const Chip11 = ({ children, on, sub }) => (
  <div style={{ minHeight: 54, borderRadius: 12, border: on ? '2px solid var(--color-primary)' : `1px solid ${GH.bd}`, background: on ? 'var(--gh-tint)' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 4px' }}>
    <span style={{ fontSize: 14, fontWeight: 650, color: GH.ink, ...GH.num }}>{children}</span>
    {sub && <span style={{ fontSize: 11, color: GH.mute, marginTop: 1 }}>{sub}</span>}
  </div>
);
const Pieno11 = ({ children }) => (
  <button style={{ width: '100%', height: 54, borderRadius: 14, border: 'none', background: 'var(--color-primary-hover)', color: '#fbf6f3', fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>{children}</button>
);
const Annulla11 = () => (
  <button style={{ width: '100%', height: 44, border: 'none', background: 'transparent', color: GH.mute, fontSize: 14, fontWeight: 650, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Annulla</button>
);

const Foglio = ({ kind }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,37,.42)', display: 'flex', alignItems: 'flex-end', zIndex: 10 }}>
    <div style={{ width: '100%', background: 'var(--color-surface-main)', borderRadius: '22px 22px 0 0', padding: '10px 20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ width: 40, height: 4, borderRadius: 999, background: GH.bd, margin: '0 auto 4px' }}/>
      {kind === 'data' && <>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, color: GH.ink, ...GH.serifL }}>Scegli un’altra data</div>
          <div style={{ fontSize: 13, color: GH.mute, marginTop: 5 }}>La data chiesta non è disponibile.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          <Chip11 sub="gio">8</Chip11><Chip11 sub="ven" on>9</Chip11><Chip11 sub="sab">10</Chip11><Chip11 sub="mar">13</Chip11>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Chip11 on>Mattina</Chip11><Chip11>Pomeriggio</Chip11>
        </div>
        <Pieno11>Invia la richiesta</Pieno11>
        <Annulla11/>
      </>}
      {kind === 'orari' && <>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, color: GH.ink, ...GH.serifL }}>Scegli un orario</div>
          <div style={{ fontSize: 13, color: GH.mute, marginTop: 5 }}>Il salone propone questi due.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Chip11 sub="giovedì 8 ottobre">10:00</Chip11><Chip11 sub="giovedì 8 ottobre">15:30</Chip11>
        </div>
        <button style={{ height: 44, border: 'none', background: 'transparent', color: 'var(--color-primary-hover)', fontSize: 14, fontWeight: 650, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Nessuno va bene: chiedi un’altra data</button>
        <Annulla11/>
      </>}
      {kind === 'due' && <>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, color: GH.ink, ...GH.serifL }}>Due richieste aspettano te</div>
        </div>
        {[['La data chiesta non è disponibile.', 'Scegli un’altra data'], ['Il salone propone altri orari.', 'Scegli un orario']].map(([t, a]) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 60, padding: '0 14px', border: `1px solid ${GH.bd}`, borderRadius: 14, background: '#fff' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 650, color: GH.ink }}>{a}</span>
              <span style={{ display: 'block', fontSize: 12, color: GH.mute, marginTop: 2 }}>{t}</span>
            </span>
            <Icon name="chevron" size={18} color={GH.mute}/>
          </div>
        ))}
        <Annulla11/>
      </>}
    </div>
  </div>
);

// ── La scheda che chiede il gesto — resta SOLO nella Home di chi ha più cani. ──
// Con un cane solo l'avviso fa direttamente il gesto (Foglio), e la scheda
// ripeterebbe l'avviso.
// `pet` solo nella Home di chi ha più cani: con un cane solo il nome è già
// scritto grande nella tessera sopra, e ripeterlo è rumore.
const Richiesta = ({ k, pet, arrivo }) => {
  const r = {
    data: { e: 'Richiesta da riprogrammare', t: pet ? `La data chiesta per ${pet} non è disponibile. Scegli un’altra data e riproviamo.` : 'Scegli un’altra data e riproviamo.', a: 'Scegli un’altra data' },
    orari: { e: 'Altri orari proposti', t: pet ? `Per ${pet} il salone propone giovedì alle 10:00 o alle 15:30.` : 'Il salone propone giovedì alle 10:00 o alle 15:30.', a: 'Scegli un orario' },
  }[k];
  return (
    <div style={{ padding: '14px 16px', background: 'var(--color-surface-main)', border: arrivo ? '2px solid var(--color-primary)' : `1px solid ${GH.bd}`, borderRadius: 18, boxShadow: arrivo ? '0 0 0 4px var(--gh-tint)' : 'none' }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 700, color: 'var(--color-warning-text)' }}>{r.e}</div>
      <div style={{ fontSize: 14, color: GH.ink, marginTop: 6, lineHeight: 1.45, textWrap: 'pretty' }}>{r.t}</div>
      <button style={{ marginTop: 12, height: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${GH.bd}`, background: '#fff', fontSize: 14, fontWeight: 650, color: GH.ink, cursor: 'pointer', fontFamily: 'inherit' }}>{r.a}</button>
    </div>
  );
};

const Ghost11 = ({ label, h }) => (
  <div style={{ height: h, borderRadius: 18, border: `1px dashed ${GH.bd}`, display: 'grid', placeItems: 'center', fontSize: 11, color: GH.mute }}>{label}</div>
);

// Riga di piega: il primo schermo finisce qui (sopra la barra).
const Piega = ({ y, label }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, borderTop: '1.5px dashed var(--color-danger-text)', pointerEvents: 'none', zIndex: 5 }}>
    <span style={{ position: 'absolute', right: 8, top: -20, fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--color-danger-text)', borderRadius: 4, padding: '2px 6px' }}>{label}</span>
  </div>
);

// ── LA HOME DI CHI HA UN CANE SOLO ──
// Dall'alto: testata · [avviso] · tessera CD-10 · Mostra al banco · il resto
// della Home com'è oggi (le richieste da fare per prime). `scroll` sposta il
// contenuto per mostrare dove porta il tocco sull'avviso.
// ── L'invito, compatto: una riga sola. Nella Home viene subito dopo il
// pulsante e deve stare nel primo schermo per intero; quello di CD-10 (icona
// sopra, testo sotto) era alto il doppio e finiva tagliato dalla barra. ──
const Invito11 = () => (
  <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 12px', border: `1px dashed ${GH.bd}`, borderRadius: 12, background: '#fff', whiteSpace: 'nowrap' }}>
    <Icon name="tessera" size={18} color="var(--color-primary)" stroke={1.8}/>
    <span style={{ fontSize: 12.5, color: GH.mute }}><b style={{ color: GH.ink }}>Tienila a portata:</b> aggiungila alla Home.</span>
  </div>
);

const HomeUno = ({ s, items = [], scroll = 0, h = DEV11.h, piega, invito, foglio }) => (
  <div style={{ width: DEV11.w, height: h, borderRadius: 28, overflow: 'hidden', background: GH.page, boxShadow: '0 18px 44px rgba(43,37,37,.16)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <div style={{ height: DEV11.status, flexShrink: 0 }}/>
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        <Testata11/>
        <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: G10.gapBlock }}>
          {items.length > 0 && <Avviso items={items} pet={s.pet}/>}
          <Tessera10 s={s}/>
          <BancoBtn/>
          {invito && <Invito10/>}
          <div style={{ height: 12 }}/>
          <Ghost11 label="sotto: prossimo appuntamento e il resto della Home, invariati" h={44}/>
        </div>
      </div>
      {piega && <Piega y={h - DEV11.status - 64 - 1} label="fine del primo schermo"/>}
    </div>
    <TabBar on="home"/>
    {foglio && <Foglio kind={foglio}/>}
  </div>
);

// ── LA HOME DI CHI HA PIÙ CANI: si apre all'altezza delle tessere. ──
// Ordine nuovo: quello che aspetta te, poi le tessere, poi il resto.
const HomePiu = ({ cani, items = [] }) => (
  <div style={{ width: DEV11.w, height: DEV11.h, borderRadius: 28, overflow: 'hidden', background: GH.page, boxShadow: '0 18px 44px rgba(43,37,37,.16)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: DEV11.status, flexShrink: 0 }}/>
    <Testata11/>
    <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {items.map(([k, p]) => <Richiesta key={k + p} k={k} pet={p}/>)}
      {cani.map(c => <HomeStrip10 key={c.pet} s={c}/>)}
      <Ghost11 label="prossimo appuntamento · invariato" h={96}/>
    </div>
    <TabBar on="home"/>
  </div>
);

Object.assign(window, { DEV11, Testata11, CASI, Avviso, Foglio, Richiesta, Ghost11, Piega, Invito11, HomeUno, HomePiu });
