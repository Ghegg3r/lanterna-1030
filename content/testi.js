// Tutti i testi dello schermo. {arcano} = nome del colpevole, {sospetto} = arcano annotato a mezzanotte.
// Le voci hanno "righe": sottotitoli mostrati uno per volta. "t" (secondi dall'inizio) è facoltativo.
window.CONTENT_TESTI = {
  "avvio": {
    "pulsante": "Inizia",
    "riprendi": "Tocca per riprendere"
  },

  "attesa": {
    "titolo": "Chi vi osserva dalle carte",
    "sottotitolo": "Il primo segno è già vicino a voi.",
    "pulsante_verifica": "Verifica i nomi",
    "pulsante_fiamme": "Le fiamme sono accese"
  },

  "verifica": {
    "titolo": "Prima di incidere, ditemi i nomi.",
    "etichette": { "bianca": "La fiamma bianca", "rossa": "La fiamma rossa", "nera": "La fiamma nera" },
    "giusto": "Questi nomi li ricordo.",
    "sbagliato": "Non sono i nomi che ricordo.",
    "chiudi": "Torna"
  },

  "sollievo": {
    "righe": [
      "Le fiamme vi hanno sentito.",
      "Gli spiriti tornano a respirare.",
      "Avete fatto tutto come quella notte. Proprio tutto."
    ]
  },

  "pesca": {
    "righe": [
      "Ora prendete ciò che vi spetta.",
      "Una busta a testa. Una sola.",
      "Tenetela chiusa sul cuore."
    ]
  },

  "audio1": {
    "file": "voce_1_carte_si_svegliano.mp3",
    "righe": [
      { "testo": "Avete acceso le fiamme." },
      { "testo": "Avete pescato." },
      { "testo": "Proprio come loro, nel 1986." },
      { "testo": "Lo sentite? Qualcosa si sta svegliando dentro le buste che stringete." },
      { "testo": "Siamo noi. Abbiamo aspettato quarant'anni." },
      { "testo": "Lui ha guardato. E chi guarda la Morte, stanotte, cade." },
      { "testo": "Non aprite le vostre buste. Non ancora." },
      { "testo": "Aprite soltanto la sua: lui non ne ha più bisogno." },
      { "testo": "A mezzanotte entreremo in voi. Fino ad allora siete ancora voi stessi." },
      { "testo": "Usate quest'ora. Capite perché è caduto." },
      { "testo": "La risposta è nel 1986." }
    ]
  },

  "chiave": {
    "testo": "La chiave è nella sua busta.",
    "segnaposto": "_ _ _ _",
    "sbagliata": "Non è questa.",
    "giusta": "Lei vi ha lasciato tutto."
  },

  "atto1": {
    "obiettivi_titolo": "Entro mezzanotte, consegnate allo spirito:",
    "obiettivi": [
      "Perché è caduto?",
      "Chi era chi nel 1986?",
      "Chi, quella notte, non ha detto di no?"
    ],
    "gettoni": "Ogni domanda allo spirito costa un gettone.",
    "manifestazione": "Lo spirito vuole mostrarvi qualcosa."
  },

  "tocchi": {
    "0": "Lo spirito non vi concede nulla. Cercherete da soli.",
    "1": "Lo spirito vi concede un tocco.",
    "2": "Lo spirito vi concede due tocchi.",
    "3": "Lo spirito vi concede tre tocchi."
  },

  "pausa": {
    "testo": "Gli spiriti attendono."
  },

  "mezzanotte": {
    "titolo": "Mezzanotte.",
    "legge": "Lo spirito legge…",
    "testo": "Raccontate."
  },

  "audio2": {
    "file": "voce_2_la_porta.mp3",
    "righe": [
      { "testo": "È mezzanotte. Siamo dentro di voi." },
      { "testo": "Ascoltate una storia che nel mazzo tutti conoscono." },
      { "testo": "In principio eravamo ventidue, e potevamo solo guardare." },
      { "testo": "C'era una porta: chi la attraversa diventa come voi, per sempre." },
      { "testo": "Ma la porta si apre soltanto se cade la Morte." },
      { "testo": "E la Morte, quando le chiedemmo di scegliere chi di noi potesse passare, rifiutò. Non volle condannare nessuno." },
      { "testo": "Da quella notte il mazzo è diviso." },
      { "testo": "Nel 1986 la Morte non cadde. Stanotte sì." },
      { "testo": "E ora sapete la regola che la nonna aveva cucito nel quaderno: chi l'ha fatta cadere attraversa. Solo lui." },
      { "testo": "Chi ha fatto cadere la Morte ha tradito il patto del mazzo." },
      { "testo": "E se attraversa, si porta via il confine." },
      { "testo": "Voi resterete a metà: né carte né persone, un arcano e un essere umano chiusi nello stesso corpo, per sempre." },
      { "testo": "Se invece lo fermate, lui resterà nel mazzo. Noi torneremo nelle carte, voi tornerete voi stessi, e la Morte si rialzerà." },
      { "testo": "Aprite le vostre buste. Da soli. Guardate chi siete diventati e non mostratelo a nessuno." },
      { "testo": "Potete mentire: lo facciamo da secoli." },
      { "testo": "Uno di voi scoprirà di essere stato lui. Gli altri avranno un'ora per riconoscerlo." },
      { "testo": "Quando lo avrete trovato, nominatelo tutti insieme." },
      { "testo": "La porta si chiude una volta sola: se sbagliate, si spalanca." },
      { "testo": "Il tempo comincia adesso." }
    ],
    "dopo": "Aprite le vostre buste."
  },

  "porta": {
    "round_iniziale": "Le presentazioni. Uno alla volta, dite chi siete.",
    // Nome del round, in piccolo sotto il timer. Chiave = minuti rimasti all'inizio del round.
    "round": {
      "60": "Presentazioni",
      "50": "Notte lunga",
      "20": "Accuse",
      "10": "Sigillo"
    },
    "scatti": {
      "50": "La notte lunga. Ora potete parlare in segreto, e usare i vostri poteri.",
      "40": "Qualcosa spinge dall'altra parte.",
      "30": "Lo spirito cammina tra voi. Uno di voi ricorda più di quanto dovrebbe.",
      "20": "Le accuse. La soglia è aperta a metà.",
      "10": "Il sigillo. Votate: la porta si chiude una volta sola."
    },
    "pulsante_voto": "Abbiamo nominato qualcuno",
    "cassetto": "Il fascicolo",
    "chiudi_cassetto": "Chiudi"
  },

  "sigillo": {
    "titolo": "Chi avete nominato giri la sua carta.",
    "conferma": "Tocca di nuovo per confermare"
  },

  "sigillata": {
    "file": "voce_3a_sigillata.mp3",
    "righe": [
      { "testo": "La porta si è chiusa." },
      { "testo": "{arcano}, resterai nel mazzo. Per sempre, questa volta." },
      { "testo": "Noi torniamo nelle carte. Voi tornerete voi stessi all'alba, e non ricorderete niente. Quasi niente." },
      { "testo": "E la Morte si rialza." },
      { "testo": "E la lettera che avete trovato sul tavolo… l'aveva scritta {arcano}." }
    ]
  },

  "attraversata": {
    "file": "voce_3b_attraversata.mp3",
    "righe": [
      { "testo": "La porta è aperta." },
      { "testo": "Grazie. Non avrei potuto farlo senza le vostre mani." },
      { "testo": "{arcano} è passato, e ha portato con sé il confine." },
      { "testo": "Voi restate qui, a metà. Per sempre." },
      { "testo": "La lettera sul tavolo l'aveva scritta {arcano}. Vi ha chiesto aiuto, e glielo avete dato." }
    ]
  },

  "titoli": {
    "rivelazione": "Chi vi osserva dalle carte era {arcano}.",
    "confessione": "La confessione",
    "sospetto": "A mezzanotte sospettavate {sospetto}.",
    // Una frase per ogni numero di tocchi (risposte giuste a mezzanotte).
    "tocchi": {
      "0": "Lo spirito non vi aveva concesso nessun tocco.",
      "1": "Lo spirito vi aveva concesso un tocco.",
      "2": "Lo spirito vi aveva concesso due tocchi.",
      "3": "Lo spirito vi aveva concesso tre tocchi."
    },
    "fine": "Buona notte di Ognissanti."
  }
};
