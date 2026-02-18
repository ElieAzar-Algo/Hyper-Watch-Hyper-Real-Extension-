'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Threat, Severity } from '@/lib/types';
import { STATE_CENTERS } from '@/lib/types';
import { Badge } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

// Fix Leaflet default marker icon issue in Next.js
import 'leaflet/dist/leaflet.css';

const severityColors: Record<Severity, string> = {
  critical: '#dc2626',
  warning: '#f59e0b',
  watch: '#3b82f6',
  advisory: '#6b7280',
};

const severityLabels: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  watch: 'Watch',
  advisory: 'Advisory',
};

// Custom circular marker icons for threats with exact location
const createCircleIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom square marker icons for state-wide alerts (no exact location)
const createSquareIcon = (color: string, count: number) => {
  return L.divIcon({
    className: 'custom-marker-square',
    html: `<div style="
      background-color: ${color};
      width: 36px;
      height: 36px;
      border-radius: 4px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    ">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const severityIcons: Record<Severity, L.DivIcon> = {
  critical: createCircleIcon(severityColors.critical),
  warning: createCircleIcon(severityColors.warning),
  watch: createCircleIcon(severityColors.watch),
  advisory: createCircleIcon(severityColors.advisory),
};

// Offset positions for state-wide markers to avoid overlap
const severityOffsets: Record<Severity, { lat: number; lng: number }> = {
  critical: { lat: 0.3, lng: -0.3 },
  warning: { lat: 0.3, lng: 0.3 },
  watch: { lat: -0.3, lng: -0.3 },
  advisory: { lat: -0.3, lng: 0.3 },
};

interface ThreatMapProps {
  threats: Threat[];
  selectedState: string;
  selectedThreat: Threat | null;
  onThreatSelect: (threat: Threat) => void;
  onOpenDetails?: (threat: Threat) => void;
  sentAtByThreatId?: Record<string, string>;
}

// Component to recenter map when state changes or threat is selected
function MapUpdater({ state, selectedThreat }: { state: string; selectedThreat: Threat | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedThreat && selectedThreat.location.lat !== 0) {
      // Zoom to selected threat
      map.setView([selectedThreat.location.lat, selectedThreat.location.lng], 10, { animate: true });
    } else {
      // Use state center
      const center = STATE_CENTERS[state] || { lat: 39.8283, lng: -98.5795, zoom: 4 };
      map.setView([center.lat, center.lng], center.zoom, { animate: true });
    }
  }, [state, selectedThreat, map]);

  return null;
}

export function ThreatMap({
  threats,
  selectedState,
  selectedThreat,
  onThreatSelect,
  onOpenDetails,
  sentAtByThreatId = {},
}: ThreatMapProps) {
  const center = STATE_CENTERS[selectedState] || { lat: 39.8283, lng: -98.5795, zoom: 4 };

  // Filter threats with valid coordinates
  const validThreats = useMemo(() => {
    return threats.filter(
      (t) => t.location.lat !== 0 && t.location.lng !== 0
    );
  }, [threats]);

  // Group unmapped threats by severity for state-wide markers
  const unmappedBySeverity = useMemo(() => {
    const unmapped = threats.filter(
      (t) => t.location.lat === 0 || t.location.lng === 0
    );
    
    const grouped: Record<Severity, Threat[]> = {
      critical: [],
      warning: [],
      watch: [],
      advisory: [],
    };
    
    unmapped.forEach((t) => {
      grouped[t.severity].push(t);
    });
    
    return grouped;
  }, [threats]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={center.zoom}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater state={selectedState} selectedThreat={selectedThreat} />

      {validThreats.map((threat) => (
        <Marker
          key={threat.id}
          position={[threat.location.lat, threat.location.lng]}
          icon={severityIcons[threat.severity]}
          eventHandlers={{
            click: () => onThreatSelect(threat),
          }}
        >
          <Popup>
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="severity" severity={threat.severity} size="sm">
                  {threat.severity}
                </Badge>
                <Badge variant="source" source={threat.source} size="sm">
                  {threat.source}
                </Badge>
                <span
                  className={
                    threat.id.startsWith('sim-')
                      ? 'text-xs px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-800'
                      : 'text-xs px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600'
                  }
                >
                  {threat.id.startsWith('sim-') ? 'Simulated' : 'Live'}
                </span>
                {sentAtByThreatId[threat.id] && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-800">
                    Alert sent
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1">{threat.title}</h3>
              <p className="text-xs text-gray-600 mb-1">{threat.location.areaDesc}</p>
              <p className="text-xs text-gray-500 mb-2">
                {formatRelativeTime(threat.startTime)}
              </p>
              {onOpenDetails ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenDetails(threat);
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  More details
                </button>
              ) : threat.detailsUrl ? (
                <a
                  href={threat.detailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  More details
                </a>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render polygons for NWS alerts that have them */}
      {validThreats
        .filter((t) => t.location.polygon && t.location.polygon.length > 0)
        .map((threat) => (
          <Polygon
            key={`poly-${threat.id}`}
            positions={threat.location.polygon!}
            pathOptions={{
              color: severityColors[threat.severity],
              fillColor: severityColors[threat.severity],
              fillOpacity: 0.2,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onThreatSelect(threat),
            }}
          />
        ))}

      {/* State-wide markers for alerts without exact coordinates */}
      {(Object.entries(unmappedBySeverity) as [Severity, Threat[]][])
        .filter(([, alertList]) => alertList.length > 0)
        .map(([severity, alertList]) => {
          const offset = severityOffsets[severity];
          const markerLat = center.lat + offset.lat;
          const markerLng = center.lng + offset.lng;
          
          return (
            <Marker
              key={`statewide-${severity}`}
              position={[markerLat, markerLng]}
              icon={createSquareIcon(severityColors[severity], alertList.length)}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="severity" severity={severity} size="sm">
                      {severity}
                    </Badge>
                    <span className="text-xs text-gray-500 italic">State-wide</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">
                    {alertList.length} {severityLabels[severity]} Alert{alertList.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 italic">
                    No exact location available
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {alertList.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="text-xs p-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => onThreatSelect(alert)}
                      >
                        {alert.title}
                      </div>
                    ))}
                    {alertList.length > 5 && (
                      <p className="text-xs text-gray-400 italic">
                        +{alertList.length - 5} more in list...
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
