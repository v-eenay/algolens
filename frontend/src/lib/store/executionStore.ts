import { create } from 'zustand';
import type { ExecutionFrame } from '../types/types';

export interface ExecutionState {
  code: string;
  language: string;
  frames: ExecutionFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
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
}

export type ExecutionStore = ExecutionState & ExecutionActions;

export const useExecutionStore = create<ExecutionStore>((set) => ({
  // Initial State
  code: '',
  language: 'Python',
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,

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
      isPlaying: false, // Generally stepping backwards halts playback
    })),
  resetPlayback: () => set({ currentFrameIndex: 0, isPlaying: false }),
  setIsPlaying: (isPlaying: boolean) =>
    set((state) => {
      // If trying to play but we are at the end, reset to start
      if (isPlaying && state.currentFrameIndex >= state.frames.length - 1 && state.frames.length > 0) {
        return { isPlaying: true, currentFrameIndex: 0 };
      }
      return { isPlaying };
    }),
}));
