import { useEffect, useRef, useCallback } from 'react';

interface WebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useWebSocket(path: string, options: WebSocketOptions = {}) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!path) return;
    const url = `ws://localhost:8080${path}`;
    ws.current = new WebSocket(url);
    ws.current.onopen = () => options.onOpen?.();
    ws.current.onclose = () => { options.onClose?.(); reconnectTimer.current = setTimeout(connect, 3000); };
    ws.current.onmessage = (e) => { try { options.onMessage?.(JSON.parse(e.data)); } catch {} };
  }, [path]);

  useEffect(() => {
    connect();
    return () => { clearTimeout(reconnectTimer.current); ws.current?.close(); };
  }, [connect]);
}
