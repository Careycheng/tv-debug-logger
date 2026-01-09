export class KeyboardHandler {
  private konamiSequence:  string[] = [];
  private konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private boundKeyHandler?:  (e: KeyboardEvent) => void;

  constructor(
    private hotkey: string,
    private onToggle: () => void,
    private onAction: (action: string) => void
  ) {}

  init(): void {
    this.boundKeyHandler = this.handleKeyPress.bind(this);
    document.addEventListener('keydown', this. boundKeyHandler);
  }

  destroy(): void {
    if (this.boundKeyHandler) {
      document.removeEventListener('keydown', this.boundKeyHandler);
    }
  }

  private handleKeyPress(e:  KeyboardEvent): void {
    // 检查唤起快捷键
    if (this.hotkey === 'konami') {
      this.konamiSequence. push(e.key);
      if (this.konamiSequence.length > this.konamiCode.length) {
        this.konamiSequence. shift();
      }
      if (this.konamiSequence.join(',') === this.konamiCode.join(',')) {
        this.onToggle();
        this.konamiSequence = [];
        return;
      }
    } else if (e.key === this.hotkey) {
      e.preventDefault();
      this.onToggle();
      return;
    }

    // 检查面板是否可见
    const panel = document.getElementById('tv-debug-logger');
    if (!panel || panel.style.display === 'none') return;

    // 检查详情面板
    const detailPanel = panel.querySelector('.tv-logger-detail') as HTMLElement;
    const isDetailVisible = detailPanel && detailPanel.style.display !== 'none';

    if (isDetailVisible) {
      // 详情面板打开时，返回键关闭详情
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        const uiRenderer = (window as any).__tvLoggerUIRenderer;
        uiRenderer?.hideDetail();
      }
      return;
    }

    // 主界面按键处理
    switch (e.key) {
      case 'ArrowUp': 
        e.preventDefault();
        const uiRendererUp = (window as any).__tvLoggerUIRenderer;
        uiRendererUp?.moveSelection('up');
        break;

      case 'ArrowDown': 
        e.preventDefault();
        const uiRendererDown = (window as any).__tvLoggerUIRenderer;
        uiRendererDown?.moveSelection('down');
        break;

      case 'Enter':
        e.preventDefault();
        const uiRendererEnter = (window as any).__tvLoggerUIRenderer;
        const selectedLog = uiRendererEnter?.getSelectedLog();
        if (selectedLog) {
          uiRendererEnter?. showDetail(selectedLog);
        }
        break;

      case 'Escape':
      case 'Backspace': 
        e.preventDefault();
        this.onToggle();
        break;

      case '1':
        e.preventDefault();
        this.onAction('clear');
        break;

      case '2':
        e.preventDefault();
        this.onAction('pause');
        break;

      case '3':
        e. preventDefault();
        this.onAction('export');
        break;

      case 'ArrowLeft':
      case 'ArrowRight':
        // 切换标签页
        e.preventDefault();
        this.switchTab(e.key === 'ArrowLeft' ? -1 : 1);
        break;
    }
  }

  private switchTab(direction: number): void {
    const tabs = ['all', 'console', 'network', 'websocket'];
    const activeTab = document.querySelector('.tv-logger-tab.active') as HTMLElement;
    const currentIndex = tabs.indexOf(activeTab?. dataset.tab || 'all');
    const newIndex = (currentIndex + direction + tabs.length) % tabs.length;
    
    this.onAction(`filter-${tabs[newIndex]}`);
    
    // 更新 UI
    const allTabs = document.querySelectorAll('.tv-logger-tab');
    allTabs.forEach((tab, index) => {
      if (index === newIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
}
