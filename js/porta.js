/*
 * Mezzanotte, risveglio, la porta e il voto.
 * La porta è un arco gotico in HTML/CSS: due ante che si aprono di 1/6 a ogni scatto di 10 minuti,
 * con la luce fredda dietro. Tutto si calcola dal timer della porta (Stato), mai da contatori.
 */
(function () {
  'use strict';

  const T = window.CONTENT_TESTI;
  const C = window.CONTENT_CONFIG;
  const MIN = 60000;

  let rif = null;

  function el(tag, classe, testo) { return Schermo.el(tag, classe, testo); }

  // Arco a sesto acuto (equilatero) come poligono per clip-path, in percentuali di larghezza/altezza.
  function ogiva(larghezza, altezza) {
    const freccia = 0.866 * larghezza;          // altezza dell'arco
    const imposta = freccia / altezza * 100;     // dove l'arco poggia sui piedritti (% dall'alto)
    const punti = ['0% 100%', '0% ' + imposta + '%'];
    for (let k = 1; k <= 12; k++) {              // arco sinistro: da 180° a 120°
      const a = Math.PI - k * (Math.PI / 3) / 12;
      punti.push((100 + 100 * Math.cos(a)).toFixed(2) + '% ' + (imposta - Math.sin(a) * freccia / 0.866 / altezza * 100).toFixed(2) + '%');
    }
    for (let k = 11; k >= 0; k--) {              // arco destro, simmetrico
      const a = Math.PI - k * (Math.PI / 3) / 12;
      punti.push((-100 * Math.cos(a)).toFixed(2) + '% ' + (imposta - Math.sin(a) * freccia / 0.866 / altezza * 100).toFixed(2) + '%');
    }
    punti.push('100% 100%');
    return 'polygon(' + punti.join(', ') + ')';
  }
  const SAGOMA = ogiva(30, 48);

  // La porta: cornice, luce, due ante. "--apertura" da 0 a 1.
  function porta() {
    const p = el('div', 'porta');
    p.appendChild(el('div', 'bagliore'));
    const cornice = p.appendChild(el('div', 'cornice'));
    const arco = p.appendChild(el('div', 'arco'));
    cornice.style.clipPath = SAGOMA;
    cornice.style.webkitClipPath = SAGOMA;
    arco.style.clipPath = SAGOMA;
    arco.style.webkitClipPath = SAGOMA;
    arco.appendChild(el('div', 'luce'));
    arco.appendChild(el('div', 'figura'));
    arco.appendChild(el('div', 'anta sinistra'));
    arco.appendChild(el('div', 'anta destra'));
    return p;
  }

  function apertura() {
    const trascorso = Stato.DURATA_PORTA - Stato.rimanentePorta();
    return Math.min(6, Math.floor(trascorso / (C.tempi.scatto_min * MIN))) / 6;
  }

  function due(n) { return (n < 10 ? '0' : '') + n; }
  function timer(ms) {
    if (ms <= C.tempi.battito_s * 1000) {
      const d = Math.max(0, Math.ceil(ms / 100));
      return due(Math.floor(d / 600)) + ':' + due(Math.floor(d / 10) % 60) + '.' + (d % 10);
    }
    return Schermo.mmss(ms);
  }

  // --- Mezzanotte ---------------------------------------------------------------

  function mezzanotte(scena) {
    const box = el('div', 'mezzanotte');
    box.appendChild(el('h1', 'titolo', T.mezzanotte.titolo));
    const carte = el('div', 'carte-mezzanotte');
    Stato.carteInGioco().forEach(function (id, i) {
      const c = el('div', 'carta-gira');
      c.style.setProperty('--i', i);
      c.appendChild(el('div', 'retro'));
      c.appendChild(Fascicolo.carta(id, 'fronte'));
      carte.appendChild(c);
    });
    box.appendChild(carte);
    const testo = el('p', 'testo-mezzanotte voce');
    box.appendChild(testo);
    scena.appendChild(box);
    const passato = Stato.trascorso('fase') / 1000;
    box.style.setProperty('--trascorso', passato.toFixed(2));
    rif = { box: box, testo: testo, passo: null };
  }

  function aggiornaMezzanotte() {
    const d = Stato.dati(), passo = Stato.sottofase();
    if (passo === rif.passo) return;
    rif.passo = passo;
    rif.box.dataset.passo = passo;
    rif.testo.classList.remove('visibile');
    setTimeout(function () {
      if (!rif || !rif.testo) return;
      rif.testo.textContent = passo === 'legge' ? T.mezzanotte.legge : passo === 'tocchi' ? T.tocchi[d.tocchi] : T.mezzanotte.testo;
      rif.testo.classList.add('visibile');
    }, 500);
  }

  // --- Risveglio: la voce 2 e la porta che affiora --------------------------------

  function risveglio(scena) {
    const box = el('div', 'risveglio');
    box.appendChild(porta());
    scena.appendChild(box);
    box.style.setProperty('--trascorso', (Stato.trascorso('fase') / 1000).toFixed(2));
    rif = { box: box };
  }

  // --- La porta e il voto ----------------------------------------------------------

  function scenaPorta(scena, voto) {
    const box = el('div', 'porta-scena' + (voto ? ' voto' : ''));
    const alto = el('div', 'alto-porta');
    const tempo = alto.appendChild(el('div', 'timer-porta'));
    const round = alto.appendChild(el('div', 'round'));
    box.appendChild(alto);
    const p = porta();
    box.appendChild(p);
    const riga = el('p', 'riga-porta voce');
    box.appendChild(riga);
    if (voto) {
      box.appendChild(Schermo.pulsante(T.porta.pulsante_voto, function () { Regia.comando('nominato', null, 'schermo'); }, 'rito rito--grande pulsante-voto'));
    }

    // Cassetto laterale con fascicolo e Grimorio
    const cassetto = el('aside', 'cassetto');
    const apri = Schermo.pulsante(T.porta.cassetto, function () {
      if (!cassetto.firstChild) {
        cassetto.appendChild(Schermo.pulsante(T.porta.chiudi_cassetto, function () { box.classList.remove('cassetto-aperto'); }, 'rito chiudi-cassetto'));
        Fascicolo.crea(cassetto);
      }
      box.classList.add('cassetto-aperto');
    }, 'apri-cassetto');
    box.appendChild(apri);
    box.appendChild(cassetto);

    scena.appendChild(box);
    rif = { box: box, porta: p, tempo: tempo, round: round, riga: riga, testoRiga: null, voto: voto };
  }

  // La riga sotto la porta: buste, round iniziale, o l'annuncio dello scatto (per 20 s).
  function rigaPorta(trascorso, passo) {
    if (passo === 'buste') return T.audio2.dopo;
    if (passo === 'round_iniziale') return T.porta.round_iniziale;
    if (rif.voto) return T.porta.scatti[String(C.tempi.voto_min)];
    for (let k = 1; k * C.tempi.scatto_min < C.tempi.porta_min; k++) {
      const dal = trascorso - k * C.tempi.scatto_min * MIN;
      if (dal >= 0 && dal < C.tempi.riga_scatto_s * 1000) return T.porta.scatti[String(C.tempi.porta_min - k * C.tempi.scatto_min)] || '';
    }
    return '';
  }

  function aggiornaPorta() {
    const rimane = Stato.rimanentePorta();
    const trascorso = Stato.DURATA_PORTA - rimane;
    const t = timer(rimane);
    if (rif.tempo.textContent !== t) rif.tempo.textContent = t;
    const r = Stato.round();
    if (rif.round.textContent !== r) rif.round.textContent = r;
    rif.porta.style.setProperty('--apertura', apertura().toFixed(3));
    rif.box.classList.toggle('ultimo-minuto', rimane <= C.tempi.battito_s * 1000);
    const meta = Stato.DURATA_PORTA / 2;
    rif.box.classList.toggle('scuro', trascorso >= meta && trascorso < meta + C.tempi.scuro_s * 1000);

    const testo = rigaPorta(trascorso, Stato.sottofase());
    if (testo !== rif.testoRiga) {
      rif.testoRiga = testo;
      const riga = rif.riga;
      riga.classList.remove('visibile');
      setTimeout(function () {
        riga.textContent = testo;
        if (testo) riga.classList.add('visibile');
      }, 700);
    }
  }

  // --- Moduli ------------------------------------------------------------------------

  function disegna(fase, scena) {
    rif = null;
    if (fase === 'mezzanotte') mezzanotte(scena);
    else if (fase === 'risveglio') risveglio(scena);
    else if (fase === 'porta') scenaPorta(scena, false);
    else if (fase === 'voto') scenaPorta(scena, true);
    else return false;
    aggiorna(fase);
    return true;
  }

  function aggiorna(fase) {
    if (!rif) return;
    if (fase === 'mezzanotte') aggiornaMezzanotte();
    else if (fase === 'porta' || fase === 'voto') aggiornaPorta();
  }

  window.Porta = { disegna: disegna, aggiorna: aggiorna, porta: porta, apertura: apertura };
})();
