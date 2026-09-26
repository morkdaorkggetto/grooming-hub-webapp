// ═══════════════════════════════════════════════════════════
// CD-09 · TAVOLE — il giudizio · lo storico · il livello a mano · il QR ·
// l'accesso · cosa non torna · campi ⚠
// ═══════════════════════════════════════════════════════════

const Board = ({ children, cols = 2 }) => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 14, alignContent: 'start' }}>{children}</div>
);
const P = ({ children }) => <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>{children}</div>;

const CD9_Giudizio = () => (
  <Board>
    <RefCard title="1 · Un avanzamento che non sembri un giudizio">
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 12, opacity: .6 }}>
          <Eyebrow>la barra</Eyebrow>
          <div style={{ height: 9, borderRadius: 999, background: GH.soft, marginTop: 10, overflow: 'hidden' }}><div style={{ width: '17%', height: '100%', background: 'var(--tier-bronze)' }}/></div>
          <div style={{ fontSize: 12, color: GH.ink, marginTop: 8 }}>17% · ti mancano 5 visite</div>
        </div>
        <div style={{ flex: 1.2, border: '1px solid var(--color-primary)', borderRadius: GH.r.field, padding: 12, background: 'var(--gh-tint)' }}>
          <Eyebrow color="var(--color-primary)">i timbri</Eyebrow>
          <div style={{ marginTop: 10, transform: 'scale(.72)', transformOrigin: '0 0', height: 30 }}><Timbri done={1} of={6}/></div>
          <div style={{ fontSize: 13, color: GH.ink, marginTop: 6, ...GH.serif }}>La prossima è la seconda.</div>
        </div>
      </div>
      <P>
        <b>Stessa informazione, due effetti opposti</b> — e la differenza non sta nelle parole, sta nella forma. Una barra misura <b>quanto manca</b>: il suo fondo vuoto è la cosa più grande del disegno. Sei timbri contano <b>quanto c’è</b>: il vuoto è diviso in sei posti uguali, e il prossimo ha già il bordo pieno.<br/><br/>
        <b>La frase guarda avanti di un passo solo</b>: «la prossima è la seconda», non «ne mancano cinque». È vera, non gonfia niente, e parla della visita che il proprietario sta già pensando di fare — non di un traguardo lontano.<br/><br/>
        <b>La distanza non è taciuta</b>: sotto c’è scritto che il Bronzo arriva alla sesta, e i sei posti sono lì da contare. Chi vuole sapere quanto manca lo sa in un colpo d’occhio; chi non lo cerca non se lo sente dire.<br/><br/>
        <b>Il timbro vuoto è neutro</b> — bianco, bordo tratteggiato. Non grigio, non spento: un posto libero, non un fallimento.
      </P>
    </RefCard>
    <RefCard title="2 · Lo storico bucato — non si dice, e la composizione regge">
      <P>
        <b>Decisione: «contiamo da settembre» non compare.</b> Tre ragioni.<br/><br/>
        <b>Non sarebbe vero.</b> La finestra è di dodici mesi mobili e contiene anche le visite registrate prima di settembre, a buchi. Per alcuni cani conteremmo da marzo, per altri da nessun momento preciso: la frase sarebbe falsa per una parte dei clienti, e non sapremmo per quali.<br/><br/>
        <b>È un problema del salone messo in faccia al cliente.</b> Chi legge «prima non segnavamo» non pensa «ah, ecco perché»: pensa «e cos’altro non segnavate».<br/><br/>
        <b>I timbri lo rendono inutile.</b> L’amaro della barra al 17% nasceva dal giudizio implicito, non dal numero. Contando in avanti, «una visita» non dice «cliente marginale»: dice <b>«la tessera è cominciata»</b>.<br/><br/>
        Al suo posto, sulla tessera, <b>la regola</b>: «Ogni visita da noi è un timbro. Contano quelle degli ultimi 12 mesi.» È onesta su come funziona, non su cosa è mancato — e prepara il proprietario a una cosa vera che va detta prima che accada: <b>i timbri scadono</b>. Vedi la tavola «Cosa non torna», punto 1.
      </P>
    </RefCard>
  </Board>
);

const CD9_Livelli = () => (
  <Board>
    <RefCard title="3 · Chi è già arrivato — e il livello dato a mano">
      <P>
        <b>Se il livello c’è, quanto manca riguarda quello dopo.</b> Sempre. La tessera di un cane Bronzo non mostra mai i timbri del Bronzo: mostra il chip «Bronzo», la frase «Miele è Bronzo.» e sotto <b>«Verso l’Argento: 3 visite di 12»</b>. Nessuna riga può contraddire l’intestazione, perché nessuna riga parla del livello già raggiunto.<br/><br/>
        <b>Livello calcolato e livello a mano hanno la stessa identica tessera.</b> Nessun segno, nessuna data, nessuna frase diversa. È la sola garanzia che un regalo resti un regalo.<br/><br/>
        <b>Per chi l’ha raggiunto davvero</b>, la frase cambia di una parola: «Queste visite contano <b>già</b> per l’Argento: 6 di 12.» Le sei visite del Bronzo stanno anche nella finestra dei 24 mesi, quindi l’Argento <b>non riparte da zero</b> — ed è la cosa più incoraggiante che la tessera possa dire, senza inventare niente. <span style={GH.num}>⚠</span> da verificare sullo snapshot.<br/><br/>
        <b>All’Oro non c’è un «dopo»</b>, e i timbri spariscono: al loro posto il conto della relazione — «41 visite da noi negli ultimi tre anni» — e una riga che dice che è il livello più alto. Nessuna barra piena: sarebbe un traguardo che non porta da nessuna parte.
      </P>
    </RefCard>
    <RefCard title="Il premio — mi sono fermata qui">
      <P>
        La tessera <b>regge senza premio</b>, e l’ho composta così: il livello è un nome e un colore, e dice «vi conosciamo da un pezzo». Nessuna parola promette altro — né «sblocca», né «vantaggi», né «premio».<br/><br/>
        <b>Ma lo dico apertamente: regge meno di quanto reggerebbe.</b> Sei timbri verso un nome sono un gioco gentile; sei timbri verso qualcosa sono una ragione. Oggi il Bronzo non dà nulla di scritto, e la composizione non lo nasconde né lo compensa.<br/><br/>
        <b>È una decisione di Davide, non mia.</b> Se un giorno il Bronzo darà qualcosa, il posto c’è già: una riga sotto la frase, nella stessa voce. Non va aggiunto altro.
      </P>
      <div style={{ marginTop: 13, padding: 11, border: `1px dashed ${GH.bd}`, borderRadius: GH.r.field, background: '#fff' }}>
        <Eyebrow>l’altra strada — i punti</Eyebrow>
        <div style={{ fontSize: 12, color: GH.mute, marginTop: 7, lineHeight: 1.5, textWrap: 'pretty' }}>
          Compare <b>solo se il cane ha almeno un punto</b>: una riga sola sotto i timbri, «C’è anche un’altra strada: 100 punti. {'{Nome}'} ne ha 40.» Con tre movimenti in tutto il database, <b>un indicatore a punti mostrerebbe zero a 373 cani su 374</b>: la strada visibile è quella delle visite.
        </div>
      </div>
    </RefCard>
  </Board>
);

const CD9_Banco = () => (
  <Board>
    <RefCard title="4 · Il QR — due momenti, due protagonisti">
      <P>
        <b>La tessera ha due pubblici, in due momenti diversi</b>, e la composizione non prova a servirli entrambi con la stessa schermata.<br/><br/>
        <b>Quando il proprietario la guarda da solo</b>, il protagonista è il cane e il suo cammino. Il QR c’è — in basso a destra, piccolo, riconoscibile — perché è ciò che fa di una schermata una tessera. Ma non comanda.<br/><br/>
        <b>Quando la mostra al banco</b>, un gesto solo — «Mostra al banco», il pulsante pieno, 54px — apre <b>il QR a tutto schermo</b>: 300px su 375, fondo bianco pieno, nero puro, il nome del cane in grande sotto perché Roby veda subito di chi è. Tutto il resto sparisce. Chi legge il codice non ha bisogno del cammino.<br/><br/>
        <b>La luminosità.</b> Dal web non si può alzare. Ma <b>uno schermo bianco a tutta pagina è la luce più forte che il telefono può emettere</b> a quella luminosità — molto più di un QR piccolo in mezzo a una pagina crema. Il contrasto massimo e la zona di rispetto larga fanno il resto.<br/><br/>
        <span style={GH.num}>⚠</span> <b>Lo schermo non deve spegnersi</b> mentre è girato verso il banco: serve il blocco dello spegnimento, supportato dai telefoni recenti. Da verificare, non da promettere.
      </P>
    </RefCard>
    <RefCard title="5 · Come ci si arriva — la mia scelta">
      <P>
        <b>Nessuna quarta voce nella barra.</b> La barra resta a tre, e non per prudenza: una voce «Tessera» accanto a Home significherebbe che la tessera è un luogo quanto la Home, e non lo è — è <b>un oggetto che si tira fuori</b>.<br/><br/>
        <b>L’accesso dalla Home prende il posto del blocco «Punti».</b> Stesso punto, stessa altezza: la Home non guadagna una sezione, ne cambia una. Il blocco che oggi dice «0 punti» diventa la striscia della tessera — ritratto, «la tessera di Nina», la frase che guarda avanti. <b>Si vede più del blocco di oggi</b>, perché dice qualcosa. Un cane per striscia, se il proprietario ne ha più d’uno.<br/><br/>
        <b>L’icona sulla schermata del telefono è la strada che regge meglio il disegno</b> — la tessera diventa una cosa che si apre con un tocco, come nel wallet. Ma <b>la composizione non dipende da lei</b>: se la verifica tecnica dice di no, la striscia in Home basta da sola. Per questo l’invito ad aggiungerla compare <b>una volta, sotto la tessera</b>, e non alla prima apertura dell’app: si chiede dopo aver mostrato cosa si aggiunge.<br/><br/>
        <b>L’icona «tessera»</b>: un cartoncino con un quadratino in un angolo e due righe. Stesso tratto di zampa e scintilla, e dice «tessera» anche a chi non ha letto la parola — il quadratino è il codice.
      </P>
      <div style={{ display: 'flex', gap: 18, marginTop: 12, alignItems: 'center' }}>
        {['paw', 'sparkle', 'user', 'tessera'].map(n => <div key={n} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', color: n === 'tessera' ? 'var(--color-primary)' : GH.mute }}><Icon name={n} size={22} stroke={1.8}/></div>)}
      </div>
    </RefCard>
  </Board>
);

const CD9_NonTorna = () => (
  <Board>
    <RefCard title="Cosa non torna — dichiarato a parte">
      <QRow n="1" q="I timbri scadono. Con dodici mesi mobili, un cane che salta un’estate PERDE timbri: il proprietario vede tornare vuoto un posto che era pieno."
        mine="è l’unica cosa che la composizione non può addolcire, per questo la regola è scritta sulla tessera dal primo giorno. Ma la domanda vera è a monte: un livello raggiunto si perde? Se il Bronzo sparisce quando la finestra scorre, «Luna è Bronzo» un mese e non il successivo è peggio della barra al 17%."/>
      <QRow n="2" q="Il regalo si può dedurre. Il cartoncino pubblico mostra la scala con le soglie: chi sa che il Bronzo è a 6 visite e vede «Verso l’Argento: 3 di 12» può capire che il suo Bronzo non è calcolato."
        mine="dalla tessera non si deduce, perché la soglia del livello già raggiunto non compare mai. Resta il cartoncino: rischio piccolo, ma esiste. La mitigazione non è mia — è non stampare le soglie sul cartoncino."/>
      <QRow n="3" q="«Appena raggiunto» non si sa. Lo snapshot dice il livello, non QUANDO è stato raggiunto."
        mine="senza una data la tessera non può festeggiare, e non l’ho fatto: lo stato «appena raggiunto» è identico a «ce l’ha». Se si vuole un momento, serve la data — e basterebbe una riga, una volta sola."/>
      <QRow n="4" q="La luminosità non si alza dal web. Il brief chiede un QR leggibile «senza alzare la luminosità a mano»."
        mine="lo schermo bianco pieno è il massimo che si può fare. Se al banco non basta, la risposta non è di composizione: è la medaglietta."/>
    </RefCard>
    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
        {[
          ['snapshot · visite nella finestra del livello DOPO', 'serve per «Verso l’Argento: 3 di 12». Il brief dice «quante mancano»: da confermare che dia anche il conteggio sulla finestra da 24 e 36 mesi'],
          ['snapshot · data di raggiungimento', 'non c’è nell’elenco. Senza, nessuno stato «appena»'],
          ['un livello raggiunto resta?', 'o si ricalcola con la finestra? Cambia tutto il senso della tessera'],
          ['owner_photo_url', 'richiesta in CD-05: esiste ora? Senza, l’iniziale per tutti'],
          ['manifest · pagina di avvio per l’icona', 'un manifest ha una pagina d’avvio sola: verifica di Cowork'],
          ['blocco dello spegnimento schermo', 'per la modalità banco'],
        ].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>⚠ {f.split(' · ')[0]}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{f.includes(' · ') ? <b>{f.split(' · ')[1]} — </b> : null}{d}</span>
          </div>
        ))}
      </div>
      <P>
        <b>Colori:</b> nessuno nuovo. I metalli sono <span style={GH.num}>--tier-*</span>; i fondi chiari e gli inchiostri sono quelli già in <span style={GH.num}>FidelityBadge</span>. L’argento del token su bianco fa 2,6:1: <b>serve ai pieni e ai tratti, mai al testo</b> — il testo d’argento usa l’inchiostro <span style={GH.num}>#4a5668</span>.<br/><br/>
        <b>Aggiunta:</b> l’icona <span style={GH.num}>tessera</span> in <span style={GH.num}>shared-ui.jsx</span>.
      </P>
    </RefCard>
  </Board>
);

Object.assign(window, { CD9_Giudizio, CD9_Livelli, CD9_Banco, CD9_NonTorna });
