import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import HealthCard from '@/components/HealthCard';
import ActivityRings from '@/components/ActivityRings';
import { Skeleton } from '@/components/ui/skeleton';
import type { HealthData, CardConfig } from '@/types/health';
import { CARD_COLORS } from '@/lib/constants';
import {
  formatSleepDuration,
  getExerciseTypeName,
} from '@/lib/formatters';

interface HealthGridProps {
  data: HealthData | null;
  loading: boolean;
  viewMode: 'grid' | 'list';
}

const HealthGrid = memo(function HealthGrid({ data, loading, viewMode }: HealthGridProps) {
  // 卡片配置 - 排除已整合到 ActivityRings 的指标
  const cardConfigs: CardConfig[] = useMemo(() => [
    {
      id: 'heart',
      title: '心率',
      icon: 'Heart',
      color: CARD_COLORS.heart,
      unit: 'BPM',
      formatter: (v: number) => `${v}`,
      getValue: (d) => d.heart?.v || 0,
      getSubValue: (d) => {
        const v = d.heart?.v || 0;
        if (v < 60) return '偏低';
        if (v > 100) return '偏高';
        return '正常范围';
      },
    },
    {
      id: 'sleep',
      title: '睡眠',
      icon: 'Moon',
      color: CARD_COLORS.sleep,
      formatter: (v: number) => formatSleepDuration(v),
      getValue: (d) => d.sleep?.v || 0,
      getSubValue: (d) => {
        const hours = (d.sleep?.v || 0) / (1000 * 60 * 60);
        if (hours >= 7 && hours <= 9) return '睡眠质量良好';
        if (hours < 7) return '睡眠不足';
        return '睡眠充足';
      },
    },
    {
      id: 'saO2',
      title: '血氧饱和度',
      icon: 'Droplets',
      color: CARD_COLORS.saO2,
      unit: '%',
      formatter: (v: number) => `${v}`,
      getValue: (d) => d.saO2?.v || 0,
      getSubValue: (d) => {
        const v = d.saO2?.v || 0;
        if (v >= 95) return '正常';
        if (v >= 90) return '略低';
        return '需关注';
      },
    },
    {
      id: 'pressure',
      title: '压力值',
      icon: 'Activity',
      color: CARD_COLORS.pressure,
      formatter: (v: number) => `${v}`,
      getValue: (d) => d.pressure?.v || 0,
      getSubValue: (d) => {
        const v = d.pressure?.v || 0;
        if (v <= 33) return '放松';
        if (v <= 66) return '中等';
        return '偏高';
      },
    },
    {
      id: 'exercise',
      title: '上次运动',
      icon: 'Dumbbell',
      color: CARD_COLORS.exercise,
      formatter: (v: number) => getExerciseTypeName(v),
      getValue: (d) => d.exercise?.type || 0,
      getSubValue: (d) => {
        if (!d.exercise) return '暂无运动记录';
        const parts: string[] = [];
        if (d.exercise.distance > 0) {
          parts.push(`${(d.exercise.distance / 1000).toFixed(2)}km`);
        }
        if (d.exercise.calorie > 0) {
          parts.push(`${d.exercise.calorie}kcal`);
        }
        if (d.exercise.costTime > 0) {
          const mins = Math.floor(d.exercise.costTime / (1000 * 60));
          parts.push(`${mins}分钟`);
        }
        return parts.join(' · ') || '运动完成';
      },
    },
  ], []);

  // 加载状态
  if (loading && !data) {
    return (
      <section className="px-4 sm:px-6">
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          {/* 活动圆环骨架屏 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0 }}
          >
            <Skeleton className="h-36 rounded-2xl bg-white/5" />
          </motion.div>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (i + 1) * 0.05 }}
            >
              <Skeleton className="h-28 rounded-2xl bg-white/5" />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-white/80">暂无数据</h3>
          <p className="text-sm text-white/50 mt-1">请检查网络连接后重试</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 pb-8">
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2' 
          : 'grid-cols-1'
      }`}>
        {/* 活动圆环组合卡片 - 总是占满一行 */}
        <div className="col-span-full">
          <ActivityRings data={data} />
        </div>
        
        {cardConfigs.map((config, index) => (
          <HealthCard
            key={config.id}
            config={config}
            data={data}
            index={index}
          />
        ))}
      </div>
    </section>
  );
});

export default HealthGrid;
