import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseVoiceQuranCommand } from '../voiceCommandParser.ts';
import { getAyahAudioUrl, getAyahFallbackAudioUrl, getSurahFullAudioUrl } from '../../services/quranApi.ts';
import { SURAH_METADATA_LIST } from '../../data/quranMetadata.ts';

describe('Audio URL Generators', () => {
  it('generates valid padded CDN url for ayah audio', () => {
    const url = getAyahAudioUrl(1, 1);
    assert.strictEqual(url, 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3');

    const url2 = getAyahAudioUrl(112, 4);
    assert.strictEqual(url2, 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112004.mp3');
  });

  it('generates valid fallback EveryAyah audio URL', () => {
    const fallback = getAyahFallbackAudioUrl(1, 1);
    assert.strictEqual(fallback, 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3');
  });

  it('generates valid full surah audio URL', () => {
    const full = getSurahFullAudioUrl(1);
    assert.strictEqual(full, 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/001.mp3');
  });
});

describe('Voice Commands with Audio Play Intent', () => {
  it('detects play intent when user says putar surah', () => {
    const res = parseVoiceQuranCommand('Putar Surah Al-Ikhlas', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah');
    assert.strictEqual(res.action, 'play');
    assert.strictEqual(res.surahNomor, 112);
  });

  it('detects play intent when user says putar ayat', () => {
    const res = parseVoiceQuranCommand('Putar Al-Baqarah ayat 255', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah_ayah');
    assert.strictEqual(res.action, 'play');
    assert.strictEqual(res.surahNomor, 2);
    assert.strictEqual(res.ayahNomor, 255);
  });

  it('defaults to open action for non-playback commands', () => {
    const res = parseVoiceQuranCommand('Surah Yasin ayat 10', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah_ayah');
    assert.strictEqual(res.action, 'open');
  });
});
