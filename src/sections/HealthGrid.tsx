import { memo, useMemo, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import HealthCard from '@/components/HealthCard';
import ActivityRings from '@/components/ActivityRings';
import { Skeleton } from '@/components/ui/skeleton';
import type { HealthData, CardConfig } from '@/types/health';
import { CARD_COLORS } from '@/lib/constants';
import {
  formatSleepDuration,
  formatSleepTimeRange,
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
      getTimestamp: (d) => d.heart?.t,
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
      getTimestamp: (d) => d.sleep?.t,
      getSubValue: (d) => {
        return formatSleepTimeRange(d.sleep);
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
      getTimestamp: (d) => d.saO2?.t,
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
      getTimestamp: (d) => d.pressure?.t,
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
      getTimestamp: (d) => d.exercise?.t,
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



// ============ 课程表模块 ============

// 课程数据结构
interface Course {
  day: number;           // 1-7 表示周一到周日
  endTime: string;       // 自定义结束时间 (ownTime=true 时使用)
  endWeek: number;       // 结束周
  id: number;            // 课程ID，对应 schedule_sources
  level: number;
  ownTime: boolean;      // 是否使用自定义时间
  room: string;          // 教室
  startNode: number;     // 开始节次
  startTime: string;     // 自定义开始时间 (ownTime=true 时使用)
  startWeek: number;     // 开始周
  step: number;          // 持续节数
  tableId: number;
  teacher: string;       // 教师
  type: number;
}

interface TimeSlot {
  endTime: string;
  node: number;
  startTime: string;
  timeTable: number;
}

interface ScheduleConfig {
  startDate: string;     // 学期开始日期 (周一)
  maxWeek: number;
  timeTable: number;
  showSat: boolean;
  showSun: boolean;
  nodes: number;         // 每天节数
}

interface CourseSource {
  id: number;
  courseName: string;
  color: string;
  credit: number;
}

// 星期名称
const WEEKDAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

// 课程表 Hook
function useScheduleData() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [courseSources, setCourseSources] = useState<Map<number, CourseSource>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const [configRes, coursesRes, timeRes, sourcesRes] = await Promise.all([
          fetch('/schedule/schedule_config.json'),
          fetch('/schedule/schedule_main.json'),
          fetch('/schedule/schedule_time.json'),
          fetch('/schedule/schedule_sources.json'),
        ]);

        const configData: ScheduleConfig = await configRes.json();
        const coursesData: Course[] = await coursesRes.json();
        const timeData: TimeSlot[] = await timeRes.json();
        const sourcesData: CourseSource[] = await sourcesRes.json();

        // 构建课程源映射
        const sourcesMap = new Map<number, CourseSource>();
        sourcesData.forEach(source => {
          sourcesMap.set(source.id, source);
        });

        // 过滤有效的时间槽（排除00:00的无效数据）
        const validTimeSlots = timeData.filter(t => 
          t.startTime !== '00:00' && t.endTime !== '00:00'
        );

        setConfig(configData);
        setCourses(coursesData);
        setTimeSlots(validTimeSlots);
        setCourseSources(sourcesMap);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScheduleData();
  }, []);

  // 获取当前周次 (1-based)
  const currentWeek = useMemo(() => {
    if (!config) return 1;
    const startDate = new Date(config.startDate);
    const today = new Date();
    // 计算从开学到今天的天数差
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // 周次 = 天数差 / 7 + 1
    return Math.max(1, Math.floor(diffDays / 7) + 1);
  }, [config]);

  // 获取今天是星期几 (1-7, 周一=1)
  const currentDay = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  }, []);

  // 获取课程名称
  const getCourseName = useCallback((courseId: number): string => {
    return courseSources.get(courseId)?.courseName || `课程 ${courseId}`;
  }, [courseSources]);

  // 获取课程颜色
  const getCourseColor = useCallback((courseId: number): string => {
    const color = courseSources.get(courseId)?.color;
    if (!color) return '#3b82f6'; // 默认蓝色
    // 处理 ff 前缀的颜色格式
    if (color.startsWith('#ff')) {
      return '#' + color.slice(3);
    }
    return color;
  }, [courseSources]);

  // 获取课程时间范围
  const getCourseTimeRange = useCallback((course: Course): { start: string; end: string } => {
    if (course.ownTime && course.startTime && course.endTime) {
      return { start: course.startTime, end: course.endTime };
    }
    // 根据节次查找时间
    const startSlot = timeSlots.find(t => t.node === course.startNode);
    const endSlot = timeSlots.find(t => t.node === course.startNode + course.step - 1);
    return {
      start: startSlot?.startTime || '',
      end: endSlot?.endTime || ''
    };
  }, [timeSlots]);

  // 获取指定周的课程
  const getWeekCourses = useCallback((week: number, day: number): Course[] => {
    return courses.filter(course => {
      if (course.day !== day) return false;
      if (week < course.startWeek || week > course.endWeek) return false;
      return true;
    });
  }, [courses]);

  return {
    config,
    courses,
    timeSlots,
    courseSources,
    loading,
    currentWeek,
    currentDay,
    getCourseName,
    getCourseColor,
    getCourseTimeRange,
    getWeekCourses
  };
}

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

// 将时间字符串转换为分钟数
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 课程表卡片组件
const ScheduleCard = memo(function ScheduleCard({ index }: { index: number }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    loading,
    currentWeek,
    currentDay,
    getCourseName,
    getCourseColor,
    getCourseTimeRange,
    getWeekCourses
  } = useScheduleData();

  // 每分钟更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // 获取当前正在进行的课程
  const currentCourse = useMemo(() => {
    const todayCourses = getWeekCourses(currentWeek, currentDay);
    for (const course of todayCourses) {
      const { start, end } = getCourseTimeRange(course);
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return { ...course, startMinutes, endMinutes, start, end };
      }
    }
    return null;
  }, [currentWeek, currentDay, currentMinutes, getWeekCourses, getCourseTimeRange]);

  // 获取即将开始的下一节课（今天内）
  const nextCourse = useMemo(() => {
    if (currentCourse) return null;
    const todayCourses = getWeekCourses(currentWeek, currentDay);
    let closestCourse: (Course & { startMinutes: number; endMinutes: number; start: string; end: string }) | null = null;
    let minDiff = Infinity;
    
    for (const course of todayCourses) {
      const { start, end } = getCourseTimeRange(course);
      const startMinutes = timeToMinutes(start);
      if (startMinutes > currentMinutes) {
        const diff = startMinutes - currentMinutes;
        if (diff < minDiff) {
          minDiff = diff;
          closestCourse = { ...course, startMinutes, endMinutes: timeToMinutes(end), start, end };
        }
      }
    }
    return closestCourse;
  }, [currentWeek, currentDay, currentMinutes, currentCourse, getWeekCourses, getCourseTimeRange]);

  // 获取今天所有课程
  const todayCourses = useMemo(() => {
    return getWeekCourses(currentWeek, currentDay);
  }, [currentWeek, currentDay, getWeekCourses]);

  const formatTimeStr = (timeStr: string): string => timeStr || '--:--';

  const getCountdown = (targetMinutes: number): string => {
    const diff = targetMinutes - currentMinutes;
    if (diff <= 0) return '即将开始';
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0) return `${hours}小时${mins}分钟后`;
    return `${mins}分钟后`;
  };

  const displayCourse = currentCourse || nextCourse;
  const isOngoing = !!currentCourse;
  const themeColor = displayCourse ? getCourseColor(displayCourse.id) : '#3b82f6';

  // 计算进度百分比
  const progressPercentage = useMemo(() => {
    if (currentCourse) {
      const total = currentCourse.endMinutes - currentCourse.startMinutes;
      const elapsed = currentMinutes - currentCourse.startMinutes;
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
    if (nextCourse) {
      const timeUntil = nextCourse.startMinutes - currentMinutes;
      // 距离上课还有多久（最大1小时）
      return Math.min(100, Math.max(0, (1 - timeUntil / 60) * 100));
    }
    return 0;
  }, [currentCourse, nextCourse, currentMinutes]);

  // 加载状态
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.05 + 0.2 }}
        className="relative overflow-hidden rounded-2xl p-5 bg-white/[0.03] border border-white/5"
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="h-4 w-16 bg-white/10 rounded" />
          </div>
          <div className="h-6 w-32 bg-white/10 rounded mb-2" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 + 0.2, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white/[0.03] border border-white/5 cursor-pointer transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20 group"
    >
      {/* 背景色装饰 */}
      {displayCourse && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: themeColor }}
        />
      )}
      
      <div className="relative z-10">
        {/* 头部：图标和标签 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <Calendar size={20} strokeWidth={2} style={{ color: themeColor }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">课程表</span>
              <span className="text-[10px] text-white/40">第{currentWeek}周 · 周{WEEKDAY_NAMES[currentDay - 1]}</span>
            </div>
          </div>
          
          {displayCourse && (
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${themeColor}30`,
                color: themeColor 
              }}
            >
              {isOngoing ? '进行中' : '即将开始'}
            </span>
          )}
        </div>

        {/* 课程内容 */}
        {todayCourses.length === 0 ? (
          <div>
            <p className="text-xl font-bold text-white/40">今日无课</p>
            <p className="mt-1 text-sm text-white/30">可以休息一下啦 ~</p>
          </div>
        ) : !displayCourse ? (
          <div>
            <p className="text-xl font-bold text-white/60">今日课程已结束</p>
            <p className="mt-2 text-sm text-white/40">
              今天共 {todayCourses.length} 节课
            </p>
          </div>
        ) : (
          <>
            {/* 课程名称和进度圆环的容器 */}
            <div className="flex items-start justify-between gap-3">
              <motion.p 
                key={displayCourse.id + displayCourse.startNode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold text-white truncate flex-1"
              >
                {getCourseName(displayCourse.id)}
              </motion.p>
              
              {/* 进度圆环 - 放在标题右侧 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <CircularProgress 
                  percentage={progressPercentage} 
                  color={themeColor}
                  size={40}
                  strokeWidth={3}
                />
              </motion.div>
            </div>

            {/* 课程信息 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                <Clock size={14} style={{ color: themeColor }} />
                <span>{formatTimeStr(displayCourse.start)} - {formatTimeStr(displayCourse.end)}</span>
                {!isOngoing && (
                  <span style={{ color: themeColor }} className="text-xs">
                    {getCountdown(displayCourse.startMinutes)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {displayCourse.room && (
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                      <MapPin size={14} style={{ color: themeColor }} />
                      <span className="truncate">{displayCourse.room}</span>
                    </div>
                  )}
                  {displayCourse.teacher && (
                    <div className="flex items-center gap-1.5 text-sm text-white/50">
                      <User size={14} className="text-white/40" />
                      <span>{displayCourse.teacher}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
});

export default HealthGrid;
