import { useState, useEffect, useRef, useCallback } from 'react';
import { useExecutionStore } from '../store/executionStore';
import { transformExecutionStates } from '../utils/visualization-transformer';
import { ExecutionFrame } from '../types/types';

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface ExecutionSocketPayload {
  code: string;
  language: string;
}

export interface RawVariableState {
  type: string;
  value: any;
}

export interface RawCallStackFrame {
  function_name: string;
  local_variables: Record<string, RawVariableState>;
}

export interface RawExecutionState {
  current_line: number;
  call_stack: RawCallStackFrame[];
  stdout?: string[];
}

interface UseExecutionSocketReturn {
  sendCode: (code: string, language: string) => void;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
}

const WEBSOCKET_URL = 'ws://localhost:8000/ws/execute';
const RECONNECT_INTERVAL_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useExecutionSocket(): UseExecutionSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComponentMounted = useRef<boolean>(true);

  // Zustand actions
  const setFrames = useExecutionStore((state) => state.setFrames);
  const resetPlayback = useExecutionStore((state) => state.resetPlayback);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setConnectionStatus(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');
      const ws = new WebSocket(WEBSOCKET_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isComponentMounted.current) {
          ws.close();
          return;
        }
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return;
        
        try {
          const rawData = JSON.parse(event.data);
          
          // Depending on the backend, it could be a single state or an array of states
          const statesArray: RawExecutionState[] = Array.isArray(rawData) ? rawData : [rawData];
          
          // Validate basic structure to prevent crashes
          const validStates = statesArray.filter(
            (state) => state && typeof state === 'object' && 'current_line' in state && Array.isArray(state.call_stack)
          );

          if (validStates.length === 0) {
            console.warn('Received unexpected or invalid payload from Execution Engine:', rawData);
            return;
          }

          const frames: ExecutionFrame[] = transformExecutionStates(validStates);
          
          setFrames(frames);
          resetPlayback();
        } catch (error) {
          console.error('Failed to parse or transform incoming WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        if (!isComponentMounted.current) return;
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        if (!isComponentMounted.current) return;
        
        socketRef.current = null;
        setConnectionStatus('disconnected');

        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_INTERVAL_MS);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('error');
          console.error('Max reconnect attempts reached. Please check the backend connection.');
        }
      };
    } catch (error) {
      if (!isComponentMounted.current) return;
      console.error('Failed to create WebSocket instance:', error);
      setConnectionStatus('error');
    }
  }, [setFrames, resetPlayback]);

  useEffect(() => {
    isComponentMounted.current = true;
    connect();

    return () => {
      isComponentMounted.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendCode = useCallback((code: string, language: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send code: WebSocket is not connected.');
      return;
    }

    const payload: ExecutionSocketPayload = { code, language };
    
    try {
      socketRef.current.send(JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to send payload through WebSocket:', error);
    }
  }, []);

  return {
    sendCode,
    isConnected: connectionStatus === 'connected',
    connectionStatus,
  };
}
