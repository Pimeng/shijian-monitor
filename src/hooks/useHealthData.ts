import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { HealthData, HealthApiResponse } from '@/types/health';
import { API_BASE_URL, ENDPOINTS, REFRESH_INTERVAL } from '@/lib/constants';

interface UseHealthDataReturn {
  data: HealthData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useHealthData(): UseHealthDataReturn {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<HealthApiResponse>(
        `${API_BASE_URL}${ENDPOINTS.health}`,
        { timeout: 10000 }
      );

      // 处理响应数据 - 如果返回的是字符串则解析为对象
      let responseData = response.data;
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch {
          setError('数据格式错误');
          return;
        }
      }

      if (responseData.success && responseData.data) {
        setData(responseData.data);
        setLastUpdated(new Date());
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
      console.error('Health data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
  };
}
