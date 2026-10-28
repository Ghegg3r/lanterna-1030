/*
 * Pannello nascosto del master: Ctrl+Shift+M, oppure 3 secondi sull'angolo in alto a destra, poi PIN.
 * Ogni azione passa da Regia.comando(..., 'pannello'). Si chiude con Esc o con "Chiudi",
 * e chiudendolo il suo DOM viene svuotato (niente colpevole in giro).
 */
(function () {
  'use strict';

  const P = window.CONTENT_PANNELLO;
  const C = window.CONTENT_CONFIG;
  const A = window.CONTENT_ARCANI;

  let box, stato, messaggio, statoRegia = null;
  let aperto = false;
  let mostraColpevoleFino = 0;

  function el(tag, classe, testo) { return Schermo.el(tag, classe, testo); }
  function pulsante(testo, azione, classe) { return Schermo.pulsante(testo, azione, classe); }

  // Pulsante che chiede un secondo tocco entro 3 secondi.
  function doppio(testo, azione, classe) {
    let armato = null;
    const b = pulsante(testo, function () {
      if (armato) { clearTimeout(armato); armato = null; azione(); return; }
      b.textContent = P.conferma + ': ' + testo;
      b.classList.add('armato');
      armato = setTimeout(function () { armato = null; b.textContent = testo; b.classList.remove('armato'); }, 3000);
    }, classe);
    return b;
  }

  function sezione(titolo) {
    const s = el('section');
    s.appendChild(el('h3', null, titolo));
    box.appendChild(s);
    return s;
  }

  function comando(nome, valore) {
    const esito = Regia.comando(nome, valore, 'pannello');
    if (aperto) {
      disegna();
      messaggio.textContent = esito.ok ? '' : (P.esiti[esito.motivo] || esito.motivo);
    }
    return esito;
  }

  // --- PIN -------------------------------------------------------------------

  function chiediPin() {
    if (aperto) return;
    aperto = true;
    box.hidden = false;
    box.textContent = '';
    const f = el('div', 'pin');
    f.appendChild(el('h2', null, P.pin.titolo));
    const campo = el('input');
    campo.type = 'password';
    campo.inputMode = 'numeric';
    campo.maxLength = 4;
    campo.autocomplete = 'off';
    const errore = el('p', 'esito');
    function prova() {
      if (campo.value === String(C.pin_pannello)) { disegna(); return; }
      errore.textContent = P.pin.errato;
      campo.value = '';
    }
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') prova(); });
    campo.addEventListener('input', function () { if (campo.value.length === 4) prova(); });
    f.appendChild(campo);
    f.appendChild(pulsante(P.pin.apri, prova));
    f.appendChild(pulsante(P.pin.annulla, chiudi));
    f.appendChild(errore);
    box.appendChild(f);
    setTimeout(function () { campo.focus(); }, 0);
  }

  function chiudi() {
    aperto = false;
    box.hidden = true;
    box.textContent = '';
    mostraColpevoleFino = 0;
    if (document.activeElement) document.activeElement.blur();
  }

  // --- Pannello ----------------------------------------------------------------

  function disegna() {
    const d = Stato.dati();
    const scroll = box.scrollTop;
    box.textContent = '';

    const testa = el('div', 'testa');
    testa.appendChild(el('h2', null, P.titolo));
    testa.appendChild(pulsante(P.chiudi, chiudi));
    box.appendChild(testa);
    stato = el('p', 'stato');
    box.appendChild(stato);
    messaggio = el('p', 'esito');
    box.appendChild(messaggio);

    // Colpevole
    let s = sezione(P.colpevole.titolo);
    let testo;
    if (!d.colpevole) testo = P.colpevole.nessuno;
    else if (Date.now() < mostraColpevoleFino) testo = A[d.colpevole].nome;
    else testo = P.colpevole.nascosto;
    s.appendChild(el('p', 'valore', testo));
    if (d.colpevole) {
      s.appendChild(pulsante(P.colpevole.mostra, function () { rivela(); }));
    }
    s.appendChild(doppio(P.colpevole.sorteggia, function () {
      if (comando('sorteggia').ok) rivela();
    }));
    s.appendChild(el('p', 'nota', P.colpevole.scegli));
    C.portanti.forEach(function (id) {
      s.appendChild(doppio(A[id].nome, function () {
        if (comando('colpevole', id).ok) messaggio.textContent = P.colpevole.impostato;
      }));
    });

    // Giocatori
    s = sezione(P.giocatori.titolo);
    for (let n = C.giocatori_min; n <= C.giocatori_max; n++) {
      s.appendChild(pulsante(String(n), function () { comando('giocatori', n); }, n === d.giocatori ? 'attivo' : null));
    }
    s.appendChild(el('p', 'nota', P.giocatori.carte + ' ' +
      Stato.carteInGioco().map(function (id) { return A[id].nome; }).join(', ')));

    // Risposte giuste a mezzanotte
    s = sezione(P.tocchi.titolo);
    for (let n = 0; n <= 3; n++) {
      s.appendChild(pulsante(String(n), function () { comando('tocchi', n); }, n === d.tocchi ? 'attivo' : null));
    }
    if (d.tocchi === null) s.appendChild(el('p', 'nota', P.tocchi.nessuna));

    // Sospetto di mezzanotte
    s = sezione(P.sospetto.titolo);
    s.appendChild(pulsante(P.sospetto.nessuno, function () { comando('sospetto', null); }, d.sospetto === null ? 'attivo' : null));
    Stato.carteInGioco().forEach(function (id) {
      s.appendChild(pulsante(A[id].nome, function () { comando('sospetto', id); }, d.sospetto === id ? 'attivo' : null));
    });

    // Salta a fase
    s = sezione(P.fasi.titolo);
    Stato.FASI.forEach(function (f) {
      s.appendChild(doppio(P.nomi_fasi[f], function () { comando('vai_a', f); }, f === d.fase ? 'attivo' : null));
    });

    // Orologio
    s = sezione(P.orologio.titolo);
    s.appendChild(pulsante(P.orologio.meno, function () { comando('orologio', -5); }));
    s.appendChild(pulsante(P.orologio.piu, function () { comando('orologio', 5); }));
    s.appendChild(el('p', 'nota', P.orologio.nota));

    // Prova ×10
    s = sezione(P.prova.titolo);
    const prova = d.tempo.velocita !== 1;
    s.appendChild(pulsante(prova ? P.prova.attiva : P.prova.spenta, function () { comando('prova', !prova); }, prova ? 'attivo allarme' : null));
    s.appendChild(el('p', 'nota', P.prova.nota));

    // Audio
    s = sezione(P.audio.titolo);
    const vol = el('input');
    vol.type = 'range'; vol.min = 0; vol.max = 1; vol.step = 0.05; vol.value = d.volume;
    vol.setAttribute('aria-label', P.audio.volume);
    vol.addEventListener('change', function () { comando('volume', Number(vol.value)); });
    s.appendChild(el('span', null, P.audio.volume + ' '));
    s.appendChild(vol);
    s.appendChild(pulsante(P.audio.controlla, function () {
      Suoni.controllaTutti();
      setTimeout(function () { if (aperto) disegna(); }, 1500);
    }));
    s.appendChild(pulsante(P.audio.ferma, function () { Suoni.fermaProva(); }));
    const tabella = el('div', 'tracce');
    Suoni.elenco().forEach(function (t) {
      const riga = el('div', 'traccia' + (t.stato === 'mancante' ? ' manca' : ''));
      riga.appendChild(pulsante(P.audio.prova, function () { Suoni.prova(t.file, t.volume); }));
      riga.appendChild(el('span', null, t.file + ' — ' + P.audio.stati[t.stato] +
        (t.durata ? ' (' + Math.round(t.durata / 1000) + ' s)' : '')));
      tabella.appendChild(riga);
    });
    s.appendChild(tabella);
    s.appendChild(el('p', 'nota', P.audio.sintetica + ' ' + (Suoni.voceSintetica() || P.audio.nessuna_sintetica)));
    s.appendChild(el('p', 'nota', P.audio.nota));

    // Schermo
    s = sezione(P.schermo.titolo);
    s.appendChild(pulsante(P.schermo.intero, function () { comando('schermo_intero'); }));
    // Copia offline: quanti file ci sono su quanti ne servono (si aggiorna a ogni apertura con la rete)
    const o = window.Offline;
    if (!o || !o.attivo()) {
      s.appendChild(el('p', 'nota', P.schermo.offline_no));
    } else {
      let testo = P.schermo.offline_controllo;
      if (o.stato) {
        const st = o.stato;
        testo = (st.presenti === st.attesi ? P.schermo.offline_si : P.schermo.offline_parziale)
          .replace('{n}', st.presenti).replace('{tot}', st.attesi);
        if (st.mancanti.length) testo += ' ' + P.schermo.offline_mancano + ' ' + st.mancanti.slice(0, 6).join(', ') + (st.mancanti.length > 6 ? '…' : '');
      }
      s.appendChild(el('p', o.stato && o.stato.presenti === o.stato.attesi ? 'valore' : 'nota', testo));
      s.appendChild(pulsante(P.schermo.offline_aggiorna, function () {
        o.controlla().then(function () { if (aperto) disegna(); });
        disegna();
      }));
    }

    // Regia dal telefono: il codice compare solo qui
    s = sezione(P.regia.titolo);
    statoRegia = s.appendChild(el('p', 'valore'));
    if (Collegamento.codice()) {
      const link = Collegamento.link();
      if (link) {
        s.appendChild(el('p', 'nota', P.regia.link));
        s.appendChild(el('p', 'codice-regia', link));
        s.appendChild(pulsante(P.regia.copia, function () {
          if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { messaggio.textContent = P.regia.copiato; }).catch(function () { /* niente */ });
        }));
      } else {
        s.appendChild(el('p', 'nota', P.regia.manca_url));
        s.appendChild(el('p', 'codice-regia', Collegamento.codice()));
      }
      s.appendChild(doppio(P.regia.nuovo, function () { Collegamento.nuovoCodice(); disegna(); }));
      s.appendChild(doppio(P.regia.dimentica, function () { Collegamento.dimentica(); disegna(); }));
    } else {
      s.appendChild(pulsante(P.regia.crea, function () { Collegamento.nuovoCodice(); disegna(); }));
    }
    s.appendChild(el('p', 'nota', P.regia.nota));

    // Reset: tre tocchi
    s = sezione(P.reset.titolo);
    let passo = 0;
    const r = pulsante(P.reset.pulsante, function () {
      passo++;
      if (passo === 1) r.textContent = P.reset.conferma1;
      else if (passo === 2) r.textContent = P.reset.conferma2;
      else { comando('reset'); chiudi(); }
      r.classList.add('armato');
    }, 'pericolo');
    s.appendChild(r);

    aggiorna();
    box.scrollTop = scroll;
  }

  function rivela() {
    mostraColpevoleFino = Date.now() + 5000;
    disegna();
    setTimeout(function () { if (aperto && Date.now() >= mostraColpevoleFino) disegna(); }, 5100);
  }

  // Riga di stato, a ogni tick.
  function aggiorna() {
    if (!aperto || !stato) return;
    const d = Stato.dati();
    const parti = [P.stato.fase + ': ' + P.nomi_fasi[d.fase]];
    if (d.orologio.attivo || d.fase === 'atto1' || d.fase === 'morte') parti.push(P.stato.orologio + ' ' + Schermo.hhmm(Stato.oraScena()));
    if (d.porta.attivo || d.fase === 'sigillo') parti.push(P.stato.porta + ' ' + Schermo.mmss(Stato.rimanentePorta()));
    if (d.pausa) parti.push(P.stato.pausa);
    if (d.velo) parti.push(P.stato.velo);
    if (d.tempo.velocita !== 1) parti.push(P.prova.badge);
    const t = parti.join(' · ');
    if (stato.textContent !== t) stato.textContent = t;
    if (statoRegia) {
      const r = P.regia.stati[Collegamento.stato()] + (Collegamento.codice() ? ' ' + P.regia.inviati.replace('{n}', Collegamento.inviati()) : '');
      if (statoRegia.textContent !== r) statoRegia.textContent = r;
    }
  }

  // --- Come si apre ------------------------------------------------------------

  function avvia() {
    box = document.getElementById('pannello');

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        chiediPin();
      } else if (aperto && e.key === 'Escape') {
        chiudi();
      }
    });

    // iPad: 3 secondi sull'angolo in alto a destra.
    const angolo = document.getElementById('angolo');
    let timer = null;
    function annulla() { clearTimeout(timer); timer = null; }
    angolo.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      annulla();
      timer = setTimeout(chiediPin, 3000);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { angolo.addEventListener(n, annulla); });
    angolo.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  window.Pannello = {
    avvia: avvia,
    aggiorna: aggiorna,
    chiediPin: chiediPin,
    aperto: function () { return aperto; }
  };
})();
