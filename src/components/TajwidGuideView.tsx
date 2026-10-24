import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Volume2,
  Search,
  X,
  ArrowUpRight
} from 'lucide-react';
import { TAJWID_RULES, normalizeQuranicText } from '../data/tajwidRules';
import {
  GHARIB_CATEGORIES,
  GHARIB_ITEMS,
  GHARIB_AND_TAJWID_QUIZ,
  GharibCategoryId,
  filterGharibItems
} from '../data/gharibData';
import { getAyahAudioUrl } from '../services/quranApi';

export interface TajwidGuideViewProps {
  initialSection?: 'tajwid' | 'gharib' | 'quiz';
  onSelectSurah?: (surahNomor: number, ayahNomor?: number) => void;
  onPlayAyahAudio?: (surahNomor: number, ayahNomor: number, audioUrl: string) => void;
}

export const TajwidGuideView: React.FC<TajwidGuideViewProps> = ({
  initialSection = 'tajwid',
  onSelectSurah,
  onPlayAyahAudio
}) => {
  const [activeSection, setActiveSection] = useState<'tajwid' | 'gharib' | 'quiz'>(initialSection);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('ghunnah');

  // Gharib state
  const [selectedGharibCategory, setSelectedGharibCategory] = useState<GharibCategoryId>('semua');
  const [gharibSearch, setGharibSearch] = useState<string>('');

  // Quiz state
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const selectedRule = TAJWID_RULES.find((r) => r.id === selectedRuleId) || TAJWID_RULES[0];

  const activeCategoryDetail = useMemo(
    () =>
      selectedGharibCategory === 'semua'
        ? null
        : GHARIB_CATEGORIES.find((c) => c.id === selectedGharibCategory) || null,
    [selectedGharibCategory]
  );

  const filteredGharibList = useMemo(
    () => filterGharibItems(gharibSearch, selectedGharibCategory),
    [gharibSearch, selectedGharibCategory]
  );

  const currentQuiz = GHARIB_AND_TAJWID_QUIZ[quizIndex];

  const handleSelectQuizOption = (opt: string) => {
    if (quizAnswered) return;
    setSelectedOption(opt);
    setQuizAnswered(true);
    if (opt === currentQuiz.correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setQuizAnswered(false);
    if (quizIndex < GHARIB_AND_TAJWID_QUIZ.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
      setQuizScore(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5] space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900">
          <Sparkles className="w-4 h-4" />
          <span>Ilmu Tajwid & Musykilat Al-Qur'an · Standar Mushaf Kemenag RI</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            Panduan Tajwid Berwarna & Bacaan Gharib
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] max-w-3xl leading-relaxed">
            Pelajari kaidah warna tajwid beserta <strong>Bacaan Gharib (Ghorib)</strong> dalam Riwayat Hafsh 'an 'Ashim—meliputi Imalah, Isymam, Tashil, Naql, 4 ayat Saktah, Shifr Mustadir & Mustathil, Nun Wiqayah, hingga huruf Shad bertanda Sin lengkap dengan audio contoh dan tautan langsung ke Mushaf.
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div
          role="tablist"
          aria-label="Pilih Materi Pembelajaran Al-Qur'an"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-white/80 dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] rounded-xl max-w-full"
        >
          <button
            role="tab"
            type="button"
            aria-selected={activeSection === 'tajwid'}
            onClick={() => setActiveSection('tajwid')}
            className={`min-h-10 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'tajwid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Tajwid Berwarna ({TAJWID_RULES.length})
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={activeSection === 'gharib'}
            onClick={() => setActiveSection('gharib')}
            className={`min-h-10 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'gharib'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Bacaan Gharib ({GHARIB_ITEMS.length} Ayat)
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={activeSection === 'quiz'}
            onClick={() => setActiveSection('quiz')}
            className={`min-h-10 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'quiz'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white [body.theme-sepia_&]:text-[#5c4a36]'
            }`}
          >
            Kuis Latihan ({GHARIB_AND_TAJWID_QUIZ.length} Soal)
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: TAJWID BERWARNA
         ===================================================================== */}
      {activeSection === 'tajwid' && (
        <div className="space-y-8">
          {/* Visual Color Palette Legend Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Kamus Warna Tajwid Mushaf:
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('gharib')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Lihat juga Panduan Bacaan Gharib (Imalah, Saktah, Isymam)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {TAJWID_RULES.map((rule) => {
                const isSelected = selectedRuleId === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`min-h-14 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 bg-white dark:bg-slate-900 border-emerald-400 shadow-xs'
                        : 'bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: rule.hexColor }}
                      />
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {rule.nama.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {rule.kategori.replace('Hukum ', '')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rule Detail Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedRule.hexColor }}
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                    {selectedRule.nama}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedRule.kategori}
                  </p>
                </div>
              </div>
            </div>

            {/* Description & Pronunciation Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                  Pengertian & Ketentuan
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] leading-relaxed">
                  {selectedRule.deskripsi}
                </p>

                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] pt-2">
                  Cara Membaca
                </h4>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 [body.theme-sepia_&]:bg-[#ebdcc0]/60 [body.theme-sepia_&]:text-[#3b2d1c] leading-relaxed">
                  {selectedRule.caraBaca}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                  Huruf-Huruf Tajwid ({selectedRule.huruf.length} Huruf)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRule.huruf.map((h, i) => (
                    <span
                      key={i}
                      className="font-arabic text-lg px-3 py-1 bg-slate-100 dark:bg-slate-800 [body.theme-sepia_&]:bg-[#ebdcc0] text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217] rounded-lg border border-slate-200 dark:border-slate-700/60 text-center font-bold"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] pt-2">
                  Contoh Naskah Al-Qur'an
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <div className="font-arabic text-2xl text-right text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] leading-relaxed">
                    {normalizeQuranicText(selectedRule.contohArab)}
                  </div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 italic">
                    {selectedRule.contohLatin}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#5e4d39]">
                    {selectedRule.penjelasanContoh}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: BACAAN GHARIB (MUSYKILAT AL-QUR'AN)
         ===================================================================== */}
      {activeSection === 'gharib' && (
        <div className="space-y-6">
          {/* Search & Category Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  enterKeyHint="search"
                  value={gharibSearch}
                  onChange={(e) => setGharibSearch(e.target.value)}
                  placeholder="Cari bacaan gharib, surah, atau lafazh (mis. Imalah, Saktah, Yasin)..."
                  className="w-full pl-10 pr-9 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#dec9a5] text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                {gharibSearch && (
                  <button
                    type="button"
                    onClick={() => setGharibSearch('')}
                    aria-label="Bersihkan pencarian gharib"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] tabular-nums">
                Menampilkan {filteredGharibList.length} ayat khusus · Riwayat Hafsh 'an 'Ashim
              </div>
            </div>

            {/* Interactive Category Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedGharibCategory('semua')}
                className={`min-h-10 px-3.5 py-1.5 text-xs font-medium rounded-xl border whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                  selectedGharibCategory === 'semua'
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                Semua Gharib ({GHARIB_ITEMS.length})
              </button>

              {GHARIB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedGharibCategory(cat.id)}
                  className={`min-h-10 px-3.5 py-1.5 text-xs font-medium rounded-xl border whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    selectedGharibCategory === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {cat.nama}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Category Explanation Box */}
          {activeCategoryDetail ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#f6eee0] border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:border-[#dec9a5] space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                  Kaidah {activeCategoryDetail.nama}
                </h2>
                <span className="font-arabic text-xl text-emerald-700 dark:text-emerald-400">
                  {activeCategoryDetail.istilahArab}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#3b2e20] leading-relaxed">
                {activeCategoryDetail.pengertian}
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900 font-medium pt-1">
                Pedoman Praktis: {activeCategoryDetail.pedomanPraktis}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GHARIB_CATEGORIES.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedGharibCategory(cat.id)}
                  className="p-3.5 rounded-xl text-left bg-white dark:bg-slate-900/60 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-400/70 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                      {cat.nama}
                    </span>
                    <span className="font-arabic text-sm text-emerald-700 dark:text-emerald-400">
                      {cat.istilahArab}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                    {cat.ringkasan}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Gharib Verses Grid (1 col on phone, 2 cols on iPad/Tablet & Desktop) */}
          {filteredGharibList.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Bacaan Gharib tidak ditemukan
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coba kata kunci seperti Imalah, Isymam, Tashil, Naql, Saktah, Ana, atau nama surah.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGharibSearch('');
                  setSelectedGharibCategory('semua');
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg cursor-pointer"
              >
                Tampilkan Semua Bacaan Gharib
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredGharibList.map((item) => (
                <article
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#e5dac6] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3.5">
                    {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {item.kategoriNama}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-medium">
                          QS. {item.surahNamaLatin} [{item.surahNomor}]: Ayat {item.ayahNomor}
                        </span>
                      </div>
                      <span className="font-arabic text-base font-bold text-amber-700 dark:text-amber-400 shrink-0">
                        {normalizeQuranicText(item.lafazhArab)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                      {item.judul}
                    </h3>

                    {/* Arabic Excerpt Box */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 [body.theme-sepia_&]:bg-[#ebdcc0]/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                      <div className="arabic-verse font-arabic text-2xl sm:text-[26px] text-right text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] leading-relaxed">
                        {normalizeQuranicText(item.potonganAyatArab)}
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Cara Baca: <span className="font-normal italic">{item.caraBacaLatin}</span>
                        </p>
                        {item.hindariBacaan && (
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 [body.theme-sepia_&]:text-[#6b4423]">
                            Perhatian: {item.hindariBacaan}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Practical Explanation */}
                    <div className="space-y-1.5 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#3b2e20] leading-relaxed">
                      <p>{item.panduanBaca}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
                        {item.penjelasanKaidah}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Actions: Play Audio & Jump to Mushaf */}
                  {(onPlayAyahAudio || onSelectSurah) && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/70 flex flex-wrap items-center justify-end gap-2">
                      {onPlayAyahAudio && (
                        <button
                          type="button"
                          onClick={() =>
                            onPlayAyahAudio(
                              item.surahNomor,
                              item.ayahNomor,
                              getAyahAudioUrl(item.surahNomor, item.ayahNomor)
                            )
                          }
                          aria-label={`Putar contoh audio QS. ${item.surahNamaLatin} ayat ${item.ayahNomor}`}
                          className="min-h-10 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Putar Ayat</span>
                        </button>
                      )}

                      {onSelectSurah && (
                        <button
                          type="button"
                          onClick={() => onSelectSurah(item.surahNomor, item.ayahNomor)}
                          aria-label={`Buka QS. ${item.surahNamaLatin} ayat ${item.ayahNomor} di Mushaf`}
                          className="min-h-10 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shadow-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Buka di Mushaf</span>
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: KUIS LATIHAN TAJWID & BACAAN GHARIB
         ===================================================================== */}
      {activeSection === 'quiz' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-5 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Kuis Tajwid & Gharib · Soal {quizIndex + 1} dari {GHARIB_AND_TAJWID_QUIZ.length}
              </h2>
            </div>
            <div className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              Skor Benar: {quizScore} / {GHARIB_AND_TAJWID_QUIZ.length}
            </div>
          </div>

          {/* Verse Highlight */}
          <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#ebdcc0]/40 rounded-xl space-y-2.5 border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Topik {currentQuiz.topik} · {currentQuiz.reference}
            </div>
            <div className="font-arabic text-3xl sm:text-4xl text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#2c2217] font-bold leading-relaxed">
              {normalizeQuranicText(currentQuiz.verseArabic)}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] max-w-xl mx-auto pt-1">
              {currentQuiz.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuiz.options.map((opt) => {
              const isCorrect = opt === currentQuiz.correct;
              const isChosen = selectedOption === opt;

              let btnStyle =
                'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-800 dark:text-slate-200';
              if (quizAnswered) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold';
                } else if (isChosen) {
                  btnStyle =
                    'bg-red-50 dark:bg-red-950/70 border-red-500 text-red-800 dark:text-red-300 font-semibold';
                } else {
                  btnStyle = 'opacity-55 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={quizAnswered}
                  onClick={() => handleSelectQuizOption(opt)}
                  className={`min-h-12 p-3.5 rounded-xl border text-left text-xs sm:text-[13px] font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {quizAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quiz Feedback & Next Button */}
          {quizAnswered && (
            <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60">
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">Penjelasan:</strong>{' '}
                {currentQuiz.explanation}
              </p>
              <button
                type="button"
                onClick={handleNextQuiz}
                className="min-h-10 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shrink-0 self-end sm:self-auto whitespace-nowrap"
              >
                {quizIndex < GHARIB_AND_TAJWID_QUIZ.length - 1
                  ? 'Soal Berikutnya'
                  : 'Ulangi Kuis'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
