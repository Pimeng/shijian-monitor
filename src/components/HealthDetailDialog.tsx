import React, { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const HealthDetailDialog = memo(function HealthDetailDialog({
  isOpen,
  onClose,
  type,
  data,
  loading,
  error,
}: HealthDetailDialogProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-black border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon className={config.color} size={24} />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {data?.description || '查看今日详细数据记录'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
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
            <ScrollArea className="max-h-[60vh]">
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
