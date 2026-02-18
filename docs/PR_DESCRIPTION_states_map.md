# Add all 50 state centers/bounds and state-wide map markers

## Summary

- **STATE_CENTERS** and **STATE_BOUNDS** now include all 50 US states (plus DC if present), so map centering and USGS/NWS state-scoped queries work for every state.
- **ThreatMap** shows state-wide alerts that have no exact coordinates (e.g. NWS state-wide alerts): grouped by severity as square markers with count, with a popup listing alerts; threats with exact location keep circular markers.

## Context / motivation

- Previously only a subset of states had center/bounds; users in other states had degraded or incorrect map/query behavior.
- Some threats (e.g. state-wide weather alerts) don't have a single lat/lng; they were either dropped or shown at (0,0). Now they are grouped per severity and shown as one marker per severity with a count and clickable list.

## Changes

- **types.ts:** `STATE_CENTERS` expanded to all 50 states (lat, lng, zoom).
- **usgs.ts:** `STATE_BOUNDS` expanded to all 50 states (minlat, maxlat, minlon, maxlon) for earthquake bbox queries.
- **ThreatMap.tsx:** Threats with `lat === 0 && lng === 0` are treated as state-wide; grouped by severity; rendered as square markers with count; popup lists alerts and allows selecting one to open the draft panel.

## Breaking changes

None. Additive and backward-compatible.

## Checklist

- [x] Feature: All states support + state-wide map markers
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing completed (multiple states, state-wide vs point threats)
