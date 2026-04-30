'use client';

import { Activity, Boxes, Loader2, PlaySquare } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { ExecutionFrame, VisualizationPanelProps } from '@/lib/types/types';

// ---------------------------------------------------------------------------
// Animated bar chart for the sorting visualizer
// ---------------------------------------------------------------------------

function SortingBars({ frame }: { frame: ExecutionFrame }) {
  // Guard against missing array data
  if (!frame.array || !Array.isArray(frame.array)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No array data available for this algorithm
      </div>
    );
  }

  const maxVal = Math.max(...frame.array, 1);

  return (
    <LayoutGroup>
      <div className="grid flex-1 items-end gap-2" style={{ gridTemplateColumns: `repeat(${frame.array.length}, 1fr)` }}>
        {frame.array.map((value, index) => {
          const heightPercent = Math.max(12, (value / maxVal) * 100);
          const isComparing = frame.comparing?.includes(index) ?? false;
          const isSwapping = frame.swapping?.includes(index) ?? false;
          const isSorted = frame.sorted?.includes(index) ?? false;
          const isPivot = frame.variables?.pivot === value && !isSorted;

          let barClass = 'bg-secondary border-border';
          let labelClass = 'text-muted-foreground';

          if (isSorted) {
            barClass = 'bg-success/30 border-success';
            labelClass = 'text-success';
          } else if (isSwapping) {
            barClass = 'bg-destructive/30 border-destructive';
            labelClass = 'text-destructive';
          } else if (isComparing) {
            barClass = 'bg-primary/30 border-primary';
            labelClass = 'text-primary';
          } else if (isPivot) {
            barClass = 'bg-primary/20 border-primary';
            labelClass = 'text-primary';
          }

          // Determine the label text
          let label = `[${index}]`;
          if (isPivot) label = 'pivot';
          else if (isComparing && frame.variables?.j === index) label = 'j→';
          else if (frame.variables?.i === index) label = 'i→';

          return (
            <motion.div
              key={`bar-${frame.array?.length}-${index}`}
              layout
              layoutId={`sort-bar-${value}-${index}`}
              className="flex h-full flex-col justify-end gap-2"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              {/* Label */}
              <div className={`rounded border border-border bg-background px-1 py-0.5 text-center text-[10px] ${labelClass}`}>
                {label}
              </div>

              {/* Bar */}
              <motion.div
                layout
                className={`relative rounded-t border transition-colors duration-300 ${barClass}`}
                style={{ height: `${heightPercent}%`, minHeight: '2rem' }}
                initial={false}
                animate={{
                  y: isSwapping ? -6 : isComparing ? -3 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="absolute inset-x-0 top-2 text-center text-xs">
                  {value}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

// ---------------------------------------------------------------------------
// Dry run trace table
// ---------------------------------------------------------------------------

function DryRunTrace({ frame }: { frame: ExecutionFrame }) {
  const vars = frame.variables || {};

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Variable state table */}
      {Object.keys(vars).length > 0 && (
        <div className="rounded border border-border bg-surface p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Variable State — Frame {frame.frameIndex}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {Object.entries(vars).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded border border-border bg-background px-2 py-1.5"
            >
              <span className="text-[10px] text-muted-foreground font-[family-name:var(--font-ibm-plex-mono)]">
                {key}
              </span>
              <span className="text-xs text-foreground">{val}</span>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Array state */}
      {frame.array && Array.isArray(frame.array) && (
        <div className="rounded border border-border bg-surface p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Array State
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {frame.array.map((val, idx) => {
              const isSorted = frame.sorted?.includes(idx) ?? false;
              const isComparing = frame.comparing?.includes(idx) ?? false;

            return (
              <div
                key={`trace-${idx}`}
                className={`flex h-8 w-8 items-center justify-center rounded border text-xs transition-colors duration-200 ${
                  isSorted
                    ? 'border-success bg-success/15 text-success'
                    : isComparing
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground'
                }`}
              >
                {val}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step description */}
      <div className="rounded border border-border bg-surface p-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Step Description
        </div>
        <p className="mt-1.5 text-xs leading-5 text-foreground/85">{frame.description}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function VisualizationPanel({
  activeTab,
  currentFrame,
  totalFrames,
  isPlaying,
  onTabChange,
  isLoading = false,
}: VisualizationPanelProps) {
  if (isLoading || !currentFrame) {
    return (
      <section className="flex h-full min-h-[26rem] flex-col items-center justify-center rounded border border-border bg-card p-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading visualizer…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-[26rem] flex-col rounded border border-border bg-card p-2">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border pb-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary">
            <Boxes className="h-3.5 w-3.5" />
            Visualizer
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Frame {currentFrame.frameIndex + 1} of {totalFrames}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded border border-border bg-surface p-0.5">
          {(['dry-run', 'animated'] as const).map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                id={`tab-${tab}`}
                className={`rounded px-3 py-1.5 text-xs transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                }`}
                onClick={() => onTabChange(tab)}
                type="button"
              >
                {tab === 'dry-run' ? 'Dry Run' : 'Animated'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content with crossfade ─────────────────────────── */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'animated' ? (
            <motion.div
              key="animated-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col gap-2"
            >
              {/* Canvas area */}
              <div className="relative flex min-h-[18rem] flex-1 flex-col overflow-hidden rounded border border-border bg-surface p-3">
                <div className="relative flex h-full flex-col">
                  {/* Status bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="rounded border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Sorting Visualization
                    </div>
                    <div
                      className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        isPlaying
                          ? 'border-success bg-success/10 text-success'
                          : 'border-primary bg-primary/10 text-primary'
                      }`}
                    >
                      {isPlaying ? 'Animating' : 'Paused'}
                    </div>
                  </div>

                  {/* Sorting bars */}
                  <div className="flex flex-1 items-end pt-4">
                    <SortingBars frame={currentFrame} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid gap-2 rounded border border-border bg-surface p-2 sm:grid-cols-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Frame</div>
                  <div className="mt-1 text-xl text-foreground">
                    {currentFrame.frameIndex + 1}
                  </div>
                </div>
                {currentFrame.variables?.pivot !== undefined && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pivot Value</div>
                    <div className="mt-1 text-xl text-primary">
                      {currentFrame.variables.pivot}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Description</div>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground line-clamp-2">
                    {currentFrame.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dryrun-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="scrollbar-thin min-h-0 flex-1 overflow-auto"
            >
              <DryRunTrace frame={currentFrame} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Side info cards ────────────────────────────────────── */}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded border border-border bg-surface p-2">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Live Step Summary
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {currentFrame.description}
          </p>
        </div>

        <div className="rounded border border-border bg-surface p-2">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <PlaySquare className="h-3.5 w-3.5 text-primary" />
            Mode
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Renderer</span>
              <span className="text-foreground">
                {activeTab === 'dry-run' ? 'Trace Table' : 'Motion Canvas'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Progress</span>
              <span className="text-foreground">
                {currentFrame.frameIndex + 1} / {totalFrames}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
