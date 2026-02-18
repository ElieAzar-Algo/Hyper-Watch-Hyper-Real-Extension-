'use client';

import { cn } from '@/lib/utils';

interface CriticalAlertLampProps {
  active: boolean;
  onClick?: () => void;
  className?: string;
}

export function CriticalAlertLamp({ active, onClick, className }: CriticalAlertLampProps) {
  if (!active) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-full bg-red-600 text-white',
        'h-4 w-4 min-w-4 min-h-4 ring-2 ring-red-200 ring-offset-2',
        'animate-pulse',
        onClick && 'cursor-pointer hover:ring-red-400 focus:outline-none focus:ring-2 focus:ring-red-500',
        className
      )}
      title="Critical threat detected – click to view"
      aria-label="Critical threat alert active"
    >
      <span className="sr-only">Critical threat alert</span>
    </button>
  );
}
