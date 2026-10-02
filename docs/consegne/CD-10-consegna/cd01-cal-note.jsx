// ═══════════════════════════════════════════════════════════
// CD-01 · TAVOLE — grammatica dei tre oggetti · vocabolario · campi ⚠ · domande
// ═══════════════════════════════════════════════════════════

const ObjSpec = ({ mark, name, certainty, origin, form, why }) => (
  <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden', background: '#fff' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderBottom: `1px solid ${GH.bdSoft}`, background: GH.soft }}>
      <div style={{ width: 76, flexShrink: 0 }}>{mark}</div>
      <div style={{ fontSize: 16, color: GH.ink, ...GH.serif }}>{name}</div>
    </div>
    <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <RefRow k="Certezza sull’ora" v={certainty}/>
      <RefRow k="Chi lo crea" v={origin}/>
      <RefRow k="Forma" v={form}/>
      <div style={{ fontSize: 11.5, color: GH.mute, lineHeight: 1.5, textWrap: 'pretty', marginTop: 3 }}>{why}</div>
    </div>
  </div>
);

const CalObjectsBoard = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
      <ObjSpec mark={<span style={{ fontSize: 17, color: GH.ink, ...GH.num, ...GH.serif }}>09:30</span>}
        name="Appuntamento confermato" certainty="data e ora precise" origin="salone, alla conferma" form="cifre serif tabulari"
        why="L’ora è una decisione presa da una persona, e si guarda: perciò è l’unico oggetto che porta cifre serif. Pallino verde a destra."/>
      <ObjSpec mark={<CalFascia f="mattina"/>}
        name="Richiesta pendente" certainty="giorno + fascia" origin="cliente, dall’app" form="capsula tratteggiata"
        why="Il tratteggio dice «non ancora fissato». È l’unico oggetto che porta un’azione nella riga, perché è l’unico che aspetta una decisione."/>
      <ObjSpec mark={<span style={{ display: 'inline-block', width: 14, height: 2, borderRadius: 2, background: GH.bd }}/>}
        name="Lavorazione registrata" certainty="solo il giorno — visits.date è date" origin="salone, a lavoro finito" form="barretta, nessun campo ora"
        why="Non ha ora e non ne avrà: la barretta occupa la colonna senza promettere niente. Sta sotto la riga «registrato dal salone», in coda al giorno."/>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14 }}>
      <RefCard title="Perché due forme e non una">
        <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
          Nel §10 avevo proposto <b>la banda</b> per le richieste. Il brief osserva che richieste e lavorazioni a posteriori hanno lo stesso problema visivo, e chiede se una forma sola possa dire due cose. <b>La risposta è no, e la ragione è precisa:</b> la banda promette «da qualche parte qui dentro». Su una richiesta è vero — l’ora esiste, va solo decisa. Su una lavorazione registrata sarebbe <b>falso</b>: nessuno l’ha collocata nel mattino, semplicemente non l’ha guardata l’orologio. Una banda su «bagnetto di Pepe» inventerebbe una fascia che nessuno ha dichiarato — lo stesso errore dell’operatore accanto alla visita.<br/><br/>
          Quindi: <b>fascia tratteggiata</b> per ciò che attende una collocazione, <b>barretta muta</b> per ciò che non ne ha mai avuta. Due forme, un solo principio: la cella dell’ora dice <em>quanta certezza</em> c’è, e non ne aggiunge mai.
        </div>
      </RefCard>
      <RefCard title="Perché nessuna griglia a slot">
        <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
          La griglia oraria della vista attuale regge solo se un appuntamento ha <b>una durata</b>. Il brief chiude la questione: la lavorazione si decide guardando il pet, quindi non esiste durata né prezzo prevedibile. Una griglia mostrerebbe blocchi tutti alti uguali, cioè un’informazione inventata, e sprecherebbe l’80% dell’altezza in ore vuote — su una settimana da 17 appuntamenti in un anno.<br/><br/>
          Sostituita da <b>giorni come sezioni in colonna</b>: ogni giorno costa l’altezza di ciò che contiene, zero se è vuoto. Regge una settimana deserta e una piena senza cambiare forma, ed è la stessa struttura sul telefono.
        </div>
      </RefCard>
    </div>
  </div>
);

const WORD = ({ no, si, why }) => (
  <div style={{ borderBottom: `1px solid ${GH.bdSoft}`, paddingBottom: 9, marginBottom: 9 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12.5, color: GH.mute, textDecoration: 'line-through' }}>{no}</span>
      <Icon name="arrow" size={14} color={GH.mute}/>
      <span style={{ fontSize: 14, color: GH.ink, ...GH.serif }}>{si}</span>
    </div>
    <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 4, lineHeight: 1.45, textWrap: 'pretty' }}>{why}</div>
  </div>
);

const CalWordsBoard = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignContent: 'start' }}>
    <RefCard title="Le parole — decisioni prese">
      <WORD no="Servizio" si="Bisogno" why="Il cliente non ordina da un listino: segnala. Lato cliente diventa la domanda «Di cosa ha bisogno Luna?»; lato salone l’etichetta è «Bisogno indicato». Una parola sola, usata in wizard, richieste, coda e calendario."/>
      <WORD no="Servizio svolto" si="Registrato" why="Ciò che il salone scrive è un’altra cosa da ciò che il cliente ha chiesto, e può legittimamente differire. In calendario la riga di coda si intitola «registrato dal salone» — neutro, perché a volte dentro c’è «non è venuto»."/>
      <WORD no="Prenotazione" si="Richiesta" why="Prenotare implica che il posto sia tuo. Qui il cliente chiede e il salone dispone: la parola deve dirlo dal primo schermo, così la conferma non sembra una formalità."/>
    </RefCard>
    <RefCard title="«Bagno» o «Bagnetto» — la micro-scelta">
      <div style={{ display: 'flex', gap: 9, marginBottom: 11 }}>
        <div style={{ flex: 1, border: '1px solid var(--color-primary)', borderRadius: GH.r.field, padding: 11, background: 'rgba(111,151,146,.06)' }}>
          <Eyebrow color="var(--color-primary)">scelto · lato cliente</Eyebrow>
          <div style={{ fontSize: 20, color: GH.ink, marginTop: 4, ...GH.serif }}>Bagno</div>
        </div>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 11 }}>
          <Eyebrow>resta · voce del salone</Eyebrow>
          <div style={{ fontSize: 20, color: GH.mute, marginTop: 4, ...GH.serifL }}>bagnetto</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        129 volte su 298 dicono «bagnetto», ed è vero affetto — ma lo dicono <b>del proprio lavoro</b>, non offrendolo a menu. Messo in bocca al cliente come opzione preimpostata, l’affetto diventa un vezzo deciso a tavolino: il cliente sta descrivendo un bisogno e ha diritto al nome neutro della cosa. <b>Il calore sta nelle frasi intorno al campo, non nell’etichetta del campo.</b><br/><br/>
        Dove invece scrive il salone — testo libero, diario, messaggi — «bagnetto» resta <b>verbatim e non si normalizza mai</b>. È la loro voce, e nel calendario si legge tra virgolette proprio per questo.<br/><br/>
        <b>Reversibile in una stringa</b>, se Davide e Roby preferiscono sentirsi chiamare così anche dal cliente: è la loro voce, non la mia.
      </div>
    </RefCard>
    <RefCard title="Le quattro voci, e il resto">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 11 }}>
        {[['Bagno', '169 + 129 «bagnetto»'], ['Taglio', '122'], ['Bagno e taglio', '9'], ['Toelettatura', '7 + 4 «completa»']].map(([a, b]) => (
          <div key={a} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, minHeight: 24, borderBottom: `1px solid ${GH.bdSoft}` }}>
            <span style={{ fontSize: 14, color: GH.ink, ...GH.serif }}>{a}</span>
            <span style={{ fontSize: 11.5, color: GH.mute, ...GH.num }}>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Quattro voci lato cliente, <b>senza prezzo e senza durata</b>: comparirebbero come un preventivo che nessuno può fare.<br/><br/>
        Il 3% restante è il motivo per cui il campo del salone <b>resta testo libero</b>. Dentro ci stanno «rimandato per ciclo» e «paga 15 euro perché è la prima volta»: se lo chiudessimo in quattro opzioni perderemmo il diario, che è la parte che usano davvero.
      </div>
    </RefCard>
  </div>
);

const QRow = ({ n, q, mine }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${GH.bdSoft}` }}>
    <span style={{ fontSize: 15, color: 'var(--color-primary)', ...GH.serif, ...GH.num, minWidth: 20 }}>{n}</span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12.5, color: GH.ink, lineHeight: 1.5, textWrap: 'pretty' }}>{q}</div>
      {mine && <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 4, lineHeight: 1.45, textWrap: 'pretty' }}><b>Come la vedo io:</b> {mine}</div>}
    </div>
  </div>
);

const CalNotesBoard = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Incassi, promozioni, status — la mia risposta">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Il brief chiede se il calendario debba essere anche un quadro d’insieme. <b>La mia risposta è: agenda, con una sola riga di chiusura.</b><br/><br/>
        <b>Incassi:</b> restano in <span style={GH.num}>/reports/weekly</span>. Portarli qui creerebbe due luoghi dove si legge lo stesso numero, e il primo che si aggiorna male diventa quello che non ci si fida più. La striscia settimanale conta <b>presenze e ritorni</b> — registrate, confermati, in attesa — e rimanda al report per il denaro.<br/><br/>
        <b>Status del cliente:</b> non in lista, dove su sette righe sarebbe rumore. Appare <b>dove serve davvero</b>: dentro la conferma, nel momento in cui si decide se dare quell’ora a quella persona. È il posto che ho scoperto scrivendo il §10, e vale anche qui.<br/><br/>
        <b>Promozioni:</b> non le ho composte. Non ho trovato nulla nello schema che le regga, e comporre una promozione inventata sarebbe esattamente l’errore che questa convenzione serve a evitare. <b>Domanda aperta n. 1.</b>
      </div>
    </RefCard>
    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[['requests[]', 'la tabella richieste esiste già? con quali colonne'], ['requests.fascia', 'mattina / pomeriggio / indifferente'], ['requests.manto[]', 'i cinque codici condizione del manto'], ['requests.nota', 'nota libera sul manto'], ['requests.age', 'età dichiarata se mancava in anagrafica'], ['requests.state', 'in attesa / approvata / rifiutata'], ['requests→appointment', 'il legame dopo la conversione'], ['appointments.time', 'l’ora esiste sugli appuntamenti? (su visits NO)'], ['visits.amount', 'incasso per visita — la riga regge la sua assenza'], ['message.sent_at', 'traccia dell’invio: senza, «confermato» non è verificabile'], ['promotions[]', 'nominate dal salone, non trovate: non composte']].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', ...GH.num, whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 4, textWrap: 'pretty' }}>
          Unico dato che dò per certo perché <b>misurato</b>: <span style={GH.num}>visits.date</span> è <span style={GH.num}>date</span>, senza ora. Tutto il resto sopra è da verificare in schema: se un campo non c’è, <b>la riga perde quella parte e non si muove</b> — le celle sono dimensionate per reggerlo.
        </div>
      </div>
    </RefCard>
    <RefCard title="Domande aperte — dichiarate, non risolte">
      <QRow n="1" q="Le promozioni esistono come dato, o sono una cosa che Davide e Roby tengono a mente? Se sono a mente, il calendario non può mostrarle e la richiesta va riformulata."
        mine="sospetto siano a mente, e che la vera richiesta sotto sia «capire chi non torna da un po’» — che è un’altra vista."/>
      <QRow n="2" q="Il messaggio parte dall’app o si apre WhatsApp con il testo già scritto? Cambia se «confermato» è verificabile o solo dichiarato."
        mine="con WhatsApp esterno servirebbe almeno un segno che l’invio è avvenuto, altrimenti torniamo alla divergenza del §10.3."/>
      <QRow n="3" q="Una lavorazione registrata su un giorno che aveva un appuntamento confermato: sono la stessa cosa? Chi le lega, e cosa vede il salone se non le lega nessuno."
        mine="oggi le mostro come due righe distinte, che è onesto ma può sembrare doppio. Non ho inventato un legame che non ho misurato."/>
      <QRow n="4" q="«Rifiuta» che messaggio manda? Un rifiuto senza parole è peggio del silenzio, e non so cosa direbbero loro."
        mine="serve una frase scritta da Davide, non da me: proporrei di chiedergliela così com’è, e usare la sua."/>
      <QRow n="5" q="La settimana passata è consultabile fin dove? Ci sono 464 visite e un anno di storia: se il navigatore va indietro all’infinito, prima o poi qualcuno ci finisce dentro."
        mine="nessun limite tecnico, ma un «vai a una data» servirà appena lo storico si legge davvero."/>
      <div style={{ fontSize: 11.5, color: GH.mute, textWrap: 'pretty' }}>
        Chiudo la <b>§9.1 di GH-15</b>: la domanda «Davide guarderebbe la settimana passata?» era la mia, e la risposta del salone la supera — non solo la guarderebbero, la vogliono <b>come una delle due strade con cui il calendario si riempie</b>. Era giusto non vestirlo prima di saperlo.
      </div>
    </RefCard>
  </div>
);

Object.assign(window, { ObjSpec, CalObjectsBoard, WORD, CalWordsBoard, QRow, CalNotesBoard });
