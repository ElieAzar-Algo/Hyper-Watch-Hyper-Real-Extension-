// Threat source types
export type ThreatSource = 'nws' | 'usgs' | 'airquality';

// Severity levels
export type Severity = 'critical' | 'warning' | 'watch' | 'advisory';

// Notification channels
export type Channel = 'sms' | 'email';

// Main threat interface - unified format for all data sources
export interface Threat {
  id: string;
  source: ThreatSource;
  type: string;
  severity: Severity;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    areaDesc: string;
    polygon?: [number, number][]; // For NWS alert polygons
  };
  startTime: string;
  endTime?: string;
  magnitude?: number; // For earthquakes
  aqi?: number; // For air quality
  raw?: unknown;
}

// AI draft response
export interface DraftResponse {
  message: string;
  audiences: string[];
  channels: Channel[];
}

// API response wrapper
export interface ThreatsResponse {
  threats: Threat[];
  timestamp: string;
  errors?: string[];
}

// NWS Alert types (from api.weather.gov)
export interface NWSAlertProperties {
  id: string;
  event: string;
  severity: string;
  certainty: string;
  urgency: string;
  headline: string;
  description: string;
  instruction?: string;
  areaDesc: string;
  effective: string;
  expires: string;
}

export interface NWSAlert {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | null;
  } | null;
  properties: NWSAlertProperties;
}

export interface NWSAlertsResponse {
  type: string;
  features: NWSAlert[];
}

// USGS Earthquake types
export interface USGSEarthquakeProperties {
  mag: number;
  place: string;
  time: number;
  updated: number;
  url: string;
  detail: string;
  status: string;
  type: string;
  title: string;
}

export interface USGSEarthquake {
  type: string;
  properties: USGSEarthquakeProperties;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
  id: string;
}

export interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    count: number;
  };
  features: USGSEarthquake[];
}

// State codes for US states
export const US_STATES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

// State center coordinates for map centering
export const STATE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  AL: { lat: 32.3182, lng: -86.9023, zoom: 7 },
  AK: { lat: 64.2008, lng: -152.4937, zoom: 4 },
  AZ: { lat: 34.0489, lng: -111.0937, zoom: 6 },
  AR: { lat: 34.7465, lng: -92.2896, zoom: 7 },
  CA: { lat: 36.7783, lng: -119.4179, zoom: 6 },
  CO: { lat: 39.5501, lng: -105.7821, zoom: 7 },
  CT: { lat: 41.6032, lng: -73.0877, zoom: 8 },
  DE: { lat: 39.1582, lng: -75.5244, zoom: 8 },
  FL: { lat: 27.6648, lng: -81.5158, zoom: 6 },
  GA: { lat: 32.1656, lng: -82.9001, zoom: 7 },
  HI: { lat: 20.7967, lng: -156.3319, zoom: 7 },
  ID: { lat: 44.0682, lng: -114.742, zoom: 6 },
  IL: { lat: 40.6331, lng: -89.3985, zoom: 7 },
  IN: { lat: 39.7684, lng: -86.1581, zoom: 7 },
  IA: { lat: 41.878, lng: -93.0977, zoom: 7 },
  KS: { lat: 38.5266, lng: -98.7265, zoom: 7 },
  KY: { lat: 37.8393, lng: -84.27, zoom: 7 },
  LA: { lat: 30.9843, lng: -91.9623, zoom: 7 },
  ME: { lat: 45.2538, lng: -69.4455, zoom: 7 },
  MD: { lat: 39.0458, lng: -76.6413, zoom: 8 },
  MA: { lat: 42.4072, lng: -71.3824, zoom: 8 },
  MI: { lat: 44.3148, lng: -85.6024, zoom: 6 },
  MN: { lat: 46.7296, lng: -94.6859, zoom: 6 },
  MS: { lat: 32.3547, lng: -89.3985, zoom: 7 },
  MO: { lat: 37.9643, lng: -91.8318, zoom: 7 },
  MT: { lat: 46.8797, lng: -110.3626, zoom: 6 },
  NE: { lat: 41.4925, lng: -99.9018, zoom: 7 },
  NV: { lat: 38.8026, lng: -116.4194, zoom: 6 },
  NH: { lat: 43.1939, lng: -71.5724, zoom: 8 },
  NJ: { lat: 40.0583, lng: -74.4057, zoom: 8 },
  NM: { lat: 34.5199, lng: -105.8701, zoom: 6 },
  NY: { lat: 42.1657, lng: -74.9481, zoom: 7 },
  NC: { lat: 35.7596, lng: -79.0193, zoom: 7 },
  ND: { lat: 47.5515, lng: -101.002, zoom: 7 },
  OH: { lat: 40.4173, lng: -82.9071, zoom: 7 },
  OK: { lat: 35.4676, lng: -97.5164, zoom: 7 },
  OR: { lat: 43.8041, lng: -120.5542, zoom: 6 },
  PA: { lat: 41.2033, lng: -77.1945, zoom: 7 },
  RI: { lat: 41.5801, lng: -71.4774, zoom: 9 },
  SC: { lat: 33.8361, lng: -81.1637, zoom: 7 },
  SD: { lat: 43.9695, lng: -99.9018, zoom: 7 },
  TN: { lat: 35.5175, lng: -86.5804, zoom: 7 },
  TX: { lat: 31.9686, lng: -99.9018, zoom: 6 },
  UT: { lat: 39.321, lng: -111.0937, zoom: 7 },
  VT: { lat: 44.5588, lng: -72.5778, zoom: 8 },
  VA: { lat: 37.4316, lng: -78.6569, zoom: 7 },
  WA: { lat: 47.7511, lng: -120.7401, zoom: 7 },
  WV: { lat: 38.5976, lng: -80.4549, zoom: 7 },
  WI: { lat: 43.7844, lng: -88.7879, zoom: 7 },
  WY: { lat: 43.076, lng: -107.2903, zoom: 7 },
};
