# Asset da procurare

Tutto va in `assets/`. Se un file manca, l'app va avanti lo stesso (sottotitoli a schermo, carte disegnate in CSS). Quindi si può sviluppare subito e aggiungere gli asset dopo.

## Font (`assets/font/`, formato woff2)
Da Google Fonts, scaricati e messi in locale (licenza OFL, uso libero):
| Uso | Font proposto | File |
|---|---|---|
| Titoli | Cinzel | `cinzel.woff2` |
| Voci degli spiriti | IM Fell English (corsivo) | `imfell-italic.woff2` |
| Documenti battuti a macchina | Special Elite | `special-elite.woff2` |
| Diario e biglietto | Homemade Apple, o Caveat | `grafia.woff2` |

## Carte (`assets/carte/`, jpg, lato corto almeno 600 px)
Rider-Waite-Smith del 1909, pubblico dominio (scansioni su Wikimedia Commons, categoria "Rider-Waite tarot deck").
`mondo.jpg` `stella.jpg` `eremita.jpg` `torre.jpg` `carro.jpg` `amanti.jpg` `giustizia.jpg` `papessa.jpg` `diavolo.jpg` `luna.jpg` `matto.jpg` `sole.jpg` `morte.jpg`

## Audio (`assets/audio/`, mp3)
Musiche ed effetti: Pixabay (licenza libera) o Freesound (filtro CC0).
| File | Cosa | Durata |
|---|---|---|
| `ambiente_attesa.mp3` | bordone scuro, quasi impercettibile, in loop | 2-3 min, loop |
| `sollievo.mp3` | accordo che si apre, caldo, poi si incrina | 15 s |
| `blackout.mp3` | colpo sordo + soffio | 3 s |
| `possessione.mp3` | sussurri, carte che frusciano, risucchio | 30-60 s |
| `atto1_loop.mp3` | tensione leggera, carillon lontano | loop |
| `pausa_loop.mp3` | quasi silenzio, vento | loop |
| `sblocco.mp3` | carta strappata / respiro | 2 s |
| `rintocco.mp3` | un rintocco di campana grave | 4 s |
| `mezzanotte_12.mp3` | dodici rintocchi | 40 s |
| `porta_A.mp3` | musica "sospettosa", prima metà dell'atto 2 | loop |
| `porta_B.mp3` | più cupa, seconda metà | loop |
| `porta_scatto.mp3` | pietra che si muove, grave | 3 s |
| `battito.mp3` | battito cardiaco | loop |
| `sigillo.mp3` | porta che sbatte, riverbero | 4 s |
| `attraversamento.mp3` | vento che risucchia, poi silenzio | 8 s |

## Voci (`assets/audio/`, mp3)
I testi sono in `content/testi.js` (e nel Copione). Voce bassa, lenta, con un po' di riverbero.
| File | Testo |
|---|---|
| `voce_1_carte_si_svegliano.mp3` | audio 1 |
| `voce_2_la_porta.mp3` | audio 2 |
| `voce_3a_sigillata.mp3` | finale, porta sigillata |
| `voce_3b_attraversata.mp3` | finale, porta attraversata |
| `voce_4_confessione_sigillata.mp3` | confessione della Stella, finale sigillato (`content/segreto.js`), facoltativa |
| `voce_4_confessione_attraversata.mp3` | confessione della Stella, finale attraversato, facoltativa |

Come farle: registrate col telefono in una stanza con le tende, e poi riverbero e un tono più basso con Audacity (gratis). Oppure una voce sintetica italiana. **Il nome dell'arcano non va detto nelle voci 3a e 3b**: lo mostra lo schermo, così basta un file per tutti e 8 i colpevoli.
