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
  getTimestamp?: (data: HealthData) => number | undefined;
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

// IP 地理位置类型定义
export interface IpLocation {
  province: string;
  city: string;
}

export interface IpDeviceData {
  machine: string;
  ip_address: string;
  access_time: string;
  location: IpLocation;
}

export interface IpLocationApiData {
  pc: IpDeviceData;
  mobile: IpDeviceData;
}

export interface IpLocationApiResponse {
  success: boolean;
  data: IpLocationApiData;
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

// 健康详细数据类型定义
export type HealthDetailType = 'pressure' | 'calorie' | 'distance' | 'rate' | 'saO2' | 'step';

// 详细数据中的时间点值
export interface IndexTimeValue {
  t: number; // 时间戳
  v: number; // 数值
}

// 压力详细数据
export interface PressureDetailItem {
  t: number;
  up: number;
  down: number;
  average: number;
  indexTimeValues: IndexTimeValue[];
}

// 心率详细数据
export interface RateDetailItem {
  t: number;
  up: number;
  down: number;
  average: number;
  rateEarliest?: number;
}

// 血氧详细数据
export interface SaO2DetailItem {
  t: number;
  up: number;
  down: number;
  average: number;
}

// 步数/卡路里/距离详细数据
export interface StepCalorieDistanceDetailItem {
  t: number;
  v: number;
  indexTimeValues: IndexTimeValue[];
}

// 心率详细数据结构（实际 API 响应）
export interface RateDetailData {
  rate?: RateDetailItem[];
  restRate?: RateDetailItem[];
  stepRate?: RateDetailItem[];
  rateEarliest?: number;
}

// 压力详细数据结构
export interface PressureDetailData {
  detail?: PressureDetailItem[];
}

// 血氧详细数据结构
export interface SaO2DetailData {
  detail?: SaO2DetailItem[];
}

// 步数详细数据结构
export interface StepDetailData {
  detail?: StepCalorieDistanceDetailItem[];
}

// 卡路里详细数据结构
export interface CalorieDetailData {
  detail?: StepCalorieDistanceDetailItem[];
}

// 距离详细数据结构
export interface DistanceDetailData {
  detail?: StepCalorieDistanceDetailItem[];
}

// 通用详细数据响应
export type HealthDetailData = 
  | RateDetailData 
  | PressureDetailData 
  | SaO2DetailData 
  | StepDetailData 
  | CalorieDetailData 
  | DistanceDetailData;

export interface HealthDetailResponse {
  success: boolean;
  type: HealthDetailType;
  description: string;
  data: HealthDetailData;
}
