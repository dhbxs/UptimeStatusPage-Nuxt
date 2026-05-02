# Uptime Monitor

一个美观、实时的服务状态监控面板，由 [UptimeRobot](https://uptimerobot.com/) 提供数据支持。基于 Nuxt 3 和 Tailwind CSS 构建。

[English](README.md)

## 功能特性

- **实时监控** - 通过 UptimeRobot API 获取实时服务状态
- **优雅的仪表盘卡片** - 简洁现代的信息卡设计，附带可用率历史柱状图
- **关键指标** - 平均响应时间和可用率一目了然
- **30 天可用率历史** - 直观的柱状图展示每日可用率
- **故障日志** - 可展开的宕机记录，包含时间戳
- **自动与手动刷新** - 每 5 分钟自动轮询，支持手动刷新按钮（冷却计时）
- **骨架屏加载** - 数据加载时提供流畅的加载体验
- **暗色模式** - 一键切换亮色/暗色主题
- **完全响应式** - 针对桌面端、平板和移动端优化

## 技术栈

- [Nuxt 3](https://nuxt.com/) - Vue.js 框架
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [UptimeRobot API](https://uptimerobot.com/api/) - 监控数据源
- [Iconify](https://iconify.design/) - 图标库

## 截图

![仪表盘截图](screenshot.png)

## 开始使用

### 前置要求

- Node.js 18+
- 一个免费的 [UptimeRobot](https://uptimerobot.com/) 账号和 API 密钥

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/uptime-nuxt.git
cd uptime-nuxt

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加你的 UptimeRobot API 密钥
```

### 配置

在项目根目录创建 `.env` 文件：

```env
NUXT_PUBLIC_API_KEY=your_uptimerobot_api_key
```

### 开发

```bash
# 启动开发服务器
pnpm run dev
```

应用将在 `http://localhost:3000` 上运行。

### 生产部署

```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
node .output/server/index.mjs
```

也可以直接部署到 Vercel、Netlify 或任何支持 Nuxt 3 的平台。

## 项目结构

```
uptime-nuxt/
├── components/          # Vue 组件
│   ├── MonitorCard.vue  # 状态卡片组件
│   ├── StatusBar.vue    # 总体状态栏
│   ├── Stats.vue        # 摘要统计
│   ├── AppHeader.vue    # 头部（主题切换 & 刷新）
│   └── ...
├── composables/         # Vue 组合式函数
│   ├── useMonitors.ts   # 数据获取逻辑
│   └── useTheme.ts      # 主题管理
├── pages/               # 应用页面
│   └── index.vue        # 仪表盘页面
├── server/              # 服务端 API 路由
│   └── api/
│       └── status.post.ts  # UptimeRobot API 代理
└── nuxt.config.ts       # Nuxt 配置
```

## 开源协议

[Apache License](LICENSE)
