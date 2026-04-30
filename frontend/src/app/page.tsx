'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { MockCodeEditorPanel } from '@/components/editor/mock-code-editor-panel';
import { SideDescriptionPanel } from '@/components/ai-explanation/side-description-panel';
import { BottomDock } from '@/components/layout/bottom-dock';
import { TopNav } from '@/components/layout/top-nav';
import { EnhancedVisualizationPanel } from '@/components/visualization/enhanced-visualization-panel';

import {
  sendChatMessage,
} from '@/lib/mock-data/mock-api';

import type {
  ChatMessage,
  EditorLanguage,
  EditorStateMap,
  ExecutionFrame,
  ThemeMode,
  VisualizerTab,
} from '@/lib/types/types';

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Home() {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // ── Algorithm selection ───────────────────────────────────────────────────
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('quick-sort');
  const [, setAlgorithmData] = useState<any>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<EditorLanguage>('Python');
  const [visualizerTab, setVisualizerTab] = useState<VisualizerTab>('animated');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  
  // ── Panel visibility state ────────────────────────────────────────────────
  const [visiblePanels, setVisiblePanels] = useState({
    editor: true,
    visualizer: true,
    notes: true,
  });

  // ── Data state ────────────────────────────────────────────────────────────
  const [editorState, setEditorState] = useState<EditorStateMap | null>(null);
  const [frames, setFrames] = useState<ExecutionFrame[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  // ── Playback state ────────────────────────────────────────────────────────
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Theme sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  // ── Load algorithm data when selection changes ────────────────────────────
  useEffect(() => {
    const loadAlgorithmData = async () => {
      try {
        setIsLoadingEditor(true);
        setIsLoadingFrames(true);
        setIsLoadingChat(true);

        // Dynamically import the algorithm JSON file
        const data = await import(`@/lib/mock-data/algorithms/${selectedAlgorithm}.json`);
        setAlgorithmData(data.default || data);

        // Extract data from algorithm JSON
        const algoData = data.default || data;
        
        // Set editor state from algorithm code
        const editorStateMap: EditorStateMap = {
          Python: {
            filename: `${algoData.name.toLowerCase().replace(/\s+/g, '_')}.py`,
            lines: algoData.code.python.split('\n'),
          },
          'C++': {
            filename: `${algoData.name.toLowerCase().replace(/\s+/g, '_')}.cpp`,
            lines: algoData.code.cpp.split('\n'),
          },
          JavaScript: {
            filename: `${algoData.name.toLowerCase().replace(/\s+/g, '_')}.js`,
            lines: algoData.code.javascript.split('\n'),
          },
        };
        setEditorState(editorStateMap);

        // Set execution frames
        setFrames(algoData.executionFrames || []);
        setCurrentFrameIndex(0);

        // Set AI chat messages
        const initialMessages: ChatMessage[] = algoData.aiExplanation?.map((msg: any, idx: number) => ({
          id: `msg-${idx}`,
          role: msg.role,
          content: msg.content,
        })) || [];
        setChatMessages(initialMessages);

        setIsLoadingEditor(false);
        setIsLoadingFrames(false);
        setIsLoadingChat(false);
      } catch (error) {
        console.error('Failed to load algorithm:', error);
        setIsLoadingEditor(false);
        setIsLoadingFrames(false);
        setIsLoadingChat(false);
      }
    };

    loadAlgorithmData();
  }, [selectedAlgorithm]);

  // ── Playback interval ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const next = prev + 1;
          if (next >= frames.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 1200);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, frames.length]);

  // ── Stop playback when reaching end ───────────────────────────────────────
  useEffect(() => {
    if (currentFrameIndex >= frames.length - 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentFrameIndex, frames.length, isPlaying]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const rawCurrentFrame = frames[currentFrameIndex] ?? null;
  const currentEditorLang = editorState?.[language] ?? null;

  let activeLine = 1;
  if (rawCurrentFrame?.activeLine !== undefined) {
    activeLine = typeof rawCurrentFrame.activeLine === 'object' 
      ? (rawCurrentFrame.activeLine as any)[language] || 1
      : rawCurrentFrame.activeLine;
  }

  const currentFrame = rawCurrentFrame ? { ...rawCurrentFrame, activeLine } : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleThemeToggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => {
      // If at end, reset to start before playing
      if (!prev && currentFrameIndex >= frames.length - 1) {
        setCurrentFrameIndex(0);
      }
      return !prev;
    });
  }, [currentFrameIndex, frames.length]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  }, []);

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1));
  }, [frames.length]);

  const handleFrameChange = useCallback((idx: number) => {
    setIsPlaying(false);
    setCurrentFrameIndex(idx);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    const { userMsg, assistantMsg } = await sendChatMessage(message);
    setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
  }, []);

  // ── Panel toggle handlers ─────────────────────────────────────────────────
  const handleTogglePanel = useCallback((panel: 'editor' | 'visualizer' | 'notes') => {
    setVisiblePanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
    // Sync notes panel with sidePanelOpen
    if (panel === 'notes') {
      setSidePanelOpen((prev) => !prev);
    }
  }, []);

  // ── Layout calculations ───────────────────────────────────────────────────
  // Calculate panel widths based on visible panels
  const visibleCount = Object.values(visiblePanels).filter(Boolean).length;
  const panelWidth = visibleCount > 0 ? `${100 / visibleCount}%` : '0%';
  
  // Calculate bottom dock height: terminal (collapsed: 80px, expanded: 200px) + transport bar (100px) + padding (24px)
  const bottomDockHeight = terminalOpen ? 324 : 204;

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
                <MockCodeEditorPanel
                  language={language}
                  lines={currentEditorLang?.lines ?? []}
                  filename={currentEditorLang?.filename ?? 'loading…'}
                  activeLine={currentFrame?.activeLine ?? 1}
                  onLanguageChange={setLanguage}
                  isLoading={isLoadingEditor}
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
                  currentFrame={currentFrame}
                  totalFrames={frames.length || 1}
                  isPlaying={isPlaying}
                  onTabChange={setVisualizerTab}
                  isLoading={isLoadingFrames}
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
                  isLoading={isLoadingChat}
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
