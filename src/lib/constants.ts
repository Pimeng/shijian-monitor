// 常量配置

export const API_BASE_URL = 'https://get.vivo-health.07210700.xyz';

export const ENDPOINTS = {
  health: '/api/health',
  healthDetail: '/api/health-detail',
  healthCheck: '/api/health-check',
  window: '/api/window',
  duolingoWildfire: '/api/duolingo/wildfire',
  ipAddress: '/api/ip_address',
};

export const REFRESH_INTERVAL = 30000; // 30秒自动刷新

// 卡片颜色配置 - 完全透明背景
export const CARD_COLORS = {
  step: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-emerald-600 dark:text-emerald-400',
    gradient: '',
  },
  heart: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-purple-600 dark:text-purple-400',
    gradient: '',
  },
  sleep: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-blue-600 dark:text-blue-400',
    gradient: '',
  },
  saO2: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-cyan-600 dark:text-cyan-400',
    gradient: '',
  },
  pressure: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-orange-600 dark:text-orange-400',
    gradient: '',
  },
  calorie: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-red-600 dark:text-red-400',
    gradient: '',
  },
  distance: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-teal-600 dark:text-teal-400',
    gradient: '',
  },
  exercise: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-green-600 dark:text-green-400',
    gradient: '',
  },
  intensity: {
    bg: 'bg-transparent',
    border: 'border-border',
    icon: 'text-amber-600 dark:text-amber-400',
    gradient: '',
  },
};

// 设备状态配置
export const DEVICE_CONFIG = [
  {
    id: 'computer',
    name: '皮梦の电脑',
    icon: 'Monitor',
    isOnline: true,
    lastSeen: '刚刚',
    info: [
      { label: '系统', value: 'Windows 11' },
      { label: '状态', value: '在线' },
    ],
  },
  {
    id: 'phone',
    name: '皮梦の手机',
    icon: 'Smartphone',
    isOnline: true,
    lastSeen: '刚刚',
    info: [
      { label: '电量', value: '85%' },
      { label: '网络', value: 'WiFi' },
    ],
  },
];
