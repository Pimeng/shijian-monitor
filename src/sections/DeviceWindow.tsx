import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, MapPin } from 'lucide-react';
import { useWindowData, formatTimeAgo, isDeviceOnline, getAppDisplayName } from '@/hooks/useWindowData';
import { Skeleton } from '@/components/ui/skeleton';

const DeviceWindow = memo(function DeviceWindow() {
  const { data, ipData, loading, refresh } = useWindowData();

  const handleClick = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // 加载状态
  if (loading && !data) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="px-4 sm:px-6 mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl p-4 border border-border bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl bg-muted" />
                <div>
                  <Skeleton className="h-4 w-24 bg-muted mb-1" />
                  <Skeleton className="h-3 w-12 bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 bg-muted" />
                <Skeleton className="h-10 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  // 错误或无数据状态，使用默认数据
  const pcData = data?.pc || {
    machine: 'pimeng-pc',
    window_title: '未知',
    app: null,
    access_time: new Date().toISOString(),
  };
  
  const mobileData = data?.mobile || {
    machine: 'pimeng-iq13',
    window_title: '未知',
    app: null,
    access_time: new Date().toISOString(),
  };

  // IP 地理位置数据
  const pcIpData = ipData?.pc;
  const mobileIpData = ipData?.mobile;

  const devices = [
    {
      id: 'pc',
      name: '皮梦の电脑',
      icon: Monitor,
      data: pcData,
    },
    {
      id: 'mobile',
      name: '皮梦の手机',
      icon: Smartphone,
      data: mobileData,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="px-4 sm:px-6 mb-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map((device, index) => {
          const Icon = device.icon;
          const isOnline = isDeviceOnline(device.data.access_time);
          const lastSeen = formatTimeAgo(device.data.access_time);
          const appName = getAppDisplayName(device.data.app, device.data.window_title);
          
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1 + 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              onClick={handleClick}
              className={`
                rounded-2xl p-4
                bg-card/30
                border border-border
                hover:border-border/80
                transition-all duration-300
                cursor-pointer
                group
              `}
            >
              {/* 设备头部 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isOnline 
                      ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' 
                      : 'bg-muted text-muted-foreground'
                    }
                    transition-colors duration-300
                  `}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isOnline ? (
                        <>
                          <span className="text-xs text-emerald-500 dark:text-emerald-400">在线</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">离线</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 状态指示器 */}
                <div className={`
                  w-2 h-2 rounded-full
                  ${isOnline 
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                    : 'bg-muted-foreground/30'
                  }
                  animate-pulse
                `} />
              </div>

              {/* 电脑端：在线时显示详情，离线时显示已关机 */}
              {device.id === 'pc' && (
                <>
                  {isOnline ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            设备名称
                          </p>
                          <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={device.data.machine}>
                            {device.data.machine}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            当前应用
                          </p>
                          <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={appName}>
                            {appName}
                          </p>
                        </div>
                      </div>
                      {/* 窗口标题 */}
                      <div className="mt-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          窗口标题
                        </p>
                        <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={device.data.window_title}>
                          {device.data.window_title}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-3xl font-medium text-foreground/80">
                        已关机
                      </p>
                    </div>
                  )}
                  {/* 地理位置 */}
                  {pcIpData?.location && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-sky-500 dark:text-sky-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            位置
                          </p>
                          <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={`${pcIpData.location.province}, ${pcIpData.location.city}`}>
                            {pcIpData.location.province}, {pcIpData.location.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 手机端：正常时显示设备名称和窗口标题，息屏时显示大字 */}
              {device.id === 'mobile' && (
                <>
                  {!(device.data.window_title.startsWith('Android 系统 - ') || device.data.window_title.startsWith('指纹UI - ') || device.data.window_title.startsWith('系统界面 - ')) ? (
                    <>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            设备名称
                          </p>
                          <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={device.data.machine}>
                            {device.data.machine}
                          </p>
                        </div>
                      </div>
                      {/* 窗口标题 */}
                      <div className="mt-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          窗口标题
                        </p>
                        <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={device.data.window_title}>
                          {device.data.window_title}
                        </p>
                      </div>
                      {/* 地理位置 */}
                      {mobileIpData?.location && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-sky-500 dark:text-sky-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                位置
                              </p>
                              <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={`${mobileIpData.location.province}, ${mobileIpData.location.city}`}>
                                {mobileIpData.location.province}, {mobileIpData.location.city}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center py-4">
                        <p className="text-3xl font-medium text-foreground/80">
                          已息屏
                        </p>
                      </div>
                      {/* 地理位置 */}
                      {mobileIpData?.location && (
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-sky-500 dark:text-sky-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                位置
                              </p>
                              <p className="text-sm font-medium text-foreground/90 mt-0.5 truncate" title={`${mobileIpData.location.province}, ${mobileIpData.location.city}`}>
                                {mobileIpData.location.province}, {mobileIpData.location.city}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* 最后活跃时间 */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  最后活跃: {lastSeen}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
});

export default DeviceWindow;
