import { LogEntry } from './types';

export class NetworkInterceptor {
  private originalFetch: typeof fetch;
  private originalXHROpen: any;
  private originalXHRSend: any;

  constructor(private onLog: (entry: LogEntry) => void) {
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  init(): void {
    this.interceptFetch();
    this.interceptXHR();
  }

  destroy(): void {
    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;
  }

  private interceptFetch(): void {
    const self = this;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const startTime = Date.now();

      return self.originalFetch. apply(window, [input, init] as any).then(
        (response) => {
          const duration = Date.now() - startTime;
          self.logRequest(method, url, response.status, duration, 'success');
          return response;
        },
        (error) => {
          const duration = Date.now() - startTime;
          self.logRequest(method, url, 0, duration, 'error', error);
          throw error;
        }
      );
    };
  }

  private interceptXHR(): void {
    const self = this;
    const requestMap = new WeakMap<XMLHttpRequest, { method: string; url: string; startTime: number }>();

    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: any[]): void {
      const method = args[0] as string;
      const url = typeof args[1] === 'string' ? args[1] : args[1]?.toString() || '';
      requestMap.set(this, { method, url, startTime: Date. now() });
      return self.originalXHROpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null): void {
      const requestData = requestMap.get(this);
      
      if (requestData) {
        const { method, url, startTime } = requestData;
        
        this.addEventListener('load', function (this: XMLHttpRequest) {
          const duration = Date.now() - startTime;
          self.logRequest(method, url, this.status, duration, 'success');
        });

        this.addEventListener('error', function () {
          const duration = Date. now() - startTime;
          self.logRequest(method, url, 0, duration, 'error');
        });

        this.addEventListener('abort', function () {
          const duration = Date.now() - startTime;
          self.logRequest(method, url, 0, duration, 'error', new Error('Request aborted'));
        });
      }

      return self.originalXHRSend. call(this, body);
    };
  }

  private logRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    level: 'success' | 'error',
    error?: any
  ): void {
    const message = `${method} ${url} - ${status || 'Failed'}`;
    
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: 'network',
      level:  level === 'error' ? 'error' : status >= 400 ? 'error' : 'success',
      message,
      method,
      url,
      status,
      duration,
      data: error
    };

    this.onLog(entry);
  }
}
