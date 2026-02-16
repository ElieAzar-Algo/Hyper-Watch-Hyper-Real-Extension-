// Threat source types
export type ThreatSource = 'nws' | 'usgs' | 'outage';

// Severity levels
export type Severity = 'critical' | 'warning' | 'watch' | 'advisory';

// Notification channels
export type Channel = 'sms' | 'voice' | 'email' | 'app';

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
  affectedCustomers?: number; // For power outages
  magnitude?: number; // For earthquakes
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

// Power Outage types
export interface PowerOutage {
  id: string;
  utilityName: string;
  county: string;
  state: string;
  customersAffected: number;
  lat: number;
  lng: number;
  reportedAt: string;
  estimatedRestoration?: string;
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
  CA: { lat: 36.7783, lng: -119.4179, zoom: 6 },
  TX: { lat: 31.9686, lng: -99.9018, zoom: 6 },
  FL: { lat: 27.6648, lng: -81.5158, zoom: 6 },
  NY: { lat: 42.1657, lng: -74.9481, zoom: 7 },
  PA: { lat: 41.2033, lng: -77.1945, zoom: 7 },
  IL: { lat: 40.6331, lng: -89.3985, zoom: 7 },
  OH: { lat: 40.4173, lng: -82.9071, zoom: 7 },
  GA: { lat: 32.1656, lng: -82.9001, zoom: 7 },
  NC: { lat: 35.7596, lng: -79.0193, zoom: 7 },
  MI: { lat: 44.3148, lng: -85.6024, zoom: 6 },
};
