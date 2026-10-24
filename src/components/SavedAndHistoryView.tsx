import React, { useState } from 'react';
import { Bookmark, Clock, Trash2, ArrowUpRight, BookOpen, Edit3, Check, X, Download, Upload, TrendingUp } from 'lucide-react';
import { BookmarkItem, ReadingHistoryItem } from '../types/quran';
import { formatIndonesianRelativeTime, calculateReadingProgress } from '../utils/quranLogic';
import { ReadingProgressDashboard } from './ReadingProgressDashboard';

interface SavedAndHistoryViewProps {
  bookmarks: BookmarkItem[];
  readingHistory: ReadingHistoryItem[];
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmarkNote: (id: string, note: string) => void;
  onClearHistory: () => void;
  onJumpToSurah: (surahNomor: number, ayahNomor: number) => void;
  onImportBookmarks: (imported: BookmarkItem[]) => void;
  initialTab?: 'dashboard' | 'bookmarks' | 'history';
}

export const SavedAndHistoryView: React.FC<SavedAndHistoryViewProps> = ({
  bookmarks,
  readingHistory,
  onRemoveBookmark,
  onUpdateBookmarkNote,
  onClearHistory,
  onJumpToSurah,
  onImportBookmarks,
  initialTab = 'dashboard'
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookmarks' | 'history'>(initialTab);
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<'all' | 'ayah' | 'hadith'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const filteredBookmarks = bookmarks.filter((b) => {
    if (bookmarkTypeFilter === 'all') return true;
    return b.type === bookmarkTypeFilter;
  });

  const handleStartEditNote = (bookmark: BookmarkItem) => {
    setEditingNoteId(bookmark.id);
    setEditingNoteText(bookmark.catatan || '');
  };

  const handleSaveEditNote = (id: string) => {
    onUpdateBookmarkNote(id, editingNoteText.trim());
    setEditingNoteId(null);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alquran_penanda_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBookmarks(parsed);
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/60 [body.theme-sepia_&]:bg-[#ebdcc0]/50 [body.theme-sepia_&]:border-[#dec9a5] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 [body.theme-sepia_&]:text-amber-900">
          <Bookmark className="w-4 h-4" />
          <span>Progres Tilawah, Penanda & Riwayat</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
          Progres Khatam & Riwayat Bacaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a] max-w-2xl">
          Visualisasi pencapaian khatam 30 Juz dengan diagram interaktif Recharts, kelola penanda ayat serta hadits favorit, dan lanjutkan tilawah secara otomatis.
        </p>
      </div>

      {/* Main Tabs (Segmented Control) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 [body.theme-sepia_&]:border-[#dec9a5] pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dashboard Progres</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Ayat Ditandai ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Otomatis ({readingHistory.length})</span>
          </button>
        </div>

        {/* Tab-specific actions */}
        {activeTab === 'bookmarks' && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleExportJson}
              title="Cadangkan Penanda ke file JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
            <label
              title="Pulihkan Penanda dari file JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Impor</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {activeTab === 'history' && readingHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <ReadingProgressDashboard
          readingHistory={readingHistory}
          onJumpToSurah={onJumpToSurah}
        />
      )}

      {/* Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          {/* Sub-filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Tampilkan:</span>
            {(['all', 'ayah', 'hadith'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBookmarkTypeFilter(t)}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  bookmarkTypeFilter === t
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'ayah' ? 'Hanya Ayat Al-Qur\'an' : 'Hanya Hadits'}
              </button>
            ))}
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Bookmark className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
                Belum Ada Penanda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Tandai ayat favorit atau hadits saat membaca dengan menekan ikon bookmark pada setiap ayat atau hadits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] space-y-3"
                >
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {item.type === 'ayah'
                          ? `QS. ${item.surahNamaLatin} : Ayat ${item.ayatNomor}`
                          : `${item.kitabNama} : Hadits No. ${item.haditsNomor}`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatIndonesianRelativeTime(item.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.type === 'ayah' && item.surahNomor && item.ayatNomor && (
                        <button
                          onClick={() => onJumpToSurah(item.surahNomor!, item.ayatNomor!)}
                          aria-label="Buka di Mushaf"
                          title="Buka Ayat di Halaman Baca"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <span>Buka</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEditNote(item)}
                        aria-label="Edit Catatan"
                        title="Edit Catatan Pribadi"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onRemoveBookmark(item.id)}
                        aria-label="Hapus Penanda"
                        title="Hapus Penanda"
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Arabic text */}
                  <div className="arabic-verse font-arabic text-xl sm:text-2xl text-slate-900 dark:text-slate-100 py-1">
                    {item.teksArab}
                  </div>

                  {/* Translation */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{item.teksTerjemah}"
                  </p>

                  {/* Note Editing Form or Display Note */}
                  {editingNoteId === item.id ? (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        placeholder="Tulis catatan atau refleksi..."
                        className="flex-1 p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleSaveEditNote(item.id)}
                        className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                        title="Simpan Catatan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    item.catatan && (
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 [body.theme-sepia_&]:bg-[#ebdcc0]/60 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                        <span className="font-semibold block mb-0.5">Catatan Refleksi:</span>
                        <p>{item.catatan}</p>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {readingHistory.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
                Belum Ada Riwayat Bacaan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Riwayat bacaan akan dicatat secara otomatis ketika Anda membuka dan membaca ayat-ayat Al-Qur'an.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {readingHistory.map((hist, idx) => (
                <div
                  key={`${hist.surahNomor}_${hist.timestamp}_${idx}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:bg-[#f6eee0] [body.theme-sepia_&]:border-[#e5dac6] flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Surah ke-{hist.surahNomor}</span>
                      <span>{formatIndonesianRelativeTime(hist.timestamp)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 [body.theme-sepia_&]:text-[#2c2217]">
                      Surah {hist.surahNamaLatin}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Ayat {hist.ayatNomor} dari {hist.totalAyat} ayat
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{
                          width: `${calculateReadingProgress(hist.ayatNomor, hist.totalAyat)}%`
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onJumpToSurah(hist.surahNomor, hist.ayatNomor)}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Lanjutkan Bacaan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
