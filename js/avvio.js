// Avvio: ripristina lo stato salvato, disegna, e fa girare il tempo.
(function () {
  'use strict';

  const ripristinato = Stato.carica();
  Schermo.avvia(ripristinato);
  Pannello.avvia();
  Stato.controlla();
  Collegamento.avvia();

  setInterval(function () {
    Stato.controlla();
    Suoni.aggiorna();
    Schermo.aggiorna();
    Pannello.aggiorna();
  }, 100);

  // --- Offline: solo quando l'app è servita via https (o da localhost). Da file:// non serve e non si può.
  // A ogni apertura con la rete la copia offline si sincronizza (file nuovi o cambiati);
  // il pannello mostra quanti file ci sono su quanti ne servono.
  const offline = { stato: null, inCorso: false };
  const serve = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol);

  function chiedi(tipo) {
    return navigator.serviceWorker.ready.then(function (reg) {
      return new Promise(function (risolvi) {
        const canale = new MessageChannel();
        const scadenza = setTimeout(function () { risolvi(null); }, 180000);
        canale.port1.onmessage = function (e) { clearTimeout(scadenza); risolvi(e.data); };
        reg.active.postMessage({ tipo: tipo }, [canale.port2]);
      });
    });
  }

  offline.controlla = function () {
    if (!serve) return Promise.resolve(null);
    offline.inCorso = true;
    return chiedi(navigator.onLine ? 'sincronizza' : 'conta').then(function (r) {
      offline.inCorso = false;
      if (r) offline.stato = r;
      return r;
    }).catch(function () { offline.inCorso = false; return null; });
  };
  offline.attivo = function () { return serve; };
  window.Offline = offline;

  if (serve) {
    navigator.serviceWorker.register('sw.js').then(function () { return offline.controlla(); })
      .catch(function () { /* senza: funziona solo con la rete */ });
  }
})();
