# Piano degli audio

21 file in tutto, in `assets/audio/`, con esattamente questi nomi (formato mp3).
Tre famiglie, fatte in tre modi diversi:

| Famiglia | Quanti | Come |
|---|---|---|
| **Musiche e atmosfere** | 7 | Suno (strumentali), poi tagliate se serve |
| **Effetti** | 8 | generatore di effetti sonori, o Freesound (licenza CC0) |
| **Voci degli spiriti** | 6 | voce sintetica (skill di sintesi vocale) o registrata, poi riverbero |

Quando un file è pronto basta metterlo nella cartella e caricarlo su GitHub: l'app lo trova da sola.
Nel pannello, sezione **Audio → Controlla i file**, si vede cosa c'è e si prova ogni traccia.
I volumi tra una traccia e l'altra si bilanciano in `content/audio.js`.

---

## 1. Musiche con Suno
Per tutte: **Instrumental** acceso, niente voce. Stile comune da tenere in ogni prompt:
*1980s horror film score, analog synth, dark, slow*. Se esce un brano con un finale netto,
per i loop si tiene un pezzo centrale di 2-3 minuti (Audacity: taglia, dissolvenza di 1 s ai bordi).

| File | Durata | Prompt per Suno (stile) |
|---|---|---|
| `ambiente_attesa.mp3` | 2-3 min, loop | `dark ambient drone, low cello and analog synth pad, distant wind, no melody, no drums, very quiet and sparse, 1980s horror atmosphere, instrumental` |
| `sollievo.mp3` | 15 s | `warm major chord swelling slowly, soft strings and wordless choir, hopeful, then suddenly detuned and dissonant, tape warble, instrumental`. Dal brano si tagliano 15 s: l'accordo si apre nei primi 7-8 s, **si incrina verso l'ottavo secondo** (in quel momento lo schermo passa a "Una busta a testa"). |
| `atto1_loop.mp3` | 2-3 min, loop | `tense investigative underscore, soft pulsing analog synth, distant music box melody, ticking, mysterious, 1980s horror, instrumental, loopable` |
| `pausa_loop.mp3` | 1-2 min, loop | `near silence, soft night wind, faint low hum, very sparse dark ambient, no melody, instrumental`. È la pausa cena: deve quasi non sentirsi. |
| `porta_A.mp3` | 3-4 min, loop | `suspenseful instrumental, low strings ostinato, ticking clock percussion, mysterious and cunning, 80 bpm, 1980s horror synth, loopable` |
| `porta_B.mp3` | 3-4 min, loop | `darker and heavier, ominous low brass and dark choir, slow heartbeat-like drum, building dread, 1980s horror synth, instrumental, loopable`. Arriva a metà dell'atto 2, quando la porta è aperta a metà. |
| `battito.mp3` | 30-60 s, loop | meglio come effetto (vedi sotto); con Suno: `slow human heartbeat only, deep, no music` |

## 2. Effetti — FATTI (28/10)
Da Freesound, solo licenza **CC0** (uso libero, nessuna attribuzione obbligatoria), anteprime HQ, poi tagliati e
uniformati con ffmpeg. Fonti, per riferimento:

| File | Suono originale |
|---|---|
| `blackout.mp3` | "Machine Shutdown", freesound.org/s/207321 (tagliato a 3,5 s) |
| `possessione.mp3` | "Ghostly Whispers", freesound.org/s/316797 |
| `sblocco.mp3` | "Ripping Paper", freesound.org/s/272028 |
| `rintocco.mp3` | "TollBell", freesound.org/s/73678 |
| `mezzanotte_12.mp3` | lo stesso rintocco ripetuto 12 volte, a 1,5 s + 3,3 s × n: cade quando si gira ogni carta |
| `porta_scatto.mp3` | "Hidden Wall Opening", freesound.org/s/243699 |
| `sigillo.mp3` | "door metal big heavy close slam thud echo", freesound.org/s/406197 |
| `attraversamento.mp3` | "magical rising wind", freesound.org/s/403003 (tagliato a 8 s) |
| `battito.mp3` | "SLOW HEARTBEAT", freesound.org/s/249716 |

### Descrizioni originali (per rifarli)
Dal generatore di effetti sonori (descrizioni in inglese funzionano meglio) o da freesound.org con il filtro **CC0**.

| File | Durata | Descrizione |
|---|---|---|
| `blackout.mp3` | 3 s | `deep heavy thud, power cut, electrical hum dying, then a breath of air` |
| `possessione.mp3` | 30-60 s | `whispers in many voices, playing cards rustling and flipping, slow suction whoosh, eerie` |
| `sblocco.mp3` | 2 s | `old paper tearing slowly, then a soft exhaled breath` |
| `rintocco.mp3` | 4 s | `single deep church bell toll, long reverb tail` |
| `mezzanotte_12.mp3` | 40 s | `twelve deep church bell tolls, slow, about 3 seconds apart, reverb` (12 rintocchi in circa 40 s: sullo schermo le carte si girano una ogni 3,3 s) |
| `porta_scatto.mp3` | 3 s | `heavy stone door grinding open a little, deep rumble` |
| `sigillo.mp3` | 4 s | `massive wooden door slamming shut, deep boom, long reverb` |
| `attraversamento.mp3` | 8 s | `strong wind sucked into a void, rising whoosh, then sudden silence` |
| `battito.mp3` | 30-60 s, loop | `slow deep human heartbeat, loopable` |

## 3. Voci degli spiriti — FATTE (28/10)
Generate con VoiceStudio (motore OmniVoice, in locale) e `strumenti/genera-voci.mjs`, effetto scelto: **"spirito"**.
- Spiriti: voce `male, elderly, very low pitch`; confessione della Stella: `female, middle-aged, low pitch`. Velocità 0,78, seme 11.
- Ogni riga è generata da sola, con 1,2 s di pausa tra le righe; i tempi esatti vanno in `content/tempi-voci.js` e l'app li usa per i sottotitoli.
- Effetto: tono più basso (rubberband), eco che arriva prima delle parole (riverbero al contrario), riverbero di stanza in pietra, ombra un'ottava sotto, leggero ondeggiamento.
- **Se cambi un testo delle voci**: apri VoiceStudio e rilancia, dalla cartella del progetto,
  `node strumenti/genera-voci.mjs audio1` (o la voce che hai cambiato; senza nome le rifà tutte). Serve ffmpeg
  (variabile `FFMPEG` con il percorso, se non è nel PATH).

### Note sui testi (originali)
Voce bassa, lenta, un po' di riverbero. I testi sono in `content/testi.js` (voci 1, 2, 3a, 3b)
e in `content/segreto.js` (confessione). Una riga = una frase, con una pausa tra le righe.

| File | Testo | Dove |
|---|---|---|
| `voce_1_carte_si_svegliano.mp3` | 11 righe | `testi.audio1` |
| `voce_2_la_porta.mp3` | 19 righe | `testi.audio2` |
| `voce_3a_sigillata.mp3` | 5 righe | `testi.sigillata` |
| `voce_3b_attraversata.mp3` | 5 righe | `testi.attraversata` |
| `voce_4_confessione_sigillata.mp3` | righe comuni + "E adesso torno a essere solo una luce lontana." | `segreto.confessione` |
| `voce_4_confessione_attraversata.mp3` | righe comuni + "E adesso, finalmente, tocca a me." | `segreto.confessione` |

**Il nome del colpevole nelle voci 3a e 3b.** I testi hanno `{arcano}`. Visto che il colpevole è fisso,
la voce dice semplicemente **"la Stella"** ("Stella, resterai nel mazzo…").
Se un giorno si cambiasse colpevole, i sottotitoli si aggiornano da soli, ma queste due voci andrebbero rifatte.

**Sottotitoli a tempo.** Senza indicazioni, le righe si distribuiscono sulla durata del file in proporzione
alla lunghezza. Quando le voci ci sono, si possono mettere i tempi esatti (`"t"` in secondi) in `testi.js`:
li posso calcolare io dai file, cercando le pause tra una frase e l'altra.

## Dopo
1. Metti i file in `assets/audio/`.
2. Apri `index.html`, pannello → Audio → **Controlla i file**: tutti "c'è".
3. Prova una serata in ×10 e ascolta i volumi; si correggono in `content/audio.js`.
4. Carica su GitHub (`git add -A`, `git commit -m "Audio"`, `git push`).
