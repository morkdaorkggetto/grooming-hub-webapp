// ═══════════════════════════════════════════════════════════
// CD-06 · TAVOLE — le sei domande · le etichette · campi ⚠ · domande aperte
// ═══════════════════════════════════════════════════════════

const CD6_Grana = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="1 · A che grana si guarda una settimana">
      <div style={{ display: 'flex', gap: 9, marginBottom: 13 }}>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 10, opacity: .55 }}>
          <Eyebrow>la griglia oraria</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2, marginTop: 8 }}>
            {Array.from({ length: 45 }).map((_, i) => (
              <span key={i} style={{ height: 7, background: [7, 19, 33].includes(i) ? 'var(--color-primary)' : GH.soft, borderRadius: 2 }}/>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: GH.mute, marginTop: 7, lineHeight: 1.4 }}>tre appuntamenti e quarantadue caselle vuote</div>
        </div>
        <div style={{ flex: 1, border: '1px solid var(--color-primary)', borderRadius: GH.r.field, padding: 10, background: 'var(--gh-tint)' }}>
          <Eyebrow color="var(--color-primary)">mezze giornate</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3, marginTop: 8 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} style={{ height: 19, background: [1, 4, 7].includes(i) ? 'var(--color-primary)' : '#fff', border: `1px solid ${GH.bd}`, borderRadius: 3 }}/>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: GH.mute, marginTop: 7, lineHeight: 1.4 }}>gli stessi tre, in dieci contenitori</div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Mezze giornate.</b> Non ore, e non giorni con dentro un elenco.<br/><br/>
        Le ore sarebbero <b>più precisione di quanta ne serva</b>, e non in modo neutro: una griglia oraria disegna un reticolo dove l’occhio legge <b>caselle da riempire</b>. Con cinque cani su tre postazioni — un quinto della capienza — quel reticolo sarebbe vuoto per l’80%, e il messaggio a vista sarebbe «sei quasi fermo». Falso, e demoralizzante.<br/><br/>
        Il giorno intero, all’opposto, <b>non risponde alla domanda di Roby</b>: «mattina o pomeriggio?» è la prima cosa che si chiede a chi ha il cane al guinzaglio, e va letta senza aprire nulla.<br/><br/>
        <b>Mattina 9–13 e pomeriggio 13–19 sono già i contenitori del salone</b> — sono i suoi orari dichiarati, non una nostra invenzione. E l’ora precisa non sparisce: <b>vive sull’appuntamento</b>, che la porta scritta accanto al nome. La fascia colloca, l’ora si legge dentro.
      </div>
    </RefCard>

    <RefCard title="2 · L’occupazione che non ha un’ora">
      <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden', marginBottom: 12, maxWidth: 230 }}>
        <DayHead d={{ dow: 'mar', n: '1' }}/>
        <Fascia {...M} margine={2}/>
        <Fascia {...P} appts={[{ h: '16:30', pet: 'Argo', svc: 'Taglio', min: 90 }]} margine={2}/>
        <SenzaOra n={4}/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        La domanda più difficile del brief, e la risposta è <b>una linea tratteggiata</b>. Le lavorazioni senza ora <b>non stanno in una fascia: appartengono al giorno</b>, e quindi vivono nel <b>piede della colonna</b>, sotto la linea, dove non hanno una posizione oraria da fingere.<br/><br/>
        Un pallino per cane, e la frase: <b>«4 entrati senza appuntamento»</b>. Chi guarda vede due cose in un colpo: <b>un appuntamento alle 16:30, e quattro cani di cui non si sa quando</b>. La giornata è stata piena cinque, non uno.<br/><br/>
        <b>Perché non metterli in una fascia, anche a occhio.</b> Sarebbe l’errore dell’operatore accanto alla visita di GH-15: un dato inventato con l’aria di essere misurato. <span style={GH.num}>visits.date</span> è di tipo <span style={GH.num}>date</span>, e non lo sarà mai diversamente — la colonna resta muta, e la vista lo dice invece di nasconderlo.<br/><br/>
        Il fondo del piede è <span style={GH.num}>--gh-absent</span>, lo stesso delle righe di assenza in CD-02 e delle settimane ferme in CD-03: <b>è il colore di «è successo, ma non sappiamo quando»</b>. Terzo giro che lo usa per la stessa cosa.
      </div>
    </RefCard>
  </div>
);

const CD6_Margine = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="3 · Lo spazio lasciato libero apposta — il margine">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 13, maxWidth: 240 }}>
        <Margine n={2}/><Margine stretto/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        È l’idea che questo brief mi ha fatto trovare, e non c’era in nessun giro precedente: <b>un vuoto e uno spazio tenuto non sono la stessa cosa</b>, e finora la vista aveva solo il vuoto.<br/><br/>
        Il <b>margine</b> è un riquadro tratteggiato, dentro la fascia, con scritto <b>per chi è</b>: «tenuto per chi entra ×2». Non è un posto libero — è un posto <b>già assegnato a qualcuno che non ha ancora un nome</b>. Riempirlo si può, ma è una decisione visibile, non un progresso.<br/><br/>
        La frase del brief che questa composizione traduce: <b>la capienza vera non è tre postazioni, è tre meno chi arriverà senza avvisare.</b> Il margine è quella sottrazione, resa disegno.<br/><br/>
        <b>Quando il margine finisce, non sparisce: cambia registro.</b> Diventa «poco spazio per chi entra» in danger. Non è un errore e non blocca niente — Roby può prenotare comunque, e a volte deve. È un avviso che dice una cosa vera: <b>se entrano quattro persone col cane in braccio, adesso il problema è tuo</b>.<br/><br/>
        <span style={GH.num}>⚠</span> <b>Quanto vale ×2 è un calcolo, non una costante</b>: postazioni meno prenotati, confrontato con quanti entrano di solito in quella fascia. Il secondo numero è storico e va misurato — vedi §8.
      </div>
    </RefCard>

    <RefCard title="4 · Cosa succede toccando un vuoto">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 13, maxWidth: 240 }}>
        <Vuoto/><Vuoto label="prenota alle 10:30"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Apre il modulo che esiste già, con il giorno e la fascia compilati — non con un appuntamento creato.</b> È la distinzione che tiene insieme le due cose che chiedete: il gesto rapido al banco, e i controlli che non devono saltare.<br/><br/>
        <b>Quello che precompilo:</b> il giorno, la fascia, e <b>un’ora proposta</b> — la prima libera nella fascia, tenendo conto delle durate (bagno 45′, taglio 90′). Non un’ora tonda a caso: un’ora che sta.<br/><br/>
        <b>Quello che non faccio:</b> nessun salvataggio implicito, nessun «creato, modifica dopo». Il modulo resta il modulo — con il cliente da scegliere, che è il campo che nessuna scorciatoia può indovinare, ed è anche <b>il punto dove i controlli su blacklist e affidabilità vivono già</b>. Saltarlo vorrebbe dire perderli.<br/><br/>
        Nel modo giorno il vuoto è più esplicito e dice l’ora: <b>«prenota alle 10:30»</b>. In settimana no, perché in una fascia da quattro ore l’ora proposta cambierebbe a ogni prenotazione e il pulsante mentirebbe.
      </div>
    </RefCard>

    <RefCard title="6 · Due modi della stessa pagina">
      <div style={{ display: 'flex', gap: 10, marginBottom: 13, flexWrap: 'wrap' }}>
        <PlanSwitch modo="settimana"/><PlanSwitch modo="giorno"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Non sostituisce, e non si affianca come pagina separata: sono due modi</b>, come settimana/mese nel report. Stesso interruttore, stessa posizione — in testa al navigatore, prima delle frecce.<br/><br/>
        La ragione è che <b>è la stessa domanda a due distanze</b>: la settimana serve a <b>decidere</b>, il giorno serve a <b>lavorare</b>. Farne due pagine costringerebbe a scegliere quale è «il calendario», e la risposta cambia dieci volte al giorno.<br/><br/>
        <b>Cosa il giorno fa e la settimana non può fare: elencare per nome i cani entrati senza appuntamento.</b> In sette colonne c’è posto per un conteggio, in una giornata sola c’è posto per i nomi — e i nomi sono ciò che serve a lavorare.<br/><br/>
        <b>Passando di modo resta la data</b>: da una settimana si arriva al suo primo giorno lavorativo, o a oggi se la settimana è quella corrente. E <b>toccare la testa di una colonna</b> porta al modo giorno su quel giorno — la scorciatoia è sul dato, non sull’interruttore. Regola già stabilita in CD-03, applicata identica.
      </div>
    </RefCard>
  </div>
);

const CD6_Forma = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="5 · Il computer è la norma, il telefono cambia forma">
      <div style={{ display: 'flex', gap: 11, marginBottom: 12 }}>
        <div style={{ flex: 1.5, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 9, background: '#fff' }}>
          <Eyebrow>sopra 640 · sette colonne</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginTop: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ height: 8, background: GH.soft, borderRadius: 2 }}/>
                <span style={{ height: 16, background: i === 3 ? 'var(--color-primary)' : '#fff', border: `1px solid ${GH.bd}`, borderRadius: 2 }}/>
                <span style={{ height: 16, background: i === 1 ? 'var(--color-primary)' : '#fff', border: `1px solid ${GH.bd}`, borderRadius: 2 }}/>
                <span style={{ height: 6, background: 'var(--gh-absent)', borderRadius: 2 }}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 9, background: '#fff' }}>
          <Eyebrow>sotto 640 · scorre in verticale</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ border: `1px solid ${GH.bd}`, borderRadius: 3, padding: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ height: 6, background: GH.soft, borderRadius: 2 }}/>
                <span style={{ height: 9, background: i === 1 ? 'var(--color-primary)' : '#fff', border: `1px solid ${GH.bdSoft}`, borderRadius: 2 }}/>
                <span style={{ height: 9, background: '#fff', border: `1px solid ${GH.bdSoft}`, borderRadius: 2 }}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>Non si rimpicciolisce: si ribalta.</b> Sette colonne su 390px darebbero colonne da 50px, e in 50px non ci sta un nome proprio — la stessa misura che in CD-01 mi aveva fatto scegliere un giorno alla volta.<br/><br/>
        Qui però <b>un giorno alla volta non basta</b>, perché lo scopo è vedere la settimana. Quindi <b>il giorno diventa una riga</b> e la settimana scorre in verticale: sette schede impilate, ognuna con le sue due fasce e il suo piede. <b>Si perde il colpo d’occhio, si tiene l’ordine</b> — e con tre appuntamenti in sette giorni lo scorrimento è breve.<br/><br/>
        <b>44px al banco, non 54:</b> questa è una superficie di gestionale, e la regola di CD-04 non vale qui. Le tessere sul telefono salgono a 60px come tutte le righe di GH-15 sotto i 640.
      </div>
    </RefCard>

    <RefCard title="Le etichette — la decisione presa, e dove nasce il preavviso">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <StateTag s="blacklist"/><StateTag s="rischio"/><StateTag s="completato"/><StateTag s="annullato"/><StateTag s="noshow"/>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: GH.mute, border: `1px solid ${GH.bd}`, borderRadius: 5, padding: '3px 7px', textDecoration: 'line-through' }}>Imminente</span>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty', marginBottom: 12 }}>
        Applico la decisione senza discuterla. <b>«Imminente» via</b>: su una lista di oggi tutto è imminente, e non ha nessuna azione attaccata. Le altre restano — sono proprietà del cane o fatti, e una si può agire.<br/><br/>
        <b>In questa vista le etichette compaiono sull’appuntamento</b>, non sulla colonna: sono del cane, non del giorno. In sette colonne strette è l’unica gerarchia che regge.
      </div>
      <div style={{ padding: 11, border: `1px dashed ${GH.bd}`, borderRadius: GH.r.field, background: 'var(--gh-tint)' }}>
        <Eyebrow color="var(--color-primary)">dove nasce il preavviso — sulla richiesta, non qui</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9, background: '#fff', border: `1px solid ${GH.bd}`, borderRadius: 9, padding: '9px 11px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: GH.ink }}>Miele · mercoledì mattina</div>
            <div style={{ fontSize: 11, color: GH.mute }}>chiesto ieri sera</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 5, padding: '3px 7px', whiteSpace: 'nowrap' }}>preavviso 14 ore</span>
        </div>
        <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 9, lineHeight: 1.5, textWrap: 'pretty' }}>
          «Me lo chiede per domani mattina» è un’informazione, e serve <b>nel momento in cui Davide decide se accettare</b>. Sull’appuntamento già confermato lo stesso dato non dice più niente.
        </div>
      </div>
    </RefCard>
  </div>
);

const CD6_Campi = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 11 }}>
        {[
          ['tenants.settings.postazioni', 'confermato che esiste: passato da 2 a 3 stamattina. Nessun numero scritto a mano'],
          ['orari e chiusure per fascia', 'domenica e lunedì mattina sono dichiarati: dove? La griglia li legge, non li assume'],
          ['appointments.time', 'l’ora precisa. Se non esistesse, l’intero oggetto «appuntamento» cade su una fascia'],
          ['durata dell’appuntamento', '45 / 90 secondo il servizio: è un campo o si deduce dal servizio scelto?'],
          ['servizio strutturato sull’appuntamento', 'per proporre l’ora libera serve sapere se è bagno o taglio'],
          ['entrati di solito per fascia', 'il secondo numero del margine. È storico e va CALCOLATO: non è una colonna'],
          ['requests.created_at', 'il preavviso: esiste già secondo il brief, da confermare che sia un istante e non una data'],
        ].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
        <b>Il sesto è quello che regge il margine</b>, cioè l’idea centrale di questo giro. Se non si può calcolare, il margine <b>non va inventato con un numero fisso</b>: diventa «postazioni meno prenotati», che è più povero ma vero. Lo dico prima perché non venga riempito con un 2 scritto a mano.<br/><br/>
        <b>Aggiunta al set di icone:</b> <span style={GH.num}>chevron-left</span> e <span style={GH.num}>arrow-left</span> in <span style={GH.num}>shared-ui.jsx</span>. La direzione vive nell’icona, come da vincolo — nessuna rotazione locale nei fogli di stile.
      </div>
    </RefCard>

    <RefCard title="Domande aperte — dichiarate, non risolte">
      <QRow n="1" q="«Entrati di solito in questa fascia» si può calcolare? Serve l’ora, e l’ora non c’è: si può solo contare per giorno, non per fascia."
        mine="ed è il buco della mia idea. Il margine per fascia userebbe un numero che i dati non reggono. Ripiego onesto: margine calcolato sul GIORNO e diviso fra le due fasce in proporzione agli orari — dichiarato come stima, non come misura. Se preferite, resta «postazioni meno prenotati»."/>
      <QRow n="2" q="Roby può prenotare oltre il margine? Nella composizione sì, con l’avviso."
        mine="sì, sempre. Un avviso che blocca al banco, con una persona davanti, viene aggirato entro una settimana — e allora si perde anche l’avviso."/>
      <QRow n="3" q="Le tre postazioni sono intercambiabili, o Davide e Roby lavorano cose diverse? La vista non le distingue."
        mine="non le distinguo perché nessuno l’ha chiesto e perché il vincolo dichiarato è la capienza, non la persona. Ma se un taglio lo fa solo Davide, «tre postazioni» è un numero che mente e la vista va rifatta con le persone dentro."/>
      <QRow n="4" q="Una lavorazione registrata su un giorno che aveva un appuntamento: sono la stessa cosa? Rimasta aperta da CD-01."
        mine="qui pesa il doppio, perché la colonna mostra 1 appuntamento e 4 entrati: se uno dei quattro era l’appuntamento, la giornata sembra più piena di com’è stata. Non ho inventato un legame che non ho misurato."/>
      <QRow n="5" q="Serve vedere due settimane insieme? Roby colloca guardando avanti, e il confine di settimana è arbitrario."
        mine="non composto. Ma è la richiesta che arriverà per prima dopo questa, e la forma a mezze giornate la regge: quattordici colonne strette no, due righe da sette sì."/>
    </RefCard>
  </div>
);

Object.assign(window, { CD6_Grana, CD6_Margine, CD6_Forma, CD6_Campi });
