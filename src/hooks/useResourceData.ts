"use client";

import { useState, useEffect, useCallback } from 'react';
import { ResourceWrapper } from '@/types/resource';
import { apiService, ApiError } from '@/lib/api';

interface UseResourceDataState {
  data: ResourceWrapper[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useResourceData(): UseResourceDataState {
  const [data, setData] = useState<ResourceWrapper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add a small delay to show loading state (remove in production)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await apiService.getResourceWrappers();
      setData(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch resource data');
      console.error('Error fetching resource data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
} 