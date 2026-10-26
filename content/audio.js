// Tracce audio (i file stanno in assets/audio/, elenco in docs/ASSETS.md).
// "canale": ambiente | musica | effetti. "volume" da 0 a 1, per bilanciare le tracce tra loro.
// Se un file manca, l'app va avanti: le voci diventano sottotitoli (e voce sintetica, se c'è).
window.CONTENT_AUDIO = {
  "cartella": "assets/audio/",

  "tracce": {
    "ambiente_attesa": { "file": "ambiente_attesa.mp3", "canale": "ambiente", "loop": true,  "volume": 0.6 },
    "sollievo":        { "file": "sollievo.mp3",        "canale": "musica",   "loop": false, "volume": 0.9 },
    "blackout":        { "file": "blackout.mp3",        "canale": "effetti",  "loop": false, "volume": 1 },
    "possessione":     { "file": "possessione.mp3",     "canale": "effetti",  "loop": false, "volume": 0.6 },
    "atto1_loop":      { "file": "atto1_loop.mp3",      "canale": "ambiente", "loop": true,  "volume": 0.5 },
    "pausa_loop":      { "file": "pausa_loop.mp3",      "canale": "ambiente", "loop": true,  "volume": 0.5 },
    "sblocco":         { "file": "sblocco.mp3",         "canale": "effetti",  "loop": false, "volume": 0.9 },
    "rintocco":        { "file": "rintocco.mp3",        "canale": "effetti",  "loop": false, "volume": 1 },
    "mezzanotte_12":   { "file": "mezzanotte_12.mp3",   "canale": "effetti",  "loop": false, "volume": 1 },
    "porta_A":         { "file": "porta_A.mp3",         "canale": "musica",   "loop": true,  "volume": 0.6 },
    "porta_B":         { "file": "porta_B.mp3",         "canale": "musica",   "loop": true,  "volume": 0.6 },
    "porta_scatto":    { "file": "porta_scatto.mp3",    "canale": "effetti",  "loop": false, "volume": 1 },
    "battito":         { "file": "battito.mp3",         "canale": "ambiente", "loop": true,  "volume": 0.8 },
    "sigillo":         { "file": "sigillo.mp3",         "canale": "effetti",  "loop": false, "volume": 1 },
    "attraversamento": { "file": "attraversamento.mp3", "canale": "effetti",  "loop": false, "volume": 1 }
  },

  // I file delle voci 1, 2, 3a e 3b sono in testi.js; qui quelli della confessione (segreto.js).
  "confessione": {
    "sigillata": "voce_4_confessione_sigillata.mp3",
    "attraversata": "voce_4_confessione_attraversata.mp3"
  },

  // Quanto scende la musica (e l'ambiente) mentre parla una voce: 0.4 = scende del 60%.
  "ducking": 0.4,

  // Voce sintetica, usata solo se manca il file di una voce e il computer ha una voce italiana.
  "voce_sintetica": { "lingua": "it", "velocita": 0.85, "tono": 0.6 }
};
