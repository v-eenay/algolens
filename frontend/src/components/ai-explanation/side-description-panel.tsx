'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Loader2,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SideDescriptionPanelProps } from '@/lib/types/types';

// ---------------------------------------------------------------------------
// Collapsed rail (when panel is closed)
// ---------------------------------------------------------------------------

function CollapsedRail({
  currentFrame,
  onToggle,
}: {
  currentFrame: SideDescriptionPanelProps['currentFrame'];
  onToggle: () => void;
}) {
  return (
    <aside className="flex h-full min-h-16 items-center justify-between rounded border border-border bg-card px-2 py-2 xl:flex-col xl:justify-between xl:px-2 xl:py-2">
      <button
        aria-label="Expand AI panel"
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
        onClick={onToggle}
        type="button"
      >
        <PanelRightOpen className="h-3.5 w-3.5" />
      </button>

      <div className="hidden xl:flex xl:flex-1 xl:items-center xl:justify-center">
        <span
          className="text-[10px] uppercase tracking-wider text-muted-foreground"
          style={{ writingMode: 'vertical-rl' }}
        >
          AI Notes
        </span>
      </div>

      <div className="flex items-center gap-1.5 xl:flex-col">
        <span className="rounded border border-primary bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
          {currentFrame ? `F${currentFrame.frameIndex + 1}` : '—'}
        </span>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function SideDescriptionPanel({
  isOpen,
  chatMessages,
  currentFrame,
  onToggle,
  onSendMessage,
  isLoading = false,
}: SideDescriptionPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInputValue('');
    onSendMessage(trimmed);

    // Reset sending state after a delay (the parent manages the actual async flow)
    setTimeout(() => setIsSending(false), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collapsed state
  if (!isOpen) {
    return <CollapsedRail currentFrame={currentFrame} onToggle={onToggle} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key="side-panel-open"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="flex h-full min-h-[26rem] flex-col rounded border border-border bg-card p-2"
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Explanation
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Context-aware notes for the active step.
            </p>
          </div>

          <button
            aria-label="Collapse AI panel"
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border bg-background text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
            onClick={onToggle}
            type="button"
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Current frame context ────────────────────────────── */}
        {currentFrame && (
          <div className="mt-2 rounded border border-border bg-surface p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Active Context
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-foreground">
              <div className="flex items-center justify-between">
                <span>Frame</span>
                <span>{currentFrame.frameIndex + 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Line</span>
                <span>{typeof currentFrame.activeLine === 'object' ? JSON.stringify(currentFrame.activeLine) : currentFrame.activeLine}</span>
              </div>
              {currentFrame.variables?.pivot !== undefined && (
                <div className="flex items-center justify-between">
                  <span>Pivot</span>
                  <span className="text-primary">{typeof currentFrame.variables.pivot === 'object' && currentFrame.variables.pivot !== null ? String((currentFrame.variables.pivot as Record<string, unknown>).value) : String(currentFrame.variables.pivot)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Chat messages ────────────────────────────────────── */}
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-3 w-3 text-primary" />
            AI Chat
          </div>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="scrollbar-thin mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-auto rounded border border-border bg-surface p-2">
              <AnimatePresence initial={false}>
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded border p-2 text-xs leading-5 ${
                      msg.role === 'assistant'
                        ? 'border-border bg-background text-foreground'
                        : 'ml-3 border-primary bg-primary/10 text-foreground'
                    }`}
                  >
                    <div className="mb-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                      {msg.role === 'assistant' ? '✦ AlgoLens AI' : 'You'}
                    </div>
                    {msg.content}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
          )}

          {/* ── Input ────────────────────────────────────────────── */}
          <div className="mt-2 flex items-center gap-1.5">
            <input
              id="ai-chat-input"
              className="h-8 flex-1 rounded border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors duration-200 focus:border-primary disabled:opacity-50"
              placeholder="Ask about this step…"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
            <button
              id="ai-chat-send"
              className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
              type="button"
              onClick={handleSend}
              disabled={isSending || !inputValue.trim()}
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
