/*
 * Stato della serata: fasi, salvataggio in localStorage, tempo.
 *
 * Il tempo si calcola sempre da timestamp, mai contando i tick, così una ricarica
 * riparte esattamente da dove era. Ci sono due livelli:
 *   - il "tempo di gioco" G: scorre come l'orologio vero, ×10 in modalità prova;
 *   - i cronometri (fase, orologio di scena, porta): misurano G, e si fermano in pausa.
 *
 * Qui non c'è nessuna logica dei comandi: quella è in regia.js.
 */
(function () {
  'use strict';

  const C = window.CONTENT_CONFIG;
  const T = window.CONTENT_TESTI;
  const S = window.CONTENT_SEGRETO;
  const A = window.CONTENT_ARCANI;

  const VERSIONE = 1;
  const FASI = ['avvio', 'attesa', 'verifica', 'sollievo', 'pesca', 'morte', 'atto1', 'mezzanotte',
    'risveglio', 'giro', 'porta', 'voto', 'sigillo', 'sigillata', 'attraversata', 'titoli'];

  const MIN = 60000;
  function minuti(hhmm) { const p = hhmm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  const INIZIO_SCENA = minuti(C.orologio_scena.inizio);
  const DURATA_OROLOGIO = (minuti(C.orologio_scena.mezzanotte) - INIZIO_SCENA) * MIN;
  const DURATA_PORTA = C.tempi.porta_min * MIN;
  const VOTO = C.tempi.voto_min * MIN;
  function s(sec) { return sec * 1000; }

  let stato = null;
  const ascoltatori = [];

  // --- Tempo di gioco ---------------------------------------------------------

  function G() {
    const t = stato.tempo;
    return t.base + (Date.now() - t.rif) * t.velocita;
  }

  function crono() { return { attivo: false, acc: 0, dal: null }; }

  function trascorsoDi(c) {
    return c.acc + (c.dal !== null ? G() - c.dal : 0);
  }

  function avviaCrono(c, da) {
    c.attivo = true;
    c.acc = da || 0;
    c.dal = stato.pausa ? null : G();
  }

  function fermaCrono(c, valore) {
    c.acc = valore !== undefined ? valore : trascorsoDi(c);
    c.dal = null;
    c.attivo = false;
  }

  function tuttiICroni() { return [stato.cronoFase, stato.orologio, stato.porta]; }

  // --- Stato nuovo, salvataggio, ripristino ------------------------------------

  function nuovo() {
    const n = {
      versione: VERSIONE,
      fase: 'avvio',
      tempo: { base: 0, rif: Date.now(), velocita: 1 },
      cronoFase: crono(),
      orologio: crono(),
      porta: crono(),
      pausa: false,
      velo: false,
      colpevole: (S && A[S.colpevole]) ? S.colpevole : null,
      giocatori: C.giocatori_default || C.giocatori_max,
      tocchi: null,
      tocchiAl: null,      // trascorso della fase quando sono stati inseriti i tocchi (solo a mezzanotte)
      sospetti: null,      // { scelti: [3 arcani], tra: bool, scagionato: arcano|null, al: ms della fase }
      fiamme: { bianca: false, rossa: false, nera: false },
      introAtto1: false,   // true se all'atto 1 si è arrivati col codice: si mostrano le frasi dei piatti
      riascolto: null,     // atto 1: { chiave: 'audio1', dal: ms della fase } se la voce 1 sta ripartendo
      documentiVisti: [],
      nominato: null,
      confessione: 'attesa',   // attesa | in_corso | fatta | saltata
      confessioneAl: null,
      volume: 1
    };
    n.cronoFase.attivo = true;
    n.cronoFase.dal = 0;
    return n;
  }

  function salva() {
    try { localStorage.setItem(C.chiave_storage, JSON.stringify(stato)); } catch (e) { /* storage bloccato: si va avanti */ }
  }

  function carica() {
    let salvato = null;
    try { salvato = JSON.parse(localStorage.getItem(C.chiave_storage)); } catch (e) { salvato = null; }
    if (salvato && salvato.versione === VERSIONE && FASI.indexOf(salvato.fase) >= 0 && salvato.tempo) {
      stato = Object.assign(nuovo(), salvato);
      return true;
    }
    stato = nuovo();
    salva();
    return false;
  }

  function notifica(tipo, dati) {
    ascoltatori.forEach(function (fn) {
      try { fn(tipo, dati); } catch (e) { console.error(e); }
    });
  }

  function cambiato() { salva(); notifica('stato'); }

  // --- Fasi -------------------------------------------------------------------

  // Cosa succede entrando in una fase. "salto" = arrivati dal pannello o dalla console.
  function entra(fase, opz) {
    const i = FASI.indexOf(fase);
    if (i <= FASI.indexOf('pesca')) {
      stato.orologio = crono();
      stato.porta = crono();
    }
    switch (fase) {
      case 'morte':
        avviaCrono(stato.orologio);
        stato.porta = crono();
        break;
      case 'atto1':
        if (!stato.orologio.attivo || trascorsoDi(stato.orologio) >= DURATA_OROLOGIO) avviaCrono(stato.orologio);
        stato.introAtto1 = !!opz.intro;
        stato.riascolto = null;
        break;
      case 'mezzanotte':
        stato.tocchiAl = null;
        // Tornando a mezzanotte, i sospetti già dati si mostrano come risultato, senza rigirare le carte.
        if (stato.sospetti) stato.sospetti = Object.assign({}, stato.sospetti, { al: null });
        break;
      case 'porta':
        if (!stato.porta.attivo || DURATA_PORTA - trascorsoDi(stato.porta) <= VOTO) avviaCrono(stato.porta);
        break;
      case 'voto':
        if (!stato.porta.attivo || DURATA_PORTA - trascorsoDi(stato.porta) > VOTO) avviaCrono(stato.porta, DURATA_PORTA - VOTO);
        break;
      case 'sigillo':
      case 'sigillata':
      case 'attraversata':
        // Il timer si ferma: nessuno deve perdere perché la carta si gira lentamente.
        if (stato.porta.attivo) fermaCrono(stato.porta);
        break;
      case 'titoli':
        stato.confessione = 'attesa';
        stato.confessioneAl = null;
        break;
    }
    // Da mezzanotte in poi l'orologio di scena resta fermo sulle 24:00.
    if (i >= FASI.indexOf('mezzanotte')) fermaCrono(stato.orologio, DURATA_OROLOGIO);
    if (i < FASI.indexOf('porta')) stato.porta = crono();
  }

  function vai(fase, opz) {
    opz = opz || {};
    const da = stato.fase;
    if (opz.salto && stato.pausa) riprendiTutto();
    stato.fase = fase;
    stato.cronoFase = crono();
    avviaCrono(stato.cronoFase);
    entra(fase, opz);
    salva();
    notifica('fase', { da: da, a: fase, salto: !!opz.salto });
  }

  // --- Pausa, velocità, spostamenti ---------------------------------------------

  function pausaTutto() {
    tuttiICroni().forEach(function (c) {
      if (c.attivo && c.dal !== null) { c.acc += G() - c.dal; c.dal = null; }
    });
    stato.pausa = true;
  }

  function riprendiTutto() {
    stato.pausa = false;
    tuttiICroni().forEach(function (c) { if (c.attivo) c.dal = G(); });
  }

  function velocita(v) {
    stato.tempo = { base: G(), rif: Date.now(), velocita: v };
    cambiato();
  }

  // Sposta il trascorso di un cronometro (ms, anche negativi), mai sotto zero.
  function sposta(nome, ms) {
    const c = stato[nome];
    c.acc += ms;
    const t = trascorsoDi(c);
    if (t < 0) c.acc -= t;
    cambiato();
  }

  // --- Durate e sottofasi -----------------------------------------------------

  // Com'è finita: serve alla confessione.
  function esito() {
    return stato.nominato && stato.nominato === stato.colpevole ? 'sigillata' : 'attraversata';
  }

  // Durata di una voce in ms: quella del file, o una stima se il file manca (audio.js).
  // Finché il file si sta ancora leggendo è infinita: la fase aspetta.
  function durataVoce(chiave) {
    if (chiave === 'confessione') chiave = 'confessione_' + esito();
    const d = window.Suoni ? Suoni.durata(chiave) : null;
    return d === null ? Infinity : d;
  }

  function trascorso(nome) { return trascorsoDi(nome === 'fase' ? stato.cronoFase : stato[nome]); }

  function rimanentePorta() { return Math.max(0, DURATA_PORTA - trascorsoDi(stato.porta)); }

  // Minuti di scena (es. 23*60+47) con i secondi come frazione.
  function oraScena() { return INIZIO_SCENA + Math.min(trascorsoDi(stato.orologio), DURATA_OROLOGIO) / MIN; }

  // Il passo dentro la fase, calcolato dal tempo: serve alla grafica e alla regia.
  function sottofase() {
    const f = stato.fase, t = trascorso('fase'), tp = C.tempi;
    if (f === 'morte') {
      if (t < s(tp.nero_iniziale_s)) return 'nero';
      if (t < s(tp.nero_iniziale_s) + durataVoce('audio1')) return 'voce';
      return 'codice';
    }
    if (f === 'atto1' && stato.introAtto1) {
      if (t < s(tp.chiave_giusta_s)) return 'chiave_giusta';
      if (t < s(tp.chiave_giusta_s + tp.dopo_codice_s)) return 'dopo_codice';
    }
    if (f === 'atto1') return 'fascicolo';
    if (f === 'mezzanotte') {
      // prima i tocchi (8 s), poi i tre sospetti: le carte si girano, l'esito, lo scagionato, "Raccontate."
      const sp = stato.sospetti;
      if (stato.tocchiAl !== null && t - stato.tocchiAl < s(tp.tocchi_s)) return 'tocchi';
      if (sp && sp.al !== null && t - sp.al < s(tp.sospetti_s)) {
        const d = t - sp.al;
        if (d < s(tp.sospetti_esito_s)) return 'sospetti_carte';
        if (!sp.tra || d < s(tp.sospetti_scagionato_s)) return 'sospetti_esito';
        return 'sospetti_scagionato';
      }
      if (stato.tocchi === null) return 'legge';
      if (!sp) return 'sospetti_attesa';
      return 'raccontate';
    }
    // Giro di mezzanotte: prima "Aprite le vostre buste.", poi lo spirito passa tra i giocatori.
    if (f === 'giro') return t < s(tp.buste_s) ? 'buste' : 'spirito';
    if (f === 'porta' && trascorso('porta') < s(tp.round_iniziale_s)) return 'round_iniziale';
    if (f === 'titoli') return 'confessione_' + stato.confessione;
    return null;
  }

  // Nome del round della porta: la chiave più piccola tra quelle >= ai minuti rimasti.
  function round() {
    const min = rimanentePorta() / MIN;
    const chiavi = Object.keys(T.porta.round).map(Number).sort(function (a, b) { return a - b; });
    const k = chiavi.find(function (c) { return min <= c; });
    return T.porta.round[k !== undefined ? k : chiavi[chiavi.length - 1]];
  }

  // --- Passaggi automatici ----------------------------------------------------

  function prossimaAutomatica() {
    const f = stato.fase, t = trascorso('fase');
    if (f === 'sollievo' && t >= s(C.tempi.sollievo_s)) return 'pesca';
    if ((f === 'morte' || f === 'atto1') && trascorso('orologio') >= DURATA_OROLOGIO) return 'mezzanotte';
    if (f === 'risveglio' && t >= durataVoce('audio2')) return 'giro';
    if ((f === 'porta' || f === 'voto') && rimanentePorta() <= 0) return 'attraversata';
    if (f === 'porta' && rimanentePorta() <= VOTO) return 'voto';
    if ((f === 'sigillata' || f === 'attraversata') && t >= s(C.tempi.voce_finale_dopo_s) + durataVoce(f)) return 'titoli';
    return null;
  }

  // Chiamata a ogni tick. Dopo una ricarica può fare più passaggi di fila.
  function controlla() {
    for (let i = 0; i < 10; i++) {
      const p = prossimaAutomatica();
      if (!p) break;
      vai(p);
    }
    if (stato.fase === 'titoli') {
      const t = trascorso('fase');
      if (stato.confessione === 'attesa' && t >= s(C.tempi.attesa_confessione_s)) {
        stato.confessione = 'saltata';
        cambiato();
      } else if (stato.confessione === 'in_corso' && t - stato.confessioneAl >= durataVoce('confessione')) {
        stato.confessione = 'fatta';
        cambiato();
      }
    }
  }

  // --- Interfaccia ---------------------------------------------------------------

  window.Stato = {
    FASI: FASI,
    DURATA_OROLOGIO: DURATA_OROLOGIO,
    DURATA_PORTA: DURATA_PORTA,

    carica: carica,
    dati: function () { return stato; },
    fase: function () { return stato.fase; },
    vai: vai,
    controlla: controlla,

    // Cambia uno o più campi semplici (colpevole, tocchi, velo...) e salva.
    imposta: function (campi) { Object.assign(stato, campi); cambiato(); },
    pausa: function (si) { if (si) pausaTutto(); else riprendiTutto(); cambiato(); },
    velocita: velocita,
    sposta: sposta,
    reset: function () {
      try { localStorage.removeItem(C.chiave_storage); } catch (e) { /* niente */ }
      stato = nuovo();
      salva();
      notifica('fase', { da: null, a: stato.fase });
    },

    trascorso: trascorso,
    rimanentePorta: rimanentePorta,
    oraScena: oraScena,
    sottofase: sottofase,
    round: round,
    durataVoce: durataVoce,
    esito: esito,
    orologioAttivo: function () { return stato.orologio.attivo; },
    // Atto 1: la voce 1 sta ripartendo per chi vuole riascoltarla?
    riascoltoInCorso: function () {
      const r = stato.riascolto;
      return !!r && stato.fase === 'atto1' && trascorso('fase') - r.dal < durataVoce(r.chiave);
    },
    portaAttiva: function () { return stato.porta.attivo; },

    carteInGioco: function () {
      return C.portanti.concat(C.carte_extra_in_ordine.slice(0, stato.giocatori - C.portanti.length));
    },

    // Effetti di un momento (manifestazione, codice sbagliato...): non si salvano.
    evento: function (nome, dati) { notifica('evento', { nome: nome, dati: dati }); },
    ascolta: function (fn) { ascoltatori.push(fn); }
  };
})();
