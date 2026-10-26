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
import { DownloadAppModal } from './components/DownloadAppModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReadingSettings, BookmarkItem, ReadingHistoryItem, Ayah, ReadingTheme, QariId } from './types/quran';
import { toggleBookmarkItem } from './utils/quranLogic';
import { VoiceSearchResult } from './utils/voiceCommandParser';
import { getThemeStatusBarColor } from './utils/mobilePlatform';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';
import { useMobileDeviceTarget } from './hooks/useMobileDeviceTarget';
import {
  DEFAULT_QARI_ID,
  getQariById,
  isValidQariId,
  getAyahAudioUrl,
  getSurahFullAudioUrl,
  fetchUserStateFromBackend,
  syncUserStateToBackend
} from './services/quranApi';
import {
  AppTabId,
  TajwidSubTab,
  SavedSubTab,
  PersistedNavigationState,
  PersistedAudioSession,
  AudioTrackTarget,
  loadNavigationStateFromBrowser,
  saveNavigationStateToBrowser,
  serializeNavHash,
  parseNavHash,
  loadAudioSessionFromBrowser,
  saveAudioSessionToBrowser,
  computeNextAudioTrack,
  computePrevAudioTrack
} from './utils/sessionPersistence';

const SETTINGS_STORAGE_KEY = 'quran_settings_v1';
const BOOKMARKS_STORAGE_KEY = 'quran_bookmarks_v1';
const HISTORY_STORAGE_KEY = 'quran_history_v1';

export default function App() {
  // Hydrate initial navigation snapshot once (from URL hash + localStorage fallback)
  const initialNavRef = useRef<PersistedNavigationState | null>(null);
  if (!initialNavRef.current) {
    initialNavRef.current = loadNavigationStateFromBrowser();
  }
  const initialNav = initialNavRef.current;

  // Navigation & Sub-View State (persisted across page refresh & PWA relaunch)
  const [activeTab, setActiveTab] = useState<AppTabId>(initialNav.activeTab);
  const [currentSurahNomor, setCurrentSurahNomor] = useState<number>(initialNav.surahNomor);
  const [initialAyahNomor, setInitialAyahNomor] = useState<number>(initialNav.ayahNomor);
  const [tajwidSection, setTajwidSection] = useState<TajwidSubTab>(initialNav.tajwidSection);
  const [savedSubTab, setSavedSubTab] = useState<SavedSubTab>(initialNav.savedSubTab);
  const [hadithBookSlug, setHadithBookSlug] = useState<string>(initialNav.hadithBookSlug);
  const [pendingReaderScrollY, setPendingReaderScrollY] = useState<number>(
    initialNav.activeTab === 'reader' ? initialNav.scrollY : 0
  );

  const scrollYRef = useRef<number>(initialNav.scrollY);
  const isApplyingHashRef = useRef<boolean>(false);
  const hasSyncedInitialHashRef = useRef<boolean>(false);
  const prevRouteRef = useRef<{ activeTab: AppTabId; surahNomor: number }>({
    activeTab: initialNav.activeTab,
    surahNomor: initialNav.surahNomor
  });

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
      qariId: DEFAULT_QARI_ID,
      showTajwid: true,
      showTranslation: true,
      showLatin: true,
      autoScrollAudio: true,
      keepScreenAwake: true
    };
  });

  const activeQariId: QariId = isValidQariId(settings.qariId) ? settings.qariId : DEFAULT_QARI_ID;
  const activeQari = getQariById(activeQariId);

  // Hydrate initial audio session once so active audio player survives refresh & OS relaunch
  const initialAudioSessionRef = useRef<PersistedAudioSession | null | undefined>(undefined);
  if (initialAudioSessionRef.current === undefined) {
    initialAudioSessionRef.current = loadAudioSessionFromBrowser(activeQariId);
  }
  const initialAudioSession = initialAudioSessionRef.current;

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

  // Audio Playback State (hydrated from persisted session if present)
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<PlayingAudioState | null>(() => {
    if (!initialAudioSession) return null;
    return {
      surahNomor: initialAudioSession.surahNomor,
      ayahNomor: initialAudioSession.ayahNomor,
      audioUrl: initialAudioSession.audioUrl,
      isPlaying: initialAudioSession.isPlaying,
      isFullSurah: initialAudioSession.isFullSurah
    };
  });

  // Keep latest navigation state in a ref for zero-rerender scroll & pagehide persistence
  const latestNavStateRef = useRef<PersistedNavigationState>({
    activeTab,
    surahNomor: currentSurahNomor,
    ayahNomor: initialAyahNomor,
    tajwidSection,
    savedSubTab,
    hadithBookSlug,
    scrollY: scrollYRef.current,
    updatedAt: Date.now()
  });

  latestNavStateRef.current = {
    activeTab,
    surahNomor: currentSurahNomor,
    ayahNomor: initialAyahNomor,
    tajwidSection,
    savedSubTab,
    hadithBookSlug,
    scrollY: scrollYRef.current,
    updatedAt: Date.now()
  };

  // Restore scroll position on mount for synchronous non-reader views
  useEffect(() => {
    if (initialNav.activeTab !== 'reader' && initialNav.scrollY > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: initialNav.scrollY, behavior: 'auto' });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, []);

  // Synchronize active page & sub-views to GitHub-Pages-safe URL hash (#/...) + localStorage
  useEffect(() => {
    const nextHash = serializeNavHash({
      activeTab,
      surahNomor: currentSurahNomor,
      ayahNomor: initialAyahNomor,
      tajwidSection,
      savedSubTab,
      hadithBookSlug
    });

    if (typeof window !== 'undefined') {
      if (!hasSyncedInitialHashRef.current) {
        hasSyncedInitialHashRef.current = true;
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, '', nextHash);
        }
      } else if (!isApplyingHashRef.current) {
        const primaryRouteChanged =
          prevRouteRef.current.activeTab !== activeTab ||
          prevRouteRef.current.surahNomor !== currentSurahNomor;
        if (window.location.hash !== nextHash) {
          if (primaryRouteChanged) {
            window.history.pushState(null, '', nextHash);
          } else {
            window.history.replaceState(null, '', nextHash);
          }
        }
      }
      prevRouteRef.current = { activeTab, surahNomor: currentSurahNomor };
      isApplyingHashRef.current = false;
    }

    saveNavigationStateToBrowser({
      activeTab,
      surahNomor: currentSurahNomor,
      ayahNomor: initialAyahNomor,
      tajwidSection,
      savedSubTab,
      hadithBookSlug,
      scrollY: scrollYRef.current,
      updatedAt: Date.now()
    });
  }, [activeTab, currentSurahNomor, initialAyahNomor, tajwidSection, savedSubTab, hadithBookSlug]);

  // Support browser Back / Forward buttons & direct hash edits, plus scrollY persistence
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseNavHash(window.location.hash);
      if (!parsed) return;
      isApplyingHashRef.current = true;
      if (parsed.activeTab) setActiveTab(parsed.activeTab);
      if (parsed.surahNomor !== undefined) setCurrentSurahNomor(parsed.surahNomor);
      if (parsed.ayahNomor !== undefined) setInitialAyahNomor(parsed.ayahNomor);
      if (parsed.tajwidSection) setTajwidSection(parsed.tajwidSection);
      if (parsed.savedSubTab) setSavedSubTab(parsed.savedSubTab);
      if (parsed.hadithBookSlug) setHadithBookSlug(parsed.hadithBookSlug);
    };

    let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      scrollYRef.current = Math.max(0, Math.round(window.scrollY || 0));
      if (scrollSaveTimer) return;
      scrollSaveTimer = setTimeout(() => {
        scrollSaveTimer = null;
        saveNavigationStateToBrowser({
          ...latestNavStateRef.current,
          scrollY: scrollYRef.current
        });
      }, 250);
    };

    const flushNavState = () => {
      scrollYRef.current = Math.max(0, Math.round(window.scrollY || 0));
      saveNavigationStateToBrowser({
        ...latestNavStateRef.current,
        scrollY: scrollYRef.current
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', flushNavState);
    window.addEventListener('beforeunload', flushNavState);
    document.addEventListener('visibilitychange', flushNavState);

    return () => {
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', flushNavState);
      window.removeEventListener('beforeunload', flushNavState);
      document.removeEventListener('visibilitychange', flushNavState);
    };
  }, []);

  // Switch active audio stream immediately when user selects a different Qari
  useEffect(() => {
    setCurrentPlayingAudio((prev) => {
      if (!prev) return null;
      const nextUrl = prev.isFullSurah
        ? getSurahFullAudioUrl(prev.surahNomor, activeQariId)
        : getAyahAudioUrl(prev.surahNomor, prev.ayahNomor, activeQariId);
      if (prev.audioUrl === nextUrl) return prev;
      return { ...prev, audioUrl: nextUrl };
    });
  }, [activeQariId]);

  // Modals & Mobile/Tablet Device Eligibility
  const mobileDeviceTarget = useMobileDeviceTarget();
  const isMobileOrTablet = Boolean(mobileDeviceTarget);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
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

    // Dynamically sync Android Chrome & iOS Safari system status bar color
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', getThemeStatusBarColor(settings.theme));
    }
  }, [settings]);

  // Keep Android & iOS screen awake during Tilawah or active Murottal audio playback
  useScreenWakeLock(
    (activeTab === 'reader' || Boolean(currentPlayingAudio?.isPlaying)) &&
      settings.keepScreenAwake !== false
  );

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

  const handleNavigateTab = (nextTab: AppTabId) => {
    if (nextTab !== activeTab) {
      scrollYRef.current = 0;
      setPendingReaderScrollY(0);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    setActiveTab(nextTab);
  };

  const handleSelectSurah = (nomor: number, ayah: number = 1) => {
    scrollYRef.current = 0;
    setPendingReaderScrollY(0);
    setCurrentSurahNomor(nomor);
    setInitialAyahNomor(ayah);
    setActiveTab('reader');
    if (ayah <= 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApplyVoiceResult = (result: VoiceSearchResult) => {
    if (result.type === 'surah_ayah') {
      const sNo = result.surahNomor || 1;
      const aNo = result.ayahNomor || 1;
      handleSelectSurah(sNo, aNo);
      if (result.action === 'play') {
        const audioUrl = getAyahAudioUrl(sNo, aNo, activeQariId);
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
      handleNavigateTab('surah');
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
      setCurrentPlayingAudio((prev) =>
        prev ? { ...prev, isPlaying: !prev.isPlaying } : null
      );
    } else {
      const audioUrl = getSurahFullAudioUrl(surahNomor, activeQariId);
      setCurrentPlayingAudio({
        surahNomor,
        ayahNomor: 1,
        audioUrl,
        isPlaying: true,
        isFullSurah: true
      });
    }
  };

  const handleAdvanceAudioTrack = (nextTrack: AudioTrackTarget) => {
    setCurrentPlayingAudio((prev) => {
      if (
        prev &&
        prev.surahNomor !== nextTrack.surahNomor &&
        currentSurahNomor === prev.surahNomor
      ) {
        setCurrentSurahNomor(nextTrack.surahNomor);
        setInitialAyahNomor(nextTrack.ayahNomor);
      }
      return nextTrack;
    });
  };

  const handleNextAyahAudio = () => {
    if (!currentPlayingAudio) return;
    const nextTrack = computeNextAudioTrack(
      {
        surahNomor: currentPlayingAudio.surahNomor,
        ayahNomor: currentPlayingAudio.ayahNomor,
        isFullSurah: Boolean(currentPlayingAudio.isFullSurah)
      },
      activeQariId
    );
    if (nextTrack) {
      handleAdvanceAudioTrack(nextTrack);
    }
  };

  const handlePrevAyahAudio = () => {
    if (!currentPlayingAudio) return;
    const prevTrack = computePrevAudioTrack(
      {
        surahNomor: currentPlayingAudio.surahNomor,
        ayahNomor: currentPlayingAudio.ayahNomor,
        isFullSurah: Boolean(currentPlayingAudio.isFullSurah)
      },
      activeQariId
    );
    if (prevTrack) {
      handleAdvanceAudioTrack(prevTrack);
    }
  };

  const handleCloseAudioPlayer = () => {
    saveAudioSessionToBrowser(null);
    setCurrentPlayingAudio(null);
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
        setActiveTab={handleNavigateTab}
        theme={settings.theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDownloadModal={isMobileOrTablet ? () => setIsDownloadModalOpen(true) : undefined}
        onQuickSearch={() => {
          setQuickSearchInitialQuery('');
          setIsQuickSearchOpen(true);
        }}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
      />

      {/* Main Page Views */}
      <main className="flex-1 pb-28 lg:pb-24">
        {activeTab === 'surah' && (
          <SurahListView
            onSelectSurah={handleSelectSurah}
            lastRead={lastRead}
            onNavigateToHadith={() => handleNavigateTab('hadith')}
            onNavigateToTajwid={() => handleNavigateTab('tajwid')}
            onNavigateToProgress={() => handleNavigateTab('saved')}
            onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
            onOpenDownloadModal={isMobileOrTablet ? () => setIsDownloadModalOpen(true) : undefined}
            externalSearchQuery={surahListFilter.query}
            initialFilter={surahListFilter.filter}
          />
        )}

        {activeTab === 'reader' && (
          <SurahReaderView
            currentSurahNomor={currentSurahNomor}
            initialAyahNomor={initialAyahNomor}
            initialScrollY={pendingReaderScrollY}
            onInitialScrollRestored={() => setPendingReaderScrollY(0)}
            onSelectSurah={handleSelectSurah}
            settings={settings}
            onUpdateSettings={updateSettings}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            readingHistory={readingHistory}
            onUpdateHistory={handleUpdateHistory}
            currentPlayingAudio={currentPlayingAudio}
            onPlayAyahAudio={handlePlayAyahAudio}
            onPlaySurahFullAudio={handlePlaySurahFullAudio}
            onOpenShareModal={handleOpenShareModal}
            onNavigateToTajwid={() => handleNavigateTab('tajwid')}
          />
        )}

        {activeTab === 'hadith' && (
          <HadithExplorerView
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            initialBookSlug={hadithBookSlug}
            onBookSlugChange={setHadithBookSlug}
          />
        )}

        {activeTab === 'tajwid' && (
          <TajwidGuideView
            onJumpToSurah={handleSelectSurah}
            initialSection={tajwidSection}
            onSectionChange={setTajwidSection}
          />
        )}

        {activeTab === 'saved' && (
          <SavedAndHistoryView
            bookmarks={bookmarks}
            readingHistory={readingHistory}
            onRemoveBookmark={handleRemoveBookmark}
            onUpdateBookmarkNote={handleUpdateBookmarkNote}
            onClearHistory={handleClearHistory}
            onJumpToSurah={handleSelectSurah}
            onImportBookmarks={(imported) => setBookmarks(imported)}
            initialTab={savedSubTab}
            onTabChange={setSavedSubTab}
          />
        )}
      </main>

      {/* Persistent Audio Player Bar (keeps DOM <audio> mounted at all times) */}
      <AudioPlayerBar
        currentPlaying={currentPlayingAudio}
        initialAudioSession={initialAudioSession}
        selectedQariId={activeQariId}
        onSelectQari={(qariId) => updateSettings({ qariId })}
        onClose={handleCloseAudioPlayer}
        onNextAyah={handleNextAyahAudio}
        onPrevAyah={handlePrevAyahAudio}
        onAdvanceTrack={handleAdvanceAudioTrack}
        onAutoplayBlocked={() =>
          setCurrentPlayingAudio((prev) => (prev ? { ...prev, isPlaying: false } : null))
        }
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
        onOpenDownloadModal={isMobileOrTablet ? () => setIsDownloadModalOpen(true) : undefined}
      />

      {/* Mobile & Tablet APK / IPA Download Modal */}
      <DownloadAppModal
        isOpen={isMobileOrTablet && isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectSurah={handleSelectSurah}
        onSelectHadith={() => handleNavigateTab('hadith')}
        onSelectTajwid={() => handleNavigateTab('tajwid')}
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

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Mobile & Tablet Floating Dock Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={handleNavigateTab} />

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 [body.theme-sepia_&]:border-[#dec9a5] py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-6 text-center text-xs text-slate-500 dark:text-slate-400 [body.theme-sepia_&]:text-[#624f3a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Al-Qur'an Digital & Ensiklopedia Hadits · Terjemahan Resmi Kemenag RI & Murottal {activeQari.nama}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium">
            <button onClick={() => handleNavigateTab('surah')} className="hover:underline cursor-pointer">
              114 Surah
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => handleNavigateTab('hadith')} className="hover:underline cursor-pointer">
              9 Kitab Hadits
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => handleNavigateTab('tajwid')} className="hover:underline cursor-pointer">
              Kaidah Tajwid
            </button>
            {isMobileOrTablet && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="text-emerald-700 dark:text-emerald-400 [body.theme-sepia_&]:text-[#4d3c2a] hover:underline cursor-pointer"
                >
                  Unduh Aplikasi
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
