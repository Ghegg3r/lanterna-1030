# Modifiche v2 alla specifica (21/10/2026)

Questo file **prevale su `SPEC.md`** dove i due sono in conflitto. Il gioco è stato ridisegnato: lo schermo fa meno cose nell'atto 1 (il fascicolo è quasi tutto di carta) e annuncia i round nell'atto 2.

## 1. Atto 1
- Il codice `1386` sblocca **tutto insieme**: giornale, verbale e Grimorio. Non ci sono più le parti 2 e 3 (diario e quaderno sono solo di carta).
- Dopo il codice, testo grande per 10 secondi: `fascicolo.dopo_codice` ("Ciò che vi serve è sotto i vostri piatti.").
- Sempre visibile, in un riquadro laterale: i **tre obiettivi** (`testi.atto1.obiettivi`) e la riga sui gettoni.
- Il Grimorio mostra anche la riga dei semi (`fascicolo...grimorio.semi`).
- **Tasto Avanti in `atto1`**: non sblocca più documenti. Fa una "manifestazione": la luce dello schermo vacilla per 3 secondi, un suono, e il testo `testi.atto1.manifestazione` per 6 secondi. Il master lo usa prima di dare una visione. Si può premere quante volte si vuole.
- Nessuna riga del diario va più sostituita: il segnaposto `{A}` e il campo `indizio_A` non servono più all'app (restano in `arcani.js`, ignorali).

## 2. Mezzanotte
- Nuovo passaggio, prima di "Raccontate.": schermata **"Il verbale"** visibile solo come "Lo spirito legge…". Il master, dal **pannello**, inserisce il numero di risposte giuste (0-3), oppure con i tasti 0-3 della tastiera quando la fase è `mezzanotte`.
- Lo schermo mostra il testo `testi.tocchi[N]` per 8 secondi, poi "Raccontate.".
- Il numero dei tocchi si salva nello stato e compare nei titoli finali ("Avevate {N} tocchi").

## 3. Atto 2
- Appena parte il timer: `testi.porta.round_iniziale` in grande per 15 secondi.
- Le righe degli scatti ora annunciano i round (`testi.porta.scatti`). Durante ogni round, in piccolo sotto il timer, resta il nome del round: Presentazioni (60-50), Notte lunga (50-20), Accuse (20-10), Sigillo (10-0).
- Al rintocco dei 30 minuti la musica cambia come prima. In più lo schermo si abbassa di luminosità per 60 secondi: è il momento in cui il master cammina tra i giocatori per i tocchi.

## 4. Pannello
- Nuovo campo: **risposte giuste a mezzanotte (0-3)**.
- Il campo "sospetto di mezzanotte" resta, facoltativo.

## 5. Colpevole fisso e confessione (22/10)
- All'avvio, se esiste `window.CONTENT_SEGRETO`, il colpevole predefinito è `CONTENT_SEGRETO.colpevole` ("stella"). Il pannello mostra quale colpevole è attivo e permette di cambiarlo. Il pulsante "Sorteggia" resta ma non serve.
- Nei titoli finali, dopo la voce 3a o 3b, una schermata facoltativa "La confessione": le righe di `CONTENT_SEGRETO.confessione.comune` e poi la riga `sigillata` o `attraversata`, con lo stesso stile delle voci (audio `voce_4_confessione_sigillata.mp3` / `voce_4_confessione_attraversata.mp3` se esistono, altrimenti solo testo). Il master la fa partire con Avanti; se non preme, i titoli vanno avanti da soli dopo 20 secondi.

## 6. Criteri di accettazione aggiuntivi
- Con N = 0, 1, 2, 3 il testo dei tocchi cambia correttamente e compare nei titoli.
- In `atto1` il tasto Avanti produce la manifestazione e non cambia fase.

## 7. Chiarimenti dopo il Prompt 0 (22/10)
Decisi; il dettaglio e le domande ancora aperte sono in `docs/STATO.md`.
- **Codice → atto 1**: dopo il codice giusto si mostra `testi.chiave.giusta` ("Lei vi ha lasciato tutto.") e poi, grande per 10 secondi, `fascicolo.dopo_codice`. La frase dei piatti compare una volta sola.
- **Nomi dei round**: da `testi.porta.round` (chiave = minuti rimasti all'inizio del round).
- **Criterio 4 di SPEC §10**: si controlla solo il nome del colpevole nel finale (il diario è di carta).
- **Criterio 5 di SPEC §10**: `segreto.js` è sempre caricato, quindi il nome sta in memoria. Il criterio diventa: il colpevole non viene mai mostrato né inserito nel DOM prima del finale, e nessun `console.log` lo stampa.
- **Colpevole nel pannello**: niente offuscamento, è già in chiaro in `segreto.js`.
- **Regia dal telefono**: sostituisce SPEC §9, vedi `docs/SPEC-v3-regia.md`.
