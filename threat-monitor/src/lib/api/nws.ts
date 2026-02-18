/**
 * National Weather Service (NWS) API Client
 * https://api.weather.gov
 */

import type { NWSAlertsResponse, NWSAlert, Threat, Severity } from '../types';
import { getJSON, APIError } from '../utils';

const NWS_BASE_URL = 'https://api.weather.gov';

/**
 * Map NWS severity to our severity levels
 */
function mapNWSSeverity(nwsSeverity: string): Severity {
  const lower = nwsSeverity.toLowerCase();
  
  if (lower === 'extreme') return 'critical';
  if (lower === 'severe') return 'warning';
  if (lower === 'moderate') return 'watch';
  return 'advisory';
}

/**
 * Extract center point from polygon coordinates
 */
function getPolygonCenter(coordinates: number[][][]): { lat: number; lng: number } {
  if (!coordinates || !coordinates[0] || coordinates[0].length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  const points = coordinates[0];
  const sumLat = points.reduce((sum, point) => sum + point[1], 0);
  const sumLng = points.reduce((sum, point) => sum + point[0], 0);
  
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
}

/**
 * Convert NWS alert to unified Threat format
 */
function normalizeNWSAlert(alert: NWSAlert): Threat {
  const props = alert.properties;
  
  // Get location from geometry or use a default
  let location = { lat: 0, lng: 0 };
  let polygon: [number, number][] | undefined;
  
  if (alert.geometry && alert.geometry.coordinates) {
    const coords = alert.geometry.coordinates as number[][][];
    location = getPolygonCenter(coords);
    // Convert coordinates to [lat, lng] format for Leaflet
    polygon = coords[0]?.map(([lng, lat]) => [lat, lng] as [number, number]);
  }

  // Use the human-readable NWS alerts page; the API URL (alert.id) returns raw JSON.
  const detailsUrl = 'https://www.weather.gov/alerts';

  return {
    id: props.id || alert.id,
    source: 'nws',
    type: props.event,
    severity: mapNWSSeverity(props.severity),
    title: props.headline || props.event,
    description: props.description || '',
    location: {
      lat: location.lat,
      lng: location.lng,
      areaDesc: props.areaDesc,
      polygon,
    },
    startTime: props.effective,
    endTime: props.expires,
    detailsUrl,
    raw: alert,
  };
}

/**
 * Fetch active NWS alerts for a state
 */
export async function fetchNWSAlerts(state: string): Promise<Threat[]> {
  try {
    const url = `${NWS_BASE_URL}/alerts/active?area=${state.toUpperCase()}`;
    
    const response = await getJSON<NWSAlertsResponse>(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'HyperReach-ThreatMonitor/1.0',
      },
    });

    if (!response.features) {
      return [];
    }

    return response.features
      .filter((alert) => alert.properties && alert.properties.event)
      .map(normalizeNWSAlert);
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`NWS API error: ${error.message}`);
    }
    // Return empty array on error to not break the entire fetch
    return [];
  }
}

/**
 * Fetch all active NWS alerts (nationwide)
 */
export async function fetchAllNWSAlerts(): Promise<Threat[]> {
  try {
    const url = `${NWS_BASE_URL}/alerts/active`;
    
    const response = await getJSON<NWSAlertsResponse>(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'HyperReach-ThreatMonitor/1.0',
      },
    });

    if (!response.features) {
      return [];
    }

    return response.features
      .filter((alert) => alert.properties && alert.properties.event)
      .map(normalizeNWSAlert);
  } catch (error) {
    console.error('Failed to fetch NWS alerts:', error);
    return [];
  }
}
