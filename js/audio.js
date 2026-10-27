/*
 * Suoni: mixer a quattro canali (ambiente, musica, effetti, voce), dissolvenze, ducking,
 * sottotitoli delle voci e voce sintetica quando manca un file.
 *
 * Non comanda niente: a ogni tick guarda lo stato (fase, tempo della fase, pausa) e mette
 * in onda quello che "dovrebbe" suonare adesso. Così dopo una ricarica, una pausa o un salto
 * di fase l'audio si rimette da solo al punto giusto, e la voce segue l'orologio della fase.
 *
 * Volumi: su https (iPad) passano da Web Audio, perché Safari ignora audio.volume;
 * da file:// si usa audio.volume, perché Web Audio lì non può leggere i file locali.
 */
(function () {
  'use strict';

  const AU = window.CONTENT_AUDIO;
  const T = window.CONTENT_TESTI;
  const S = window.CONTENT_SEGRETO;
  const C = window.CONTENT_CONFIG;

  // --- Le voci e la loro durata -----------------------------------------------

  function righe(lista) { return lista.map(function (t) { return typeof t === 'string' ? { testo: t } : t; }); }
  const VOCI = {
    audio1: { file: T.audio1.file, righe: righe(T.audio1.righe) },
    audio2: { file: T.audio2.file, righe: righe(T.audio2.righe) },
    sigillata: { file: T.sigillata.file, righe: righe(T.sigillata.righe) },
    attraversata: { file: T.attraversata.file, righe: righe(T.attraversata.righe) },
    confessione_sigillata: { file: AU.confessione.sigillata, righe: righe(S.confessione.comune.concat([S.confessione.sigillata])) },
    confessione_attraversata: { file: AU.confessione.attraversata, righe: righe(S.confessione.comune.concat([S.confessione.attraversata])) }
  };

  // Secondi che servono a dire una riga, quando manca il file.
  function stimaRiga(testo) {
    const v = C.tempi.voce_senza_audio;
    return Math.max(v.minimo_riga_s, testo.length * v.secondi_per_carattere) + v.pausa_s;
  }
  function stima(chiave) {
    return VOCI[chiave].righe.reduce(function (s, r) { return s + stimaRiga(r.testo); }, 0) * 1000;
  }

  // Stato dei file: si scopre provando a leggerne i metadati.
  const file = {};   // nome → { stato: 'attesa'|'ok'|'mancante', durata (ms), dal }
  function sonda(nome) {
    if (file[nome]) return file[nome];
    const info = file[nome] = { stato: 'attesa', durata: null, dal: Date.now() };
    const a = new window.Audio();
    a.preload = 'metadata';
    a.addEventListener('loadedmetadata', function () {
      info.stato = 'ok';
      info.durata = isFinite(a.duration) ? a.duration * 1000 : null;
    });
    a.addEventListener('error', function () { info.stato = 'mancante'; });
    a.src = AU.cartella + nome;
    return info;
  }

  // ms; null finché il file si sta ancora leggendo (al massimo 3 secondi).
  function durata(chiave) {
    const v = VOCI[chiave];
    if (!v) return null;
    const info = sonda(v.file);
    if (info.stato === 'ok' && info.durata) return info.durata;
    if (info.stato === 'mancante' || Date.now() - info.dal > 3000) return stima(chiave);
    return null;
  }

  function fileVoceOk(chiave) { const i = sonda(VOCI[chiave].file); return i.stato === 'ok' && i.durata; }

  // Inizio di ogni riga dei sottotitoli (ms dall'inizio della voce): i "t" scritti in testi.js
  // se ci sono per tutte le righe, altrimenti in proporzione alla lunghezza delle righe.
  function inizi(chiave, dur) {
    const r = VOCI[chiave].righe;
    if (r.every(function (x) { return typeof x.t === 'number'; })) return r.map(function (x) { return x.t * 1000; });
    const pesi = r.map(function (x) { return stimaRiga(x.testo); });
    const tot = pesi.reduce(function (a, b) { return a + b; }, 0);
    let acc = 0;
    return pesi.map(function (p) { const s = acc / tot * dur; acc += p; return s; });
  }

  // --- Lettori ---------------------------------------------------------------

  const usaWebAudio = /^https?:$/.test(location.protocol);
  let ctx = null, sbloccato = false;

  function lettore() {
    const el = new window.Audio();
    el.preload = 'auto';
    const l = { el: el, gain: null, file: null, id: null, vol: 0, volTraccia: 1, rampa: null, fermaAZero: false };
    el.addEventListener('error', function () {
      if (l.file && file[l.file] === undefined) file[l.file] = { stato: 'mancante', durata: null, dal: Date.now() };
      else if (l.file) file[l.file].stato = 'mancante';
    });
    return l;
  }
  const canali = {
    ambiente: [lettore(), lettore()],
    musica: [lettore(), lettore()],
    effetti: [lettore(), lettore(), lettore()],
    voce: [lettore()]
  };
  function tutti() { return [].concat(canali.ambiente, canali.musica, canali.effetti, canali.voce); }
  const inOnda = { ambiente: null, musica: null };   // { id, l }
  let prossimoEffetto = 0;

  // Un WAV muto di 0,1 s, per "sbloccare" i lettori dentro il primo tocco (regola di iPad).
  const SILENZIO = (function () {
    const n = 800, b = new Uint8Array(44 + n), v = new DataView(b.buffer);
    function w(o, s) { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); }
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    w(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) b[44 + i] = 128;
    let s = '';
    b.forEach(function (x) { s += String.fromCharCode(x); });
    return 'data:audio/wav;base64,' + btoa(s);
  })();

  // Da chiamare dentro un clic o un tasto.
  function sblocca() {
    if (usaWebAudio && !ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    tutti().forEach(function (l) {
      if (ctx && !l.gain) {
        try {
          const src = ctx.createMediaElementSource(l.el);
          l.gain = ctx.createGain();
          src.connect(l.gain);
          l.gain.connect(ctx.destination);
          l.el.volume = 1;
        } catch (e) { l.gain = null; }
      }
      if (!l.file) {
        l.el.src = SILENZIO;
        const p = l.el.play();
        if (p && p.then) p.then(function () { if (!l.file) l.el.pause(); }).catch(function () { /* niente */ });
      }
    });
    sbloccato = true;
    if (window.speechSynthesis) { try { speechSynthesis.getVoices(); } catch (e) { /* niente */ } }
  }

  function avviaSu(l, nomeFile, opz) {
    l.file = nomeFile;
    l.el.loop = !!opz.loop;
    l.el.src = AU.cartella + nomeFile;
    const pos = opz.offset || 0;
    if (pos > 0) {
      l.el.addEventListener('loadedmetadata', function vai() {
        l.el.removeEventListener('loadedmetadata', vai);
        try { l.el.currentTime = pos; } catch (e) { /* niente */ }
      });
    }
    l.volTraccia = opz.volume === undefined ? 1 : opz.volume;
    l.fermaAZero = false;
    if (opz.fade) { l.vol = 0; sfuma(l, 1, opz.fade); } else { l.vol = 1; l.rampa = null; }
    const p = l.el.play();
    if (p && p.catch) p.catch(function () { /* bloccato o file mancante: si va avanti */ });
  }

  function suonaTraccia(l, id, opz) {
    const tr = AU.tracce[id];
    if (!tr) return;
    l.id = id;
    avviaSu(l, tr.file, { loop: tr.loop, volume: tr.volume, offset: opz.offset, fade: opz.fade });
  }

  function sfuma(l, a, secondi, ferma) {
    l.rampa = { da: l.vol, a: a, t0: Date.now(), dur: Math.max(1, secondi * 1000) };
    l.fermaAZero = !!ferma;
  }

  function ferma(l, secondi) {
    if (!l.file) return;
    if (secondi) sfuma(l, 0, secondi, true);
    else { l.el.pause(); l.file = null; l.id = null; l.rampa = null; l.vol = 0; }
  }

  // --- Cosa deve suonare adesso -------------------------------------------------

  // { ambiente: {id}, musica: {id, dal}, voce: {chiave, dal} }; "dal" = ms della fase in cui la traccia è a 0.
  function desiderato(d, f, sf) {
    const des = { ambiente: null, musica: null, voce: null };
    const nero = C.tempi.nero_iniziale_s * 1000;
    switch (f) {
      case 'attesa': case 'verifica':
        des.ambiente = { id: 'ambiente_attesa' }; break;
      case 'sollievo':
        des.ambiente = { id: 'ambiente_attesa' }; des.musica = { id: 'sollievo', dal: 0 }; break;
      case 'pesca':
        // l'accordo del sollievo continua e si incrina: è nel file stesso
        des.musica = { id: 'sollievo', dal: -C.tempi.sollievo_s * 1000 }; break;
      case 'morte':
        des.voce = { chiave: 'audio1', dal: nero };
        if (sf === 'codice') des.ambiente = { id: 'atto1_loop' };
        break;
      case 'atto1':
        des.ambiente = { id: 'atto1_loop' }; break;
      case 'risveglio':
        des.voce = { chiave: 'audio2', dal: 0 }; break;
      case 'giro':
        // musica bassa mentre lo spirito passa dietro ai giocatori
        des.ambiente = { id: 'ambiente_attesa' }; break;
      case 'porta': case 'voto': case 'sigillo': {
        const meta = C.tempi.porta_min * 30000;
        des.musica = { id: Stato.rimanentePorta() > meta ? 'porta_A' : 'porta_B' };
        if (f !== 'sigillo' && Stato.rimanentePorta() <= C.tempi.battito_s * 1000) des.ambiente = { id: 'battito' };
        break;
      }
      case 'sigillata': case 'attraversata':
        des.voce = { chiave: f, dal: C.tempi.voce_finale_dopo_s * 1000 }; break;
      case 'titoli':
        if (d.confessione === 'in_corso') des.voce = { chiave: 'confessione_' + Stato.esito(), dal: d.confessioneAl };
        break;
    }
    if (d.pausa) { des.ambiente = { id: 'pausa_loop' }; des.musica = null; }
    return des;
  }

  // Effetti che partono a un certo ms della fase. "se" facoltativo.
  const CUE = {
    morte: [{ id: 'blackout', a: 0 }, { id: 'possessione', a: function () { return C.tempi.nero_iniziale_s * 1000; } }],
    atto1: [{ id: 'sblocco', a: 0, se: function (d) { return d.introAtto1; } }],
    mezzanotte: [{ id: 'mezzanotte_12', a: 0 }],
    sigillata: [{ id: 'sigillo', a: 0 }],
    attraversata: [{ id: 'attraversamento', a: 0 }]
  };

  function effetto(id) {
    if (!sbloccato) return;
    const l = canali.effetti[prossimoEffetto];
    prossimoEffetto = (prossimoEffetto + 1) % canali.effetti.length;
    suonaTraccia(l, id, {});
  }

  function canale(nome, voluto, t, fadeS) {
    const ora = inOnda[nome];
    const id = voluto ? voluto.id : null;
    if ((ora ? ora.id : null) === id) return;
    if (ora && ora.l) ferma(ora.l, fadeS);
    inOnda[nome] = null;
    if (!id) return;
    const tr = AU.tracce[id];
    let offset = 0;
    if (voluto.dal !== undefined && !tr.loop) {
      offset = (t - voluto.dal) / 1000;
      const info = file[tr.file];
      if (offset < 0.5) offset = 0;
      if (info && info.durata && offset * 1000 >= info.durata) { inOnda[nome] = { id: id, l: null }; return; }
    }
    const l = canali[nome][0] === (ora && ora.l) ? canali[nome][1] : canali[nome][0];
    suonaTraccia(l, id, { offset: offset, fade: offset ? 1 : fadeS });
    inOnda[nome] = { id: id, l: l };
  }

  // --- La voce: segue l'orologio della fase --------------------------------------

  let voceOra = null;   // { chiave, pos, dur } se una voce è in corso
  let parlaRiga = null;
  let voceItaliana;

  function voceSintetica() {
    if (voceItaliana !== undefined && voceItaliana !== null) return voceItaliana;
    if (!window.speechSynthesis) { voceItaliana = null; return null; }
    const lingua = AU.voce_sintetica.lingua;
    const voci = speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lingua) === 0; });
    if (!voci.length) return null;   // le voci arrivano anche dopo: si riprova al prossimo tick
    voceItaliana = voci.find(function (v) { return v.localService; }) || voci[0];
    return voceItaliana;
  }

  function parla(chiave, i, testo, volume) {
    const k = chiave + ':' + i;
    if (parlaRiga === k) return;
    const v = voceSintetica();
    if (!v) return;
    parlaRiga = k;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(Schermo.componi(testo));
      u.voice = v;
      u.lang = v.lang;
      u.rate = AU.voce_sintetica.velocita;
      u.pitch = AU.voce_sintetica.tono;
      u.volume = volume;
      speechSynthesis.speak(u);
    } catch (e) { /* niente voce: restano i sottotitoli */ }
  }

  function taci() {
    if (parlaRiga === null) return;
    parlaRiga = null;
    try { speechSynthesis.cancel(); } catch (e) { /* niente */ }
  }

  function voce(des, t, d) {
    const l = canali.voce[0];
    voceOra = null;
    let dur = des ? durata(des.chiave) : null;
    const pos = des ? t - des.dal : -1;
    if (!des || dur === null || pos < 0 || pos >= dur) {
      if (l.file) ferma(l);
      taci();
      return;
    }
    voceOra = { chiave: des.chiave, pos: pos, dur: dur };
    const muta = d.pausa || d.tempo.velocita !== 1 || !sbloccato;
    if (fileVoceOk(des.chiave)) {
      taci();
      if (muta) { if (!l.el.paused) l.el.pause(); return; }
      if (l.id !== des.chiave) {
        l.id = des.chiave;
        avviaSu(l, VOCI[des.chiave].file, { offset: pos > 500 ? pos / 1000 : 0 });
      } else if (l.el.paused) {
        try { l.el.currentTime = pos / 1000; } catch (e) { /* niente */ }
        const p = l.el.play();
        if (p && p.catch) p.catch(function () { /* niente */ });
      } else if (Math.abs(l.el.currentTime * 1000 - pos) > 1500) {
        try { l.el.currentTime = pos / 1000; } catch (e) { /* niente */ }
      }
    } else {
      if (l.file) ferma(l);
      if (muta) { taci(); return; }
      const s = sottotitolo();
      if (s) parla(s.chiave, s.indice, s.testo, d.volume);
    }
  }

  // La riga da mostrare adesso, o null.
  function sottotitolo() {
    if (!voceOra) return null;
    const st = inizi(voceOra.chiave, voceOra.dur);
    let i = 0;
    while (i + 1 < st.length && st[i + 1] <= voceOra.pos) i++;
    return { chiave: voceOra.chiave, indice: i, testo: VOCI[voceOra.chiave].righe[i].testo };
  }

  // --- Tick --------------------------------------------------------------------

  let ultimaFase = null, ultimoT = 0, ultimaPorta = null, duck = 1;

  function aggiorna() {
    const d = Stato.dati(), f = d.fase, t = Stato.trascorso('fase');

    // effetti a tempo: solo quando il tempo ci passa sopra (non dopo una ricarica)
    if (f !== ultimaFase) { ultimoT = ultimaFase === null ? t : -1; ultimaFase = f; }
    (CUE[f] || []).forEach(function (c) {
      const a = typeof c.a === 'function' ? c.a() : c.a;
      if (ultimoT < a && a <= t && t - a < 1500 && (!c.se || c.se(d))) effetto(c.id);
    });
    ultimoT = t;

    // Scatti della porta: seguono il timer della porta (che si sposta con ±5), non il tempo della fase.
    if (f === 'porta' || f === 'voto') {
      const p = Stato.DURATA_PORTA - Stato.rimanentePorta();
      const passo = C.tempi.scatto_min * 60000;
      if (ultimaPorta !== null && p > ultimaPorta) {
        for (let a = passo; a < Stato.DURATA_PORTA; a += passo) {
          if (ultimaPorta < a && a <= p && p - a < 1500) {
            effetto('porta_scatto');
            if (a === Stato.DURATA_PORTA / 2) effetto('rintocco');
            if (Stato.DURATA_PORTA - a === C.tempi.voto_min * 60000) {
              // tre rintocchi: si vota
              [0, 1800, 3600].forEach(function (ms) { setTimeout(function () { effetto('rintocco'); }, ms + 600); });
            }
          }
        }
      }
      ultimaPorta = p;
    } else {
      ultimaPorta = null;
    }

    const des = desiderato(d, f, Stato.sottofase());
    if (sbloccato) {
      canale('ambiente', des.ambiente, t, 2);
      canale('musica', des.musica, t, C.tempi.crossfade_musica_s);
    }
    voce(des.voce, t, d);

    // ducking: la musica scende mentre parla una voce
    const parlando = !!voceOra && !d.pausa;
    const verso = parlando ? AU.ducking : 1;
    duck += Math.max(-0.1, Math.min(0.1, verso - duck));

    const ora = Date.now();
    ['ambiente', 'musica', 'effetti', 'voce'].forEach(function (nome) {
      canali[nome].forEach(function (l) {
        if (l.rampa) {
          const k = Math.min(1, (ora - l.rampa.t0) / l.rampa.dur);
          l.vol = l.rampa.da + (l.rampa.a - l.rampa.da) * k;
          if (k >= 1) {
            l.rampa = null;
            if (l.fermaAZero) { l.el.pause(); l.file = null; l.id = null; l.fermaAZero = false; }
          }
        }
        let v = l.vol * l.volTraccia * d.volume;
        if (nome === 'ambiente' || nome === 'musica') v *= duck;
        v = Math.max(0, Math.min(1, v));
        if (l.gain) l.gain.gain.value = v; else l.el.volume = v;
      });
    });
  }

  // --- Prova dal pannello ------------------------------------------------------

  const prova = lettore();
  function elenco() {
    const voci = Object.keys(VOCI).map(function (k) { return { nome: VOCI[k].file, volume: 1 }; });
    const tracce = Object.keys(AU.tracce).map(function (k) { return { nome: AU.tracce[k].file, volume: AU.tracce[k].volume }; });
    return tracce.concat(voci).map(function (x) {
      const i = file[x.nome];
      return { file: x.nome, volume: x.volume, stato: i ? i.stato : 'da_controllare', durata: i ? i.durata : null };
    });
  }

  Stato.ascolta(function (tipo, dati) {
    if (tipo === 'evento' && dati.nome === 'manifestazione') effetto('sblocco');
  });

  // Le durate delle voci servono subito (decidono i passaggi di fase): si leggono all'avvio.
  Object.keys(VOCI).forEach(function (k) { sonda(VOCI[k].file); });

  window.Suoni = {
    sblocca: sblocca,
    aggiorna: aggiorna,
    durata: durata,
    sottotitolo: sottotitolo,
    sbloccato: function () { return sbloccato; },
    elenco: elenco,
    controllaTutti: function () { elenco().forEach(function (x) { sonda(x.file); }); },
    prova: function (nomeFile, volume) {
      avviaSu(prova, nomeFile, { volume: volume });
      prova.el.volume = Math.min(1, (volume || 1) * Stato.dati().volume);
    },
    fermaProva: function () { prova.el.pause(); prova.file = null; },
    voceSintetica: function () { const v = voceSintetica(); return v ? v.name : null; },
    // Cosa sta suonando, canale per canale (per le prove e per il pannello).
    diagnosi: function () {
      const r = {};
      Object.keys(canali).forEach(function (n) {
        r[n] = canali[n].filter(function (l) { return l.file; }).map(function (l) {
          return { file: l.file, inPausa: l.el.paused, volume: +(l.gain ? l.gain.gain.value : l.el.volume).toFixed(2), pos: +l.el.currentTime.toFixed(1) };
        });
      });
      r.duck = +duck.toFixed(2);
      return r;
    }
  };
})();
