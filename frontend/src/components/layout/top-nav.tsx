'use client';

import {
  Code2,
  MessageSquare,
  MoonStar,
  Sparkles,
  SunMedium,
  TerminalSquare,
  Workflow,
  BarChart3,
} from 'lucide-react';
import type { TopNavProps } from '@/lib/types/types';
import { AlgorithmSelector } from '@/components/shared/algorithm-selector';

const pillClasses =
  'inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground';

const actionButtonClasses =
  'inline-flex h-8 items-center justify-center rounded border border-border bg-card px-3 text-xs text-foreground transition-colors duration-200 hover:border-primary hover:text-primary';

const panelToggleClasses =
  'inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-card text-foreground transition-colors duration-200 hover:border-primary hover:text-primary';

export function TopNav({
  theme,
  language,
  activeTab,
  
  terminalOpen,
  currentFrameIndex,
  totalFrames,
  visiblePanels,
  selectedAlgorithm,
  onAlgorithmChange,
  onToggleTheme,
  
  onToggleTerminal,
  onTogglePanel,
}: TopNavProps & {
  visiblePanels?: { editor: boolean; visualizer: boolean; notes: boolean };
  selectedAlgorithm?: string;
  onAlgorithmChange?: (algorithmId: string) => void;
  onTogglePanel?: (panel: 'editor' | 'visualizer' | 'notes') => void;
}) {
  return (
    <header className="border-b border-border bg-background px-3 py-2 md:px-4 lg:px-6">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        {/* ── Brand & Algorithm Selector ───────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary text-xs text-primary-foreground">
              AL
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AlgoLens
              </div>
              <div className="text-[10px] text-muted-foreground">
                Algorithm Visualization Workspace
              </div>
            </div>
          </div>

          {/* Algorithm Selector */}
          {selectedAlgorithm && onAlgorithmChange && (
            <>
              <div className="hidden h-6 w-px bg-border sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Algorithm:
                </span>
                <AlgorithmSelector
                  selectedAlgorithm={selectedAlgorithm}
                  onAlgorithmChange={onAlgorithmChange}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Status & actions ─────────────────────────────────── */}
        <div className="flex flex-col gap-2 xl:items-end">
          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={pillClasses}>
              <Workflow className="h-3 w-3 text-primary" />
              {language}
            </span>
            <span className={pillClasses}>
              {activeTab === 'dry-run' ? 'Dry Run' : 'Visualization'}
            </span>
            <span className={pillClasses}>
              Frame {currentFrameIndex + 1}/{totalFrames}
            </span>
            <span className={pillClasses}>
              {terminalOpen ? 'Terminal ▲' : 'Terminal ▼'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Panel toggles */}
            {onTogglePanel && visiblePanels && (
              <>
                <button
                  id="editor-toggle"
                  className={`${panelToggleClasses} ${visiblePanels.editor ? 'border-primary text-primary' : ''}`}
                  onClick={() => onTogglePanel('editor')}
                  type="button"
                  title="Toggle Code Editor"
                >
                  <Code2 className="h-3.5 w-3.5" />
                </button>
                <button
                  id="visualizer-toggle"
                  className={`${panelToggleClasses} ${visiblePanels.visualizer ? 'border-primary text-primary' : ''}`}
                  onClick={() => onTogglePanel('visualizer')}
                  type="button"
                  title="Toggle Visualizer"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
                <button
                  id="notes-toggle"
                  className={`${panelToggleClasses} ${visiblePanels.notes ? 'border-primary text-primary' : ''}`}
                  onClick={() => onTogglePanel('notes')}
                  type="button"
                  title="Toggle Notes"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
                <div className="mx-1 h-6 w-px bg-border" />
              </>
            )}

            <button
              id="theme-toggle"
              className={actionButtonClasses}
              onClick={onToggleTheme}
              type="button"
            >
              {theme === 'dark' ? (
                <SunMedium className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <MoonStar className="mr-1.5 h-3.5 w-3.5" />
              )}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <button
              id="terminal-nav-toggle"
              className={actionButtonClasses}
              onClick={onToggleTerminal}
              type="button"
            >
              <TerminalSquare className="mr-1.5 h-3.5 w-3.5" />
              {terminalOpen ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
