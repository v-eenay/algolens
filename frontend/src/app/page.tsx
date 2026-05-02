'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { MockCodeEditorPanel } from '@/components/editor/mock-code-editor-panel';
import { SideDescriptionPanel } from '@/components/ai-explanation/side-description-panel';
import { BottomDock } from '@/components/layout/bottom-dock';
import { TopNav } from '@/components/layout/top-nav';
import { EnhancedVisualizationPanel } from '@/components/visualization/enhanced-visualization-panel';
import { useExecutionStore } from '@/lib/store/executionStore';
import { useExecutionSocket } from '@/lib/hooks/useExecutionSocket';

import {
  sendChatMessage,
} from '@/lib/mock-data/mock-api';

import type {
  ChatMessage,
  EditorLanguage,
  EditorStateMap,
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
  const { sendCode, isConnected, connectionStatus } = useExecutionSocket();

  // ── Data state ────────────────────────────────────────────────────────────
  const [editorState, setEditorState] = useState<EditorStateMap | null>(null);
  const frames = useExecutionStore((state) => state.frames);
  const setFrames = useExecutionStore((state) => state.setFrames);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  // ── Playback state ────────────────────────────────────────────────────────
  const currentFrameIndex = useExecutionStore((state) => state.currentFrameIndex);
  const setCurrentFrameIndex = useExecutionStore((state) => state.setCurrentFrameIndex);
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  const setIsPlaying = useExecutionStore((state) => state.setIsPlaying);
  const setCode = useExecutionStore((state) => state.setCode);
  
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync editor code with store when changing language or algorithm
  useEffect(() => {
    if (editorState && editorState[language]) {
      setCode(editorState[language].lines.join('\n'));
    }
  }, [language, editorState, setCode]);

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
  }, [selectedAlgorithm, setCurrentFrameIndex, setFrames]);

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
          
          {/* Temporary WebSocket Test Button */}
          <div className="absolute top-4 right-[350px] z-50 flex items-center gap-2 bg-background/80 p-2 rounded border border-border backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="capitalize">{connectionStatus}</span>
            </div>
            <button 
              onClick={() => sendCode("a=1\nb=2\nc=a+b", "Python")}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Test WebSocket
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
                <MockCodeEditorPanel
                  filename={currentEditorLang?.filename ?? 'loading…'}
                  activeLine={currentFrame?.activeLine ?? 1}
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
