'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, className, ...props }, ref) => {
    return (
      <label className={cn('relative inline-flex cursor-pointer items-center', className)}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'relative h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5',
            'after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm',
            'after:transition-transform after:duration-200 peer-checked:after:translate-x-4',
            'peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';
