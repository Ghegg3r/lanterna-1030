# Progetto: "I tarocchi maledetti" — schermo centrale per una cena con delitto

Leggi questo file per intero prima di scrivere codice. Poi, in quest'ordine:
1. `docs/STATO.md`: cosa è già fatto, le decisioni prese e le domande ancora aperte. **Leggilo sempre per primo.**
2. `docs/SPEC.md`, poi `docs/SPEC-v2-modifiche.md`, poi `docs/SPEC-v3-regia.md`. Dove sono in conflitto vince la più recente (v3 > v2 > SPEC).
3. I file in `content/`.
I prompt di lavoro, in ordine, sono in `docs/PROMPTS.md`. Il primo (prompt 0) ti chiede di valutare l'architettura prima di scrivere codice.
Per capire il gioco intero (non solo lo schermo) c'è `docs/GIOCO.md`: leggilo una volta, ma non costruire niente per le parti di carta.

## Cos'è
Un'app web che gira su un PC (o un iPad) appoggiato al centro del tavolo, durante una cena con delitto dal vivo, la sera del 30/10/2026. 9-12 giocatori più il master.
Non è un videogioco: la serata si gioca parlando, con oggetti veri, candele e una tavola Ouija di carta. Lo schermo è un **oggetto di scena**: fa da orologio, da voce degli spiriti, da archivio delle prove e da porta che si apre. Se una funzione tiene la gente a fissare lo schermo, è sbagliata.

## Chi lo usa
- **I giocatori** lo guardano tutti insieme e lo toccano poche volte: per confermare le iniziali del rituale, per dire che le candele sono accese, per inserire un codice, per sfogliare le prove.
- **Il master** (Daniele) è "morto" a inizio serata e fa lo spirito. Non può smanettare sul PC davanti a tutti: comanda tutto con un **telecomando da presentazione** in tasca (PageDown / PageUp / B), più un **pannello nascosto** che usa solo a inizio serata e nel finale.
- In più, quando c'è rete cellulare, una **console sul suo telefono** (`docs/SPEC-v3-regia.md`). Telecomando, pannello e console passano tutti da un'unica funzione di comando: progettala così fin dal Prompt 1.

## Vincoli tecnici (non negoziabili)
- HTML + CSS + JavaScript vanilla. Nessun framework, nessun bundler, nessun build step, nessuna dipendenza npm a runtime.
- Deve funzionare **aprendo `index.html` con doppio clic** (protocollo `file://`) su Chrome per Windows. Quindi: niente `fetch()` di file locali e niente ES modules. I contenuti stanno in `content/*.js` come `window.CONTENT_<NOME> = {...}` e si caricano con tag `<script>` normali.
- Deve funzionare anche pubblicato su GitHub Pages, aperto da iPad Safari. Quando è servito via https, un service worker mette in cache tutto: dopo il primo caricamento va **offline**. Nella casa non c'è wifi; probabilmente c'è rete cellulare, ma **niente deve dipendere dalla rete** tranne la console del telefono, che è un'aggiunta.
- Codice già provato da riusare (canale cifrato per la console, service worker con audio offline): `docs/riferimenti/`. È un modello da adattare, non da caricare così com'è.
- Font, immagini e audio sono **locali**, in `assets/`. Niente CDN.
- Layout per uno schermo 16:9 o 4:3 guardato da un metro e mezzo, al buio. Testo grande, contrasto alto. Deve reggere 1280×800 (iPad) e 1920×1080.
- Lo stato si salva in `localStorage` a ogni cambio di fase: se il browser si chiude o si ricarica, l'app **riparte esattamente da dov'era**, con orologio e timer corretti (calcolati da timestamp, non da contatori).
- Schermo sempre acceso: Wake Lock API dove c'è. Schermo intero con il tasto F o dal pannello.
- L'audio parte solo dopo un primo gesto dell'utente (regola dei browser): la schermata di avvio ha un pulsante "Inizia" che sblocca l'audio e va a tutto schermo.

## Il colpevole (aggiornato il 22/10)
- **Il colpevole è deciso: La Stella.** La storia completa, con la soluzione, è in `docs/STORIA.md`: leggila, ti serve per capire il gioco e per i testi del finale.
- Il colpevole e la sua confessione finale sono in `content/segreto.js`. Il pannello nascosto può cambiarlo, se mai servisse.
- Il pannello nascosto si apre con **Ctrl+Shift+M** (o tenendo premuto 3 secondi l'angolo in alto a destra su iPad) e chiede un PIN di 4 cifre impostato in `content/config.js`. Serve solo perché i giocatori non lo aprano per sbaglio.
- Regola di gioco, non di sicurezza: lo schermo non mostra mai il colpevole prima del finale.

## Stile
Occulto, elegante, un po' anni '80. Nero profondo, oro antico, rosso cera come unico accento caldo. Tipografia: un serif antico per i titoli, un corsivo calligrafico per le voci degli spiriti, una macchina da scrivere per i documenti del 1986, una grafia a mano per il diario e il biglietto.
Movimento lento: fiamme che tremano, fumo, grana VHS leggera sui documenti del 1986. Niente zucche, niente pipistrelli animati, niente cartoon.
I documenti del 1986 (giornale, verbale, diario, quaderno) si **disegnano in HTML/CSS**, non come immagini: così il testo resta modificabile.

## Regole di lavoro
- I testi stanno solo nei file `content/`. Non scriverli nel codice. Se un testo manca, mettilo in `content/` e segnalamelo.
- Lingua dell'interfaccia: italiano.
- Dopo ogni prompt aggiorna `docs/STATO.md`: cosa hai fatto, cosa resta, cosa va provato a mano, e le decisioni prese.
- Prima di dire che una cosa funziona, provala davvero nel browser (anche da `file://`) e controlla la console: niente errori.
- Le domande aperte in `docs/STATO.md` vanno chieste all'utente quando arrivi alla parte che le riguarda, non decise da solo.
- Alla fine di ogni prompt dimmi come provarlo in 2 minuti.
- Se una richiesta va contro questo file, fermati e chiedimelo.
