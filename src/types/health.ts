// 健康数据类型定义

export interface HealthDataItem {
  t: number; // 时间戳
  v: number; // 数值
}

export interface ExerciseData {
  t: number;
  type: number;
  distance: number;
  cycleNum: number;
  calorie: number;
  costTime: number;
  sourceFrom: string;
}

export interface HealthData {
  step: HealthDataItem;
  distance: HealthDataItem;
  calorie: HealthDataItem;
  heart: HealthDataItem;
  pressure: HealthDataItem;
  saO2: HealthDataItem;
  sleep: HealthDataItem;
  intensity: HealthDataItem;
  exercise: ExerciseData;
  watchWarnBOS: any[];
}

export interface HealthApiResponse {
  success: boolean;
  data: HealthData;
}

export interface CardConfig {
  id: string;
  title: string;
  icon: string;
  color: {
    bg: string;
    border: string;
    icon: string;
    gradient: string;
  };
  unit?: string;
  formatter: (value: number) => string;
  getValue: (data: HealthData) => number | string;
  getSubValue?: (data: HealthData) => string;
  showProgress?: boolean;
  progressMax?: number;
}

export interface DeviceStatus {
  id: string;
  name: string;
  icon: string;
  isOnline: boolean;
  lastSeen: string;
  info: {
    label: string;
    value: string;
  }[];
}

// Window API 类型定义
export interface WindowDeviceData {
  machine: string;
  window_title: string;
  app: string | null;
  access_time: string;
}

export interface WindowApiData {
  pc: WindowDeviceData;
  mobile: WindowDeviceData;
}

export interface WindowApiResponse {
  success: boolean;
  timestamp: string;
  data: WindowApiData;
}

// Duolingo 续火数据类型定义
export interface DuolingoWildfireData {
  length: number;
  xpGoal: number;
  updatedTimeZone: string;
  updatedTimestamp: number;
  startTimestamp: number;
}

export interface DuolingoWildfireResponse {
  success: boolean;
  data: DuolingoWildfireData;
}
