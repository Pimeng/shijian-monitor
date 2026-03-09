import { memo } from 'react';
import { motion } from 'framer-motion';
import type { HealthData } from '@/types/health';

interface ActivityRingsProps {
  data: HealthData;
}

// 圆环配置
const RING_CONFIG = {
  steps: {
    color: '#3B82F6', // 蓝色
    bgColor: 'rgba(59, 130, 246, 0.15)',
    max: 10000,
    label: '步数',
    unit: '步',
  },
  intensity: {
    color: '#F59E0B', // 橙色
    bgColor: 'rgba(245, 158, 11, 0.15)',
    max: 30,
    label: '中高强度',
    unit: '分钟',
  },
  calorie: {
    color: '#10B981', // 绿色
    bgColor: 'rgba(16, 185, 129, 0.15)',
    max: 500,
    label: '热量',
    unit: '千卡',
  },
  distance: {
    color: '#EF4444', // 红色
    bgColor: 'rgba(239, 68, 68, 0.15)',
    max: 5000, // 5km = 5000m
    label: '距离',
    unit: '公里',
  },
};

// SVG 圆环组件
function Ring({ 
  radius, 
  strokeWidth, 
  progress, 
  color, 
  bgColor,
  delay = 0,
}: { 
  radius: number; 
  strokeWidth: number; 
  progress: number; 
  color: string;
  bgColor: string;
  delay?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <g>
      {/* 背景圆环 */}
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* 进度圆环 */}
      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ 
          duration: 1.2, 
          delay,
          ease: [0.4, 0, 0.2, 1]
        }}
        transform="rotate(-90 60 60)"
      />
    </g>
  );
}

const ActivityRings = memo(function ActivityRings({ data }: ActivityRingsProps) {
  // 计算各项数值和进度
  const steps = data.step?.v || 0;
  const intensityMinutes = Math.floor((data.intensity?.v || 0) / (1000 * 60));
  const calorie = Math.round(data.calorie?.v || 0);
  const distanceMeters = data.distance?.v || 0;
  const distanceKm = (distanceMeters / 1000);

  // 计算进度百分比（最多100%）
  const stepsProgress = Math.min((steps / RING_CONFIG.steps.max) * 100, 100);
  const intensityProgress = Math.min((intensityMinutes / RING_CONFIG.intensity.max) * 100, 100);
  const calorieProgress = Math.min((calorie / RING_CONFIG.calorie.max) * 100, 100);
  const distanceProgress = Math.min((distanceMeters / RING_CONFIG.distance.max) * 100, 100);

  const stats = [
    { 
      key: 'steps', 
      value: steps, 
      progress: stepsProgress,
      displayMax: RING_CONFIG.steps.max,
      ...RING_CONFIG.steps 
    },
    { 
      key: 'intensity', 
      value: intensityMinutes, 
      progress: intensityProgress,
      displayMax: RING_CONFIG.intensity.max,
      ...RING_CONFIG.intensity 
    },
    { 
      key: 'calorie', 
      value: calorie, 
      progress: calorieProgress,
      displayMax: RING_CONFIG.calorie.max,
      ...RING_CONFIG.calorie 
    },
    { 
      key: 'distance', 
      value: distanceKm.toFixed(2), 
      progress: distanceProgress,
      displayMax: (RING_CONFIG.distance.max / 1000).toFixed(1),
      ...RING_CONFIG.distance 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl p-5 bg-transparent border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center gap-6">
        {/* 左侧数据 */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div 
                  className="w-1 h-3 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-xs text-white/60">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-white/40">
                  / {stat.displayMax} {stat.unit}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 右侧圆环 */}
        <div className="relative w-[120px] h-[120px] flex-shrink-0">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120"
            className="transform"
          >
            {/* 步数 - 最外层 */}
            <Ring
              radius={54}
              strokeWidth={10}
              progress={stepsProgress}
              color={RING_CONFIG.steps.color}
              bgColor={RING_CONFIG.steps.bgColor}
              delay={0}
            />
            {/* 中高强度 - 第二层 */}
            <Ring
              radius={42}
              strokeWidth={10}
              progress={intensityProgress}
              color={RING_CONFIG.intensity.color}
              bgColor={RING_CONFIG.intensity.bgColor}
              delay={0.1}
            />
            {/* 热量 - 第三层 */}
            <Ring
              radius={30}
              strokeWidth={10}
              progress={calorieProgress}
              color={RING_CONFIG.calorie.color}
              bgColor={RING_CONFIG.calorie.bgColor}
              delay={0.2}
            />
            {/* 距离 - 最内层 */}
            <Ring
              radius={18}
              strokeWidth={10}
              progress={distanceProgress}
              color={RING_CONFIG.distance.color}
              bgColor={RING_CONFIG.distance.bgColor}
              delay={0.3}
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
});

export default ActivityRings;
