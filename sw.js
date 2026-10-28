/*
 * Service worker: quando l'app è servita via https (GitHub Pages), dopo il primo caricamento
 * funziona senza rete. Su file:// non viene registrato.
 *
 * - All'installazione scarica TUTTO (codice, contenuti, font, carte, audio): così anche le tracce
 *   mai suonate ci sono offline. I file che mancano si saltano senza fermare il resto.
 * - Pagine, script, stili e contenuti: prima la rete (al massimo 3 secondi), poi la copia in cache.
 *   Dopo un aggiornamento non si mescolano file vecchi e nuovi.
 * - Immagini, font e audio: prima la cache (sono pesanti e non cambiano nome).
 * - Richieste Range (audio su Safari): servite dalla copia intera in cache, altrimenti
 *   iPad non riproduce l'audio offline.
 * - ntfy.sh (regia dal telefono) non passa mai dalla cache.
 */
'use strict';

const CACHE = 'tarocchi-maledetti-v2';
const ATTESA_RETE = 3000;
const PESANTI = /\.(png|jpe?g|webp|gif|svg|mp3|m4a|ogg|wav|woff2?)$/i;

// I contenuti scrivono su "window": nel service worker window è self.
self.window = self;
importScripts('content/config.js', 'content/testi.js', 'content/audio.js');

const CODICE = [
  './', 'index.html', 'regia.html', 'sw.js',
  'css/stile.css', 'css/fascicolo.css', 'css/porta.css', 'css/regia.css',
  'content/config.js', 'content/arcani.js', 'content/testi.js', 'content/fascicolo.js',
  'content/segreto.js', 'content/pannello.js', 'content/audio.js', 'content/console.js', 'content/tempi-voci.js',
  'js/stato.js', 'js/regia.js', 'js/audio.js', 'js/schermo.js', 'js/rituale.js', 'js/delitto.js',
  'js/fascicolo.js', 'js/porta.js', 'js/finale.js', 'js/pannello.js', 'js/avvio.js',
  'js/cripta.js', 'js/ponte.js', 'js/collegamento.js', 'js/console.js'
];

function tuttiIFile() {
  const AU = self.CONTENT_AUDIO, T = self.CONTENT_TESTI, C = self.CONTENT_CONFIG;
  const font = ['cinzel', 'imfell-italic', 'special-elite', 'grafia'].map(function (f) { return 'assets/font/' + f + '.woff2'; });
  const carte = C.portanti.concat(C.carte_extra_in_ordine, ['morte']).map(function (id) { return 'assets/carte/' + id + '.jpg'; });
  const audio = Object.keys(AU.tracce).map(function (k) { return AU.cartella + AU.tracce[k].file; })
    .concat([T.audio1.file, T.audio2.file, T.sigillata.file, T.attraversata.file, AU.confessione.sigillata, AU.confessione.attraversata]
      .map(function (f) { return AU.cartella + f; }));
  return CODICE.concat(font, carte, audio);
}

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(tuttiIFile().map(function (f) {
      return fetch(f, { cache: 'reload' })
        .then(function (r) { if (r.ok && r.status === 200) return cache.put(new URL(f, self.location).href, r); })
        .catch(function () { /* file mancante: si va avanti */ });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomi) {
    return Promise.all(nomi.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// La pagina chiede: 'sincronizza' (con la rete: riprende i file cambiati o mancanti) o 'conta' (senza rete).
// Risponde quanti file ci sono su quanti ne servono, e quali mancano. Così si aggiungono file
// (audio, carte) senza dover cambiare questo service worker.
self.addEventListener('message', function (e) {
  const porta = e.ports && e.ports[0];
  if (!porta) return;
  const tipo = e.data && e.data.tipo;
  e.waitUntil(controlla(tipo === 'sincronizza').then(function (r) { porta.postMessage(r); }));
});

function controlla(sincronizza) {
  return caches.open(CACHE).then(function (cache) {
    const file = tuttiIFile();
    const mancanti = [];
    let presenti = 0;
    return Promise.all(file.map(function (f) {
      const url = new URL(f, self.location).href;
      const dallaRete = !sincronizza ? Promise.resolve(false)
        // no-cache: il browser chiede al server se il file è cambiato e riscarica solo se serve
        : fetch(url, { cache: 'no-cache' }).then(function (r) {
          if (!r.ok || r.status !== 200) return false;
          return cache.put(url, r).then(function () { return true; });
        }).catch(function () { return false; });
      return dallaRete.then(function (preso) {
        if (preso) { presenti++; return; }
        return cache.match(url, { ignoreVary: true }).then(function (c) { if (c) presenti++; else mancanti.push(f); });
      });
    })).then(function () { return { attesi: file.length, presenti: presenti, mancanti: mancanti.sort() }; });
  });
}

self.addEventListener('fetch', function (e) {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.headers.has('range')) { e.respondWith(rispondiRange(req)); return; }
  e.respondWith(PESANTI.test(url.pathname) ? primaCache(req) : primaRete(req));
});

function chiaveDi(req) { return req.url.split('#')[0].split('?')[0]; }

function salva(cache, req, risposta) {
  if (risposta.ok && risposta.status === 200) cache.put(chiaveDi(req), risposta.clone());
  return risposta;
}

function primaRete(req) {
  return caches.open(CACHE).then(function (cache) {
    const dallaRete = fetch(req).then(function (r) { return salva(cache, req, r); });
    const scaduto = new Promise(function (ok) { setTimeout(ok, ATTESA_RETE); });
    return Promise.race([dallaRete.catch(function () { return null; }), scaduto]).then(function (r) {
      if (r) return r;
      return cache.match(chiaveDi(req), { ignoreVary: true }).then(function (inCache) {
        if (inCache) return inCache;
        return dallaRete.catch(function () { return new Response('Offline e non ancora in cache.', { status: 503 }); });
      });
    });
  });
}

function primaCache(req) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(chiaveDi(req), { ignoreVary: true }).then(function (inCache) {
      return inCache || fetch(req).then(function (r) { return salva(cache, req, r); });
    });
  });
}

function rispondiRange(req) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(chiaveDi(req), { ignoreVary: true });
  }).then(function (inCache) {
    if (!inCache) return fetch(req);
    return inCache.arrayBuffer().then(function (buf) {
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
      const totale = buf.byteLength;
      let inizio = m && m[1] ? parseInt(m[1], 10) : 0;
      let fine = m && m[2] ? Math.min(parseInt(m[2], 10), totale - 1) : totale - 1;
      if (m && !m[1] && m[2]) { inizio = Math.max(0, totale - parseInt(m[2], 10)); fine = totale - 1; }
      return new Response(buf.slice(inizio, fine + 1), {
        status: 206,
        headers: {
          'Content-Type': inCache.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Range': 'bytes ' + inizio + '-' + fine + '/' + totale,
          'Content-Length': String(fine - inizio + 1),
          'Accept-Ranges': 'bytes'
        }
      });
    });
  });
}
