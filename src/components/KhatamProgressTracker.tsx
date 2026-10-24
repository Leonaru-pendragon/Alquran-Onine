import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  RotateCcw,
  Search
} from 'lucide-react';
import {
  CompletionStatus,
  QuranProgressStats,
  SurahMeta
} from '../types/quran';

function formatKhatamPercent(pct: number): string {
  if (pct <= 0) return '0%';
  if (pct >= 100) return '100%';
  if (pct < 1) return `${pct.toFixed(2).replace('.', ',')}%`;
  if (Number.isInteger(pct)) return `${pct}%`;
  return `${pct.toFixed(1).replace('.', ',')}%`;
}

interface KhatamHeroTrackerProps {
  stats: QuranProgressStats;
  onJumpToSurah: (surahNomor: number, ayahNomor: number) => void;
  onToggleJuzComplete: (juzNomor: number) => void;
}

export const KhatamHeroTracker: React.FC<KhatamHeroTrackerProps> = ({
  stats,
  onJumpToSurah,
  onToggleJuzComplete
}) => {
  const [selectedJuzNomor, setSelectedJuzNomor] = useState<number>(() => {
    const inProg = stats.juzProgressList.find((j) => j.status === 'in_progress');
    if (inProg) return inProg.nomor;
    const firstUnread = stats.juzProgressList.find((j) => j.status === 'unread');
    return firstUnread ? firstUnread.nomor : 1;
  });

  const selectedJuz = useMemo(() => {
    return (
      stats.juzProgressList.find((j) => j.nomor === selectedJuzNomor) ||
      stats.juzProgressList[0]
    );
  }, [stats.juzProgressList, selectedJuzNomor]);

  // SVG Radial Gauge geometry
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, stats.percentageOverall));
  // Ensure tiny non-zero progress (>0% and <1.5%) still renders a visible arc sliver
  const visualArcPct = clampedPct > 0 && clampedPct < 1.5 ? 1.5 : clampedPct;
  const strokeDashoffset = circumference - (visualArcPct / 100) * circumference;

  const isKhatamComplete = stats.totalAyahsRead >= stats.totalQuranAyahs;

  return (
    <section
      aria-labelledby="khatam-tracker-heading"
      data-testid="khatam-progress-tracker"
      className="rounded-2xl bg-white dark:bg-slate-900/80 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] overflow-hidden"
    >
      {/* Top Section: Headline + Linear Milestone Bar + Radial SVG Gauge */}
      <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1 space-y-5 min-w-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-amber-900 whitespace-nowrap">
                Pelacak Khatam Al-Qur&apos;an
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Dihitung otomatis dari riwayat bacaan Anda</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums whitespace-nowrap">30 Juz · 114 Surah · 6.236 Ayat</span>
            </div>

            <h1
              id="khatam-tracker-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
            >
              {isKhatamComplete
                ? 'Alhamdulillah, Khatam Al-Qur’an 30 Juz Tuntas'
                : 'Progres Khatam Al-Qur’an & Tersimpan'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] max-w-2xl leading-relaxed">
              {stats.totalAyahsRead === 0
                ? 'Belum ada ayat tercatat dalam riwayat bacaan. Mulai membaca surah atau tandai Juz yang telah selesai untuk melacak perjalanan khatam Anda.'
                : isKhatamComplete
                ? 'Seluruh 6.236 ayat dari 114 surah telah tercatat selesai dibaca. Semoga menjadi amal jariyah dan keberkahan yang istiqamah.'
                : `Anda telah menyelesaikan ${stats.totalAyahsRead.toLocaleString('id-ID')} dari ${stats.totalQuranAyahs.toLocaleString('id-ID')} ayat (${formatKhatamPercent(stats.percentageOverall)}). Tersisa ${stats.remainingAyahs.toLocaleString('id-ID')} ayat menuju khatam 30 Juz.`}
            </p>
          </div>

          {/* Accessible Linear Milestone Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#3b2e20]">
                Capaian Keseluruhan Mushaf
              </span>
              <span
                data-testid="khatam-percentage-label"
                className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-amber-900 whitespace-nowrap"
              >
                {formatKhatamPercent(stats.percentageOverall)} selesai
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Persentase Khatam Al-Qur'an"
              aria-valuenow={Number(stats.percentageOverall.toFixed(2))}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 [body.theme-sepia_&]:bg-[#e6d7bc] overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${clampedPct > 0 ? Math.max(clampedPct, 0.8) : 0}%`
                }}
              />
            </div>

            {/* Milestone Markers — Single-line across mobile & desktop */}
            <div className="flex items-center justify-between text-[11px] tabular-nums text-slate-400 dark:text-slate-500 [body.theme-sepia_&]:text-[#7a664f]">
              <span className="whitespace-nowrap">0%</span>
              <span className="whitespace-nowrap">
                25%<span className="hidden sm:inline"> · Juz 8</span>
              </span>
              <span className="whitespace-nowrap">
                50%<span className="hidden sm:inline"> · Juz 15</span>
              </span>
              <span className="whitespace-nowrap">
                75%<span className="hidden sm:inline"> · Juz 23</span>
              </span>
              <span className="whitespace-nowrap">
                100%<span className="hidden sm:inline"> · 30 Juz</span>
              </span>
            </div>
          </div>

          {/* Primary Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() =>
                onJumpToSurah(
                  stats.nextRecommendedRead.surahNomor,
                  stats.nextRecommendedRead.ayahNomor
                )
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {stats.totalAyahsRead === 0
                  ? 'Mulai Membaca Al-Qur’an'
                  : isKhatamComplete
                  ? 'Baca Kembali dari QS. Al-Fatihah'
                  : `Lanjutkan: QS. ${stats.nextRecommendedRead.surahNamaLatin} Ayat ${stats.nextRecommendedRead.ayahNomor}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] tabular-nums">
              Estimasi setara <strong className="font-mono text-slate-800 dark:text-slate-200 [body.theme-sepia_&]:text-[#2c2217]">{stats.estimatedJuzProgress}</strong> dari 30 Juz
            </span>
          </div>
        </div>

        {/* Right: Crisp Custom SVG Radial Khatam Gauge */}
        <div className="flex items-center justify-center lg:pl-6 lg:border-l border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] shrink-0">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg
              className="w-40 h-40 -rotate-90"
              viewBox="0 0 140 140"
              aria-hidden="true"
            >
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                strokeWidth="11"
                className="stroke-slate-100 dark:stroke-slate-800 [body.theme-sepia_&]:stroke-[#e6d7bc]"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="stroke-emerald-600 dark:stroke-emerald-500 transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <span
                data-testid="khatam-radial-value"
                className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
              >
                {formatKhatamPercent(stats.percentageOverall)}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-amber-900 mt-0.5">
                Khatam
              </span>
              <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.totalAyahsRead.toLocaleString('id-ID')}/{stats.totalQuranAyahs.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Hairline KPI Strip (Zero Nested Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200/80 dark:divide-slate-800/80 [body.theme-sepia_&]:divide-[#dec9a5] border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] bg-slate-50/50 dark:bg-slate-900/40 [body.theme-sepia_&]:bg-[#efe4cf]/50">
        <div className="p-4 sm:px-6 sm:py-4 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
            Ayat Terbaca
          </div>
          <div
            data-testid="kpi-ayahs-read"
            className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
          >
            {stats.totalAyahsRead.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-400"> / {stats.totalQuranAyahs.toLocaleString('id-ID')}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            Makkiyyah {stats.makkiyyahAyahs.toLocaleString('id-ID')} · Madaniyyah {stats.madaniyyahAyahs.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
            Juz Tuntas
          </div>
          <div
            data-testid="kpi-juz-completed"
            className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
          >
            {stats.juzCompletedCount}
            <span className="text-xs font-normal text-slate-400"> / 30 Juz</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.juzInProgressCount} Juz sedang dibaca
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
            Surah Tuntas
          </div>
          <div
            data-testid="kpi-surah-completed"
            className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
          >
            {stats.surahsCompletedCount}
            <span className="text-xs font-normal text-slate-400"> / 114 Surah</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.surahsExploredCount} surah pernah dibuka
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
            Sisa Menuju Khatam
          </div>
          <div
            data-testid="kpi-remaining-ayahs"
            className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]"
          >
            {stats.remainingAyahs.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-400"> ayat</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            Konsistensi baca: {stats.currentStreakDays} hari beruntun
          </div>
        </div>
      </div>

      {/* Interactive 30-Juz Visual Khatam Matrix */}
      <div className="p-6 sm:px-8 sm:py-6 border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Peta Visual Khatam 30 Juz
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
              Pilih nomor Juz untuk memeriksa rincian ayat, melanjutkan tilawah, atau menandai Juz selesai
            </p>
          </div>

          {/* Accessible Icon+Label Legend (Never Color Alone) */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#5c4a36]">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Selesai ({stats.juzCompletedCount})</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Sedang Dibaca ({stats.juzInProgressCount})</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Circle className="w-3.5 h-3.5 text-slate-400" />
              <span>Belum ({30 - stats.juzCompletedCount - stats.juzInProgressCount})</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {stats.juzProgressList.map((juz) => {
            const isSelected = selectedJuz?.nomor === juz.nomor;
            const isCompleted = juz.status === 'completed';
            const isInProgress = juz.status === 'in_progress';

            return (
              <button
                key={juz.nomor}
                type="button"
                onClick={() => setSelectedJuzNomor(juz.nomor)}
                aria-label={`Juz ${juz.nomor}: ${juz.percent}% selesai (${juz.readAyahs} dari ${juz.totalAyahs} ayat)`}
                aria-pressed={isSelected}
                className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isSelected
                    ? 'ring-2 ring-emerald-600 dark:ring-emerald-400'
                    : ''
                } ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : isInProgress
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 [body.theme-sepia_&]:bg-[#e5dec9] border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#efe4cf]/60 border-slate-200/80 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#4a3b2a] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold font-mono tabular-nums whitespace-nowrap">
                    Juz {juz.nomor}
                  </span>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : isInProgress ? (
                    <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : null}
                </div>
                <div
                  className={`text-[10px] font-mono tabular-nums mt-1 ${
                    isCompleted
                      ? 'text-emerald-100'
                      : isInProgress
                      ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {juz.percent}%
                </div>

                {/* Bottom progress bar for uniform 30-Juz cell rhythm */}
                <div
                  className={`mt-1.5 h-1 w-full rounded-full overflow-hidden ${
                    isCompleted
                      ? 'bg-emerald-400/40'
                      : 'bg-slate-200/80 dark:bg-slate-700/70'
                  }`}
                >
                  <div
                    className={`h-full rounded-full ${
                      isCompleted ? 'bg-white' : 'bg-emerald-600 dark:bg-emerald-400'
                    }`}
                    style={{ width: `${juz.percent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Juz Inline Inspector (Hairline Separated, Not Nested Card) */}
        {selectedJuz && (
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                  Detail Juz {selectedJuz.nomor}
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
                  QS. {selectedJuz.surahMulaiNama}: {selectedJuz.ayatMulai} – QS. {selectedJuz.surahSelesaiNama}: {selectedJuz.ayatSelesai}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {selectedJuz.readAyahs} / {selectedJuz.totalAyahs} ayat terbaca ({selectedJuz.percent}%)
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {selectedJuz.status === 'completed'
                    ? 'Status: Tuntas 100%'
                    : selectedJuz.status === 'in_progress'
                    ? `Lanjut pada QS. Nomor ${selectedJuz.nextUnreadSurah} Ayat ${selectedJuz.nextUnreadAyah}`
                    : 'Status: Belum dibaca'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onToggleJuzComplete(selectedJuz.nomor)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  selectedJuz.status === 'completed'
                    ? 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                }`}
              >
                {selectedJuz.status === 'completed' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Batalkan Selesai Juz {selectedJuz.nomor}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Juz {selectedJuz.nomor} Selesai</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onJumpToSurah(selectedJuz.nextUnreadSurah, selectedJuz.nextUnreadAyah)
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>
                  {selectedJuz.status === 'completed'
                    ? `Baca Ulang Juz ${selectedJuz.nomor}`
                    : `Baca Juz ${selectedJuz.nomor}`}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

interface KhatamDetailedWorkspaceProps {
  stats: QuranProgressStats;
  onJumpToSurah: (surahNomor: number, ayahNomor: number) => void;
  onToggleSurahComplete: (surah: Pick<SurahMeta, 'nomor' | 'namaLatin' | 'jumlahAyat'>) => void;
  onToggleJuzComplete: (juzNomor: number) => void;
}

export const KhatamDetailedWorkspace: React.FC<KhatamDetailedWorkspaceProps> = ({
  stats,
  onJumpToSurah,
  onToggleSurahComplete,
  onToggleJuzComplete
}) => {
  const [breakdownMode, setBreakdownMode] = useState<'surah' | 'juz'>('surah');
  const [statusFilter, setStatusFilter] = useState<'all' | CompletionStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSurahs, setShowAllSurahs] = useState(false);
  const [targetKhatamDays, setTargetKhatamDays] = useState<number>(30);
  const [chartTab, setChartTab] = useState<'juz' | 'activity'>('juz');

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stats.surahProgressList.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(s.nomor) === q ||
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nama.includes(q)
      );
    });
  }, [stats.surahProgressList, statusFilter, searchQuery]);

  const displayedSurahs = useMemo(() => {
    if (showAllSurahs || searchQuery.trim() !== '' || statusFilter !== 'all') {
      return filteredSurahs;
    }
    return filteredSurahs.slice(0, 15);
  }, [filteredSurahs, showAllSurahs, searchQuery, statusFilter]);

  const filteredJuzList = useMemo(() => {
    if (statusFilter === 'all') return stats.juzProgressList;
    return stats.juzProgressList.filter((j) => j.status === statusFilter);
  }, [stats.juzProgressList, statusFilter]);

  const dailyAyahTarget =
    stats.remainingAyahs > 0 ? Math.ceil(stats.remainingAyahs / targetKhatamDays) : 0;
  const perPrayerAyahTarget = dailyAyahTarget > 0 ? Math.ceil(dailyAyahTarget / 5) : 0;
  const estimatedPagesPerDay = dailyAyahTarget > 0 ? Math.max(1, Math.round(dailyAyahTarget / 15)) : 0;

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs border border-slate-700">
          <p className="font-semibold text-emerald-400">{label}</p>
          <p className="mt-1 font-mono tabular-nums">
            Terbaca: {data.completed} / {data.total} ayat ({data.percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-700">
          <p className="text-slate-400">{label}</p>
          <p className="font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
            {payload[0].value} ayat tercatat
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Analytics & Target Pace Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Visual Analytics Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                {chartTab === 'juz'
                  ? 'Distribusi Capaian per Kelompok 5 Juz'
                  : 'Aktivitas Tilawah 7 Hari Terakhir'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chartTab === 'juz'
                  ? 'Akumulasi ayat terbaca berdasarkan batas mushaf Juz 1 hingga Juz 30'
                  : 'Jumlah ayat pada surah yang dibaca dalam sepekan terakhir'}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 [body.theme-sepia_&]:bg-[#ebdcc0] rounded-lg self-start shrink-0">
              <button
                type="button"
                onClick={() => setChartTab('juz')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  chartTab === 'juz'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Kelompok Juz
              </button>
              <button
                type="button"
                onClick={() => setChartTab('activity')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  chartTab === 'activity'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                7 Hari Terakhir
              </button>
            </div>
          </div>

          <div className="h-56 min-h-[224px] w-full">
            {chartTab === 'juz' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.juzBreakdown}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="completed"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.weeklyActivity}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="khatamActivityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ayat"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#khatamActivityFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] text-center">
            {stats.juzBreakdown.map((item) => (
              <div key={item.name} className="space-y-0.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.name}</div>
                <div className="text-xs font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                  {item.percent}%
                </div>
                <div className="text-[10px] font-mono tabular-nums text-slate-400">
                  {item.completed}/{item.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Simulasi Target Khatam Calculator (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] flex flex-col justify-between space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Perencana Target Khatam</span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Simulasi Kecepatan Tilawah Harian
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dihitung berdasarkan sisa {stats.remainingAyahs.toLocaleString('id-ID')} ayat yang belum terbaca
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { days: 15, label: '15 Hari' },
              { days: 30, label: '30 Hari' },
              { days: 60, label: '60 Hari' },
              { days: 90, label: '90 Hari' }
            ].map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setTargetKhatamDays(opt.days)}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  targetKhatamDays === opt.days
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70 [body.theme-sepia_&]:divide-[#dec9a5] border-y border-slate-200/70 dark:border-slate-800/70 [body.theme-sepia_&]:border-[#dec9a5] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Target Bacaan Harian</span>
              <span className="font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {dailyAyahTarget} ayat / hari
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Setiap Selesai Shalat Fardhu (5x)</span>
              <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                {perPrayerAyahTarget} ayat / waktu
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Estimasi Lembar Mushaf</span>
              <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                ~{estimatedPagesPerDay} halaman / hari
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onJumpToSurah(
                stats.nextRecommendedRead.surahNomor,
                stats.nextRecommendedRead.ayahNomor
              )
            }
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>
              {stats.remainingAyahs === 0
                ? 'Mulai Putaran Khatam Baru'
                : `Kejar Target: Buka QS. ${stats.nextRecommendedRead.surahNamaLatin}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive 114 Surah / 30 Juz Completion Ledger */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 [body.theme-sepia_&]:bg-[#f6eee0] border border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] overflow-hidden">
        {/* Ledger Header & Filter Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Daftar Rincian Ketuntasan Bacaan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau progres per Surah atau per Juz dan tandai bacaan yang telah Anda khatamkan di mushaf cetak maupun digital
              </p>
            </div>

            {/* Mode Switch: 114 Surah vs 30 Juz */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 [body.theme-sepia_&]:bg-[#ebdcc0] rounded-xl self-start shrink-0">
              <button
                type="button"
                onClick={() => setBreakdownMode('surah')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  breakdownMode === 'surah'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Per Surah (114)
              </button>
              <button
                type="button"
                onClick={() => setBreakdownMode('juz')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  breakdownMode === 'juz'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Per Juz (30)
              </button>
            </div>
          </div>

          {/* Search + Status Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 [body.theme-sepia_&]:bg-[#ebdcc0] rounded-xl overflow-x-auto max-w-full">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'completed', label: 'Selesai' },
                  { id: 'in_progress', label: 'Sedang Dibaca' },
                  { id: 'unread', label: 'Belum Dibaca' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {breakdownMode === 'surah' && (
              <div className="relative sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Cari surah dalam daftar progres khatam"
                  placeholder="Cari nama atau nomor surah..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 [body.theme-sepia_&]:bg-[#efe4cf] [body.theme-sepia_&]:border-[#dec9a5] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ledger Rows */}
        {breakdownMode === 'surah' ? (
          <div>
            {displayedSurahs.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tidak ada surah yang cocok dengan filter saat ini
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Reset Filter Pencarian
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70 [body.theme-sepia_&]:divide-[#dec9a5]">
                {displayedSurahs.map((surah) => (
                  <div
                    key={surah.nomor}
                    className="px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 [body.theme-sepia_&]:hover:bg-[#efe4cf]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-8 text-xs font-mono font-bold tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                        {String(surah.nomor).padStart(3, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] truncate">
                            {surah.namaLatin}
                          </span>
                          <span className="font-arabic text-base text-emerald-800 dark:text-emerald-400 [body.theme-sepia_&]:text-[#4a3b2a] shrink-0">
                            {surah.nama}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{surah.arti}</span>
                          <span aria-hidden="true">·</span>
                          <span>{surah.tempatTurun}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            {surah.status === 'completed' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Selesai</span>
                              </>
                            ) : surah.status === 'in_progress' ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-amber-700 dark:text-amber-400 font-medium">Sedang Dibaca</span>
                              </>
                            ) : (
                              <span>Belum Dibaca</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {/* Progress bar + tabular counter */}
                      <div className="w-32 sm:w-40 space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">
                            {surah.readAyahs}/{surah.totalAyahs}
                          </span>
                          <span className="text-slate-400">{surah.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all"
                            style={{ width: `${surah.percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onToggleSurahComplete({
                              nomor: surah.nomor,
                              namaLatin: surah.namaLatin,
                              jumlahAyat: surah.totalAyahs
                            })
                          }
                          aria-label={
                            surah.status === 'completed'
                              ? `Batalkan selesai Surah ${surah.namaLatin}`
                              : `Tandai selesai Surah ${surah.namaLatin}`
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                            surah.status === 'completed'
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{surah.status === 'completed' ? 'Tuntas' : 'Tandai Selesai'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onJumpToSurah(surah.nomor, surah.nextUnreadAyah)}
                          aria-label={`Baca Surah ${surah.namaLatin}`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                        >
                          <span>Baca</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expand / Collapse all 114 Surahs when unfiltered */}
            {searchQuery.trim() === '' && statusFilter === 'all' && filteredSurahs.length > 15 && (
              <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] text-center">
                <button
                  type="button"
                  onClick={() => setShowAllSurahs((prev) => !prev)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>
                    {showAllSurahs
                      ? 'Ringkas Daftar Surah (15 Teratas)'
                      : `Tampilkan Seluruh 114 Surah (${filteredSurahs.length - 15} lainnya)`}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${showAllSurahs ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70 [body.theme-sepia_&]:divide-[#dec9a5]">
            {filteredJuzList.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tidak ada Juz pada status filter ini
                </p>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Tampilkan Semua 30 Juz
                </button>
              </div>
            ) : (
              filteredJuzList.map((juz) => (
                <div
                  key={juz.nomor}
                  className="px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 [body.theme-sepia_&]:hover:bg-[#efe4cf]/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-14 text-xs font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400 shrink-0">
                      Juz {String(juz.nomor).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                        QS. {juz.surahMulaiNama}: {juz.ayatMulai} – QS. {juz.surahSelesaiNama}: {juz.ayatSelesai}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Mulai dari {juz.namaMulai} · Total {juz.totalAyahs} ayat
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="w-32 sm:w-40 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">
                          {juz.readAyahs}/{juz.totalAyahs}
                        </span>
                        <span className="text-slate-400">{juz.percent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all"
                          style={{ width: `${juz.percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleJuzComplete(juz.nomor)}
                        aria-label={
                          juz.status === 'completed'
                            ? `Batalkan selesai Juz ${juz.nomor}`
                            : `Tandai selesai Juz ${juz.nomor}`
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                          juz.status === 'completed'
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{juz.status === 'completed' ? 'Tuntas' : 'Tandai Selesai'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onJumpToSurah(juz.nextUnreadSurah, juz.nextUnreadAyah)}
                        aria-label={`Baca Juz ${juz.nomor}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                      >
                        <span>Baca</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
