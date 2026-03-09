# 皮梦健康监测面板 - 技术规格文档

## 组件清单

### shadcn/ui 组件
- Card - 卡片容器
- Button - 按钮
- Progress - 进度条
- Badge - 状态标签
- Skeleton - 加载骨架屏
- Tooltip - 提示信息

### 自定义组件

| 组件名 | 用途 | 位置 |
|--------|------|------|
| Header | 页面头部，包含标题和操作按钮 | sections/Header.tsx |
| DeviceWindow | 设备状态窗口 | sections/DeviceWindow.tsx |
| HealthCard | 健康数据卡片 | components/HealthCard.tsx |
| HealthGrid | 健康卡片网格布局 | sections/HealthGrid.tsx |
| Footer | 页脚信息 | sections/Footer.tsx |
| useHealthData | 健康数据获取Hook | hooks/useHealthData.ts |
| formatters | 数据格式化工具 | lib/formatters.ts |

## 动画实现方案

| 动画 | 库 | 实现方式 | 复杂度 |
|------|-----|---------|--------|
| 页面入场动画 | Framer Motion | AnimatePresence + stagger | 中 |
| 卡片悬停效果 | CSS/Tailwind | hover:translate-y + transition | 低 |
| 卡片点击反馈 | CSS/Tailwind | active:scale + transition | 低 |
| 数据更新过渡 | Framer Motion | AnimatePresence + key change | 中 |
| 刷新按钮旋转 | CSS Animation | animate-spin | 低 |
| 进度条动画 | CSS Transition | width transition | 低 |

## 项目结构

```
app/
├── src/
│   ├── sections/
│   │   ├── Header.tsx
│   │   ├── DeviceWindow.tsx
│   │   ├── HealthGrid.tsx
│   │   └── Footer.tsx
│   ├── components/
│   │   └── HealthCard.tsx
│   ├── hooks/
│   │   └── useHealthData.ts
│   ├── lib/
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── health.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
└── package.json
```

## 依赖项

### 核心依赖
- react
- react-dom
- typescript
- vite

### UI 依赖
- tailwindcss
- @radix-ui/react-* (shadcn依赖)
- lucide-react

### 动画依赖
- framer-motion

### 数据获取
- axios (可选，或用fetch)

## API 配置

```typescript
const API_BASE_URL = 'https://get.vivo-health.07210700.xyz';

const ENDPOINTS = {
  health: '/api/health',
  healthCheck: '/api/health-check',
};
```

## 颜色配置

```typescript
const CARD_COLORS = {
  step: { bg: 'bg-emerald-900/50', border: 'border-emerald-700/30', icon: 'text-emerald-400' },
  heart: { bg: 'bg-purple-900/50', border: 'border-purple-700/30', icon: 'text-purple-400' },
  sleep: { bg: 'bg-blue-900/50', border: 'border-blue-700/30', icon: 'text-blue-400' },
  saO2: { bg: 'bg-cyan-900/50', border: 'border-cyan-700/30', icon: 'text-cyan-400' },
  pressure: { bg: 'bg-orange-900/50', border: 'border-orange-700/30', icon: 'text-orange-400' },
  calorie: { bg: 'bg-red-900/50', border: 'border-red-700/30', icon: 'text-red-400' },
  distance: { bg: 'bg-teal-900/50', border: 'border-teal-700/30', icon: 'text-teal-400' },
  exercise: { bg: 'bg-green-900/50', border: 'border-green-700/30', icon: 'text-green-400' },
};
```

## 性能优化

1. 使用 React.memo 缓存卡片组件
2. 使用 useMemo 缓存格式化数据
3. 使用 useCallback 缓存事件处理函数
4. 图片懒加载 (如有)
5. 数据请求防抖/节流
