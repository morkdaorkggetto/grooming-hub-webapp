// ═══════════════════════════════════════════════════════════
// CD-03 · TAVOLE — le quattro domande di composizione · campi ⚠ · domande aperte
// ═══════════════════════════════════════════════════════════

const CD3_Domande = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="1 · Cosa dice una riga-settimana">
      <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden', marginBottom: 12 }}>
        <WeekRow w={{ label: '6 – 12 aprile', g: 5, n: 34, eur: 840 }} max={840} i={0}/>
        <WeekRow w={{ label: '8 – 14 giugno', g: 0, n: 0, eur: 0 }} max={840} i={1}/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Quattro cose, in quest’ordine: <b>intervallo, giorni lavorati, cani, incassato</b>. I giorni vengono prima dei cani deliberatamente — sono la scala di lettura di tutto il resto. Luglio fa quasi il doppio dei cani di marzo <em>e</em> 23 giorni contro 14: senza quel numero «110 contro 67» dice una cosa falsa.<br/><br/>
        <b>La settimana ferma non è un trattino.</b> Un giorno vuoto dentro una settimana è un buco; una settimana vuota dentro un mese è <b>un fatto largo</b>, e merita parole: «settimana ferma — non è passato nessuno», su fondo <span style={GH.num}>--gh-absent</span>, lo stesso delle righe di assenza in CD-02. Nessuna icona, nessun avviso: <b>non è un errore, è agosto</b>.
      </div>
    </RefCard>

    <RefCard title="2 · Il mese incompleto — nessuna proiezione">
      <PartialNote giorni={29} tot={31} prevSpan={2790} prevFull={3030}/>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Delle tre strade — riga che manca, nota, pro-quota — <b>scelgo la nota e rifiuto il pro-quota</b>. Una proiezione a fine mese è un numero inventato con l’aria di essere misurato: la cosa peggiore che questa pagina può fare.<br/><br/>
        Ma la nota da sola non basta, perché <b>il numero grande resta accanto a un confronto</b>. Quindi il confronto cambia base: <b>primi 29 giorni contro primi 29 giorni di luglio</b>, non contro luglio intero. È la stessa query con due date diverse — <span style={GH.num}>⚠ una seconda chiamata</span>, non un campo nuovo.<br/><br/>
        Nella striscia il mese in corso è <b>tratteggiato</b>: si vede che è una barra ancora in crescita e non un mese magro.
      </div>
    </RefCard>

    <RefCard title="3 · Il confronto che i dati reggono">
      <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 11, flexWrap: 'wrap' }}>
        <Delta v={120} big/><Delta v={-25} big/><Delta v={-37} big/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        A mesi il confronto utile è <b>il mese scorso</b>, e basta. <b>«Lo stesso mese dell’anno prima» non esiste</b> fino a marzo 2027: non lo prometto, e soprattutto <b>non lascio vuoto lo spazio dove starebbe</b> — un posto apparecchiato per un dato che non c’è invita a riempirlo con una stima.<br/><br/>
        Resta vera la regola di CD-02: quando i due periodi coincidono si scrive <b>«come il mese scorso»</b>, non «0%».<br/><br/>
        Le tre percentuali qui sopra sono aprile su marzo, giugno su maggio, agosto-parziale su luglio-parziale. La terza <b>non è</b> agosto su luglio intero: quella direbbe −42% e sarebbe falsa.
      </div>
    </RefCard>

    <RefCard title="4 · L’interruttore">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <UnitSwitch unit="settimana"/><UnitSwitch unit="mese"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Sta dentro il navigatore, in testa, prima delle frecce.</b> Non in un menù e non fra i filtri: cambiare unità e cambiare periodo sono lo stesso gesto a due scale, e la mano che va alle frecce deve trovarlo lì.<br/><br/>
        <b>Passando da settimana a mese resta la data al centro</b>, non si torna al presente: dalla settimana 17–23 agosto si arriva ad agosto. Tornare al presente sarebbe perdere il posto, e il posto è l’unica cosa che il lettore stava tenendo.<br/><br/>
        <b>Da mese a settimana</b> serve una regola in più, perché un mese contiene cinque settimane: si arriva sulla <b>settimana corrente</b> se il mese è quello in corso, altrimenti sulla <b>prima settimana del mese</b>. E c’è una scorciatoia migliore del bottone: <b>toccare una riga-settimana</b> porta al modo settimana su quella settimana. Scendere di scala è un gesto sul dato, non sull’interruttore.<br/><br/>
        <b>Le frecce significano la stessa cosa in entrambi i modi:</b> un’unità indietro, un’unità avanti. «Questa settimana» diventa «Questo mese» — stessa posizione, stesso ruolo.
      </div>
    </RefCard>
  </div>
);

const CD3_Chiusi = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="I giorni chiusi, a distanza di mese">
      <div style={{ padding: 12, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, background: '#fff', marginBottom: 12 }}>
        <Eyebrow>Cani passati</Eyebrow>
        <div style={{ fontSize: 30, lineHeight: 1, color: GH.ink, marginTop: 3, ...GH.num, ...GH.serifL }}>146</div>
        <div style={{ fontSize: 11, color: GH.mute, marginTop: 5, ...GH.num }}>20 giorni lavorati su 30 · 7 cani al giorno</div>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        A settimane la domenica era una riga che diceva «chiuso». A mesi <b>quella riga non esiste più</b>, e la domanda del brief è se l’informazione sopravvive.<br/><br/>
        <b>Sopravvive, ma cambia natura: da etichetta a rapporto.</b> «20 giorni lavorati su 30» sta sotto il numero grande dei cani, dove serve — è la scala che rende leggibile 146. Non provo a dire <b>quali</b> giorni erano chiusi: a questa distanza non è una domanda che qualcuno si fa, e comunque il dato non regge la risposta (solo la domenica è dichiarata, il lunedì chiude mezza giornata, il resto è inferenza).<br/><br/>
        Il rapporto è anche più onesto dell’etichetta: <b>non distingue «chiuso» da «aperto e non è venuto nessuno»</b>, e a questa scala è giusto così — dieci giorni lavorati su trenta è il fatto, il perché sta nella settimana.
      </div>
    </RefCard>

    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 11 }}>
        {[
          ['getWeeklyRevenueReport(from,to)', 'confermato da voi: accetta un intervallo qualsiasi. Il mese è la stessa query'],
          ['seconda chiamata «stesso tratto»', 'per il mese in corso servono DUE query: 1–29 ago e 1–29 lug'],
          ['giorni lavorati per settimana', 'DISTINCT su visits.date nell’intervallo — non è una colonna'],
          ['giorni del mese lavorabili', '«su 30» esclude i giorni chiusi? Oggi scrivo i giorni di calendario'],
          ['booking_schedule', 'dichiara la domenica: a mesi non lo uso, ma è la fonte del «chiuso» in settimana'],
          ['primo giorno di storia', '2 marzo 2026 — la striscia non deve poter navigare più indietro'],
        ].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', ...GH.num, whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <QRow n="1" q="«20 giorni su 30» — il 30 sono i giorni di calendario o i giorni in cui il salone era aperto? Cambia il senso del rapporto."
        mine="scrivo i giorni di calendario perché è l’unico numero certo. Se booking_schedule regge il conto degli aperti, quello è meglio: 20 su 26 dice una cosa diversa da 20 su 30."/>
      <QRow n="2" q="Le settimane tagliate al confine del mese: aprendole si vede la settimana intera, giorni dell’altro mese compresi. È quello che vi aspettate?"
        mine="sì, ed è deliberato: la riga somma al mese, la settimana aperta è una settimana vera. L’alternativa — righe che non sommano — è peggio."/>
      <QRow n="3" q="Fin dove si torna indietro? La storia comincia il 2 marzo 2026: la freccia sinistra su marzo dove porta?"
        mine="da nessuna parte: disattivata. Un mese vuoto prima dell’inizio della storia non è un mese magro, è un mese che non c’è, e la pagina non ha modo di dirlo."/>
      <QRow n="4" q="Serve un modo «anno»? Non l’ho composto: con sei mesi di storia sarebbe una pagina con una riga."
        mine="a marzo 2027 la domanda diventa legittima, e la risposta sarà questa stessa pagina ancora una volta ribaltata. Non prima."/>
    </RefCard>
  </div>
);

Object.assign(window, { CD3_Domande, CD3_Chiusi });
