# Regia: telecomando e telefono (v3, 22/10/2026)

Sostituisce SPEC §9 (PeerJS). Prevale su SPEC e SPEC-v2 dove parla di comandi del master.

## 1. L'idea
Il master (Daniele) è "morto" e non tocca il PC davanti a tutti. Ha due modi per comandare lo schermo, e funzionano **insieme**:

| | Telecomando da presentazione | Console sul telefono |
|---|---|---|
| Serve la rete? | no, mai | sì: rete cellulare (nella casa non c'è wifi) |
| Cosa fa | Avanti, Pausa, Velo nero | tutto quello che fa il telecomando, più quello che oggi richiede il pannello o un tocco sullo schermo |
| Cosa vede il master | il puntino di conferma sullo schermo | lo stato della serata sul telefono |
| Se si guasta | resta il pannello nascosto | resta il telecomando |

**Regola assoluta:** se la rete non c'è o cade, l'app funziona identica con il telecomando. La console non deve mai essere necessaria.

## 2. Un solo punto di ingresso per i comandi (da costruire nel Prompt 1)
Telecomando, tastiera, pannello e console chiamano **la stessa funzione**, per esempio `Regia.comando(nome, dati)`. Nessuna logica di gioco nei gestori dei tasti o nella console: solo traduzione in comandi.

| Comando | Effetto | Da dove |
|---|---|---|
| `avanti` | il prossimo passo secondo la fase (SPEC §3, SPEC-v2 §1) | telecomando, console |
| `pausa` | pausa / riprendi orologio o timer | telecomando, console |
| `velo` | velo nero acceso/spento | telecomando, console |
| `tocchi` (N 0-3) | risposte giuste a mezzanotte | tasti 0-3, pannello, console |
| `sigillo` (arcano) | come toccare la carta nella fase `sigillo`, con conferma | schermo, console |
| `confessione` | fa partire la confessione nei titoli | Avanti, console |
| `vai_a` (fase) | salto di fase | pannello, console (con conferma) |
| `orologio` (±5) | sposta orologio di scena o timer | pannello, console |
| `volume` (0-1) | volume generale | pannello, console |

La console è utile soprattutto in tre momenti in cui oggi il master dovrebbe toccare lo schermo: **mezzanotte** (inserire 0-3), **sigillo** (toccare la carta girata) e **confessione**.

## 3. Il canale: ntfy.sh, cifrato
Niente server da tenere acceso, niente PC che fa da "host". Schermo e telefono si scambiano messaggi attraverso **ntfy.sh**, un servizio pubblico gratuito di notifiche (HTTP + EventSource, permette le chiamate da qualunque pagina, anche da `file://`).

Siccome è pubblico:
- un **codice di regia** casuale (128 bit) è l'unico segreto; il nome del canale (topic) è un hash del codice;
- ogni messaggio è **cifrato** con il codice (AES-GCM, SubtleCrypto) e porta un timestamp: quelli più vecchi di 5 minuti si scartano;
- i messaggi non vengono conservati dal servizio (`?cache=no`).

Il servizio gratuito ha un **limite giornaliero di messaggi** (qualche centinaio per indirizzo IP): lo schermo manda il suo stato **solo quando cambia** (cambio di fase, pausa, velo, comando ricevuto), mai a intervalli regolari. Orologio e timer li calcola il telefono a partire dai timestamp ricevuti, come fa già lo schermo.

Codice già scritto e provato, da riusare: `docs/riferimenti/` (vedi il suo README).

## 4. Abbinare telefono e schermo
- Nel **pannello nascosto**: "Regia dal telefono" → genera il codice (salvato nel `localStorage` dello schermo), mostra il link della console e lo stato del collegamento. "Nuovo codice" invalida il vecchio.
- Il link della console è `{url_pubblico}regia.html#<codice>`: la console va aperta da GitHub Pages (https), perché sul telefono la cifratura richiede una pagina sicura. `url_pubblico` va in `content/config.js`.
- Lo schermo può essere aperto da `file://` o da GitHub Pages: in entrambi i casi parla con ntfy.sh.
- Il master apre il link sul telefono **prima della serata** e lo salva tra i preferiti. Nessun QR sullo schermo: lo vedrebbero tutti.

## 5. La console (`regia.html`)
- Mobile, scura, pulsanti grandi, usabile con una mano e al buio (stessa palette dell'app).
- In alto: fase attuale, orologio di scena o timer della porta (calcolati in locale), pausa sì/no, velo sì/no, "ultimo segnale dallo schermo alle hh:mm:ss" e un pulsante "Verifica" che chiede allo schermo il suo stato.
- Al centro, un pulsante enorme **Avanti** con scritto cosa farà ("Avanti: la Morte cade", "Avanti: manifestazione", "Avanti: voce 2"…), più Pausa e Velo.
- Pannelli che compaiono solo nella fase giusta: tocchi 0-3 a mezzanotte, griglia delle carte in gioco al sigillo, confessione nei titoli.
- In fondo, ripiegati: salto di fase e orologio ±5 (con conferma).
- La console **non** mostra mai il colpevole (il master lo sa già; un telefono si può guardare da sopra la spalla).
- Se la rete cade, lo dice in modo evidente e ricorda "usa il telecomando".

## 6. Fuori da questa versione
- Il voto dei giocatori dal telefono (`voto.html` di SPEC §9): richiederebbe di dare ai giocatori un codice che non deve comandare lo schermo. Si valuta solo dopo la prova generale.

## 7. Criteri di accettazione
1. Senza rete: l'app intera va da `avvio` a `titoli` con il solo telecomando, senza errori in console.
2. Con rete: ogni comando della tabella §2 dalla console ha lo stesso effetto del tasto o del tocco corrispondente.
3. Telecomando e console usati insieme non si contraddicono (lo stato vero è sempre quello dello schermo).
4. Ricaricando lo schermo, la console si ricollega da sola e mostra la fase giusta.
5. In una prova completa ×10 lo schermo manda meno di 100 messaggi.
6. Il codice di regia non compare mai sullo schermo fuori dal pannello.
