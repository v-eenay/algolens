'use client';

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  TerminalSquare,
  TimerReset,
  Square,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BottomDockProps } from '@/lib/types/types';

const iconButtonClasses =
  'inline-flex h-8 items-center justify-center rounded border border-border bg-card px-3 text-xs transition-colors duration-200';

export function BottomDock({
  terminalOpen,
  isPlaying,
  currentFrameIndex,
  totalFrames,
  currentFrame,
  onToggleTerminal,
  onTogglePlay,
  onStop,
  onStepBackward,
  onStepForward,
  onFrameChange,
}: BottomDockProps) {
  // Generate dynamic terminal lines from the current frame
  const terminalLines = currentFrame
    ? (() => {
        const lines: string[] = [
          `> algolens exec --algorithm quick-sort-partition`,
          `> frame=${currentFrame.frameIndex + 1}/${totalFrames}${currentFrame.variables?.pivot !== undefined ? `  pivot=${typeof currentFrame.variables.pivot === 'object' && currentFrame.variables.pivot !== null ? (currentFrame.variables.pivot as any).value : currentFrame.variables.pivot}` : ''}`,
          `[trace] active line -> ${currentFrame.activeLine}`,
        ];

        // Add array state if available
        if (currentFrame.array && Array.isArray(currentFrame.array)) {
          lines.push(`[trace] array state: [${currentFrame.array.join(', ')}]`);
        }

        // Add comparison info if available
        if (currentFrame.comparing && currentFrame.comparing.length > 0) {
          lines.push(`[trace] comparing indices [${currentFrame.comparing.join(', ')}]`);
        } else if (currentFrame.comparing) {
          lines.push(`[trace] no active comparison`);
        }

        // Add swapping info if available
        if (currentFrame.swapping && currentFrame.swapping.length > 0) {
          lines.push(`[trace] swapping indices [${currentFrame.swapping.join(', ')}]`);
        } else if (currentFrame.swapping) {
          lines.push(`[trace] no active swap`);
        }

        // Always add description
        lines.push(`[step] ${currentFrame.description}`);

        return lines;
      })()
    : ['> algolens: waiting for execution frames…'];

  const atStart = currentFrameIndex <= 0;
  const atEnd = currentFrameIndex >= totalFrames - 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-3 py-2 md:px-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2">
        {/* ── Terminal panel ──────────────────────────────────── */}
        <div className="overflow-hidden rounded border border-border bg-card">
          {/* Terminal header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-surface">
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <TerminalSquare className="h-3.5 w-3.5 text-primary" />
              Terminal
            </div>
            <button
              id="terminal-toggle"
              className="rounded border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
              onClick={onToggleTerminal}
              type="button"
            >
              {terminalOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {/* Animated terminal content */}
          <AnimatePresence initial={false}>
            {terminalOpen && (
              <motion.div
                key="terminal-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border bg-background px-3 py-2 font-[family-name:var(--font-ibm-plex-mono)] text-xs leading-5 text-muted-foreground">
                  {terminalLines.map((line, index) => (
                    <div key={`term-${index}`} className="truncate">
                      {line}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Transport bar ──────────────────────────────────── */}
        <div className="rounded border border-border bg-card p-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {/* Transport buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* First */}
              <button
                id="transport-first"
                className={`${iconButtonClasses} border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={() => onFrameChange(0)}
                type="button"
                disabled={atStart}
                title="First frame"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>

              {/* Step backward */}
              <button
                id="transport-back"
                className={`${iconButtonClasses} border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={onStepBackward}
                type="button"
                disabled={atStart}
              >
                <SkipBack className="mr-1.5 h-3.5 w-3.5" />
                Back
              </button>

              {/* Play / Pause */}
              <button
                id="transport-play"
                className={`${iconButtonClasses} ${
                  isPlaying
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary hover:text-primary'
                }`}
                onClick={onTogglePlay}
                type="button"
                disabled={atEnd && !isPlaying}
              >
                {isPlaying ? (
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              {/* Stop */}
              <button
                id="transport-stop"
                className={`${iconButtonClasses} border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={onStop}
                type="button"
                disabled={atStart && !isPlaying}
                title="Stop execution"
              >
                <Square className="mr-1.5 h-3 w-3" fill="currentColor" />
                Stop
              </button>

              {/* Step forward */}
              <button
                id="transport-forward"
                className={`${iconButtonClasses} border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={onStepForward}
                type="button"
                disabled={atEnd}
              >
                <SkipForward className="mr-1.5 h-3.5 w-3.5" />
                Forward
              </button>

              {/* Last */}
              <button
                id="transport-last"
                className={`${iconButtonClasses} border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={() => onFrameChange(totalFrames - 1)}
                type="button"
                disabled={atEnd}
                title="Last frame"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>

              {/* Replay */}
              <button
                id="transport-replay"
                className={`${iconButtonClasses} border-border bg-background text-foreground hover:border-primary hover:text-primary`}
                onClick={() => onFrameChange(0)}
                type="button"
                title="Replay from start"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Replay
              </button>
            </div>

            {/* Timeline slider */}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:max-w-[36rem]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Execution Timeline</span>
                <span className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2 py-0.5 text-foreground">
                  <TimerReset className="h-3 w-3 text-primary" />
                  {currentFrameIndex + 1} / {totalFrames}
                </span>
              </div>
              <input
                id="timeline-slider"
                aria-label="Execution timeline slider"
                className="h-2 w-full cursor-pointer accent-[hsl(var(--primary))]"
                max={totalFrames - 1}
                min={0}
                step={1}
                onChange={(e) => onFrameChange(Number(e.target.value))}
                type="range"
                value={currentFrameIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
