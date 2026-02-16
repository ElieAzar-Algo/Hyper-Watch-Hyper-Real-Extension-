/**
 * EPA AirNow API Client - Air quality observations
 * https://www.airnowapi.org/
 * Requires free API key: AIRNOW_API_KEY in env.
 */

import type { Threat, Severity } from '../types';
import { STATE_CENTERS } from '../types';

const AIRNOW_BASE = 'https://www.airnowapi.org/aq/observation/latLong/current/';

interface AirNowObservation {
  Latitude: number;
  Longitude: number;
  AQI: number;
  ParameterName: string;
  Category?: { Name: string; Number: number };
  DateObserved: string;
  ReportingArea: string;
  StateCode: string;
}

/**
 * Map AQI value to our severity (only Moderate and above become threats)
 */
function aqiToSeverity(aqi: number): Severity {
  if (aqi >= 301) return 'critical';
  if (aqi >= 201) return 'critical';
  if (aqi >= 151) return 'warning';
  if (aqi >= 101) return 'watch';
  return 'advisory'; // 51-100 Moderate
}

/**
 * Fetch air quality observations for a state and return as threats
 * when AQI is Moderate (51+) or worse.
 */
export async function fetchAirQualityAlerts(state: string): Promise<Threat[]> {
  const apiKey = process.env.AIRNOW_API_KEY;
  if (!apiKey) {
    return [];
  }

  const center = STATE_CENTERS[state] ?? { lat: 39, lng: -98, zoom: 6 };
  const distance = state in STATE_CENTERS ? 200 : 400;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const params = new URLSearchParams({
    latitude: String(center.lat),
    longitude: String(center.lng),
    date,
    distance: String(distance),
    format: 'application/json',
    API_KEY: apiKey,
  });

  try {
    const url = `${AIRNOW_BASE}?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`AirNow API ${response.status}`);
    }

    const data = (await response.json()) as AirNowObservation[];
    if (!Array.isArray(data)) return [];

    // Dedupe by ReportingArea + ParameterName, keep highest AQI per area/param
    const byKey = new Map<string, AirNowObservation>();
    for (const obs of data) {
      if (obs.AQI == null || obs.AQI < 51) continue; // Only Moderate and above
      const key = `${obs.ReportingArea}-${obs.ParameterName}`;
      const existing = byKey.get(key);
      if (!existing || obs.AQI > existing.AQI) byKey.set(key, obs);
    }

    return Array.from(byKey.values()).map((obs) => ({
      id: `air-${obs.ReportingArea}-${obs.ParameterName}-${obs.DateObserved}`,
      source: 'airquality' as const,
      type: 'Air Quality Alert',
      severity: aqiToSeverity(obs.AQI),
      title: `Air Quality - ${obs.ReportingArea} (${obs.ParameterName})`,
      description: `AQI ${obs.AQI} - ${obs.Category?.Name ?? 'Moderate or worse'}. ${obs.ParameterName}. Limit prolonged outdoor exertion.`,
      location: {
        lat: obs.Latitude,
        lng: obs.Longitude,
        areaDesc: `${obs.ReportingArea}, ${obs.StateCode}`,
      },
      startTime: `${obs.DateObserved}T12:00:00Z`,
      aqi: obs.AQI,
      raw: obs,
    })) as Threat[];
  } catch (err) {
    console.error('AirNow API error:', err);
    return [];
  }
}
