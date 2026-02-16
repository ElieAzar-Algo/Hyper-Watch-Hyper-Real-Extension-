# Styling Consistency

## Dual Approach: Tailwind Config + CSS Variables

Use **Tailwind config** for static design tokens and **CSS variables** for dynamic/themeable values.

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom color palette
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        severity: {
          critical: '#dc2626',   // red-600
          warning: '#f59e0b',    // amber-500
          watch: '#3b82f6',      // blue-500
          advisory: '#6b7280',   // gray-500
        },
        source: {
          nws: '#0ea5e9',        // sky-500 (weather)
          usgs: '#f97316',       // orange-500 (earthquake)
          outage: '#8b5cf6',     // violet-500 (power)
        },
      },
      // Consistent spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Typography
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      // Animations
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

## CSS Variables (globals.css)

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Dynamic colors (can be changed at runtime) */
  --background: 255 255 255;
  --foreground: 15 23 42;
  --muted: 241 245 249;
  --muted-foreground: 100 116 139;
  --border: 226 232 240;
  --ring: 59 130 246;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

.dark {
  --background: 15 23 42;
  --foreground: 248 250 252;
  --muted: 30 41 59;
  --muted-foreground: 148 163 184;
  --border: 51 65 85;
}

/* Base layer overrides */
@layer base {
  body {
    @apply bg-background text-foreground;
  }
}

/* Utility classes using CSS variables */
@layer utilities {
  .bg-background {
    background-color: rgb(var(--background));
  }
  .text-foreground {
    color: rgb(var(--foreground));
  }
  .border-default {
    border-color: rgb(var(--border));
  }
  .shadow-card {
    box-shadow: var(--shadow-md);
  }
}
```

## Component Styling Patterns

### Use Tailwind classes with cn() helper

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Variant-based styling

```typescript
// components/ui/Badge.tsx
import { cn } from '@/lib/utils/cn';

const severityStyles = {
  critical: 'bg-severity-critical text-white',
  warning: 'bg-severity-warning text-white',
  watch: 'bg-severity-watch text-white',
  advisory: 'bg-severity-advisory text-white',
} as const;

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
} as const;

interface BadgeProps {
  severity: keyof typeof severityStyles;
  size?: keyof typeof sizeStyles;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ 
  severity, 
  size = 'md', 
  children, 
  className 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        severityStyles[severity],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
```

## Consistent Spacing Rules

| Context | Spacing |
|---------|---------|
| Page padding | `p-4` or `p-6` |
| Card padding | `p-4` |
| Between sections | `space-y-6` |
| Between items in list | `space-y-2` or `gap-2` |
| Icon + text | `gap-2` |
| Button padding | `px-4 py-2` |

## Typography Scale

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-bold` |
| Section title | `text-lg font-semibold` |
| Card title | `text-base font-medium` |
| Body text | `text-sm` |
| Caption/meta | `text-xs text-muted-foreground` |

## Color Usage Rules

1. **Severity colors** - ONLY for threat indicators
2. **Source colors** - ONLY for data source badges/icons
3. **Brand colors** - Primary actions, links, highlights
4. **Gray scale** - Text, backgrounds, borders

## Anti-Patterns

```tsx
// BAD: Hardcoded colors
<div className="bg-[#ff5733]">

// GOOD: Use semantic colors from config
<div className="bg-severity-critical">

// BAD: Inconsistent spacing
<div className="p-3 mb-7 mt-2">

// GOOD: Use consistent spacing scale
<div className="p-4 space-y-4">

// BAD: Duplicate class combinations
<div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow">
<div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow">

// GOOD: Extract to component or utility class
<Card className="flex items-center justify-between">
```

## Responsive Breakpoints

Use Tailwind's default breakpoints consistently:

```tsx
// Mobile-first approach
<div className="
  p-4           // mobile
  md:p-6        // tablet
  lg:p-8        // desktop
">
  <div className="
    grid 
    grid-cols-1       // mobile: single column
    md:grid-cols-2    // tablet: 2 columns
    lg:grid-cols-3    // desktop: 3 columns
    gap-4
  ">
```
