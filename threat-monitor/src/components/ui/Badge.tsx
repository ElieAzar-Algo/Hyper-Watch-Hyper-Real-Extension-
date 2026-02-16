'use client';

import { cn } from '@/lib/utils';
import type { Severity, ThreatSource } from '@/lib/types';

const severityStyles: Record<Severity, string> = {
  critical: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  watch: 'bg-blue-500 text-white',
  advisory: 'bg-gray-500 text-white',
};

const sourceStyles: Record<ThreatSource, string> = {
  nws: 'bg-sky-500 text-white',
  usgs: 'bg-orange-500 text-white',
  outage: 'bg-violet-500 text-white',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
} as const;

interface BadgeProps {
  variant?: 'severity' | 'source' | 'default';
  severity?: Severity;
  source?: ThreatSource;
  size?: keyof typeof sizeStyles;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  severity,
  source,
  size = 'md',
  children,
  className,
}: BadgeProps) {
  let colorStyle = 'bg-gray-200 text-gray-800';

  if (variant === 'severity' && severity) {
    colorStyle = severityStyles[severity];
  } else if (variant === 'source' && source) {
    colorStyle = sourceStyles[source];
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full uppercase tracking-wide',
        colorStyle,
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
