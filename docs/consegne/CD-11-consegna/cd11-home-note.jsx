// ═══════════════════════════════════════════════════════════
// CD-11 · TAVOLE — gli effetti misurati · la decisione · l'avviso · cosa non torna
// ═══════════════════════════════════════════════════════════

const P11 = ({ children }) => <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>{children}</div>;
const Cell = ({ v, ok, head }) => (
  <span style={{ fontSize: head ? 10 : 12, fontWeight: head ? 700 : ok == null ? 650 : 700, textTransform: head ? 'uppercase' : 'none', letterSpacing: head ? '.12em' : 0, color: head ? GH.mute : ok == null ? GH.ink : ok ? 'var(--color-success-text)' : 'var(--color-danger-text)', ...GH.num }}>{v}</span>
);

// Primo schermo disponibile = fondo della barra meno inizio del contenuto
// (stato 24 + testata 56 + 4). Contenuti MISURATI sul rendering, non stimati.
const SCHERMI = [['375 × 812', 664], ['375 × 667', 519], ['320 × 568', 420]];
const CASI_M = [
  ['tessera senza ritratto', 482],
  ['+ un avviso (o più: è sempre uno)', 550],
  ['tessera con ritratto e livello', 665],
];

const CD11_Misure = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Gli effetti, misurati prima di comporre — «Mostra al banco» sta nel primo schermo?">
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(3,1fr)', gap: '9px 12px', alignItems: 'baseline' }}>
        <Cell head v="fino al pulsante"/>{SCHERMI.map(([n, a]) => <Cell key={n} head v={`${n} · ${a}`}/>)}
        {CASI_M.map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ fontSize: 12, color: GH.ink }}>{k} <span style={{ color: GH.mute, ...GH.num }}>· {v}</span></span>
            {SCHERMI.map(([n, a]) => <Cell key={n} ok={v <= a} v={v <= a ? `entra · ${a - v}` : `fuori · ${v - a}`}/>)}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 13, paddingTop: 11, borderTop: `1px solid ${GH.bdSoft}` }}>
        <P11>
          <b>Primo schermo</b> = dall’inizio del contenuto (stato + testata 56 + 4) al bordo alto della <b>barra</b>. La barra è la novità che costa: in CD-10 la pagina della tessera non l’aveva. <b>Misure prese sul rendering</b> della composizione, fino al fondo di «Mostra al banco». L’avviso è una riga sola, alto 56 + 12. Con più richieste resta un avviso solo, quindi l’altezza non cambia. L’invito sta <b>sotto</b> il pulsante e non sposta niente.
        </P11>
      </div>
    </RefCard>
    <RefCard title="Cosa dicono i numeri">
      <P11>
        <b>Sul telefono di Luigi (812) il caso normale entra tutto</b>, anche con l’avviso. Avanzano 114px.<br/><br/>
        <b>Sui telefoni da 667 — gli iPhone SE e gli 8, ancora diffusi — l’avviso spinge il pulsante 31px sotto la barra.</b> È l’effetto che la decisione introduce: senza avviso entra (avanzano 37px), con l’avviso no.<br/><br/>
        <b>La tessera con ritratto e livello è al limite già su 812</b>: il pulsante tocca la barra (1px sotto). Era vero anche in CD-10, ma lì non c’era la barra.<br/><br/>
        <b>Cosa ne ho fatto.</b> Non ho compresso la griglia di CD-10, che resta intatta come chiesto. Ho reso <b>toccabile anche il QR sulla tessera</b>: apre la stessa modalità banco. Su 667 con l’avviso il QR finisce a 536, sopra la barra a 603, quindi <b>resta nel primo schermo</b> dove il pulsante non ci sta. Toccare il codice per ingrandirlo è anche il gesto che una persona prova per prima.<br/><br/>
        Per la tessera con ritratto, su 667 anche il QR resta sotto: è la minoranza, ed è dichiarato in «Cosa non torna».
      </P11>
    </RefCard>
  </div>
);

const CD11_Scelta = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="La testata e la barra — la tessera è la cima della Home">
      <P11>
        <b>La tessera non diventa una pagina davanti alla Home: diventa la sua cima.</b> L’app si apre su Home come sempre; per chi ha un cane solo, la prima cosa della Home è la tessera intera, e sotto continua tutto quello che la Home mostrava già.<br/><br/>
        <b>Perché così.</b> Una pagina in più davanti alla Home avrebbe avuto bisogno di una via d’uscita: un «indietro» che porta avanti, o una quarta voce, o la barra con nessuna voce accesa. Mettendola in cima alla Home, nessuno dei tre problemi esiste:
      </P11>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>
        {[['barra', 'resta a tre voci, con Home accesa: la tessera è la Home'], ['testata', 'niente «indietro», perché non c’è un prima. La griglia 44 | 1fr | 44 resta, con le colonne vuote'], ['avviso → gesto', 'il tocco apre direttamente la scelta in un foglio dal basso: nessuna scheda da raggiungere, nessuno scorrimento'], ['icona sul telefono', 'il dubbio di CD-09 sulla pagina di avvio sparisce: si apre sulla Home, che è la tessera']].map(([k, v]) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '118px 1fr', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GH.ink }}>{k}</span><span style={{ fontSize: 12, color: GH.mute, lineHeight: 1.45 }}>{v}</span>
          </div>
        ))}
      </div>
      <P11>
        <b>Il saluto «Buongiorno, Chiara» non c’è più</b> nella Home di chi ha un cane solo: la tessera fa da saluto, e il saluto spingeva il pulsante più in basso.
      </P11>
    </RefCard>
    <RefCard title="La Home — cosa cambia e cosa no">
      <P11>
        <b>Un cane solo.</b> La striscia della tessera sparisce: la tessera è già lì, intera. <b>Spariscono anche le schede delle richieste da fare</b>: ripetevano l’avviso, che ora fa il gesto da solo. Sotto il pulsante la Home è com’è oggi.<br/><br/>
        <b>Più cani.</b> La Home si apre come oggi ma con un ordine nuovo: <b>le richieste da fare, poi le strisce delle tessere, poi il resto</b>. Le strisce salgono dal fondo alla cima, ed è questo «all’altezza delle tessere». Qui l’avviso non serve: le schede da fare sono già la prima cosa. Toccando una striscia si apre la pagina della tessera di CD-10, <b>con il suo «indietro»</b>, che lì ha ancora senso.<br/><br/>
        <b>Invariati:</b> prossimo appuntamento, il resto della Home, la modalità banco, la griglia della tessera.<br/><br/>
        <b>L’invito «Tienila a portata»</b> resta, una volta, sotto il pulsante: aggiungere l’app alla schermata Home ora vuol dire aprire direttamente sulla tessera, quindi è ancora più vero.
      </P11>
    </RefCard>
  </div>
);

const CD11_Avviso = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="L’avviso — i due casi, e più d’uno insieme">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 343, marginBottom: 14 }}>
        <Avviso items={['data']} pet="Rumba"/>
        <Avviso items={['orari']} pet="Rumba"/>
        <Avviso items={['data', 'orari']} pet="Rumba"/>
      </div>
      <P11>
        <b>Una riga sola: il gesto e basta.</b> «Scegli un’altra data», «Scegli un orario». Il perché sta nella scheda sotto, e <b>il nome del cane non serve</b>: l’avviso compare solo nella Home di chi ha un cane solo, e il nome è scritto grande nella tessera subito sotto. Senza nome il testo è fisso e corto, quindi non si tronca a nessuna larghezza, nemmeno a 320. Il verbo è lo stesso del pulsante della scheda, così il proprietario lo riconosce quando ci arriva.<br/><br/>
        <b>Più d’uno insieme: un avviso solo, mai una pila.</b> Il numero sulla campanella e «Due richieste aspettano te». Due avvisi impilati avrebbero spinto la tessera giù di 68px e cominciato a <b>rubarle la scena</b>.
      </P11>
    </RefCard>
    <RefCard title="Non ruba la scena, e non si può ignorare">
      <P11>
        <b>Non ruba la scena:</b> una riga alta 56, larga quanto la tessera, sopra di lei. Niente rosso, niente animazione, niente sovrapposizione: il colore warning è quello di «tocca a te», non di «qualcosa è andato storto». La tessera resta l’oggetto più grande della pagina.<br/><br/>
        <b>Non si può ignorare:</b> è la <b>prima cosa che si legge</b> sotto l’insegna, ed è l’unica cosa colorata prima della tessera. <b>Non ha una ×</b>: sparisce solo quando il gesto è fatto. Un avviso chiudibile sarebbe stato chiuso il primo giorno, e il salone sarebbe tornato ad aspettare.<br/><br/>
        <b>Il tocco fa il gesto.</b> «Scegli un’altra data» apre un foglio con la scelta del giorno e della fascia, e in testa il perché: «La data chiesta non è disponibile». «Scegli un orario» apre i due orari proposti, da toccare, più «Nessuno va bene: chiedi un’altra data». Con più richieste il foglio le elenca, ognuna col suo gesto. <b>Non c’è più una scheda in fondo alla Home che ripete l’avviso</b>, e non serve scorrere.<br/><br/>
        <b>Annulla</b> chiude il foglio, non l’avviso: l’avviso resta finché il gesto non è fatto.<br/><br/>
        <b>Cosa non è un avviso:</b> una richiesta in attesa del salone, un appuntamento confermato. Lì il proprietario aspetta, e la tessera resta come in CD-10.
      </P11>
    </RefCard>
  </div>
);

const CD11_NonTorna = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Cosa non torna">
      <QRow n="1" q="Sui telefoni da 667, con l’avviso, «Mostra al banco» finisce 31px sotto la barra."
        mine="il QR toccabile lo copre, perché resta nel primo schermo. Ma è un ripiego: chi non sa che il codice si tocca deve scorrere. L’alternativa sarebbe stringere la tessera quando c’è un avviso, e CD-10 dice di non toccarla."/>
      <QRow n="2" q="La tessera con ritratto e livello è al limite già su 812: il pulsante tocca la barra. Su 667 resta sotto anche il QR."
        mine="è la minoranza (Bronzo e ritratto insieme). Se cresce, la cosa da rivedere è il ritratto da 88 quando c’è anche il livello, non l’avviso."/>
      <QRow n="3" q="Chi ha un cane solo perde il saluto «Buongiorno, Chiara»."
        mine="l’ho tolto per misura, non per gusto: con il saluto il pulsante usciva anche sul telefono di Luigi con un avviso. Se il salone ci tiene, il posto giusto è la testata, non sopra la tessera."/>
      <QRow n="4" q="Con un cane solo, in Home non resta traccia della richiesta a parte l’avviso."
        mine="è voluto: la scheda ripeteva l’avviso. L’avviso non si chiude finché il gesto non è fatto, quindi non si perde. Il foglio della data è composto in forma semplice (quattro giorni, due fasce): la scelta vera la prende Codex dal flusso che esiste già."/>
    </RefCard>
    <RefCard title="Campi da verificare">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[['quante richieste «da fare» ha un cane', 'la definizione la prende Codex dal codice: i due casi composti sono quelli che chiedono un gesto'], ['numero di cani del proprietario', 'decide quale Home si apre: uno → tessera in cima, più → richieste e strisce'], ['QR toccabile', 'apre la stessa modalità banco del pulsante; nessuna modalità nuova']].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 13, paddingTop: 11, borderTop: `1px solid ${GH.bdSoft}` }}>
        <P11><b>Nessun colore nuovo.</b> L’avviso usa <span style={GH.num}>--color-warning-bg</span>, <span style={GH.num}>-border</span>, <span style={GH.num}>-text</span>, già in uso dalla coda richieste di CD-01.</P11>
      </div>
    </RefCard>
  </div>
);

Object.assign(window, { CD11_Misure, CD11_Scelta, CD11_Avviso, CD11_NonTorna });
