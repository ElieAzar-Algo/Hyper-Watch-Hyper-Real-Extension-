---
description: Frontend component structure and placement
globs: ["**/components/**", "**/app/**/*.tsx"]
---

# Frontend Component Architecture

## Folder Structure

```
components/
├── ui/                    # Shared, generic UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Spinner.tsx
│   └── index.ts           # Barrel export
│
├── features/              # Feature-specific components
│   ├── threats/
│   │   ├── ThreatCard.tsx
│   │   ├── ThreatList.tsx
│   │   └── ThreatMap.tsx
│   ├── drafts/
│   │   ├── DraftPanel.tsx
│   │   └── AudienceSelector.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── PageLayout.tsx
│
└── providers/             # Context providers
    └── ThemeProvider.tsx
```

## Component Classification Rules

- Prefer existing components from `components/ui` (and their barrel export); only add or extend when no suitable component exists.

### `/components/ui/` - Generic UI Components

Place here if the component:
- Has NO business logic
- Is purely presentational
- Can be used anywhere in the app
- Accepts props for customization (variants, sizes, etc.)

**Examples**: Button, Card, Modal, Badge, Input, Tooltip, Dropdown

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  // Generic, reusable implementation
};
```

### `/components/features/` - Feature Components

Place here if the component:
- Contains business/domain logic
- Is specific to a feature
- Composes multiple UI components
- Handles data fetching or state

**Examples**: ThreatCard, DraftPanel, AudienceSelector

```typescript
// components/features/threats/ThreatCard.tsx
interface ThreatCardProps {
  threat: Threat;
  onSelect: (threat: Threat) => void;
}

export const ThreatCard = ({ threat, onSelect }: ThreatCardProps) => {
  // Uses UI components: Card, Badge, Button
  // Contains threat-specific logic
};
```

## Composition Over Duplication

### BAD: Duplicating layout in every page

```typescript
// page1.tsx
<div className="min-h-screen bg-gray-100">
  <Header />
  <main className="container mx-auto p-4">{content}</main>
</div>

// page2.tsx - DUPLICATED!
<div className="min-h-screen bg-gray-100">
  <Header />
  <main className="container mx-auto p-4">{content}</main>
</div>
```

### GOOD: Create reusable layout

```typescript
// components/features/layout/PageLayout.tsx
export const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-100">
    <Header />
    <main className="container mx-auto p-4">{children}</main>
  </div>
);

// page1.tsx
<PageLayout>{content}</PageLayout>

// page2.tsx
<PageLayout>{content}</PageLayout>
```

## Props Design Guidelines

1. **Use TypeScript interfaces** for all props
2. **Provide sensible defaults** for optional props
3. **Use variant props** instead of boolean flags
4. **Forward refs** when wrapping native elements
5. **Spread remaining props** to allow customization

```typescript
// GOOD: Well-designed component props
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

## Barrel Exports

Always create `index.ts` files for clean imports:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';
export { Badge } from './Badge';

// Usage in other files
import { Button, Card, Badge } from '@/components/ui';
```

## Custom Hooks for Shared Logic

Extract shared component logic into hooks:

```typescript
// lib/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// lib/hooks/useFetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // ... reusable fetch logic
}
```
