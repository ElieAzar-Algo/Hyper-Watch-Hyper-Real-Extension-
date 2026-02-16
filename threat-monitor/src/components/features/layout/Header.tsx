'use client';

import { Select, Button } from '@/components/ui';
import { US_STATES } from '@/lib/types';
import { Radio, RefreshCw, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  onRefresh: () => void;
  onSimulateThreat: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export function Header({
  selectedState,
  onStateChange,
  onRefresh,
  onSimulateThreat,
  isRefreshing,
  lastUpdated,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">
              Hyper Watch
            </h1>
            <p className="text-xs text-gray-500">
              Powered by Hyper-Reach
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* State Selector */}
          <Select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-40"
          >
            {Object.entries(US_STATES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </Select>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          {/* Simulate Threat Button */}
          <Button variant="outline" onClick={onSimulateThreat}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Simulate Threat
          </Button>

          {/* Last Updated */}
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
