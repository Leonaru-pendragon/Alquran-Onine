import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations for TypeScript compatibility
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResultItem[];
  [index: number]: {
    isFinal: boolean;
    [index: number]: SpeechRecognitionResultItem;
  };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export interface UseVoiceRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setManualTranscript: (text: string) => void;
  speakVoiceFeedback: (text: string) => void;
}

// Gentle audio cues using Web Audio API
function playVoiceTone(type: 'start' | 'stop') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    }
    osc.onended = () => {
      void ctx.close().catch(() => {});
    };
  } catch {
    // Ignore audio context autoplay policy restrictions
  }
}

export function useVoiceRecognition(onFinalResult?: (transcript: string) => void): UseVoiceRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  // Determine browser capability on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    setIsSupported(Boolean(SpeechRecognitionAPI));
  }, []);

  const stopListening = useCallback(() => {
    const wasActive = Boolean(activeRecognitionRef.current);
    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      activeRecognitionRef.current = null;
    }
    setIsListening(false);
    if (wasActive) {
      playVoiceTone('stop');
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Browser Anda tidak mendukung Web Speech API (misalnya Firefox). Gunakan Chrome atau Edge untuk fitur suara.');
      return;
    }

    // Abort existing instance cleanly
    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.abort();
      } catch {
        // ignore
      }
      activeRecognitionRef.current = null;
    }

    try {
      const instance = new SpeechRecognitionAPI();
      instance.continuous = false; // Discrete command mode
      instance.interimResults = true; // Real-time feedback
      instance.lang = 'id-ID'; // Indonesian phonetic model (handles Indonesian surah names best)

      instance.onstart = () => {
        setIsListening(true);
        setError(null);
        playVoiceTone('start');
      };

      instance.onresult = (event: SpeechRecognitionEventLike) => {
        let currentInterim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (final) {
          const cleanFinal = final.trim();
          setTranscript(cleanFinal);
          setInterimTranscript('');
          if (onFinalResultRef.current) {
            onFinalResultRef.current(cleanFinal);
          }
        }
      };

      instance.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        activeRecognitionRef.current = null;

        let errorMessage = 'Gagal mengenali suara. Silakan coba lagi.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMessage = 'Izin mikrofon belum diberikan. Izinkan akses mikrofon di pengaturan browser Anda.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'Tidak ada suara terdeteksi. Silakan bicara lebih dekat ke mikrofon.';
        } else if (event.error === 'network') {
          errorMessage = 'Koneksi jaringan terputus saat pengenalan suara.';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'Mikrofon tidak terdeteksi atau sedang dipakai aplikasi lain.';
        }
        setError(errorMessage);
        playVoiceTone('stop');
      };

      instance.onend = () => {
        setIsListening(false);
        activeRecognitionRef.current = null;
      };

      activeRecognitionRef.current = instance;
      instance.start();
    } catch (e: unknown) {
      console.warn('SpeechRecognition failed to start:', e);
      setIsListening(false);
      activeRecognitionRef.current = null;
      setError('Tidak dapat mengaktifkan mikrofon. Pastikan izin akses telah diberikan.');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
    setInterimTranscript('');
    if (onFinalResultRef.current) {
      onFinalResultRef.current(text);
    }
  }, []);

  // Voice feedback via SpeechSynthesis
  const speakVoiceFeedback = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis not available or blocked
      }
    }
  }, []);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      if (activeRecognitionRef.current) {
        try {
          activeRecognitionRef.current.abort();
        } catch {
          // ignore
        }
        activeRecognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    speakVoiceFeedback
  };
}
