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
  CheckCircle2,
  Volume2,
  Info,
  Sparkles,
  ArrowUp,
  BookOpen
} from 'lucide-react';
import { SurahDetail, Ayah, ReadingSettings, BookmarkItem, ReadingHistoryItem } from '../types/quran';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';
import { fetchSurahDetail, getAyahAudioUrl } from '../services/quranApi';
import { renderTajwidHtml, normalizeQuranicText } from '../data/tajwidRules';
import { getGharibBySurah, getGharibBySurahAyah } from '../data/gharibData';
import {
  isAyahBookmarked,
  countAyahsInRanges,
  extractItemRanges,
  normalizeAyahRanges
} from '../utils/quranLogic';
import { TafsirModal } from './TafsirModal';

interface SurahReaderViewProps {
  currentSurahNomor: number;
  initialAyahNomor?: number;
  onSelectSurah: (nomor: number, initialAyah?: number) => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  bookmarks: BookmarkItem[];
  onToggleBookmark: (item: Omit<BookmarkItem, 'id' | 'timestamp'>) => void;
  readingHistory?: ReadingHistoryItem[];
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
  readingHistory = [],
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
  const [markedReadFeedbackAyah, setMarkedReadFeedbackAyah] = useState<number | null>(null);
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

  const handleMarkReadUpToAyah = (ayahNomor: number) => {
    if (!surah) return;
    onUpdateHistory({
      surahNomor: surah.nomor,
      surahNamaLatin: surah.namaLatin,
      ayatNomor: ayahNomor,
      highestAyatRead: ayahNomor,
      readRanges: [[1, ayahNomor]],
      totalAyat: surah.jumlahAyat,
      timestamp: Date.now()
    });
    setMarkedReadFeedbackAyah(ayahNomor);
    setTimeout(() => {
      setMarkedReadFeedbackAyah((prev) => (prev === ayahNomor ? null : prev));
    }, 2200);
  };

  const surahHistoryItems = readingHistory.filter((h) => h.surahNomor === currentSurahNomor);
  const currentSurahRanges = surah
    ? normalizeAyahRanges(
        surahHistoryItems.flatMap((h) => extractItemRanges(h, surah.jumlahAyat)),
        surah.jumlahAyat
      )
    : [];
  const currentSurahReadCount = surah
    ? countAyahsInRanges(currentSurahRanges, [1, surah.jumlahAyat])
    : 0;
  const currentSurahLastVisited = surahHistoryItems[0]?.ayatNomor ?? 1;
  const isCurrentSurahCompleted = surah ? currentSurahReadCount >= surah.jumlahAyat : false;

  const prevSurahNomor = currentSurahNomor > 1 ? currentSurahNomor - 1 : null;
  const nextSurahNomor = currentSurahNomor < 114 ? currentSurahNomor + 1 : null;
  const surahGharibList = getGharibBySurah(currentSurahNomor);

  const jumpToAyahInSurah = (ayahNo: number) => {
    const el = ayahRefs.current.get(ayahNo);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedAyah(ayahNo);
      setTimeout(() => {
        setHighlightedAyah((prev) => (prev === ayahNo ? null : prev));
      }, 3500);
    }
  };

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
      
      {/* Reader Navigation & Toolstrip (sticky on >=1024px desktop/iPad landscape, inline on phones & iPad portrait to preserve 85%+ open reading canvas) */}
      <div className="lg:sticky lg:top-16 z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 [body.theme-sepia_&]:bg-[#fbf5e8]/95 [body.theme-sepia_&]:border-[#e8dec9]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Surah Selector & Step Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => prevSurahNomor && onSelectSurah(prevSurahNomor)}
              disabled={!prevSurahNomor}
              aria-label="Surah Sebelumnya"
              title="Surah Sebelumnya"
              className="min-w-10 min-h-10 lg:min-w-0 lg:min-h-0 p-1.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Quick dropdown */}
            <select
              value={currentSurahNomor}
              onChange={(e) => onSelectSurah(Number(e.target.value))}
              aria-label="Pilih Surah"
              className="min-h-10 lg:min-h-0 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#f3ead7] [body.theme-sepia_&]:border-[#dec9a5] text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer max-w-[215px] sm:max-w-none truncate"
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
              className="min-w-10 min-h-10 lg:min-w-0 lg:min-h-0 p-1.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Reading Customization Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            
            {/* Tajwid Toggle */}
            <button
              onClick={() => onUpdateSettings({ showTajwid: !settings.showTajwid })}
              aria-label={`Toggle Tajwid: ${settings.showTajwid ? 'Aktif' : 'Nonaktif'}`}
              title="Aktifkan / Nonaktifkan Warna Tajwid"
              className={`min-h-9 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border whitespace-nowrap ${
                settings.showTajwid
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tajwid</span>
            </button>

            {/* Bacaan Gharib Toggle */}
            <button
              onClick={() => onUpdateSettings({ showGharib: settings.showGharib === false })}
              aria-label={`Toggle Catatan Gharib: ${settings.showGharib !== false ? 'Aktif' : 'Nonaktif'}`}
              title="Tampilkan / Sembunyikan Catatan Bacaan Gharib (Imalah, Saktah, Isymam, dll)"
              className={`min-h-9 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border whitespace-nowrap ${
                settings.showGharib !== false
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              Gharib
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
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
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

        {/* Quick Jump Strip if Surah contains Bacaan Gharib */}
        {surahGharibList.length > 0 && settings.showGharib !== false && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-amber-800 dark:text-amber-300 [body.theme-sepia_&]:text-[#6b4423] font-medium">
              Bacaan Gharib di surah ini:
            </span>
            {surahGharibList.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => jumpToAyahInSurah(g.ayahNomor)}
                className="px-2.5 py-1 rounded-lg bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-medium cursor-pointer transition-colors"
              >
                Ayat {g.ayahNomor} ({g.kategoriNama.split(' ')[0]})
              </button>
            ))}
          </div>
        )}

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
          const ayahGharibNotes =
            settings.showGharib !== false ? getGharibBySurahAyah(surah.nomor, ayah.nomorAyat) : [];

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800/60 [body.theme-sepia_&]:border-[#e8dec9]/80">
                
                {/* Ayah Index Frame */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:bg-[#ebdcc0] [body.theme-sepia_&]:text-[#2c2217] shrink-0">
                    {surah.nomor}:{ayah.nomorAyat}
                  </div>
                  {isPlayingThisAyah ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Memutar Audio</span>
                    </span>
                  ) : currentSurahLastVisited === ayah.nomorAyat ? (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap">
                      Batas baca terakhir
                    </span>
                  ) : null}
                </div>

                {/* Actions: single clean row on mobile & desktop */}
                <div className="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto">
                  
                  {/* Mark Read Progress Up To This Ayah */}
                  <button
                    type="button"
                    onClick={() => handleMarkReadUpToAyah(ayah.nomorAyat)}
                    aria-label={`Tandai batas baca sampai ayat ${ayah.nomorAyat}`}
                    title="Tandai batas bacaan Khatam sampai ayat ini"
                    className={`min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2.5 sm:px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap ${
                      markedReadFeedbackAyah === ayah.nomorAyat || currentSurahLastVisited === ayah.nomorAyat
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">
                      {markedReadFeedbackAyah === ayah.nomorAyat ? 'Tercatat' : 'Batas Baca'}
                    </span>
                  </button>

                  {/* Play audio button */}
                  <button
                    onClick={() => {
                      const audioUrl = ayah.audio?.alafasy || getAyahAudioUrl(surah.nomor, ayah.nomorAyat);
                      onPlayAyahAudio(surah.nomor, ayah.nomorAyat, audioUrl);
                    }}
                    aria-label={`Putar audio ayat ${ayah.nomorAyat}`}
                    title="Putar Lantunan Ayat Ini"
                    className={`min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
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
                    className={`min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
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
                    className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
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
                    className="min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* Tafsir button */}
                  <button
                    onClick={() => setSelectedTafsirAyah(ayah)}
                    aria-label={`Lihat Tafsir Ayat ${ayah.nomorAyat}`}
                    title="Lihat Tafsir Kemenag RI"
                    className="min-h-10 sm:min-h-0 flex items-center gap-1.5 px-3 sm:px-2.5 py-1.5 sm:py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
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
                  normalizeQuranicText(ayah.teksArab)
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

              {/* Inline Catatan Bacaan Gharib (Musykilat Al-Qur'an) */}
              {ayahGharibNotes.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  {ayahGharibNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 [body.theme-sepia_&]:bg-[#ebdcc0]/70 border border-amber-200/80 dark:border-amber-800/60 [body.theme-sepia_&]:border-[#d6be94] space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-300 [body.theme-sepia_&]:text-[#5c3a19]">
                          <span>Catatan Bacaan Gharib</span>
                          <span aria-hidden="true">·</span>
                          <span>{note.kategoriNama}</span>
                        </div>
                        <span className="font-arabic text-lg font-bold text-amber-900 dark:text-amber-200 [body.theme-sepia_&]:text-[#2c2217]">
                          {normalizeQuranicText(note.lafazhArab)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#3b2d1c]">
                        Cara Baca: <span className="italic">{note.caraBacaLatin}</span>
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] leading-relaxed">
                        {note.panduanBaca}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* End-of-Surah Khatam Completion Strip */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            {isCurrentSurahCompleted
              ? `Alhamdulillah, Surah ${surah.namaLatin} Tercatat Tuntas`
              : `Selesai Membaca Surah ${surah.namaLatin}?`}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Progres Khatam surah ini: {currentSurahReadCount} / {surah.jumlahAyat} ayat (
            {Math.round((currentSurahReadCount / surah.jumlahAyat) * 100)}%)
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleMarkReadUpToAyah(surah.jumlahAyat)}
          disabled={isCurrentSurahCompleted}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            isCurrentSurahCompleted
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isCurrentSurahCompleted
              ? 'Surah Selesai Dibaca (100%)'
              : 'Tandai Surah Selesai Dibaca'}
          </span>
        </button>
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

      {/* Optional Note Modal when Bookmarking (Bottom Sheet on Mobile) */}
      {noteModalAyah && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-1" />
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
                className="w-full p-2.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 [body.theme-sepia_&]:bg-[#ebdcc0]/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteModalAyah(null)}
                className="min-h-11 sm:min-h-0 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBookmarkWithNote}
                className="min-h-11 sm:min-h-0 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-sm"
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
