import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  Share2,
  Copy,
  Check,
  Type,
  Volume2,
  Info,
  Sliders,
  Sparkles,
  ArrowUp,
  BookOpen
} from 'lucide-react';
import { SurahDetail, Ayah, ReadingSettings, BookmarkItem, ReadingHistoryItem } from '../types/quran';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';
import { fetchSurahDetail, getAyahAudioUrl } from '../services/quranApi';
import { renderTajwidHtml } from '../data/tajwidRules';
import { isAyahBookmarked } from '../utils/quranLogic';
import { TafsirModal } from './TafsirModal';

interface SurahReaderViewProps {
  currentSurahNomor: number;
  initialAyahNomor?: number;
  onSelectSurah: (nomor: number, initialAyah?: number) => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  bookmarks: BookmarkItem[];
  onToggleBookmark: (item: Omit<BookmarkItem, 'id' | 'timestamp'>) => void;
  onUpdateHistory: (item: ReadingHistoryItem) => void;
  currentPlayingAudio: { surahNomor: number; ayahNomor: number; isPlaying: boolean; isFullSurah?: boolean } | null;
  onPlayAyahAudio: (surahNomor: number, ayahNomor: number, audioUrl: string) => void;
  onPlaySurahFullAudio?: (surahNomor: number) => void;
  onOpenShareModal: (surahName: string, surahNomor: number, ayah: Ayah) => void;
}

export const SurahReaderView: React.FC<SurahReaderViewProps> = ({
  currentSurahNomor,
  initialAyahNomor = 1,
  onSelectSurah,
  settings,
  onUpdateSettings,
  bookmarks,
  onToggleBookmark,
  onUpdateHistory,
  currentPlayingAudio,
  onPlayAyahAudio,
  onPlaySurahFullAudio,
  onOpenShareModal
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [showTafsirInfo, setShowTafsirInfo] = useState(false);
  const [noteModalAyah, setNoteModalAyah] = useState<Ayah | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<Ayah | null>(null);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Load surah details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchSurahDetail(currentSurahNomor)
      .then((data) => {
        if (!isMounted) return;
        setSurah(data);
        setLoading(false);

        // Record initial history
        onUpdateHistory({
          surahNomor: data.nomor,
          surahNamaLatin: data.namaLatin,
          ayatNomor: initialAyahNomor || 1,
          totalAyat: data.jumlahAyat,
          timestamp: Date.now()
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat surah.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSurahNomor]);

  // Jump to initialAyah if provided and highlight it
  useEffect(() => {
    if (!loading && surah && initialAyahNomor) {
      const el = ayahRefs.current.get(initialAyahNomor);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        setHighlightedAyah(initialAyahNomor);
        const timer = setTimeout(() => {
          setHighlightedAyah(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, surah, initialAyahNomor]);

  // Auto-scroll to currently playing ayah if enabled
  useEffect(() => {
    if (
      settings.autoScrollAudio &&
      currentPlayingAudio &&
      currentPlayingAudio.surahNomor === currentSurahNomor &&
      currentPlayingAudio.isPlaying
    ) {
      const el = ayahRefs.current.get(currentPlayingAudio.ayahNomor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentPlayingAudio, settings.autoScrollAudio, currentSurahNomor]);

  const handleCopyAyah = (ayah: Ayah) => {
    if (!surah) return;
    const textToCopy = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}" (QS. ${surah.namaLatin} [${surah.nomor}]: ${ayah.nomorAyat})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.nomorAyat);
    setTimeout(() => setCopiedAyah(null), 2500);
  };

  const handleBookmarkClick = (ayah: Ayah) => {
    if (!surah) return;
    const alreadyBookmarked = isAyahBookmarked(bookmarks, surah.nomor, ayah.nomorAyat);
    if (alreadyBookmarked) {
      // Direct remove
      onToggleBookmark({
        type: 'ayah',
        surahNomor: surah.nomor,
        surahNamaLatin: surah.namaLatin,
        ayatNomor: ayah.nomorAyat,
        teksArab: ayah.teksArab,
        teksTerjemah: ayah.teksIndonesia
      });
    } else {
      // Open note modal to allow optional reflection note
      setNoteModalAyah(ayah);
      setCustomNote('');
    }
  };

  const handleSaveBookmarkWithNote = () => {
    if (!surah || !noteModalAyah) return;
    onToggleBookmark({
      type: 'ayah',
      surahNomor: surah.nomor,
      surahNamaLatin: surah.namaLatin,
      ayatNomor: noteModalAyah.nomorAyat,
      teksArab: noteModalAyah.teksArab,
      teksTerjemah: noteModalAyah.teksIndonesia,
      catatan: customNote.trim() || undefined
    });
    setNoteModalAyah(null);
  };

  const prevSurahNomor = currentSurahNomor > 1 ? currentSurahNomor - 1 : null;
  const nextSurahNomor = currentSurahNomor < 114 ? currentSurahNomor + 1 : null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#6e5a45]">
          Memuat teks suci Al-Qur'an...
        </p>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error || 'Gagal memuat surah.'}</p>
        <button
          onClick={() => onSelectSurah(currentSurahNomor)}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Sticky Reader Navigation & Toolstrip */}
      <div className="sticky top-16 z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 [body.theme-sepia_&]:bg-[#fbf5e8]/90 [body.theme-sepia_&]:border-[#e8dec9]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Surah Selector & Step Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => prevSurahNomor && onSelectSurah(prevSurahNomor)}
              disabled={!prevSurahNomor}
              aria-label="Surah Sebelumnya"
              title="Surah Sebelumnya"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Quick dropdown */}
            <select
              value={currentSurahNomor}
              onChange={(e) => onSelectSurah(Number(e.target.value))}
              aria-label="Pilih Surah"
              className="text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#f3ead7] [body.theme-sepia_&]:border-[#dec9a5] text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
            >
              {SURAH_METADATA_LIST.map((s) => (
                <option key={s.nomor} value={s.nomor}>
                  {s.nomor}. {s.namaLatin} ({s.arti})
                </option>
              ))}
            </select>

            <button
              onClick={() => nextSurahNomor && onSelectSurah(nextSurahNomor)}
              disabled={!nextSurahNomor}
              aria-label="Surah Selanjutnya"
              title="Surah Selanjutnya"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Reading Customization Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            
            {/* Tajwid Toggle */}
            <button
              onClick={() => onUpdateSettings({ showTajwid: !settings.showTajwid })}
              aria-label={`Toggle Tajwid: ${settings.showTajwid ? 'Aktif' : 'Nonaktif'}`}
              title="Aktifkan / Nonaktifkan Warna Tajwid"
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border ${
                settings.showTajwid
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tajwid</span>
            </button>

            {/* Transliteration (Latin) Toggle */}
            <button
              onClick={() => onUpdateSettings({ showLatin: !settings.showLatin })}
              aria-label="Toggle Latin Transliterasi"
              title="Tampilkan / Sembunyikan Tulisan Latin"
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                settings.showLatin
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              Latin
            </button>

            {/* Translation Toggle */}
            <button
              onClick={() => onUpdateSettings({ showTranslation: !settings.showTranslation })}
              aria-label="Toggle Terjemahan Indonesia"
              title="Tampilkan / Sembunyikan Terjemahan Indonesia"
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                settings.showTranslation
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              Arti
            </button>

            {/* Font Size A- / A+ */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => onUpdateSettings({ arabicFontSize: Math.max(20, settings.arabicFontSize - 2) })}
                aria-label="Perkecil Ukuran Huruf Arab"
                title="Perkecil Ukuran Huruf Arab"
                className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer font-bold"
              >
                A-
              </button>
              <span className="px-2 py-1.5 text-[11px] text-slate-400 font-mono tabular-nums border-x border-slate-200 dark:border-slate-800">
                {settings.arabicFontSize}px
              </span>
              <button
                onClick={() => onUpdateSettings({ arabicFontSize: Math.min(48, settings.arabicFontSize + 2) })}
                aria-label="Perbesar Ukuran Huruf Arab"
                title="Perbesar Ukuran Huruf Arab"
                className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer font-bold"
              >
                A+
              </button>
            </div>

            {/* Info Tafsir */}
            <button
              onClick={() => setShowTafsirInfo(!showTafsirInfo)}
              aria-label="Informasi dan Asbabun Nuzul Surah"
              title="Tentang Surah Ini"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                showTafsirInfo
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>

      {/* Surah Header Card */}
      <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5] space-y-3">
        <div className="font-arabic text-4xl sm:text-5xl font-bold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#2c2217]">
          {surah.nama}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Surah {surah.namaLatin}
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
          <span>{surah.arti}</span>
          <span aria-hidden="true">·</span>
          <span>{surah.tempatTurun}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{surah.jumlahAyat} Ayat</span>
        </div>

        {/* Audio Recitation Action */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              if (onPlaySurahFullAudio) {
                onPlaySurahFullAudio(surah.nomor);
              } else if (surah.ayat.length > 0) {
                const firstAyah = surah.ayat[0];
                const audioUrl = firstAyah.audio?.alafasy || getAyahAudioUrl(surah.nomor, firstAyah.nomorAyat);
                onPlayAyahAudio(surah.nomor, firstAyah.nomorAyat, audioUrl);
              }
            }}
            aria-label={`Putar Murottal Surah ${surah.namaLatin}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Putar Murottal Surah Ini</span>
          </button>
        </div>

        {/* Collapsible Surah Brief Info */}
        {showTafsirInfo && (
          <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/50 text-left max-w-2xl mx-auto">
            <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#2c2217] mb-1">
              Tentang Surah {surah.namaLatin}
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826]">
              {surah.deskripsi}
            </p>
          </div>
        )}
      </div>

      {/* Bismillah Calligraphy (Shown for all surahs except Surah At-Taubah 9) */}
      {surah.nomor !== 9 && surah.nomor !== 1 && (
        <div className="text-center py-6">
          <div className="font-arabic text-3xl sm:text-4xl text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217] tracking-wider">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
          {settings.showLatin && (
            <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] italic mt-2">
              Bismillāhir-raḥmānir-raḥīm
            </p>
          )}
          {settings.showTranslation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49] mt-0.5">
              Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
            </p>
          )}
        </div>
      )}

      {/* Ayahs List */}
      <div className="space-y-6">
        {surah.ayat.map((ayah) => {
          const isBookmarked = isAyahBookmarked(bookmarks, surah.nomor, ayah.nomorAyat);
          const isPlayingThisAyah =
            currentPlayingAudio?.surahNomor === surah.nomor &&
            currentPlayingAudio?.ayahNomor === ayah.nomorAyat &&
            currentPlayingAudio?.isPlaying;
          const isHighlighted = highlightedAyah === ayah.nomorAyat;

          return (
            <article
              key={ayah.nomorAyat}
              ref={(el) => {
                if (el) ayahRefs.current.set(ayah.nomorAyat, el);
                else ayahRefs.current.delete(ayah.nomorAyat);
              }}
              className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                isHighlighted
                  ? 'ring-2 ring-emerald-500 shadow-md ring-offset-2 dark:ring-offset-slate-950 [body.theme-sepia_&]:ring-offset-[#fbf5e8]'
                  : ''
              } ${
                isPlayingThisAyah
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-sm [body.theme-sepia_&]:bg-[#ebdcc0] [body.theme-sepia_&]:border-[#cbbda2]'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6]'
              }`}
            >
              {/* Ayah Top Action Bar */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60 [body.theme-sepia_&]:border-[#e8dec9]/80">
                
                {/* Ayah Index Frame */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:bg-[#ebdcc0] [body.theme-sepia_&]:text-[#2c2217]">
                    {surah.nomor}:{ayah.nomorAyat}
                  </div>
                  {isPlayingThisAyah && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Memutar Audio</span>
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  
                  {/* Play audio button */}
                  <button
                    onClick={() => {
                      const audioUrl = ayah.audio?.alafasy || getAyahAudioUrl(surah.nomor, ayah.nomorAyat);
                      onPlayAyahAudio(surah.nomor, ayah.nomorAyat, audioUrl);
                    }}
                    aria-label={`Putar audio ayat ${ayah.nomorAyat}`}
                    title="Putar Lantunan Ayat Ini"
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      isPlayingThisAyah
                        ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isPlayingThisAyah ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={() => handleBookmarkClick(ayah)}
                    aria-label={`Tandai Ayat ${ayah.nomorAyat}`}
                    title={isBookmarked ? 'Hapus dari Tersimpan' : 'Simpan Ayat & Tambah Catatan'}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      isBookmarked
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyAyah(ayah)}
                    aria-label={`Salin Ayat ${ayah.nomorAyat}`}
                    title="Salin Ayat & Terjemahan"
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    {copiedAyah === ayah.nomorAyat ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Share button */}
                  <button
                    onClick={() => onOpenShareModal(surah.namaLatin, surah.nomor, ayah)}
                    aria-label={`Bagikan Ayat ${ayah.nomorAyat}`}
                    title="Bagikan Kartu Ayat"
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* Tafsir button */}
                  <button
                    onClick={() => setSelectedTafsirAyah(ayah)}
                    aria-label={`Lihat Tafsir Ayat ${ayah.nomorAyat}`}
                    title="Lihat Tafsir Kemenag RI"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Tafsir</span>
                  </button>

                </div>

              </div>

              {/* Arabic Verse Text */}
              <div
                className={`py-5 arabic-verse ${
                  settings.arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'
                } text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]`}
                style={{ fontSize: `${settings.arabicFontSize}px` }}
              >
                {settings.showTajwid ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: renderTajwidHtml(ayah.teksArab, true)
                    }}
                  />
                ) : (
                  ayah.teksArab
                )}
                <span className="inline-flex items-center justify-center px-2 text-base text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-[#4d3c2a] select-none">
                  ﴿{ayah.nomorAyat}﴾
                </span>
              </div>

              {/* Transliteration (Latin) */}
              {settings.showLatin && (
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 [body.theme-sepia_&]:text-[#624f3a] font-normal italic leading-relaxed pt-1">
                  {ayah.teksLatin}
                </p>
              )}

              {/* Indonesian Translation (Kemenag) */}
              {settings.showTranslation && (
                <p
                  className="text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#3b2e20] leading-relaxed pt-2"
                  style={{ fontSize: `${settings.translationFontSize}px` }}
                >
                  {ayah.teksIndonesia}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* Surah Bottom Pagination */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5]">
        {prevSurahNomor ? (
          <button
            onClick={() => onSelectSurah(prevSurahNomor)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Surah Sebelumnya</span>
          </button>
        ) : <div />}

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Ke Atas</span>
        </button>

        {nextSurahNomor ? (
          <button
            onClick={() => onSelectSurah(nextSurahNomor)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            <span>Surah Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>

      {/* Optional Note Modal when Bookmarking */}
      {noteModalAyah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Simpan Ayat ke Penanda
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
              QS. {surah.namaLatin} : Ayat {noteModalAyah.nomorAyat}
            </p>
            <div>
              <label htmlFor="catatan-pribadi" className="block text-xs font-medium text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#382c1e] mb-1">
                Catatan / Refleksi Pribadi (Opsional):
              </label>
              <textarea
                id="catatan-pribadi"
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Contoh: Ayat favorit pengingat sabar, dibaca saat shalat tahajud..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 [body.theme-sepia_&]:bg-[#ebdcc0]/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteModalAyah(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBookmarkWithNote}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-sm"
              >
                Simpan Penanda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {selectedTafsirAyah && (
        <TafsirModal
          isOpen={!!selectedTafsirAyah}
          onClose={() => setSelectedTafsirAyah(null)}
          surahNomor={surah.nomor}
          surahName={surah.namaLatin}
          totalAyah={surah.jumlahAyat}
          currentAyah={selectedTafsirAyah}
          onNavigateAyah={(newAyahNomor) => {
            const found = surah.ayat.find((a) => a.nomorAyat === newAyahNomor);
            if (found) setSelectedTafsirAyah(found);
          }}
        />
      )}

    </div>
  );
};
