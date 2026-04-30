// ---------------------------------------------------------------------------
// AlgoLens – simulated async API layer over JSON mock data
// ---------------------------------------------------------------------------

import type {
  AIChatData,
  ChatMessage,
  EditorStateMap,
  ExecutionFrame,
} from '@/lib/types/types';

import editorStateRaw from './editor-state.json';
import executionFramesRaw from './execution-frames.json';
import aiChatRaw from './ai-chat.json';

// ---------------------------------------------------------------------------
// Artificial latency helper
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency(min = 200, max = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Typed references to the raw JSON imports
// ---------------------------------------------------------------------------

const editorState = editorStateRaw as unknown as EditorStateMap;
const executionFrames = executionFramesRaw as unknown as ExecutionFrame[];
const aiChat = aiChatRaw as unknown as AIChatData;

// Track which mock response to serve next (cycles through the pool)
let mockResponseIndex = 0;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch the code editor state for all languages. */
export async function fetchEditorState(): Promise<EditorStateMap> {
  await delay(randomLatency(200, 400));
  return editorState;
}

/** Fetch the full execution frame sequence. */
export async function fetchExecutionFrames(): Promise<ExecutionFrame[]> {
  await delay(randomLatency(250, 500));
  return executionFrames;
}

/** Fetch the initial chat history. */
export async function fetchChatHistory(): Promise<ChatMessage[]> {
  await delay(randomLatency(200, 350));
  return [...aiChat.initialMessages];
}

/** Simulate sending a message and receiving an AI response. */
export async function sendChatMessage(
  userMessage: string,
): Promise<{ userMsg: ChatMessage; assistantMsg: ChatMessage }> {
  // Simulate network round-trip
  await delay(randomLatency(400, 900));

  const userMsg: ChatMessage = {
    id: `msg-user-${Date.now()}`,
    role: 'user',
    content: userMessage,
  };

  const responseContent =
    aiChat.mockResponses[mockResponseIndex % aiChat.mockResponses.length];
  mockResponseIndex += 1;

  const assistantMsg: ChatMessage = {
    id: `msg-ai-${Date.now()}`,
    role: 'assistant',
    content: responseContent,
  };

  return { userMsg, assistantMsg };
}
