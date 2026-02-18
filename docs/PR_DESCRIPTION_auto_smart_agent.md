# Add Auto Smart Agent, ThreatDetailsModal, Switch UI, and send-result feedback

## Summary

- **Auto Smart AI Agent:** Header toggle; when ON, the app automatically drafts and sends a notification (email + SMS) when a critical threat appears (once per batch). Critical modal copy updates to "Critical alert sent automatically" and "I'm aware" when auto-sent.
- **ThreatDetailsModal:** New modal showing full threat details (type, severity, source, location, time, description, link); opened from threat card, list, or map. Optional `sentAt` for "Alert sent at ..." display.
- **Switch component:** New reusable `Switch` in `components/ui` for the Auto Smart Agent toggle.
- **Send-result feedback:** Notify API returns `emailConfigured` / `smsConfigured`; success view shows "Email not sent (SMTP not configured)" when email was requested but SMTP is not set.

## Context / motivation

- Reduces response time for critical threats by optionally auto-sending to staff.
- Makes it clear when email/SMS was skipped due to missing env config.

## Changes

- **page.tsx:** `autoSmartAgentOn` state, effect that calls `/api/draft` then `/api/notify` when critical appears and toggle is ON (once per batch); passes `autoSmartAgentOn` / `onAutoSmartAgentChange` to Header, `autoSentForCurrentCritical` to modal; success view shows SMTP-not-configured hint when applicable.
- **Header:** "Auto Smart AI Agent" switch; new props `autoSmartAgentOn`, `onAutoSmartAgentChange`.
- **CriticalAlertModal:** `autoSent` prop; title and body copy when auto-sent; button "I'm aware" vs "I've seen the alert".
- **api/notify:** Response includes `emailConfigured`, `smsConfigured` (and existing counts).
- **api/draft, openai:** Minor adjustments if any for draft/notify flow.
- **components/ui:** New `Switch.tsx` and export from `index.ts`.
- **ThreatDetailsModal, ThreatCard, ThreatList, ThreatMap:** ThreatDetailsModal component; card/list/map open it on click; page state for selected threat and modal visibility. NWS/USGS/openai/types/recipients: small tweaks and data updates.

## Breaking changes

None. Notify response is additive (`emailConfigured` / `smsConfigured`).

## Checklist

- [x] Feature: Auto Smart Agent, ThreatDetailsModal, Switch, send feedback
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing completed (toggle on/off, critical flow, SMTP-unconfigured message)
