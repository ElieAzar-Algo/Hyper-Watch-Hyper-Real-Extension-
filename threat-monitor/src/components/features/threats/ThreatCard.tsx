'use client';

import type { Threat } from '@/lib/types';
import { Card, Badge } from '@/components/ui';
import { cn, formatRelativeTime, formatMagnitude } from '@/lib/utils';
import {
  CloudLightning,
  Activity,
  Wind,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ThreatCardProps {
  threat: Threat;
  isSelected?: boolean;
  onClick?: () => void;
  onMoreDetailsClick?: (threat: Threat) => void;
  lastSeenAt?: string;
  isSeen?: boolean;
  sentAt?: string;
}

const sourceIcons = {
  nws: CloudLightning,
  usgs: Activity,
  airquality: Wind,
};

const sourceLabels = {
  nws: 'Weather',
  usgs: 'Earthquake',
  airquality: 'Air',
};

export function ThreatCard({ threat, isSelected, onClick, onMoreDetailsClick, lastSeenAt, isSeen, sentAt }: ThreatCardProps) {
  const SourceIcon = sourceIcons[threat.source];

  return (
    <Card
      variant={isSelected ? 'elevated' : 'default'}
      padding="sm"
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-blue-300',
        isSelected && 'ring-2 ring-blue-500 border-blue-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Source Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            threat.source === 'nws' && 'bg-sky-100 text-sky-600',
            threat.source === 'usgs' && 'bg-orange-100 text-orange-600',
            threat.source === 'airquality' && 'bg-teal-100 text-teal-600'
          )}
        >
          <SourceIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="severity" severity={threat.severity} size="sm">
              {threat.severity}
            </Badge>
            <span className="text-xs text-gray-500">
              {sourceLabels[threat.source]}
            </span>
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded font-medium',
                threat.id.startsWith('sim-')
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {threat.id.startsWith('sim-') ? 'Simulated' : 'Live'}
            </span>
            {sentAt && (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-800">
                Sent {formatRelativeTime(sentAt)}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
            {threat.type}
          </h4>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{threat.location.areaDesc}</span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(threat.startTime)}
            </span>
            {isSeen && lastSeenAt && (
              <span className="text-gray-500">
                Last seen: {formatRelativeTime(lastSeenAt)}
              </span>
            )}

            {/* Show magnitude for earthquakes */}
            {threat.magnitude && (
              <span className="font-medium text-orange-600">
                {formatMagnitude(threat.magnitude)}
              </span>
            )}

            {/* Show AQI for air quality */}
            {threat.aqi != null && (
              <span className="font-medium text-teal-600">
                AQI {threat.aqi}
              </span>
            )}
          </div>
          {onMoreDetailsClick ? (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onMoreDetailsClick(threat);
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
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              More details
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
