import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseIndonesianNumber,
  normalizeQuranText,
  matchSurah,
  parseVoiceQuranCommand
} from '../voiceCommandParser.ts';
import { SURAH_METADATA_LIST } from '../../data/quranMetadata.ts';

describe('parseIndonesianNumber', () => {
  it('parses direct digits', () => {
    assert.strictEqual(parseIndonesianNumber('255'), 255);
    assert.strictEqual(parseIndonesianNumber('10'), 10);
    assert.strictEqual(parseIndonesianNumber('1'), 1);
  });

  it('parses simple indonesian number words', () => {
    assert.strictEqual(parseIndonesianNumber('satu'), 1);
    assert.strictEqual(parseIndonesianNumber('tujuh'), 7);
    assert.strictEqual(parseIndonesianNumber('sepuluh'), 10);
    assert.strictEqual(parseIndonesianNumber('sebelas'), 11);
    assert.strictEqual(parseIndonesianNumber('dua belas'), 12);
  });

  it('parses composite indonesian numbers', () => {
    assert.strictEqual(parseIndonesianNumber('dua puluh'), 20);
    assert.strictEqual(parseIndonesianNumber('tiga puluh'), 30);
    assert.strictEqual(parseIndonesianNumber('dua puluh lima'), 25);
    assert.strictEqual(parseIndonesianNumber('seratus sepuluh'), 110);
  });
});

describe('matchSurah', () => {
  it('matches surahs by exact or normalized Latin name', () => {
    const fatihah = matchSurah('Al-Fatihah', SURAH_METADATA_LIST);
    assert.strictEqual(fatihah?.nomor, 1);

    const baqarah = matchSurah('Al Baqarah', SURAH_METADATA_LIST);
    assert.strictEqual(baqarah?.nomor, 2);

    const yasin = matchSurah('Yasin', SURAH_METADATA_LIST);
    assert.strictEqual(yasin?.nomor, 36);

    const kahf = matchSurah('Al-Kahf', SURAH_METADATA_LIST);
    assert.strictEqual(kahf?.nomor, 18);
  });

  it('matches surahs by number', () => {
    const s114 = matchSurah('114', SURAH_METADATA_LIST);
    assert.strictEqual(s114?.namaLatin, 'An-Nas');
  });

  it('matches surahs without prefix article', () => {
    const mulk = matchSurah('Mulk', SURAH_METADATA_LIST);
    assert.strictEqual(mulk?.nomor, 67);
  });
});

describe('parseVoiceQuranCommand', () => {
  it('parses Surah and Ayah commands accurately', () => {
    const res = parseVoiceQuranCommand('Surah Al-Baqarah ayat 255', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah_ayah');
    assert.strictEqual(res.surahNomor, 2);
    assert.strictEqual(res.ayahNomor, 255);

    const res2 = parseVoiceQuranCommand('Surah Yasin ayat 10', SURAH_METADATA_LIST);
    assert.strictEqual(res2.type, 'surah_ayah');
    assert.strictEqual(res2.surahNomor, 36);
    assert.strictEqual(res2.ayahNomor, 10);
  });

  it('parses spoken number in ayah part', () => {
    const res = parseVoiceQuranCommand('Al-Kahf ayat sepuluh', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah_ayah');
    assert.strictEqual(res.surahNomor, 18);
    assert.strictEqual(res.ayahNomor, 10);
  });

  it('identifies special Islamic phrases like Ayat Kursi', () => {
    const res = parseVoiceQuranCommand('Ayat Kursi', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah_ayah');
    assert.strictEqual(res.surahNomor, 2);
    assert.strictEqual(res.ayahNomor, 255);
  });

  it('identifies Juz commands', () => {
    const res = parseVoiceQuranCommand('Juz 30', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'juz');
    assert.strictEqual(res.juzNomor, 30);
  });

  it('identifies Surah only commands', () => {
    const res = parseVoiceQuranCommand('Surah Ar-Rahman', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'surah');
    assert.strictEqual(res.surahNomor, 55);
  });

  it('falls back to search query for generic phrases', () => {
    const res = parseVoiceQuranCommand('Kisah Nabi Musa dan Firaun', SURAH_METADATA_LIST);
    assert.strictEqual(res.type, 'search_query');
    assert.strictEqual(res.searchQuery, 'Kisah Nabi Musa dan Firaun');
  });
});
