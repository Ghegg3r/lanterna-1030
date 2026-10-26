/*
 * La fase morte: nero, voce 1 con la possessione (carte coperte che si sollevano, ombre che
 * scivolano giù fuori dallo schermo), poi l'orologio di scena e il campo del codice.
 * Le animazioni sono agganciate al tempo della fase: dopo una ricarica riprendono dal punto giusto.
 */
(function () {
  'use strict';

  const T = window.CONTENT_TESTI;
  const C = window.CONTENT_CONFIG;

  let rif = null;

  function el(tag, classe, testo) { return Schermo.el(tag, classe, testo); }

  function morte(scena) {
    const box = el('div', 'morte');
    const carte = el('div', 'possessione');
    const n = Stato.carteInGioco().length;
    for (let i = 0; i < n; i++) {
      const c = el('div', 'carta-coperta');
      c.style.setProperty('--i', i);
      c.style.setProperty('--n', n);
      c.style.setProperty('--caso', ((i * 37) % 11) / 10);   // un po' di disordine, sempre lo stesso
      c.appendChild(el('div', 'ombra'));
      carte.appendChild(c);
    }
    box.appendChild(carte);

    const orologio = el('div', 'orologio-scena');
    box.appendChild(orologio);

    const chiave = el('div', 'chiave');
    chiave.appendChild(el('p', 'voce', T.chiave.testo));
    const campo = el('input', 'campo-codice');
    campo.inputMode = 'numeric';
    campo.maxLength = 4;
    campo.autocomplete = 'off';
    campo.placeholder = T.chiave.segnaposto;
    campo.setAttribute('aria-label', T.chiave.testo);
    campo.addEventListener('input', function () {
      campo.value = campo.value.replace(/\D/g, '').slice(0, 4);
      if (campo.value.length === 4) Regia.comando('codice', campo.value, 'schermo');
    });
    chiave.appendChild(campo);
    const esito = el('p', 'esito voce');
    chiave.appendChild(esito);
    box.appendChild(chiave);

    scena.appendChild(box);
    rif = { box: box, orologio: orologio, campo: campo, esito: esito, passo: null };
  }

  function disegna(fase, scena) {
    rif = null;
    if (fase !== 'morte') return false;
    morte(scena);
    aggiorna(fase);
    return true;
  }

  function aggiorna(fase) {
    if (!rif || fase !== 'morte') return;
    const passo = Stato.sottofase();
    if (passo !== rif.passo) {
      rif.passo = passo;
      rif.box.dataset.passo = passo;
      // secondi già passati della possessione: le animazioni partono da lì
      const dallaVoce = (Stato.trascorso('fase') - C.tempi.nero_iniziale_s * 1000) / 1000;
      rif.box.style.setProperty('--trascorso', Math.max(0, dallaVoce).toFixed(2));
      if (passo === 'codice' && !('ontouchstart' in window)) setTimeout(function () { rif && rif.campo.focus(); }, 50);
    }
    const ora = Schermo.hhmm(Stato.oraScena());
    if (rif.orologio.textContent !== ora) rif.orologio.textContent = ora;
  }

  let timerEsito = null;
  function evento(nome) {
    if (nome !== 'codice_sbagliato' || !rif) return;
    if (navigator.vibrate) { try { navigator.vibrate([90, 60, 90]); } catch (e) { /* niente */ } }
    rif.campo.classList.remove('trema');
    void rif.campo.offsetWidth;
    rif.campo.classList.add('trema');
    rif.esito.textContent = T.chiave.sbagliata;
    clearTimeout(timerEsito);
    const esito = rif.esito;
    rif.campo.value = '';
    timerEsito = setTimeout(function () { esito.textContent = ''; }, 3000);
  }

  window.Delitto = { disegna: disegna, aggiorna: aggiorna, evento: evento };
})();
