// Il fascicolo del 1986 sullo schermo (v2, 21/10/2026).
// Il diario di Lucia e la pagina cucita ora sono SOLO di carta: sullo schermo restano giornale, verbale e Grimorio,
// tutti sbloccati insieme dal codice. "tipo" decide l'aspetto grafico.
window.CONTENT_FASCICOLO = {
  "dopo_codice": "Ciò che vi serve è sotto i vostri piatti.",
  "parti": [
    {
      "id": 1,
      "sblocco": "codice",
      "documenti": [
        {
          "id": "giornale",
          "tipo": "giornale",
          "linguetta": "Il giornale",
          "testata": "La Gazzetta della Provincia",
          "data": "Domenica 2 novembre 1986",
          "titolo": "NOTTE DI PAURA IN COLLINA: NOVE RAGAZZI, NESSUN RICORDO",
          "paragrafi": [
            "Li hanno trovati all'alba di sabato nella vecchia casa di Ada F., la cartomante scomparsa in estate. Nove ragazzi tra i 17 e i 19 anni, riuniti per una festa di Halloween. Le candele erano consumate fino in fondo, la corrente saltata, e l'orologio della cucina si era fermato alle 3:17.",
            "Otto di loro (G.R., S.M., F.B., M.T., C.P., B.L., S.V. e M.D.) non ricordano nulla di quanto accaduto dopo la mezzanotte. Uno, C.P., è stato trovato fuori, seduto al volante della propria auto, con le chiavi in mano e il motore spento.",
            "La nona, L.F., nipote della proprietaria, è illesa ma in forte stato di shock. Ai soccorritori ripeteva una sola frase: «Non l'hanno fatto. Hanno detto di no.»",
            "I carabinieri escludono l'uso di sostanze. Il caso è stato archiviato."
          ],
          "riquadro": {
            "titolo": "Il ricordo di Ada",
            "testo": "In paese tutti la conoscevano. Leggeva le carte in cucina, a chiunque bussasse. Ai ragazzi che le chiedevano il mazzo rispondeva sempre allo stesso modo: «Quello no. E mai la notte di Ognissanti.»"
          }
        },
        {
          "id": "verbale",
          "tipo": "verbale",
          "linguetta": "Il verbale",
          "intestazione": "Legione Carabinieri · Stazione di Colle — Dichiarazioni raccolte il 1° novembre 1986",
          "timbro": "Stazione di Colle · Archiviato",
          "voci": [
            { "chi": "M.T.", "testo": "Ricordo solo che a un certo punto è saltata la luce. Poi è mattina." },
            { "chi": "S.M.", "testo": "Abbiamo detto di no. Tutti. Credo. Non so a cosa." },
            { "chi": "F.B.", "testo": "Mi sono svegliato con in mano una torcia accesa. Non so perché: la luce era tornata da un pezzo." },
            { "chi": "C.P.", "testo": "Non so come sono finito in macchina. Volevo andarmene, questo me lo ricordo." },
            { "chi": "M.D.", "testo": "Avevo la testa coperta da un velo. Della nonna di Lucia, credo." },
            { "chi": "G.R.", "testo": "All'inizio abbiamo riso tutto il tempo. Poi nessuno rideva più." },
            { "chi": "B.L.", "testo": "Chiedete a Lucia. Lei ricorda. Io ricordo solo che non volevo stare da sola." },
            { "chi": "S.V.", "testo": "Nessuno ha fatto niente di male. Lo scriva, per favore: nessuno." },
            { "chi": "L.F.", "testo": "Si rifiuta di rilasciare dichiarazioni. Chiede di riavere il mazzo della nonna. Il mazzo non viene trovato." }
          ]
        },
        {
          "id": "grimorio",
          "tipo": "grimorio",
          "linguetta": "Il Grimorio",
          "introduzione": "Dal quaderno di Ada: ciò che ogni carta porta con sé.",
          "semi": "Coppe: acqua · Bastoni: fuoco · Spade: aria · Denari: terra",
          "mostra": "arcani_in_gioco_piu_morte"
        }
      ]
    }
  ]
};
