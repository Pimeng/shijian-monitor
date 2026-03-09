import { memo, useMemo, useEffect, useState } from 'react';
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
import { Calendar, MapPin, User, Clock } from 'lucide-react';

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
        
        {/* 课程表卡片 */}
        <ScheduleCard index={cardConfigs.length} />
      </div>
    </section>
  );
});



// 课程数据结构
interface Course {
  day: number;
  endTime: string;
  endWeek: number;
  id: number;
  level: number;
  ownTime: boolean;
  room: string;
  startNode: number;
  startTime: string;
  startWeek: number;
  step: number;
  tableId: number;
  teacher: string;
  type: number;
}

interface TimeSlot {
  endTime: string;
  node: number;
  startTime: string;
  timeTable: number;
}

interface ScheduleConfig {
  startDate: string;
  maxWeek: number;
  timeTable: number;
}

// 课程名称映射（基于 id）
const courseNameMap: Record<number, string> = {
  0: '体育',
  1: '企业资源规划',
  2: '财务大数据分析',
  3: '跟岗实习',
  4: '经济法',
  5: '智能财税',
  6: '大数据技术应用',
  7: '管理会计',
  8: '财务报表分析',
  9: '智慧化税费申报',
  10: '会计信息系统应用',
  11: '业财一体信息化',
  12: '财务机器人应用',
  13: '1+X财务数字化',
  14: '企业经营认知',
  15: 'Python技术',
  16: '智能财税实训',
};

// 获取课程名称
const getCourseName = (course: Course): string => {
  return courseNameMap[course.id] || `课程 ${course.id}`;
};

// 圆环进度组件
const CircularProgress = memo(function CircularProgress({ 
  percentage, 
  color = 'oklch(.75 .14 250)',
  size = 44,
  strokeWidth = 3
}: { 
  percentage: number; 
  color?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
});

// 课程表卡片组件
const ScheduleCard = memo(function ScheduleCard({ index }: { index: number }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const [configRes, coursesRes, timeRes] = await Promise.all([
          fetch('/schedule/schedule_config.json'),
          fetch('/schedule/schedule_main.json'),
          fetch('/schedule/schedule_time.json'),
        ]);

        const configData = await configRes.json();
        const coursesData = await coursesRes.json();
        const timeData = await timeRes.json();

        setConfig(configData);
        setCourses(coursesData);
        setTimeSlots(timeData.filter((t: TimeSlot) => Number(t.timeTable) === Number(configData.timeTable)));
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      }
    };

    loadScheduleData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentWeek = useMemo(() => {
    if (!config) return 1;
    const startDate = new Date(config.startDate);
    const diffTime = currentTime.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(diffDays / 7) + 1);
  }, [config, currentTime]);

  const currentDay = useMemo(() => {
    const day = currentTime.getDay();
    return day === 0 ? 7 : day;
  }, [currentTime]);

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  const currentCourse = useMemo(() => {
    if (!courses.length || !timeSlots.length) return null;

    const todayCourses = courses.filter(course => {
      const courseDay = Number(course.day);
      const startWeek = Number(course.startWeek);
      const endWeek = Number(course.endWeek);
      if (courseDay !== currentDay) return false;
      if (currentWeek < startWeek || currentWeek > endWeek) return false;
      return true;
    });

    for (const course of todayCourses) {
      let startMinutes: number;
      let endMinutes: number;

      if (Boolean(course.ownTime) && course.startTime && course.endTime) {
        startMinutes = timeToMinutes(course.startTime);
        endMinutes = timeToMinutes(course.endTime);
      } else {
        const startNodeNum = Number(course.startNode);
        const stepNum = Number(course.step);
        const startSlot = timeSlots.find(t => Number(t.node) === startNodeNum);
        const endSlot = timeSlots.find(t => Number(t.node) === startNodeNum + stepNum - 1);
        if (!startSlot || !endSlot) continue;
        startMinutes = timeToMinutes(startSlot.startTime);
        endMinutes = timeToMinutes(endSlot.endTime);
      }

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return { ...course, startMinutes, endMinutes };
      }
    }
    return null;
  }, [courses, timeSlots, currentDay, currentWeek, currentMinutes]);

  const upcomingCourse = useMemo(() => {
    if (currentCourse || !courses.length || !timeSlots.length) return null;

    const threeHoursLater = currentMinutes + 3 * 60;

    const todayCourses = courses.filter(course => {
      const courseDay = Number(course.day);
      const startWeek = Number(course.startWeek);
      const endWeek = Number(course.endWeek);
      if (courseDay !== currentDay) return false;
      if (currentWeek < startWeek || currentWeek > endWeek) return false;
      return true;
    });

    for (const course of todayCourses) {
      let startMinutes: number;
      let endMinutes: number;

      if (Boolean(course.ownTime) && course.startTime && course.endTime) {
        startMinutes = timeToMinutes(course.startTime);
        endMinutes = timeToMinutes(course.endTime);
      } else {
        const startNodeNum = Number(course.startNode);
        const stepNum = Number(course.step);
        const startSlot = timeSlots.find(t => Number(t.node) === startNodeNum);
        const endSlot = timeSlots.find(t => Number(t.node) === startNodeNum + stepNum - 1);
        if (!startSlot || !endSlot) continue;
        startMinutes = timeToMinutes(startSlot.startTime);
        endMinutes = timeToMinutes(endSlot.endTime);
      }

      if (startMinutes > currentMinutes && startMinutes <= threeHoursLater) {
        return { ...course, startMinutes, endMinutes };
      }
    }
    return null;
  }, [courses, timeSlots, currentDay, currentWeek, currentMinutes, currentCourse]);

  const progressPercentage = useMemo(() => {
    if (currentCourse) {
      const totalDuration = currentCourse.endMinutes - currentCourse.startMinutes;
      const elapsed = currentMinutes - currentCourse.startMinutes;
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
    if (upcomingCourse) {
      const timeUntilStart = upcomingCourse.startMinutes - currentMinutes;
      const percentage = (1 - timeUntilStart / (3 * 60)) * 100;
      return Math.min(100, Math.max(0, percentage));
    }
    return 0;
  }, [currentCourse, upcomingCourse, currentMinutes]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getCountdown = (targetMinutes: number): string => {
    const diff = targetMinutes - currentMinutes;
    if (diff <= 0) return '即将开始';
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0) return `${hours}小时${mins}分钟后`;
    return `${mins}分钟后`;
  };

  const hasCourse = courses.length > 0;
  const isOngoing = !!currentCourse;
  const course = (currentCourse || upcomingCourse);
  
  const themeColor = 'oklch(.75 .14 250)';

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
      className={`
        relative overflow-hidden rounded-2xl p-5
        ${course ? 'bg-[oklch(.75_.14_250)]/10' : 'bg-white/[0.03]'}
        border ${course ? 'border-[oklch(.75_.14_250)]/20' : 'border-white/5'}
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
            `}>
              <Calendar size={20} strokeWidth={2} style={{ color: course ? themeColor : 'rgba(255,255,255,0.3)' }} />
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              课程表
            </span>
          </div>
          
          {/* 状态标签 */}
          {course && (
            <span 
              className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${isOngoing 
                  ? 'bg-[oklch(.75_.14_250)]/30 text-white' 
                  : 'bg-[oklch(.75_.14_250)]/20 text-white/80'
                }
              `}
            >
              {isOngoing ? '进行中' : '将开始'}
            </span>
          )}
        </div>

        {/* 主要内容 */}
        {!hasCourse ? (
          <div>
            <p className="text-2xl font-bold text-white/30">暂无数据</p>
            <p className="mt-1 text-sm text-white/20">第{currentWeek}周</p>
          </div>
        ) : !course ? (
          <div>
            <p className="text-2xl font-bold text-white/40">最近无课程</p>
            <p className="mt-1 text-sm text-white/30">第{currentWeek}周 · 快去骚扰皮梦（雾</p>
          </div>
        ) : (
          <>
            {/* 课程名称 */}
            <motion.p 
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-white truncate"
            >
              {getCourseName(course)}
            </motion.p>

            {/* 次要信息 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-sm text-white/60">
                <Clock size={14} style={{ color: themeColor }} />
                <span>{formatTime(course.startMinutes)} - {formatTime(course.endMinutes)}</span>
                {!isOngoing && (
                  <span style={{ color: themeColor }}>{getCountdown(course.startMinutes)}</span>
                )}
              </div>
              {course.room && (
                <div className="flex items-center gap-1.5 text-sm text-white/60">
                  <MapPin size={14} style={{ color: themeColor }} />
                  <span className="truncate">{course.room}</span>
                </div>
              )}
              {course.teacher && (
                <div className="flex items-center gap-1.5 text-sm text-white/60">
                  <User size={14} style={{ color: themeColor }} />
                  <span>{course.teacher}</span>
                </div>
              )}
            </motion.div>

            {/* 进度圆环 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-4 right-4"
            >
              <CircularProgress 
                percentage={progressPercentage} 
                color={themeColor}
                size={44}
                strokeWidth={3}
              />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
});

export default HealthGrid;
