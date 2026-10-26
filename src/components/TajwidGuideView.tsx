import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Volume2,
  Search,
  FlaskConical,
  FileText,
  ListChecks,
  RotateCcw,
  ArrowUpRight,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import {
  TAJWID_BOOK_META,
  TAJWID_RULES,
  TAJWID_CATEGORIES,
  TAJWID_BOOK_QUESTIONS,
  TAJWID_LAB_VERSES,
  TAJWID_QUIZ_QUESTIONS,
  renderTajwidHtml,
  analyzeTajwidOccurrences,
  getTajwidRuleById,
  resolveTajwidPdfUrl
} from '../data/tajwidRules';

type TajwidSectionTab = 'pelajaran' | 'soal-buku' | 'lab' | 'kuis' | 'pdf';

const HAFAL_STORAGE_KEY = 'quran_tajwid_qiraati_hafal_v1';

function renderFormulaText(formula: string, compact: boolean = false): React.ReactNode {
  const hasLatin = /[A-Za-z]/.test(formula);
  if (!hasLatin) {
    return (
      <span
        dir="rtl"
        className={`font-arabic ${
          compact ? 'text-base' : 'text-xl sm:text-2xl'
        } font-bold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#2c2217]`}
      >
        {formula}
      </span>
    );
  }

  const parts = formula.split(/([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/g);
  return (
    <span
      dir="ltr"
      className={`${
        compact ? 'text-xs' : 'text-sm sm:text-base'
      } font-bold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#2c2217] inline-flex flex-wrap items-baseline gap-1`}
    >
      {parts.map((part, idx) =>
        /[\u0600-\u06FF]/.test(part) ? (
          <bdi
            key={idx}
            dir="rtl"
            className={`font-arabic ${compact ? 'text-base' : 'text-xl sm:text-2xl'} font-bold`}
          >
            {part}
          </bdi>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </span>
  );
}

interface TajwidGuideViewProps {
  onJumpToSurah?: (surahNomor: number, ayahNomor?: number) => void;
  initialSection?: TajwidSectionTab;
  onSectionChange?: (section: TajwidSectionTab) => void;
}

export const TajwidGuideView: React.FC<TajwidGuideViewProps> = ({
  onJumpToSurah,
  initialSection = 'pelajaran',
  onSectionChange
}) => {
  const [activeSection, setActiveSection] = useState<TajwidSectionTab>(initialSection);

  useEffect(() => {
    setActiveSection((prev) => (prev === initialSection ? prev : initialSection));
  }, [initialSection]);

  const handleSelectSection = (nextSection: TajwidSectionTab) => {
    setActiveSection(nextSection);
    onSectionChange?.(nextSection);
  };

  // Section 1: Pelajaran 1–13 state
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Pelajaran');
  const [ruleSearch, setRuleSearch] = useState<string>('');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('ghunnah');
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Section 2: 33 Soal Buku (Hal. 35–37) state
  const [bookQuestionSearch, setBookQuestionSearch] = useState<string>('');
  const [openAnswerIds, setOpenAnswerIds] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);
  const [memorizedNumbers, setMemorizedNumbers] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(HAFAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((n) => typeof n === 'number');
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(HAFAL_STORAGE_KEY, JSON.stringify(memorizedNumbers));
    } catch {
      // ignore storage errors
    }
  }, [memorizedNumbers]);

  // Section 3: Lab Deteksi Ayat state
  const [labArabicText, setLabArabicText] = useState<string>(TAJWID_LAB_VERSES[0].arabic);
  const [activePresetId, setActivePresetId] = useState<string>(TAJWID_LAB_VERSES[0].id);
  const [inspectedLabRuleId, setInspectedLabRuleId] = useState<string | null>(null);

  // Section 4: Kuis Pilihan Ganda state
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const filteredRules = useMemo(() => {
    const q = ruleSearch.trim().toLowerCase();
    return TAJWID_RULES.filter((rule) => {
      const matchCat = selectedCategory === 'Semua Pelajaran' || rule.kategori === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        rule.nama.toLowerCase().includes(q) ||
        rule.kategori.toLowerCase().includes(q) ||
        rule.deskripsi.toLowerCase().includes(q) ||
        rule.halamanBuku.toLowerCase().includes(q) ||
        `pelajaran ke-${rule.pelajaranKe}`.includes(q) ||
        `pelajaran ${rule.pelajaranKe}`.includes(q) ||
        rule.huruf.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, ruleSearch]);

  const selectedRule = useMemo(() => {
    const inFiltered = filteredRules.find((r) => r.id === selectedRuleId);
    if (inFiltered) return inFiltered;
    return filteredRules[0] || TAJWID_RULES[0];
  }, [filteredRules, selectedRuleId]);

  const filteredBookQuestions = useMemo(() => {
    const q = bookQuestionSearch.trim().toLowerCase();
    if (!q) return TAJWID_BOOK_QUESTIONS;
    return TAJWID_BOOK_QUESTIONS.filter(
      (item) =>
        String(item.nomor) === q ||
        item.pertanyaan.toLowerCase().includes(q) ||
        item.jawaban.toLowerCase().includes(q) ||
        item.pelajaran.toLowerCase().includes(q)
    );
  }, [bookQuestionSearch]);

  const labOccurrences = useMemo(
    () => analyzeTajwidOccurrences(labArabicText),
    [labArabicText]
  );

  const inspectedLabRule = useMemo(() => {
    if (inspectedLabRuleId) {
      return getTajwidRuleById(inspectedLabRuleId) || null;
    }
    if (labOccurrences.length > 0) {
      return getTajwidRuleById(labOccurrences[0].ruleId) || null;
    }
    return null;
  }, [inspectedLabRuleId, labOccurrences]);

  const currentQuiz = TAJWID_QUIZ_QUESTIONS[quizIndex];

  const handleSpeakArabic = (arabicSample: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = arabicSample
        .replace(/[←❖۝]/g, ' ')
        .split('·')[0]
        .trim();
      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.lang = 'ar-SA';
      utter.rate = 0.8;
      setSpeakingText(arabicSample);
      utter.onend = () => setSpeakingText(null);
      utter.onerror = () => setSpeakingText(null);
      window.speechSynthesis.speak(utter);
    } catch {
      setSpeakingText(null);
    }
  };

  const handleToggleAnswer = (nomor: number) => {
    setOpenAnswerIds((prev) => ({
      ...prev,
      [nomor]: !(showAllAnswers ? true : !!prev[nomor])
    }));
    if (showAllAnswers) {
      setShowAllAnswers(false);
    }
  };

  const handleToggleAllAnswers = () => {
    const next = !showAllAnswers;
    setShowAllAnswers(next);
    if (!next) {
      setOpenAnswerIds({});
    }
  };

  const handleToggleMemorized = (nomor: number) => {
    setMemorizedNumbers((prev) =>
      prev.includes(nomor) ? prev.filter((n) => n !== nomor) : [...prev, nomor]
    );
  };

  const handleJumpToRule = (ruleId: string) => {
    setSelectedCategory('Semua Pelajaran');
    setRuleSearch('');
    setSelectedRuleId(ruleId);
    handleSelectSection('pelajaran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLabVerseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-tajwid]') as HTMLElement | null;
    if (target) {
      const ruleId = target.getAttribute('data-tajwid');
      if (ruleId) {
        setInspectedLabRuleId(ruleId);
      }
    }
  };

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
    if (quizIndex < TAJWID_QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
      setQuizScore(0);
    }
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizAnswered(false);
  };

  const SECTION_TABS: Array<{
    id: TajwidSectionTab;
    label: string;
    shortLabel: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'pelajaran',
      label: `Pelajaran 1–13 (${TAJWID_RULES.length} Kaidah)`,
      shortLabel: '13 Pelajaran',
      Icon: Sparkles
    },
    {
      id: 'soal-buku',
      label: `33 Soal Buku (Hal. 35–37)`,
      shortLabel: '33 Soal Buku',
      Icon: ListChecks
    },
    {
      id: 'lab',
      label: 'Lab Deteksi Ayat',
      shortLabel: 'Lab Ayat',
      Icon: FlaskConical
    },
    {
      id: 'kuis',
      label: `Kuis Evaluasi (${TAJWID_QUIZ_QUESTIONS.length})`,
      shortLabel: 'Kuis Tajwid',
      Icon: HelpCircle
    },
    {
      id: 'pdf',
      label: 'Buku PDF Asli',
      shortLabel: 'Buku PDF',
      Icon: FileText
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header Banner — Exact Attribution to Uploaded Book */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900 font-medium">
            <span>{TAJWID_BOOK_META.subjudul}</span>
            <span aria-hidden="true">·</span>
            <span>Penyusun: {TAJWID_BOOK_META.penyusun}</span>
            <span aria-hidden="true">·</span>
            <span>Pelajaran ke-1 s/d ke-13 (Hal. 1–37)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] text-balance">
            {TAJWID_BOOK_META.judul} (Qira'ati)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] leading-relaxed">
            Disusun akurat sesuai buku asli: mencakup seluruh 13 Pelajaran mulai dari Ghunnah, Perbedaan Nun Sukun & Tanwin, 5 Hukum Nun Sukun/Tanwin, 3 Hukum Mim Sukun, Idgham Mutamatsilain, Mutajanisain & Mutaqarribain, Qalqalah Shughra & Kubra, Lafadh Allah, Al Syamsiyah & Qamariyah, Idzhar Wajib (4 kata), Hukum Ra, Hukum Mad (Mad Thabi'i & 13 Mad Far'i), hingga 33 Soal Evaluasi halaman 35–37.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSelectSection('pdf')}
            className="min-h-11 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Buka Lembar Buku PDF Asli</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Navigation Segmented Bar */}
      <div
        role="tablist"
        aria-label="Menu Pelajaran Ilmu Tajwid Praktis"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-1.5 sm:py-1.5 sm:bg-slate-100/90 sm:dark:bg-slate-900/80 sm:[body.theme-sepia_&]:bg-[#efe4ce] sm:rounded-2xl sm:border sm:border-slate-200/70 sm:dark:border-slate-800"
      >
        {SECTION_TABS.map(({ id, label, shortLabel, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelectSection(id)}
              className={`min-h-11 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs sm:bg-white sm:dark:bg-slate-800 sm:text-emerald-700 sm:dark:text-emerald-300 [body.theme-sepia_&]:sm:bg-[#fbf5e8]'
                  : 'bg-white/80 dark:bg-slate-900/60 sm:bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-800 sm:border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
              <span className="lg:hidden">{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PELAJARAN KE-1 S/D KE-13 (AKURAT SESUAI URUTAN & ISI PDF)      */}
      {/* ===================================================================== */}
      {activeSection === 'pelajaran' && (
        <section className="space-y-6" aria-label="Daftar Pelajaran ke-1 sampai ke-13">
          {/* Lesson Filter & Search Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {TAJWID_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      const firstMatch =
                        cat === 'Semua Pelajaran'
                          ? TAJWID_RULES[0]
                          : TAJWID_RULES.find((r) => r.kategori === cat);
                      if (firstMatch) setSelectedRuleId(firstMatch.id);
                    }}
                    className={`min-h-10 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                        : 'bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Cari pelajaran, halaman, huruf..."
                aria-label="Cari materi pelajaran tajwid"
                className="w-full min-h-10 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 [body.theme-sepia_&]:bg-[#f6eee0] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* 2-Column Split View on Tablet/iPad (md: 768px+) & Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Master List */}
            <div className="md:col-span-5 lg:col-span-4 space-y-2 md:max-h-[780px] md:overflow-y-auto md:pr-1">
              {filteredRules.length === 0 ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                  Tidak ada materi yang cocok dengan "{ruleSearch}".
                </div>
              ) : (
                filteredRules.map((rule) => {
                  const isSelected = selectedRule.id === rule.id;
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setSelectedRuleId(rule.id)}
                      className={`w-full p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-xs [body.theme-sepia_&]:bg-[#ebdcc0]'
                          : 'bg-white dark:bg-slate-900/60 [body.theme-sepia_&]:bg-[#f6eee0] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <span>Pelajaran ke-{rule.pelajaranKe}</span>
                          <span aria-hidden="true">·</span>
                          <span>{rule.halamanBuku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: rule.hexColor }}
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
                            {rule.nama}
                          </span>
                        </div>
                        {rule.kadarHarakat && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {rule.kadarHarakat}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Detail Deck */}
            {selectedRule && (
              <div className="md:col-span-7 lg:col-span-8 md:sticky md:top-20 p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#e5dac6] space-y-6">
                {/* Rule Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/70">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedRule.urutanBuku || `Pelajaran ke-${selectedRule.pelajaranKe}`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Buku {selectedRule.halamanBuku}</span>
                      {selectedRule.kadarHarakat && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {selectedRule.kadarHarakat}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-0.5">
                      <span
                        className="w-4 h-4 rounded-xs shrink-0"
                        style={{ backgroundColor: selectedRule.hexColor }}
                        aria-hidden="true"
                      />
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                        {selectedRule.nama}
                      </h2>
                    </div>
                  </div>

                  {selectedRule.rujukanSurah && onJumpToSurah && (
                    <button
                      type="button"
                      onClick={() =>
                        onJumpToSurah(
                          selectedRule.rujukanSurah!.surahNomor,
                          selectedRule.rujukanSurah!.ayatNomor
                        )
                      }
                      className="min-h-10 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Lihat {selectedRule.rujukanSurah.label}</span>
                    </button>
                  )}
                </div>

                {/* Rumus Papan Tulis Qira'ati (Sesuai Gambar Buku) */}
                {selectedRule.rumusArab && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/60 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Rumus di Buku ({selectedRule.halamanBuku}):
                    </span>
                    {renderFormulaText(selectedRule.rumusArab, false)}
                  </div>
                )}

                {/* Definition & Letters Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                        Kaidah Sesuai Buku PDF
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] leading-relaxed">
                        {selectedRule.deskripsi}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                        Cara Membaca & Panjang Bacaan
                      </h3>
                      <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 [body.theme-sepia_&]:bg-[#ebdcc0]/60 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 [body.theme-sepia_&]:text-[#3b2d1c] leading-relaxed">
                        {selectedRule.caraBaca}
                      </div>
                    </div>

                    {selectedRule.tingkatan && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                          Kelompok Hafalan Huruf (Metode Tanpa Menghafal)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {selectedRule.tingkatan}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                        Huruf / Lafadz Kunci ({selectedRule.huruf.length})
                      </h3>
                      <div className="flex flex-wrap gap-2" dir="rtl">
                        {selectedRule.huruf.map((h, i) => (
                          <span
                            key={i}
                            className="font-arabic text-lg px-3 py-1 bg-slate-100 dark:bg-slate-800 [body.theme-sepia_&]:bg-[#ebdcc0] text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] rounded-lg border border-slate-200 dark:border-slate-700/70 font-bold"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                          Contoh Bacaan Utama di Buku
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleSpeakArabic(selectedRule.contohArab)}
                          aria-label={`Dengarkan pelafalan contoh ${selectedRule.nama}`}
                          className="min-h-9 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>
                            {speakingText === selectedRule.contohArab
                              ? 'Melafalkan...'
                              : 'Dengarkan Contoh'}
                          </span>
                        </button>
                      </div>

                      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                        <div
                          dir="rtl"
                          className="font-arabic text-2xl sm:text-3xl text-right text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] leading-loose"
                          dangerouslySetInnerHTML={{
                            __html: renderTajwidHtml(selectedRule.contohArab, true)
                          }}
                        />
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 italic">
                          {selectedRule.contohLatin}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#5e4d39] leading-relaxed">
                          {selectedRule.penjelasanContoh}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rincian Contoh Lengkap per Huruf / Ketentuan Sesuai Halaman Buku */}
                {selectedRule.rincianContoh && selectedRule.rincianContoh.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                      Rincian Seluruh Contoh di Buku ({selectedRule.halamanBuku})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedRule.rincianContoh.map((grp, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/45 [body.theme-sepia_&]:bg-[#ebdcc0]/45 border border-slate-200/70 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {grp.judul}
                            </span>
                            {grp.rumusArab && (
                              <span className="shrink-0">{renderFormulaText(grp.rumusArab, true)}</span>
                            )}
                          </div>
                          <div
                            dir="rtl"
                            className="font-arabic text-xl sm:text-2xl text-right text-slate-900 dark:text-slate-100 leading-loose"
                            dangerouslySetInnerHTML={{
                              __html: renderTajwidHtml(grp.contohArab, true)
                            }}
                          />
                          {grp.contohLatin && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              {grp.contohLatin}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soal Jawab Metode Qira'ati (S / J) */}
                {selectedRule.soalJawabBuku && selectedRule.soalJawabBuku.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Latihan Soal Jawab Buku (S / J)
                    </h3>
                    <div className="space-y-2.5">
                      {selectedRule.soalJawabBuku.map((sj, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#ebdcc0]/40 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1.5"
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            S: {sj.soal}
                          </div>
                          <div className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                            <strong>J:</strong> {sj.jawab}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Catatan Penting & Pedoman Mengajar */}
                {selectedRule.catatanPenting && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Catatan & Pedoman Buku Qira'ati
                    </div>
                    <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                      {selectedRule.catatanPenting}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: 33 SOAL EVALUASI BUKU (HALAMAN 35–37 PERSIS PDF)               */}
      {/* ===================================================================== */}
      {activeSection === 'soal-buku' && (
        <section className="space-y-6" aria-label="33 Soal Evaluasi Buku Halaman 35 sampai 37">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Halaman 35–37 Buku Asli · Hafalan Tanpa Menghafal ({memorizedNumbers.length} / 33 Soal Dikuasai)
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                33 Pertanyaan Evaluasi Akhir Ilmu Tajwid Praktis
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Daftar lengkap 33 soal tanya-jawab yang terdapat di akhir buku H. Dachlan Salim Zarkasyi (halaman 35–37). Coba jawab secara lisan terlebih dahulu, lalu ketuk <strong>Lihat Jawaban</strong> untuk mencocokkan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={bookQuestionSearch}
                  onChange={(e) => setBookQuestionSearch(e.target.value)}
                  placeholder="Cari nomor atau soal..."
                  aria-label="Cari soal evaluasi buku"
                  className="w-full min-h-10 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <button
                type="button"
                onClick={handleToggleAllAnswers}
                className="min-h-10 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-400 inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllAnswers ? 'Tutup Semua Jawaban' : 'Buka Semua Jawaban'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookQuestions.map((item) => {
              const isOpen = showAllAnswers || !!openAnswerIds[item.nomor];
              const isMemorized = memorizedNumbers.includes(item.nomor);
              return (
                <div
                  key={item.nomor}
                  className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between gap-4 ${
                    isMemorized
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/70'
                      : 'bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                        Soal No. {String(item.nomor).padStart(2, '0')} · {item.pelajaran}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleMemorized(item.nomor)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1 ${
                          isMemorized
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isMemorized ? 'Sudah Hafal' : 'Tandai Hafal'}</span>
                      </button>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                      {item.nomor}. {item.pertanyaan}
                    </h3>

                    {isOpen && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                          <strong className="text-emerald-700 dark:text-emerald-400">Jawaban:</strong>{' '}
                          {item.jawaban}
                        </p>
                        {item.contohArab && (
                          <div
                            dir="rtl"
                            className="font-arabic text-xl text-right text-slate-900 dark:text-slate-100 leading-loose pt-1 border-t border-slate-200/60 dark:border-slate-700/60"
                            dangerouslySetInnerHTML={{
                              __html: renderTajwidHtml(item.contohArab, true)
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer(item.nomor)}
                      className="min-h-9 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      {isOpen ? 'Sembunyikan Jawaban' : 'Lihat Jawaban Buku'}
                    </button>

                    {item.ruleId && (
                      <button
                        type="button"
                        onClick={() => handleJumpToRule(item.ruleId!)}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Buka Pelajaran</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: LAB DETEKSI TAJWID OTOMATIS (SESUAI KAIDAH BUKU PDF)           */}
      {/* ===================================================================== */}
      {activeSection === 'lab' && (
        <section className="space-y-6" aria-label="Laboratorium Deteksi Tajwid Otomatis">
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Lab Bedah Hukum Tajwid per Lafadz (Sesuai Pelajaran 1–13)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pilih kumpulan contoh langsung dari buku atau tempel potongan ayat berharakat, lalu <strong>ketuk lafadz yang berwarna</strong> untuk melihat nama pelajaran, halaman buku, dan panjang bacaannya.
            </p>
          </div>

          {/* Preset Verses Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TAJWID_LAB_VERSES.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(preset.id);
                    setLabArabicText(preset.arabic);
                    setInspectedLabRuleId(null);
                  }}
                  className={`min-h-10 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer border transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Two-Zone Educational Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Stage Zone */}
            <div className="lg:col-span-7 p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Panggung Bedah Tajwid Interaktif (Ketuk lafadz berwarna)</span>
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                  {labOccurrences.reduce((acc, item) => acc + item.count, 0)} temuan hukum
                </span>
              </div>

              <div
                dir="rtl"
                onClick={handleLabVerseClick}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/70 dark:border-slate-800 font-arabic text-3xl sm:text-4xl text-right text-slate-900 dark:text-slate-100 leading-[2.4] select-text"
                dangerouslySetInnerHTML={{
                  __html: renderTajwidHtml(labArabicText, true)
                }}
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="lab-arabic-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Uji Teks Arab Berharakat Lainnya:
                </label>
                <textarea
                  id="lab-arabic-input"
                  dir="rtl"
                  rows={2}
                  value={labArabicText}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setLabArabicText(e.target.value);
                  }}
                  placeholder="Tempel potongan ayat Al-Qur'an berharakat di sini..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-right font-arabic text-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Concept & Breakdown Deck */}
            <div className="lg:col-span-5 space-y-4">
              {inspectedLabRule && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-emerald-300/80 dark:border-emerald-800 space-y-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span>Pelajaran ke-{inspectedLabRule.pelajaranKe}</span>
                    <span aria-hidden="true">·</span>
                    <span>{inspectedLabRule.halamanBuku}</span>
                    {inspectedLabRule.kadarHarakat && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {inspectedLabRule.kadarHarakat}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-xs shrink-0"
                      style={{ backgroundColor: inspectedLabRule.hexColor }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {inspectedLabRule.nama}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {inspectedLabRule.deskripsi}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleJumpToRule(inspectedLabRule.id)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka materi Pelajaran ke-{inspectedLabRule.pelajaranKe}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Rincian Hukum Tajwid yang Terdeteksi ({labOccurrences.length} Kaidah)
                </h3>

                {labOccurrences.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Masukkan teks Arab berharakat lengkap untuk mendeteksi hukum tajwid secara otomatis.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {labOccurrences.map((occ) => {
                      const isActive = inspectedLabRule?.id === occ.ruleId;
                      return (
                        <button
                          key={occ.ruleId}
                          type="button"
                          onClick={() => setInspectedLabRuleId(occ.ruleId)}
                          className={`w-full p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-xs shrink-0"
                                style={{ backgroundColor: occ.hexColor }}
                              />
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {occ.nama}
                              </span>
                              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                                · {occ.count}x
                              </span>
                            </div>
                            <div
                              className="font-arabic text-base text-slate-700 dark:text-slate-300 truncate"
                              dir="rtl"
                            >
                              {occ.samples.join(' · ')}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: KUIS EVALUASI PILIHAN GANDA (14 SOAL SESUAI BUKU PDF)          */}
      {/* ===================================================================== */}
      {activeSection === 'kuis' && (
        <section
          aria-label="Kuis Evaluasi Ilmu Tajwid Praktis"
          className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Pertanyaan <span className="font-mono tabular-nums">{quizIndex + 1}</span> dari{' '}
                <span className="font-mono tabular-nums">{TAJWID_QUIZ_QUESTIONS.length}</span> ·{' '}
                {currentQuiz.bab}
              </div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Uji Pemahaman Buku Ilmu Tajwid Praktis (Qira'ati)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                Skor Benar: {quizScore} / {TAJWID_QUIZ_QUESTIONS.length}
              </span>
              <button
                type="button"
                onClick={handleResetQuiz}
                aria-label="Ulangi Kuis dari Awal"
                className="min-h-10 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#ebdcc0]/40 rounded-2xl space-y-3 border border-slate-200/60 dark:border-slate-800">
            <div
              dir="rtl"
              className="font-arabic text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] font-bold leading-loose"
              dangerouslySetInnerHTML={{
                __html: renderTajwidHtml(currentQuiz.verseArabic, true)
              }}
            />
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] max-w-xl mx-auto">
              {currentQuiz.question}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuiz.options.map((opt) => {
              const isCorrect = opt === currentQuiz.correct;
              const isChosen = selectedOption === opt;

              let btnStyle =
                'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200';
              if (quizAnswered) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                } else if (isChosen) {
                  btnStyle =
                    'bg-red-50 dark:bg-red-950/70 border-red-500 text-red-900 dark:text-red-200 font-semibold';
                } else {
                  btnStyle = 'opacity-55 border-slate-200 dark:border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={quizAnswered}
                  onClick={() => handleSelectQuizOption(opt)}
                  className={`min-h-12 p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {quizAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {quizAnswered && isChosen && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/60">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">Pembahasan Buku:</strong>{' '}
                {currentQuiz.explanation}
              </p>
              <button
                type="button"
                onClick={handleNextQuiz}
                className="min-h-11 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shrink-0 self-end sm:self-auto transition-colors"
              >
                {quizIndex < TAJWID_QUIZ_QUESTIONS.length - 1
                  ? 'Pertanyaan Berikutnya'
                  : 'Selesai & Ulangi Kuis'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: BUKU PDF ASLI (PEMBACA DOKUMEN LANGSUNG DI APLIKASI)           */}
      {/* ===================================================================== */}
      {activeSection === 'pdf' && (
        <section className="space-y-4" aria-label="Dokumen Buku PDF Ilmu Tajwid Praktis">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Naskah Pindaian Asli: {TAJWID_BOOK_META.judul} — {TAJWID_BOOK_META.penyusun}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                20 lembar pindaian lengkap (Halaman 1–37) untuk mencocokkan tulisan Arab dan rumus asli buku Qira'ati.
              </p>
            </div>

            <a
              href={resolveTajwidPdfUrl()}
              download="Pelajaran-Ilmu-Tajwid-Praktis-Qiraati.pdf"
              className="min-h-10 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <iframe
              src={resolveTajwidPdfUrl()}
              title="Pembaca PDF Pelajaran Ilmu Tajwid Praktis"
              className="w-full h-[72vh] min-h-[520px] border-0"
            />
          </div>
        </section>
      )}
    </div>
  );
};
