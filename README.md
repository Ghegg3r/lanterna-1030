# I tarocchi maledetti — lo schermo centrale

Lo schermo della cena con delitto del 30/10/2026. Gira su un PC (Chrome) o su un iPad (Safari), anche senza rete.
Per giocare la serata vedi `docs/SERATA.md`. Lo stato del lavoro è in `docs/STATO.md`.

## Aprirlo sul PC (senza internet)
Doppio clic su `index.html`. Si apre in Chrome e funziona tutto: niente server, niente installazioni.
Per lo schermo intero: tasto **F**, oppure il pulsante nel pannello.

## Pubblicarlo su GitHub Pages (serve per l'iPad e per la console del telefono)
1. Crea un repository su GitHub (anche privato va bene, se il tuo piano permette Pages privati; altrimenti pubblico).
   Il colpevole è scritto in `content/segreto.js`: in un repository pubblico chiunque potrebbe leggerlo.
   Non è un problema di sicurezza, ma tienilo a mente.
2. Carica tutta la cartella così com'è (`index.html`, `regia.html`, `sw.js`, `css/`, `js/`, `content/`, `assets/`).
   La cartella `docs/` può restare, non serve allo schermo.
3. Su GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   scegli il ramo `main` e la cartella `/ (root)`, poi **Save**.
4. Dopo un minuto l'app è su `https://<tuo-nome>.github.io/<nome-repository>/`.
5. Scrivi quell'indirizzo, con la barra finale, in `content/config.js` alla voce `url_pubblico`,
   e ricarica i file su GitHub. Serve per il link della console del telefono.

Ogni volta che correggi un testo in `content/`, ricarica il file su GitHub: al prossimo avvio con la rete
l'iPad prende la versione nuova (codice e testi passano sempre prima dalla rete).

## Aprirlo sull'iPad e renderlo offline
1. Con la rete (wifi di casa tua, o il telefono come hotspot), apri l'indirizzo di GitHub Pages in **Safari**.
2. Tocca **Condividi → Aggiungi alla schermata Home**: si apre a tutto schermo, come un'app.
3. Aprila una volta dall'icona e aspetta un minuto: scarica tutto (codice, font, carte e tutti gli audio).
   Nel pannello (3 secondi sull'angolo in alto a destra, poi PIN), sezione **Schermo**, controlla
   "Pronto offline: N file in memoria".
4. Prova: metti l'iPad in **modalità aereo**, chiudi l'app e riaprila. Deve partire e suonare.
5. Prima della serata: **Impostazioni → Schermo e luminosità → Blocco automatico: Mai**, volume alto,
   silenzioso spento. Lo schermo prova da solo a restare acceso, ma su iPad conviene non fidarsi.

## La regia dal telefono (facoltativa)
Serve la rete cellulare sul telefono e sullo schermo (il PC con l'hotspot del telefono, o l'iPad con la SIM).
1. Sullo schermo apri il pannello (Ctrl+Shift+M, oppure 3 secondi sull'angolo in alto a destra), PIN,
   sezione **Regia dal telefono → Crea il codice di regia**.
2. Copia il link che compare e aprilo sul telefono **prima della serata**. Salvalo tra i preferiti.
   Non mostrarlo a nessuno: chi ha il link comanda lo schermo.
3. Se il telefono perde la rete, la console lo dice ("Rete assente: usa il telecomando"). Il telecomando
   funziona sempre, con o senza rete.
4. "Nuovo codice" nel pannello invalida il vecchio link.

## Aggiungere gli audio
Metti i file in `assets/audio/` con i nomi di `docs/ASSETS.md`. Finché un file manca, l'app va avanti:
le voci diventano sottotitoli (e una voce sintetica italiana, se il computer ne ha una), e Chrome scrive
in console un "file non trovato" che sparisce quando il file c'è.
Nel pannello, sezione **Audio**, "Controlla i file" dice quali ci sono e permette di provarli uno per uno.
I volumi delle singole tracce si regolano in `content/audio.js`.

## Dove sono le cose
| Cosa | Dove |
|---|---|
| Tutti i testi dello schermo | `content/testi.js`, `content/fascicolo.js` |
| Colpevole e confessione | `content/segreto.js` |
| Tempi, codice, PIN, candele, ora di scena | `content/config.js` |
| Tracce audio e volumi | `content/audio.js` |
| Testi del pannello e della console | `content/pannello.js`, `content/console.js` |
| Font, carte, audio | `assets/` |
