import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
  BookOpen,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Flame
} from 'lucide-react';
import { ReadingHistoryItem } from '../types/quran';
import { SURAH_METADATA_LIST } from '../data/quranMetadata';
import { calculateQuranProgressStats } from '../utils/quranLogic';

interface ReadingProgressDashboardProps {
  readingHistory: ReadingHistoryItem[];
  onJumpToSurah: (surahNomor: number, ayahNomor: number) => void;
}

export const ReadingProgressDashboard: React.FC<ReadingProgressDashboardProps> = ({
  readingHistory,
  onJumpToSurah
}) => {
  const [targetKhatamDays, setTargetKhatamDays] = useState<number>(30); // 30, 60, or 365 days

  const stats = useMemo(() => {
    return calculateQuranProgressStats(readingHistory, SURAH_METADATA_LIST);
  }, [readingHistory]);

  // Donut chart data: Completed vs Remaining
  const donutData = useMemo(() => {
    const remaining = Math.max(0, stats.totalQuranAyahs - stats.totalAyahsRead);
    return [
      { name: 'Telah Dibaca', value: stats.totalAyahsRead || 1, color: '#10b981' },
      { name: 'Belum Dibaca', value: remaining || 6235, color: '#64748b' }
    ];
  }, [stats]);

  // Makkiyyah vs Madaniyyah data
  const revelationData = useMemo(() => {
    return [
      { name: 'Makkiyyah', value: stats.makkiyyahAyahs || 1, color: '#06b6d4' },
      { name: 'Madaniyyah', value: stats.madaniyyahAyahs || 1, color: '#10b981' }
    ];
  }, [stats]);

  // Khatam Pace calculation
  const remainingAyahs = Math.max(0, stats.totalQuranAyahs - stats.totalAyahsRead);
  const dailyAyahTarget = Math.ceil(remainingAyahs / targetKhatamDays);
  const estimatedPagesPerDay = Math.ceil(dailyAyahTarget / 15); // avg 15 ayahs per standard mushaf page

  // Custom Tooltip for Recharts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700">
          <p className="font-semibold text-emerald-400">{label}</p>
          <p className="mt-1">
            Selesai: <span className="font-bold tabular-nums">{data.completed}</span> / {data.total} ayat
          </p>
          <p className="text-slate-400">Progres: {data.percent}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700">
          <p className="text-slate-400">{label}</p>
          <p className="font-bold text-emerald-400 mt-0.5">
            {payload[0].value} Ayat dibaca
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Motivation */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900">
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Progres Tilawah & Khatam</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Perjalanan Membaca Al-Qur'an Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] max-w-xl">
              Pantau pencapaian khatam 30 Juz secara visual dan konsisten. Setiap ayat yang Anda baca dicatat otomatis untuk mengukur istiqamah tilawah.
            </p>
          </div>

          {/* Quick Stats Pill Island replacement -> Clean unboxed KPI */}
          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-emerald-200/60 dark:border-emerald-800/60 pt-4 sm:pt-0 sm:pl-6 shrink-0">
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.percentageOverall}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Khatam Al-Qur'an
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] tabular-nums">
                {stats.estimatedJuzProgress}
                <span className="text-xs text-slate-400 font-normal"> / 30</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Estimasi Juz Selesai
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Ayat Dibaca</span>
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            {stats.totalAyahsRead.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Dari total {stats.totalQuranAyahs.toLocaleString('id-ID')} ayat
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Surah Dijelajahi</span>
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            {stats.surahsExploredCount}
            <span className="text-xs text-slate-400 font-normal"> / 114</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats.surahsCompletedCount} surah tuntas penuh
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Target Harian</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            {dailyAyahTarget} <span className="text-xs text-slate-400 font-normal">ayat/hari</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Target khatam {targetKhatamDays} hari
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Estimasi Halaman</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
            ~{estimatedPagesPerDay} <span className="text-xs text-slate-400 font-normal">hlm/hari</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sekitar 2 halaman per shalat fardhu
          </p>
        </div>

      </div>

      {/* Main Charts Row: Recharts Donut & Recharts BarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Overall Donut & Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] flex flex-col justify-between space-y-5">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Kelengkapan Khatam Al-Qur'an
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualisasi proporsi ayat yang telah Anda baca
            </p>
          </div>

          {/* Recharts Pie / Donut Chart */}
          <div className="relative h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                {stats.percentageOverall}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Terselesaikan
              </span>
            </div>
          </div>

          {/* Legend and Verse Split */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300">Telah Dibaca</span>
              </div>
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {stats.totalAyahsRead} ayat
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-slate-700 dark:text-slate-300">Sisa Menuju Khatam</span>
              </div>
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {remainingAyahs} ayat
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Recharts BarChart for 30 Juz Milestone (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Pencapaian per Kelompok Juz (30 Juz)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Progres tilawah dari Juz 1 hingga Juz 30
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.juzBreakdown} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#cbd5e1', opacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#cbd5e1', opacity: 0.2 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="completed"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-center">
            {stats.juzBreakdown.map((item) => (
              <div key={item.name} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-500">{item.name}</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {item.percent}%
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Secondary Row: Weekly Activity Trend & Khatam Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Reading Activity Trend (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                Aktivitas Membaca 7 Hari Terakhir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konsistensi tilawah harian Anda
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Flame className="w-4 h-4" />
              <span>Istiqamah</span>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAyat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ayat"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAyat)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Khatam Target Planner (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Rencana Target Khatam</span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Pilih Target Waktu Khatam:
            </h3>
          </div>

          {/* Target Selector Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { days: 30, label: '30 Hari', sub: '1 Juz/Hari' },
              { days: 60, label: '60 Hari', sub: '1/2 Juz/Hari' },
              { days: 365, label: '1 Tahun', sub: 'Santai' }
            ].map((target) => (
              <button
                key={target.days}
                onClick={() => setTargetKhatamDays(target.days)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  targetKhatamDays === target.days
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{target.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{target.sub}</div>
              </button>
            ))}
          </div>

          {/* Calculator Output */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Target Harian:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {dailyAyahTarget} ayat/hari
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Setiap Shalat Fardhu:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                ~{Math.ceil(dailyAyahTarget / 5)} ayat
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span className="text-slate-600 dark:text-slate-400">Sisa Waktu:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                {targetKhatamDays} hari
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => onJumpToSurah(1, 1)}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
          >
            <span>Mulai Membaca Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};
