import React, { useState } from 'react';
import { Sparkles, HelpCircle, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { TAJWID_RULES } from '../data/tajwidRules';

export const TajwidGuideView: React.FC = () => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>('ghunnah');
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectedRule = TAJWID_RULES.find((r) => r.id === selectedRuleId) || TAJWID_RULES[0];

  const quizQuestions = [
    {
      verseArabic: "مِن قَبْلِ",
      highlightWord: "مِن قَبْلِ",
      question: "Hukum bacaan apakah yang terjadi ketika Nun sukun bertemu huruf Qaf (ق)?",
      options: ["Ikhfa Haqiqi", "Izhar Halqi", "Idgham Bighunnah", "Iqlab"],
      correct: "Ikhfa Haqiqi",
      explanation: "Nun sukun bertemu huruf Qaf (salah satu 15 huruf Ikhfa) dibaca samar disertai dengung 2 harakat."
    },
    {
      verseArabic: "إِنَّ ٱللَّهَ عَلِيمٌ",
      highlightWord: "إِنَّ",
      question: "Huruf Nun berharakat tasydid pada kata 'Inna' dibaca dengan hukum apa?",
      options: ["Ghunnah Musyaddadah", "Qalqalah", "Mad Thobi'i", "Idgham Bilaghunnah"],
      correct: "Ghunnah Musyaddadah",
      explanation: "Setiap nun atau mim yang bertasydid wajib dibaca dengung dan ditahan 2-3 harakat."
    },
    {
      verseArabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      highlightWord: "أَحَدٌ",
      question: "Huruf Dal (د) yang dibaca waqaf/berhenti di akhir kata 'Ahad' memiliki hukum:",
      options: ["Qalqalah Kubra", "Qalqalah Sugra", "Iqlab", "Idgham"],
      correct: "Qalqalah Kubra",
      explanation: "Huruf Qalqalah (ب ج د ط ق) yang sukun karena waqaf di akhir kata memantul dengan kuat (Kubra)."
    },
    {
      verseArabic: "مِنۢ بَعْدِ",
      highlightWord: "مِنۢ بَعْدِ",
      question: "Nun sukun yang bertemu huruf Ba (ب) sehingga terdengar seperti huruf Mim disebut:",
      options: ["Iqlab", "Ikhfa Syafawi", "Idgham Bighunnah", "Mad Wajib"],
      correct: "Iqlab",
      explanation: "Iqlab mengubah bunyi nun/tanwin menjadi mim disertai dengung lembut."
    }
  ];

  const currentQuiz = quizQuestions[quizIndex];

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
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
      setQuizScore(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900">
          <Sparkles className="w-4 h-4" />
          <span>Ilmu Tajwid Al-Qur'an</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Panduan Tajwid Berwarna & Hukum Bacaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] max-w-2xl">
          Membaca Al-Qur'an dengan tartil dan tajwid yang benar adalah anjuran mulia Rasulullah ﷺ. Pelajari kaidah hukum bacaan, huruf-huruf, cara pengucapannya, serta panduan kode warna visual yang terintegrasi di mushaf digital ini.
        </p>
      </div>

      {/* Visual Color Palette Legend Bar */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Kamus Warna Tajwid Mushaf:
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {TAJWID_RULES.map((rule) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <button
                key={rule.id}
                onClick={() => setSelectedRuleId(rule.id)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 bg-white dark:bg-slate-900 shadow-xs'
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
                {selectedRule.contohArab}
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

      {/* Interactive Tajwid Quiz / Practice */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
              Kuis Latihan Tajwid (Pertanyaan {quizIndex + 1} dari {quizQuestions.length})
            </h3>
          </div>
          <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
            Skor: {quizScore}
          </span>
        </div>

        {/* Verse Highlight */}
        <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#ebdcc0]/40 rounded-xl space-y-2">
          <div className="font-arabic text-3xl text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-[#2c2217] font-bold">
            {currentQuiz.verseArabic}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
            {currentQuiz.question}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuiz.options.map((opt) => {
            const isCorrect = opt === currentQuiz.correct;
            const isChosen = selectedOption === opt;

            let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400';
            if (quizAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold';
              } else if (isChosen) {
                btnStyle = 'bg-red-50 dark:bg-red-950/70 border-red-500 text-red-800 dark:text-red-300 font-semibold';
              } else {
                btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={opt}
                disabled={quizAnswered}
                onClick={() => handleSelectQuizOption(opt)}
                className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {quizAnswered && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quiz Feedback & Next Button */}
        {quizAnswered && (
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60">
            <p className="text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] leading-relaxed">
              <strong className="text-emerald-600 dark:text-emerald-400">Penjelasan:</strong> {currentQuiz.explanation}
            </p>
            <button
              onClick={handleNextQuiz}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shrink-0 self-end sm:self-auto"
            >
              {quizIndex < quizQuestions.length - 1 ? 'Pertanyaan Berikutnya' : 'Ulangi Kuis'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
