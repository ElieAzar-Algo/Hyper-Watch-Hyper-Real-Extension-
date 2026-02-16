/**
 * Data transformation utilities
 */

import type { Severity, Threat } from '../types';

/**
 * Severity priority mapping (higher = more severe)
 */
export const SEVERITY_PRIORITY: Record<Severity, number> = {
  critical: 4,
  warning: 3,
  watch: 2,
  advisory: 1,
};

/**
 * Generic array grouping function
 */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * Generic sorting function
 */
export function sortBy<T>(
  items: T[],
  keyFn: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Sort threats by severity (most severe first)
 */
export function sortBySeverity(threats: Threat[]): Threat[] {
  return sortBy(
    threats,
    (t) => SEVERITY_PRIORITY[t.severity] ?? 0,
    'desc'
  );
}

/**
 * Sort threats by time (most recent first)
 */
export function sortByTime(threats: Threat[]): Threat[] {
  return sortBy(
    threats,
    (t) => new Date(t.startTime).getTime(),
    'desc'
  );
}

/**
 * Group threats by source
 */
export function groupBySource(threats: Threat[]): Record<string, Threat[]> {
  return groupBy(threats, (t) => t.source);
}

/**
 * Group threats by severity
 */
export function groupBySeverity(threats: Threat[]): Record<Severity, Threat[]> {
  return groupBy(threats, (t) => t.severity);
}

/**
 * Filter threats by severity
 */
export function filterBySeverity(
  threats: Threat[],
  severities: Severity[]
): Threat[] {
  return threats.filter((t) => severities.includes(t.severity));
}

/**
 * Filter threats by source
 */
export function filterBySource(
  threats: Threat[],
  sources: string[]
): Threat[] {
  return threats.filter((t) => sources.includes(t.source));
}
