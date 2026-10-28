/*
 * Regia: l'unico punto di ingresso per i comandi.
 *
 *   Regia.comando(nome, dati, origine) → { ok, motivo?, ... }
 *
 * Telecomando, tastiera, tocchi sullo schermo, pannello e (Prompt 7) console del telefono
 * chiamano solo questa funzione. I gestori dei tasti qui sotto traducono e basta:
 * tutta la logica dei comandi sta in COMANDI.
 * "dati" è un valore semplice (numero, stringa, booleano) o un piccolo oggetto.
 * "origine": 'tastiera' | 'schermo' | 'pannello' | 'console'.
 */
(function () {
  'use strict';

  const C = window.CONTENT_CONFIG;

  const ascoltatori = [];

  function ok(extra) { return Object.assign({ ok: true }, extra); }
  function no(motivo) { return { ok: false, motivo: motivo }; }
  function fase() { return Stato.fase(); }
  function dati() { return Stato.dati(); }
  function inFase() { return Array.prototype.indexOf.call(arguments, fase()) >= 0; }
  function dopoLaPesca(f) { return Stato.FASI.indexOf(f) > Stato.FASI.indexOf('pesca'); }

  // Iniziali in qualunque formato → gruppi di due lettere in ordine alfabetico.
  function normalizzaIniziali(testo) {
    const lettere = String(testo || '').toUpperCase().replace(/[^A-Z]/g, '');
    const gruppi = lettere.match(/.{1,2}/g) || [];
    return gruppi.sort().join(' ');
  }

  // Cosa farà il prossimo "avanti" (per la console e per il pannello).
  function prossimoAvanti() {
    const f = fase();
    if (inFase('attesa', 'verifica', 'sollievo', 'pesca')) return dati().colpevole ? 'morte' : null;
    if (f === 'atto1') return 'manifestazione';
    if (f === 'mezzanotte') return dati().tocchi !== null && dati().sospetti ? 'voce2' : null;
    if (f === 'giro') return 'timer';
    if (f === 'titoli' && dati().confessione === 'attesa') return 'confessione';
    return null;
  }

  const COMANDI = {
    // --- Telecomando e console ------------------------------------------------
    avanti: function () {
      switch (prossimoAvanti()) {
        case 'morte': Stato.vai('morte'); return ok();
        case 'manifestazione': Stato.evento('manifestazione'); return ok();
        case 'voce2': Stato.vai('risveglio'); return ok();
        case 'timer': Stato.vai('porta'); return ok();
        case 'confessione': return COMANDI.confessione();
      }
      if (inFase('attesa', 'verifica', 'sollievo', 'pesca')) return no('colpevole_mancante');
      if (fase() === 'mezzanotte') return no(dati().tocchi === null ? 'tocchi_mancanti' : 'sospetti_mancanti');
      return no('niente');
    },

    pausa: function () {
      if (dati().pausa) { Stato.pausa(false); return ok({ pausa: false }); }
      if (!Stato.orologioAttivo() && !Stato.portaAttiva()) return no('niente_da_fermare');
      Stato.pausa(true);
      return ok({ pausa: true });
    },

    velo: function () {
      Stato.imposta({ velo: !dati().velo });
      return ok({ velo: dati().velo });
    },

    tocchi: function (n) {
      n = Number(n);
      if (!(n >= 0 && n <= C.tocchi_max && Math.floor(n) === n)) return no('valore');
      const campi = { tocchi: n };
      if (fase() === 'mezzanotte') campi.tocchiAl = Stato.trascorso('fase');
      Stato.imposta(campi);
      return ok();
    },

    // I tre sospetti di mezzanotte (SPEC-v4). Lo schermo dice se il colpevole è tra loro e, se sì,
    // ne scagiona uno degli altri due. La scelta si salva: ricaricando non cambia.
    // Solo a mezzanotte e una volta; il pannello può correggerli sempre.
    sospetti: function (lista, origine) {
      if (!Array.isArray(lista) || lista.length !== 3) return no('valore');
      const carte = Stato.carteInGioco();
      if (lista.some(function (id) { return carte.indexOf(id) < 0; })) return no('valore');
      if (lista[0] === lista[1] || lista[0] === lista[2] || lista[1] === lista[2]) return no('valore');
      if (origine !== 'pannello') {
        if (fase() !== 'mezzanotte') return no('fase');
        if (dati().sospetti) return no('sospetti_gia');
      }
      const prima = dati().sospetti;
      const tra = lista.indexOf(dati().colpevole) >= 0;
      const altri = lista.filter(function (id) { return id !== dati().colpevole; });
      let scagionato = null;
      if (tra) {
        // stessa carta di prima se il pannello ripete gli stessi tre
        scagionato = prima && prima.scagionato && altri.indexOf(prima.scagionato) >= 0
          ? prima.scagionato : altri[Math.floor(Math.random() * altri.length)];
      }
      Stato.imposta({ sospetti: {
        scelti: lista.slice(),
        tra: tra,
        scagionato: scagionato,
        al: fase() === 'mezzanotte' ? Stato.trascorso('fase') : null
      } });
      return ok();
    },

    sigillo: function (arcano) {
      if (fase() !== 'sigillo') return no('fase');
      if (Stato.carteInGioco().indexOf(arcano) < 0) return no('valore');
      Stato.imposta({ nominato: arcano });
      Stato.vai(arcano === dati().colpevole ? 'sigillata' : 'attraversata');
      return ok();
    },

    confessione: function () {
      if (fase() !== 'titoli' || dati().confessione !== 'attesa') return no('niente');
      Stato.imposta({ confessione: 'in_corso', confessioneAl: Stato.trascorso('fase') });
      return ok();
    },

    vai_a: function (f) {
      if (Stato.FASI.indexOf(f) < 0) return no('valore');
      if (dopoLaPesca(f) && !dati().colpevole) return no('colpevole_mancante');
      Stato.vai(f, { salto: true });
      return ok();
    },

    // ±minuti: all'orologio di scena (ora più avanti) o alla porta (più tempo che resta).
    orologio: function (minuti) {
      const ms = Number(minuti) * 60000;
      if (!ms) return no('valore');
      if (inFase('morte', 'atto1')) { Stato.sposta('orologio', ms); return ok(); }
      if (inFase('porta', 'voto')) { Stato.sposta('porta', -ms); return ok(); }
      return no('fase');
    },

    volume: function (v) {
      v = Number(v);
      if (!(v >= 0 && v <= 1)) return no('valore');
      Stato.imposta({ volume: v });
      return ok();
    },

    // --- Tocchi dei giocatori sullo schermo -----------------------------------
    inizia: function () {
      if (fase() !== 'avvio') return no('fase');
      Stato.vai('attesa');
      return ok();
    },

    apri_verifica: function () {
      if (fase() !== 'attesa') return no('fase');
      Stato.vai('verifica');
      return ok();
    },

    chiudi_verifica: function () {
      if (fase() !== 'verifica') return no('fase');
      Stato.vai('attesa');
      return ok();
    },

    // { candela: 'bianca'|'rossa'|'nera', testo: 'gr sm fb' }
    verifica: function (d) {
      const attese = d && C.candele[d.candela];
      if (fase() !== 'verifica' || !attese) return no('valore');
      const giusto = normalizzaIniziali(d.testo) === normalizzaIniziali(attese.join(''));
      if (giusto) {
        const fiamme = Object.assign({}, dati().fiamme);
        fiamme[d.candela] = true;
        Stato.imposta({ fiamme: fiamme });
      }
      return ok({ giusto: giusto });
    },

    fiamme_accese: function () {
      if (!inFase('attesa', 'verifica')) return no('fase');
      Stato.vai('sollievo');
      return ok();
    },

    codice: function (testo) {
      if (fase() !== 'morte') return no('fase');
      const giusto = String(testo || '').replace(/\D/g, '') === String(C.codice_fascicolo);
      if (giusto) Stato.vai('atto1', { intro: true });
      else Stato.evento('codice_sbagliato');
      return ok({ giusto: giusto });
    },

    nominato: function () {
      if (fase() !== 'voto') return no('fase');
      Stato.vai('sigillo');
      return ok();
    },

    // Atto 1: fa ripartire la voce 1 dall'inizio, o la ferma se sta suonando.
    riascolta: function () {
      if (fase() !== 'atto1') return no('fase');
      if (Stato.riascoltoInCorso()) { Stato.imposta({ riascolto: null }); return ok({ riascolto: false }); }
      Stato.imposta({ riascolto: { chiave: 'audio1', dal: Stato.trascorso('fase') } });
      return ok({ riascolto: true });
    },

    // --- Pannello -------------------------------------------------------------
    colpevole: function (id) {
      if (C.portanti.indexOf(id) < 0) return no('valore');
      Stato.imposta({ colpevole: id });
      // Con un altro colpevole l'esito dei sospetti va ricalcolato.
      if (dati().sospetti) COMANDI.sospetti(dati().sospetti.scelti, 'pannello');
      return ok();
    },

    sorteggia: function () {
      const id = C.portanti[Math.floor(Math.random() * C.portanti.length)];
      Stato.imposta({ colpevole: id });
      return ok({ colpevole: id });
    },

    giocatori: function (n) {
      n = Number(n);
      if (!(n >= C.giocatori_min && n <= C.giocatori_max && Math.floor(n) === n)) return no('valore');
      Stato.imposta({ giocatori: n });
      // Sospetti su carte che non sono più in gioco non hanno senso.
      const s = dati().sospetti;
      if (s && s.scelti.some(function (id) { return Stato.carteInGioco().indexOf(id) < 0; })) Stato.imposta({ sospetti: null });
      return ok();
    },

    prova: function (attiva) {
      Stato.velocita(attiva ? 10 : 1);
      return ok();
    },

    schermo_intero: function () {
      Schermo.schermoIntero();
      return ok();
    },

    reset: function () {
      Stato.reset();
      return ok();
    }
  };

  function comando(nome, valore, origine) {
    const fn = COMANDI[nome];
    let esito;
    try {
      esito = fn ? (fn(valore, origine) || ok()) : no('sconosciuto');
    } catch (e) {
      console.error(e);
      esito = no('sconosciuto');
    }
    ascoltatori.forEach(function (a) {
      try { a(nome, valore, origine || 'schermo', esito); } catch (e) { console.error(e); }
    });
    return esito;
  }

  // --- Telecomando e tastiera: solo traduzione in comandi -----------------------

  function tasto(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (window.Pannello && Pannello.aperto()) return;
    const k = e.key;
    if (k === 'F5') { e.preventDefault(); return; }   // non deve ricaricare per sbaglio
    const inCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);

    let nome = null, valore;
    if (k === 'PageDown') nome = 'avanti';
    else if (k === 'PageUp') nome = 'pausa';
    else if (!inCampo) {
      if (k === 'ArrowRight' || k === ' ') nome = 'avanti';
      else if (k === 'ArrowLeft') nome = 'pausa';
      else if (k === 'b' || k === 'B' || k === '.') nome = 'velo';
      else if (k === 'f' || k === 'F') nome = 'schermo_intero';
      else if (/^[0-9]$/.test(k) && Number(k) <= C.tocchi_max && fase() === 'mezzanotte') { nome = 'tocchi'; valore = Number(k); }
    }
    if (!nome) return;
    e.preventDefault();
    if (e.repeat) return;   // tasto tenuto premuto: vale una volta sola
    comando(nome, valore, 'tastiera');
  }

  document.addEventListener('keydown', tasto);

  window.Regia = {
    comando: comando,
    prossimoAvanti: prossimoAvanti,
    // fn(nome, dati, origine, esito): per il puntino, il pannello e (Prompt 7) la console.
    ascolta: function (fn) { ascoltatori.push(fn); }
  };
})();
