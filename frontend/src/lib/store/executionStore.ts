import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ExecutionFrame, ConnectionStatus } from '../types/types';

export interface ExecutionState {
  code: string;
  language: string;
  frames: ExecutionFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  connectionStatus: ConnectionStatus;
  
  // Advanced state fields for cleanup
  logs: string[];
  runtimeVariables: Record<string, any>;
  activeHighlights: number[];
  errors: string | null;
  consoleOutput: string[];
  visualizationState: Record<string, any>;
}

export interface ExecutionActions {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setFrames: (frames: ExecutionFrame[]) => void;
  addFrame: (frame: ExecutionFrame) => void;
  clearFrames: () => void;
  setCurrentFrameIndex: (index: number) => void;
  nextFrame: () => void;
  previousFrame: () => void;
  resetPlayback: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  resetExecution: () => void;
}

export type ExecutionStore = ExecutionState & ExecutionActions;

const initialExecutionState: ExecutionState = {
  code: '',
  language: 'Python',
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,
  connectionStatus: 'disconnected',
  logs: [],
  runtimeVariables: {},
  activeHighlights: [],
  errors: null,
  consoleOutput: [],
  visualizationState: {},
};

export const useExecutionStore = create<ExecutionStore>()(
  persist(
    (set) => ({
      ...initialExecutionState,

      // Code + Language Actions
      setCode: (code: string) => set({ code }),
      setLanguage: (language: string) => set({ language }),

      // Frames Actions
      setFrames: (frames: ExecutionFrame[]) => set({ frames }),
      addFrame: (frame: ExecutionFrame) =>
        set((state) => ({ frames: [...state.frames, frame] })),
      clearFrames: () => set({ frames: [], currentFrameIndex: 0, isPlaying: false }),

      // Playback Actions
      setCurrentFrameIndex: (index: number) =>
        set((state) => ({
          currentFrameIndex: Math.max(0, Math.min(index, state.frames.length - 1 < 0 ? 0 : state.frames.length - 1)),
        })),
      nextFrame: () =>
        set((state) => {
          const nextIndex = state.currentFrameIndex + 1;
          if (nextIndex >= state.frames.length) {
            return { isPlaying: false, currentFrameIndex: state.frames.length > 0 ? state.frames.length - 1 : 0 };
          }
          return { currentFrameIndex: nextIndex };
        }),
      previousFrame: () =>
        set((state) => ({
          currentFrameIndex: Math.max(0, state.currentFrameIndex - 1),
          isPlaying: false,
        })),
      resetPlayback: () => set({ currentFrameIndex: 0, isPlaying: false }),
      setIsPlaying: (isPlaying: boolean) =>
        set((state) => {
          if (isPlaying && state.currentFrameIndex >= state.frames.length - 1 && state.frames.length > 0) {
            return { isPlaying: true, currentFrameIndex: 0 };
          }
          return { isPlaying };
        }),

      // Connection Status
      setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),

      // Global Reset
      resetExecution: () => set((state) => ({
        ...initialExecutionState,
        // We preserve code and language during reset usually, 
        // unless it's a "total" reset. Requirement says "clear/reset: frames, currentFrameIndex, isPlaying, execution logs, runtime variables, active highlights, errors, console output, visualization state".
        // It doesn't explicitly say clear code, but "Algorithm Switching Cleanup" says "Load new boilerplate code".
        // So resetExecution should probably keep code/language if called alone, 
        // but for algorithm switching we'll call resetExecution then setCode.
        code: state.code,
        language: state.language,
        connectionStatus: state.connectionStatus, // Preserve connection
      })),
    }),
    {
      name: 'algolens-execution',
      storage: createJSONStorage(() => localStorage),
      // Only persist code and language to avoid massive frames in localStorage
      partialize: (state) => ({ 
        code: state.code, 
        language: state.language 
      }),
    }
  )
);
