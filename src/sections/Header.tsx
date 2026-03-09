import { memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const Header = memo(function Header({ 
  onRefresh, 
  isRefreshing, 
  viewMode, 
  onViewModeChange 
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center justify-between py-6 px-4 sm:px-6"
    >
      {/* 标题区域 */}
      <div>
        <motion.h1 
          className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Pimeng Alive?
        </motion.h1>
        <motion.p 
          className="text-sm text-white/50 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ALIVE.07210700.XYZ
        </motion.p>
      </div>

      {/* 操作按钮 */}
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* 视图切换 */}
        <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => onViewModeChange('list')}
          >
            <List size={16} />
          </Button>
        </div>

        {/* 刷新按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={isRefreshing ? { 
              duration: 1, 
              repeat: Infinity, 
              ease: 'linear' 
            } : {}}
          >
            <RefreshCw size={18} />
          </motion.div>
        </Button>
      </motion.div>
    </motion.header>
  );
});

export default Header;
