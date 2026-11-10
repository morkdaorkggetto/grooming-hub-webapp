// ═══════════════════════════════════════════════════════════
// CD-12 · TAVOLE — prima → dopo · le decisioni · cosa non torna
// ═══════════════════════════════════════════════════════════

const P12 = ({ children }) => <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>{children}</div>;

const CD12_PrimaDopo = () => {
  const rows = [
    ['forma', 'striscia di 12 giorni da domani', 'un mese per volta, sei righe fisse'],
    ['al telefono', 'se ne vedono 6, domenica compresa', 'il mese intero, 7 colonne da 45 · caselle alte 44'],
    ['avanti / indietro', 'impossibile', 'frecce 44×44 ai lati del mese; spente al primo mese e al mese limite'],
    ['fino a quando', '12 giorni', 'fino a 2 mesi da oggi (impostazione del salone): oggi il 10 gennaio'],
    ['primo mese', '—', 'il mese corrente; il mese dopo se nel corrente restano meno di 7 giorni da chiedere'],
    ['passati e oggi', 'non c’erano', 'numeri spenti; oggi ha un trattino sotto'],
    ['domenica', 'nella striscia, non selezionabile', 'colonna spenta, «dom chiuso» sotto la griglia'],
    ['lunedì', 'come gli altri; le fasce lo dicevano', 'come gli altri; «lun solo pomeriggio» sotto la griglia, «Mattina» spenta se scelto'],
    ['oltre il limite', '—', 'numeri più spenti; nel mese limite la riga «Si può chiedere fino a …»'],
    ['periodo pieno', 'avviso a data scelta', 'un punto sotto il numero + avviso a data scelta'],
    ['poco preavviso', 'avviso a data scelta', 'invariato: nessun segno in griglia, avviso a data scelta'],
    ['giorno scelto', 'casella evidenziata', 'tondo pieno primary-hover, numero bianco; sotto, la data in parole'],
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20 }}>
      <RefCard title="Prima → dopo">
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1.4fr', gap: '0 18px' }}>
          {['', 'DesiredDateStrip, oggi', 'Calendario del mese'].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: GH.mute, paddingBottom: 8 }}>{h}</span>)}
          {rows.map(([k, a, b]) => (
            <React.Fragment key={k}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: GH.ink, padding: '9px 0', borderTop: `1px solid ${GH.bdSoft}` }}>{k}</span>
              <span style={{ fontSize: 12.5, color: GH.mute, padding: '9px 0', borderTop: `1px solid ${GH.bdSoft}` }}>{a}</span>
              <span style={{ fontSize: 12.5, color: GH.ink, padding: '9px 0', borderTop: `1px solid ${GH.bdSoft}` }}>{b}</span>
            </React.Fragment>
          ))}
        </div>
      </RefCard>
    </div>
  );
};

const CD12_Ragioni = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Non deve sembrare un sistema di posti liberi">
      <P12>
        <b>Tutti i giorni che si possono chiedere hanno lo stesso aspetto.</b> Nessun verde per «libero», nessun rosso per «occupato», nessun conteggio. Un calendario a colori direbbe che il salone conosce la disponibilità di quel giorno, ed è proprio quello che la pagina non sa.<br/><br/>
        <b>Le regole stanno una volta, sotto la griglia</b>: «lun solo pomeriggio», «dom chiuso», «periodo pieno». Scriverle in ogni casella avrebbe riempito il mese di etichette che si leggono come stati di prenotazione.<br/><br/>
        <b>L’unico segno dentro la griglia è il punto del periodo pieno</b>, perché è l’unica informazione utile prima di scegliere: chi può, sceglie un altro giorno. Il poco preavviso no: riguarda sempre la prima settimana e la segnerebbe tutta.<br/><br/>
        <b>Sotto il titolo la frase che c’è già</b>: «È un desiderio: l’ora te la conferma il salone su WhatsApp». Il calendario non la sostituisce.
      </P12>
    </RefCard>
    <RefCard title="Il primo mese, e il limite">
      <P12>
        <b>Di norma si apre sul mese corrente.</b> Se nel mese corrente restano <b>meno di 7 giorni</b> che si possono chiedere (da domani, domeniche escluse), si apre sul mese dopo. Il 26 novembre restano 27, 28 e 30: si apre su dicembre. La freccia a sinistra resta accesa e riporta a novembre.<br/><br/>
        <b>Il limite è «stesso giorno, due mesi dopo»</b>: dal 10 novembre si chiede fino al 10 gennaio. La freccia a destra si spegne su gennaio e sotto la griglia compare una riga sola: «Si può chiedere fino a domenica 10 gennaio». È il perché, detto una volta.<br/><br/>
        <b>Il numero di mesi viene dalle impostazioni del salone.</b> Se Davide passa a 3, le frecce arrivano a febbraio e la riga cambia da sola.<br/><br/>
        <b>Sei righe fisse.</b> Alcuni mesi ne avrebbero cinque: con le righe fisse l’altezza non cambia quando si tocca una freccia, e le fasce sotto non saltano.
      </P12>
    </RefCard>
    <RefCard title="Fasce e avvisi">
      <P12>
        <b>L’ordine sotto il calendario è: la data in parole, gli avvisi, le fasce.</b> Gli avvisi riguardano il giorno, quindi stanno attaccati a lui. Compaiono solo a data scelta, come oggi.<br/><br/>
        <b>La data in parole</b> («Hai scelto lunedì 16 novembre») conferma la scelta senza dover tornare alla griglia, e sostituisce la riga «Tocca il giorno che ti andrebbe bene» che si vede prima.<br/><br/>
        <b>Il lunedì la fascia «Mattina» si spegne</b>, con «chiusa il lunedì» sotto. Se era già scelta, si deseleziona e la riga sopra il pulsante dice cosa manca.<br/><br/>
        <b>Il pulsante fisso di GH-115</b> resta in fondo: grigio con «Manca il giorno» o «Manca la fascia», pieno quando c’è tutto.
      </P12>
    </RefCard>
    <RefCard title="I due posti">
      <P12>
        <b>Lo stesso calendario va anche nel foglio «Scegli un’altra data»</b>, quello che si apre dall’avviso della Home (CD-11) e da PendingRequest. La scheda non può restare com’è: il cliente arriva lì proprio perché la sua data non andava bene, e con una striscia di sei giorni non può cercarne un’altra più in là.<br/><br/>
        <b>Nel foglio il calendario perde il bordo</b> e le caselle scendono a 40px: dentro il foglio c’è già un bordo, e serve spazio per fasce e pulsante. Il motivo sta sotto il titolo, in una riga.<br/><br/>
        <b>A 1365</b> il calendario sta nella colonna del modulo, largo al massimo 440, con caselle da 50. Il riepilogo accanto si riempie mentre si sceglie.
      </P12>
    </RefCard>
  </div>
);

const CD12_NonTorna = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Cosa non torna">
      <QRow n="1" q="A 375 × 812, con due avvisi insieme, le fasce scendono di circa 40px sotto il pulsante fisso: si scorre."
        mine="con un avviso solo stanno sopra il pulsante per pochi pixel, anche con la riga «Manca la fascia»: per arrivarci ho stretto gli spazi del passo, non le caselle, che restano alte 44. Due avvisi insieme capitano solo con poco preavviso e periodo pieno, cioè una data a pochi giorni da Natale."/>
      <QRow n="2" q="Il limite cade su una domenica: il 10 gennaio 2027 è chiuso. La riga dice «fino a domenica 10 gennaio», e l’ultimo giorno che si può davvero chiedere è sabato 9."
        mine="la riga deve nominare l’ultimo giorno chiedibile, non la data del limite: va calcolata, non scritta. Nella tela ho lasciato il caso visibile apposta."/>
      <QRow n="3" q="I festivi (8 dicembre, 25 e 26 dicembre, 1 e 6 gennaio): il salone è chiuso? Nei dati non c’è."
        mine="nella tela sono giorni normali dentro il periodo pieno. Se il salone è chiuso, vanno trattati come la domenica, da un elenco nelle impostazioni."/>
      <QRow n="4" q="«Lun solo pomeriggio» e «dom chiuso» sono scritti nella legenda: se il salone cambia orari, la legenda deve seguirli."
        mine="la legenda va costruita dalle stesse impostazioni che spengono i giorni, non scritta a parte."/>
    </RefCard>
    <RefCard title="Campi da verificare">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[['mesi di anticipo', 'impostazione del salone, oggi 2'], ['periodi pieni', 'da dove vengono oggi gli avvisi «Periodo pieno»: date fisse o impostazione?'], ['giorni chiusi e fasce chiuse', 'domenica e lunedì mattina: già in booking_schedule'], ['preavviso', '7 giorni: lo stesso valore che oggi accende l’avviso']].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 13, paddingTop: 11, borderTop: `1px solid ${GH.bdSoft}` }}>
        <P12><b>Nessun colore nuovo.</b> Scelto in <span style={GH.num}>--color-primary-hover</span>, come «Mostra al banco»; il punto del periodo pieno in <span style={GH.num}>--color-warning-text</span>; il pulsante grigio in <span style={GH.num}>--color-border</span>.</P12>
      </div>
    </RefCard>
  </div>
);

Object.assign(window, { CD12_PrimaDopo, CD12_Ragioni, CD12_NonTorna });
