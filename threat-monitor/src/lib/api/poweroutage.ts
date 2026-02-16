/**
 * Power Outage Data Client
 * Since there's no single national API for power outages,
 * this module provides simulated data with realistic patterns
 * for demo purposes.
 */

import type { Threat, Severity, PowerOutage } from '../types';

/**
 * Map customer count to severity
 */
function mapCustomersToSeverity(customers: number): Severity {
  if (customers >= 10000) return 'critical';
  if (customers >= 1000) return 'warning';
  if (customers >= 100) return 'watch';
  return 'advisory';
}

/**
 * Convert power outage to unified Threat format
 */
function normalizeOutage(outage: PowerOutage): Threat {
  return {
    id: outage.id,
    source: 'outage',
    type: 'Power Outage',
    severity: mapCustomersToSeverity(outage.customersAffected),
    title: `Power Outage - ${outage.county}, ${outage.state}`,
    description: `${outage.customersAffected.toLocaleString()} customers affected. Utility: ${outage.utilityName}${outage.estimatedRestoration ? `. Estimated restoration: ${outage.estimatedRestoration}` : ''}`,
    location: {
      lat: outage.lat,
      lng: outage.lng,
      areaDesc: `${outage.county} County, ${outage.state}`,
    },
    startTime: outage.reportedAt,
    affectedCustomers: outage.customersAffected,
    raw: outage,
  };
}

/**
 * Sample outage data for various states (for simulation)
 */
const SAMPLE_OUTAGES: Record<string, PowerOutage[]> = {
  CA: [
    {
      id: 'outage-ca-1',
      utilityName: 'Pacific Gas & Electric',
      county: 'Los Angeles',
      state: 'CA',
      customersAffected: 15000,
      lat: 34.0522,
      lng: -118.2437,
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      estimatedRestoration: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleTimeString(),
    },
    {
      id: 'outage-ca-2',
      utilityName: 'San Diego Gas & Electric',
      county: 'San Diego',
      state: 'CA',
      customersAffected: 3500,
      lat: 32.7157,
      lng: -117.1611,
      reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  TX: [
    {
      id: 'outage-tx-1',
      utilityName: 'Oncor Electric',
      county: 'Dallas',
      state: 'TX',
      customersAffected: 8500,
      lat: 32.7767,
      lng: -96.797,
      reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      estimatedRestoration: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString(),
    },
    {
      id: 'outage-tx-2',
      utilityName: 'CenterPoint Energy',
      county: 'Harris',
      state: 'TX',
      customersAffected: 12000,
      lat: 29.7604,
      lng: -95.3698,
      reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
  FL: [
    {
      id: 'outage-fl-1',
      utilityName: 'Florida Power & Light',
      county: 'Miami-Dade',
      state: 'FL',
      customersAffected: 25000,
      lat: 25.7617,
      lng: -80.1918,
      reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ],
  NY: [
    {
      id: 'outage-ny-1',
      utilityName: 'Con Edison',
      county: 'New York',
      state: 'NY',
      customersAffected: 5000,
      lat: 40.7128,
      lng: -74.006,
      reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      estimatedRestoration: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleTimeString(),
    },
  ],
};

/**
 * Generate random outages for states without sample data
 */
function generateRandomOutages(state: string, count: number = 1): PowerOutage[] {
  const utilities = ['Regional Power Co.', 'State Electric', 'Municipal Utility'];
  const counties = ['Central', 'Northern', 'Southern', 'Eastern', 'Western'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `outage-${state.toLowerCase()}-${Date.now()}-${i}`,
    utilityName: utilities[Math.floor(Math.random() * utilities.length)],
    county: counties[Math.floor(Math.random() * counties.length)],
    state: state.toUpperCase(),
    customersAffected: Math.floor(Math.random() * 10000) + 100,
    lat: 38 + Math.random() * 10 - 5,
    lng: -100 + Math.random() * 20 - 10,
    reportedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
  }));
}

/**
 * Flag to control whether to show simulated outages
 */
let showSimulatedOutages = false;

/**
 * Set whether to show simulated outages
 */
export function setShowSimulatedOutages(show: boolean) {
  showSimulatedOutages = show;
}

/**
 * Fetch power outages for a state
 * Uses simulated data for demo purposes
 */
export async function fetchPowerOutages(state: string): Promise<Threat[]> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const upperState = state.toUpperCase();
  
  // Return sample data if available, otherwise generate random (or empty)
  let outages: PowerOutage[] = [];
  
  if (showSimulatedOutages) {
    outages = SAMPLE_OUTAGES[upperState] || generateRandomOutages(upperState, Math.floor(Math.random() * 3));
  } else {
    // Return real sample data for specific states only
    outages = SAMPLE_OUTAGES[upperState] || [];
  }

  return outages.map(normalizeOutage);
}

/**
 * Create a simulated outage for demo purposes
 */
export function createSimulatedOutage(params: {
  state: string;
  county: string;
  customersAffected: number;
  lat: number;
  lng: number;
}): Threat {
  const outage: PowerOutage = {
    id: `sim-outage-${Date.now()}`,
    utilityName: 'Simulated Utility',
    county: params.county,
    state: params.state,
    customersAffected: params.customersAffected,
    lat: params.lat,
    lng: params.lng,
    reportedAt: new Date().toISOString(),
  };

  return normalizeOutage(outage);
}
