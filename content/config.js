// Configurazione della serata. Modificabile a mano.
window.CONTENT_CONFIG = {
  "pin_pannello": "3013",
  "codice_fascicolo": "1386",

  "orologio_scena": {
    "inizio": "23:10",
    "mezzanotte": "24:00"
  },

  "tempi": {
    "sollievo_s": 8,
    "nero_iniziale_s": 3,
    "porta_min": 60,
    "scatto_min": 10,
    "voto_min": 10,
    "battito_s": 60,
    "riga_scatto_s": 20,
    "crossfade_musica_s": 8,

    "riga_sollievo_s": 2.2,
    "riga_pesca_s": 3.5,
    "chiave_giusta_s": 4,
    "dopo_codice_s": 10,
    "manifestazione_luce_s": 3,
    "manifestazione_testo_s": 6,
    "tocchi_s": 8,
    "round_iniziale_s": 15,
    "buste_s": 6,
    "scuro_s": 60,
    "riga_titoli_s": 5,
    "attesa_confessione_s": 20,
    "voce_finale_dopo_s": 3,
    // Durata di una riga di voce quando manca il file: lunghezza × secondi per carattere, più una pausa.
    "voce_senza_audio": { "secondi_per_carattere": 0.085, "pausa_s": 0.8, "minimo_riga_s": 2.5 }
  },

  "candele": {
    "bianca": ["GR", "SM", "FB"],
    "rossa":  ["MT", "CP", "BL"],
    "nera":   ["SV", "MD"]
  },

  "portanti": ["mondo", "stella", "eremita", "torre", "carro", "amanti", "giustizia", "papessa"],

  "carte_extra_in_ordine": ["diavolo", "luna", "matto", "sole"],
  "giocatori_min": 9,
  "giocatori_max": 12,

  "chiave_storage": "tm_v1_scena",

  // Indirizzo dell'app su GitHub Pages, con la barra finale, es. "https://nome.github.io/tarocchi/".
  // Serve per il link della console del telefono (regia.html). Vuoto = il pannello mostra solo il codice.
  "url_pubblico": "https://ghegg3r.github.io/lanterna-1030/"
};
