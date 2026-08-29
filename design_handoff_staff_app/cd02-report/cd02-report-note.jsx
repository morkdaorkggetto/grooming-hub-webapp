// ═══════════════════════════════════════════════════════════
// CD-02 · TAVOLE — la decisione sugli sconti · le quattro domande · campi ⚠
// ═══════════════════════════════════════════════════════════

const CD2_Sconti = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="«Sconti applicati» — la decisione">
      <div style={{ display: 'flex', gap: 11, marginBottom: 13 }}>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 12, opacity: .55 }}>
          <Eyebrow>prima · un quarto della pagina</Eyebrow>
          <div style={{ fontSize: 26, color: '#b45309', marginTop: 5, ...GH.num, ...GH.serifL }}>0,00 €</div>
          <div style={{ fontSize: 10.5, color: GH.mute, marginTop: 4 }}>per 456 visite di fila</div>
        </div>
        <div style={{ flex: 1, border: '1px solid var(--color-primary)', borderRadius: GH.r.field, padding: 12, background: 'rgba(111,151,146,.06)' }}>
          <Eyebrow color="var(--color-primary)">dopo · non c’è</Eyebrow>
          <div style={{ fontSize: 15, color: GH.ink, marginTop: 6, lineHeight: 1.4, ...GH.serif }}>Torna solo il giorno in cui esiste uno sconto.</div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Tolto dai numeri grandi, non dal prodotto.</b> Delle tre risposte legittime scelgo la prima, e la ragione non è che vale zero: è che <b>uno spazio che non cambia mai smette di essere letto</b>, e trascina con sé i tre riquadri accanto. Chi impara che un quarto della fascia è sempre uguale smette di guardare tutta la fascia.<br/><br/>
        Il campo <span style={GH.num}>discount_percentage</span> resta nello schema e la composizione lo prevede: <b>se una visita ha uno sconto, compare nella sua riga di dettaglio</b> — dove è un fatto di quella visita, non una metrica del salone. E se un giorno gli sconti diventassero una pratica, il numero grande può tornare avendo qualcosa da dire.<br/><br/>
        Nel frattempo i numeri grandi passano da quattro a <b>due</b>: incassato e cani passati. La media per visita non è sparita — è la riga sotto «cani passati», dove sta senza occupare un quarto di pagina.
      </div>
    </RefCard>
    <RefCard title="Grafico e schede giornaliere — erano la stessa cosa due volte">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty', marginBottom: 12 }}>
        Sette schede con visite e incasso, e sotto sette barre con lo stesso incasso. <b>Ridondanza, non rinforzo:</b> il lettore paga due volte lo stesso spazio e deve incrociare due oggetti per una domanda sola («che giorno è andato meglio?»).<br/><br/>
        Diventano <b>una cosa sola: la riga del giorno è la barra.</b> Il fondo colorato è la proporzione, il testo è il valore. Sette righe da 44px al posto di sette schede più un grafico — e la domanda si risponde con un colpo d’occhio, senza incrociare niente.
      </div>
      <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden' }}>
        {[{ dow: 'lun', d: '17', n: 4, eur: 100 }, { dow: 'mar', d: '18', n: 6, eur: 160 }, { dow: 'mer', d: '19', n: 3, eur: 70 }].map((d, i) => <DayBar key={i} d={d} max={160} i={i}/>)}
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 9, textWrap: 'pretty' }}>«Giorno pieno» al posto del «picco dichiarato»: è la stessa informazione detta come la direbbero loro.</div>
    </RefCard>
  </div>
);

const CD2_Domande = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignContent: 'start' }}>
    <RefCard title="1 · A chi parla questa pagina">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Erano due pagine in una, ed è vero. <b>Ho scelto: parla a Davide, e racconta una settimana.</b> «Come sta andando il salone nel tempo» non è una seconda pagina da costruire ora — è <b>una striscia di dodici settimane senza assi</b>, che mostra la forma e non pretende di essere letta a valori.<br/><br/>
        Il titolo cambia di conseguenza: da «Report incassi» a <b>«Come è andata»</b>. E in Dashboard, «Controllo business» diventa <b>«Come è andata»</b>: la stessa cosa, detta senza la parola che nessuno dei due userebbe.
      </div>
    </RefCard>
    <RefCard title="2 · La settimana è l’unità giusta">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Nomino il dubbio e non lo risolvo da sola: probabilmente no.</b> Il salone lavora a giornate e ragiona a mesi; la settimana è l’unità del progettista.<br/><br/>
        Ma la rotta è <span style={GH.num}>/reports/weekly</span> e il brief vieta rotte nuove, quindi non l’ho cambiata. Ho fatto la cosa che si può fare senza rotte: <b>la giornata è diventata la riga</b>, che è l’unità loro, e <b>il mese si vede nella striscia</b> come forma. Se un giorno si potesse aggiungere una vista, la mia proposta sarebbe <b>mensile</b>, con le settimane come righe — esattamente il ribaltamento di questa. <b>Domanda aperta n. 2.</b>
      </div>
    </RefCard>
    <RefCard title="3 · Il confronto, che mancava del tutto">
      <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 11, flexWrap: 'wrap' }}>
        <Delta v={16} big/><Delta v={-57} big/><Delta v={0} big/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Il dato c’era e non si vedeva: bisognava premere un pulsante e <b>ricordare</b> il numero. Adesso il confronto sta <b>dentro il numero grande</b>, non accanto — e sotto c’è scritto per esteso quanto è stata la scorsa, così non serve fidarsi della percentuale.<br/><br/>
        Quando le due settimane sono uguali non mostro «0%»: mostro <b>«come la scorsa»</b>. È la frase che direbbero loro, e una percentuale nulla si legge peggio di tre parole.
      </div>
    </RefCard>
  </div>
);

const CD2_Campi = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[['visits.discount_percentage', 'mai usato in 456 visite: la riga dettaglio lo prevede, i numeri grandi no'], ['visits.issues', '33 visite — note del salone, NON una tassonomia: pallino, mai etichetta'], ['week.previous_total', 'il confronto: il dato esiste, ma va calcolato — non è una colonna'], ['visits→client', 'nome e cognome del proprietario nella riga dettaglio'], ['visits→dog.breed', 'la razza: composta ma non mostrata in questa pagina'], ['salone.closing_days', 'i giorni «chiuso» sono inferiti dall’assenza di visite, non dichiarati']].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', ...GH.num, whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
        L’ultimo è il più insidioso: <b>«chiuso» e «non è passato nessuno» non sono la stessa cosa</b>, e oggi il dato non distingue. Nella composizione ho scritto «chiuso» solo dove lo so per certo dal contesto; <b>se lo schema non lo regge, quella parola va tolta ovunque</b> e resta il trattino. Meglio muti che bugiardi.
      </div>
    </RefCard>
    <RefCard title="Domande aperte — dichiarate, non risolte">
      <QRow n="1" q="«Chiuso» esiste come dato, o lo stiamo deducendo dall’assenza di visite? Un giorno senza cani e un giorno di chiusura si somigliano solo nei numeri."
        mine="senza il dato, la parola «chiuso» va tolta. Un trattino è onesto, «chiuso» a caso no."/>
      <QRow n="2" q="Se si potesse aggiungere una vista, il mese sarebbe più utile della settimana? Loro ragionano a mesi, e la rotta weekly è una scelta ereditata."
        mine="sì, e sarebbe questa stessa pagina ribaltata: settimane come righe. Ma è una rotta nuova, quindi è una vostra decisione."/>
      <QRow n="3" q="Quante lavorazioni di ogni tipo — la domanda che il brief mi chiede di nominare. Il dato NON è ricavabile: i trattamenti sono scritti a mano."
        mine="la distribuzione degli importi è l’unico appiglio onesto, e resta un’inferenza. Se serve il numero vero, servirebbe un campo strutturato che oggi non c’è — e sarebbe un lavoro sul form visita, non sul report."/>
      <QRow n="4" q="Le righe che raccontano un’assenza contano come «visite registrate»? Oggi sì, e il conteggio le include."
        mine="le tengo dentro, a 0 €, con il fondo attenuato: sono successe. Ma se «18 visite» deve voler dire «18 cani lavati», il numero è un altro e va deciso da voi."/>
      <QRow n="5" q="Serve stampare o esportare la settimana? Non l’ho composto perché nessuno l’ha chiesto, ma un report è la pagina dove la domanda arriva."/>
    </RefCard>
  </div>
);

Object.assign(window, { CD2_Sconti, CD2_Domande, CD2_Campi });
