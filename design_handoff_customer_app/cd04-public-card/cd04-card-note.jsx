// ═══════════════════════════════════════════════════════════
// CD-04 · TAVOLE — le quattro domande · la fedeltà · i colori · campi ⚠
// ═══════════════════════════════════════════════════════════

const CD4_Domande = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="1 · Cosa deve capire in tre secondi">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Non che il cane è schedato: <b>lo sa già che il cane è suo</b>. Non che esiste un’app: non gliene importa, e chiederglielo al primo secondo è chiedere prima di aver dato.<br/><br/>
        Deve capire una cosa sola: <b>«questo salone riconosce il mio cane, e posso scrivergli adesso».</b> Riconoscimento e contatto. Tutto il resto della pagina serve a rendere credibile quella frase.<br/><br/>
        Da qui l’ordine di lettura, che è cambiato: <b>prima il nome del salone</b> — chi ha inquadrato un cartoncino non sa dove è finito, e oggi la pagina glielo dice in grigio chiaro, piccolo, in cima. Poi il ritratto, poi il nome del cane, poi una riga sulla relazione, poi il gesto.<br/><br/>
        Il nome del cane <b>non è l’informazione: è la prova.</b> Serve a dimostrare che il riconoscimento è vero, non a informare chi già lo sa.
      </div>
    </RefCard>

    <RefCard title="2 · Serve al cliente o al salone?">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Oggi <b>a nessuno dei due</b>: mostra al cliente dati che il cliente già sa, e al salone non porta niente, perché la barra non produce una visita.<br/><br/>
        <b>La ricompongo perché serva al salone, attraverso il cliente.</b> Il salone ha un obiettivo solo su questa pagina: <b>che gli si scriva</b>. Tutto ciò che non concorre a quel gesto è arredamento — e l’arredamento in una pagina di tre secondi è un costo.<br/><br/>
        Ne segue una gerarchia brutale: <b>un solo pulsante pieno</b>, quello di WhatsApp, con il sottotitolo che dice come si lavora («rispondiamo qui, non su moduli»). Il secondo gesto resta, ma non compete.
      </div>
    </RefCard>

    <RefCard title="3 · Il telefono è il caso normale">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Un QR si inquadra col telefono. Quindi <b>ho composto a 390 e allargato</b>, che è l’inverso di quello che ho fatto per il gestionale — e va detto perché è una regola opposta dentro lo stesso prodotto.<br/><br/>
        A schermo largo <b>la card non si divide in due colonne</b>: resta una colonna sola, centrata, dentro un cartoncino con bordo. Un desktop non è un motivo per riempire la larghezza: è la stessa card, guardata da un posto insolito.<br/><br/>
        <b>Nessun target sotto 54px</b> — non 44: qui non c’è un banco, c’è una mano sola che tiene il telefono e un cane che tira. I due gesti sono alti 54 e larghi tutta la colonna.
      </div>
    </RefCard>

    <RefCard title="4 · Il secondo stato — sì, e ne basta uno">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <BigGesture icon="calendar" sub="visite, promemoria, richieste di appuntamento">Vedi le visite di Nina</BigGesture>
        <BigGesture icon="arrow">Entra nella sua pagina</BigGesture>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Non due pagine: <b>due versioni del secondo gesto</b>. A chi non ha l’accesso va detto <b>cosa c’è dentro</b>, perché non sa che esiste; a chi ce l’ha va detto solo <b>entra</b>, perché lo sa già e il resto è rumore.<br/><br/>
        <span style={GH.num}>⚠</span> Serve sapere se il cliente ha un accesso attivo — vedi §8. <b>Se il dato non c’è, si mostra sempre la versione che spiega:</b> a chi ha già l’accesso costa una riga di troppo, a chi non l’ha l’altra costerebbe l’intera offerta.
      </div>
    </RefCard>
  </div>
);

const Soglia = ({ n, visite, mesi, chi, tier }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minHeight: 44, borderTop: `1px solid ${GH.bdSoft}`, padding: '0 2px' }}>
    <span style={{ width: 9, height: 9, borderRadius: 999, background: `var(--tier-${tier})`, flexShrink: 0 }}/>
    <span style={{ fontSize: 13.5, color: GH.ink, minWidth: 68, ...GH.serif }}>{n}</span>
    <span style={{ fontSize: 12.5, color: GH.ink, minWidth: 62, ...GH.num }}>{visite} visite</span>
    <span style={{ fontSize: 12, color: GH.mute, minWidth: 74, ...GH.num }}>{mesi}</span>
    <span style={{ fontSize: 12, color: GH.mute, flex: 1 }}>{chi}</span>
  </div>
);

const CD4_Fedelta = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="La progressione non è il protagonista">
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        <b>No, e la ragione non è che i numeri sono brutti.</b> È che quel blocco occupa la metà inferiore della pagina per dire tre volte <b>«sei lontano»</b> a uno sconosciuto — e lo dice a <b>tutti</b>, perché nessun cliente del salone può vedere altro che Livello Base. Una promessa che nessuno ha mai visto mantenuta non è una promessa: è una distanza con la grafica di una promessa.<br/><br/>
        <b>Al suo posto: una riga.</b> «È venuto 3 volte da noi — la prima volta a marzo». È <b>vera</b>, è già mantenuta, e dice al cliente che qualcuno tiene il conto. Occupa un ventesimo dello spazio e fa il lavoro che la barra prometteva di fare.<br/><br/>
        A zero visite la riga cambia e diventa l’unica frase possibile: <b>«Non ci siamo ancora conosciuti. La prima volta è la prossima.»</b> Il cartoncino può girare prima della prima visita, e questa è la pagina che una mano nuova vede.<br/><br/>
        <b>I livelli non sparivano dal prodotto: sparivano dal centro.</b> Restano come segno accanto al nome — piccolo, in metallo — per chi ce l’ha davvero. Oggi è <b>una persona su 282</b>: quando saranno cinquanta, quel segno sarà una ragione per esserci.
      </div>
    </RefCard>

    <RefCard title="Cosa dovrebbero valere le soglie — per Luigi, da portare al salone">
      <div style={{ padding: '10px 12px', background: 'var(--gh-tint)', border: '1px solid rgba(111,151,146,.30)', borderRadius: GH.r.field, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: GH.ink, lineHeight: 1.5, textWrap: 'pretty', ...GH.serif }}>
          Una soglia è una promessa solo se <b>qualcuno l’ha già superata</b>. Finché nessuno l’ha fatto, è un annuncio.
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 11, padding: '0 2px 5px' }}>
          <span style={{ width: 9 }}/><Eyebrow>Livello</Eyebrow><Eyebrow>Proposta</Eyebrow><Eyebrow>A 49 gg</Eyebrow><Eyebrow>Chi ci arriva oggi</Eyebrow>
        </div>
        <Soglia n="Bronzo" visite={3} mesi="≈ 5 mesi" chi="alcuni, subito" tier="bronze"/>
        <Soglia n="Argento" visite={6} mesi="≈ 8 mesi" chi="uno, subito" tier="silver"/>
        <Soglia n="Oro" visite={10} mesi="≈ 1 anno e 3 mesi" chi="nessuno, ma è a vista" tier="gold"/>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, textWrap: 'pretty' }}>
        <b>3 / 6 / 10</b> invece di 12 / 24 / 36. Il criterio non è «più facile»: è che <b>il giorno in cui il salone cambia le soglie, qualcuno diventa Argento</b> — e i livelli smettono di essere un’idea e diventano una cosa che si vede in negozio.<br/><br/>
        Il conto è sul ritmo misurato: <span style={GH.num}>49 giorni</span> fra due visite. Con 12 visite il Bronzo sta a un anno e sette mesi, cioè oltre l’orizzonte in cui una persona ricorda di aver iniziato qualcosa.<br/><br/>
        <b>Non è una decisione mia.</b> Il salone potrebbe volere soglie alte proprio perché premino pochi. Ma allora il posto di quella promessa <b>non è la prima pagina che un estraneo vede</b>: è dentro, dopo l’accesso, dove chi c’è già può ambire.
      </div>
    </RefCard>
  </div>
);

const Sw = ({ hex, label, sub, cross, token }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <span style={{ width: 28, height: 28, borderRadius: 7, background: hex, border: `1px solid ${GH.bd}`, position: 'relative', flexShrink: 0 }}>
      {cross && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 14, textShadow: '0 0 3px rgba(0,0,0,.5)' }}>×</span>}
    </span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 650, color: GH.ink }}>{label}</div>
      <div style={{ fontSize: 10, color: token ? 'var(--color-primary)' : GH.mute, ...GH.num }}>{sub}</div>
    </div>
  </div>
);

const CD4_Colori = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Undici colori scritti a mano — dove sono finiti">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
        <Sw hex="#ead7c5" label="fondo blocco fedeltà" sub="sparito col blocco" cross/>
        <Sw hex="#F4E3A1" label="fondo barre" sub="sparito con le barre" cross/>
        <Sw hex="#fffaf6" label="fondo pagina" sub="→ --color-bg-main" token/>
        <Sw hex="#f0e7de" label="fondo medaglione" sub="→ --gh-tint" token/>
        <Sw hex="#EBC9A7" label="bordo bottone" sub="→ --color-border" token/>
        <Sw hex="#E5E7EB" label="argento (grigio Tailwind)" sub="→ --tier-silver" token/>
        <Sw hex="#cd7f32" label="bronzo" sub="→ --tier-bronze" token/>
        <Sw hex="#d4a017" label="oro" sub="→ --tier-gold" token/>
        <Sw hex="#94a3b8" label="testo secondario" sub="→ --color-text-secondary" token/>
        <Sw hex="#ffffff" label="bianco" sub="→ --color-surface-main" token/>
        <Sw hex="#16a34a" label="verde bottone" sub="→ --color-primary" token/>
      </div>
      <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.5, textWrap: 'pretty' }}>
        <b>I tre metalli erano già token dal giro GH-15</b> — <span style={GH.num}>--tier-bronze / -silver / -gold</span>. Non ne servono di nuovi: <b>zero token nuovi in questo giro</b>. Notare che l’argento scritto a mano era <span style={GH.num}>#E5E7EB</span>, un grigio d’interfaccia: il token è un argento vero.
      </div>
    </RefCard>

    <RefCard title="Il verde del pulsante — la decisione">
      <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 11, opacity: .55 }}>
          <Eyebrow>oggi</Eyebrow>
          <div style={{ height: 38, borderRadius: 9, background: '#16a34a', marginTop: 7, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12.5, fontWeight: 700 }}>Scrivi a Grooming Hub</div>
          <div style={{ fontSize: 10.5, color: GH.mute, marginTop: 6, ...GH.num }}>#16a34a · verde Tailwind</div>
        </div>
        <div style={{ flex: 1, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: 11, opacity: .55 }}>
          <Eyebrow>l’alternativa</Eyebrow>
          <div style={{ height: 38, borderRadius: 9, background: '#25D366', marginTop: 7, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12.5, fontWeight: 700 }}>WhatsApp</div>
          <div style={{ fontSize: 10.5, color: GH.mute, marginTop: 6, ...GH.num }}>#25D366 · verde vero</div>
        </div>
      </div>
      <div style={{ border: '1px solid var(--color-primary)', borderRadius: GH.r.field, padding: 11, background: 'var(--gh-tint)', marginBottom: 12 }}>
        <Eyebrow color="var(--color-primary)">la scelta</Eyebrow>
        <div style={{ marginTop: 7 }}><BigGesture primary icon="whatsapp" sub="rispondiamo qui, non su moduli">Scrivici su WhatsApp</BigGesture></div>
      </div>
      <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
        Il verde di oggi non è una citazione: è un verde «di successo» capitato lì. Ma <b>non lo sostituisco con quello vero</b>, che sarebbe l’altra soluzione difendibile.<br/><br/>
        La ragione: questa card è <b>l’unica superficie del salone</b> che il cliente vede per mesi. Dare il suo unico pulsante pieno al colore di un’altra azienda è una perdita, e nessuno inquadra un cartoncino di toelettatura aspettandosi WhatsApp.<br/><br/>
        <b>Dove porta lo dice il glifo, non il colore</b> — insieme alla parola «WhatsApp» nel testo e al sottotitolo. Tre segnali bastano; il quarto costa l’identità.
      </div>
    </RefCard>
  </div>
);

const CD4_Campi = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
    <RefCard title="Campi da verificare prima di scrivere">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 11 }}>
        {[
          ['cliente ha un accesso attivo?', 'serve per la seconda versione del gesto. Senza, si mostra sempre quella che spiega'],
          ['data della prima visita', '«la prima volta a marzo» — MIN(visits.date). Se non c’è, la riga perde il rimando e resta'],
          ['numero del salone per WhatsApp', 'il pulsante esiste già, quindi il dato c’è: da confermare che sia per salone e non fisso'],
          ['nome del salone', 'oggi è «Grooming Hub» scritto in pagina? In SaaS multi-tenant deve venire dal tenant'],
          ['razza mancante', '5 cani su 282 non l’hanno: la riga sotto il nome sparisce, il medaglione non si muove'],
        ].map(([f, d]) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>⚠ {f}</span>
            <span style={{ fontSize: 11.5, color: GH.mute }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
        <b>Non uso</b>: operatore, prossima visita, prezzo, servizio strutturato. Il brief dice che non esistono e la composizione non li nomina — nemmeno in forma di spazio vuoto.
      </div>
    </RefCard>

    <RefCard title="Domande aperte — dichiarate, non risolte">
      <QRow n="1" q="Il ritratto generico è la regola per l’85% dei cani: chi lo disegna? Oggi è un glifo, e un glifo è un segnaposto di segnaposto."
        mine="serve un’illustrazione vera, commissionata — non un disegno fatto col codice. Il medaglione è dimensionato per riceverla; finché non c’è, il glifo tiene il posto senza fingere di essere un ritratto."/>
      <QRow n="2" q="Il cartoncino può girare prima della prima visita? La card a zero visite dice «non ci siamo ancora conosciuti»."
        mine="ho composto la pagina per questo caso perché è il primo contatto per definizione. Se invece la card si consegna solo dopo la prima visita, quella frase non si vede mai e diventa codice morto: è una domanda sul processo del salone, non sul disegno."/>
      <QRow n="3" q="«Vedi le visite di Nina» promette un elenco. L’area cliente lo mostra davvero?"
        mine="se non lo mostra, la parola va cambiata — non la pagina. Ma non prometto con un pulsante quello che non c’è dietro: preferisco una parola più povera e vera."/>
      <QRow n="4" q="La card è la stessa per tutti i saloni in SaaS? Nome, numero, e forse colore vengono dal tenant."
        mine="composta come card di UN salone con l’insegna in testa. Se il tenant porta un suo colore, l’unico punto che cambia è il pulsante pieno — ed è un’altra ragione per non aver usato il verde di WhatsApp."/>
      <QRow n="5" q="Chi inquadra la card di un cane che non è suo vede tutto: nome, razza, quante volte è venuto. È accettabile?"
        mine="il token è opaco, quindi il rischio è il cartoncino perso, non l’indirizzo indovinato. Non ho toccato nulla, ma lo nomino perché la pagina è pubblica per costruzione e nessuno l’ha ancora chiamata così."/>
    </RefCard>
  </div>
);

Object.assign(window, { CD4_Domande, CD4_Fedelta, CD4_Colori, CD4_Campi, Soglia });
