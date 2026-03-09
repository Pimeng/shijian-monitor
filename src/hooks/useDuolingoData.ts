import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { DuolingoWildfireData, DuolingoWildfireResponse } from '@/types/health';
import { API_BASE_URL, ENDPOINTS } from '@/lib/constants';

interface UseDuolingoDataReturn {
  data: DuolingoWildfireData | null;
  loading: boolean;
  error: string | null;
  isToday: boolean;
  refresh: () => Promise<void>;
}

// 判断时间戳是否为今天（基于指定时区）
function isTimestampToday(timestamp: number, timeZone: string): boolean {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  
  // 使用指定时区格式化日期
  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const todayFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return dateFormatter.format(date) === todayFormatter.format(now);
}

export function useDuolingoData(): UseDuolingoDataReturn {
  const [data, setData] = useState<DuolingoWildfireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToday, setIsToday] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get<DuolingoWildfireResponse>(
        `${API_BASE_URL}${ENDPOINTS.duolingoWildfire}`,
        { timeout: 10000 }
      );

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
        setIsToday(isTimestampToday(
          responseData.data.updatedTimestamp,
          responseData.data.updatedTimeZone
        ));
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
      console.error('Duolingo data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 定期刷新（每小时检查一次）
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 3600000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return { data, loading, error, isToday, refresh: fetchData };
}
