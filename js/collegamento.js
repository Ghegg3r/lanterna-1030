/*
 * Regia dal telefono, lato schermo (SPEC-v3).
 * Se c'è un codice di regia (generato dal pannello), lo schermo si collega al canale cifrato:
 *   - i comandi dal telefono passano da Regia.comando(nome, valore, 'console'), uno alla volta;
 *   - lo stato si manda solo quando cambia (fase, sottofase, pausa, velo, ±5, comando ricevuto),
 *     mai a intervalli regolari: orologio e timer li calcola il telefono dai timestamp.
 * Senza rete non cambia niente: il telecomando fa tutto.
 */
(function () {
  'use strict';

  const C = window.CONTENT_CONFIG;
  const CHIAVE = C.chiave_storage + '_regia';
  // Solo i comandi della tabella di SPEC-v3 §2: il telefono non può resettare né cambiare il colpevole.
  const AMMESSI = ['avanti', 'pausa', 'velo', 'tocchi', 'sigillo', 'confessione', 'vai_a', 'orologio', 'volume'];

  let codice = null, ponte = null, stato = 'spento';
  let coda = Promise.resolve(), esito = null, ultimaFirma = '', timer = null;

  function leggi() { try { return localStorage.getItem(CHIAVE); } catch (e) { return null; } }
  function scrivi(v) { try { if (v) localStorage.setItem(CHIAVE, v); else localStorage.removeItem(CHIAVE); } catch (e) { /* bloccato */ } }

  // Quello che il telefono deve sapere. Mai il colpevole.
  function fotografia() {
    const d = Stato.dati(), f = d.fase;
    return {
      fase: f,
      sottofase: Stato.sottofase(),
      avanti: Regia.prossimoAvanti(),
      pausa: d.pausa,
      velo: d.velo,
      velocita: d.tempo.velocita,
      tocchi: d.tocchi,
      confessione: d.confessione,
      carte: Stato.carteInGioco(),
      volume: d.volume,
      audio: Suoni.sbloccato(),
      orologio: (f === 'morte' || f === 'atto1') ? { min: Stato.oraScena(), corre: d.orologio.attivo && !d.pausa } : null,
      porta: (d.porta.attivo || f === 'sigillo') ? { ms: Stato.rimanentePorta(), corre: d.porta.attivo && !d.pausa } : null,
      t: Date.now()
    };
  }

  // La firma ignora i valori che scorrono da soli (ora, timer) ma non i salti (pausa, ±5, velocità).
  function firma(f) {
    const d = Stato.dati();
    const fisso = Object.assign({}, f, { t: 0, orologio: !!f.orologio, porta: !!f.porta });
    return JSON.stringify([fisso, d.orologio.acc, d.porta.acc, d.tempo.base, d.tempo.velocita]);
  }

  function inviaStato(forza) {
    if (!ponte || stato !== 'collegato') return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      const f = fotografia();
      const fi = firma(f);
      if (!forza && !esito && fi === ultimaFirma) return;
      ultimaFirma = fi;
      const messaggio = { tipo: 'stato', stato: f, esito: esito };
      esito = null;
      ponte.invia(messaggio).catch(function () { ultimaFirma = ''; });
    }, forza === true ? 0 : 300);
  }

  function ricevi(m) {
    if (m.tipo === 'ciao') { inviaStato(true); return; }
    if (m.tipo !== 'comando' || AMMESSI.indexOf(m.nome) < 0) return;
    coda = coda.then(function () {
      const e = Regia.comando(m.nome, m.valore, 'console');
      esito = { nome: m.nome, ok: e.ok, motivo: e.motivo || null };
      inviaStato(true);
    });
  }

  async function collega() {
    if (ponte) { ponte.chiudi(); ponte = null; }
    if (!codice) { stato = 'spento'; return; }
    if (!window.crypto || !crypto.subtle || !window.EventSource) { stato = 'senza_cifratura'; return; }
    stato = 'collegamento';
    const mio = codice;
    const p = await Ponte.apri(mio, 'schermo', ricevi, function (ok) {
      if (mio !== codice) return;
      stato = ok ? 'collegato' : 'scollegato';
      if (ok) inviaStato(true);   // appena (ri)collegato, il telefono deve sapere dove siamo
    });
    if (mio !== codice) { p.chiudi(); return; }
    ponte = p;
  }

  function avvia() {
    codice = Ponte.codiceValido(leggi());
    Stato.ascolta(function () { inviaStato(); });
    Regia.ascolta(function () { inviaStato(); });
    // Le sottofasi cambiano col tempo senza eventi: si controlla ogni secondo, ma si manda solo se cambia.
    setInterval(function () { inviaStato(); }, 1000);
    collega().catch(function () { stato = 'scollegato'; });
  }

  window.Collegamento = {
    avvia: avvia,
    stato: function () { return stato; },
    codice: function () { return codice; },
    link: function () { return codice && C.url_pubblico ? C.url_pubblico.replace(/\/?$/, '/') + 'regia.html#' + codice : null; },
    inviati: function () { return ponte ? ponte.inviati() : 0; },
    nuovoCodice: function () {
      codice = Cripta.nuovoCodice();
      scrivi(codice);
      ultimaFirma = '';
      collega().catch(function () { stato = 'scollegato'; });
      return codice;
    },
    dimentica: function () {
      codice = null;
      scrivi(null);
      collega();
    }
  };
})();
