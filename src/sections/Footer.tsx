import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FooterProps {
  lastUpdated: Date | null;
}

const Footer = memo(function Footer({ lastUpdated }: FooterProps) {
  const formatTime = (date: Date | null): string => {
    if (!date) return '从未';
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="py-6 px-4 sm:px-6 text-center"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <span>数据来自</span>
          <span className="text-white/60 font-medium">vivo 健康</span>
          <span>·</span>
          <span className="text-white/60 font-medium">皮梦视奸网</span>
        </div>
        
        <span className="hidden sm:inline text-white/20">·</span>
        
        <div className="flex items-center gap-1.5">
          <span>最后更新:</span>
          <span className="text-white/60 font-mono">
            {formatTime(lastUpdated)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-white/40">
        <span><a href="http://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">粤ICP备2025410684号-2</a></span>
        <span>·</span>
        <span><a href="https://beian.mps.gov.cn/#/query/webSearch?code=44538102000130" target="_blank" rel="noopener noreferrer">粤公网安备44538102000130号</a></span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-white/20">
        <span>Made with</span>
        <Heart size={10} className="text-red-400/60 fill-red-400/60" />
        <span>for 皮梦</span>
      </div>
    </motion.footer>
  );
});

export default Footer;
