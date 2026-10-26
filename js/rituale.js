/*
 * Le prime fasi della serata: avvio, attesa, verifica dei nomi, sollievo, pesca.
 * Rituale.disegna(fase, scena) restituisce true se la fase è sua; Rituale.aggiorna(fase) a ogni tick.
 * Come sempre, ogni azione passa da Regia.comando().
 */
(function () {
  'use strict';

  const T = window.CONTENT_TESTI;
  const C = window.CONTENT_CONFIG;
  const P = window.CONTENT_PANNELLO;
  const COLORI = ['bianca', 'rossa', 'nera'];

  let candele = null;   // { bianca: elemento, ... } delle candele a schermo
  let righe = null;     // { elementi, passo } delle righe che compaiono una per volta

  function el(tag, classe, testo) { return Schermo.el(tag, classe, testo); }
  function azione(nome) { return function () { Regia.comando(nome, null, 'schermo'); }; }

  // Una candela: alone, fiamma, fumo, stoppino, cera. Accesa o no lo decide la classe "accesa".
  function candela(colore) {
    const c = el('div', 'candela candela--' + colore);
    ['alone', 'fiamma', 'fumo', 'stoppino', 'cera'].forEach(function (p) { c.appendChild(el('div', p)); });
    return c;
  }

  function filaDiCandele(classe) {
    const fila = el('div', 'candele' + (classe ? ' ' + classe : ''));
    candele = {};
    COLORI.forEach(function (colore) {
      candele[colore] = candela(colore);
      fila.appendChild(candele[colore]);
    });
    return fila;
  }

  // Righe che compaiono una per volta, ogni "passo" secondi dall'inizio della fase.
  function righeLente(testi, passoS) {
    const box = el('div', 'righe');
    righe = { elementi: testi.map(function (t) { return box.appendChild(el('p', 'riga voce', t)); }), passo: passoS * 1000 };
    return box;
  }

  // --- Fasi --------------------------------------------------------------------

  function avvio(scena) {
    const b = Schermo.pulsante(T.avvio.pulsante, function () {
      Schermo.sblocca();
      Regia.comando('inizia', null, 'schermo');
    }, 'rito rito--grande');
    scena.appendChild(b);
    scena.appendChild(Schermo.pulsante(P.link_avvio, function () { Pannello.chiediPin(); }, 'discreto'));
    setTimeout(function () { b.focus(); }, 0);
  }

  function attesa(scena) {
    scena.appendChild(el('h1', 'titolo', T.attesa.titolo));
    scena.appendChild(el('p', 'sottotitolo voce', T.attesa.sottotitolo));
    scena.appendChild(filaDiCandele());
    const azioni = el('nav', 'azioni');
    azioni.appendChild(Schermo.pulsante(T.attesa.pulsante_verifica, azione('apri_verifica'), 'rito'));
    azioni.appendChild(Schermo.pulsante(T.attesa.pulsante_fiamme, azione('fiamme_accese'), 'rito'));
    scena.appendChild(azioni);
  }

  function verifica(scena) {
    scena.appendChild(el('h2', 'domanda voce', T.verifica.titolo));
    const griglia = el('div', 'verifica');
    candele = {};
    COLORI.forEach(function (colore) {
      const col = el('div', 'colonna');
      candele[colore] = candela(colore);
      col.appendChild(candele[colore]);
      col.appendChild(campoIniziali(colore));
      griglia.appendChild(col);
    });
    scena.appendChild(griglia);
    const azioni = el('nav', 'azioni');
    azioni.appendChild(Schermo.pulsante(T.verifica.chiudi, azione('chiudi_verifica'), 'rito'));
    azioni.appendChild(Schermo.pulsante(T.attesa.pulsante_fiamme, azione('fiamme_accese'), 'rito'));
    scena.appendChild(azioni);
    const primo = scena.querySelector('input:not([disabled])');
    if (primo && !('ontouchstart' in window)) setTimeout(function () { primo.focus(); }, 0);
  }

  // Campo delle iniziali di una candela. Controlla da solo quando le lettere sono tante quante servono,
  // oppure con Invio.
  function campoIniziali(colore) {
    const attese = C.candele[colore];
    const quante = attese.join('').length;
    const box = el('label', 'iniziali');
    box.appendChild(el('span', 'etichetta', T.verifica.etichette[colore]));
    const campo = el('input');
    campo.autocomplete = 'off';
    campo.spellcheck = false;
    campo.setAttribute('autocapitalize', 'characters');
    campo.setAttribute('autocorrect', 'off');
    const esito = el('span', 'esito voce');
    let timer = null;

    function giusto() {
      campo.value = attese.join(' ');
      campo.disabled = true;
      esito.textContent = T.verifica.giusto;
      esito.className = 'esito voce giusto';
    }

    function prova() {
      const r = Regia.comando('verifica', { candela: colore, testo: campo.value }, 'schermo');
      if (!r.ok) return;
      clearTimeout(timer);
      if (r.giusto) { giusto(); return; }
      esito.textContent = T.verifica.sbagliato;
      esito.className = 'esito voce sbagliato';
      campo.classList.remove('trema');
      void campo.offsetWidth;   // per far ripartire l'animazione
      campo.classList.add('trema');
      campo.select();
      timer = setTimeout(function () { esito.textContent = ''; esito.className = 'esito voce'; }, 5000);
    }

    campo.addEventListener('input', function () {
      if (campo.value.toUpperCase().replace(/[^A-Z]/g, '').length === quante) prova();
    });
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') prova(); });

    if (Stato.dati().fiamme[colore]) giusto();
    box.appendChild(campo);
    box.appendChild(esito);
    return box;
  }

  function sollievo(scena) {
    scena.appendChild(filaDiCandele('tutte-accese'));
    scena.appendChild(righeLente(T.sollievo.righe, C.tempi.riga_sollievo_s));
  }

  function pesca(scena) {
    scena.appendChild(filaDiCandele('tutte-accese fredde'));
    scena.appendChild(righeLente(T.pesca.righe, C.tempi.riga_pesca_s));
  }

  const FASI = { avvio: avvio, attesa: attesa, verifica: verifica, sollievo: sollievo, pesca: pesca };

  function disegna(fase, scena) {
    candele = null;
    righe = null;
    if (!FASI[fase]) return false;
    FASI[fase](scena);
    aggiorna(fase);
    return true;
  }

  function aggiorna(fase) {
    if (candele && (fase === 'attesa' || fase === 'verifica')) {
      const fiamme = Stato.dati().fiamme;
      COLORI.forEach(function (colore) {
        const c = candele[colore];
        const accesa = !!fiamme[colore];
        if (accesa === c.classList.contains('accesa')) return;
        c.classList.toggle('accesa', accesa);
        // Si accende con un guizzo solo se succede adesso, non quando si ridisegna la fase.
        if (accesa && c.dataset.vista) c.classList.add('si-accende');
      });
      COLORI.forEach(function (colore) { candele[colore].dataset.vista = '1'; });
    }
    if (righe) {
      const t = Stato.trascorso('fase');
      righe.elementi.forEach(function (r, i) {
        if (t >= i * righe.passo && !r.classList.contains('visibile')) r.classList.add('visibile');
      });
    }
  }

  window.Rituale = { disegna: disegna, aggiorna: aggiorna };
})();
