import { useState, useCallback } from 'react';
import axios from 'axios';
import type { HealthDetailType, HealthDetailResponse } from '@/types/health';
import { API_BASE_URL, ENDPOINTS } from '@/lib/constants';

interface UseHealthDetailReturn {
  data: HealthDetailResponse | null;
  loading: boolean;
  error: string | null;
  fetchDetail: (type: HealthDetailType) => Promise<void>;
  clearData: () => void;
}

export function useHealthDetail(): UseHealthDetailReturn {
  const [data, setData] = useState<HealthDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (type: HealthDetailType) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<HealthDetailResponse>(
        `${API_BASE_URL}${ENDPOINTS.healthDetail}?type=${type}`,
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
        setData(responseData);
        setError(null);
      } else {
        setError('获取详细数据失败');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.message || '网络请求失败');
      } else {
        setError('未知错误');
      }
      console.error('Health detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchDetail,
    clearData,
  };
}
