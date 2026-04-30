// ---------------------------------------------------------------------------
// AlgoLens – shared TypeScript types for Iteration 2
// ---------------------------------------------------------------------------

/** Supported editor languages. */
export type EditorLanguage = 'Python' | 'C++' | 'JavaScript';

/** Visualizer tab selection. */
export type VisualizerTab = 'dry-run' | 'animated';

/** Theme mode. */
export type ThemeMode = 'light' | 'dark';

// ---------------------------------------------------------------------------
// Mock‑data shapes (mirror the JSON files in `lib/mock-data/`)
// ---------------------------------------------------------------------------

/** Single‑language editor snapshot loaded from `editor-state.json`. */
export interface EditorLanguageState {
  filename: string;
  lines: string[];
}

/** The full editor‑state file maps language keys to their state. */
export type EditorStateMap = Record<EditorLanguage, EditorLanguageState>;

/** One frame from `execution-frames.json`. */
export interface ExecutionFrame {
  frameIndex: number;
  activeLine: number | Record<string, number>;
  array?: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  variables?: Record<string, number>;
  description: string;
  // Support for different visualization types
  visualization?: {
    type: 'array' | 'tree' | 'graph' | 'table' | 'linkedlist';
    data?: any;
  };
}

/** Chat message role. */
export type ChatRole = 'user' | 'assistant';

/** A single chat message. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

/** Shape of `ai-chat.json`. */
export interface AIChatData {
  initialMessages: ChatMessage[];
  mockResponses: string[];
}

// ---------------------------------------------------------------------------
// Component prop interfaces
// ---------------------------------------------------------------------------

export interface MockCodeEditorPanelProps {
  language: EditorLanguage;
  lines: string[];
  filename: string;
  activeLine: number;
  onLanguageChange: (lang: EditorLanguage) => void;
  isLoading?: boolean;
}

export interface VisualizationPanelProps {
  activeTab: VisualizerTab;
  currentFrame: ExecutionFrame | null;
  totalFrames: number;
  isPlaying: boolean;
  onTabChange: (tab: VisualizerTab) => void;
  isLoading?: boolean;
}

export interface SideDescriptionPanelProps {
  isOpen: boolean;
  chatMessages: ChatMessage[];
  currentFrame: ExecutionFrame | null;
  onToggle: () => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export interface BottomDockProps {
  terminalOpen: boolean;
  isPlaying: boolean;
  currentFrameIndex: number;
  totalFrames: number;
  currentFrame: ExecutionFrame | null;
  onToggleTerminal: () => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onFrameChange: (frameIndex: number) => void;
}

export interface TopNavProps {
  theme: ThemeMode;
  language: EditorLanguage;
  activeTab: VisualizerTab;
  sidePanelOpen: boolean;
  terminalOpen: boolean;
  currentFrameIndex: number;
  totalFrames: number;
  onToggleTheme: () => void;
  onToggleSidePanel: () => void;
  onToggleTerminal: () => void;
}
