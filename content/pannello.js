// Testi del pannello nascosto e dei nomi delle fasi. Li vede solo il master.
window.CONTENT_PANNELLO = {
  "link_avvio": "pannello",

  "pin": {
    "titolo": "PIN del master",
    "apri": "Apri",
    "errato": "PIN errato.",
    "annulla": "Annulla"
  },

  "titolo": "Pannello del master",
  "chiudi": "Chiudi",

  "stato": {
    "fase": "Fase",
    "orologio": "Orologio di scena",
    "porta": "Timer della porta",
    "fermo": "fermo",
    "pausa": "IN PAUSA",
    "velo": "VELO NERO"
  },

  "colpevole": {
    "titolo": "Colpevole",
    "nascosto": "impostato (nascosto)",
    "nessuno": "Nessun colpevole: la serata non va oltre la pesca.",
    "mostra": "Mostra per 5 secondi",
    "scegli": "Cambia colpevole (tocca due volte):",
    "sorteggia": "Sorteggia",
    "impostato": "Colpevole cambiato."
  },

  "giocatori": {
    "titolo": "Giocatori",
    "carte": "Carte in gioco:"
  },

  "tocchi": {
    "titolo": "Risposte giuste a mezzanotte",
    "nessuna": "non ancora inserite"
  },

  "sospetto": {
    "titolo": "Sospetto di mezzanotte (facoltativo)",
    "nessuno": "nessuno"
  },

  "fasi": {
    "titolo": "Salta a fase (tocca due volte)"
  },

  "orologio": {
    "titolo": "Orologio e timer",
    "piu": "+5 minuti",
    "meno": "−5 minuti",
    "nota": "Sposta l'orologio di scena (morte, atto 1) o il tempo che resta alla porta (porta, voto)."
  },

  "prova": {
    "titolo": "Prova generale",
    "attiva": "Tempo ×10: ATTIVO",
    "spenta": "Tempo ×10: spento",
    "nota": "Solo per le prove. Mai durante la serata.",
    "badge": "PROVA ×10"
  },

  "audio": {
    "titolo": "Audio",
    "volume": "Volume generale",
    "controlla": "Controlla i file",
    "prova": "▶",
    "ferma": "■ Ferma",
    "stati": { "ok": "c'è", "mancante": "MANCA", "attesa": "…", "da_controllare": "?" },
    "nota": "Per ogni file che manca, Chrome scrive un errore \"file non trovato\" nella console: è normale finché il file non c'è. Le voci mancanti diventano sottotitoli.",
    "sintetica": "Voce sintetica italiana:",
    "nessuna_sintetica": "nessuna (solo sottotitoli)"
  },

  "schermo": {
    "titolo": "Schermo",
    "intero": "Schermo intero",
    "offline_si": "Pronto offline: {n} file in memoria.",
    "offline_no": "Offline non attivo (serve aprire l'app da GitHub Pages, via https)."
  },

  "regia": {
    "titolo": "Regia dal telefono",
    "crea": "Crea il codice di regia",
    "nuovo": "Nuovo codice (il vecchio smette di funzionare)",
    "dimentica": "Scollega e dimentica il codice",
    "link": "Link della console (aprilo sul telefono prima della serata e salvalo tra i preferiti):",
    "copia": "Copia il link",
    "copiato": "Link copiato.",
    "manca_url": "Manca url_pubblico in content/config.js. Il link sarà: <indirizzo GitHub Pages>regia.html#<codice>. Il codice è:",
    "stati": {
      "spento": "Spenta: nessun codice.",
      "collegamento": "Collegamento in corso…",
      "collegato": "Collegata al canale.",
      "scollegato": "Rete assente: si ricollega da sola. Il telecomando funziona comunque.",
      "senza_cifratura": "Questo browser non può cifrare: regia dal telefono non disponibile."
    },
    "inviati": "Messaggi mandati al telefono da quando lo schermo è aperto: {n}",
    "nota": "Non mostrare il link ai giocatori: chi ce l'ha comanda lo schermo."
  },

  "reset": {
    "titolo": "Reset",
    "pulsante": "Reset completo",
    "conferma1": "Sicuro? Si perde tutta la serata.",
    "conferma2": "Ultima conferma: cancella tutto"
  },

  "conferma": "Tocca di nuovo per confermare",

  // Perché un comando non è stato eseguito.
  "esiti": {
    "colpevole_mancante": "Manca il colpevole: imposta il colpevole prima.",
    "niente": "In questa fase non fa niente.",
    "niente_da_fermare": "Non c'è un orologio o un timer da fermare.",
    "tocchi_mancanti": "Inserisci prima le risposte giuste (0-3).",
    "valore": "Valore non valido.",
    "fase": "Comando non valido in questa fase.",
    "sconosciuto": "Comando sconosciuto."
  },

  "nomi_fasi": {
    "avvio": "Avvio",
    "attesa": "Attesa",
    "verifica": "Verifica dei nomi",
    "sollievo": "Sollievo",
    "pesca": "Pesca delle buste",
    "morte": "La Morte cade",
    "atto1": "Atto 1",
    "mezzanotte": "Mezzanotte",
    "risveglio": "Risveglio (voce 2)",
    "porta": "La porta",
    "voto": "Il voto",
    "sigillo": "Il sigillo",
    "sigillata": "Porta sigillata",
    "attraversata": "Porta attraversata",
    "titoli": "Titoli"
  }
};
