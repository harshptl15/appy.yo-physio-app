import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchJson } from '../utils/http';

export function useDashboardSummary(initialData) {
  const [dashboardData, setDashboardData] = useState(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData?.metrics);
  const [error, setError] = useState('');
  const refreshTimerRef = useRef(null);
  const hasMetricsRef = useRef(Boolean(initialData?.metrics));

  const refresh = useCallback(async () => {
    try {
      setError('');
      if (!hasMetricsRef.current) {
        setIsLoading(true);
      }

      const payload = await fetchJson('/api/dashboard/summary', {
        method: 'GET'
      });

      setDashboardData(payload);
      hasMetricsRef.current = Boolean(payload?.metrics);
    } catch (err) {
      const message = err?.message || 'Unable to load dashboard summary.';
      if (message.includes('Cannot GET /api/dashboard/summary')) {
        setError('Dashboard API route was not found. Ensure the backend server is running and the dev proxy is configured.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    refreshTimerRef.current = window.setInterval(() => {
      refresh();
    }, 30000);

    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
      }
    };
  }, [refresh]);

  return {
    dashboardData,
    isLoading,
    error,
    refresh
  };
}
