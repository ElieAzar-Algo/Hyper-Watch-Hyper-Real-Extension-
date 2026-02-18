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
    detailsUrl: props.url || props.detail,
    raw: earthquake,
  };
}

/**
 * Get bounding box for a US state (approximate)
 */
const STATE_BOUNDS: Record<string, { minlat: number; maxlat: number; minlon: number; maxlon: number }> = {
  AL: { minlat: 30.2, maxlat: 35.0, minlon: -88.5, maxlon: -84.9 },
  AK: { minlat: 51.2, maxlat: 71.5, minlon: -180.0, maxlon: -130.0 },
  AZ: { minlat: 31.3, maxlat: 37.0, minlon: -114.8, maxlon: -109.0 },
  AR: { minlat: 33.0, maxlat: 36.5, minlon: -94.6, maxlon: -89.6 },
  CA: { minlat: 32.5, maxlat: 42.0, minlon: -124.5, maxlon: -114.1 },
  CO: { minlat: 37.0, maxlat: 41.0, minlon: -109.1, maxlon: -102.0 },
  CT: { minlat: 41.0, maxlat: 42.1, minlon: -73.7, maxlon: -71.8 },
  DE: { minlat: 38.5, maxlat: 39.8, minlon: -75.8, maxlon: -75.0 },
  FL: { minlat: 24.5, maxlat: 31.0, minlon: -87.6, maxlon: -80.0 },
  GA: { minlat: 30.4, maxlat: 35.0, minlon: -85.6, maxlon: -80.8 },
  HI: { minlat: 18.9, maxlat: 22.2, minlon: -160.2, maxlon: -154.8 },
  ID: { minlat: 42.0, maxlat: 49.0, minlon: -117.2, maxlon: -111.0 },
  IL: { minlat: 37.0, maxlat: 42.5, minlon: -91.5, maxlon: -87.5 },
  IN: { minlat: 37.8, maxlat: 41.8, minlon: -88.1, maxlon: -84.8 },
  IA: { minlat: 40.4, maxlat: 43.5, minlon: -96.6, maxlon: -90.1 },
  KS: { minlat: 37.0, maxlat: 40.0, minlon: -102.1, maxlon: -94.6 },
  KY: { minlat: 36.5, maxlat: 39.1, minlon: -89.6, maxlon: -82.0 },
  LA: { minlat: 29.0, maxlat: 33.0, minlon: -94.0, maxlon: -89.0 },
  ME: { minlat: 43.1, maxlat: 47.5, minlon: -71.1, maxlon: -66.9 },
  MD: { minlat: 37.9, maxlat: 39.7, minlon: -79.5, maxlon: -75.0 },
  MA: { minlat: 41.2, maxlat: 42.9, minlon: -73.5, maxlon: -69.9 },
  MI: { minlat: 41.7, maxlat: 48.3, minlon: -90.4, maxlon: -82.4 },
  MN: { minlat: 43.5, maxlat: 49.4, minlon: -97.2, maxlon: -89.5 },
  MS: { minlat: 30.2, maxlat: 35.0, minlon: -91.7, maxlon: -88.1 },
  MO: { minlat: 36.0, maxlat: 40.6, minlon: -95.8, maxlon: -89.1 },
  MT: { minlat: 44.4, maxlat: 49.0, minlon: -116.1, maxlon: -104.0 },
  NE: { minlat: 40.0, maxlat: 43.0, minlon: -104.1, maxlon: -95.3 },
  NV: { minlat: 35.0, maxlat: 42.0, minlon: -120.0, maxlon: -114.0 },
  NH: { minlat: 42.7, maxlat: 45.3, minlon: -72.6, maxlon: -70.7 },
  NJ: { minlat: 38.9, maxlat: 41.4, minlon: -75.6, maxlon: -74.0 },
  NM: { minlat: 31.3, maxlat: 37.0, minlon: -109.1, maxlon: -103.0 },
  NY: { minlat: 40.5, maxlat: 45.0, minlon: -79.8, maxlon: -71.8 },
  NC: { minlat: 33.8, maxlat: 36.6, minlon: -84.3, maxlon: -75.5 },
  ND: { minlat: 45.9, maxlat: 49.0, minlon: -104.1, maxlon: -96.6 },
  OH: { minlat: 38.4, maxlat: 42.0, minlon: -84.8, maxlon: -80.5 },
  OK: { minlat: 33.6, maxlat: 37.0, minlon: -103.0, maxlon: -94.4 },
  OR: { minlat: 42.0, maxlat: 46.3, minlon: -124.6, maxlon: -116.5 },
  PA: { minlat: 39.7, maxlat: 42.3, minlon: -80.5, maxlon: -74.7 },
  RI: { minlat: 41.1, maxlat: 42.0, minlon: -71.9, maxlon: -71.1 },
  SC: { minlat: 32.0, maxlat: 35.2, minlon: -83.4, maxlon: -78.5 },
  SD: { minlat: 42.5, maxlat: 45.9, minlon: -104.1, maxlon: -96.4 },
  TN: { minlat: 35.0, maxlat: 36.7, minlon: -90.3, maxlon: -81.6 },
  TX: { minlat: 25.8, maxlat: 36.5, minlon: -106.6, maxlon: -93.5 },
  UT: { minlat: 37.0, maxlat: 42.0, minlon: -114.1, maxlon: -109.0 },
  VT: { minlat: 42.7, maxlat: 45.0, minlon: -73.4, maxlon: -71.5 },
  VA: { minlat: 36.5, maxlat: 39.5, minlon: -83.7, maxlon: -75.2 },
  WA: { minlat: 45.5, maxlat: 49.0, minlon: -124.8, maxlon: -116.9 },
  WV: { minlat: 37.2, maxlat: 40.6, minlon: -82.6, maxlon: -77.7 },
  WI: { minlat: 42.5, maxlat: 47.1, minlon: -92.9, maxlon: -86.8 },
  WY: { minlat: 41.0, maxlat: 45.0, minlon: -111.1, maxlon: -104.1 },
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
