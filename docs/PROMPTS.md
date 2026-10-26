# Prompt per l'AI che sviluppa l'app

**Come si usa.** Apri la cartella `Cena con delitto app` con Claude Code (o Cursor / Antigravity). Il file `CLAUDE.md` viene letto da solo; con altri strumenti incollalo come primo messaggio. Poi lancia un prompt alla volta, **in ordine**, e prova ogni pezzo prima del successivo. Una sessione nuova per prompt va benissimo: lo stato sta in `docs/STATO.md`.

Tempo stimato: 1-2 sere per i prompt 1-5, una sera per il 6. Il 7 solo se avanza tempo.

**Aggiornamento v3 (22/10).** Il Prompt 0 è fatto: risultati e decisioni in `docs/STATO.md`, da leggere prima di ogni prompt. La regia dal telefono è prevista (`docs/SPEC-v3-regia.md`): il Prompt 7 non è più facoltativo, e il Prompt 1 deve già costruire l'unica funzione di comando.

**Aggiornamento v2 (21/10).** I prompt 4 e 5 vanno letti insieme a `docs/SPEC-v2-modifiche.md`: il fascicolo sullo schermo ha una parte sola, l'atto 1 mostra gli obiettivi, la mezzanotte chiede le risposte giuste, l'atto 2 annuncia i round.

---

## Prompt 0 — Valuta prima di costruire
```
Leggi CLAUDE.md, docs/GIOCO.md, docs/STORIA.md, docs/SPEC.md, docs/SPEC-v2-modifiche.md e tutti i file in content/.
Non scrivere ancora codice.

1. Riassumimi in 10 righe cosa deve fare lo schermo durante la serata, fase per fase.
2. Valuta l'architettura. La proposta è HTML + CSS + JavaScript vanilla che parte con doppio clic da file://,
   senza build. Confrontala con almeno due alternative (per esempio React con Vite e build statica,
   oppure una PWA servita da un piccolo server locale) su: rischio la sera stessa senza wifi, tempo di sviluppo
   in 3-4 sere, facilità di correggere un testo all'ultimo minuto, animazioni e audio.
   Dimmi cosa consigli e perché. Se consigli di cambiare, dimmi cosa cambia in CLAUDE.md.
3. Elenca i dubbi o le contraddizioni che trovi nei documenti, con la tua proposta per ciascuno.
Aspetta il mio ok prima del prompt 1.
```

## Prompt 1 — Motore e regia
```
Leggi CLAUDE.md e docs/SPEC.md per intero, e tutti i file in content/.

Costruisci l'impalcatura e il motore, con schermate segnaposto (solo il nome della fase al centro):
- index.html che carica content/*.js e poi js/*.js con tag <script> normali (deve girare da file://).
- js/stato.js: macchina a stati con tutte le fasi di SPEC §2. Salvataggio in localStorage a ogni cambio, ripristino al caricamento. Orologio di scena e timer calcolati da timestamp, con supporto a pausa e alla modalità prova ×10.
- js/regia.js: un'unica funzione Regia.comando(nome, dati) con tutti i comandi di SPEC-v3-regia §2. Tasti del telecomando come in SPEC §3, tradotti in comandi; il tasto Avanti dipende dalla fase. Puntino di conferma nell'angolo. Il pannello userà la stessa funzione.
- js/pannello.js: pannello nascosto (Ctrl+Shift+M o 3 secondi sull'angolo in alto a destra, PIN da config). Tutte le funzioni di SPEC §3 e SPEC-v2 §4: colpevole (predefinito da content/segreto.js, scelta e sorteggio), numero giocatori, risposte giuste a mezzanotte, sospetto di mezzanotte, salto a fase, ±5 minuti, prova ×10, reset. Il colpevole non va offuscato (vedi STATO.md).
- Schermata di avvio con "Inizia": sblocca l'audio, tutto schermo, Wake Lock.

Niente grafica per ora: sfondo nero, testo bianco. Crea docs/STATO.md.
Alla fine dimmi come fare una prova completa ×10 da avvio a titoli usando solo la tastiera.
```

## Prompt 2 — Stile e rituale
```
Ora lo stile e le prime fasi.

1. css/stile.css: le variabili di colore e tipografia descritte in CLAUDE.md. Font locali da assets/font (se mancano, ripiega su serif di sistema). Sfondo che "respira" piano. Grana leggera.
2. Fase attesa: titolo, tre fiamme spente disegnate in CSS o SVG che tremano appena, i due pulsanti discreti.
3. Fase verifica: tre campi per le iniziali, controllo tollerante come da SPEC §4. Una fiamma giusta si accende sullo schermo e resta accesa.
4. Fasi sollievo e pesca: righe che compaiono una per volta, con dissolvenza lenta.

Prova su 1920x1080 e su 1280x800: niente testo di gioco sotto i 28px su 1080p.
```

## Prompt 3 — Audio, morte, chiave
```
Ora l'audio e il delitto.

1. js/audio.js: mixer a 4 canali (ambiente, musica, effetti, voce) con crossfade e "ducking" della musica durante la voce. Se un file manca: niente errori, sottotitoli a schermo e speechSynthesis in italiano (rate 0.85, pitch basso) se disponibile.
2. Sottotitoli delle voci: righe da content/testi.js, a tempo con "t" oppure distribuite in modo uniforme sulla durata del file.
3. Fase morte: nero di 3 s, blackout.mp3, audio 1 con sottotitoli, animazione di possessione (carte coperte che si sollevano e ombre che scivolano fuori dallo schermo verso il basso). L'orologio di scena parte all'inizio di questa fase, all'ora di config.orologio_scena.inizio (23:10).
4. Campo del codice: 4 cifre, codice da config. Errore: vibrazione e testo "Non è questa." Giusto: si sblocca la parte 1 del fascicolo e si va in atto1 (per ora segnaposto).
5. Pausa: sovrapposizione con orologio fermo, dal telecomando.
```

## Prompt 4 — Il fascicolo del 1986
```
Ora il fascicolo, SPEC §5 come modificato da SPEC-v2-modifiche §1: una parte sola (giornale, verbale, Grimorio),
riquadro degli obiettivi sempre visibile, tasto Avanti = manifestazione. Ignora i punti 3 e 5 qui sotto.

1. Linguette dei documenti sbloccati in alto, un documento per volta, scorrimento con dito e frecce.
2. Disegna in HTML/CSS i tre tipi di documento: giornale, verbale, grimorio. Devono sembrare oggetti veri: carta, macchie, piegature, timbro, cucitura. Grana VHS leggera.
3. Nel diario sostituisci {A} con indizio_A dell'arcano colpevole. Non deve distinguersi in nessun modo dalle altre righe. Il testo del colpevole non deve essere nel DOM prima che la parte 2 sia sbloccata.
4. Grimorio: una pagina per ogni arcano in gioco (dal numero di giocatori nel pannello) più la Morte, con immagine (assets/carte/id.jpg, o carta in CSS se manca), numero, elemento, simboli.
5. Sblocco delle parti 2 e 3 dal tasto Avanti, con l'effetto di SPEC §3 e il documento nuovo che lampeggia finché non lo si apre.
6. L'orologio di scena resta sempre visibile in alto. Quando arriva a 24:00 → fase mezzanotte.
```

## Prompt 5 — Mezzanotte, la porta, il finale
```
Ora l'atto 2 e il finale, SPEC §2 fasi 6-10 e §6, con le modifiche di SPEC-v2-modifiche §2-§4:
risposte giuste a mezzanotte e tocchi, round annunciati, schermo più scuro al rintocco.

1. Mezzanotte: dodici rintocchi, carte che si girano, "Raccontate." Il tasto Avanti fa partire l'audio 2 con sottotitoli. A fine audio "Aprite le vostre buste." e parte il timer.
2. La porta: arco gotico in SVG o canvas, luce fredda dietro. Si apre di 1/6 a ogni scatto di 10 minuti con porta_scatto.mp3, e tra uno scatto e l'altro respira. Righe degli scatti da testi.porta.scatti.
3. Musica porta_A, a metà rintocco e crossfade verso porta_B. A 10:00 tre rintocchi, timer rosso, testo del voto e pulsante. Nell'ultimo minuto battito e decimi.
4. Cassetto laterale con fascicolo e Grimorio consultabili durante il timer.
5. Sigillo: griglia delle carte in gioco, doppio tocco per confermare. Esito sigillata o attraversata secondo SPEC §2. Timer a zero senza sigillo → attraversata.
6. Animazioni dei due finali, audio 3a / 3b, poi i titoli con il nome del colpevole e il sospetto di mezzanotte.
```

## Prompt 6 — Robustezza, offline, prova generale
```
Ultimo giro.

1. Service worker che mette in cache tutto quando l'app è servita via https (GitHub Pages). Su file:// non deve dare errori.
   Modello: docs/riferimenti/sw.js (prima la rete per codice e dati, prima la cache per immagini e audio, richieste Range servite dalla cache: senza, Safari su iPad non riproduce l'audio offline).
2. Istruzioni nel README.md per pubblicare su GitHub Pages e per aprire da iPad.
3. Controlla uno per uno i criteri di accettazione di SPEC §10 e scrivi in docs/STATO.md l'esito di ciascuno.
4. Scrivi docs/SERATA.md: una pagina da stampare per il master, con l'ordine dei tasti da premere fase per fase, cosa fare se qualcosa va storto (ricarica, velo nero, salto di fase) e la checklist di setup (volume, wake lock, colpevole impostato, numero giocatori, prova audio).
5. Togli ogni console.log che possa rivelare il colpevole.
```

## Prompt 7 — Regia dal telefono
```
Leggi docs/SPEC-v3-regia.md per intero e docs/riferimenti/README.md.

1. Canale cifrato su ntfy.sh, riscritto a partire da docs/riferimenti/ponte.js e cripta.js.
2. Lato schermo: collegamento al canale quando c'è un codice di regia; i comandi ricevuti passano da Regia.comando();
   lo stato si manda solo quando cambia (SPEC-v3 §3).
3. Pannello: sezione "Regia dal telefono" con generazione del codice, link della console, stato del collegamento, nuovo codice.
   Aggiungi url_pubblico in content/config.js.
4. regia.html: la console di SPEC-v3 §5, con docs/riferimenti/console/ come modello.
5. Prova: telefono e schermo insieme (anche con lo schermo aperto da file://), poi togli la rete e verifica che
   il telecomando faccia tutto. Controlla i criteri di SPEC-v3 §7 e scrivi l'esito in docs/STATO.md.
```
