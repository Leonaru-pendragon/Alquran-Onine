import test from 'node:test';
import assert from 'node:assert/strict';
import {
  serializeNavHash,
  parseNavHash,
  validatePersistedNavigationState,
  resolveInitialNavigationState,
  validatePersistedAudioSession,
  computeNextAudioTrack,
  computePrevAudioTrack,
  DEFAULT_NAVIGATION_STATE
} from '../sessionPersistence.ts';

test('serializeNavHash & parseNavHash round-trip all primary views and sub-views cleanly', () => {
  assert.equal(
    serializeNavHash({
      ...DEFAULT_NAVIGATION_STATE,
      activeTab: 'surah'
    }),
    '#/surah'
  );
  assert.deepEqual(parseNavHash('#/surah'), { activeTab: 'surah' });

  assert.equal(
    serializeNavHash({
      ...DEFAULT_NAVIGATION_STATE,
      activeTab: 'reader',
      surahNomor: 18,
      ayahNomor: 1
    }),
    '#/baca/18'
  );
  assert.deepEqual(parseNavHash('#/baca/18'), {
    activeTab: 'reader',
    surahNomor: 18,
    ayahNomor: 1
  });

  assert.equal(
    serializeNavHash({
      ...DEFAULT_NAVIGATION_STATE,
      activeTab: 'reader',
      surahNomor: 18,
      ayahNomor: 10
    }),
    '#/baca/18/10'
  );
  assert.deepEqual(parseNavHash('#/baca/18/10'), {
    activeTab: 'reader',
    surahNomor: 18,
    ayahNomor: 10
  });

  assert.equal(
    serializeNavHash({
      ...DEFAULT_NAVIGATION_STATE,
      activeTab: 'tajwid',
      tajwidSection: 'soal-buku'
    }),
    '#/tajwid/soal-buku'
  );
  assert.deepEqual(parseNavHash('#/tajwid/soal-buku'), {
    activeTab: 'tajwid',
    tajwidSection: 'soal-buku'
  });

  assert.equal(
    serializeNavHash({
      ...DEFAULT_NAVIGATION_STATE,
      activeTab: 'hadith',
      hadithBookSlug: 'bukhari'
    }),
    '#/hadits/bukhari'
  );
  assert.deepEqual(parseNavHash('#/hadits/bukhari'), {
    activeTab: 'hadith',
    hadithBookSlug: 'bukhari'
  });

  assert.equal(
    serializeNavHash({
      ...DEFAULT_NAVIGATION_STATE,
      activeTab: 'saved',
      savedSubTab: 'bookmarks'
    }),
    '#/riwayat/bookmarks'
  );
  assert.deepEqual(parseNavHash('#/riwayat/bookmarks'), {
    activeTab: 'saved',
    savedSubTab: 'bookmarks'
  });
});

test('parseNavHash clamps out-of-range ayah numbers and rejects empty/unknown hashes', () => {
  assert.equal(parseNavHash(''), null);
  assert.equal(parseNavHash('#'), null);
  assert.equal(parseNavHash('#/'), null);
  assert.equal(parseNavHash('#/halaman-tidak-dikenal'), null);

  // Al-Fatihah has 7 ayahs -> ayah 999 clamps safely to 1
  assert.deepEqual(parseNavHash('#/baca/1/999'), {
    activeTab: 'reader',
    surahNomor: 1,
    ayahNomor: 1
  });
});

test('resolveInitialNavigationState keeps user on current page across both hashed refresh and root PWA relaunch', () => {
  const storedReader = {
    activeTab: 'reader',
    surahNomor: 36,
    ayahNomor: 12,
    tajwidSection: 'kuis',
    savedSubTab: 'history',
    hadithBookSlug: 'muslim',
    scrollY: 1280,
    updatedAt: 1700000000000
  };

  // Standalone PWA Home Screen launch at root URL (empty hash) restores stored view instead of resetting to home
  const fromEmptyHash = resolveInitialNavigationState('', storedReader);
  assert.equal(fromEmptyHash.activeTab, 'reader');
  assert.equal(fromEmptyHash.surahNomor, 36);
  assert.equal(fromEmptyHash.ayahNomor, 12);
  assert.equal(fromEmptyHash.scrollY, 1280);

  // Refresh on #/baca/36 preserves stored scrollY for Surah 36
  const fromSameSurahHash = resolveInitialNavigationState('#/baca/36', {
    ...storedReader,
    ayahNomor: 1
  });
  assert.equal(fromSameSurahHash.activeTab, 'reader');
  assert.equal(fromSameSurahHash.surahNomor, 36);
  assert.equal(fromSameSurahHash.scrollY, 1280);

  // Navigating via explicit hash to a different surah (#/baca/67) resets scrollY to 0
  const fromDifferentSurahHash = resolveInitialNavigationState('#/baca/67', storedReader);
  assert.equal(fromDifferentSurahHash.activeTab, 'reader');
  assert.equal(fromDifferentSurahHash.surahNomor, 67);
  assert.equal(fromDifferentSurahHash.ayahNomor, 1);
  assert.equal(fromDifferentSurahHash.scrollY, 0);
});

test('validatePersistedNavigationState sanitizes malformed storage payloads', () => {
  assert.equal(validatePersistedNavigationState(null), null);
  assert.equal(validatePersistedNavigationState('corrupt'), null);

  const sanitized = validatePersistedNavigationState({
    activeTab: 'invalid_tab',
    surahNomor: 999,
    ayahNomor: -4,
    tajwidSection: 'hack',
    savedSubTab: 'hack',
    hadithBookSlug: '<script>alert(1)</script>',
    scrollY: -500
  });
  assert.ok(sanitized);
  assert.equal(sanitized.activeTab, 'surah');
  assert.equal(sanitized.surahNomor, 1);
  assert.equal(sanitized.ayahNomor, 1);
  assert.equal(sanitized.tajwidSection, 'pelajaran');
  assert.equal(sanitized.savedSubTab, 'dashboard');
  assert.equal(sanitized.hadithBookSlug, 'semua');
  assert.equal(sanitized.scrollY, 0);
});

test('validatePersistedAudioSession validates trusted CDN URLs and restores playback timestamp & speed', () => {
  assert.equal(validatePersistedAudioSession(null, 'mishari_alafasy'), null);
  assert.equal(validatePersistedAudioSession({ surahNomor: 0 }, 'mishari_alafasy'), null);

  const restored = validatePersistedAudioSession(
    {
      surahNomor: 18,
      ayahNomor: 10,
      audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/018010.mp3',
      isPlaying: true,
      isFullSurah: false,
      currentTime: 14.5,
      speedIndex: 2,
      isRepeat: true
    },
    'mishari_alafasy'
  );
  assert.ok(restored);
  assert.equal(restored.surahNomor, 18);
  assert.equal(restored.ayahNomor, 10);
  assert.equal(restored.audioUrl, 'https://everyayah.com/data/Alafasy_128kbps/018010.mp3');
  assert.equal(restored.isPlaying, true);
  assert.equal(restored.currentTime, 14.5);
  assert.equal(restored.speedIndex, 2);
  assert.equal(restored.isRepeat, true);

  // Untrusted audioUrl falls back safely to selected Qari's trusted CDN URL
  const fallbackSession = validatePersistedAudioSession(
    {
      surahNomor: 1,
      ayahNomor: 2,
      audioUrl: 'https://evil.example.com/malicious.mp3',
      isPlaying: true,
      isFullSurah: false,
      currentTime: 3.2,
      speedIndex: 99
    },
    'abdul_basit'
  );
  assert.ok(fallbackSession);
  assert.match(fallbackSession.audioUrl, /Abdul_Basit_Murattal_192kbps\/001002\.mp3$/);
  assert.equal(fallbackSession.speedIndex, 1);
});

test('computeNextAudioTrack and computePrevAudioTrack handle ayah, surah boundary, and full-surah transitions', () => {
  // Al-Fatihah Ayah 6 -> Ayah 7 with Sudais
  const nextWithinSurah = computeNextAudioTrack(
    { surahNomor: 1, ayahNomor: 6, isFullSurah: false },
    'abdurrahman_assudais'
  );
  assert.ok(nextWithinSurah);
  assert.equal(nextWithinSurah.surahNomor, 1);
  assert.equal(nextWithinSurah.ayahNomor, 7);
  assert.match(nextWithinSurah.audioUrl, /Abdurrahman-as-Sudais\/001007\.mp3$/);

  // Al-Fatihah Ayah 7 -> Al-Baqarah Ayah 1 seamlessly in background
  const nextAcrossSurah = computeNextAudioTrack(
    { surahNomor: 1, ayahNomor: 7, isFullSurah: false },
    'maher_almuaiqly'
  );
  assert.ok(nextAcrossSurah);
  assert.equal(nextAcrossSurah.surahNomor, 2);
  assert.equal(nextAcrossSurah.ayahNomor, 1);
  assert.match(nextAcrossSurah.audioUrl, /MaherAlMuaiqly128kbps\/002001\.mp3$/);

  // An-Nas (114) Ayah 6 -> null (end of Mushaf)
  const endOfMushaf = computeNextAudioTrack(
    { surahNomor: 114, ayahNomor: 6, isFullSurah: false },
    'saad_alghamdi'
  );
  assert.equal(endOfMushaf, null);

  // Al-Baqarah Ayah 1 -> Al-Fatihah Ayah 7 on previous track
  const prevAcrossSurah = computePrevAudioTrack(
    { surahNomor: 2, ayahNomor: 1, isFullSurah: false },
    'saad_alghamdi'
  );
  assert.ok(prevAcrossSurah);
  assert.equal(prevAcrossSurah.surahNomor, 1);
  assert.equal(prevAcrossSurah.ayahNomor, 7);
  assert.match(prevAcrossSurah.audioUrl, /Ghamadi_40kbps\/001007\.mp3$/);

  // Full Surah mode transitions Surah 1 -> Surah 2
  const nextFullSurah = computeNextAudioTrack(
    { surahNomor: 1, ayahNomor: 1, isFullSurah: true },
    'mishari_alafasy'
  );
  assert.ok(nextFullSurah);
  assert.equal(nextFullSurah.surahNomor, 2);
  assert.equal(nextFullSurah.isFullSurah, true);
  assert.match(nextFullSurah.audioUrl, /Misyari-Rasyid-Al-Afasi\/002\.mp3$/);
});
