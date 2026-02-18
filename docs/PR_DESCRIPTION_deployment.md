# Add deployment guide (Vercel POC) and README links

## Summary

Adds **docs/DEPLOYMENT.md**: a step-by-step guide to deploy the Threat Monitor (Hyper Watch) to a free host for a POC demo. Covers Vercel (recommended), root directory and env setup, critical alert sound options, and optional alternatives (Render, Railway). Also updates **docs/README.md** and **threat-monitor/README.md** with links to the deployment guide and a short "Deploying (POC)" section plus critical-alert-sound tip.

## Context / motivation

- Enables teams to host a live demo without local setup.
- Single source of truth for root dir, env vars, and sound config in production.

## Changes

- **docs/DEPLOYMENT.md** (new): System assessment, Vercel steps, env table, sound (`builtin:beep` / `builtin:siren`), alternatives.
- **docs/README.md:** Link to DEPLOYMENT.md under project documentation.
- **threat-monitor/README.md:** "Copy from .env.local.example" note; "Deploying (POC)" subsection with link to DEPLOYMENT.md and critical alert sound hint.

## Breaking changes

None. Documentation only.

## Checklist

- [x] Docs: deployment guide and README links
- [ ] Manual testing completed (optional: follow guide and deploy once)
