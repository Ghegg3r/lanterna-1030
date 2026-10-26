/*
 * Console di regia sul telefono del master (regia.html#<codice>).
 * Manda gli stessi comandi del telecomando e del pannello; riceve lo stato dallo schermo
 * solo quando cambia, e intanto calcola orologio e timer da solo, a partire dai timestamp.
 * Non mostra mai il colpevole: lo schermo non lo manda.
 */
(function () {
  'use strict';

  const K = window.CONTENT_CONSOLE;
  const P = window.CONTENT_PANNELLO;
  const A = window.CONTENT_ARCANI;
  const CHIAVE = 'tm_v1_console_codice';
  const FASI = Object.keys(P.nomi_fasi);

  let codice = null, ponte = null, inRete = false;
  let stato = null, ricevutoAlle = 0, esitoAtteso = null;

  function $(id) { return document.getElementById(id); }
  function el(tag, classe, testo) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (testo !== undefined && testo !== null) e.textContent = testo;
    return e;
  }
  function leggi() { try { return localStorage.getItem(CHIAVE); } catch (e) { return null; } }
  function scrivi(v) { try { localStorage.setItem(CHIAVE, v); } catch (e) { /* bloccato */ } }
  function due(n) { return (n < 10 ? '0' : '') + n; }
  function ora(t) { return new Date(t).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

  // Pulsante che vuole un secondo tocco entro 3 secondi.
  function doppio(b, azione) {
    let armato = null;
    const testo = b.textContent;
    b.addEventListener('click', function () {
      if (armato) { clearTimeout(armato); armato = null; b.textContent = testo; b.classList.remove('armato'); azione(); return; }
      b.textContent = K.conferma;
      b.classList.add('armato');
      armato = setTimeout(function () { armato = null; b.textContent = testo; b.classList.remove('armato'); }, 3000);
    });
    return b;
  }

  function manda(nome, valore) {
    if (!ponte) return;
    esitoAtteso = nome;
    $('esito').textContent = '…';
    $('esito').className = 'esito';
    ponte.invia({ tipo: 'comando', nome: nome, valore: valore === undefined ? null : valore }).catch(function (e) {
      $('esito').textContent = e.message;
      $('esito').className = 'esito ko';
    });
  }

  // --- Disegno ---------------------------------------------------------------------

  function tempo() {
    if (!stato) return '';
    const passato = Date.now() - stato.t;
    if (stato.orologio) {
      const m = stato.orologio.min + (stato.orologio.corre ? passato * stato.velocita / 60000 : 0);
      return Math.floor(m / 60) + ':' + due(Math.floor(m % 60));
    }
    if (stato.porta) {
      const ms = Math.max(0, stato.porta.ms - (stato.porta.corre ? passato * stato.velocita : 0));
      const s = Math.ceil(ms / 1000);
      return due(Math.floor(s / 60)) + ':' + due(s % 60);
    }
    return '';
  }

  function disegnaTempo() {
    const t = tempo();
    if ($('tempo').textContent !== t) $('tempo').textContent = t;
    $('ultimo').textContent = ricevutoAlle ? K.ultimo_segnale.replace('{ora}', ora(ricevutoAlle)) : '';
  }

  function disegna() {
    $('rete').hidden = inRete;
    $('rete').textContent = K.rete_assente;

    let avviso = '';
    if (inRete && !stato) avviso = K.nessun_segnale;
    else if (stato && !stato.audio) avviso = K.audio_bloccato;
    $('avviso').textContent = avviso;
    $('avviso').hidden = !avviso;
    disegnaTempo();
    if (!stato) return;

    $('fase').textContent = P.nomi_fasi[stato.fase] || stato.fase;
    const segnali = [];
    if (stato.pausa) segnali.push(K.in_pausa);
    if (stato.velo) segnali.push(K.velo_acceso);
    if (stato.velocita !== 1) segnali.push(K.prova);
    $('segnali').textContent = segnali.join(' · ');

    $('avanti').textContent = K.avanti[stato.avanti || 'niente'];
    $('pausa').textContent = stato.pausa ? K.riprendi : K.pausa;
    $('velo').textContent = stato.velo ? K.togli_velo : K.velo;
    $('pausa').classList.toggle('attivo', stato.pausa);
    $('velo').classList.toggle('attivo', stato.velo);

    // Pannelli che servono solo in certe fasi
    $('sezione-tocchi').hidden = stato.fase !== 'mezzanotte';
    $('tocchi').querySelectorAll('button').forEach(function (b, n) { b.classList.toggle('attivo', stato.tocchi === n); });
    $('sezione-sigillo').hidden = stato.fase !== 'sigillo';
    const carte = $('carte');
    if (carte.dataset.carte !== stato.carte.join()) {
      carte.dataset.carte = stato.carte.join();
      carte.textContent = '';
      stato.carte.forEach(function (id) {
        carte.appendChild(doppio(el('button', null, A[id].nome), function () { manda('sigillo', id); }));
      });
    }
    $('sezione-confessione').hidden = !(stato.fase === 'titoli' && stato.confessione === 'attesa');
    $('fasi').querySelectorAll('button').forEach(function (b) { b.classList.toggle('attivo', b.dataset.fase === stato.fase); });
    if (document.activeElement !== $('volume')) $('volume').value = stato.volume;
  }

  function riceviStato(m) {
    // Due messaggi ravvicinati possono arrivare in ordine inverso: vale il più recente.
    if (stato && m.stato.t < stato.t) return;
    stato = m.stato;
    ricevutoAlle = Date.now();
    if (m.esito && m.esito.nome === esitoAtteso) {
      $('esito').textContent = m.esito.ok ? K.fatto : (P.esiti[m.esito.motivo] || m.esito.motivo);
      $('esito').className = 'esito' + (m.esito.ok ? '' : ' ko');
      esitoAtteso = null;
    }
    disegna();
  }

  // --- Costruzione della pagina --------------------------------------------------

  function costruisci() {
    $('verifica').textContent = K.verifica;
    $('verifica').onclick = function () { if (ponte) ponte.invia({ tipo: 'ciao' }).catch(function () { /* niente */ }); };
    // Scritte di partenza, finché non arriva lo stato dello schermo
    $('avanti').textContent = K.avanti.niente.split(':')[0];
    $('pausa').textContent = K.pausa;
    $('velo').textContent = K.velo;
    $('avanti').onclick = function () { manda('avanti'); };
    $('pausa').onclick = function () { manda('pausa'); };
    $('velo').onclick = function () { manda('velo'); };
    $('titolo-tocchi').textContent = K.tocchi;
    for (let n = 0; n <= 3; n++) {
      const b = $('tocchi').appendChild(el('button', null, String(n)));
      b.onclick = function () { manda('tocchi', n); };
    }
    $('titolo-sigillo').textContent = K.sigillo;
    $('confessione').textContent = K.confessione;
    $('confessione').onclick = function () { manda('confessione'); };
    $('titolo-altri').textContent = K.altri;
    $('titolo-orologio').textContent = K.orologio;
    $('orologio').appendChild(doppio(el('button', null, K.meno), function () { manda('orologio', -5); }));
    $('orologio').appendChild(doppio(el('button', null, K.piu), function () { manda('orologio', 5); }));
    $('titolo-volume').textContent = K.volume;
    $('volume').onchange = function () { manda('volume', Number($('volume').value)); };
    $('titolo-salta').textContent = K.salta;
    FASI.forEach(function (f) {
      const b = el('button', null, P.nomi_fasi[f]);
      b.dataset.fase = f;
      $('fasi').appendChild(doppio(b, function () { manda('vai_a', f); }));
    });
  }

  // --- Accesso e collegamento ------------------------------------------------------

  function mostraAccesso(messaggio) {
    $('console').hidden = true;
    $('accesso').hidden = false;
    $('accesso-titolo').textContent = K.titolo;
    $('accesso-etichetta').textContent = K.accesso.etichetta;
    $('entra').textContent = K.accesso.entra;
    $('accesso-esito').textContent = messaggio || '';
  }

  async function collega() {
    if (!window.crypto || !crypto.subtle) { mostraAccesso(K.solo_https); return; }
    $('accesso').hidden = true;
    $('console').hidden = false;
    disegna();
    ponte = await Ponte.apri(codice, 'console', function (m) {
      if (m.tipo === 'stato') riceviStato(m);
    }, function (ok) {
      inRete = ok;
      // appena collegati si chiede allo schermo dove siamo
      if (ok) ponte.invia({ tipo: 'ciao' }).catch(function () { /* niente */ });
      disegna();
    });
  }

  $('accesso').addEventListener('submit', function (e) {
    e.preventDefault();
    const v = Ponte.codiceValido($('codice').value.trim());
    if (!v) { mostraAccesso(K.accesso.non_valido); return; }
    codice = v;
    scrivi(v);
    collega();
  });

  // Link con un codice diverso incollato su una pagina già aperta: cambia solo il frammento.
  window.addEventListener('hashchange', function () { location.reload(); });

  setInterval(disegnaTempo, 500);
  costruisci();
  codice = Ponte.codiceValido(location.hash.slice(1)) || Ponte.codiceValido(leggi());
  if (codice) { scrivi(codice); collega(); } else mostraAccesso();
})();
