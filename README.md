# TV Debug Logger

一个专为智能电视 Web 应用设计的调试日志插件，支持网络请求监控、WebSocket 追踪、控制台日志���获，并提供遥控器友好的交互界面。

## ✨ 特性

- 🌐 **网络监控**: 自动捕获 Fetch、XMLHttpRequest 请求
- 🔌 **WebSocket 追踪**: 监控 WebSocket 连接、消息发送/接收、断开等
- 📝 **控制台日志**:  捕获 console.log/info/warn/error 等
- 🎮 **遥控器支持**: 完美适配 TV 遥控器操作（上下左右、OK、返回）
- ⌨️ **快捷键唤起**: 支持单键（F12）或组合键（Konami Code）唤起
- 🎨 **框架无关**: 适用于 React、Vue、Angular 或原生 JavaScript
- 📦 **零依赖**: 无需额外依赖
- 💾 **持久化**:  支持日志导出和本地存储

## 📦 安装

```bash
npm install tv-debug-logger
```

或使用 yarn:

```bash
yarn add tv-debug-logger
```

或使用 pnpm: 

```bash
pnpm add tv-debug-logger
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import TVDebugLogger from 'tv-debug-logger';
import 'tv-debug-logger/dist/tv-debug-logger.css';

// 初始化
const logger = new TVDebugLogger({
  hotkey: 'F12', // 唤起快捷键
  maxLogs: 1000, // 最大日志条数
  captureConsole: true,
  captureNetwork: true,
  captureWebSocket: true
});

logger.init();
```

### React

```jsx
import { useEffect } from 'react';
import TVDebugLogger from 'tv-debug-logger';
import 'tv-debug-logger/dist/tv-debug-logger.css';

function App() {
  useEffect(() => {
    const logger = new TVDebugLogger({
      hotkey: 'F12'
    });
    logger.init();
    
    return () => {
      logger.destroy();
    };
  }, []);

  return <div>Your App</div>;
}
```

### Vue 3

```vue
<template>
  <div>Your App</div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import TVDebugLogger from 'tv-debug-logger';
import 'tv-debug-logger/dist/tv-debug-logger.css';

let logger;

onMounted(() => {
  logger = new TVDebugLogger({
    hotkey:  'F12'
  });
  logger.init();
});

onUnmounted(() => {
  logger?.destroy();
});
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import TVDebugLogger from 'tv-debug-logger';
import 'tv-debug-logger/dist/tv-debug-logger.css';

@Component({
  selector:  'app-root',
  template: '<div>Your App</div>'
})
export class AppComponent implements OnInit, OnDestroy {
  private logger: TVDebugLogger;

  ngOnInit() {
    this.logger = new TVDebugLogger({
      hotkey: 'F12'
    });
    this.logger.init();
  }

  ngOnDestroy() {
    this.logger?.destroy();
  }
}
```

## ⚙️ 配置选项

```typescript
interface TVDebugLoggerOptions {
  // 唤起快捷键，支持:  'F12', 'F11', 'Escape' 或 'konami'（上上下下左右左右BA）
  hotkey?: string;
  
  // 最大日志条数
  maxLogs?: number;
  
  // 是否捕获控制台日志
  captureConsole?: boolean;
  
  // 是否捕获网络请求
  captureNetwork?: boolean;
  
  // 是否捕获 WebSocket
  captureWebSocket?: boolean;
  
  // 是否自动滚动到最新日志
  autoScroll?: boolean;
  
  // 主题：'dark' | 'light'
  theme?: string;
  
  // 初始是否显示
  initialVisible?: boolean;
  
  // 自定义 z-index
  zIndex?: number;
}
```

## 🎮 遥控器操作

| 按键 | 功能 |
|------|------|
| **上/下** | 在日志列表中导航 |
| **左/右** | 切换标签页（全部/网络/WebSocket/控制台） |
| **OK/Enter** | 查看日志详情 |
| **返回/Esc** | 关闭详情或关闭面板 |
| **数字键 1** | 清空日志 |
| **数字键 2** | 暂停/继续捕获 |
| **数字键 3** | 导出日志 |

## 📖 API

### 方法

```javascript
// 初始化日志插件
logger.init();

// 销毁日志插件
logger.destroy();

// 显示日志面板
logger.show();

// 隐藏日志面板
logger.hide();

// 切换显示/隐藏
logger.toggle();

// 清空日志
logger.clear();

// 添加自定义日志
logger.log(message, type, data);

// 导出日志为 JSON
logger.export();
```

## 🎨 自定义样式

你可以通过 CSS 变量自定义样式：

```css
:root {
  --tv-logger-bg: rgba(0, 0, 0, 0.95);
  --tv-logger-text: #ffffff;
  --tv-logger-border: #333;
  --tv-logger-highlight: #007aff;
  --tv-logger-success: #34c759;
  --tv-logger-warning: #ff9500;
  --tv-logger-error: #ff3b30;
}
```

## 📝 License

MIT

## 🤝 Contributing

欢迎提交 Issue 和 Pull Request！
