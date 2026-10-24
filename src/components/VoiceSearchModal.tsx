import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Volume1
} from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceQuranCommand, VoiceSearchResult } from '../utils/voiceCommandParser';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult: (result: VoiceSearchResult) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onApplyResult
}) => {
  const [lastTranscript, setLastTranscript] = useState('');
  const [manualText, setManualText] = useState('');

  const {
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
  } = useVoiceRecognition((finalText) => {
    setLastTranscript(finalText);
  });

  // Reset modal state on opening
  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setLastTranscript('');
      setManualText('');
    } else {
      stopListening();
    }
  }, [isOpen]);

  // Keep track of latest spoken text
  const currentText = transcript || interimTranscript || lastTranscript || manualText;

  // Parse result in real-time
  const parsedResult = useMemo<VoiceSearchResult | null>(() => {
    if (!currentText.trim()) return null;
    return parseVoiceQuranCommand(currentText, SURAH_METADATA_LIST);
  }, [currentText]);

  if (!isOpen) return null;

  const handleApply = (result: VoiceSearchResult, forcePlay = false) => {
    stopListening();
    onApplyResult({
      ...result,
      action: forcePlay ? 'play' : (result.action || 'open')
    });
    onClose();
  };

  const handleSelectSample = (sample: string) => {
    setManualText(sample);
    setManualTranscript(sample);
  };

  const handleSpeakAloud = (text: string) => {
    speakVoiceFeedback(text);
  };

  const SAMPLE_COMMANDS = [
    'Putar Surah Al-Ikhlas',
    'Surah Al-Baqarah ayat 255',
    'Putar Surah Al-Falaq',
    'Surah Yasin ayat 10',
    'Ayat Kursi',
    'Juz 30'
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#fbf5e8] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5" />
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#ebdcc0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 [body.theme-sepia_&]:bg-[#ebdcc0] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 id="voice-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Pencarian & Perintah Suara
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49]">
                Cari Surah, Ayat, atau Putar Murottal Langsung
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            aria-label="Tutup Pencarian Suara"
            className="min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Browser Not Supported Warning */}
          {!isSupported && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Web Speech API Tidak Aktif</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                  Browser Anda tidak mengaktifkan SpeechRecognition otomatis. Anda dapat mengetuk contoh perintah suara di bawah untuk menguji navigasi dan murottal audio.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Kendala Mikrofon</p>
                <p className="mt-0.5 text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Center Stage: Ripple Mic Animation */}
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            <div className="relative flex items-center justify-center">
              {/* Pulsing Concentric Rings */}
              {isListening && (
                <>
                  <span className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
                  <span className="absolute w-20 h-20 rounded-full bg-emerald-500/30 animate-pulse" />
                </>
              )}

              <button
                onClick={isListening ? stopListening : startListening}
                aria-label={isListening ? 'Hentikan Mendengarkan' : 'Mulai Bicara'}
                className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
                  isListening
                    ? 'bg-emerald-600 text-white shadow-emerald-500/40 scale-105'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-400 [body.theme-sepia_&]:bg-[#ebdcc0]'
                }`}
              >
                {isListening ? (
                  <Mic className="w-7 h-7 animate-bounce" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>

            {/* Listening Waveform Indicator */}
            {isListening && (
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.1s] h-5" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-6" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.3s] h-4" />
                <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.15s] h-2" />
              </div>
            )}

            {/* Status Text */}
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217]">
                {isListening
                  ? 'Mendengarkan suara Anda...'
                  : currentText
                  ? 'Perintah suara terdeteksi'
                  : 'Ketuk mikrofon di atas untuk bicara'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49]">
                {isListening
                  ? 'Katakan misalnya: "Putar Surah Al-Ikhlas" atau "Al-Baqarah ayat 255"'
                  : 'Gunakan Bahasa Indonesia atau sebut nama Surah'}
              </p>
            </div>
          </div>

          {/* Transcript Display Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/60 border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] min-h-[64px] flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                Transkrip Suara
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] italic truncate">
                {currentText ? `"${currentText}"` : 'Belum ada suara...'}
              </p>
            </div>
            {currentText && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleSpeakAloud(currentText)}
                  title="Dengarkan Suara (TTS)"
                  aria-label="Dengarkan Suara"
                  className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                >
                  <Volume1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    resetTranscript();
                    setManualText('');
                    startListening();
                  }}
                  title="Bicara Ulang"
                  aria-label="Bicara Ulang"
                  className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Recognized Intent Result Card */}
          {parsedResult && currentText && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 [body.theme-sepia_&]:bg-[#edd9bc] [body.theme-sepia_&]:border-[#dec9a5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  {parsedResult.type === 'surah_ayah'
                    ? 'Surah & Ayat'
                    : parsedResult.type === 'surah'
                    ? 'Surah Al-Qur\'an'
                    : parsedResult.type === 'juz'
                    ? 'Bagian Juz'
                    : 'Pencarian Kata Kunci'}
                </span>
                {parsedResult.action === 'play' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>Mode Putar Audio</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                  {parsedResult.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 [body.theme-sepia_&]:text-[#54412c] mt-0.5">
                  {parsedResult.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Play Audio Button */}
                {(parsedResult.type === 'surah' || parsedResult.type === 'surah_ayah') && (
                  <button
                    onClick={() => handleApply(parsedResult, true)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Putar Audio Sekarang</span>
                  </button>
                )}

                {/* Open View Button */}
                <button
                  onClick={() => handleApply(parsedResult, false)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    parsedResult.type === 'surah' || parsedResult.type === 'surah_ayah'
                      ? 'border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                      : 'w-full bg-emerald-600 hover:bg-emerald-700 text-white col-span-2'
                  }`}
                >
                  <span>Buka Halaman</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Clickable Suggestions / Command Templates */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Contoh perintah suara cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_COMMANDS.map((sample) => (
                <button
                  key={sample}
                  onClick={() => handleSelectSample(sample)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#dec9a5] text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border-t border-slate-100 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] flex items-center justify-between">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Ketuk tombol silang atau Tutup untuk keluar
          </p>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="min-h-10 sm:min-h-0 px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
