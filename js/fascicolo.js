/*
 * Atto 1 e fascicolo del 1986: orologio di scena in alto, documenti sfogliabili (giornale, verbale,
 * Grimorio) con le linguette, e il riquadro degli obiettivi sempre visibile.
 * Fascicolo.crea(contenitore) costruisce il visore dei documenti: lo riusa il cassetto della porta.
 */
(function () {
  'use strict';

  const T = window.CONTENT_TESTI;
  const F = window.CONTENT_FASCICOLO;
  const A = window.CONTENT_ARCANI;

  let rif = null;
  const visori = [];   // visori dei documenti presenti a schermo (per le frecce su/giù)

  function el(tag, classe, testo) { return Schermo.el(tag, classe, testo); }

  function documenti() {
    return F.parti.reduce(function (tutti, p) { return tutti.concat(p.documenti); }, []);
  }

  // --- I documenti ---------------------------------------------------------------

  function giornale(d) {
    const a = el('article', 'doc giornale');
    a.appendChild(el('header', 'testata', d.testata));
    a.appendChild(el('div', 'data-giornale', d.data));
    a.appendChild(el('h2', 'titolone', d.titolo));
    const colonne = el('div', 'colonne');
    d.paragrafi.forEach(function (p) { colonne.appendChild(el('p', null, p)); });
    a.appendChild(colonne);
    if (d.riquadro) {
      const r = el('aside', 'riquadro');
      r.appendChild(el('h3', null, d.riquadro.titolo));
      r.appendChild(el('p', null, d.riquadro.testo));
      a.appendChild(r);
    }
    return a;
  }

  function verbale(d) {
    const a = el('article', 'doc verbale');
    a.appendChild(el('header', 'intestazione', d.intestazione));
    d.voci.forEach(function (v) {
      const riga = el('div', 'dichiarazione');
      riga.appendChild(el('span', 'chi', v.chi));
      riga.appendChild(el('span', 'detto', v.testo));
      a.appendChild(riga);
    });
    if (d.timbro) a.appendChild(el('div', 'timbro', d.timbro));
    return a;
  }

  // Carta: l'immagine se c'è, altrimenti disegnata in CSS con numero e nome.
  function carta(id, classe) {
    const f = el('figure', classe || 'carta-grimorio');
    const img = el('img');
    img.alt = A[id].nome;
    img.addEventListener('error', function () {
      f.textContent = '';
      f.classList.add('disegnata');
      f.appendChild(el('span', 'numero', A[id].numero));
      f.appendChild(el('span', 'nome', A[id].nome));
    });
    img.src = 'assets/carte/' + id + '.jpg';
    f.appendChild(img);
    return f;
  }

  function grimorio(d) {
    const a = el('article', 'doc grimorio');
    a.appendChild(el('p', 'introduzione', d.introduzione));
    if (d.fazioni) a.appendChild(el('p', 'fazioni', d.fazioni));
    a.appendChild(el('p', 'semi', d.semi));
    const carte = Stato.carteInGioco().concat(['morte']);
    carte.forEach(function (id) {
      const ar = A[id];
      const pag = el('section', 'pagina-arcano');
      pag.appendChild(carta(id));
      const testo = el('div', 'testo-arcano');
      testo.appendChild(el('h3', null, ar.numero + ' · ' + ar.nome));
      const elemento = testo.appendChild(el('p', 'elemento', ar.elemento));
      // Solo i portanti hanno una fiamma (la casa del mazzo): bianca, rossa o nera
      const fiamma = ar.fiamma || ar.fazione;
      if (fiamma && d.fiamma) {
        elemento.appendChild(document.createTextNode(' · '));
        const f = elemento.appendChild(el('span', 'fiamma-arcano fiamma--' + fiamma, d.fiamma.replace('{fiamma}', fiamma)));
        f.setAttribute('data-fiamma', fiamma);
      }
      const ul = el('ul', 'simboli');
      ar.simboli.forEach(function (s) { ul.appendChild(el('li', null, s)); });
      testo.appendChild(ul);
      pag.appendChild(testo);
      a.appendChild(pag);
    });
    return a;
  }

  const DISEGNA = { giornale: giornale, verbale: verbale, grimorio: grimorio };

  // --- Visore: linguette + un documento per volta ------------------------------------

  function crea(contenitore) {
    const box = el('section', 'fascicolo');
    const linguette = el('nav', 'linguette');
    const foglio = el('div', 'foglio');
    box.appendChild(linguette);
    box.appendChild(foglio);
    contenitore.appendChild(box);
    const docs = documenti();
    const visore = { foglio: foglio, box: box };

    function apri(i) {
      foglio.textContent = '';
      foglio.scrollTop = 0;
      foglio.appendChild(DISEGNA[docs[i].tipo](docs[i]));
      linguette.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('aperta', j === i); });
      const visti = (Stato.dati().documentiVisti || []).slice();
      if (visti.indexOf(docs[i].id) < 0) {
        visti.push(docs[i].id);
        Stato.imposta({ documentiVisti: visti });
      }
      linguette.querySelectorAll('button')[i].classList.remove('nuova');
    }

    docs.forEach(function (d, i) {
      const b = Schermo.pulsante(d.linguetta, function () { apri(i); }, 'linguetta');
      if ((Stato.dati().documentiVisti || []).indexOf(d.id) < 0) b.classList.add('nuova');
      linguette.appendChild(b);
    });
    apri(0);
    visori.push(visore);
    return visore;
  }

  // Frecce su/giù: scorrono il documento visibile.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if ((window.Pannello && Pannello.aperto()) || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    const v = visori.filter(function (x) { return x.box.isConnected && x.box.offsetParent; })[0];
    if (!v) return;
    e.preventDefault();
    v.foglio.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * v.foglio.clientHeight * 0.6, behavior: 'smooth' });
  });

  // --- Atto 1 ----------------------------------------------------------------------

  function atto1(scena) {
    visori.length = 0;
    const box = el('div', 'atto1');
    const orologio = el('div', 'orologio-atto1');
    box.appendChild(orologio);

    const tavolo = el('div', 'tavolo');
    crea(tavolo);
    const ob = el('aside', 'obiettivi');
    ob.appendChild(el('h2', null, T.atto1.obiettivi_titolo));
    const ol = el('ol');
    T.atto1.obiettivi.forEach(function (o) { ol.appendChild(el('li', null, o)); });
    ob.appendChild(ol);
    ob.appendChild(el('p', 'gettoni', T.atto1.gettoni));
    tavolo.appendChild(ob);
    box.appendChild(tavolo);

    // Le due frasi dopo il codice, grandi, sopra a tutto
    const intro = el('div', 'intro-atto1');
    const giusta = intro.appendChild(el('p', 'voce', T.chiave.giusta));
    const piatti = intro.appendChild(el('p', 'voce piatti', F.dopo_codice));
    box.appendChild(intro);

    scena.appendChild(box);
    rif = { box: box, orologio: orologio, giusta: giusta, piatti: piatti, passo: null };
  }

  function disegna(fase, scena) {
    rif = null;
    if (fase !== 'atto1') return false;
    atto1(scena);
    aggiorna(fase);
    return true;
  }

  function aggiorna(fase) {
    if (!rif || fase !== 'atto1') return;
    const passo = Stato.sottofase();
    if (passo !== rif.passo) {
      rif.passo = passo;
      rif.box.dataset.passo = passo;
    }
    const ora = Schermo.hhmm(Stato.oraScena());
    if (rif.orologio.textContent !== ora) rif.orologio.textContent = ora;
  }

  window.Fascicolo = { disegna: disegna, aggiorna: aggiorna, crea: crea, carta: carta };
})();
