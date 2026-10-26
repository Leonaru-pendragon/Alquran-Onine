import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYBACK_SPEEDS,
  SILENT_UNLOCK_WAV_DATA_URI,
  createSilentUnlockWavDataUri,
  shouldAutoResumeUnexpectedPause,
  buildMediaMetadataDescriptor,
  backgroundAudioEngine
} from '../backgroundAudioEngine';

test('createSilentUnlockWavDataUri produces a spec-compliant 8kHz 8-bit PCM silent WAV data URI', () => {
  const uri = createSilentUnlockWavDataUri();
  assert.equal(uri, SILENT_UNLOCK_WAV_DATA_URI);
  assert.ok(uri.startsWith('data:audio/wav;base64,'));

  const base64Payload = uri.slice('data:audio/wav;base64,'.length);
  const buf = Buffer.from(base64Payload, 'base64');

  // 44-byte WAV header + 800 samples (0.1s at 8000 Hz)
  assert.equal(buf.length, 844);
  assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buf.readUInt32LE(4), 36 + 800);
  assert.equal(buf.subarray(8, 12).toString('ascii'), 'WAVE');
  assert.equal(buf.subarray(12, 16).toString('ascii'), 'fmt ');
  assert.equal(buf.readUInt32LE(16), 16); // PCM fmt chunk size
  assert.equal(buf.readUInt16LE(20), 1); // AudioFormat = 1 (PCM)
  assert.equal(buf.readUInt16LE(22), 1); // Mono
  assert.equal(buf.readUInt32LE(24), 8000); // 8kHz
  assert.equal(buf.readUInt16LE(34), 8); // 8-bit
  assert.equal(buf.subarray(36, 40).toString('ascii'), 'data');
  assert.equal(buf.readUInt32LE(40), 800);

  // Every audio sample must be 0x80 (unsigned 8-bit silence midpoint)
  for (let i = 44; i < buf.length; i++) {
    assert.equal(buf[i], 128);
  }
});

test('shouldAutoResumeUnexpectedPause overrides spurious browser exit-pauses within 2.5s window', () => {
  const hideTime = 1_700_000_000_000;

  // Immediate exit pause (e.g. 45ms after visibilitychange -> hidden) MUST auto-resume
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: true,
      isEnded: false,
      isError: false,
      nowMs: hideTime + 45,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 0
    }),
    true
  );

  // Delayed WebView exit pause at 2400ms MUST still auto-resume
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: true,
      isEnded: false,
      isError: false,
      nowMs: hideTime + 2400,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 2
    }),
    true
  );

  // Stops retrying after 3 attempts to avoid infinite fight with genuine hardware audio interruption
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: true,
      isEnded: false,
      isError: false,
      nowMs: hideTime + 300,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 3
    }),
    false
  );

  // External pause 30 seconds after exiting (e.g. incoming phone call) must NOT force-resume
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: true,
      isEnded: false,
      isError: false,
      nowMs: hideTime + 30_000,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 0
    }),
    false
  );

  // Never auto-resume when user intentionally paused, track ended, or media errored
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: false,
      isEnded: false,
      isError: false,
      nowMs: hideTime + 20,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 0
    }),
    false
  );
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: true,
      isEnded: true,
      isError: false,
      nowMs: hideTime + 20,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 0
    }),
    false
  );
  assert.equal(
    shouldAutoResumeUnexpectedPause({
      intentToPlay: true,
      isEnded: false,
      isError: true,
      nowMs: hideTime + 20,
      lastBackgroundTransitionMs: hideTime,
      autoResumeCountSinceHide: 0
    }),
    false
  );
});

test('buildMediaMetadataDescriptor formats Ayah, Full-Surah, Qari names, and GitHub Pages subpath icons accurately', () => {
  const ayahMeta = buildMediaMetadataDescriptor(
    { surahNomor: 36, ayahNomor: 12, isFullSurah: false },
    'maher_almuaiqly',
    'https://example.github.io/quran-digital/'
  );
  assert.equal(ayahMeta.title, 'QS. Yasin : Ayat 12');
  assert.equal(ayahMeta.artist, 'Maher Al-Muaiqly');
  assert.equal(ayahMeta.album, "Al-Qur'an Digital");
  assert.equal(ayahMeta.artwork.length, 2);
  assert.equal(ayahMeta.artwork[0].src, 'https://example.github.io/quran-digital/pwa-192x192.png');
  assert.equal(ayahMeta.artwork[1].src, 'https://example.github.io/quran-digital/pwa-512x512.png');

  const fullSurahMeta = buildMediaMetadataDescriptor(
    { surahNomor: 18, ayahNomor: 1, isFullSurah: true },
    'abdul_basit',
    'http://localhost:3000/'
  );
  assert.equal(fullSurahMeta.title, 'Surah Al-Kahf (Lengkap)');
  assert.equal(fullSurahMeta.artist, 'Abdul Basit Abdus Samad');
});

test('backgroundAudioEngine configures initial preferences and speed toggles cleanly in headless Node', () => {
  assert.deepEqual(PLAYBACK_SPEEDS, [0.75, 1, 1.25, 1.5]);

  backgroundAudioEngine.configureInitialPreferences({
    currentTime: 14.5,
    speedIndex: 2,
    isRepeat: true
  });

  const snap = backgroundAudioEngine.getSnapshot();
  assert.equal(snap.currentTime, 14.5);
  assert.equal(snap.speedIndex, 2);
  assert.equal(snap.isRepeat, true);

  backgroundAudioEngine.toggleRepeat();
  assert.equal(backgroundAudioEngine.getSnapshot().isRepeat, false);
});
