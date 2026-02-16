## Summary

Adds the Real-Time Threat Monitor: dashboard, NWS/USGS/power-outage feeds, interactive map, and AI-powered alert drafting.

## Context / motivation

Emergency managers often learn about incidents from the same channels as everyone else. This feature turns Hyper-Reach into a proactive tool by continuously monitoring public threat sources and surfacing relevant alerts with AI-drafted notification messages. See `AGENTS.md` and `threat-monitor/README.md` for project context.

## Changes

- **New Next.js app** under `threat-monitor/` (App Router, Tailwind, Leaflet, OpenAI).
- **API routes**: `threat-monitor/src/app/api/threats/route.ts`, `threat-monitor/src/app/api/draft/route.ts`.
- **Data sources**: NWS (weather alerts), USGS (earthquakes), power-outage (simulated); see `threat-monitor/src/lib/api/`.
- **UI**: Interactive map, threat list/cards, draft panel, state filter, "Simulate Threat" and "Send to Hyper-Reach" (mock flow).

## Breaking changes

None. Additive feature; optional `OPENAI_API_KEY` in `.env.local` for AI drafting.

## Screenshots

_Add 1–2 screenshots of the dashboard and draft panel if available._

---

## Checklist

- [ ] Real-Time Threat Monitor feature (dashboard, map, AI drafting)
- [ ] Manual testing completed
