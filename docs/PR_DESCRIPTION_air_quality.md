# Replace power-outage source with EPA AirNow air quality alerts

## Summary

Swaps the simulated power-outage data source for real **EPA AirNow** air quality (AQI) observations in the Real-Time Threat Monitor. When `AIRNOW_API_KEY` is set, the dashboard shows current AQI-based threats (Moderate and above) per state; otherwise air quality is omitted.

## Context / motivation

- Power outages were simulated only; air quality uses a real, free API and adds tangible value for emergency managers (smoke, ozone, etc.).
- Aligns with existing pattern: optional env key, same threat pipeline (threats route, map, cards, drafting).

## Changes

- **Removed:** `threat-monitor/src/lib/api/poweroutage.ts` (simulated outages).
- **Added:** `threat-monitor/src/lib/api/airquality.ts` – EPA AirNow client; fetches by state center, maps AQI to severity, returns `Threat[]`.
- **Updated:** `ThreatSource` to `'nws' | 'usgs' | 'airquality'`; `Threat` type drops `affectedCustomers`, adds `aqi`.
- **Updated:** `threat-monitor/src/app/api/threats/route.ts` to call `fetchAirQualityAlerts` instead of power-outage.
- **Updated:** UI (ThreatCard, ThreatList, Badge) and OpenAI draft prompt to handle air quality instead of outages.
- **Docs:** README and env example updated for `AIRNOW_API_KEY` (optional; free key at https://www.airnowapi.org/).

## Breaking changes

None for end users. Threat source type and payload change is internal; no persisted schema.

## Checklist

- [x] Feature: Air quality (EPA AirNow) replaces power outage
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing completed (with and without `AIRNOW_API_KEY`)
