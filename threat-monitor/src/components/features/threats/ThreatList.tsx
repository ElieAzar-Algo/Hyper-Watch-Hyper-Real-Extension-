'use client';

import { useState, useMemo } from 'react';
import type { Threat, Severity, ThreatSource } from '@/lib/types';
import { ThreatCard } from './ThreatCard';
import { Badge, Button } from '@/components/ui';
import { filterBySeverity, filterBySource } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

interface ThreatListProps {
  threats: Threat[];
  selectedThreat: Threat | null;
  onThreatSelect: (threat: Threat) => void;
  isLoading?: boolean;
}

const severities: Severity[] = ['critical', 'warning', 'watch', 'advisory'];
const sources: ThreatSource[] = ['nws', 'usgs', 'airquality'];

const sourceLabels: Record<ThreatSource, string> = {
  nws: 'Weather',
  usgs: 'Earthquake',
  airquality: 'Air',
};

export function ThreatList({
  threats,
  selectedThreat,
  onThreatSelect,
  isLoading,
}: ThreatListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeSeverities, setActiveSeverities] = useState<Severity[]>([]);
  const [activeSources, setActiveSources] = useState<ThreatSource[]>([]);

  // Filter threats based on active filters
  const filteredThreats = useMemo(() => {
    let result = threats;

    if (activeSeverities.length > 0) {
      result = filterBySeverity(result, activeSeverities);
    }

    if (activeSources.length > 0) {
      result = filterBySource(result, activeSources);
    }

    return result;
  }, [threats, activeSeverities, activeSources]);

  const toggleSeverity = (severity: Severity) => {
    setActiveSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  const toggleSource = (source: ThreatSource) => {
    setActiveSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const clearFilters = () => {
    setActiveSeverities([]);
    setActiveSources([]);
  };

  const hasFilters = activeSeverities.length > 0 || activeSources.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">
          Active Threats
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredThreats.length})
          </span>
        </h2>
        <Button
          variant={showFilters ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-1" />
          Filters
          {hasFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {activeSeverities.length + activeSources.length}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b space-y-3">
          {/* Severity Filters */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">SEVERITY</p>
            <div className="flex flex-wrap gap-2">
              {severities.map((severity) => (
                <button
                  key={severity}
                  onClick={() => toggleSeverity(severity)}
                  className={`transition-opacity ${
                    activeSeverities.length === 0 ||
                    activeSeverities.includes(severity)
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                >
                  <Badge variant="severity" severity={severity} size="sm">
                    {severity}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Source Filters */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">SOURCE</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`transition-opacity ${
                    activeSources.length === 0 || activeSources.includes(source)
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                >
                  <Badge variant="source" source={source} size="sm">
                    {sourceLabels[source]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Threat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading threats...
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {threats.length === 0
              ? 'No active threats in this region'
              : 'No threats match your filters'}
          </div>
        ) : (
          filteredThreats.map((threat) => (
            <ThreatCard
              key={threat.id}
              threat={threat}
              isSelected={selectedThreat?.id === threat.id}
              onClick={() => onThreatSelect(threat)}
            />
          ))
        )}
      </div>
    </div>
  );
}
