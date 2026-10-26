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

  // Offline: solo quando l'app è servita via https (o da localhost). Da file:// non serve e non si può.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* senza: funziona solo con la rete */ });
  }
})();
