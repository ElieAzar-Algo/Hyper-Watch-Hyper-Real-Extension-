'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui';
import type { Threat } from '@/lib/types';

// Dynamically import the map component to avoid SSR issues with Leaflet
const ThreatMap = dynamic(
  () => import('./ThreatMap').then((mod) => mod.ThreatMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

interface ThreatMapWrapperProps {
  threats: Threat[];
  selectedState: string;
  selectedThreat: Threat | null;
  onThreatSelect: (threat: Threat) => void;
}

export function ThreatMapWrapper(props: ThreatMapWrapperProps) {
  // Use a unique ID that only changes when we want to force a remount
  const [mapKey, setMapKey] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Only set the key on the first mount to prevent StrictMode double-init
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMapKey(`map-${Date.now()}`);
    }

    // Cleanup: reset on unmount so a fresh key is generated next time
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Don't render until we have a key (prevents double initialization)
  if (!mapKey) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p className="text-sm text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  return <ThreatMap key={mapKey} {...props} />;
}
