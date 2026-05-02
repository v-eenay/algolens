'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { CodeEditorPanel } from '@/components/editor/mock-code-editor-panel';
import { SideDescriptionPanel } from '@/components/ai-explanation/side-description-panel';
import { BottomDock } from '@/components/layout/bottom-dock';
import { TopNav } from '@/components/layout/top-nav';
import { EnhancedVisualizationPanel } from '@/components/visualization/enhanced-visualization-panel';
import { useExecutionStore } from '@/lib/store/executionStore';
import { useExecutionSocket } from '@/lib/hooks/useExecutionSocket';
import { useHasHydrated } from '@/lib/hooks/useHasHydrated';

import { algorithmTemplates } from '@/lib/constants/algorithm-templates';

import type {
  ChatMessage,
  EditorLanguage,
  ThemeMode,
  VisualizerTab,
} from '@/lib/types/types';

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Home() {
  const hasHydrated = useHasHydrated();

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // ── Algorithm selection ───────────────────────────────────────────────────
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('quick-sort');

  // ── UI state ──────────────────────────────────────────────────────────────
  const language = useExecutionStore((state) => state.language) as EditorLanguage;
  const [visualizerTab, setVisualizerTab] = useState<VisualizerTab>('animated');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  
  // ── Panel visibility state ────────────────────────────────────────────────
  const [visiblePanels, setVisiblePanels] = useState({
    editor: true,
    visualizer: true,
    notes: true,
  });

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const { sendCode, isConnected } = useExecutionSocket();

  // ── Data state ────────────────────────────────────────────────────────────
  const code = useExecutionStore((state) => state.code);
  const frames = useExecutionStore((state) => state.frames);
  const resetExecution = useExecutionStore((state) => state.resetExecution);
  const setLanguage = useExecutionStore((state) => state.setLanguage);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // ── Playback state ────────────────────────────────────────────────────────
  const currentFrameIndex = useExecutionStore((state) => state.currentFrameIndex);
  const setCurrentFrameIndex = useExecutionStore((state) => state.setCurrentFrameIndex);
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  const setIsPlaying = useExecutionStore((state) => state.setIsPlaying);
  const setCode = useExecutionStore((state) => state.setCode);
  
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Sync boilerplate when algorithm changes ───────────────────────────────
  useEffect(() => {
    // 1. Fully reset execution state to prevent stale visualization data
    resetExecution();
    
    // 2. Clear UI-specific local states
    setChatMessages([]);
    
    // 3. Load boilerplate code
    const template = algorithmTemplates[selectedAlgorithm];
    if (template) {
      setCode(template.code);
      setLanguage(template.language);
    } else {
      setCode('# Boilerplate not found for this algorithm');
      setLanguage('Python');
    }
  }, [selectedAlgorithm, resetExecution, setCode, setLanguage]);

  // ── Theme sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  // ── Playback interval ─────────────────────────────────────────────────────
  const nextFrame = useExecutionStore((state) => state.nextFrame);
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        nextFrame();
      }, 1200);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, frames.length, nextFrame]);

  // ── Stop playback when reaching end ───────────────────────────────────────
  useEffect(() => {
    if (currentFrameIndex >= frames.length - 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentFrameIndex, frames.length, isPlaying, setIsPlaying]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const rawCurrentFrame = frames[currentFrameIndex] ?? null;
  const currentEditorLang = { filename: `${selectedAlgorithm}.${language === 'Python' ? 'py' : language === 'C++' ? 'cpp' : 'js'}` };

  let activeLine = 1;
  if (rawCurrentFrame?.activeLine !== undefined) {
    activeLine = typeof rawCurrentFrame.activeLine === 'object' 
      ? (rawCurrentFrame.activeLine as Record<string, number>)[language] || 1
      : rawCurrentFrame.activeLine;
  }

  const currentFrame = rawCurrentFrame ? { ...rawCurrentFrame, activeLine } : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleThemeToggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (!isPlaying && currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying(!isPlaying);
  }, [currentFrameIndex, frames.length, isPlaying, setCurrentFrameIndex, setIsPlaying]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  }, [setIsPlaying, setCurrentFrameIndex]);

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
  }, [currentFrameIndex, setIsPlaying, setCurrentFrameIndex]);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1));
  }, [currentFrameIndex, frames.length, setIsPlaying, setCurrentFrameIndex]);

  const handleFrameChange = useCallback((idx: number) => {
    setIsPlaying(false);
    setCurrentFrameIndex(idx);
  }, [setIsPlaying, setCurrentFrameIndex]);

  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: message };
    const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'AI chat is currently disabled without mock data.' };
    setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
  }, []);

  // ── Panel toggle handlers ─────────────────────────────────────────────────
  const handleTogglePanel = useCallback((panel: 'editor' | 'visualizer' | 'notes') => {
    setVisiblePanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
    if (panel === 'notes') {
      setSidePanelOpen((prev) => !prev);
    }
  }, []);

  // ── Layout calculations ───────────────────────────────────────────────────
  const visibleCount = Object.values(visiblePanels).filter(Boolean).length;
  const panelWidth = visibleCount > 0 ? `${100 / visibleCount}%` : '0%';
  const bottomDockHeight = terminalOpen ? 324 : 204;

  if (!hasHydrated) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Initializing AlgoLens Architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="relative flex h-screen flex-col">
        {/* ── Top navigation ──────────────────────────────────── */}
        <div className="flex-shrink-0">
          <TopNav
            activeTab={visualizerTab}
            language={language}
            sidePanelOpen={sidePanelOpen}
            terminalOpen={terminalOpen}
            theme={theme}
            currentFrameIndex={currentFrameIndex}
            totalFrames={frames.length || 1}
            visiblePanels={visiblePanels}
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            onToggleSidePanel={() => setSidePanelOpen((s) => !s)}
            onToggleTerminal={() => setTerminalOpen((s) => !s)}
            onToggleTheme={handleThemeToggle}
            onTogglePanel={handleTogglePanel}
          />
          
          {/* Run Code Button - Refined positioning */}
          <div className="absolute top-4 right-[380px] z-50">
            <button 
              onClick={() => sendCode(code, language)}
              disabled={!isConnected}
              className="bg-primary text-primary-foreground px-5 py-2 rounded text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center gap-2 border border-primary/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              RUN EXECUTION
            </button>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────── */}
        <div
          className="flex-1 overflow-hidden px-3 py-3 md:px-4 lg:px-6"
          style={{ paddingBottom: `${bottomDockHeight}px` }}
        >
          <section className="flex h-full min-h-0 gap-3">
            {/* Code editor */}
            {visiblePanels.editor && (
              <motion.div
                key="editor-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: panelWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="min-h-[26rem]"
              >
                <CodeEditorPanel
                  filename={currentEditorLang.filename}
                  activeLine={currentFrame?.activeLine ?? 1}
                />
              </motion.div>
            )}

            {/* Visualizer */}
            {visiblePanels.visualizer && (
              <motion.div
                key="visualizer-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: panelWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="min-h-[26rem]"
              >
                <EnhancedVisualizationPanel
                  activeTab={visualizerTab}
                  onTabChange={setVisualizerTab}
                />
              </motion.div>
            )}

            {/* Notes panel */}
            {visiblePanels.notes && (
              <motion.div
                key="notes-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: panelWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="min-h-[26rem]"
              >
                <SideDescriptionPanel
                  isOpen={sidePanelOpen}
                  chatMessages={chatMessages}
                  currentFrame={currentFrame}
                  onToggle={() => handleTogglePanel('notes')}
                  onSendMessage={handleSendMessage}
                />
              </motion.div>
            )}
          </section>
        </div>

        {/* ── Bottom dock (fixed) ─────────────────────────────────────── */}
        <BottomDock
          terminalOpen={terminalOpen}
          isPlaying={isPlaying}
          currentFrameIndex={currentFrameIndex}
          totalFrames={frames.length || 1}
          currentFrame={currentFrame}
          onToggleTerminal={() => setTerminalOpen((s) => !s)}
          onTogglePlay={handlePlayToggle}
          onStop={handleStop}
          onStepBackward={handleStepBackward}
          onStepForward={handleStepForward}
          onFrameChange={handleFrameChange}
        />
      </div>
    </main>
  );
}
