/*
 * Cripta: cifratura dei messaggi tra schermo e telefono.
 * AES-GCM 256 con chiave derivata dal codice di regia (PBKDF2-SHA256, SubtleCrypto).
 * Il codice è casuale a 128 bit: bastano poche iterazioni.
 */
(function () {
  'use strict';

  const ITER = 1000;

  function subtle() {
    if (!window.crypto || !crypto.subtle) throw new Error('Cifratura non disponibile: la pagina va aperta in https.');
    return crypto.subtle;
  }

  function aB64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }

  function daB64(str) {
    const s = atob(str), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  function casuale(n) { return crypto.getRandomValues(new Uint8Array(n)); }

  // Codice di regia nuovo: 128 bit in base64url (sta nel #frammento del link della console).
  function nuovoCodice() {
    return aB64(casuale(16)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function deriva(segreto, salt) {
    const materiale = await subtle().importKey('raw', new TextEncoder().encode(segreto), 'PBKDF2', false, ['deriveKey']);
    return subtle().deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: ITER },
      materiale, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  async function cifra(oggetto, segreto) {
    const salt = casuale(16), iv = casuale(12);
    const chiave = await deriva(segreto, salt);
    const dati = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv: iv }, chiave, new TextEncoder().encode(JSON.stringify(oggetto))));
    return { v: 1, salt: aB64(salt), iv: aB64(iv), dati: aB64(dati) };
  }

  async function decifra(blob, segreto) {
    if (!blob || blob.v !== 1) throw new Error('Formato sconosciuto.');
    const chiave = await deriva(segreto, daB64(blob.salt));
    const chiaro = await subtle().decrypt({ name: 'AES-GCM', iv: daB64(blob.iv) }, chiave, daB64(blob.dati));
    return JSON.parse(new TextDecoder().decode(chiaro));
  }

  window.Cripta = { nuovoCodice: nuovoCodice, cifra: cifra, decifra: decifra };
})();
