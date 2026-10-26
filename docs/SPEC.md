# Specifica funzionale — schermo centrale

Versione 1.0 · 20/10/2026 · Fonte dei testi: `content/testi.js`, `content/fascicolo.js`, `content/arcani.js`, `content/config.js`.

---

## 1. La serata in breve (per capire cosa serve)
1. Gli ospiti arrivano. Sul tavolo c'è una lettera di uno spirito che chiede di rifare un rituale. Lo schermo è in **attesa**.
2. Seguendo tre indovinelli trovano candele, un disegno e delle firme cifrate. Possono verificare le iniziali decifrate **sullo schermo**.
3. Accendono le candele, lo comunicano allo schermo: **falso sollievo**, poi lo schermo dice di prendere una busta a testa.
4. Il master apre la sua e "muore". Preme il telecomando: **blackout, audio, possessione**.
5. Nella busta del morto c'è un codice: sbloccano il **fascicolo del 1986**. Parte un orologio di scena dalle 23:00.
6. Pausa cena (orologio fermo). Poi indagine, con il fascicolo che si sblocca in tre parti.
7. A **mezzanotte** di scena: rintocchi, audio, tutti aprono la propria busta. Parte il **timer della porta**: 60 minuti.
8. Negli ultimi 10 minuti si vota a voce. Il master inserisce l'arcano dell'accusato: lo schermo mostra la porta **sigillata** o **attraversata**, e chi era il colpevole.

## 2. Le fasi (macchina a stati)
Ogni fase ha un `id`, una schermata, gli ingressi che la fanno avanzare e cosa salva. Il passaggio a una fase nuova si salva subito in `localStorage`.

| # | id | Schermata | Avanza con |
|---|---|---|---|
| 0 | `avvio` | Pulsante "Inizia" (sblocca audio, schermo intero, wake lock). Link discreto al pannello | tocco |
| 1 | `attesa` | Titolo "Chi vi osserva dalle carte", tre fiamme spente, musica d'ambiente bassa. Pulsante discreto "Verifica i nomi" e pulsante "Le fiamme sono accese" | tocco dei giocatori |
| 1b | `verifica` | Tre campi (bianca, rossa, nera) dove scrivere le iniziali decifrate. Controllo tollerante (vedi §4). Ogni gruppo giusto accende una fiamma sullo schermo | ritorno ad `attesa` |
| 2 | `sollievo` | Testo del sollievo, musica che si apre. Dopo `config.tempi.sollievo_s` secondi la musica si incrina e compare il testo "prendete una busta" | automatico → `pesca` |
| 3 | `pesca` | Testo "Una busta a testa…", schermo quasi fermo | **telecomando: avanti** (il master cade) |
| 4 | `morte` | Nero per 3 s → audio 1 → animazione di possessione (carte coperte che si sollevano, ombre che scivolano fuori dallo schermo verso il tavolo) → al termine dell'audio compare l'orologio 23:00 e il campo codice. **L'orologio di scena parte all'inizio di questa fase** | codice corretto → `atto1` |
| 5 | `atto1` | Orologio di scena grande in alto. Sotto, il **fascicolo** con le parti sbloccate (vedi §5). Si sfoglia toccando | telecomando o orologio |
| 5p | `pausa` | Sovrapposta a qualunque fase con orologio: orologio fermo, testo "Gli spiriti attendono" | telecomando: pausa/riprendi |
| 6 | `mezzanotte` | Quando l'orologio di scena arriva a 24:00 (o con il pannello): 12 rintocchi, carte che si girano. Testo "Raccontate." e attesa | telecomando: avanti → audio 2 |
| 6b | `risveglio` | Audio 2 con il testo che scorre lento. A fine audio, testo "Aprite le vostre buste." | automatico a fine audio → `porta` |
| 7 | `porta` | Timer 60:00 enorme, la porta disegnata al centro che si apre a scatti ogni 10 minuti, riga di testo per ogni scatto (vedi §6). Fascicolo e Grimorio consultabili in un cassetto laterale | timer |
| 7v | `voto` | Da 10:00 in giù: il timer diventa rosso, compare "Votate". Pulsante grande "Abbiamo nominato qualcuno" | tocco → `sigillo` |
| 8 | `sigillo` | Visibile a tutti: "Chi avete nominato giri la sua carta." Sotto, la griglia degli arcani in gioco: il master tocca quello rivelato. Conferma con un secondo tocco | tocco del master |
| 9a | `sigillata` | Animazione porta che si richiude di colpo, audio 3a, testo con il nome del colpevole | automatico → `titoli` |
| 9b | `attraversata` | Animazione porta che si spalanca, una figura che la attraversa e svanisce, audio 3b, testo con il nome del colpevole | automatico → `titoli` |
| 10 | `titoli` | "Chi vi osserva dalle carte era {arcano}." con la carta grande. Poi la Morte | fine |

Se il timer arriva a 0 senza sigillo → `attraversata`.
Se l'arcano toccato in `sigillo` è il colpevole → `sigillata`, altrimenti → `attraversata`.

## 3. Comandi del master
### Telecomando (i tasti che mandano i presenter comuni)
| Tasto | Effetto |
|---|---|
| PageDown, Freccia destra, Spazio | **Avanti**: esegue il prossimo passo della scaletta (tabella sotto) |
| PageUp, Freccia sinistra | **Pausa / riprendi** l'orologio o il timer |
| B, punto | **Velo nero**: schermo nero istantaneo, ripremi per tornare (emergenza) |
| F5, Esc | ignorati (non devono rompere niente) |

Il tasto **Avanti** non è generico: fa la cosa giusta a seconda della fase.
| Fase attuale | Avanti fa |
|---|---|
| `attesa`, `sollievo`, `pesca` | va a `morte` (il master è caduto) |
| `atto1` con parte 1 visibile | sblocca la parte 2 del fascicolo (con un effetto: luce che vacilla, suono) |
| `atto1` con parte 2 visibile | sblocca la parte 3 |
| `atto1` con parte 3 visibile | niente (l'orologio porta a mezzanotte da solo) |
| `mezzanotte` | parte l'audio 2 |
| altrove | niente |

Ogni pressione mostra per 1 secondo, nell'angolo in basso a destra, un puntino quasi invisibile: serve al master per sapere che il tasto è arrivato.

### Pannello nascosto (Ctrl+Shift+M o 3 s sull'angolo in alto a destra, poi PIN)
- **Colpevole**: scelta tra gli 8 portanti, oppure pulsante "Sorteggia" che mostra il risultato per 5 secondi e poi lo nasconde. Senza colpevole impostato l'app non va oltre `pesca`, e lo dice solo nel pannello.
- **Carte in gioco**: numero di giocatori (9-12) → l'app calcola le carte secondo `config.carte_extra` e le usa per Grimorio e griglia del sigillo.
- **Sospetto di mezzanotte**: campo per annotare l'arcano che il gruppo sospettava (compare nei titoli: "A mezzanotte sospettavate {x}").
- **Salta a fase**: elenco di tutte le fasi.
- **Orologio**: +5 / −5 minuti all'orologio di scena e al timer.
- **Prova**: accelera il tempo ×10 per le prove generali (ben visibile nel pannello, mai durante la serata).
- **Audio**: volume generale, prova di ogni traccia.
- **Reset** completo (con doppia conferma).

## 4. Il rituale sullo schermo
- Verifica delle iniziali: per ogni candela si scrivono le iniziali in qualunque formato ("GR SM FB", "g.r. s.m. f.b.", ordine qualsiasi). Si normalizza (maiuscole, via punti e spazi) e si confronta l'insieme, senza badare all'ordine. Giuste e sbagliate: testi in `testi.verifica`.
- La verifica è facoltativa: "Le fiamme sono accese" funziona anche senza.

## 5. Il fascicolo 1986
- Tre parti (`fascicolo.parti`), ognuna con uno o più documenti. La parte 1 si sblocca con il codice, le altre con il telecomando.
- I documenti sono **pagine disegnate in CSS**:
  - `giornale`: carta ingiallita, testata, colonne, titolo enorme;
  - `verbale`: modulo battuto a macchina, timbro;
  - `diario`: pagina a righe, grafia a mano, qualche parola cancellata;
  - `quaderno`: carta spessa, inchiostro seppia, una cucitura disegnata sul bordo;
  - `grimorio`: una pagina per arcano in gioco, con la carta (immagine), numero, elemento, simboli.
- Nel diario c'è il segnaposto `{A}`: va sostituito con la riga A dell'arcano colpevole (`arcani[colpevole].indizio_A`). Deve sembrare scritta dalla stessa mano delle altre righe.
- Interfaccia: in alto le linguette dei documenti sbloccati, un documento per volta a tutta altezza, scorrimento col dito o con le frecce su/giù. Un documento appena sbloccato lampeggia piano finché qualcuno non lo apre.

## 6. Il timer della porta
- Durata `config.tempi.porta_min` (60). Parte alla fine dell'audio 2.
- La porta: un arco gotico disegnato (SVG o canvas) con luce fredda che filtra. A ogni scatto di 10 minuti si apre di 1/6, con un suono grave. Tra uno scatto e l'altro respira appena.
- A ogni scatto compare la riga di `testi.porta.scatti`, che resta 20 secondi e poi sfuma.
- Musica: traccia A dalla partenza, a metà **rintocco** e crossfade di 8 secondi verso la traccia B, più cupa.
- A 10:00: tre rintocchi, timer rosso, testo del voto, pulsante "Abbiamo nominato qualcuno".
- Nell'ultimo minuto: battito cardiaco sotto la musica, e il timer mostra anche i decimi.
- Pausa possibile dal telecomando (per imprevisti).

## 7. Audio
- Tracce in `assets/audio/`, elenco e nomi in `docs/ASSETS.md`. Se un file manca, l'app non si blocca: mostra il testo corrispondente a schermo, lento, e (se c'è una voce italiana) lo legge con `speechSynthesis` a velocità 0.85 e tono basso.
- Le voci (audio 1, 2, 3a, 3b) hanno i sottotitoli: il testo compare riga per riga, a tempo, da `testi`. I tempi dei sottotitoli si possono dare a mano in `testi` (`t` in secondi) oppure distribuire in modo uniforme sulla durata del file.
- Mixer semplice: ambiente, musica, effetti, voce. Durante la voce la musica scende del 60%.

## 8. Grafica delle carte
- Immagini degli arcani: Rider-Waite-Smith 1909, di pubblico dominio, in `assets/carte/` con il nome `id.jpg` (es. `torre.jpg`). Se manca l'immagine, si disegna una carta in CSS con numero romano e nome.
- Retro della carta comune a tutte, in CSS (motivo a stelle, oro su nero).

## 9. Modulo facoltativo (solo dopo che tutto il resto è finito e provato)
**Regia e voto dal telefono.** Il PC fa da host via WebRTC (PeerJS, server pubblico gratuito) e serve internet: si collega tutto all'hotspot di un telefono.
- `regia.html` sul telefono del master: gli stessi comandi del telecomando, più lo stato attuale.
- `voto.html` per i giocatori (QR code sullo schermo nella fase `voto`): ognuno tocca l'arcano che vuole nominare. Sullo schermo, accanto alla porta, i voti in diretta: la porta trema verso la chiusura quando un nome supera la metà.
- Se la connessione cade, tutto continua a funzionare con il telecomando. Il modulo non deve mai essere necessario.

## 10. Criteri di accettazione
1. Doppio clic su `index.html` → l'app parte in Chrome senza errori in console.
2. Una prova completa in modalità ×10 va da `avvio` a `titoli` senza toccare il pannello dopo l'impostazione iniziale.
3. Ricaricando la pagina in qualunque fase si torna alla stessa fase, con orologio e timer giusti (tolleranza 1 secondo).
4. Con il colpevole impostato su ognuno degli 8 arcani: la riga A del diario e il nome nel finale cambiano di conseguenza.
5. Nessun testo dei giocatori contiene il colpevole prima del finale (controllare anche il DOM nascosto: il nome non deve essere nell'HTML finché non serve).
6. Tolta una traccia audio, la fase corrispondente va avanti lo stesso con i sottotitoli.
7. Su iPad (Safari, servito via https) funziona con la modalità aereo dopo il primo caricamento.
8. Leggibile da un metro e mezzo con le luci spente: nessun testo di gioco sotto i 28 px su 1080p.
