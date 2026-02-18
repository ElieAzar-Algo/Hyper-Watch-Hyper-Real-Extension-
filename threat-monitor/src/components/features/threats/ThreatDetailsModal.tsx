'use client';

import type { Threat, ThreatSource } from '@/lib/types';
import { Card, Button, Badge } from '@/components/ui';
import { formatDate, formatRelativeTime, formatMagnitude, cn } from '@/lib/utils';
import { MapPin, Clock, X, ExternalLink } from 'lucide-react';

interface ThreatDetailsModalProps {
  open: boolean;
  threat: Threat | null;
  onClose: () => void;
  sentAt?: string;
}

const sourceLabels: Record<ThreatSource, string> = {
  nws: 'Weather',
  usgs: 'Earthquake',
  airquality: 'Air',
};

export function ThreatDetailsModal({
  open,
  threat,
  onClose,
  sentAt,
}: ThreatDetailsModalProps) {
  if (!open || !threat) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <Card className="w-full max-w-lg max-h-[90vh] mx-4 animate-fade-in flex flex-col" padding="lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {threat.type}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="severity" severity={threat.severity} size="sm">
                {threat.severity}
              </Badge>
              <Badge variant="source" source={threat.source} size="sm">
                {sourceLabels[threat.source]}
              </Badge>
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
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
          {threat.title && threat.title !== threat.type && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Title
              </p>
              <p className="text-sm text-gray-900">{threat.title}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </p>
            <p className="text-sm text-gray-900">{threat.location.areaDesc}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time
            </p>
            <p className="text-sm text-gray-900">
              Started: {formatRelativeTime(threat.startTime)} ({formatDate(threat.startTime)})
            </p>
            {threat.endTime && (
              <p className="text-sm text-gray-600 mt-0.5">
                Ends: {formatDate(threat.endTime)}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
              Description
            </p>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{threat.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {threat.magnitude != null && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Magnitude
                </p>
                <p className="text-sm font-medium text-orange-600">
                  {formatMagnitude(threat.magnitude)}
                </p>
              </div>
            )}
            {threat.aqi != null && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  AQI
                </p>
                <p className="text-sm font-medium text-teal-600">
                  {threat.aqi}
                </p>
              </div>
            )}
          </div>
        </div>

        {sentAt && (
          <p className="text-sm text-green-700 mt-2">
            Alert sent to staff {formatRelativeTime(sentAt)}.
          </p>
        )}

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
          {threat.detailsUrl && (
            <a
              href={threat.detailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open official source
            </a>
          )}
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
