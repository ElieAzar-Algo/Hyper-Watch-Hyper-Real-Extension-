# Hyper Watch — Real-Time Threat Monitor  
**Product overview for Google Docs**

---

## What You Built

**Hyper Watch** is an AI-powered threat monitoring widget that turns Hyper-Reach from a reactive notification tool into a proactive early-warning system. It is a standalone web dashboard (micro-product) that:

- **Monitors public threat sources in real time** — National Weather Service (weather alerts), USGS (earthquakes), and EPA AirNow (air quality). Data is aggregated and shown in one place.
- **Shows threats on an interactive map** — Color-coded by severity; users can select a state, click threats, and see details at a glance.
- **Uses AI to draft alert messages** — When a threat is selected, the system generates a concise, actionable notification and suggests audience segments and channels (voice, SMS, email, app).
- **Supports demo and workflow** — “Simulate Threat” for demos; “Send to Hyper Watch” can notify internal staff via email/SMS when configured.

The stack is Next.js 15, React, Tailwind, Leaflet for the map, and OpenAI for drafting. It is built as a demo/POC with optional API keys (OpenAI, AirNow, SMTP, Twilio); without them, the app still runs with sensible defaults.

---

## Target Customer

- **Emergency managers** and **public safety staff** in municipalities, counties, and state agencies  
- **Crisis communicators** at utilities, schools, and healthcare organizations  
- **Hyper-Reach customers** (or prospects) who want to discover emerging threats early instead of reacting after news or social media

Anyone who needs to get critical messages to many people quickly and wants a single dashboard to see what’s happening in their region and get ready-to-edit alert drafts.

---

## Problem Solved

Today, emergency managers often learn about incidents from the same channels as the public—TV, social media, weather apps—so they start their response late. Hyper Watch addresses this by:

1. **Finding problems early** — Continuous monitoring of authoritative feeds (NWS, USGS, AirNow) so threats are flagged as they appear.  
2. **Improving response speed** — AI-generated draft messages and suggested audiences reduce the time from “we see a threat” to “we have a message ready to send.”  
3. **Clarifying next steps** — The UI highlights which threats need attention, what to say, and who to notify, streamlining the workflow from detection to sending an alert via Hyper-Reach.

So the main improvement is **workflow**: from reactive (hear about it → open Hyper-Reach → write message) to proactive (see it in Hyper Watch → review/edit draft → send via Hyper-Reach).

---

## Next Steps

- **Deploy the POC** — Deploy the `threat-monitor` app to a host (e.g. Vercel) with root directory set to `threat-monitor`, add env vars (see `docs/DEPLOYMENT.md`), and optionally set the critical-alert sound (`NEXT_PUBLIC_CRITICAL_ALERT_SOUND=builtin:beep` or `builtin:siren`).  
- **Integrate with Hyper-Reach** — Replace mock/demo flows with real Hyper-Reach API calls so “Send” actually creates or triggers campaigns in the production platform.  
- **Add authentication** — Implement user login and scoping so customers only see threats and drafts for their regions and accounts.  
- **Expand data sources** — Add more feeds (e.g. news RSS, social trends, other government APIs) and filters so users can tune what they monitor.  
- **Harden for production** — Rate limiting, error handling, logging, and uptime monitoring so the widget is reliable for 24/7 use.

---

*Hyper Watch — Real-Time Threat Monitor. Powered by Hyper-Reach.*
