# Add recipients management and optional staff notify (SMTP/Twilio)

## Summary

Adds a **Recipients** section to Hyper Watch: manage staff contacts (email/phone) and optionally send real email/SMS when using "Send to Hyper Watch" from the draft panel. When SMTP or Twilio are not configured, notifications are simulated and logged only.

## Context / motivation

- Enables demos or internal use where alerts can be sent to real staff addresses/phones.
- Recipients are stored in `threat-monitor/data/recipients.json` and editable via the new Recipients page and API.

## Changes

- **Recipients UI & API:** New `/recipients` page and `api/recipients` (CRUD) for managing staff contacts; `data/recipients.json` as file-backed store.
- **Notify:** New `api/notify` route and `lib/notify` (email via SMTP, SMS via Twilio). Used when user clicks "Send to Hyper Watch" with selected recipients.
- **Header:** Updated with navigation (e.g. link to Recipients); "Send to Hyper Watch" can dispatch to configured staff when env is set.
- **Env:** Optional `EMAIL_*`, `SMTP_*`, `TWILIO_*` in `.env.local`; README updated with env example and note that without them, staff notify is simulated.

## Breaking changes

None. All new behavior is additive; existing flow works without any new env vars.

## Checklist

- [x] Feature: Recipients management and optional staff notify
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing completed (with and without SMTP/Twilio)
