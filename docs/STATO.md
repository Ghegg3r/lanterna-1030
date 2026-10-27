# Stato dei lavori

Aggiornato dopo ogni prompt (vedi `docs/PROMPTS.md`). Chi lavora sull'app legge questo file per primo.

## Fatto

### Prompt 0 — Valutazione (22/10/2026)
Nessun codice scritto. Letti CLAUDE.md, GIOCO, STORIA, SPEC, SPEC-v2 e tutti i file di `content/`.

**Cosa fa lo schermo, fase per fase**
1. Avvio: "Inizia" sblocca l'audio, schermo intero, schermo sempre acceso.
2. Rituale: titolo, tre fiamme spente; verifica facoltativa delle iniziali (ogni gruppo giusto accende una fiamma); "Le fiamme sono accese".
3. Sollievo → pesca: righe rassicuranti, la musica si incrina, "una busta a testa".
4. Morte (primo tasto Avanti del master): nero, blackout, voce 1 con sottotitoli, possessione; parte l'orologio di scena.
5. Chiave: codice 1386 → giornale, verbale e Grimorio, "Ciò che vi serve è sotto i vostri piatti".
6. Atto 1: orologio grande, documenti sfogliabili, tre obiettivi sempre visibili; Avanti = manifestazione; pausa per la cena.
7. Mezzanotte: lo spirito legge il verbale, il master inserisce 0-3, i tocchi, "Raccontate."; Avanti → voce 2 → "Aprite le buste".
8. Atto 2: timer della porta 60 minuti, apertura a scatti ogni 10 con i nomi dei round, schermo più scuro a 30, rosso e voto a 10.
9. Sigillo: il master tocca la carta girata → porta sigillata (nominata la Stella) o attraversata (errore o tempo scaduto).
10. Finale: voce 3a o 3b, confessione facoltativa, titoli con colpevole, sospetto di mezzanotte e tocchi.

**Architettura: confermata quella di CLAUDE.md** (HTML + CSS + JS vanilla, parte da `file://`, contenuti in `content/*.js`, GitHub Pages per l'iPad).
Alternative scartate:
- React + Vite: Vite produce moduli ES, che Chrome blocca su `file://`; ogni correzione di testo richiede una nuova build.
- Server locale (PWA): un processo in più da tenere acceso la sera, che può chiudersi o bloccarsi; nessun vantaggio reale.

**Regia dal telefono: si fa, in due modi** (decisione del 22/10, vedi `docs/SPEC-v3-regia.md`):
il telecomando funziona sempre, senza rete; la console sul telefono del master funziona quando c'è rete cellulare.
Il motore va costruito fin dal Prompt 1 con un unico punto di ingresso per i comandi, così la console si aggiunge senza toccare il resto.

## Decisioni sulle contraddizioni trovate

Già decise (sono scritte anche in `docs/SPEC-v2-modifiche.md` §7, che prevale):
1. **Colpevole fisso**: la Stella (`content/segreto.js`). `GIOCO.md` parlava ancora di sorteggio: corretto.
2. **Nomi dei round** dell'atto 2: mancavano in `content/`, aggiunti in `testi.porta.round`.
3. **"Ciò che vi serve è sotto i vostri piatti"** compariva due volte (`testi.chiave.giusta` e `fascicolo.dopo_codice`): si mostra una volta sola, il testo grande dei 10 secondi è `fascicolo.dopo_codice`; `testi.chiave.giusta` ora ha solo la prima frase.
4. **Criterio di accettazione 5** (nome del colpevole mai nell'HTML): impossibile con `segreto.js` sempre caricato. Diventa: il colpevole non viene mai **mostrato** né scritto nel DOM visibile prima del finale, e non compare in console.
5. **Criterio 4** (riga A del diario): il diario è solo di carta. Si controlla solo il nome del colpevole nel finale.
6. **"Colpevole salvato offuscato"** (Prompt 1): inutile, è in chiaro in `segreto.js`. Non si offusca.
7. **Voci della confessione** (`voce_4_…`): mancavano in `ASSETS.md`, aggiunte.

Decise dall'utente il 22/10 (prima del Prompt 1):
8. **Voce 3a (porta sigillata)**: l'ultima riga diventa "E la lettera che avete trovato sul tavolo… l'aveva scritta {arcano}." (`content/testi.js`). Se l'audio era già registrato, va rifatto.
9. **Orologio di scena**: parte alle **23:10** (`config.orologio_scena.inizio`): 50 minuti fino a mezzanotte. Aggiornati GIOCO.md e il Prompt 3. SPEC.md parla ancora di 23:00: vale config.
10. **Codice 1386**: voluto (XIII, la Morte, + 86). Resta.

**Domande aperte**
11. **Voce 3b (attraversata)**: stesso problema della 3a. Chi parla dice "{arcano} è passato" (terza persona) e poi "La lettera sul tavolo l'ho scritta io". Se parla la Stella che ha attraversato, la terza persona stona; se parla un altro spirito, la lettera non l'ha scritta lui. Proposta: come la 3a, "La lettera sul tavolo l'aveva scritta {arcano}. Vi ha chiesto aiuto, e glielo avete dato." Da chiedere prima del Prompt 5.
12. **Titoli, "{tocchi} tocchi"**: con N = 1 viene "1 tocchi". Da sistemare nel Prompt 5 (per esempio una riga per ogni N, come `testi.tocchi`).

### Prompt 1 — Motore e regia (22/10/2026)
Fatto, con schermate segnaposto: il nome della fase al centro, sotto una riga di informazioni (orologio, timer, sottofase), sfondo nero e testo bianco.

**File**
- `index.html`: carica `content/*.js` e poi `js/*.js` con `<script>` normali. Gira da `file://`.
- `js/stato.js`: le 15 fasi di SPEC §2. `pausa` non è una fase ma un velo sopra le fasi con orologio. Salva in `localStorage` (`config.chiave_storage`) a ogni cambio e al caricamento riparte da lì. Il tempo si calcola tutto da timestamp: un "tempo di gioco" che scorre ×1 o ×10, e tre cronometri (fase, orologio di scena, porta) che si fermano in pausa. Passaggi automatici: sollievo→pesca, orologio a 24:00→mezzanotte, fine voce 2→porta, 10:00→voto, 0:00→attraversata, fine voce 3a/3b→titoli, confessione saltata dopo 20 s.
- `js/regia.js`: `Regia.comando(nome, dati, origine)` è l'unico punto di ingresso. Gestisce i comandi di SPEC-v3 §2 (`avanti`, `pausa`, `velo`, `tocchi`, `sigillo`, `confessione`, `vai_a`, `orologio`, `volume`), quelli dello schermo (`inizia`, `apri_verifica`, `chiudi_verifica`, `verifica`, `fiamme_accese`, `codice`, `nominato`) e quelli del pannello (`colpevole`, `sorteggia`, `giocatori`, `sospetto`, `prova`, `schermo_intero`, `reset`). Restituisce `{ok, motivo}`. `Regia.prossimoAvanti()` dice cosa farà Avanti (servirà alla console). `Regia.ascolta()` serve al puntino e, nel Prompt 7, a mandare lo stato al telefono.
- `js/schermo.js`: segnaposto, veli (pausa, velo nero, "Tocca per riprendere"), puntino, avvio (audio sbloccato con un AudioContext, schermo intero, Wake Lock richiesto di nuovo quando la pagina torna visibile).
- `js/pannello.js`: si apre con Ctrl+Shift+M o con 3 s sull'angolo in alto a destra, poi PIN da config. Colpevole, sorteggio, giocatori 9-12 con le carte in gioco, risposte giuste 0-3, sospetto, salto a fase, ±5 minuti, prova ×10, volume, schermo intero, reset.
- `js/avvio.js`: ripristino e tick ogni 100 ms.
- `css/stile.css`: provvisorio, il Prompt 2 lo sostituisce.

**Testi aggiunti in `content/`**
- `content/pannello.js` (nuovo): testi del pannello e nomi delle fasi.
- `testi.avvio.riprendi` ("Tocca per riprendere"), `testi.mezzanotte.legge` ("Lo spirito legge…", da SPEC-v2 §2).
- In `config.tempi`: `chiave_giusta_s` 4, `dopo_codice_s` 10, `manifestazione_luce_s` 3, `manifestazione_testo_s` 6, `tocchi_s` 8, `round_iniziale_s` 15, `attesa_confessione_s` 20, `voce_senza_audio_riga_s` 4 (durata stimata di una voce, righe × 4 s, finché non c'è il modulo audio).

**Decisioni prese nel Prompt 1** (piccole, si cambiano facilmente)
- Tasti: PageDown, Freccia destra e Spazio = Avanti; PageUp e Freccia sinistra = Pausa; B o punto = Velo; F = schermo intero; 0-3 = tocchi (solo a mezzanotte); F5 bloccato; Esc non fa niente (chiude solo il pannello). Un tasto tenuto premuto vale una volta sola. Dentro un campo di testo valgono solo PageDown e PageUp, così si possono scrivere le iniziali con la B.
- **Puntino**: bianco quasi invisibile se il comando è stato eseguito, rossastro se non ha fatto niente (per esempio Avanti a mezzanotte senza tocchi).
- **Avanti a mezzanotte senza tocchi inseriti non fa niente** (puntino rosso): così i tocchi non si saltano per sbaglio. Si inseriscono con 0-3, dal pannello o, nel Prompt 7, dalla console.
- **Pausa** solo quando gira l'orologio di scena o il timer della porta (morte, atto 1, porta, voto). Ferma anche i tempi interni della fase.
- **Sigillo**: entrando in `sigillo` il timer della porta si ferma, così nessuno perde perché la carta si gira lentamente.
- **±5 minuti**: sull'orologio di scena sposta l'ora (+5 = più vicino a mezzanotte); sulla porta sposta il tempo che resta (+5 = più tempo).
- **Salto a fase**: tornando ad atto 1 o alla porta con l'orologio già finito, si riparte da capo; saltando a `voto` il timer va a 10:00.
- **Dopo una ricarica a metà serata** compare "Tocca per riprendere": serve un tocco o un tasto per riavere audio e schermo intero (regola dei browser). Quel primo tocco non fa altro; il tempo intanto continua a scorrere.
- **Colpevole nel pannello**: nascosto, con "Mostra per 5 secondi", perché il pannello è sullo schermo di tutti. Cambio e sorteggio con doppio tocco. Chiudendo il pannello il suo DOM viene svuotato. Nella schermata di gioco il nome entra nel DOM solo nei `titoli`.
- **Giocatori predefiniti: 12**. Si imposta dal pannello a inizio serata.
- **Badge "PROVA ×10"** rosso in alto a sinistra quando la prova è attiva, così non resta accesa per sbaglio.

**Provato** (Chrome headless su `file://`, tasti veri inviati via DevTools; 63 controlli, due volte di fila, nessun errore né avviso in console): giro completo da avvio a titoli in ×10; codice sbagliato e giusto; manifestazione; pausa con orologio fermo; velo; F5; ricarica in atto 1 e in porta con orologio e timer esatti (scarto sotto 0,1 s); tocchi 0-3 da tastiera; sigillata e attraversata; timer a zero; confessione con Avanti e saltata; colpevole cambiato su tutti gli 8 nei titoli; colpevole mai nel DOM prima dei titoli; reset. Screenshot a 1280×800 leggibili.
**Non provato**: iPad (pressione di 3 s sull'angolo, Wake Lock) e un telecomando vero.

### Prompt 2 — Stile e rituale (22/10/2026)
**Fatto**
- `assets/font/`: Cinzel (titoli), IM Fell English corsivo (voci), Special Elite (macchina da scrivere), Homemade Apple (grafia, file `grafia.woff2`). Scaricati da Google Fonts con l'ok dell'utente, solo il sottoinsieme latino (lettere accentate comprese), 185 KB in tutto. Se un file manca si ripiega su Book Antiqua/Georgia, Gabriola, Courier New, Segoe Script.
- `css/stile.css`: variabili di colore (nero, oro antico, rosso cera, avorio) e di tipografia; dimensioni in vh con un minimo di 28px. Fondo che respira (un bagliore caldo che si allarga e si stringe in 9 s), vignetta, grana leggera animata. Il pannello resta funzionale, con i font di sistema.
- `js/rituale.js` (nuovo): disegna avvio, attesa, verifica, sollievo e pesca. Le altre fasi restano segnaposto in `js/schermo.js`.
- **Attesa**: titolo in oro che affiora, sottotitolo corsivo, tre candele (bianca, rossa, nera) in CSS. Spente hanno un filo di fumo e una fiamma fantasma che trema appena. I due pulsanti, discreti, compaiono dopo 3 s.
- **Verifica**: sotto ogni candela, l'etichetta e il campo delle iniziali. Il controllo parte da solo quando le lettere sono tante quante servono (6 o 4), oppure con Invio. Se giusto, la fiamma si accende con un guizzo e resta accesa (anche tornando in attesa e dopo una ricarica); il campo mostra le iniziali in oro. Se sbagliato, il campo trema e compare il testo in rosso per 5 s.
- **Sollievo**: tre fiamme accese, il fondo si scalda e respira più in fretta, le righe compaiono una per volta (`config.tempi.riga_sollievo_s` = 2,2 s) con dissolvenza lenta dal sfocato.
- **Pesca**: lo schermo ha un breve sussulto di luce ("si incrina"), poi il fondo e le fiamme diventano freddi, azzurrini e quasi fermi; le righe arrivano ogni 3,5 s (`riga_pesca_s`).

**Decisioni**
- Le fiamme a schermo si accendono tutte nel sollievo (le candele vere sono accese) e diventano fredde nella pesca, come presagio. Se l'azzurro è troppo, si cambia in `.candele.fredde` in `css/stile.css`.
- Le righe si mostrano in base al tempo della fase, quindi rispettano pausa, ×10 e ricarica.

**Provato** (Chrome headless su `file://`): a 1920×1080 e 1280×800 niente esce dallo schermo; il testo di gioco più piccolo misura 28,08px a 1080p e 28px a 800; iniziali in disordine e con i punti riconosciute, iniziali sbagliate respinte; la fiamma accesa resta accesa tornando in attesa; sollievo → pesca dopo 8 s. La prova completa del Prompt 1 passa ancora (63 su 63), senza errori né avvisi in console.
**Non provato**: iPad (tastiera a schermo sopra i campi delle iniziali), resa sul televisore o proiettore vero al buio.

### Prompt 3 — Audio, morte, chiave (22-23/10/2026)
**Fatto**
- `content/audio.js` (nuovo): catalogo delle tracce (file, canale, loop, volume di ciascuna), file della confessione, quanto scende la musica sotto la voce (`ducking` 0.4 = −60%), parametri della voce sintetica.
- `js/audio.js` (modulo `Suoni`): quattro canali (ambiente, musica, effetti, voce). Non riceve ordini: a ogni tick guarda fase, tempo della fase e pausa, e mette in onda ciò che deve suonare in quel momento. Dissolvenza incrociata di 8 s per la musica e di 2 s per l'ambiente; la musica scende del 60% mentre parla una voce. La voce segue l'orologio della fase, quindi si ferma in pausa, riparte dal punto giusto e dopo una ricarica riprende a metà frase. Su https (iPad) i volumi passano da Web Audio, perché Safari ignora `audio.volume`; da file:// si usa `audio.volume`. Nel primo tocco ("Inizia" o "Tocca per riprendere") vengono sbloccati 8 lettori, come richiede iPad.
- **Durate delle voci**: lette dai file all'avvio. Se un file manca, sono stimate dalla lunghezza delle righe (`config.tempi.voce_senza_audio`). I passaggi di fase (fine voce 1 → codice, fine voce 2 → porta, fine voce 3 → titoli, fine confessione) usano la durata vera.
- **Sottotitoli**: una riga per volta in basso, con dissolvenza. Usano i tempi `t` se ci sono per tutte le righe, altrimenti si distribuiscono sulla durata del file in proporzione alla lunghezza di ogni riga.
- **Voce mancante**: sottotitoli più voce sintetica italiana (velocità 0.85, tono 0.6), preferendo una voce installata sul computer, che funziona senza rete. Sul PC di prova c'è "Microsoft Cosimo - Italian". In modalità ×10 le voci tacciono e restano solo i sottotitoli.
- **Cosa suona e quando**: attesa → ambiente_attesa; sollievo → sollievo.mp3 (continua nella pesca e si incrina, come da file); morte → blackout subito, possessione e voce 1 dopo i 3 s di nero; codice → atto1_loop; codice giusto → sblocco; manifestazione → sblocco; mezzanotte → 12 rintocchi; risveglio → voce 2; porta → porta_A e, a metà, porta_B; ultimo minuto → battito; sigillata/attraversata → sigillo/attraversamento e la voce dopo 3 s (`voce_finale_dopo_s`); pausa → pausa_loop.
- `js/delitto.js` (nuovo): la fase morte. 3 s di nero; poi le carte coperte (tante quante le carte in gioco) si sollevano a ventaglio e fluttuano, mentre ombre scure scivolano giù fuori dallo schermo; a fine voce le carte scendono e sfumano, compaiono l'orologio di scena e "La chiave è nella sua busta." con il campo del codice. Le animazioni sono agganciate al tempo della fase, quindi una ricarica le riprende dal punto giusto.
- **Codice**: si controlla da solo alla quarta cifra. Se sbagliato: vibrazione dove c'è, il campo trema e si svuota, compare "Non è questa.". Se giusto: atto 1, con le due frasi e il suono di sblocco.
- **Pausa**: velo scuro con "Gli spiriti attendono." e l'orologio (o il timer) fermo e grande; tutte le animazioni si fermano.
- **Pannello, sezione Audio**: "Controlla i file", stato di ogni file (c'è / MANCA / durata), pulsante ▶ per provarlo, quale voce sintetica è disponibile.

**Decisione dell'utente**: se un file manca si prova a caricarlo lo stesso. Chrome scrive in console "Failed to load resource: net::ERR_FILE_NOT_FOUND" per ogni file mancante; non è un errore dell'app e sparisce quando il file c'è.

**Provato** (Chrome headless, copia dell'app con 4 file audio finti): durata della voce letta dal file; ambiente in attesa; blackout subito; voce dopo il nero; ambiente spento sotto la voce; sottotitoli che scorrono sulla durata vera; pausa e ripresa allo stesso punto; atto1_loop a fine voce; ricarica a metà voce che riprende al secondo giusto. La prova completa del motore passa ancora (63 su 63) e in console ci sono solo i "file non trovato" attesi.
**Non provato**: iPad via https (Web Audio, sblocco dei lettori), file mp3 veri, l'equilibrio dei volumi.

### Prompt 4 — Il fascicolo del 1986 (23/10/2026)
**Fatto**
- `assets/carte/`: le 13 carte Rider-Waite del 1909 (pubblico dominio) da Wikimedia Commons, ridotte a 600 px (circa 200 KB l'una). Se un'immagine manca, la carta si disegna in CSS con numero e nome.
- `js/fascicolo.js` + `css/fascicolo.css` (nuovi): l'atto 1. In alto l'orologio di scena; a sinistra il fascicolo con le linguette (giornale, verbale, Grimorio), un documento per volta che si scorre col dito o con le frecce su/giù; a destra il riquadro dei tre obiettivi e la riga dei gettoni. Le linguette lampeggiano finché non le si apre almeno una volta (ricordato nello stato).
- **Documenti in HTML/CSS**: giornale (carta ingiallita, testata, titolone, due colonne, alone di tazza, riquadro su Ada); verbale (battuto a macchina, margine rosso, righe azzurre, timbro rosso inclinato); Grimorio (quaderno seppia con la cucitura, introduzione, riga dei semi, una pagina per ogni carta in gioco più la Morte, con immagine, numero, elemento, simboli). Su tutti: piega a metà, righe e tremolio VHS leggeri.
- Dopo il codice: "Lei vi ha lasciato tutto." (4 s), poi "Ciò che vi serve è sotto i vostri piatti." grande (10 s), poi il fascicolo.
- **Manifestazione** (Avanti in atto 1): la luce vacilla in modo irregolare per 3 s, suono di sblocco, poi "Lo spirito vuole mostrarvi qualcosa." grande al centro per 6 s. Non cambia fase.
- Testo aggiunto: `fascicolo...verbale.timbro` ("Stazione di Colle · Archiviato").
- `Fascicolo.crea(contenitore)` costruisce il visore dei documenti: lo riusa il cassetto della porta (Prompt 5).

**Provato**: a 1920×1080 e 1280×800 tutti i testi dei documenti sono almeno a 28px; 13 carte caricate; le frecce scorrono; la manifestazione non cambia fase; console pulita.

### Prompt 5 — Mezzanotte, la porta, il finale (23/10/2026)
**Decisioni prese da solo** (l'utente ha chiesto di andare avanti fino alla fine decidendo in autonomia):
- **Voce 3b**: l'ultima riga diventa "La lettera sul tavolo l'aveva scritta {arcano}. Vi ha chiesto aiuto, e glielo avete dato." (stessa logica della 3a). Il "Grazie" della seconda riga è rimasto: da rileggere.
- **Tocchi nei titoli**: `testi.titoli.tocchi` ora ha una frase per ogni N (0-3), niente più "1 tocchi".

**Fatto**
- `js/porta.js` + `css/porta.css` (nuovi).
- **Mezzanotte**: "Mezzanotte." e le carte in gioco coperte che si girano una per rintocco (ogni 3,3 s, agganciate al tempo della fase); sotto, "Lo spirito legge…", poi la frase dei tocchi per 8 s, poi "Raccontate." in oro. Avanti (solo con i tocchi inseriti) → voce 2.
- **Risveglio**: voce 2 con sottotitoli; la porta affiora piano dal buio.
- **La porta**: timer enorme (decimi nell'ultimo minuto, rosso e pulsante), nome del round sotto, arco gotico a sesto acuto in HTML/CSS con cornice d'oro, due ante borchiate che respirano e si aprono di 1/6 a ogni scatto di 10 minuti, luce fredda e bagliore che crescono. Prima "Aprite le vostre buste." (6 s, `config.tempi.buste_s`), poi il round iniziale (15 s), poi a ogni scatto la riga di `testi.porta.scatti` per 20 s. Al minuto 30 (metà) un rintocco, la musica passa da porta_A a porta_B e lo schermo si abbassa per 60 s (`scuro_s`). A ogni scatto porta_scatto.mp3; a 10:00 tre rintocchi.
- **Cassetto**: linguetta "Il fascicolo" sul bordo destro, apre giornale, verbale e Grimorio sopra la porta; non si scurisce con lo schermo.
- **Voto**: timer rosso, riga del sigillo fissa, pulsante "Abbiamo nominato qualcuno".
- `js/finale.js` (nuovo). **Sigillo**: griglia delle carte in gioco con le immagini; un tocco seleziona, il secondo conferma (6 s per confermare). Il timer è fermo.
- **Sigillata**: le ante si chiudono di colpo, la luce si spegne, la porta trema, una fessura d'oro sigilla; dopo 3 s la voce 3a. **Attraversata**: le ante si spalancano, lampo di luce, una figura scura entra nella luce e svanisce; voce 3b.
- **Titoli**: la carta del colpevole grande e "Chi vi osserva dalle carte era …". Avanti entro 20 s → "La confessione" con le righe di `segreto.js` (voce 4, o sottotitoli); altrimenti si va avanti. Poi, una riga ogni 5 s (`riga_titoli_s`): il sospetto, i tocchi, la Morte che si rialza, "Buona notte di Ognissanti."
- Testi aggiunti: `testi.porta.cassetto`, `testi.porta.chiudi_cassetto`, `testi.titoli.confessione`.
- `schermo.js` ora non ha più segnaposto: ogni fase ha la sua schermata.

**Provato**: tutte le schermate a 1920×1080 e 1280×800, niente fuori dallo schermo, testo minimo 28px; prova completa ×10 (63 su 63) aggiornata alle schermate nuove; console pulita (a parte i file audio mancanti).

### Prompt 6 — Robustezza, offline, prova generale (23/10/2026)
**Fatto**
- `sw.js` (nuovo): service worker registrato solo quando l'app è servita via http(s) (su file:// non parte e non dà errori). **Diverso dal modello**: all'installazione scarica *tutto* (codice, contenuti, font, carte e tutti gli audio elencati in `content/`), così anche una traccia mai suonata c'è offline; i file mancanti si saltano. Poi: prima la rete (3 s) per codice e testi, prima la cache per immagini, font e audio; richieste Range servite dalla copia in cache (Safari/iPad). Il nome della cache ha una versione (`tarocchi-maledetti-v1`): le vecchie si cancellano.
- Pannello, sezione Schermo: "Pronto offline: N file in memoria".
- `README.md` (nuovo): aprire da PC, pubblicare su GitHub Pages, iPad offline, regia dal telefono, aggiungere gli audio, dove sono i testi.
- `docs/SERATA.md` (nuovo): la scheda da stampare per il master (checklist di preparazione, tasti, fase per fase, cosa fare se qualcosa va storto).
- Nessun `console.log` nel codice; il colpevole non viene mai stampato.

**Provato offline** (Chrome, app servita da localhost): dopo il primo caricamento 46 file in cache (compresi gli audio mai suonati); con il server spento la pagina riparte, il font c'è, la voce 1 si legge dalla cache con le richieste Range (durata 8 s giusta), le carte si vedono.
Nota per chi prova: il Chrome avviato dalla sandbox di Claude Code ha la Cache Storage rotta ("Unexpected internal error"); con un profilo in una cartella normale funziona. Non è un problema dell'app.

### Prompt 7 — Regia dal telefono (23/10/2026)
**Fatto**
- `js/cripta.js`, `js/ponte.js` (riscritti dal modello): canale su ntfy.sh, topic = hash del codice, messaggi AES-GCM con l'ora, scartati se più vecchi di 5 minuti, `cache=no`, errore chiaro sul limite (429). In più: il collegamento si considera caduto anche se la rete sparisce senza errori (eventi online/offline del browser, e segno di vita di ntfy assente da 75 s).
- `js/collegamento.js` (lato schermo): con un codice salvato si collega da solo, anche da file:// e dopo ogni ricarica. Accetta solo i comandi della tabella di SPEC-v3 §2 (avanti, pausa, velo, tocchi, sigillo, confessione, vai_a, orologio, volume) e li passa a `Regia.comando(…, 'console')`, uno alla volta. Manda lo stato solo quando cambia (fase, sottofase, pausa, velo, ±5, velocità, comando ricevuto, con l'esito), mai il colpevole; orologio e timer li calcola il telefono.
- Pannello: sezione "Regia dal telefono" (crea codice, link della console con "Copia", nuovo codice con conferma, scollega, stato del collegamento, messaggi mandati). Il codice compare solo lì.
- `content/config.js`: `url_pubblico` (vuoto: **da riempire** con l'indirizzo di GitHub Pages; finché è vuoto il pannello mostra il codice da aggiungere a mano dopo `regia.html#`).
- `regia.html` + `js/console.js` + `css/regia.css` + `content/console.js` (nuovi): la console SPEC-v3 §5. In alto fase, orologio o timer calcolati in locale, IN PAUSA / VELO NERO / PROVA ×10, ultimo segnale dallo schermo, "Verifica". Al centro un Avanti enorme che dice cosa farà, poi Pausa e Velo. Pannelli solo quando servono: tocchi 0-3 a mezzanotte, griglia delle carte (due tocchi) al sigillo, confessione nei titoli. In fondo, ripiegati: ±5 minuti e salto di fase (due tocchi), volume. Fascia rossa "Rete assente: usa il telecomando." quando cade la rete; avviso se l'audio dello schermo è bloccato.

**Criteri SPEC-v3 §7**
1. Senza rete, il solo telecomando: ✔ (schermo offline: PageDown fa cadere la Morte; prova completa del motore senza console).
2. Ogni comando dalla console ha lo stesso effetto: ✔ avanti, pausa, velo, ±5, salto di fase, tocchi, sigillo, confessione (provati uno per uno con il canale vero). Volume non provato a orecchio.
3. Telecomando e console insieme: ✔ (pausa dal telecomando vista dalla console e tolta dalla console).
4. Ricaricando lo schermo la console si ricollega e mostra la fase giusta: ✔ (provato con il canale vero).
5. Meno di 100 messaggi in una prova ×10: ✔ 17 messaggi dallo schermo.
6. Il codice non compare sullo schermo fuori dal pannello: ✔.
**Attenzione al limite di ntfy.sh**: dopo molte prove di fila dallo stesso indirizzo il servizio risponde 429 (troppi messaggi) per qualche minuto. Una serata ne usa poche decine; evitare di fare prove a raffica il giorno stesso.

Messaggi arrivati in ordine inverso: la console tiene sempre lo stato più recente (timestamp dello schermo).

## Criteri di accettazione (SPEC §10, SPEC-v2 §6) — esito al 23/10
1. Doppio clic su `index.html`, niente errori in console: ✔. Unica eccezione voluta: "file non trovato" per ogni audio che manca (decisione dell'utente).
2. Prova completa ×10 da avvio a titoli senza toccare il pannello dopo l'impostazione: ✔. Solo tastiera, 10,4 minuti reali, mezzanotte e voto arrivati da soli.
3. Ricarica in qualunque fase, stessa fase e tempi giusti (±1 s): ✔. Scarto misurato sotto 0,1 s in atto 1 e porta; voce ripresa al secondo giusto.
4. Colpevole su ognuno degli 8: il nome nel finale cambia: ✔.
5. Il colpevole non è mai mostrato né nel DOM prima del finale: ✔ (controllato in ogni fase; il pannello lo tiene nascosto; la console non lo riceve).
6. Tolta una traccia audio, la fase va avanti con i sottotitoli: ✔ (oggi mancano tutte).
7. iPad offline in modalità aereo: provato su Chrome con l'app servita da localhost e il server spento ✔; **su iPad non provato**.
8. Niente testo di gioco sotto i 28px a 1080p: ✔ in tutte le schermate (anche a 1280×800).
- SPEC-v2: tocchi 0-3 nei titoli con la frase giusta ✔; Avanti in atto 1 = manifestazione senza cambiare fase ✔.

### Pubblicazione (26/10/2026)
- Repository pubblico **Ghegg3r/lanterna-1030** (nome anonimo apposta), ramo `main`; GitHub Pages su `main` / root.
- App: https://ghegg3r.github.io/lanterna-1030/ — console: `…/regia.html#<codice>` (il link completo è nel pannello).
- `url_pubblico` impostato. `.gitignore` esclude `.claude/` e `docs/riferimenti/` (codice di un altro progetto).
- Provato su Chrome via https: service worker attivo, 48 file in cache, cifratura disponibile, schermo e console collegati sul canale, Avanti dal telefono fa cadere la Morte; console pulita (a parte i 404 degli audio che mancano).
- Per aggiornare il sito: modificare i file, poi `git add -A`, `git commit -m "…"`, `git push`. Pages si aggiorna in un paio di minuti.
- Attenzione: essendo pubblico, `content/segreto.js` e `docs/STORIA.md` sono leggibili da chi trova il repository.

### Bilanciamenti di gioco (28/10/2026)
L'utente ha aggiornato i PDF (00 Guida del master, 05 Schede, 06 Inserti e carte, 07 Foglio d'indagine nuovo) e i testi:
- voce 1 (blackout): due righe nuove, la Morte resta come spirito muto e ogni domanda ha un prezzo;
- presentazioni: ognuno dichiara un arcano (`testi.porta.round_iniziale`);
- giro di mezzanotte (`testi.porta.giro_spirito`, SPEC-v2 §3).
**Fatto nell'app**: nuova fase `giro` tra la voce 2 e la porta. Mostra "Aprite le vostre buste." per 6 s (`buste_s`), poi "Lo spirito passa tra voi." sopra la porta in penombra, con il bordone d'attesa basso. Il timer parte solo con Avanti (telecomando, pannello o telefono: "Avanti: parte il timer della porta"). La porta comincia direttamente con le presentazioni. Aggiornati `SERATA.md` e il test completo (66 su 66).

## Da fare
Niente dei prompt.
- **Voci: fatte** (28/10). Le 6 voci sono in `assets/audio/`, generate con VoiceStudio e `strumenti/genera-voci.mjs` (effetto "spirito", scelto dall'utente); tempi dei sottotitoli in `content/tempi-voci.js`, usati dall'app. Durate: voce 1 70 s, voce 2 124 s, 3a 30 s, 3b 28 s, confessioni 33/32 s. Test completo 66 su 66. Testo della 3b reso neutro: "{arcano} ha attraversato…" (prima "è passato", sbagliato con la Stella).
- **Da fare**: musiche (Suno) ed effetti, vedi `docs/AUDIO.md`.

## Da provare a mano
- Con il telecomando vero: quali tasti manda (PageDown/PageUp/B o altri). Se ne manda di diversi, si aggiungono in `js/regia.js`, funzione `tasto`.
- Su iPad: 3 secondi sull'angolo in alto a destra aprono il pannello; schermo intero; lo schermo non si spegne.
- Su iPad, in verifica: la tastiera a schermo non deve coprire i campi delle iniziali in modo fastidioso.
- Su iPad via GitHub Pages: "Pronto offline" nel pannello, poi modalità aereo e riapertura; l'audio deve suonare.
- Con il telefono vero: console dal link https, rete cellulare, ogni pulsante; poi senza rete, solo telecomando.
- I volumi delle tracce quando ci saranno gli audio (`content/audio.js`).
- Sullo schermo vero, al buio, da un metro e mezzo: le candele spente si vedono? Il titolo si legge? Le fiamme fredde della pesca sono troppo azzurre?
