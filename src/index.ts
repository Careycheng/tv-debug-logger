import { TVDebugLoggerOptions, LogEntry, FilterType } from './types';
import { ConsoleInterceptor } from './console-interceptor';
import { NetworkInterceptor } from './network-interceptor';
import { WebSocketInterceptor } from './websocket-interceptor';
import { UIRenderer } from './ui-renderer';
import { KeyboardHandler } from './keyboard-handler';
import './styles.css';

export default class TVDebugLogger {
  private options: Required<TVDebugLoggerOptions>;
  private logs: LogEntry[] = [];
  private consoleInterceptor?:  ConsoleInterceptor;
  private networkInterceptor?: NetworkInterceptor;
  private wsInterceptor?: WebSocketInterceptor;
  private uiRenderer?: UIRenderer;
  private keyboardHandler?: KeyboardHandler;
  private isVisible: boolean = false;
  private isPaused: boolean = false;
  private currentFilter: FilterType = 'all';

  constructor(options: TVDebugLoggerOptions = {}) {
    this.options = {
      hotkey: options.hotkey || 'F12',
      maxLogs: options.maxLogs || 1000,
      captureConsole: options.captureConsole !== false,
      captureNetwork: options.captureNetwork !== false,
      captureWebSocket: options.captureWebSocket !== false,
      autoScroll: options.autoScroll !== false,
      theme: options.theme || 'dark',
      initialVisible: options.initialVisible || false,
      zIndex: options.zIndex || 999999
    };
  }

  init(): void {
    // 初始化 UI
    this.uiRenderer = new UIRenderer(this.options.theme, this.options.zIndex);
    this.uiRenderer.render();
    
    // 将 uiRenderer 挂载到 window 供 KeyboardHandler 使用
    (window as any).__tvLoggerUIRenderer = this.uiRenderer;

    // 初始化键盘处理
    this.keyboardHandler = new KeyboardHandler(
      this.options.hotkey,
      () => this.toggle(),
      (action) => this.handleAction(action)
    );
    this.keyboardHandler.init();

    // 初始化拦截器
    if (this.options.captureConsole) {
      this.consoleInterceptor = new ConsoleInterceptor((entry) => this.addLog(entry));
      this.consoleInterceptor.init();
    }

    if (this.options.captureNetwork) {
      this.networkInterceptor = new NetworkInterceptor((entry) => this.addLog(entry));
      this.networkInterceptor.init();
    }

    if (this.options.captureWebSocket) {
      this.wsInterceptor = new WebSocketInterceptor((entry) => this.addLog(entry));
      this.wsInterceptor. init();
    }

    if (this.options.initialVisible) {
      this.show();
    }
  }

  destroy(): void {
    this.consoleInterceptor?.destroy();
    this.networkInterceptor?. destroy();
    this.wsInterceptor?.destroy();
    this.uiRenderer?.destroy();
    this.keyboardHandler?.destroy();
    
    // 清理全局引用
    delete (window as any).__tvLoggerUIRenderer;
  }

  show(): void {
    this.isVisible = true;
    this. uiRenderer?. show();
    this.updateUI();
  }

  hide(): void {
    this.isVisible = false;
    this.uiRenderer?.hide();
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  clear(): void {
    this.logs = [];
    this.updateUI();
  }

  log(message: string, type: LogEntry['level'] = 'log', data?: any): void {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'console',
      level: type,
      message,
      data
    };
    this.addLog(entry);
  }

  export(): string {
    const exportData = {
      exportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
    return JSON. stringify(exportData, null, 2);
  }

  private addLog(entry: LogEntry): void {
    if (this.isPaused) return;

    this.logs.unshift(entry);

    // 限制日志数量
    if (this.logs.length > this.options.maxLogs) {
      this.logs = this.logs.slice(0, this.options.maxLogs);
    }

    if (this.isVisible) {
      this.updateUI();
    }
  }

  private updateUI(): void {
    const filteredLogs = this.getFilteredLogs();
    this.uiRenderer?.updateLogs(filteredLogs, this.isPaused);
    this.uiRenderer?.updateStats({
      total: this.logs.length,
      console: this.logs.filter(l => l.type === 'console').length,
      network: this.logs.filter(l => l.type === 'network').length,
      websocket: this. logs.filter(l => l. type === 'websocket').length
    });
  }

  private getFilteredLogs(): LogEntry[] {
    if (this.currentFilter === 'all') {
      return this.logs;
    }
    return this. logs.filter(log => log.type === this.currentFilter);
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'clear':
        this.clear();
        break;
      case 'pause':
        this.isPaused = ! this.isPaused;
        this.updateUI();
        break;
      case 'export':
        this.downloadLogs();
        break;
      case 'filter-all':
        this.currentFilter = 'all';
        this. updateUI();
        break;
      case 'filter-console': 
        this.currentFilter = 'console';
        this.updateUI();
        break;
      case 'filter-network': 
        this.currentFilter = 'network';
        this.updateUI();
        break;
      case 'filter-websocket': 
        this.currentFilter = 'websocket';
        this.updateUI();
        break;
    }
  }

  private downloadLogs(): void {
    const dataStr = this.export();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv-debug-logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出类型
export * from './types';
