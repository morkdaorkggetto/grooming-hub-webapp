// ═══════════════════════════════════════════════════════════
// CD-05 · TAVOLE — le cinque domande nominate · la card pubblica · campi ⚠
// ═══════════════════════════════════════════════════════════

const CD5_Colonne = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Una colonna per tre cose — la separazione">
      <div style={{ display: 'flex', gap: 9, marginBottom: 13 }}>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 11, opacity: .6 }}>
          <Eyebrow>oggi</Eyebrow>
          <div style={{ fontSize: 12, color: GH.ink, marginTop: 7, ...GH.num }}>pets.photo_url</div>
          <div style={{ fontSize: 11, color: GH.mute, marginTop: 5, lineHeight: 1.45 }}>tre scopi, un posto. Chi scrive per ultimo vince, e l’altro perde il suo lavoro.</div>
        </div>
        <div style={{ flex: 1.3, border: '1px solid var(--color-primary)', borderRadius: GH.r.field, padding: 11, background: 'var(--gh-tint)' }}>
          <Eyebrow color="var(--color-primary)">la proposta</Eyebrow>
          <div style={{ fontSize: 12, color: GH.ink, marginTop: 7, lineHeight: 1.7, ...GH.num }}>
            pets.photo_url <span style={{ fontFamily: 'var(--font-sans)', color: GH.mute }}>→ resta, ed è del salone</span><br/>
            <span style={{ color: 'var(--color-warning-text)' }}>⚠ pets.owner_photo_url</span><br/>
            <span style={{ color: 'var(--color-warning-text)' }}>⚠ visits.photo_url</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Non è una colonna da arbitrare: sono tre colonne che ne occupano una.</b> Nessuna composizione può risolvere un conflitto di scrittura — se le due foto vivono nello stesso posto, ogni disegno che faccio è un modo elegante di far perdere qualcuno.<br/><br/>
        La colonna attuale <b>resta al salone</b>, e non per anzianità: <b>è l’unica delle tre già popolata</b>. Quei 42 cani con foto sono cani fotografati dal salone al banco — spostarli nella colonna del proprietario vorrebbe dire dichiarare che 42 proprietari hanno scelto una foto che non hanno mai visto.<br/><br/>
        <b>Il permesso di modifica tolto al cliente non va ripristinato: va spostato.</b> Il cliente riprende a scrivere, ma sulla colonna sua — e il salone non ha più bisogno di essere protetto.
      </div>
    </RefCard>

    <RefCard title="Il medaglione con due fotografie — CD-04 non si ricompone">
      <div style={{ display: 'flex', gap: 26, justifyContent: 'center', margin: '6px 0 26px' }}>
        <DualMedallion size={96} main="ritratto" side="banco" label="nell’app"/>
        <DualMedallion size={96} main="banco" side="ritratto" label="al banco"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Il contenitore è quello di <span style={GH.num}>CD-04</span>, invariato: cornice, anello, glifo per il caso senza foto. <b>Cambia una cosa sola: una pastiglia in basso a destra, il controcampo.</b><br/><br/>
        <b>Chi sta al centro dipende da chi guarda</b>, e non è una preferenza configurabile: è la stessa scheda letta da due persone che cercano cose diverse. Al banco vince il riconoscimento perché serve a lavorare; nell’app vince il ritratto perché è l’unica cosa affettiva del prodotto.<br/><br/>
        <b>Toccare la pastiglia scambia le due</b> — dentro la scheda, senza rotte e senza pagine. Il ritorno è lo stesso gesto.<br/><br/>
        <b>Quando la seconda foto non c’è, la pastiglia non c’è.</b> Nessun cerchietto vuoto, nessun «+» in attesa: il medaglione è esattamente quello di CD-04, e l’85% dei cani lo vedrà così per mesi.
      </div>
    </RefCard>
  </div>
);

const CD5_Album = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Il pulsante — e il caso di tutti i cani, oggi">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
        <AlbumGesture n={1} pet="Nina"/>
        <AlbumGesture n={4} pet="Nina"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Quando l’album è vuoto, il pulsante non c’è.</b> È la lezione di CD-04 applicata due volte: un pulsante spento — o peggio, uno che si apre su un vuoto illustrato — ripetuto su 288 cani su 288 è la barra fedeltà da capo, un posto apparecchiato per qualcosa che non è ancora accaduto.<br/><br/>
        Al suo posto <b>una riga sotto il gesto WhatsApp</b>: «Dopo il prossimo bagno troverai qui la sua foto». Dice la stessa cosa in un ventesimo dello spazio, <b>non promette niente che il salone non farà comunque</b>, e non ha un bersaglio che delude chi lo tocca.<br/><br/>
        <b>Il testo del pulsante conta il contenuto</b>, non la funzione: «La foto di Nina» al singolare, «Le foto di Nina» dalla seconda. Non «Galleria», non «Album fotografico» — nessuno chiama così quattro foto del proprio cane.
      </div>
    </RefCard>

    <RefCard title="La galleria è una sovrapposizione — e nessuna rotta nuova">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Non una pagina.</b> Con 1,6 visite di media per cane, la galleria ha <b>una foto sola</b> nella grande maggioranza dei casi: navigare verso una pagina per trovare un’immagine e un pulsante «indietro» è un viaggio più lungo della cosa che si va a vedere.<br/><br/>
        Un foglio che sale dal basso <b>conserva il posto</b>: sotto si intravede la scheda, la chiusura è un gesto sicuro e non «indietro» — che su una pagina pubblica raggiunta da un QR è ambiguo. <b>Zero rotte nuove, come chiesto.</b><br/><br/>
        <b>Una foto sola non si mette in griglia:</b> occupa tutta la larghezza. Da due in su, due colonne. <b>Non quattro miniature con due caselle vuote</b> — la griglia da quattro esiste solo quando ci sono quattro foto.<br/><br/>
        <b>Ogni foto porta la data della lavorazione</b>, e sotto la distanza in parole («due settimane fa»): la data dice quando, la distanza dice quanto tempo è passato, ed è quest’ultima la cosa che una persona sente.<br/><br/>
        <b>Nessun testo dei trattamenti</b>, come da vincolo. Sotto una foto del cane pulito, «non è venuto» sarebbe assurdo — e il campo è un diario, non una didascalia.
      </div>
    </RefCard>

    <RefCard title="Salvare e mandare — un gesto, e non è il nostro">
      <div style={{ marginBottom: 12 }}><BigGesture icon="arrow" sub="si apre il menù del telefono">Salva o inoltra</BigGesture></div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Sì, lo prevedo, ed è <b>un solo pulsante sulla foto aperta</b> — non due (salva / condividi), non un menù. Chi vuole mandare la foto della propria cagnolina alla figlia non deve scegliere fra due verbi nostri: <b>apre il menù del telefono</b>, che conosce già e che contiene WhatsApp, i messaggi e il rullino.<br/><br/>
        <b>Il sottotitolo lo dichiara</b> («si apre il menù del telefono») perché un pulsante che apre un menù di sistema, senza preavviso, sembra un errore.<br/><br/>
        <span style={GH.num}>⚠</span> Su un telefono che non offre quel menù resta il gesto lungo sull’immagine, che è il modo in cui le persone salvano le foto da vent’anni. <b>Non compongo un ripiego</b>: sarebbe un secondo pulsante per un caso che quasi non esiste.
      </div>
    </RefCard>

    <RefCard title="Il gesto del salone: allega, e sta a fine serata">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <AttachSlot/><AttachSlot done/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Nessuno scatto sul momento</b>, come avvisate: se la composizione chiedesse una fotocamera aperta con il cane in braccio, non accadrebbe mai. Il verbo è <b>allega</b>, la sorgente è il rullino, e la foto <b>esiste già</b> — l’hanno fatta per mandarla su WhatsApp.<br/><br/>
        <b>Il posto è dentro la registrazione della visita</b>, non una schermata sua. È il punto in cui il salone passa comunque a fine serata: aggiungere un secondo momento significherebbe aggiungere una cosa da ricordare, e le cose da ricordare a fine serata non si fanno.<br/><br/>
        <b>Facoltativo e senza sollecito.</b> Nessun avviso, nessun «hai dimenticato la foto»: una registrazione senza foto è completa. Se allegare diventa un dovere, quello che si perde non è la foto — <b>è la registrazione</b>.
      </div>
    </RefCard>
  </div>
);

const CD5_Domande = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="1 · Il proprietario vede la foto di riconoscimento?">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Sì, e non al centro: è la pastiglia.</b> Delle tre risposte legittime scelgo la terza — mostrarla altrove.<br/><br/>
        Nasconderla sarebbe una piccola bugia strutturale: è il suo cane, e un giorno la vedrebbe comunque (sul cartoncino, in una conversazione). Metterla al centro sarebbe mostrargli <b>una foto fatta per uno scopo tecnico</b>, spesso l’orecchio piegato o la macchia — e sarebbe la prima cosa che vede aprendo l’unica pagina affettiva del prodotto.<br/><br/>
        <b>La pastiglia risolve la goffaggine spiegandola.</b> Sotto il medaglione c’è una riga: «La foto piccola è quella che usiamo noi al banco per riconoscerlo». Detta così, una foto sgraziata <b>diventa un segno di mestiere</b> invece di una foto brutta — e il proprietario capisce, in una riga, perché la sua serve.
      </div>
    </RefCard>

    <RefCard title="2 · La card pubblica cosa mostra">
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', margin: '4px 0 24px' }}>
        <DualMedallion size={82} main="ritratto" label="c’è il ritratto"/>
        <DualMedallion size={82} main={null} label="c’è solo la tecnica"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Il ritratto se c’è. Se c’è solo la foto di riconoscimento, il medaglione disegnato</b> — non la foto tecnica.<br/><br/>
        La ragione è che la card è un <b>oggetto</b>: un cartoncino stampato che sta in un portafogli e che si mostra a qualcuno. Il medaglione disegnato è modesto ma è <b>una forma compiuta</b>; la foto del dettaglio storto su un cartoncino è un errore visibile a chiunque lo guardi, e chi lo guarda non sa che quella foto ha uno scopo.<br/><br/>
        <b>Nessuna pastiglia sulla card pubblica:</b> il controcampo serve a chi ha un rapporto con le due foto, non a uno sconosciuto in tre secondi.<br/><br/>
        L’album non compare mai — <b>decisione vostra, e la condivido</b>: è del proprietario, non del mondo. Aggiungo una conseguenza: <b>nemmeno il numero</b>. «4 foto» su una pagina pubblica dice che esiste un album e invita a cercarlo.
      </div>
    </RefCard>

    <RefCard title="3 · Il salone vede il ritratto del proprietario?">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Sì, come pastiglia, e per una ragione sola: «ah, è Nina».</b> Costa un ventesimo dello spazio e non tocca il medaglione.<br/><br/>
        Quello che <b>non</b> fa: non entra nelle liste, non entra nell’archivio clienti, non compete col riconoscimento. <b>Al centro resta sempre la foto del salone</b>, e nessun aggiornamento del cliente può spostarla — che è esattamente la protezione per cui il permesso era stato tolto.<br/><br/>
        Se al banco risultasse rumore, <b>è la cosa più economica da togliere di tutta questa composizione</b>: una pastiglia, nessuna conseguenza sul resto. Lo dico perché sia una decisione reversibile e non un’architettura.
      </div>
    </RefCard>

    <RefCard title="4 · Quando il proprietario non ne mette nessuna">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        È <b>il caso più comune anche dopo gli inviti</b>, quindi è quello che ho composto per primo.<br/><br/>
        Nella sua pagina: <b>al centro va la foto del salone</b> — non il glifo. Se una fotografia del suo cane esiste, mostrargli un disegno sarebbe assurdo. Sotto, <b>una volta</b>, un riquadro tratteggiato: «Questa è la foto che facciamo noi, per riconoscerlo. Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto».<br/><br/>
        <b>Tre cose che quel riquadro fa e che un invito normale non fa:</b> spiega perché la foto è quella che è, non chiede di sostituire ma di aggiungere, e <b>promette che la nostra non sparisce</b> — che è la paura simmetrica a quella del salone.<br/><br/>
        <b>Se non ce n’è nessuna delle due</b> (l’85% oggi): glifo al centro, nessuna pastiglia, e <b>nessun invito</b>. Chiedere una foto a chi non ha ancora ricevuto niente è chiedere prima di aver dato — <span style={GH.num}>CD-04</span>, stessa regola. L’invito arriva dopo la prima foto del salone.
      </div>
    </RefCard>
  </div>
);

const CD5_Campi = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 11 }}>
        {[
          ['pets.owner_photo_url', 'NON esiste: è la colonna del ritratto. Senza, la composizione non si regge'],
          ['visits.photo_url', 'NON esiste: la foto dell’album, una per lavorazione'],
          ['una sola foto per visita?', 'compongo per una. Se il salone ne allega tre, l’album da 4 diventa altro'],
          ['upload dal cliente', 'esiste già un canale? Il permesso è stato tolto, ma il meccanismo c’era'],
          ['chi ha caricato una foto', 'per i 42 cani con foto: sono tutte del salone? Lo assumo, ma è un’assunzione'],
          ['MIN(visits.date)', 'ereditato da CD-04, per «la prima volta a marzo»'],
        ].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
        <b>Le prime due sono di natura diversa dalle altre.</b> Non sono campi che «potrebbero non esistere»: <b>non esistono, e lo so</b>. Le marco perché è la prima volta in cinque giri che una mia composizione <b>richiede</b> due colonne nuove — e perché la decisione se aprirle è vostra, non mia.<br/><br/>
        La terza è la più insidiosa: <b>«le ultime quattro foto» presuppone una foto per lavorazione</b>. Se il salone allega tre foto di una toelettatura, «le ultime quattro» diventano una sola visita e la galleria smette di raccontare il tempo.
      </div>
    </RefCard>

    <RefCard title="Domande aperte — dichiarate, non risolte">
      <QRow n="1" q="Le due colonne nuove si aprono? Senza owner_photo_url tutta la composizione cade, e resta solo il conflitto."
        mine="se la risposta è no, la scelta onesta non è arbitrare: è dire al cliente che la foto la mette il salone, e togliere l’invito. Un permesso che si può revocare è peggio di un permesso che non c’è."/>
      <QRow n="2" q="Una foto per lavorazione, o più? Cambia il senso di «le ultime quattro»."
        mine="compongo per una, ed è la scelta che tiene: una foto per bagno è un ritmo, quattro foto di un bagno sono un servizio fotografico che nessuno farà a fine serata."/>
      <QRow n="3" q="I 42 cani con foto: sono tutte foto del salone? Lo assumo per lasciare la colonna attuale al salone."
        mine="se qualcuna fosse stata messa da un proprietario prima della revoca, quel cane si ritrova la foto del proprietario al centro della scheda al banco. Sono pochi casi e si guardano a mano, ma vanno guardati."/>
      <QRow n="4" q="La foto allegata si può togliere o sostituire dopo? Non l’ho composto."
        mine="serve almeno la rimozione, e sta nella visita già registrata — non nell’album del cliente. Una foto sbagliata allegata a fine serata è un caso normale, non un errore raro."/>
      <QRow n="5" q="Il proprietario può togliere una foto dal suo album? È l’unica cosa affettiva del prodotto, e a volte una foto non piace."
        mine="non l’ho composto e non so la risposta giusta. Nascondere solo per sé è la più gentile; cancellare toglie una cosa al salone. Ma è una domanda che qualcuno farà."/>
    </RefCard>
  </div>
);

Object.assign(window, { CD5_Colonne, CD5_Album, CD5_Domande, CD5_Campi });
