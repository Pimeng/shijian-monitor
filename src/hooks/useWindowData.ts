import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { WindowApiResponse, WindowApiData, IpLocationApiResponse, IpLocationApiData } from '@/types/health';
import { API_BASE_URL, ENDPOINTS } from '@/lib/constants';

interface UseWindowDataReturn {
  data: WindowApiData | null;
  ipData: IpLocationApiData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function isDeviceOnline(accessTime: string): boolean {
  const date = new Date(accessTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  // 1分钟内活跃视为在线
  return diffMs < 1 * 60 * 1000;
}

function getAppDisplayName(app: string | null, windowTitle: string): string {
  if (app) return app;
  // 从窗口标题推断应用
  if (windowTitle.includes('Microsoft Edge')) return 'Microsoft Edge';
  if (windowTitle.includes('Chrome')) return 'Google Chrome';
  if (windowTitle.includes('Firefox')) return 'Firefox';
  if (windowTitle.includes('Code')) return 'VS Code';
  if (windowTitle.includes('WeChat') || windowTitle.includes('微信')) return '微信';
  if (windowTitle.includes('QQ')) return 'QQ';
  return '未知应用';
}

export function useWindowData(): UseWindowDataReturn {
  const [data, setData] = useState<WindowApiData | null>(null);
  const [ipData, setIpData] = useState<IpLocationApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // 同时获取窗口数据和 IP 地址数据
      const [windowResponse, ipResponse] = await Promise.all([
        axios.get<WindowApiResponse>(
          `${API_BASE_URL}${ENDPOINTS.window}`,
          { timeout: 10000 }
        ),
        axios.get<IpLocationApiResponse>(
          `${API_BASE_URL}${ENDPOINTS.ipAddress}`,
          { timeout: 10000 }
        ),
      ]);

      let windowResponseData = windowResponse.data;
      if (typeof windowResponseData === 'string') {
        try {
          windowResponseData = JSON.parse(windowResponseData);
        } catch {
          setError('窗口数据格式错误');
          return;
        }
      }

      let ipResponseData = ipResponse.data;
      if (typeof ipResponseData === 'string') {
        try {
          ipResponseData = JSON.parse(ipResponseData);
        } catch {
          setError('IP 数据格式错误');
          return;
        }
      }

      if (windowResponseData.success && windowResponseData.data) {
        setData(windowResponseData.data);
      }

      if (ipResponseData.success && ipResponseData.data) {
        setIpData(ipResponseData.data);
      }

      if (windowResponseData.success || ipResponseData.success) {
        setError(null);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.message || '网络请求失败');
      } else {
        setError('未知错误');
      }
      console.error('Window/IP data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 定期刷新
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return { data, ipData, loading, error, refresh: fetchData };
}

export { formatTimeAgo, isDeviceOnline, getAppDisplayName };
