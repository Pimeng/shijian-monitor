import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDuolingoData } from '@/hooks/useDuolingoData';
import { Skeleton } from '@/components/ui/skeleton';

// 火花图标 URL
const FLAME_LIT_URL = 'https://d35aaqx5ub95lt.cloudfront.net/images/icons/398e4298a3b39ce566050e5c041949ef.svg';
const FLAME_EXTINCT_URL = 'https://d35aaqx5ub95lt.cloudfront.net/images/icons/65b8a029d7a148218f1ac98a198f8b42.svg';

const DuolingoCard = memo(function DuolingoCard() {
  const { data, loading, isToday, refresh } = useDuolingoData();

  const handleClick = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算续火开始日期
  const getStartDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 加载状态
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="px-4 sm:px-6 mb-6"
      >
        <div className="rounded-2xl p-5 border border-border bg-card/30">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full bg-muted" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 bg-muted mb-2" />
              <Skeleton className="h-4 w-48 bg-muted" />
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  // 无数据状态
  if (!data) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="px-4 sm:px-6 mb-6"
      >
        <div className="rounded-2xl p-5 border border-border bg-card/30">
          <div className="flex items-center gap-4">
            <img
              src={FLAME_EXTINCT_URL}
              alt="熄灭火花"
              className="w-16 h-16 opacity-50"
            />
            <div>
              <h3 className="text-lg font-semibold text-foreground/60">多邻国续火</h3>
              <p className="text-sm text-muted-foreground">暂无数据</p>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="px-4 sm:px-6 mb-6"
    >
      <motion.div
        whileHover={{ 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        onClick={handleClick}
        className={`
          rounded-2xl p-5
          bg-card/30
          border border-border
          hover:border-border/80
          transition-all duration-300
          cursor-pointer
          group
        `}
      >
        <div className="flex items-center gap-5">
          {/* 火花图标 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <img
              src={isToday ? FLAME_LIT_URL : FLAME_EXTINCT_URL}
              alt={isToday ? '燃烧的火花' : '熄灭火花'}
              className={`w-16 h-16 ${isToday ? 'drop-shadow-[0_0_12px_rgba(255,165,0,0.5)]' : 'opacity-60 grayscale'}`}
            />
            {isToday && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(255,165,0,0)',
                    '0 0 20px rgba(255,165,0,0.3)',
                    '0 0 0px rgba(255,165,0,0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>

          {/* 信息区域 */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-3xl font-bold text-foreground"
              >
                {data.length}
              </motion.span>
              <span className="text-sm text-muted-foreground">天</span>
              
              {/* 今日状态标签 */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                  ${isToday 
                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' 
                    : 'bg-muted text-muted-foreground border border-border'
                  }
                `}
              >
                {isToday ? '已学' : '未学'}
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-1 space-y-0.5"
            >
              <p className="text-xs text-muted-foreground/70">
                开始于 {getStartDate(data.startTimestamp)}
                {' · '}
                更新于 {formatDate(data.updatedTimestamp)}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
});

export default DuolingoCard;
