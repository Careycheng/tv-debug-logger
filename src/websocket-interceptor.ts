import { LogEntry } from './types';

export class WebSocketInterceptor {
  private OriginalWebSocket: typeof WebSocket;

  constructor(private onLog: (entry: LogEntry) => void) {
    this.OriginalWebSocket = window.WebSocket;
  }

  init(): void {
    const self = this;

    window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
      const ws = new self.OriginalWebSocket(url, protocols);
      const urlString = typeof url === 'string' ? url : url.toString();

      // Open
      ws.addEventListener('open', (event) => {
        self.logWebSocket('open', urlString, 'WebSocket connected');
      });

      // Message received
      ws.addEventListener('message', (event) => {
        self.logWebSocket('message', urlString, 'Message received', event.data);
      });

      // Close
      ws.addEventListener('close', (event) => {
        self.logWebSocket('close', urlString, `WebSocket closed (code: ${event.code})`);
      });

      // Error
      ws.addEventListener('error', (event) => {
        self.logWebSocket('error', urlString, 'WebSocket error', event);
      });

      // Intercept send
      const originalSend = ws.send. bind(ws);
      ws.send = function (data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        self.logWebSocket('send', urlString, 'Message sent', data);
        return originalSend(data);
      };

      return ws;
    } as any;
  }

  destroy(): void {
    window. WebSocket = this.OriginalWebSocket;
  }

  private logWebSocket(
    wsType: LogEntry['wsType'],
    url: string,
    message: string,
    data?: any
  ): void {
    const level = wsType === 'error' ? 'error' : wsType === 'open' ? 'success' : 'info';

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: 'websocket',
      level,
      message,
      url,
      wsType,
      data
    };

    this. onLog(entry);
  }
}
