# Hyper-Reach Threat Monitor - Coding Rules

This project follows strict coding standards to ensure maintainability, consistency, and code quality.

## Quick Reference

| Rule | Key Principle |
|------|---------------|
| [DRY Principles](./dry-principles.md) | Never duplicate code - extract and reuse |
| [Frontend Components](./frontend-components.md) | `/components/ui` (generic) + `/components/features` (specific) |
| [Backend Patterns](./backend-patterns.md) | Generic helpers in `/lib`, consistent API patterns |
| [Styling Consistency](./styling-consistency.md) | Tailwind config + CSS variables, semantic colors |

## Folder Structure Overview

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       ├── threats/route.ts
│       └── draft/route.ts
│
├── components/
│   ├── ui/                 # Generic, reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   │
│   ├── features/           # Feature-specific components
│   │   ├── threats/
│   │   ├── drafts/
│   │   └── layout/
│   │
│   └── providers/          # React context providers
│
├── lib/
│   ├── api/                # API clients (nws, usgs, poweroutage)
│   ├── utils/              # Generic utilities
│   ├── hooks/              # Reusable React hooks
│   └── types.ts            # Shared TypeScript types
│
└── styles/
    └── globals.css         # CSS variables + Tailwind
```

## Golden Rules

### 1. Before Writing ANY Code

Ask yourself:
- Does this already exist somewhere?
- Can I make this generic/reusable?
- Am I following the established patterns?

### 2. Component Decisions

| If the component... | Put it in... |
|---------------------|--------------|
| Has no business logic, is purely UI | `/components/ui/` |
| Is feature-specific, handles data | `/components/features/{feature}/` |
| Wraps context/state for the app | `/components/providers/` |

### 3. Backend Decisions

| If the code... | Put it in... |
|----------------|--------------|
| Fetches from external API | `/lib/api/{source}.ts` |
| Transforms/formats data | `/lib/utils/transform.ts` or `format.ts` |
| Is a reusable hook | `/lib/hooks/` |
| Defines types/interfaces | `/lib/types.ts` |

### 4. Styling Decisions

- Use **Tailwind classes** for styling
- Use **semantic color names** from config (e.g., `severity-critical`, not `red-600`)
- Use **cn()** helper for conditional classes
- Extract repeated class combinations into components

## Behavior for AI / agents

- Before adding a new utility, component, or API client: **search the codebase** for an existing implementation (e.g. `lib/api/fetch.ts`, `lib/utils/errors.ts`, `components/ui/`).
- **Use existing helpers**: e.g. `errorResponse()` from `lib/utils/errors` in API routes; the generic fetch wrapper in `lib/api/fetch.ts`; UI from `components/ui`. Do not introduce a new pattern when the rules specify one.
- When in doubt, follow the patterns and folder structure in the rule files above.

## Enforcement

These rules are automatically applied by Cursor AI when:
- Generating new code
- Suggesting refactors
- Reviewing code patterns

When in doubt, check the specific rule file for detailed examples and anti-patterns.
