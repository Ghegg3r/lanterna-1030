/*
 * Ponte: canale tra schermo e telefono attraverso ntfy.sh (servizio pubblico di notifiche).
 *
 * Siccome è pubblico:
 *   - il nome del canale (topic) è un hash del codice di regia: dal nome non si risale al codice;
 *   - ogni messaggio è cifrato con il codice (cripta.js) e porta l'ora: quelli più vecchi
 *     di 5 minuti si scartano;
 *   - il servizio non conserva i messaggi (cache=no).
 * Il servizio gratuito ha un limite giornaliero: si manda solo quando qualcosa cambia.
 */
(function () {
  'use strict';

  const SERVIZIO = 'https://ntfy.sh/';
  const SCADENZA = 5 * 60 * 1000;

  async function topicDa(codice) {
    const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tarocchi-regia|' + codice)));
    return 'tm' + Array.prototype.map.call(h.slice(0, 20), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  /*
   * ruolo: 'schermo' o 'console' (i propri messaggi si ignorano).
   * ricevi(messaggio): per ogni messaggio valido dell'altra parte.
   * collegato(bool): stato del collegamento al servizio.
   */
  async function apri(codice, ruolo, ricevi, collegato) {
    const topic = await topicDa(codice);
    const flusso = new EventSource(SERVIZIO + topic + '/sse');
    let inviati = 0, ultimoSegno = 0, su = null;

    // "collegato" cambia solo quando cambia davvero.
    function segna(ok) {
      if (ok) ultimoSegno = Date.now();
      if (ok !== su) { su = ok; collegato(ok); }
    }
    flusso.onopen = function () { segna(true); };
    flusso.onerror = function () { segna(false); };
    // ntfy manda un segno di vita ogni 45 s circa: se tace troppo, la rete è caduta anche senza errori.
    flusso.addEventListener('keepalive', function () { segna(true); });
    flusso.addEventListener('open', function () { segna(true); });
    function sparito() { segna(false); }
    function tornato() { if (flusso.readyState === EventSource.OPEN) segna(true); }
    window.addEventListener('offline', sparito);
    window.addEventListener('online', tornato);
    const controllo = setInterval(function () {
      if (!navigator.onLine || (su && Date.now() - ultimoSegno > 75000)) segna(false);
    }, 5000);
    flusso.onmessage = async function (e) {
      ultimoSegno = Date.now();
      if (su === false && navigator.onLine) segna(true);
      let dati;
      try {
        const m = JSON.parse(e.data);
        if (m.event !== 'message') return;
        dati = await Cripta.decifra(JSON.parse(m.message), codice);
      } catch (err) { return; }   // non è nostro, o non si decifra
      if (dati.da === ruolo || Math.abs(Date.now() - dati.t) > SCADENZA) return;
      ricevi(dati);
    };

    async function invia(messaggio) {
      const corpo = Object.assign({}, messaggio, { da: ruolo, t: Date.now() });
      const blob = await Cripta.cifra(corpo, codice);
      const r = await fetch(SERVIZIO + topic + '?cache=no&firebase=no', { method: 'POST', body: JSON.stringify(blob) });
      inviati++;
      if (!r.ok) throw new Error(r.status === 429 ? 'Limite di messaggi del servizio raggiunto: riprova tra poco.' : 'Invio fallito (' + r.status + ').');
    }

    return {
      invia: invia,
      chiudi: function () {
        flusso.close();
        clearInterval(controllo);
        window.removeEventListener('offline', sparito);
        window.removeEventListener('online', tornato);
      },
      inviati: function () { return inviati; }
    };
  }

  function codiceValido(c) { return /^[A-Za-z0-9_-]{20,}$/.test(c || '') ? c : null; }

  window.Ponte = { apri: apri, codiceValido: codiceValido };
})();
