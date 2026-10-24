import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SurahListView } from './components/SurahListView';
import { SurahReaderView } from './components/SurahReaderView';
import { HadithExplorerView } from './components/HadithExplorerView';
import { TajwidGuideView } from './components/TajwidGuideView';
import { SavedAndHistoryView } from './components/SavedAndHistoryView';
import { AudioPlayerBar, PlayingAudioState } from './components/AudioPlayerBar';
import { SettingsModal } from './components/SettingsModal';
import { ShareAyahModal } from './components/ShareAyahModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { ReadingSettings, BookmarkItem, ReadingHistoryItem, Ayah, ReadingTheme } from './types/quran';
import { toggleBookmarkItem } from './utils/quranLogic';
import { VoiceSearchResult } from './utils/voiceCommandParser';
import { SURAH_METADATA_LIST } from './data/quranMetadata';
import {
  getAyahAudioUrl,
  getSurahFullAudioUrl,
  fetchUserStateFromBackend,
  syncUserStateToBackend
} from './services/quranApi';

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
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<PlayingAudioState | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [quickSearchInitialQuery, setQuickSearchInitialQuery] = useState('');
  const [surahListFilter, setSurahListFilter] = useState<{
    query?: string;
    filter?: 'Semua' | 'Makkiyyah' | 'Madaniyyah' | 'Juz';
  }>({});
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

  // Hydrate & sync user state with Express backend when running in full-stack mode
  const backendHydratedRef = useRef(false);
  useEffect(() => {
    let active = true;
    fetchUserStateFromBackend()
      .then((serverState) => {
        if (!active) return;
        if (serverState) {
          if (Array.isArray(serverState.bookmarks) && !localStorage.getItem(BOOKMARKS_STORAGE_KEY)) {
            setBookmarks(serverState.bookmarks as BookmarkItem[]);
          }
          if (Array.isArray(serverState.readingHistory) && !localStorage.getItem(HISTORY_STORAGE_KEY)) {
            setReadingHistory(serverState.readingHistory as ReadingHistoryItem[]);
          }
          if (serverState.settings && !localStorage.getItem(SETTINGS_STORAGE_KEY)) {
            setSettings((prev) => ({ ...prev, ...(serverState.settings as Partial<ReadingSettings>) }));
          }
        }
        backendHydratedRef.current = true;
      })
      .catch(() => {
        backendHydratedRef.current = true;
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!backendHydratedRef.current) return;
    const timer = setTimeout(() => {
      void syncUserStateToBackend({ bookmarks, readingHistory, settings });
    }, 350);
    return () => clearTimeout(timer);
  }, [bookmarks, readingHistory, settings]);

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

  const handleApplyVoiceResult = (result: VoiceSearchResult) => {
    if (result.type === 'surah_ayah') {
      const sNo = result.surahNomor || 1;
      const aNo = result.ayahNomor || 1;
      handleSelectSurah(sNo, aNo);
      if (result.action === 'play') {
        const audioUrl = getAyahAudioUrl(sNo, aNo);
        handlePlayAyahAudio(sNo, aNo, audioUrl);
      }
    } else if (result.type === 'surah') {
      const sNo = result.surahNomor || 1;
      handleSelectSurah(sNo, 1);
      if (result.action === 'play') {
        handlePlaySurahFullAudio(sNo);
      }
    } else if (result.type === 'juz') {
      setSurahListFilter({ filter: 'Juz', query: String(result.juzNomor || 1) });
      setActiveTab('surah');
    } else if (result.type === 'search_query') {
      if (result.searchQuery) {
        setQuickSearchInitialQuery(result.searchQuery);
        setIsQuickSearchOpen(true);
      }
    }
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
    setReadingHistory([]);
  };

  // Audio Playback Handlers
  const handlePlayAyahAudio = (surahNomor: number, ayahNomor: number, audioUrl: string) => {
    if (
      currentPlayingAudio &&
      currentPlayingAudio.surahNomor === surahNomor &&
      currentPlayingAudio.ayahNomor === ayahNomor &&
      !currentPlayingAudio.isFullSurah
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
        isPlaying: true,
        isFullSurah: false
      });
    }
  };

  const handlePlaySurahFullAudio = (surahNomor: number) => {
    if (
      currentPlayingAudio &&
      currentPlayingAudio.surahNomor === surahNomor &&
      currentPlayingAudio.isFullSurah
    ) {
      // Toggle
      setCurrentPlayingAudio((prev) =>
        prev ? { ...prev, isPlaying: !prev.isPlaying } : null
      );
    } else {
      const audioUrl = getSurahFullAudioUrl(surahNomor);
      setCurrentPlayingAudio({
        surahNomor,
        ayahNomor: 1,
        audioUrl,
        isPlaying: true,
        isFullSurah: true
      });
    }
  };

  const handleNextAyahAudio = () => {
    if (!currentPlayingAudio) return;

    if (currentPlayingAudio.isFullSurah) {
      if (currentPlayingAudio.surahNomor < 114) {
        const nextSurah = currentPlayingAudio.surahNomor + 1;
        handlePlaySurahFullAudio(nextSurah);
        setCurrentSurahNomor(nextSurah);
        setInitialAyahNomor(1);
      }
      return;
    }

    const currentMeta = SURAH_METADATA_LIST.find((s) => s.nomor === currentPlayingAudio.surahNomor);
    const totalAyat = currentMeta?.jumlahAyat || 7;
    const nextAyah = currentPlayingAudio.ayahNomor + 1;

    if (nextAyah <= totalAyat) {
      const nextAudioUrl = getAyahAudioUrl(currentPlayingAudio.surahNomor, nextAyah);
      setCurrentPlayingAudio({
        ...currentPlayingAudio,
        ayahNomor: nextAyah,
        audioUrl: nextAudioUrl,
        isPlaying: true
      });
    } else if (currentPlayingAudio.surahNomor < 114) {
      // Advance to next Surah Ayah 1
      const nextSurah = currentPlayingAudio.surahNomor + 1;
      const nextAudioUrl = getAyahAudioUrl(nextSurah, 1);
      setCurrentPlayingAudio({
        surahNomor: nextSurah,
        ayahNomor: 1,
        audioUrl: nextAudioUrl,
        isPlaying: true,
        isFullSurah: false
      });
      setCurrentSurahNomor(nextSurah);
      setInitialAyahNomor(1);
    }
  };

  const handlePrevAyahAudio = () => {
    if (!currentPlayingAudio) return;

    if (currentPlayingAudio.isFullSurah) {
      if (currentPlayingAudio.surahNomor > 1) {
        const prevSurah = currentPlayingAudio.surahNomor - 1;
        handlePlaySurahFullAudio(prevSurah);
        setCurrentSurahNomor(prevSurah);
        setInitialAyahNomor(1);
      }
      return;
    }

    const prevAyah = currentPlayingAudio.ayahNomor - 1;
    if (prevAyah >= 1) {
      const prevAudioUrl = getAyahAudioUrl(currentPlayingAudio.surahNomor, prevAyah);
      setCurrentPlayingAudio({
        ...currentPlayingAudio,
        ayahNomor: prevAyah,
        audioUrl: prevAudioUrl,
        isPlaying: true
      });
    } else if (currentPlayingAudio.surahNomor > 1) {
      const prevSurah = currentPlayingAudio.surahNomor - 1;
      const prevMeta = SURAH_METADATA_LIST.find((s) => s.nomor === prevSurah);
      const lastAyahOfPrev = prevMeta?.jumlahAyat || 1;
      const prevAudioUrl = getAyahAudioUrl(prevSurah, lastAyahOfPrev);
      setCurrentPlayingAudio({
        surahNomor: prevSurah,
        ayahNomor: lastAyahOfPrev,
        audioUrl: prevAudioUrl,
        isPlaying: true,
        isFullSurah: false
      });
      setCurrentSurahNomor(prevSurah);
      setInitialAyahNomor(lastAyahOfPrev);
    }
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
        onQuickSearch={() => {
          setQuickSearchInitialQuery('');
          setIsQuickSearchOpen(true);
        }}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
      />

      {/* Main Page Views */}
      <main className="flex-1 pb-24">
        {activeTab === 'surah' && (
          <SurahListView
            onSelectSurah={handleSelectSurah}
            lastRead={lastRead}
            onNavigateToHadith={() => setActiveTab('hadith')}
            onNavigateToTajwid={() => setActiveTab('tajwid')}
            onNavigateToProgress={() => setActiveTab('saved')}
            onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
            externalSearchQuery={surahListFilter.query}
            initialFilter={surahListFilter.filter}
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
            onPlaySurahFullAudio={handlePlaySurahFullAudio}
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
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        initialQuery={quickSearchInitialQuery}
      />

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onApplyResult={handleApplyVoiceResult}
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
