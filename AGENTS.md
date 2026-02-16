# AGENTS.md

This file orients AI agents working on this codebase.

## Company overview

Hyper-Reach operates in the emergency mass notification and crisis communication sector. Their platform helps municipalities, public safety agencies, utilities, schools, and other organizations rapidly reach large audiences during emergencies. Hyper-Reach is a mass notification platform that sends alerts via voice calls, SMS, email, and mobile apps. Customers use it for emergency alerts, utility outage notifications, school communications, public health updates, and internal crisis messaging. The core value proposition is speed, reliability, and compliance—the system an organization uses when they need to get a critical message to thousands of people quickly.

## This project

**Name:** Real-Time Threat Monitor (standalone feature)

**Problem:** Emergency managers often find out about incidents from the same places everyone else does—news, social media, weather services.

**Solution:** An AI tool that continuously monitors publicly available sources (National Weather Service APIs, USGS earthquake feeds, public news RSS feeds, social media trends) and automatically flags emerging threats relevant to a user's region. When a threat is detected, it drafts a recommended alert message and suggests which audience segments to notify.

**Outcome:** This turns Hyper-Reach from a tool you use after you know about a problem into one that helps you find problems early.

## Domain terms

Use these terms consistently in code, copy, and UI:

- **Threat** – An event from monitored sources (NWS, USGS, etc.) that may require an alert.
- **Draft** – AI-generated alert message and suggested audiences/channels; user can edit before sending.
- **Hyper Watch** – Product name for this Real-Time Threat Monitor UI.
- **Hyper-Reach** – The underlying mass-notification platform; use in taglines like "Powered by Hyper-Reach".

## Where to look

- **Coding standards and patterns:** [.cursor/rules/README.md](.cursor/rules/README.md)
- Follow the rules there (DRY, frontend components, backend patterns, styling consistency) and the folder structure they describe: `lib/api/`, `components/ui/`, `components/features/`, etc.

## Conventions for agents

- Read the rules README before adding or refactoring code.
- Reuse existing utilities and components (e.g. `lib/api/fetch.ts`, `errorResponse()` from `lib/utils/errors`, UI from `components/ui`).
- When adding data sources or features, follow existing patterns: API clients in `lib/api/`, feature components in `components/features/`. API routes should use `errorResponse()` from `lib/utils/errors` for consistent error handling.

## Out of scope

- This app does not implement user auth or real Hyper-Reach API integration (demo/mock only).
- Do not add features outside the Threat Monitor (e.g. other Hyper-Reach products) unless the user asks.
