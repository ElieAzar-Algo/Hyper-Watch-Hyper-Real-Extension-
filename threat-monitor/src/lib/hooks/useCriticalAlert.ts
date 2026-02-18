'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Threat } from '../types';

export interface UseCriticalAlertReturn {
  hasUnacknowledgedCritical: boolean;
  criticalThreats: Threat[];
  acknowledge: () => void;
}

export function useCriticalAlert(threats: Threat[]): UseCriticalAlertReturn {
  const [hasUnacknowledgedCritical, setHasUnacknowledgedCritical] = useState(false);
  const acknowledgedIdsRef = useRef<Set<string>>(new Set());

  const criticalThreats = threats.filter((t) => t.severity === 'critical');
  const criticalIds = criticalThreats.map((t) => t.id);

  const criticalIdsKey = [...criticalIds].sort().join(',');

  useEffect(() => {
    if (criticalIds.length === 0) {
      setHasUnacknowledgedCritical(false);
      return;
    }

    const hasNewCritical = criticalIds.some((id) => !acknowledgedIdsRef.current.has(id));
    if (hasNewCritical) {
      setHasUnacknowledgedCritical(true);
    }
  }, [criticalIds, criticalIdsKey]);

  const acknowledge = useCallback(() => {
    criticalIds.forEach((id) => acknowledgedIdsRef.current.add(id));
    setHasUnacknowledgedCritical(false);
  }, [criticalIds]);

  return {
    hasUnacknowledgedCritical,
    criticalThreats,
    acknowledge,
  };
}
