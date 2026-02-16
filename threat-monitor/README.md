# Real-Time Threat Monitor for Hyper-Reach

A web dashboard that transforms Hyper-Reach from a reactive notification tool into a proactive threat detection system. It monitors public data feeds, visualizes threats on a map, and uses AI to draft ready-to-send alert messages.

## Features

- **Real-Time Threat Monitoring**: Aggregates data from multiple sources:
  - National Weather Service (NWS) - Weather alerts
  - USGS - Earthquake data
  - Power Outage monitoring (simulated for demo)

- **Interactive Map Dashboard**: 
  - Color-coded threat markers by severity
  - Click to select and view threat details
  - Auto-zoom to selected state/threat

- **AI-Powered Message Drafting**:
  - Generates concise, actionable alert messages
  - Suggests appropriate audience segments
  - Recommends notification channels based on urgency

- **Demo-Ready Features**:
  - "Simulate Threat" button for reliable demos
  - Mock "Send to Hyper-Reach" flow
  - State selector for regional filtering

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 10+
- (Optional) OpenAI API key for AI-powered message drafting

### Installation

```bash
# Navigate to the project
cd threat-monitor

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Optional - enables AI-powered message drafting
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Without an OpenAI API key, the app will use intelligent default messages based on threat type and severity.

## Demo Script

1. **Show the Dashboard**: Open the app and select a state (e.g., California or Texas)
2. **Explore Real Threats**: Point out any active weather alerts or earthquakes on the map
3. **Select a Threat**: Click on a threat card or map marker to see details
4. **AI Drafting**: Watch the AI generate a notification message automatically
5. **Customize**: Edit the message, select audience segments and channels
6. **Simulate**: Use the "Simulate Threat" button to inject controlled test data
7. **Send**: Click "Send to Hyper-Reach" to see the mock send flow

## Project Structure

```
threat-monitor/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── api/
│   │       ├── threats/route.ts  # Threat data endpoint
│   │       └── draft/route.ts    # AI drafting endpoint
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   └── features/             # Feature-specific components
│   │       ├── threats/          # Map, list, cards
│   │       ├── drafts/           # Draft panel
│   │       └── layout/           # Header, navigation
│   └── lib/
│       ├── api/                  # External API clients
│       ├── utils/                # Utility functions
│       ├── hooks/                # React hooks
│       └── types.ts              # TypeScript types
├── .cursor/rules/                # Coding standards
└── package.json
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Map**: Leaflet.js + React-Leaflet
- **AI**: OpenAI GPT-4o-mini
- **Language**: TypeScript

## Data Sources

| Source | Data | API |
|--------|------|-----|
| NWS | Weather alerts | https://api.weather.gov |
| USGS | Earthquakes | https://earthquake.usgs.gov |
| Power Outages | Simulated | Internal |

## Business Value

This tool helps emergency managers:

1. **Find problems early** - Monitor threats before they escalate
2. **Respond faster** - AI-drafted messages ready to send
3. **Target accurately** - Suggested audience segments
4. **Choose the right channels** - Recommendations based on urgency

---

Built for the Valsoft Hackathon 2026
