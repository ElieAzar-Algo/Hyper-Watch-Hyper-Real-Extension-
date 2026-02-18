# Add critical alert lamp, modal, and optional alert sound

## Summary

When one or more **critical** threats appear, the app now:
- Shows a **pulsing red lamp** in the header; clicking it opens a modal.
- Can play an **alert sound** (custom file or built-in beep/siren) until the user acknowledges.
- Displays a **modal** listing all critical threats with an "I've seen the alert" button to acknowledge and stop the sound.

## Context / motivation

Critical threats need immediate attention. A visible indicator and optional sound help operators notice new critical alerts even when not looking at the dashboard.

## Changes

- **useCriticalAlert** hook: Tracks which critical threats are "new" (unacknowledged), exposes `hasUnacknowledgedCritical`, `criticalThreats`, and `acknowledge()`.
- **CriticalAlertLamp**: Red pulsing button in the header when there are unacknowledged critical threats; click opens the modal.
- **CriticalAlertModal**: Overlay listing critical threats with acknowledge button.
- **Alert sound**: Optional `alert.mp3` in `public/sounds/` or `NEXT_PUBLIC_CRITICAL_ALERT_SOUND` (path, or `builtin:beep` / `builtin:siren`). Plays until acknowledged; falls back to built-in beep if file missing.
- **Header**: Integrates the lamp.
- **page.tsx**: Wires hook, modal, and sound; shows modal when new critical threats appear (and can auto-open; sound starts with new critical).

## Breaking changes

None. Additive feature.

## Checklist

- [x] Feature: Critical alert lamp, modal, optional sound
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing completed (critical threat flow, acknowledge, sound on/off)
