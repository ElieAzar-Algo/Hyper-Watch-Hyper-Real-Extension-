/**
 * USGS Earthquake API Client
 * https://earthquake.usgs.gov/fdsnws/event/1/
 */

import type { USGSResponse, USGSEarthquake, Threat, Severity } from '../types';
import { getJSON, APIError } from '../utils';

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1';

/**
 * Map earthquake magnitude to severity
 */
function mapMagnitudeToSeverity(magnitude: number): Severity {
  if (magnitude >= 6.0) return 'critical';
  if (magnitude >= 5.0) return 'warning';
  if (magnitude >= 4.0) return 'watch';
  return 'advisory';
}

/**
 * Convert USGS earthquake to unified Threat format
 */
function normalizeUSGSEarthquake(earthquake: USGSEarthquake): Threat {
  const props = earthquake.properties;
  const [lng, lat] = earthquake.geometry.coordinates;

  return {
    id: earthquake.id,
    source: 'usgs',
    type: 'Earthquake',
    severity: mapMagnitudeToSeverity(props.mag),
    title: props.title,
    description: `Magnitude ${props.mag.toFixed(1)} earthquake near ${props.place}`,
    location: {
      lat,
      lng,
      areaDesc: props.place,
    },
    startTime: new Date(props.time).toISOString(),
    magnitude: props.mag,
    raw: earthquake,
  };
}

/**
 * Get bounding box for a US state (approximate)
 */
const STATE_BOUNDS: Record<string, { minlat: number; maxlat: number; minlon: number; maxlon: number }> = {
  CA: { minlat: 32.5, maxlat: 42.0, minlon: -124.5, maxlon: -114.0 },
  TX: { minlat: 25.8, maxlat: 36.5, minlon: -106.6, maxlon: -93.5 },
  FL: { minlat: 24.5, maxlat: 31.0, minlon: -87.6, maxlon: -80.0 },
  NY: { minlat: 40.5, maxlat: 45.0, minlon: -79.8, maxlon: -71.8 },
  WA: { minlat: 45.5, maxlat: 49.0, minlon: -124.8, maxlon: -116.9 },
  OR: { minlat: 42.0, maxlat: 46.3, minlon: -124.6, maxlon: -116.5 },
  AK: { minlat: 51.0, maxlat: 71.5, minlon: -180.0, maxlon: -130.0 },
  NV: { minlat: 35.0, maxlat: 42.0, minlon: -120.0, maxlon: -114.0 },
  AZ: { minlat: 31.3, maxlat: 37.0, minlon: -114.8, maxlon: -109.0 },
  UT: { minlat: 37.0, maxlat: 42.0, minlon: -114.0, maxlon: -109.0 },
  MT: { minlat: 44.4, maxlat: 49.0, minlon: -116.0, maxlon: -104.0 },
  OK: { minlat: 33.6, maxlat: 37.0, minlon: -103.0, maxlon: -94.4 },
};

/**
 * Fetch recent earthquakes for a state
 */
export async function fetchUSGSEarthquakes(state: string): Promise<Threat[]> {
  try {
    const bounds = STATE_BOUNDS[state.toUpperCase()];
    
    // Calculate date range (past 24 hours)
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let url = `${USGS_BASE_URL}/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=2.5`;
    
    // Add bounding box if we have state bounds
    if (bounds) {
      url += `&minlatitude=${bounds.minlat}&maxlatitude=${bounds.maxlat}`;
      url += `&minlongitude=${bounds.minlon}&maxlongitude=${bounds.maxlon}`;
    }

    const response = await getJSON<USGSResponse>(url, { timeout: 15000 });

    if (!response.features) {
      return [];
    }

    return response.features.map(normalizeUSGSEarthquake);
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`USGS API error: ${error.message}`);
    }
    return [];
  }
}

/**
 * Fetch significant earthquakes (M4.5+) in the past week
 */
export async function fetchSignificantEarthquakes(): Promise<Threat[]> {
  try {
    const url = `${USGS_BASE_URL}/query?format=geojson&minmagnitude=4.5&limit=50&orderby=time`;

    const response = await getJSON<USGSResponse>(url, { timeout: 15000 });

    if (!response.features) {
      return [];
    }

    return response.features.map(normalizeUSGSEarthquake);
  } catch (error) {
    console.error('Failed to fetch significant earthquakes:', error);
    return [];
  }
}
