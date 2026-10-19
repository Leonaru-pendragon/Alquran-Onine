import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SurahListView } from './components/SurahListView';
import { SurahReaderView } from './components/SurahReaderView';
import { HadithExplorerView } from './components/HadithExplorerView';
import { TajwidGuideView } from './components/TajwidGuideView';
import { SavedAndHistoryView } from './components/SavedAndHistoryView';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { SettingsModal } from './components/SettingsModal';
import { ShareAyahModal } from './components/ShareAyahModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { ReadingSettings, BookmarkItem, ReadingHistoryItem, Ayah, ReadingTheme } from './types/quran';
import { toggleBookmarkItem } from './utils/quranLogic';

const SETTINGS_STORAGE_KEY = 'quran_settings_v1';
const BOOKMARKS_STORAGE_KEY = 'quran_bookmarks_v1';
const HISTORY_STORAGE_KEY = 'quran_history_v1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'surah' | 'reader' | 'hadith' | 'tajwid' | 'saved'>('surah');
  const [currentSurahNomor, setCurrentSurahNomor] = useState<number>(1);
  const [initialAyahNomor, setInitialAyahNomor] = useState<number>(1);

  // Settings State with Persistence
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      theme: 'light',
      arabicFontSize: 28,
      translationFontSize: 15,
      arabicFontFamily: 'amiri',
      showTajwid: true,
      showTranslation: true,
      showLatin: true,
      autoScrollAudio: true
    };
  });

  // Bookmarks State with Persistence
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'bm_default_1',
        type: 'ayah',
        surahNomor: 1,
        surahNamaLatin: 'Al-Fatihah',
        ayatNomor: 5,
        teksArab: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        teksTerjemah: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
        catatan: 'Prinsip tauhid ibadah dan permohonan pertolongan hanya kepada Allah.',
        timestamp: Date.now() - 3600000
      }
    ];
  });

  // Reading History State with Persistence
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        surahNomor: 1,
        surahNamaLatin: 'Al-Fatihah',
        ayatNomor: 1,
        totalAyat: 7,
        timestamp: Date.now() - 1800000
      }
    ];
  });

  // Audio Playback State
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<{
    surahNomor: number;
    ayahNomor: number;
    audioUrl: string;
    isPlaying: boolean;
  } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [shareModalState, setShareModalState] = useState<{
    isOpen: boolean;
    surahName: string;
    surahNomor: number;
    ayah: Ayah | null;
  }>({
    isOpen: false,
    surahName: '',
    surahNomor: 1,
    ayah: null
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }

    // Apply classes to document element and body
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark', 'sepia');
    body.classList.remove('theme-light', 'theme-sepia', 'theme-dark');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('theme-dark');
    } else if (settings.theme === 'sepia') {
      root.classList.add('sepia');
      body.classList.add('theme-sepia');
    } else {
      body.classList.add('theme-light');
    }
  }, [settings]);

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks]);

  // Persist reading history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(readingHistory));
    } catch {
      // ignore
    }
  }, [readingHistory]);

  const updateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setTheme = (newTheme: ReadingTheme) => {
    updateSettings({ theme: newTheme });
  };

  const handleSelectSurah = (nomor: number, ayah: number = 1) => {
    setCurrentSurahNomor(nomor);
    setInitialAyahNomor(ayah);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (item: Omit<BookmarkItem, 'id' | 'timestamp'>) => {
    setBookmarks((prev) => toggleBookmarkItem(prev, item));
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateBookmarkNote = (id: string, note: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, catatan: note } : b))
    );
  };

  const handleUpdateHistory = (newItem: ReadingHistoryItem) => {
    setReadingHistory((prev) => {
      // Remove previous entry for same surah if any, and place fresh at top
      const filtered = prev.filter((h) => h.surahNomor !== newItem.surahNomor);
      return [newItem, ...filtered].slice(0, 30); // keep last 30
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Yakin ingin menghapus seluruh riwayat bacaan?')) {
      setReadingHistory([]);
    }
  };

  // Audio Playback Handlers
  const handlePlayAyahAudio = (surahNomor: number, ayahNomor: number, audioUrl: string) => {
    if (
      currentPlayingAudio &&
      currentPlayingAudio.surahNomor === surahNomor &&
      currentPlayingAudio.ayahNomor === ayahNomor
    ) {
      // Toggle
      setCurrentPlayingAudio((prev) =>
        prev ? { ...prev, isPlaying: !prev.isPlaying } : null
      );
    } else {
      setCurrentPlayingAudio({
        surahNomor,
        ayahNomor,
        audioUrl,
        isPlaying: true
      });
    }
  };

  const handleNextAyahAudio = () => {
    if (!currentPlayingAudio) return;
    const nextAyah = currentPlayingAudio.ayahNomor + 1;
    const nextAudioUrl = `https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasy/${String(
      currentPlayingAudio.surahNomor
    ).padStart(3, '0')}${String(nextAyah).padStart(3, '0')}.mp3`;

    setCurrentPlayingAudio({
      ...currentPlayingAudio,
      ayahNomor: nextAyah,
      audioUrl: nextAudioUrl,
      isPlaying: true
    });
  };

  const handlePrevAyahAudio = () => {
    if (!currentPlayingAudio || currentPlayingAudio.ayahNomor <= 1) return;
    const prevAyah = currentPlayingAudio.ayahNomor - 1;
    const prevAudioUrl = `https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasy/${String(
      currentPlayingAudio.surahNomor
    ).padStart(3, '0')}${String(prevAyah).padStart(3, '0')}.mp3`;

    setCurrentPlayingAudio({
      ...currentPlayingAudio,
      ayahNomor: prevAyah,
      audioUrl: prevAudioUrl,
      isPlaying: true
    });
  };

  const handleOpenShareModal = (surahName: string, surahNomor: number, ayah: Ayah) => {
    setShareModalState({
      isOpen: true,
      surahName,
      surahNomor,
      ayah
    });
  };

  const lastRead = readingHistory.length > 0 ? readingHistory[0] : null;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={settings.theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickSearch={() => setIsQuickSearchOpen(true)}
      />

      {/* Main Page Views */}
      <main className="flex-1 pb-24">
        {activeTab === 'surah' && (
          <SurahListView
            onSelectSurah={handleSelectSurah}
            lastRead={lastRead}
            onNavigateToHadith={() => setActiveTab('hadith')}
            onNavigateToTajwid={() => setActiveTab('tajwid')}
          />
        )}

        {activeTab === 'reader' && (
          <SurahReaderView
            currentSurahNomor={currentSurahNomor}
            initialAyahNomor={initialAyahNomor}
            onSelectSurah={handleSelectSurah}
            settings={settings}
            onUpdateSettings={updateSettings}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onUpdateHistory={handleUpdateHistory}
            currentPlayingAudio={currentPlayingAudio}
            onPlayAyahAudio={handlePlayAyahAudio}
            onOpenShareModal={handleOpenShareModal}
          />
        )}

        {activeTab === 'hadith' && (
          <HadithExplorerView
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'tajwid' && <TajwidGuideView />}

        {activeTab === 'saved' && (
          <SavedAndHistoryView
            bookmarks={bookmarks}
            readingHistory={readingHistory}
            onRemoveBookmark={handleRemoveBookmark}
            onUpdateBookmarkNote={handleUpdateBookmarkNote}
            onClearHistory={handleClearHistory}
            onJumpToSurah={handleSelectSurah}
            onImportBookmarks={(imported) => setBookmarks(imported)}
          />
        )}
      </main>

      {/* Persistent Audio Player Bar */}
      <AudioPlayerBar
        currentPlaying={currentPlayingAudio}
        onClose={() => setCurrentPlayingAudio(null)}
        onNextAyah={handleNextAyahAudio}
        onPrevAyah={handlePrevAyahAudio}
        onTogglePlayPause={() =>
          setCurrentPlayingAudio((prev) =>
            prev ? { ...prev, isPlaying: !prev.isPlaying } : null
          )
        }
      />

      {/* Accessibility & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectSurah={handleSelectSurah}
        onSelectHadith={() => setActiveTab('hadith')}
      />

      {/* Share Ayah Modal */}
      <ShareAyahModal
        isOpen={shareModalState.isOpen}
        onClose={() => setShareModalState((prev) => ({ ...prev, isOpen: false }))}
        surahName={shareModalState.surahName}
        surahNomor={shareModalState.surahNomor}
        ayah={shareModalState.ayah}
      />

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] py-6 text-center text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Al-Qur'an Digital & Ensiklopedia Hadits · Terjemahan Resmi Kemenag RI & Murottal Syaikh Misyari Rasyid Al-Afasy
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => setActiveTab('surah')} className="hover:underline cursor-pointer">
              114 Surah
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setActiveTab('hadith')} className="hover:underline cursor-pointer">
              9 Kitab Hadits
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setActiveTab('tajwid')} className="hover:underline cursor-pointer">
              Kaidah Tajwid
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
