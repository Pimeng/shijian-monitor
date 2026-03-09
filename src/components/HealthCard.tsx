import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Footprints, 
  Heart, 
  Moon, 
  Droplets, 
  Activity, 
  Flame, 
  MapPin, 
  Dumbbell,
  Zap,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatRelativeTime } from '@/lib/formatters';
import type { CardConfig, HealthData } from '@/types/health';

interface HealthCardProps {
  config: CardConfig;
  data: HealthData;
  index: number;
  onClick?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Footprints,
  Heart,
  Moon,
  Droplets,
  Activity,
  Flame,
  MapPin,
  Dumbbell,
  Zap,
};

const HealthCard = memo(function HealthCard({ config, data, index, onClick }: HealthCardProps) {
  const Icon = iconMap[config.icon] || Activity;
  const value = config.getValue(data);
  const subValue = config.getSubValue?.(data);
  const timestamp = config.getTimestamp?.(data);
  const updateTime = formatRelativeTime(timestamp);
  
  // 计算进度条值
  const progressValue = typeof value === 'number' && config.showProgress && config.progressMax
    ? Math.min((value / config.progressMax) * 100, 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05 + 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-5
        ${config.color.bg}
        border ${config.color.border}
        cursor-pointer
        transition-shadow duration-200
        hover:shadow-lg hover:shadow-black/20
        group
      `}
    >
      <div className="relative z-10">
        {/* 图标和标签 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-black/20 backdrop-blur-sm
              ${config.color.icon}
            `}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              {config.title}
            </span>
          </div>
          
          {/* 更新时间戳 */}
          {timestamp && (
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Clock size={10} />
              <span>{updateTime}</span>
            </div>
          )}
        </div>

        {/* 数值 */}
        <div className="flex items-baseline gap-1">
          <motion.span 
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-white"
          >
            {typeof value === 'number' ? config.formatter(value) : value}
          </motion.span>
          {config.unit && (
            <span className="text-sm text-white/50">{config.unit}</span>
          )}
        </div>

        {/* 次要信息 */}
        {subValue && (
          <motion.p 
            key={subValue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-2 text-sm text-white/70"
          >
            {subValue}
          </motion.p>
        )}

        {/* 进度条 */}
        {config.showProgress && (
          <div className="mt-4">
            <Progress 
              value={progressValue} 
              className="h-1.5 bg-black/30"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default HealthCard;
