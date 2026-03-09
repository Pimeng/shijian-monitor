// 数据格式化工具函数

/**
 * 格式化数字，添加千位分隔符
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

/**
 * 格式化步数
 */
export function formatSteps(steps: number): string {
  return steps.toLocaleString('zh-CN');
}

/**
 * 格式化距离（米转为公里）
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)}`;
}

/**
 * 格式化卡路里
 */
export function formatCalorie(cal: number): string {
  return Math.round(cal).toString();
}

/**
 * 格式化心率
 */
export function formatHeartRate(bpm: number): string {
  return `${bpm}`;
}

/**
 * 格式化血氧
 */
export function formatSaO2(value: number): string {
  return `${value}`;
}

/**
 * 格式化压力值
 */
export function formatPressure(value: number): string {
  return `${value}`;
}

/**
 * 格式化睡眠时长（毫秒转为小时分钟）
 */
export function formatSleepDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * 格式化运动时长（毫秒转为分钟秒）
 */
export function formatExerciseDuration(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes}分${seconds}秒`;
}

/**
 * 格式化时间戳为可读时间
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 获取运动类型名称
 */
export function getExerciseTypeName(type: number): string {
  const typeMap: Record<number, string> = {
    114: '操场跑步',
    1: '户外跑步',
    2: '室内跑步',
    3: '户外步行',
    4: '骑行',
    5: '游泳',
    6: '健身',
  };
  return typeMap[type] || '运动';
}

/**
 * 格式化中高强度运动时长（已转换为分钟）
 */
export function formatIntensity(minutes: number): string {
  return `${minutes}`;
}
