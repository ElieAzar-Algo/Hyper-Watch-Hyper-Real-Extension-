'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Threat, ThreatsResponse } from '../types';

interface UseThreatsOptions {
  state: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface UseThreatsReturn {
  threats: Threat[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  addSimulatedThreat: (threat: Threat) => void;
}

export function useThreats({
  state,
  refreshInterval = 60000,
  autoRefresh = true,
}: UseThreatsOptions): UseThreatsReturn {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchThreats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/threats?state=${state}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch threats');
      }

      const data: ThreatsResponse = await response.json();
      
      // Preserve any simulated threats that were added
      setThreats((prevThreats) => {
        const simulatedThreats = prevThreats.filter((t) =>
          t.id.startsWith('sim-')
        );
        return [...data.threats, ...simulatedThreats];
      });
      
      setLastUpdated(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );

      if (data.errors && data.errors.length > 0) {
        console.warn('Partial fetch errors:', data.errors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  // Initial fetch and refetch on state change
  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(fetchThreats, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchThreats]);

  const addSimulatedThreat = useCallback((threat: Threat) => {
    setThreats((prev) => [threat, ...prev]);
  }, []);

  return {
    threats,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchThreats,
    addSimulatedThreat,
  };
}
