/*
 * Il finale: il sigillo (il master tocca la carta girata), la porta sigillata o attraversata,
 * i titoli con la confessione facoltativa. Il nome del colpevole entra nel DOM solo qui.
 */
(function () {
  'use strict';

  const T = window.CONTENT_TESTI;
  const A = window.CONTENT_ARCANI;
  const C = window.CONTENT_CONFIG;

  let rif = null;

  function el(tag, classe, testo) { return Schermo.el(tag, classe, testo); }
  function s(sec) { return sec * 1000; }

  // --- Sigillo: tocco per scegliere, secondo tocco per confermare -------------------

  function sigillo(scena) {
    const box = el('div', 'sigillo');
    box.appendChild(el('h2', 'domanda voce', T.sigillo.titolo));
    const griglia = el('div', 'griglia-sigillo');
    // due file uguali: 4+4 con 8 giocatori, 6+6 con 12
    griglia.style.setProperty('--colonne', Math.ceil(Stato.carteInGioco().length / 2));
    const conferma = el('p', 'conferma-sigillo voce');
    let scelto = null, timer = null;
    Stato.carteInGioco().forEach(function (id) {
      const b = Schermo.pulsante('', function () {
        if (scelto === id) { Regia.comando('sigillo', id, 'schermo'); return; }
        scelto = id;
        griglia.querySelectorAll('button').forEach(function (x) { x.classList.toggle('scelta', x === b); });
        conferma.textContent = T.sigillo.conferma;
        clearTimeout(timer);
        timer = setTimeout(function () {
          scelto = null;
          b.classList.remove('scelta');
          conferma.textContent = '';
        }, 6000);
      }, 'carta-sigillo');
      b.appendChild(Fascicolo.carta(id, 'faccia'));
      b.appendChild(el('span', 'nome-carta', A[id].nome));
      griglia.appendChild(b);
    });
    box.appendChild(griglia);
    box.appendChild(conferma);
    scena.appendChild(box);
  }

  // --- La porta si chiude o si spalanca ----------------------------------------------

  function esito(scena, come) {
    const box = el('div', 'finale-porta ' + come);
    const p = Porta.porta();
    p.style.setProperty('--apertura', Porta.apertura().toFixed(3));
    box.appendChild(p);
    box.style.setProperty('--trascorso', (Stato.trascorso('fase') / 1000).toFixed(2));
    scena.appendChild(box);
  }

  // --- Titoli -----------------------------------------------------------------------

  function titoli(scena) {
    const d = Stato.dati();
    const box = el('div', 'titoli');
    const rivelato = el('div', 'rivelato');
    rivelato.appendChild(Fascicolo.carta(d.colpevole, 'carta-titoli'));
    rivelato.appendChild(el('p', 'rivelazione', Schermo.componi(T.titoli.rivelazione)));
    rivelato.appendChild(el('p', 'titolo-confessione voce', T.titoli.confessione));
    box.appendChild(rivelato);

    const crediti = el('div', 'crediti');
    const righe = [];
    if (d.sospetti) {
      const n = d.sospetti.scelti.map(function (id) { return A[id].nome; });
      righe.push(el('p', 'riga-titoli voce', T.titoli.sospetti.replace('{a}', n[0]).replace('{b}', n[1]).replace('{c}', n[2])));
    }
    if (d.tocchi !== null) righe.push(el('p', 'riga-titoli voce', T.titoli.tocchi[d.tocchi]));
    const morte = el('div', 'riga-titoli morte-si-rialza');
    morte.appendChild(Fascicolo.carta('morte', 'carta-morte'));
    righe.push(morte);
    righe.push(el('p', 'riga-titoli fine', T.titoli.fine));
    righe.forEach(function (r) { crediti.appendChild(r); });
    box.appendChild(crediti);
    scena.appendChild(box);
    rif = { box: box, righe: righe, passo: null };
  }

  // Da quando partono i crediti (ms della fase), o null se non ancora.
  function inizioCrediti(d) {
    if (d.confessione === 'saltata') return s(C.tempi.attesa_confessione_s);
    if (d.confessione === 'fatta') return d.confessioneAl + Stato.durataVoce('confessione');
    return null;
  }

  function aggiornaTitoli() {
    const d = Stato.dati();
    const passo = d.confessione === 'attesa' ? 'rivelazione' : d.confessione === 'in_corso' ? 'confessione' : 'crediti';
    if (passo !== rif.passo) { rif.passo = passo; rif.box.dataset.passo = passo; }
    const da = inizioCrediti(d);
    if (da === null) return;
    const t = Stato.trascorso('fase') - da;
    rif.righe.forEach(function (r, i) {
      if (t >= (i + 0.5) * s(C.tempi.riga_titoli_s)) r.classList.add('visibile');
    });
  }

  function disegna(fase, scena) {
    rif = null;
    if (fase === 'sigillo') sigillo(scena);
    else if (fase === 'sigillata' || fase === 'attraversata') esito(scena, fase);
    else if (fase === 'titoli') titoli(scena);
    else return false;
    aggiorna(fase);
    return true;
  }

  function aggiorna(fase) {
    if (rif && fase === 'titoli') aggiornaTitoli();
  }

  window.Finale = { disegna: disegna, aggiorna: aggiorna };
})();
