import { LogEntry } from './types';

export class ConsoleInterceptor {
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
  };

  constructor(private onLog: (entry: LogEntry) => void) {
    this.originalConsole = {
      log:  console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
  }

  init(): void {
    const self = this;

    console.log = function (...args: any[]) {
      self.originalConsole.log.apply(console, args);
      self.captureLog('log', args);
    };

    console.info = function (...args: any[]) {
      self.originalConsole.info.apply(console, args);
      self.captureLog('info', args);
    };

    console.warn = function (...args: any[]) {
      self.originalConsole.warn.apply(console, args);
      self.captureLog('warn', args);
    };

    console. error = function (...args: any[]) {
      self.originalConsole.error.apply(console, args);
      self.captureLog('error', args);
    };
  }

  destroy(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }

  private captureLog(level: LogEntry['level'], args: any[]): void {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: 'console',
      level,
      message,
      data: args. length === 1 ? args[0] : args
    };

    this.onLog(entry);
  }
}
