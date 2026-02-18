'use client';

import { Select, Button } from '@/components/ui';
import { US_STATES } from '@/lib/types';
import { CriticalAlertLamp } from '@/components/features/threats';
import Link from 'next/link';
import { Radio, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  variant?: 'dashboard' | 'recipients';
  selectedState?: string;
  onStateChange?: (state: string) => void;
  onRefresh?: () => void;
  onSimulateThreat?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
  criticalAlertActive?: boolean;
}

export function Header({
  variant = 'dashboard',
  selectedState,
  onStateChange,
  onRefresh,
  onSimulateThreat,
  isRefreshing,
  lastUpdated,
  criticalAlertActive = false,
}: HeaderProps) {
  const logoBlock = (
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
  );

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        {variant === 'recipients' ? (
          <Link href="/" className="hover:opacity-90 transition-opacity">
            {logoBlock}
          </Link>
        ) : (
          logoBlock
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          {variant === 'recipients' ? (
            <>
              <Link href="/">
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <span className="text-sm text-gray-600 font-medium">
                Manage Staff
              </span>
            </>
          ) : (
            <>
              <Link href="/recipients">
                <Button variant="secondary" size="sm">
                  Manage Staff
                </Button>
              </Link>

              {selectedState != null && onStateChange && (
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
              )}

              {onRefresh && (
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
              )}

              {onSimulateThreat && (
                <Button variant="outline" onClick={onSimulateThreat}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Simulate Threat
                </Button>
              )}

              <CriticalAlertLamp active={criticalAlertActive} />

              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated: {lastUpdated}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
