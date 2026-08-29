import { useState, useEffect, useRef, useCallback } from 'react';
import { WireEvent, ConnectionStatus } from '../types/telemetry';

const WS_URL = 'ws://127.0.0.1:8765/ws/events';
const MAX_EVENTS = 500;

export function useTelemetryWs() {
  const [events, setEvents] = useState<WireEvent[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

  const connect = useCallback(() => {
    try {
      setStatus(prev => (prev === 'connected' ? 'connected' : 'connecting'));
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        retryCountRef.current = 0;
        console.log('[WS] Connected to AgentHelm Telemetry server (ws://127.0.0.1:8765)');
      };

      ws.onmessage = (event) => {
        try {
          const wireEvent: WireEvent = JSON.parse(event.data);
          setEvents(prev => {
            const next = [wireEvent, ...prev.slice(0, MAX_EVENTS - 1)];
            return next;
          });

          // Auto-select latest proposed step if none explicitly selected
          setSelectedStepId(prev => prev ?? wireEvent.step_id);
        } catch (err) {
          console.warn('[WS] Failed to parse message payload:', err, event.data);
        }
      };

      ws.onclose = () => {
        setStatus('reconnecting');
        const delay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 10000);
        retryCountRef.current += 1;
        console.log(`[WS] Connection closed. Reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = (err) => {
        console.warn('[WS] Socket error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Connection exception:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendAction = useCallback((action: string, payload?: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ action, payload, timestamp: new Date().toISOString() });
      wsRef.current.send(msg);
      return true;
    }
    console.warn('[WS] Cannot send action; socket not connected');
    return false;
  }, []);

  const clearHistory = useCallback(() => {
    setEvents([]);
    setSelectedStepId(null);
  }, []);

  const selectedStep = events.find(e => e.step_id === selectedStepId) ?? events[0] ?? null;

  return {
    events,
    selectedStep,
    selectedStepId,
    setSelectedStepId,
    status,
    sendAction,
    clearHistory,
  };
}
