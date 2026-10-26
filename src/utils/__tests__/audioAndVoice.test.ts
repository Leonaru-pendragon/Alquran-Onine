import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseVoiceQuranCommand } from '../voiceCommandParser.ts';
import {
  QARI_OPTIONS,
  DEFAULT_QARI_ID,
  getQariById,
  isValidQariId,
  getAyahAudioUrl,
  getAyahFallbackAudioUrl,
  getSurahFullAudioUrl,
  getSurahFullFallbackAudioUrl
} from '../../services/quranApi.ts';
import { isTrustedAudioUrl, buildSecurityHeaders } from '../security.ts';
import { SURAH_METADATA_LIST } from '../../data/quranMetadata.ts';

describe('Audio URL Generators & 5 Selectable Qari Options', () => {
  it('exposes the exact 5 requested Qari voice actors', () => {
    const names = QARI_OPTIONS.map((q) => q.nama);
    assert.deepStrictEqual(names, [
      'Abdul Basit Abdus Samad',
      'Mishari Rasyid al-Afasy',
      'Abdul-Rahman Al-Sudais',
      'Maher Al-Muaiqly',
      'Saad Al-Ghamdi'
    ]);
    assert.strictEqual(DEFAULT_QARI_ID, 'mishari_alafasy');
    assert.strictEqual(isValidQariId('abdul_basit'), true);
    assert.strictEqual(isValidQariId('maher_almuaiqly'), true);
    assert.strictEqual(isValidQariId('saad_alghamdi'), true);
    assert.strictEqual(isValidQariId('unknown_qari'), false);
    assert.strictEqual(getQariById('abdul_basit').nama, 'Abdul Basit Abdus Samad');
    assert.strictEqual(getQariById('unknown').id, 'mishari_alafasy');
  });

  it('generates valid padded CDN url for ayah audio (default Mishari al-Afasy)', () => {
    const url = getAyahAudioUrl(1, 1);
    assert.strictEqual(url, 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3');

    const url2 = getAyahAudioUrl(112, 4);
    assert.strictEqual(url2, 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/112004.mp3');
  });

  it('generates distinct verified ayah & full-surah URLs for all 5 Qaris', () => {
    assert.strictEqual(
      getAyahAudioUrl(1, 1, 'abdul_basit'),
      'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3'
    );
    assert.strictEqual(
      getAyahAudioUrl(1, 1, 'abdurrahman_assudais'),
      'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001001.mp3'
    );
    assert.strictEqual(
      getAyahAudioUrl(1, 1, 'maher_almuaiqly'),
      'https://everyayah.com/data/MaherAlMuaiqly128kbps/001001.mp3'
    );
    assert.strictEqual(
      getAyahAudioUrl(1, 1, 'saad_alghamdi'),
      'https://everyayah.com/data/Ghamadi_40kbps/001001.mp3'
    );

    assert.strictEqual(
      getSurahFullAudioUrl(1, 'abdul_basit'),
      'https://download.quranicaudio.com/quran/abdul_basit_murattal/001.mp3'
    );
    assert.strictEqual(
      getSurahFullAudioUrl(1, 'abdurrahman_assudais'),
      'https://cdn.equran.id/audio-full/Abdurrahman-as-Sudais/001.mp3'
    );
    assert.strictEqual(
      getSurahFullAudioUrl(1, 'maher_almuaiqly'),
      'https://download.quranicaudio.com/quran/maher_256/001.mp3'
    );
    assert.strictEqual(
      getSurahFullAudioUrl(1, 'saad_alghamdi'),
      'https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete/001.mp3'
    );
  });

  it('ensures every primary and fallback audio URL across all 5 Qaris passes security & CSP media-src', () => {
    const csp = buildSecurityHeaders(true)['Content-Security-Policy'];
    for (const qari of QARI_OPTIONS) {
      const urls = [
        getAyahAudioUrl(1, 1, qari.id),
        getAyahFallbackAudioUrl(1, 1, qari.id),
        getSurahFullAudioUrl(1, qari.id),
        getSurahFullFallbackAudioUrl(1, qari.id)
      ];
      for (const u of urls) {
        assert.strictEqual(isTrustedAudioUrl(u), true, `URL not trusted for ${qari.id}: ${u}`);
        const origin = new URL(u).origin;
        assert.strictEqual(csp.includes(origin), true, `Origin ${origin} missing from CSP media-src`);
      }
    }
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
