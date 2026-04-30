'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { ChevronDown, Code2, Loader2, PlayCircle } from 'lucide-react';
import type { MockCodeEditorPanelProps } from '@/lib/types/types';

export function MockCodeEditorPanel({
  language,
  lines,
  filename,
  activeLine,
  onLanguageChange,
  isLoading = false,
}: MockCodeEditorPanelProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Convert lines array to string for Monaco
  const code = lines.join('\n');

  // Map our language types to Monaco language IDs
  const getMonacoLanguage = (lang: string): string => {
    switch (lang) {
      case 'Python':
        return 'python';
      case 'C++':
        return 'cpp';
      case 'JavaScript':
        return 'javascript';
      default:
        return 'python';
    }
  };

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsEditorReady(true);

    // Configure editor options
    editor.updateOptions({
      readOnly: false,
      minimap: { enabled: false },
      fontSize: 13,
      lineHeight: 20.8,
      fontFamily: 'var(--font-ibm-plex-mono), monospace',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      wrappingIndent: 'indent',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      // IDE Features
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'matchingDocuments',
      parameterHints: {
        enabled: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
      },
      // Code editing features
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      matchBrackets: 'always',
      bracketPairColorization: {
        enabled: true,
      },
      // Selection and cursor
      multiCursorModifier: 'ctrlCmd',
      selectionHighlight: true,
      occurrencesHighlight: 'singleFile',
      renderLineHighlight: 'all',
      renderWhitespace: 'selection',
      // Find/Replace
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always',
      },
    });

    // Set dark theme
    monaco.editor.setTheme('vs-dark');
  };

  // Update active line highlighting
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !isEditorReady) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Clear previous decorations
    if (decorationsRef.current.length > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }

    // Add new decoration for active line
    if (activeLine > 0 && activeLine <= lines.length) {
      decorationsRef.current = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(activeLine, 1, activeLine, 1),
            options: {
              isWholeLine: true,
              className: 'active-line-decoration',
              glyphMarginClassName: 'active-line-glyph',
              overviewRuler: {
                color: 'rgba(59, 130, 246, 0.8)',
                position: monaco.editor.OverviewRulerLane.Full,
              },
            },
          },
        ]
      );

      // Scroll to active line
      editor.revealLineInCenter(activeLine);
    }
  }, [activeLine, lines.length, isEditorReady]);

  // Update editor content when lines change
  useEffect(() => {
    if (!editorRef.current || !isEditorReady) return;
    
    const currentValue = editorRef.current.getValue();
    const newValue = lines.join('\n');
    
    // Only update if content actually changed
    if (currentValue !== newValue) {
      editorRef.current.setValue(newValue);
    }
  }, [lines, isEditorReady]);

  if (isLoading) {
    return (
      <section className="flex h-full min-h-[26rem] flex-col items-center justify-center rounded border border-border bg-card p-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading editor…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-[26rem] flex-col rounded border border-border bg-card p-2">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
            <Code2 className="h-3.5 w-3.5" />
            Code Editor
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Professional IDE with syntax highlighting and IntelliSense
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language selector */}
          <label className="relative inline-flex items-center">
            <select
              id="language-selector"
              className="h-8 appearance-none rounded border border-border bg-background px-3 pr-8 text-xs text-foreground outline-none transition-colors duration-200 focus:border-primary"
              onChange={(e) =>
                onLanguageChange(e.target.value as 'Python' | 'C++' | 'JavaScript')
              }
              value={language}
            >
              <option>Python</option>
              <option>C++</option>
              <option>JavaScript</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
          </label>

          {/* Active line indicator */}
          <div className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-background px-3 text-xs text-muted-foreground">
            <PlayCircle className="h-3.5 w-3.5 text-primary" />
            Line {activeLine.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* ── Code body ──────────────────────────────────────────── */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-border bg-[#1e1e1e]">
        {/* File header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-[#252526]">
          <div className="rounded border border-border bg-[#1e1e1e] px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {filename}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            value={code}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            loading={
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
            options={{
              readOnly: false,
            }}
          />
        </div>
      </div>

      {/* Custom CSS for active line highlighting */}
      <style jsx global>{`
        .active-line-decoration {
          background: rgba(59, 130, 246, 0.2) !important;
          border-left: 2px solid rgb(59, 130, 246) !important;
        }
        
        .active-line-glyph {
          background: rgb(59, 130, 246) !important;
          width: 3px !important;
        }

        /* Customize Monaco scrollbars to match design */
        .monaco-editor .scrollbar .slider {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .monaco-editor .scrollbar .slider:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }

        .monaco-editor .scrollbar .slider.active {
          background: rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>
    </section>
  );
}
