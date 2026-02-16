# DRY Principles - Don't Repeat Yourself

## Core Rule

**NEVER duplicate code.** If you find yourself writing similar code twice, extract it into a reusable abstraction.

## When to Extract

1. **Identical code appears twice** → Extract immediately
2. **Similar code with minor variations** → Create a generic version with parameters
3. **Same pattern across files** → Create a shared utility/component

## Extraction Hierarchy

### Frontend
1. **UI Pattern repeats** → Create component in `/components/ui/`
2. **Feature logic repeats** → Create custom hook in `/lib/hooks/`
3. **Data fetching repeats** → Create API helper in `/lib/api/`
4. **Styling repeats** → Create Tailwind class or CSS variable

### Backend
1. **API logic repeats** → Create helper in `/lib/utils/`
2. **Data transformation repeats** → Create transformer function
3. **Validation repeats** → Create validation schema/function
4. **Error handling repeats** → Create error handler utility

## Anti-Patterns to Avoid

```typescript
// BAD: Copy-pasting similar fetch calls
const fetchWeather = async () => {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

const fetchEarthquakes = async () => {
  const res = await fetch('/api/earthquakes');
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

// GOOD: Generic fetch helper
const fetchAPI = async <T>(endpoint: string): Promise<T> => {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
};

// Usage
const weather = await fetchAPI<Weather>('/api/weather');
const earthquakes = await fetchAPI<Earthquake[]>('/api/earthquakes');
```

## Checklist Before Writing Code

- [ ] Search the codebase for an existing implementation (util, component, or API helper) that already does this or can be extended.
- [ ] Does similar code already exist in the codebase?
- [ ] Can this be made generic to handle multiple use cases?
- [ ] Is there a shared utility that can be extended?
- [ ] Will I need this same logic elsewhere?

## Exceptions

- **Premature abstraction**: Don't abstract on first use. Wait for the second occurrence.
- **Over-generalization**: Don't make things so generic they become hard to understand.
- **Performance-critical code**: Sometimes duplication is acceptable for performance.
