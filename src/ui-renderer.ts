import { LogEntry } from './types';

export class UIRenderer {
  private container?:  HTMLElement;
  private logList?: HTMLElement;
  private statsBar?: HTMLElement;
  private detailPanel?: HTMLElement;
  private selectedIndex:  number = 0;
  private currentLogs: LogEntry[] = [];
  private currentTab: string = 'all';

  constructor(private theme: string, private zIndex: number) {}

  render(): void {
    this.container = document.createElement('div');
    this.container.id = 'tv-debug-logger';
    this.container.className = `tv-logger tv-logger-${this.theme}`;
    this.container.style.zIndex = String(this.zIndex);
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="tv-logger-header">
        <div class="tv-logger-title">🔍 TV Debug Logger</div>
        <div class="tv-logger-tabs">
          <button class="tv-logger-tab active" data-tab="all">全部</button>
          <button class="tv-logger-tab" data-tab="console">控制台</button>
          <button class="tv-logger-tab" data-tab="network">网络</button>
          <button class="tv-logger-tab" data-tab="websocket">WebSocket</button>
        </div>
        <div class="tv-logger-controls">
          <span class="tv-logger-hint">1: 清空 2: 暂停 3:导出 ↑↓: 导航 OK: 详情 返回: 关闭</span>
        </div>
      </div>
      <div class="tv-logger-stats"></div>
      <div class="tv-logger-body">
        <div class="tv-logger-list"></div>
      </div>
      <div class="tv-logger-detail" style="display: none;">
        <div class="tv-logger-detail-header">
          <span>日志详情</span>
          <span class="tv-logger-hint">返回键关闭</span>
        </div>
        <div class="tv-logger-detail-content"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.logList = this.container. querySelector('.tv-logger-list') as HTMLElement;
    this. statsBar = this.container.querySelector('.tv-logger-stats') as HTMLElement;
    this.detailPanel = this.container.querySelector('.tv-logger-detail') as HTMLElement;

    this.bindTabEvents();
  }

  destroy(): void {
    this.container?. remove();
  }

  show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  updateLogs(logs: LogEntry[], isPaused: boolean): void {
    this.currentLogs = logs;
    if (! this.logList) return;

    if (logs.length === 0) {
      this.logList.innerHTML = '<div class="tv-logger-empty">暂无日志</div>';
      return;
    }

    this.logList.innerHTML = logs
      .map((log, index) => {
        const time = new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false });
        const icon = this.getLogIcon(log);
        const selected = index === this.selectedIndex ?  'selected' : '';
        
        return `
          <div class="tv-logger-item tv-logger-${log.level} ${selected}" data-index="${index}">
            <span class="tv-logger-time">${time}</span>
            <span class="tv-logger-icon">${icon}</span>
            <span class="tv-logger-type">[${log.type. toUpperCase()}]</span>
            <span class="tv-logger-message">${this.escapeHtml(log.message)}</span>
            ${log.duration ?  `<span class="tv-logger-duration">${log.duration}ms</span>` : ''}
          </div>
        `;
      })
      .join('');

    // 滚动到选中项
    this.scrollToSelected();
  }

  updateStats(stats: { total: number; console: number; network: number; websocket: number }): void {
    if (!this.statsBar) return;

    this.statsBar.innerHTML = `
      <span>总计:  ${stats.total}</span>
      <span>控制台:  ${stats.console}</span>
      <span>网络: ${stats.network}</span>
      <span>WebSocket: ${stats.websocket}</span>
    `;
  }

  showDetail(log: LogEntry): void {
    if (!this.detailPanel) return;

    const content = this.detailPanel.querySelector('.tv-logger-detail-content');
    if (! content) return;

    const time = new Date(log.timestamp).toLocaleString('zh-CN', { hour12: false });
    let detailHtml = `
      <div class="tv-logger-detail-row">
        <strong>时间:</strong> ${time}
      </div>
      <div class="tv-logger-detail-row">
        <strong>类型:</strong> ${log.type}
      </div>
      <div class="tv-logger-detail-row">
        <strong>级别:</strong> ${log. level}
      </div>
      <div class="tv-logger-detail-row">
        <strong>消息:</strong> ${this.escapeHtml(log.message)}
      </div>
    `;

    if (log.method) {
      detailHtml += `<div class="tv-logger-detail-row"><strong>方法:</strong> ${log.method}</div>`;
    }
    if (log.url) {
      detailHtml += `<div class="tv-logger-detail-row"><strong>URL: </strong> ${this.escapeHtml(log. url)}</div>`;
    }
    if (log.status) {
      detailHtml += `<div class="tv-logger-detail-row"><strong>状态:</strong> ${log. status}</div>`;
    }
    if (log.duration) {
      detailHtml += `<div class="tv-logger-detail-row"><strong>耗时:</strong> ${log. duration}ms</div>`;
    }
    if (log.data) {
      detailHtml += `
        <div class="tv-logger-detail-row">
          <strong>数据:</strong>
          <pre>${this.escapeHtml(JSON. stringify(log.data, null, 2))}</pre>
        </div>
      `;
    }

    content.innerHTML = detailHtml;
    this.detailPanel.style. display = 'flex';
  }

  hideDetail(): void {
    if (this.detailPanel) {
      this.detailPanel.style.display = 'none';
    }
  }

  moveSelection(direction: 'up' | 'down'): void {
    if (direction === 'up') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    } else {
      this.selectedIndex = Math.min(this.currentLogs.length - 1, this. selectedIndex + 1);
    }
    this.updateSelection();
  }

  getSelectedLog(): LogEntry | null {
    return this.currentLogs[this.selectedIndex] || null;
  }

  private updateSelection(): void {
    const items = this.logList?. querySelectorAll('.tv-logger-item');
    items?.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    this.scrollToSelected();
  }

  private scrollToSelected(): void {
    const selectedItem = this.logList?.querySelector('.tv-logger-item.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private bindTabEvents(): void {
    const tabs = this.container?. querySelectorAll('.tv-logger-tab');
    tabs?.forEach(tab => {
      tab. addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        target.classList.add('active');
        
        // 触发过滤事件（在 KeyboardHandler 中处理）
        if (tabName) {
          this.currentTab = tabName;
        }
      });
    });
  }

  private getLogIcon(log: LogEntry): string {
    if (log.type === 'network') return '🌐';
    if (log.type === 'websocket') return '🔌';
    if (log.level === 'error') return '❌';
    if (log.level === 'warn') return '⚠️';
    if (log.level === 'success') return '✅';
    return 'ℹ️';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
