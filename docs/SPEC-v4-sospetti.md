# Modifiche v4 (28/10/2026): sospetti di mezzanotte, biglietti, fazioni

Prevale su SPEC, SPEC-v2 e SPEC-v3 dove sono in conflitto. Il gioco di carta è già aggiornato (PDF e Guida del master v2 del 28/10); qui c'è solo quello che cambia sullo schermo.

## 1. Mezzanotte: tocchi 0-2 e tre sospetti
Il verbale di mezzanotte ha ancora tre domande, ma ora:
- le domande 1 e 2 valgono i **tocchi**: da 0 a **2** (non più 3);
- la domanda 3 chiede **tre arcani sospetti**, e la risposta la dà lo schermo.

**Flusso della fase `mezzanotte`** (dopo i dodici rintocchi e "Lo spirito legge…"):
1. Il master inserisce i tocchi (0-2): tasti 0-2, pannello o console. Lo schermo mostra `testi.tocchi[N]` per 8 s, come adesso.
2. Il master inserisce **i tre sospetti**: dalla console (griglia delle carte in gioco, si scelgono tre carte, poi "Conferma") o dal pannello. Comando nuovo nella tabella di SPEC-v3 §2: `sospetti` con `[arcano, arcano, arcano]`, accettato solo in questa fase e solo una volta (il pannello può correggerlo).
3. Lo schermo mostra le tre carte coperte che si girano una alla volta, poi:
   - **se il colpevole è tra le tre**: `testi.sospetti.tra_loro`. Dopo 3 s una delle due carte sbagliate (scelta a caso) si spegne e compare `testi.sospetti.scagionato` con il suo nome. Le due rimaste restano illuminate;
   - **se non c'è**: `testi.sospetti.nessuno`, e tutte e tre si spengono.
4. Poi "Raccontate." e tutto come prima (Avanti → voce 2).

**Dove si vedono dopo:** nell'atto 2, sotto il nome del round, in piccolo: `testi.sospetti.promemoria` con i due sospetti rimasti (se il colpevole era tra i tre). Se non c'era, niente promemoria.

**Titoli:** la riga del sospetto diventa `testi.titoli.sospetti` con i tre nomi indicati. Il vecchio campo "sospetto di mezzanotte" del pannello si toglie: lo sostituisce questo.

**Testi da aggiungere in `content/testi.js`:**
```js
"tocchi": {
  "0": "Lo spirito non vi concede nulla. Cercherete da soli.",
  "1": "Lo spirito vi concede un tocco.",
  "2": "Lo spirito vi concede due tocchi."
},
"sospetti": {
  "titolo": "I vostri sospetti.",
  "tra_loro": "Il colpevole è tra loro.",
  "scagionato": "{arcano} disse di no.",
  "nessuno": "Nessuno di loro. Cercate ancora.",
  "promemoria": "Sospetti: {a} · {b}"
},
// in "titoli":
"sospetti": "A mezzanotte sospettavate {a}, {b} e {c}."
```

## 2. I biglietti per lo spirito (atto 2)
I poteri ora si usano tutti insieme: a 40 minuti dalla fine ognuno consegna al master un biglietto piegato, il master va in un'altra stanza e torna con le risposte. Lo schermo deve solo annunciarlo.
- La riga dello scatto dei **40 minuti** diventa: `"I biglietti. Consegnate allo spirito ciò che chiedete, piegato. Tutti, anche chi non chiede nulla."`
- Il timer **non** si ferma.
- Durante i 5 minuti successivi lo schermo resta in penombra leggera come al rintocco (stesso effetto, durata `config.tempi.biglietti_s` = 300).

## 3. Il Grimorio mostra le fazioni
- In `content/fascicolo.js`, al documento `grimorio` aggiungi:
  `"fazioni": "Da quando la Morte rifiutò di scegliere chi potesse passare la porta, il mazzo è diviso in tre case: i rassegnati della fiamma bianca, i ribelli della fiamma rossa, gli ambigui della fiamma nera. Le altre carte non hanno fiamma."`
  e mostralo sotto l'introduzione.
- Nella pagina di ogni arcano portante, accanto all'elemento, la sua fiamma (`arcani[id].fiamma`: bianca, rossa, nera). Esche, jolly e Morte non hanno fiamma.

## 4. Criteri di accettazione
1. Mezzanotte con tocchi 0, 1, 2: frase giusta; il tasto 3 non fa niente.
2. Sospetti con la Stella dentro: una delle altre due si spegne con la frase giusta, due restano; promemoria visibile nell'atto 2.
3. Sospetti senza la Stella: "Nessuno di loro", nessun promemoria.
4. Ricaricando la pagina dopo i sospetti, il risultato e il promemoria restano uguali (la carta scagionata non cambia a caso).
5. Titoli con i tre sospetti.
6. Scatto dei 40 minuti con il testo dei biglietti e la penombra di 5 minuti.
7. Grimorio con le fazioni.
