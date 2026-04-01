import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/sections/Header';
import DeviceWindow from '@/sections/DeviceWindow';
import DuolingoCard from '@/sections/DuolingoCard';
import HealthGrid from '@/sections/HealthGrid';
import Footer from '@/sections/Footer';
import { useHealthData } from '@/hooks/useHealthData';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';


function App() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data, loading, error, lastUpdated, refresh } = useHealthData();

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 背景渐变 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[128px]" />
      </div>

      {/* 主内容 */}
      <div className="relative max-w-3xl mx-auto">
        <Header 
          onRefresh={handleRefresh}
          isRefreshing={loading}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        <DeviceWindow />

        <DuolingoCard />

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="px-4 sm:px-6 mb-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-600 dark:text-red-200">获取数据失败</p>
                  <p className="text-xs text-red-500/70 dark:text-red-300/70 truncate">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-red-600 hover:text-red-700 hover:bg-red-500/10 dark:text-red-300 dark:hover:text-red-200"
                >
                  重试
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <HealthGrid 
          data={data} 
          loading={loading}
          viewMode={viewMode}
          onRefresh={handleRefresh}
        />

        <Footer lastUpdated={lastUpdated} />
      </div>
    </div>
  );
}

export default App;
