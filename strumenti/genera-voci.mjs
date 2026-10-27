// Genera le voci degli spiriti con VoiceStudio (deve essere aperto) e ffmpeg.
//
//   node strumenti/genera-voci.mjs              → tutte le voci
//   node strumenti/genera-voci.mjs audio1       → solo una (audio1, audio2, sigillata, attraversata,
//                                                 confessione_sigillata, confessione_attraversata)
//
// Ogni riga di testo si genera da sola, poi si montano con una pausa tra l'una e l'altra:
// così i tempi dei sottotitoli sono esatti e finiscono in content/tempi-voci.js.
// Effetto "spirito": tono più basso, eco che arriva prima delle parole, eco dopo,
// un'ombra della voce un'ottava sotto, un leggero ondeggiamento.
// Non fa parte dell'app: serve solo a preparare i file audio.

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import os from 'os';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'http://localhost:3900';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const VOCE_SPIRITI = 'male, elderly, very low pitch';
const VOCE_STELLA = 'female, middle-aged, low pitch';   // la confessione la dice la Stella
const VELOCITA = 0.78;
const SEME = 11;
const SILENZIO_INIZIO = 0.8;   // lascia spazio all'eco che arriva prima delle parole
const PAUSA = 1.2;
const CODA = 2.0;

// --- I testi, letti dai file di content/ come fa l'app ---
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['config', 'arcani', 'testi', 'segreto', 'audio']) {
  vm.runInContext(fs.readFileSync(path.join(RADICE, 'content', f + '.js'), 'utf8'), ctx);
}
const { CONTENT_TESTI: T, CONTENT_SEGRETO: S, CONTENT_ARCANI: A, CONTENT_AUDIO: AU } = ctx.window;
const nome = A[S.colpevole].nome;
const componi = (t) => t.replace(/\{arcano\}/g, nome);
const righe = (l) => l.map((r) => componi(typeof r === 'string' ? r : r.testo));

const VOCI = {
  audio1: { file: T.audio1.file, righe: righe(T.audio1.righe), voce: VOCE_SPIRITI },
  audio2: { file: T.audio2.file, righe: righe(T.audio2.righe), voce: VOCE_SPIRITI },
  sigillata: { file: T.sigillata.file, righe: righe(T.sigillata.righe), voce: VOCE_SPIRITI },
  attraversata: { file: T.attraversata.file, righe: righe(T.attraversata.righe), voce: VOCE_SPIRITI },
  confessione_sigillata: { file: AU.confessione.sigillata, righe: righe(S.confessione.comune.concat([S.confessione.sigillata])), voce: VOCE_STELLA },
  confessione_attraversata: { file: AU.confessione.attraversata, righe: righe(S.confessione.comune.concat([S.confessione.attraversata])), voce: VOCE_STELLA }
};

function ff(args) { execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] }); }

async function genera(testo, voce, uscita) {
  // VoiceStudio a volte chiude la connessione: si riprova qualche volta prima di arrendersi.
  for (let tentativo = 1; ; tentativo++) {
    try {
      const corpo = new FormData();
      for (const [k, v] of Object.entries({ text: testo, language: 'it', instruct: voce, speed: VELOCITA, num_step: 32, effect_preset: 'raw', seed: SEME })) corpo.append(k, String(v));
      const r = await fetch(API + '/generate', { method: 'POST', body: corpo });
      if (!r.ok) throw new Error('VoiceStudio: ' + r.status + ' ' + (await r.text()).slice(0, 200));
      fs.writeFileSync(uscita, Buffer.from(await r.arrayBuffer()));
      return parseFloat(r.headers.get('x-audio-duration'));
    } catch (e) {
      if (tentativo >= 4) throw e;
      await new Promise((ok) => setTimeout(ok, 3000 * tentativo));
    }
  }
}

async function voce(chiave, lavoro) {
  const v = VOCI[chiave];
  const tmp = fs.mkdtempSync(path.join(lavoro, chiave + '-'));
  const silenzio = (s, f) => ff(['-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(s), '-c:a', 'pcm_s16le', f]);
  silenzio(SILENZIO_INIZIO, path.join(tmp, 'inizio.wav'));
  silenzio(PAUSA, path.join(tmp, 'pausa.wav'));
  silenzio(CODA, path.join(tmp, 'coda.wav'));

  const elenco = ["file 'inizio.wav'"], tempi = [];
  let t = SILENZIO_INIZIO;
  for (let i = 0; i < v.righe.length; i++) {
    const f = 'riga' + String(i).padStart(2, '0') + '.wav';
    const durata = await genera(v.righe[i], v.voce, path.join(tmp, f));
    tempi.push(Math.round(t * 100) / 100);
    t += durata;
    elenco.push(`file '${f}'`);
    if (i < v.righe.length - 1) { elenco.push("file 'pausa.wav'"); t += PAUSA; }
    process.stdout.write('.');
  }
  elenco.push("file 'coda.wav'");
  fs.writeFileSync(path.join(tmp, 'elenco.txt'), elenco.join('\n'));
  const montata = path.join(tmp, 'montata.wav');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'elenco.txt'), '-ar', '44100', montata]);

  // Risposta all'impulso della stanza di pietra
  const ir = path.join(tmp, 'ir.wav');
  ff(['-f', 'lavfi', '-i', "aevalsrc='(random(0)*2-1)*exp(-2.6*t)*(1-exp(-60*t))':d=2.5:s=44100", '-ac', '1', ir]);
  const filtro = [
    '[0]rubberband=pitch=0.86:formant=preserved:pitchq=quality,asplit=4[secco][perrev][perinv][perbasso]',
    '[perrev][1]afir=dry=0:wet=1:irnorm=1[rev]',
    '[perinv]areverse[inv];[inv][2]afir=dry=0:wet=1:irnorm=1,areverse[salita]',
    '[perbasso]rubberband=pitch=0.5:pitchq=quality,lowpass=f=1800,adelay=25[basso]',
    '[secco]chorus=0.7:0.9:45|60:0.25|0.2:0.3|0.45:1.2|0.8[mosso]',
    "[mosso][rev][salita][basso]amix=inputs=4:weights='1 0.4 0.5 0.3':normalize=0,lowpass=f=8500,loudnorm=I=-18:TP=-2"
  ].join(';');
  const uscita = path.join(RADICE, AU.cartella, v.file);
  ff(['-i', montata, '-i', ir, '-i', ir, '-filter_complex', filtro, '-ac', '1', '-b:a', '160k', uscita]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(' ' + v.file + ' (' + v.righe.length + ' righe, ' + Math.round(t + CODA) + ' s)');
  return tempi;
}

// --- Via ---
const scelte = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VOCI);
const fileTempi = path.join(RADICE, 'content', 'tempi-voci.js');
const tempi = {};
if (fs.existsSync(fileTempi)) {
  const c = { window: {} }; vm.createContext(c);
  vm.runInContext(fs.readFileSync(fileTempi, 'utf8'), c);
  Object.assign(tempi, c.window.CONTENT_TEMPI_VOCI || {});
}
fs.mkdirSync(path.join(RADICE, AU.cartella), { recursive: true });
const lavoro = fs.mkdtempSync(path.join(os.tmpdir(), 'voci-'));
for (const k of scelte) {
  if (!VOCI[k]) { console.error('Voce sconosciuta: ' + k); process.exit(1); }
  process.stdout.write(k + ' ');
  tempi[k] = await voce(k, lavoro);
}
fs.rmSync(lavoro, { recursive: true, force: true });
fs.writeFileSync(fileTempi,
  '// Inizio di ogni riga delle voci, in secondi. GENERATO da strumenti/genera-voci.mjs: non modificare a mano.\n' +
  '// Se il numero di righe non corrisponde più ai testi, l\'app ignora questi tempi e distribuisce le righe da sola.\n' +
  'window.CONTENT_TEMPI_VOCI = ' + JSON.stringify(tempi, null, 2) + ';\n');
console.log('Tempi dei sottotitoli in content/tempi-voci.js');
