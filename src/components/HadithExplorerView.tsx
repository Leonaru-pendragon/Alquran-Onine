import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Bookmark, Copy, Check, Filter, Share2, Sparkles, X } from 'lucide-react';
import { HadithItem, BookmarkItem, HadithBook } from '../types/quran';
import { HADITH_BOOKS, HADITH_CATEGORIES, COMPREHENSIVE_HADITHS } from '../data/hadithsData';
import { filterHadiths, isHadithBookmarked } from '../utils/quranLogic';

interface HadithExplorerViewProps {
  bookmarks: BookmarkItem[];
  onToggleBookmark: (item: Omit<BookmarkItem, 'id' | 'timestamp'>) => void;
}

export const HadithExplorerView: React.FC<HadithExplorerViewProps> = ({
  bookmarks,
  onToggleBookmark
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookSlug, setSelectedBookSlug] = useState<string>('semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Topik');
  const [copiedHadithId, setCopiedHadithId] = useState<string | null>(null);
  const [selectedHadithDetail, setSelectedHadithDetail] = useState<HadithItem | null>(null);

  // Filter Hadiths
  const filteredHadiths = useMemo(() => {
    return filterHadiths(COMPREHENSIVE_HADITHS, searchQuery, selectedBookSlug, selectedCategory);
  }, [searchQuery, selectedBookSlug, selectedCategory]);

  const handleCopyHadith = (hadith: HadithItem) => {
    const text = `${hadith.judul ? hadith.judul + '\n\n' : ''}${hadith.arab}\n\n"${hadith.terjemah}"\n\n(${hadith.sanadPerawi} - Derajat: ${hadith.derajat})`;
    navigator.clipboard.writeText(text);
    setCopiedHadithId(hadith.id);
    setTimeout(() => setCopiedHadithId(null), 2500);
  };

  const handleBookmarkClick = (hadith: HadithItem) => {
    onToggleBookmark({
      type: 'hadith',
      haditsNomor: hadith.nomor,
      kitabSlug: hadith.kitabSlug,
      kitabNama: hadith.kitabNama,
      teksArab: hadith.arab,
      teksTerjemah: hadith.terjemah,
      catatan: hadith.judul || hadith.tema
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900">
          <BookOpen className="w-4 h-4" />
          <span>Kutubus Sittah & 9 Imam Hadits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Ensiklopedia Hadits Lengkap
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] max-w-2xl">
          Kumpulan sabda Rasulullah ﷺ dari Shahih Bukhari, Muslim, Arbain An-Nawawiyyah, Sunan Abu Dawud, At-Tirmidzi, An-Nasa'i, Ibnu Majah, Musnad Ahmad, dan Muwatha' Malik dengan naskah Arab, terjemahan Indonesia, sanad perawi, serta faedah amalan.
        </p>
      </div>

      {/* Search & Book Selector */}
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            maxLength={150}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari hadits, kata kunci terjemahan (mis. niat, senyum, ilmu), atau perawi..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#dec9a5] text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Kitab Selector Strip (Segmented Controls) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] mb-2">
            Pilih Kitab Rujukan:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedBookSlug('semua')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-all border ${
                selectedBookSlug === 'semua'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              Semua Kitab
            </button>
            {HADITH_BOOKS.map((book) => (
              <button
                key={book.slug}
                onClick={() => setSelectedBookSlug(book.slug)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-all border ${
                  selectedBookSlug === book.slug
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {book.nama}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] mb-2">
            Topik Pembahasan:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {HADITH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#705e49]">
        Menampilkan {filteredHadiths.length} hadits pilihan
      </div>

      {/* Hadith List */}
      {filteredHadiths.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
            Hadits Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang lebih umum atau pilih "Semua Kitab" dan "Semua Topik".
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHadiths.map((hadith) => {
            const isBookmarked = isHadithBookmarked(bookmarks, hadith.kitabSlug, hadith.nomor);

            return (
              <article
                key={hadith.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] hover:border-emerald-300 dark:hover:border-emerald-800 transition-all space-y-4"
              >
                {/* Hadith Meta Header (Zero-pill metadata discipline) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60 [body.theme-sepia_&]:border-[#e8dec9]/80">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {hadith.kitabNama}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">No. {hadith.nomor}</span>
                    <span aria-hidden="true">·</span>
                    <span>{hadith.tema}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {hadith.derajat}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleBookmarkClick(hadith)}
                      aria-label="Simpan Hadits ke Penanda"
                      title={isBookmarked ? 'Hapus Penanda' : 'Simpan Hadits'}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        isBookmarked
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => handleCopyHadith(hadith)}
                      aria-label="Salin Hadits"
                      title="Salin Hadits dan Terjemahan"
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                    >
                      {copiedHadithId === hadith.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Hadith Title */}
                {hadith.judul && (
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                    {hadith.judul}
                  </h3>
                )}

                {/* Arabic Text */}
                <div className="arabic-verse font-arabic text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217] py-2">
                  {hadith.arab}
                </div>

                {/* Indonesian Translation */}
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#3b2e20]">
                    "{hadith.terjemah}"
                  </p>

                  {/* Sanad / Perawi */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] italic">
                    Sumber: {hadith.sanadPerawi}
                  </p>
                </div>

                {/* Lesson / Faedah */}
                {hadith.pelajaran && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 [body.theme-sepia_&]:bg-[#ebdcc0]/50 border border-slate-200/60 dark:border-slate-800/60 [body.theme-sepia_&]:border-[#dec9a5]/70 text-xs space-y-1">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Faedah & Pelajaran Hadits:</span>
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 [body.theme-sepia_&]:text-[#473826] leading-relaxed">
                      {hadith.pelajaran}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
