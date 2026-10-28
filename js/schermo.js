/*
 * Schermo: disegna la fase corrente, i veli (pausa, velo nero), i sottotitoli delle voci,
 * il puntino di conferma, e l'avvio (audio, schermo intero, schermo sempre acceso).
 * Le fasi vere stanno nei moduli (rituale.js, delitto.js); le altre sono ancora segnaposto.
 * Ogni azione dei giocatori passa da Regia.comando().
 */
(function () {
  'use strict';

  const T = window.CONTENT_TESTI;
  const A = window.CONTENT_ARCANI;
  const P = window.CONTENT_PANNELLO;
  const C = window.CONTENT_CONFIG;

  const $ = function (id) { return document.getElementById(id); };
  let scena;

  function moduli() { return [window.Rituale, window.Delitto, window.Fascicolo, window.Porta, window.Finale]; }

  function el(tag, classe, testo) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (testo !== undefined && testo !== null) e.textContent = testo;
    return e;
  }

  function pulsante(testo, azione, classe) {
    const b = el('button', classe || null, testo);
    b.type = 'button';
    b.addEventListener('click', azione);
    return b;
  }

  // {arcano} = il colpevole, {tocchi}: si usa solo nel finale.
  function componi(testo) {
    const d = Stato.dati();
    return testo
      .replace(/\{arcano\}/g, d.colpevole ? A[d.colpevole].nome : '')
      .replace(/\{tocchi\}/g, d.tocchi !== null ? String(d.tocchi) : '');
  }

  function due(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(minuti) { return Math.floor(minuti / 60) + ':' + due(Math.floor(minuti % 60)); }
  function mmss(ms) {
    if (!isFinite(ms)) return '…';
    const t = Math.ceil(ms / 1000);
    return due(Math.floor(t / 60)) + ':' + due(t % 60);
  }

  // --- Avvio: audio, schermo intero, schermo acceso -------------------------------

  let lock = null, vogliamoLock = false;

  function schermoIntero(soloEntra) {
    const d = document, r = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) {
        if (!soloEntra) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
        return;
      }
      const chiedi = r.requestFullscreen || r.webkitRequestFullscreen;
      if (chiedi) {
        const p = chiedi.call(r);
        if (p && p.catch) p.catch(function () { /* rifiutato: pazienza */ });
      }
    } catch (e) { /* non supportato */ }
  }

  function tieniAcceso() {
    vogliamoLock = true;
    if (!('wakeLock' in navigator) || lock) return;
    navigator.wakeLock.request('screen').then(function (l) {
      lock = l;
      l.addEventListener('release', function () { lock = null; });
    }).catch(function () { /* non concesso */ });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && vogliamoLock) tieniAcceso();
  });

  // Da chiamare dentro un clic o un tasto (regola dei browser).
  function sblocca() {
    Suoni.sblocca();
    schermoIntero(true);
    tieniAcceso();
  }

  // Dopo una ricarica a metà serata serve un tocco (o un tasto) per riavere audio e schermo intero.
  // Quel primo tocco non fa nient'altro.
  function mostraRiprendi() {
    const r = $('riprendi');
    r.textContent = T.avvio.riprendi;
    r.hidden = false;
    function via(e) {
      if (r.hidden) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      r.hidden = true;
      sblocca();
      window.removeEventListener('keydown', via, true);
    }
    r.addEventListener('click', via);
    window.addEventListener('keydown', via, true);
  }

  // --- Fasi ------------------------------------------------------------------------

  function disegna() {
    const f = Stato.fase();
    scena.textContent = '';
    scena.dataset.fase = f;
    document.body.dataset.fase = f;
    if (!moduli().some(function (m) { return m.disegna(f, scena); })) {
      scena.appendChild(el('h1', 'nome-fase', P.nomi_fasi[f]));   // fase senza schermata: solo il nome
    }
    aggiorna();
  }

  // Chiamato a ogni tick.
  function aggiorna() {
    const d = Stato.dati(), f = d.fase;
    moduli().forEach(function (m) { m.aggiorna(f); });

    aggiornaSottotitolo();

    // Veli e indicatori
    $('pausa').hidden = !d.pausa;
    document.body.classList.toggle('in-pausa', d.pausa);
    if (d.pausa) {
      const orario = d.orologio.attivo ? hhmm(Stato.oraScena()) : mmss(Stato.rimanentePorta());
      if (pausaOra.textContent !== orario) pausaOra.textContent = orario;
    }
    $('velo').hidden = !d.velo;
    $('badge-prova').hidden = d.tempo.velocita === 1;
  }

  // Sottotitoli delle voci: cambiano con una breve dissolvenza.
  let rigaMostrata = null, timerRiga = null;
  function aggiornaSottotitolo() {
    const s = Suoni.sottotitolo();
    const chiave = s ? s.chiave + ':' + s.indice : null;
    if (chiave === rigaMostrata) return;
    rigaMostrata = chiave;
    const box = $('sottotitolo');
    box.classList.remove('visibile');
    clearTimeout(timerRiga);
    timerRiga = setTimeout(function () {
      box.textContent = s ? componi(s.testo) : '';
      if (s) box.classList.add('visibile');
    }, 350);
  }

  // --- Effetti di un momento e puntino --------------------------------------------

  let timerAvviso = null;
  function avviso(testo, ms) {
    const a = $('avviso');
    a.textContent = testo;
    a.hidden = false;
    clearTimeout(timerAvviso);
    timerAvviso = setTimeout(function () { a.hidden = true; }, ms);
  }

  function evento(nome, dati) {
    const tp = C.tempi;
    if (nome === 'manifestazione') {
      document.body.classList.add('manifestazione');
      setTimeout(function () { document.body.classList.remove('manifestazione'); }, tp.manifestazione_luce_s * 1000);
      avviso(T.atto1.manifestazione, (tp.manifestazione_luce_s + tp.manifestazione_testo_s) * 1000);
    }
    moduli().forEach(function (m) { if (m.evento) m.evento(nome, dati); });
  }

  let timerPuntino = null;
  function puntino(ok) {
    const p = $('puntino');
    p.className = ok ? 'ok' : 'no';
    p.hidden = false;
    clearTimeout(timerPuntino);
    timerPuntino = setTimeout(function () { p.hidden = true; }, 1000);
  }

  // --- Avvio ----------------------------------------------------------------------

  let pausaOra;
  function avvia(ripristinato) {
    scena = $('scena');
    $('badge-prova').textContent = P.prova.badge;
    const pausa = $('pausa');
    pausa.appendChild(el('p', 'voce', T.pausa.testo));
    pausaOra = pausa.appendChild(el('p', 'orologio-fermo'));

    Stato.ascolta(function (tipo, dati) {
      if (tipo === 'fase') disegna();
      else if (tipo === 'stato') aggiorna();
      else if (tipo === 'evento') evento(dati.nome, dati.dati);
    });
    Regia.ascolta(function (nome, valore, origine, esito) {
      if (origine === 'tastiera') puntino(esito.ok);
    });
    disegna();
    if (ripristinato && Stato.fase() !== 'avvio') mostraRiprendi();
  }

  window.Schermo = {
    avvia: avvia,
    aggiorna: aggiorna,
    schermoIntero: schermoIntero,
    sblocca: sblocca,
    componi: componi,
    el: el,
    pulsante: pulsante,
    hhmm: hhmm,
    mmss: mmss
  };
})();
