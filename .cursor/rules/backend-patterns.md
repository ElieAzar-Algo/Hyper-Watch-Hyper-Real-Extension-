# Backend Patterns - Reusable Utilities

## Folder Structure

```
lib/
├── api/                   # API client helpers
│   ├── fetch.ts           # Generic fetch wrapper
│   ├── nws.ts             # NWS-specific client
│   ├── usgs.ts            # USGS-specific client
│   └── poweroutage.ts     # Power outage client
│
├── utils/                 # Generic utility functions
│   ├── format.ts          # Formatting helpers (dates, numbers)
│   ├── transform.ts       # Data transformation helpers
│   ├── validation.ts      # Input validation helpers
│   └── errors.ts          # Error handling utilities
│
├── hooks/                 # React hooks (frontend shared)
│   ├── useFetch.ts
│   ├── useDebounce.ts
│   └── useInterval.ts
│
└── types.ts               # Shared TypeScript interfaces
```

## Generic Fetch Wrapper

Create ONE fetch wrapper used by all API clients:

```typescript
// lib/api/fetch.ts
interface FetchOptions extends RequestInit {
  timeout?: number;
}

interface APIError extends Error {
  status?: number;
  data?: unknown;
}

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    if (!response.ok) {
      const error: APIError = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Specialized versions
export const getJSON = <T>(url: string) => apiFetch<T>(url);

export const postJSON = <T>(url: string, data: unknown) =>
  apiFetch<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
```

## API Client Pattern

Each external API gets its own client that uses the generic fetch:

```typescript
// lib/api/nws.ts
import { apiFetch } from './fetch';
import type { NWSAlert, Threat } from '../types';

const NWS_BASE = 'https://api.weather.gov';

export async function fetchNWSAlerts(state: string): Promise<Threat[]> {
  const data = await apiFetch<{ features: NWSAlert[] }>(
    `${NWS_BASE}/alerts/active?area=${state}`
  );
  
  return data.features.map(normalizeNWSAlert);
}

// Private transformation function
function normalizeNWSAlert(alert: NWSAlert): Threat {
  return {
    id: alert.id,
    source: 'nws',
    type: alert.properties.event,
    severity: mapNWSSeverity(alert.properties.severity),
    // ... normalize to common Threat interface
  };
}
```

## Data Transformation Helpers

Create reusable transformers:

```typescript
// lib/utils/transform.ts

// Generic array grouping
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

// Generic sorting
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

// Severity priority mapping (reused across sources)
export const SEVERITY_PRIORITY: Record<string, number> = {
  critical: 4,
  warning: 3,
  watch: 2,
  advisory: 1,
};

export function sortBySeverity<T extends { severity: string }>(threats: T[]): T[] {
  return sortBy(threats, (t) => SEVERITY_PRIORITY[t.severity] ?? 0, 'desc');
}
```

## Formatting Utilities

```typescript
// lib/utils/format.ts

export function formatDate(date: string | Date, style: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  return style === 'short'
    ? d.toLocaleDateString()
    : d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCustomers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}
```

## Error Handling

```typescript
// lib/utils/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleAPIError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
}

// For API routes
export function errorResponse(error: unknown) {
  const appError = handleAPIError(error);
  return Response.json(
    { error: appError.message, code: appError.code },
    { status: appError.status }
  );
}
```

## API Route Pattern

API routes must use `errorResponse()` from `lib/utils/errors` for error handling; do not create new error-response shapes.

Consistent structure for all Next.js API routes:

```typescript
// app/api/threats/route.ts
import { fetchNWSAlerts } from '@/lib/api/nws';
import { fetchUSGSEarthquakes } from '@/lib/api/usgs';
import { fetchPowerOutages } from '@/lib/api/poweroutage';
import { sortBySeverity } from '@/lib/utils/transform';
import { errorResponse } from '@/lib/utils/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') ?? 'CA';
    
    // Fetch all sources in parallel
    const [weather, earthquakes, outages] = await Promise.all([
      fetchNWSAlerts(state),
      fetchUSGSEarthquakes(state),
      fetchPowerOutages(state),
    ]);
    
    // Merge and sort
    const threats = sortBySeverity([...weather, ...earthquakes, ...outages]);
    
    return Response.json({ threats });
  } catch (error) {
    return errorResponse(error);
  }
}
```

## Type Definitions

Keep all shared types in one place:

```typescript
// lib/types.ts

export type ThreatSource = 'nws' | 'usgs' | 'outage';
export type Severity = 'critical' | 'warning' | 'watch' | 'advisory';
export type Channel = 'sms' | 'voice' | 'email' | 'app';

export interface Threat {
  id: string;
  source: ThreatSource;
  type: string;
  severity: Severity;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    areaDesc: string;
  };
  startTime: string;
  endTime?: string;
  affectedCustomers?: number;
  raw?: unknown;
}

export interface DraftResponse {
  message: string;
  audiences: string[];
  channels: Channel[];
}
```
