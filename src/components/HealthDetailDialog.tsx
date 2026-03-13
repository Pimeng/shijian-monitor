import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Flame,
  Footprints,
  Heart,
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type {
  HealthDetailType,
  HealthDetailResponse,
  RateDetailItem,
  PressureDetailItem,
  SaO2DetailItem,
  StepCalorieDistanceDetailItem,
} from '@/types/health';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface HealthDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: HealthDetailType | null;
  data: HealthDetailResponse | null;
  loading: boolean;
  error: string | null;
}

// 类型配置映射
const typeConfig: Record<HealthDetailType, {
  title: string;
  icon: React.ElementType;
  color: string;
  unit: string;
  formatter: (v: number) => string;
  chartColor: string;
}> = {
  pressure: {
    title: '压力详情',
    icon: Activity,
    color: 'text-orange-400',
    unit: '',
    formatter: (v: number) => `${v}`,
    chartColor: '#fb923c',
  },
  calorie: {
    title: '卡路里详情',
    icon: Flame,
    color: 'text-red-400',
    unit: 'kcal',
    formatter: (v: number) => `${v.toFixed(1)}`,
    chartColor: '#f87171',
  },
  distance: {
    title: '距离详情',
    icon: Footprints,
    color: 'text-teal-400',
    unit: 'm',
    formatter: (v: number) => `${v.toFixed(1)}`,
    chartColor: '#2dd4bf',
  },
  rate: {
    title: '心率详情',
    icon: Heart,
    color: 'text-purple-400',
    unit: 'BPM',
    formatter: (v: number) => `${v}`,
    chartColor: '#c084fc',
  },
  saO2: {
    title: '血氧详情',
    icon: Droplets,
    color: 'text-cyan-400',
    unit: '%',
    formatter: (v: number) => `${v}`,
    chartColor: '#22d3ee',
  },
  step: {
    title: '步数详情',
    icon: Footprints,
    color: 'text-emerald-400',
    unit: '步',
    formatter: (v: number) => `${v}`,
    chartColor: '#34d399',
  },
};

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

// 格式化图表时间（简化为小时:分钟）
function formatChartTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 默认尺寸
const DEFAULT_WIDTH = 576; // sm:max-w-xl ≈ 576px
const DEFAULT_HEIGHT = 'auto';
const MIN_WIDTH = 360;
const MIN_HEIGHT = 300;

const HealthDetailDialog = memo(function HealthDetailDialog({
  isOpen,
  onClose,
  type,
  data,
  loading,
  error,
}: HealthDetailDialogProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT as number | 'auto' });
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHoveringResize, setIsHoveringResize] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 重置位置和大小
  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    setIsMaximized(false);
  }, []);

  // 当对话框打开时重置位置
  useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

  // 处理拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    // 只允许左键拖拽
    if (e.button !== 0) return;
    
    // 如果正在最大化状态，不拖拽
    if (isMaximized) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.preventDefault();
  }, [position, isMaximized]);

  // 处理拖拽中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 处理最大化/还原
  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      setPosition({ x: 0, y: 0 });
      setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    } else {
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
    }
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  // 处理手动调整大小
  const handleResize = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = typeof size.width === 'number' ? size.width : DEFAULT_WIDTH;
    const startHeight = typeof size.height === 'number' ? size.height : 500;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(MIN_WIDTH, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(MIN_HEIGHT, startHeight + (moveEvent.clientY - startY));
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsHoveringResize(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  }, [isMaximized, size]);

  // 处理键盘事件 - ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!type) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  // 获取详细数据数组
  const getDetailArray = (): (RateDetailItem | PressureDetailItem | SaO2DetailItem | StepCalorieDistanceDetailItem)[] => {
    if (!data?.data) return [];
    
    const responseData = data.data;
    
    switch (type) {
      case 'rate':
        return (responseData as { rate?: RateDetailItem[] }).rate || [];
      case 'pressure':
        return (responseData as { detail?: PressureDetailItem[] }).detail || [];
      case 'saO2':
        return (responseData as { detail?: SaO2DetailItem[] }).detail || [];
      case 'step':
        return (responseData as { detail?: StepCalorieDistanceDetailItem[] }).detail || [];
      case 'calorie':
        return (responseData as { detail?: StepCalorieDistanceDetailItem[] }).detail || [];
      case 'distance':
        return (responseData as { detail?: StepCalorieDistanceDetailItem[] }).detail || [];
      default:
        return [];
    }
  };

  // 获取最新数据项
  const getLatestItem = () => {
    const detailArray = getDetailArray();
    if (detailArray.length === 0) return null;
    return detailArray[0];
  };

  const latestItem = getLatestItem();

  // 获取图表数据
  const getChartData = () => {
    if (!latestItem || !('indexTimeValues' in latestItem)) return [];
    
    const timeValues = latestItem.indexTimeValues;
    if (!timeValues || timeValues.length === 0) return [];

    // 按时间排序并格式化
    return [...timeValues]
      .sort((a, b) => a.t - b.t)
      .map(item => ({
        time: formatChartTime(item.t),
        timestamp: item.t,
        value: item.v,
      }));
  };

  const chartData = getChartData();

  // 渲染统计卡片
  const renderStats = () => {
    if (!latestItem) return null;

    switch (type) {
      case 'rate': {
        const item = latestItem as RateDetailItem;
        return (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="最高心率"
              value={item.up}
              formatter={config.formatter}
              unit={config.unit}
              icon={TrendingUp}
              color="text-red-400"
            />
            <StatCard
              label="最低心率"
              value={item.down}
              formatter={config.formatter}
              unit={config.unit}
              icon={TrendingDown}
              color="text-blue-400"
            />
            <StatCard
              label="平均心率"
              value={item.average}
              formatter={config.formatter}
              unit={config.unit}
              icon={Heart}
              color="text-purple-400"
            />
          </div>
        );
      }
      case 'pressure': {
        const item = latestItem as PressureDetailItem;
        return (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="最高值"
              value={item.up}
              formatter={config.formatter}
              unit={config.unit}
              icon={TrendingUp}
              color="text-red-400"
            />
            <StatCard
              label="最低值"
              value={item.down}
              formatter={config.formatter}
              unit={config.unit}
              icon={TrendingDown}
              color="text-blue-400"
            />
            <StatCard
              label="平均值"
              value={item.average}
              formatter={config.formatter}
              unit={config.unit}
              icon={Activity}
              color="text-orange-400"
            />
          </div>
        );
      }
      case 'saO2': {
        const item = latestItem as SaO2DetailItem;
        return (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="最高血氧"
              value={item.up}
              formatter={config.formatter}
              unit={config.unit}
              icon={TrendingUp}
              color="text-green-400"
            />
            <StatCard
              label="最低血氧"
              value={item.down}
              formatter={config.formatter}
              unit={config.unit}
              icon={TrendingDown}
              color="text-yellow-400"
            />
            <StatCard
              label="平均血氧"
              value={item.average}
              formatter={config.formatter}
              unit={config.unit}
              icon={Droplets}
              color="text-cyan-400"
            />
          </div>
        );
      }
      case 'step':
      case 'calorie':
      case 'distance': {
        const item = latestItem as StepCalorieDistanceDetailItem;
        const label = type === 'step' ? '总步数' : type === 'calorie' ? '总卡路里' : '总距离';
        return (
          <div className="grid grid-cols-1 gap-3">
            <StatCard
              label={label}
              value={item.v}
              formatter={config.formatter}
              unit={config.unit}
              icon={Icon}
              color={config.color}
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  // 渲染折线图
  const renderChart = () => {
    if (chartData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}
            itemStyle={{ color: config.chartColor, fontSize: '14px', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value}${config.unit}`, '']}
            labelFormatter={(label) => `${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.chartColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: config.chartColor }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={dialogRef}
        showCloseButton={false}
        className={cn(
          "bg-black border-white/10 text-white overflow-hidden p-0",
          isDragging && "cursor-grabbing select-none",
          !isMaximized && "resize-handle"
        )}
        style={{
          width: size.width,
          height: size.height === 'auto' ? 'auto' : size.height,
          maxWidth: isMaximized ? 'calc(100vw - 40px)' : 'none',
          maxHeight: isMaximized ? 'calc(100vh - 40px)' : 'none',
          // 保留默认居中 transform，再加上拖动偏移
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          minWidth: MIN_WIDTH,
          minHeight: MIN_HEIGHT,
        }}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        {/* 可拖拽的标题栏 */}
        <div 
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5",
            !isMaximized && "cursor-grab active:cursor-grabbing"
          )}
          onMouseDown={handleDragStart}
        >
          <DialogHeader className="m-0 p-0">
            <DialogTitle className="flex items-center gap-2 text-xl select-none">
              <Icon className={config.color} size={24} />
              {config.title}
            </DialogTitle>
            <DialogDescription className="text-white/50 sr-only">
              {data?.description || '查看今日详细数据记录'}
            </DialogDescription>
          </DialogHeader>
          
          {/* 窗口控制按钮 */}
          <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={toggleMaximize}
              title={isMaximized ? "还原" : "最大化"}
            >
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-red-500/80"
              onClick={onClose}
              title="关闭 (ESC)"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <div 
          ref={contentRef}
          className="p-4 overflow-auto"
          style={{ 
            height: size.height === 'auto' ? 'auto' : `calc(${size.height}px - 60px)`,
            maxHeight: size.height === 'auto' ? '60vh' : undefined 
          }}
        >
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 bg-white/10" />
                <Skeleton className="h-20 bg-white/10" />
                <Skeleton className="h-20 bg-white/10" />
              </div>
              <Skeleton className="h-48 bg-white/10" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle size={40} className="text-red-400 mb-3" />
              <p className="text-white/60">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <ScrollArea className={size.height === 'auto' ? "max-h-[50vh]" : "h-full"}>
              {latestItem ? (
                <>
                  {/* 数据日期 */}
                  <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
                    <Clock size={14} />
                    <span>{formatDate(latestItem.t)}</span>
                    <span className="text-white/20">·</span>
                    <span>{formatRelativeTime(latestItem.t)}</span>
                  </div>

                  {/* 统计卡片区域 */}
                  <div className="rounded-2xl border border-white/10 bg-transparent p-4">
                    {renderStats()}
                  </div>

                  {/* 折线图区域 */}
                  {chartData.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-transparent p-4">
                      <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                        <Activity size={14} />
                        趋势图
                      </h4>
                      <div className="h-56 w-full">
                        {renderChart()}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity size={40} className="text-white/20 mb-3" />
                  <p className="text-white/40">暂无详细数据</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* 右下角调整大小手柄 - 仅在非最大化时显示 */}
        {!isMaximized && (
          <div
            className={cn(
              "absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-50",
              "flex items-end justify-end p-0.5",
              "hover:bg-white/10 transition-colors rounded-tl-lg",
              isHoveringResize && "bg-white/10"
            )}
            onMouseDown={handleResize}
            onMouseEnter={() => setIsHoveringResize(true)}
            onMouseLeave={() => setIsHoveringResize(false)}
            title="调整大小"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              className="text-white/40"
            >
              <path d="M11 5V11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 1V11H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
        )}

        {/* 拖动时的遮罩层 - 防止iframe或其他元素拦截鼠标事件 */}
        {isDragging && (
          <div 
            className="fixed inset-0 z-[9999] cursor-grabbing"
            style={{ pointerEvents: 'auto' }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
});

// 统计卡片组件
interface StatCardProps {
  label: string;
  value: number;
  formatter: (v: number) => string;
  unit: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, formatter, unit, icon: Icon, color }: StatCardProps) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-white/5">
      <Icon className={`${color} mb-1`} size={16} />
      <span className={`text-lg font-bold ${color}`}>
        {formatter(value)}
        {unit && <span className="text-xs ml-0.5">{unit}</span>}
      </span>
      <span className="text-xs text-white/40">{label}</span>
    </div>
  );
}

export default HealthDetailDialog;
