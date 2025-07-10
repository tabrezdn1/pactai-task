"use client";

import { useState, useEffect, useCallback } from 'react';
import { ResourceWrapper } from '@/types/resource';
import { apiService, ApiError } from '@/lib/api';

interface UseResourceDataState {
  data: ResourceWrapper[];
  loading: boolean;
  error: string | null;
  progress: number; // 0-100 percentage of current fetch
  /**
   * Refetch the resource list.
   * @param count Optional number of records to fetch. If omitted, the hook will
   *              use the **last successfully requested** count.
   */
  refetch: (count?: number) => Promise<void>;
}

export function useResourceData(initialCount: number = 100): UseResourceDataState {
  const [data, setData] = useState<ResourceWrapper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(initialCount);
  const [progress, setProgress] = useState<number>(0);

  const fetchData = useCallback(
    async (count: number = currentCount) => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Add a small delay to show loading state (remove in production)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const response = await apiService.getResourceWrappers(count, (p) => setProgress(p));
        setData(response.data);
        // Persist the most recently used count so subsequent refetches use it
        setCurrentCount(count);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to fetch resource data");
        console.error("Error fetching resource data:", err);
      } finally {
        setProgress(100);
        setLoading(false);
      }
    },
    [currentCount]
  );

  // Initial fetch
  useEffect(() => {
    fetchData(initialCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to fire once on mount
  }, []);

  return {
    data,
    loading,
    error,
    progress,
    refetch: fetchData,
  };
} 