# Deploy Hyper Watch to a Free Host (POC Demo)

This guide describes how to deploy the Real-Time Threat Monitor (Hyper Watch) to a free host for a proof-of-concept demo.

## System assessment

| Item        | Details                                                                        |
| ----------- | ------------------------------------------------------------------------------ |
| **App**     | Next.js 15 (React 18, TypeScript) in `threat-monitor/`                         |
| **Build**   | `npm run build` then `npm run start` (or host runs this)                       |
| **Runtime** | Node server required (API routes: `/api/threats`, `/api/draft`, `/api/notify`) |
| **Data**    | No database; NWS/USGS are public APIs. Optional: OpenAI, AirNow, SMTP, Twilio |

**Requirements for deployment:**

- Node 18+ (Next 15 and ESLint deps expect ^18.18 or ^20.9+).
- All config via **environment variables** (no `.env` committed; `threat-monitor/.gitignore` ignores `.env*`).
- Static assets under `threat-monitor/public/` are served as-is (including `/sounds/` if you add files).

---

## Recommended free host: Vercel

- **Why:** Native Next.js support, zero config, free tier, env UI, deploy from Git.
- **Limits (free):** Bandwidth and build minutes are sufficient for a POC; serverless cold starts may add a short delay on first request.

**Alternatives:** Render (free Web Service), Railway (free tier with limits). Both support Next.js and env vars; you set root to `threat-monitor` and build command `npm run build`, start `npm run start` (or their Next.js preset).

### Railway

Railway (Railpack) must build the app in `threat-monitor/`. You can do either of the following:

1. **Set Root Directory (recommended):** In the Railway dashboard, open your service → **Settings** → **Source** (or **Build**) → set **Root Directory** to `threat-monitor`. Then Railpack will run in that folder and detect Node/Next.js.

2. **Build from repo root:** The repository root contains a `package.json` that delegates `install`, `build`, and `start` to `threat-monitor/`. If you do not set Root Directory, Railpack will see this file, detect Node, and run `npm install` / `npm run build` / `npm run start` at root; those scripts install and run the app from `threat-monitor/`, so the deploy still works.

The app sets DNS to prefer IPv4 at startup so SMTP and Twilio work from cloud runtimes (e.g. Railway) where IPv6 may be unreachable.

---

## Deployment process (high level)

1. **Push to GitHub**  
   Ensure the repo is pushed so the host can clone it.

2. **Connect and set root**
   - Sign up at [vercel.com](https://vercel.com) and connect your GitHub account.
   - Import the repo.
   - Set **Root Directory** to `threat-monitor` (so `package.json` and `next.config.ts` are at the root of the build).

3. **Build settings (usually auto-detected)**
   - Build Command: `npm run build`
   - Output: default (Vercel detects Next.js)
   - Install Command: `npm install`

4. **Add environment variables** in the Vercel project (Settings → Environment Variables). Use the same names as in `threat-monitor/.env.local.example`. See section below.

5. **Deploy**  
   Trigger a deploy (e.g. from main branch). Vercel will build and host the app; you get a URL like `https://your-project.vercel.app`.

---

## Configuration (environment variables)

Set these in the host's dashboard (e.g. Vercel → Project → Settings → Environment Variables). Use **Production** (and optionally Preview) as needed.

| Variable                                                                   | Required for POC? | What to set                                                                                                                         |
| -------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **NEXT_PUBLIC_CRITICAL_ALERT_SOUND**                                       | Recommended       | `builtin:beep` or `builtin:siren` (no file). Or leave unset to use `/sounds/alert.mp3` only if you add that file (see Sound below). |
| **OPENAI_API_KEY**                                                         | No                | Omit for demo; draft uses a default response. For real AI drafts, set a key.                                                        |
| **AIRNOW_API_KEY**                                                         | No                | Omit to skip air quality; get a free key at [airnowapi.org](https://www.airnowapi.org/) to enable.                                  |
| **EMAIL_FROM**, **SMTP_HOST**, **SMTP_PORT**, **SMTP_USER**, **SMTP_PASS** | No                | Omit for demo; "Notify" will simulate email.                                                                                        |
| **TWILIO_ACCOUNT_SID**, **TWILIO_AUTH_TOKEN**, **TWILIO_FROM_NUMBER**       | No                | Omit for demo; "Notify" will simulate SMS.                                                                                          |

**Minimal POC:** You can deploy with **no** env vars. For a reliable critical-alert sound without adding files, set **one** variable:

- `NEXT_PUBLIC_CRITICAL_ALERT_SOUND=builtin:beep`  
  or  
- `NEXT_PUBLIC_CRITICAL_ALERT_SOUND=builtin:siren`

Anything prefixed with `NEXT_PUBLIC_` is embedded at build time; change it and redeploy to take effect.

---

## Sound notification and deployment

- **Current behavior:** For an unacknowledged critical alert, the app plays sound based on `NEXT_PUBLIC_CRITICAL_ALERT_SOUND` (default `/sounds/alert.mp3`). If that file fails to load, it falls back to a built-in beep.
- **In the repo:** `threat-monitor/public/sounds/` contains only a README; there is **no** `alert.mp3` committed.

**Options for deployment:**

1. **Use built-in sound (simplest)**
   - In the host's env, set:  
     `NEXT_PUBLIC_CRITICAL_ALERT_SOUND=builtin:beep` or `builtin:siren`
   - No file needed; works on any host.
   - **Nothing else to do** for sound on your end.

2. **Use a custom MP3**
   - Add an MP3 (e.g. `alert.mp3`) under `threat-monitor/public/sounds/`.
   - Commit and push so it's in the repo.
   - Either leave `NEXT_PUBLIC_CRITICAL_ALERT_SOUND` unset (defaults to `/sounds/alert.mp3`) or set it to `/sounds/alert.mp3` (or another filename you add).
   - Redeploy; the file will be served from the app's public folder.

No server-side or host-specific setup is required for sound beyond env and optional file.

---

## What you do from your end

1. **Code**
   - Push the repo to GitHub (if not already).
   - Optional: add `threat-monitor/public/sounds/alert.mp3` if you want a custom alert sound; otherwise use `builtin:beep` or `builtin:siren`.

2. **Host**
   - Sign up and connect GitHub (e.g. Vercel).
   - New project from this repo, **Root Directory** = `threat-monitor`.
   - Add at least `NEXT_PUBLIC_CRITICAL_ALERT_SOUND=builtin:beep` (or `builtin:siren`) for predictable sound in the demo.

3. **Secrets**
   - Do **not** commit `.env` or `.env.local`.
   - Add all keys (OpenAI, AirNow, SMTP, Twilio) only in the host's "Environment Variables" UI so they stay server-side.

4. **Deploy**
   - Trigger a deploy (e.g. push to main or "Redeploy" in Vercel).
   - Open the provided URL and test: threats load, draft works, critical alert triggers sound (and acknowledge stops it).

5. **Optional enhancements**
   - Add **OPENAI_API_KEY** for real AI drafts.
   - Add **AIRNOW_API_KEY** for air quality.
   - Add SMTP and/or Twilio for real email/SMS in "Notify" (otherwise demo stays simulated).

---

## Summary

- **Deploy:** Push repo → connect to Vercel (or Render/Railway) → set root to `threat-monitor` → add env vars → deploy.
- **Config:** All via host's environment variables; use `threat-monitor/.env.local.example` as the reference.
- **Sound:** Set `NEXT_PUBLIC_CRITICAL_ALERT_SOUND=builtin:beep` or `builtin:siren` for no-file sound on any host; or add `public/sounds/alert.mp3` and use default/configured path.
- **Your part:** Push code, set root and env on the host, optionally add an MP3; do not commit secrets.
