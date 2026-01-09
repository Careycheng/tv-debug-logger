export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'console' | 'network' | 'websocket';
  level: 'log' | 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
  method?: string;
  url?: string;
  status?: number;
  duration?: number;
  wsType?: 'open' | 'message' | 'send' | 'close' | 'error';
}

export interface TVDebugLoggerOptions {
  hotkey?: string;
  maxLogs?: number;
  captureConsole?:  boolean;
  captureNetwork?:  boolean;
  captureWebSocket?: boolean;
  autoScroll?: boolean;
  theme?: 'dark' | 'light';
  initialVisible?: boolean;
  zIndex?: number;
}

export type FilterType = 'all' | 'console' | 'network' | 'websocket';
