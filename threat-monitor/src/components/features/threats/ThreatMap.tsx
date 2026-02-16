'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Threat, Severity } from '@/lib/types';
import { STATE_CENTERS } from '@/lib/types';
import { Badge } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

// Fix Leaflet default marker icon issue in Next.js
import 'leaflet/dist/leaflet.css';

// Custom marker icons by severity
const createIcon = (color: string) => {
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

const severityColors: Record<Severity, string> = {
  critical: '#dc2626',
  warning: '#f59e0b',
  watch: '#3b82f6',
  advisory: '#6b7280',
};

const severityIcons: Record<Severity, L.DivIcon> = {
  critical: createIcon(severityColors.critical),
  warning: createIcon(severityColors.warning),
  watch: createIcon(severityColors.watch),
  advisory: createIcon(severityColors.advisory),
};

interface ThreatMapProps {
  threats: Threat[];
  selectedState: string;
  selectedThreat: Threat | null;
  onThreatSelect: (threat: Threat) => void;
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
}: ThreatMapProps) {
  const center = STATE_CENTERS[selectedState] || { lat: 39.8283, lng: -98.5795, zoom: 4 };

  // Filter threats with valid coordinates
  const validThreats = useMemo(() => {
    return threats.filter(
      (t) => t.location.lat !== 0 && t.location.lng !== 0
    );
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
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="severity" severity={threat.severity} size="sm">
                  {threat.severity}
                </Badge>
                <Badge variant="source" source={threat.source} size="sm">
                  {threat.source}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{threat.title}</h3>
              <p className="text-xs text-gray-600 mb-1">{threat.location.areaDesc}</p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(threat.startTime)}
              </p>
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
    </MapContainer>
  );
}
