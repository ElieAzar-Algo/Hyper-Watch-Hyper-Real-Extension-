/**
 * GET /api/threats
 * Fetches threats from all sources (NWS, USGS, Power Outages)
 * Query params:
 *   - state: US state code (e.g., "CA", "TX")
 *   - sources: Comma-separated list of sources to include (default: all)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchNWSAlerts } from '@/lib/api/nws';
import { fetchUSGSEarthquakes } from '@/lib/api/usgs';
import { fetchPowerOutages } from '@/lib/api/poweroutage';
import { sortBySeverity } from '@/lib/utils/transform';
import type { Threat, ThreatsResponse, ThreatSource } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state') || 'CA';
  const sourcesParam = searchParams.get('sources');
  
  // Parse which sources to fetch
  const sources: ThreatSource[] = sourcesParam
    ? (sourcesParam.split(',') as ThreatSource[])
    : ['nws', 'usgs', 'outage'];

  const errors: string[] = [];
  const allThreats: Threat[] = [];

  // Fetch from all sources in parallel
  const fetchPromises: Promise<Threat[]>[] = [];

  if (sources.includes('nws')) {
    fetchPromises.push(
      fetchNWSAlerts(state).catch((err) => {
        errors.push(`NWS: ${err.message}`);
        return [];
      })
    );
  }

  if (sources.includes('usgs')) {
    fetchPromises.push(
      fetchUSGSEarthquakes(state).catch((err) => {
        errors.push(`USGS: ${err.message}`);
        return [];
      })
    );
  }

  if (sources.includes('outage')) {
    fetchPromises.push(
      fetchPowerOutages(state).catch((err) => {
        errors.push(`Power Outage: ${err.message}`);
        return [];
      })
    );
  }

  // Wait for all fetches to complete
  const results = await Promise.all(fetchPromises);
  
  // Merge all results
  results.forEach((threats) => {
    allThreats.push(...threats);
  });

  // Sort by severity (most critical first)
  const sortedThreats = sortBySeverity(allThreats);

  const response: ThreatsResponse = {
    threats: sortedThreats,
    timestamp: new Date().toISOString(),
    errors: errors.length > 0 ? errors : undefined,
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
