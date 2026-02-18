'use client';

import type { Threat } from '@/lib/types';
import { Card, Button } from '@/components/ui';
import { AlertTriangle, MapPin } from 'lucide-react';

interface CriticalAlertModalProps {
  open: boolean;
  criticalThreats: Threat[];
  onAcknowledge: () => void;
}

export function CriticalAlertModal({
  open,
  criticalThreats,
  onAcknowledge,
}: CriticalAlertModalProps) {
  if (!open || criticalThreats.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <Card className="w-full max-w-md mx-4 animate-fade-in" padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Critical threat detected
          </h2>
          <p className="text-gray-600 mb-4">
            {criticalThreats.length === 1
              ? 'One critical threat requires your attention.'
              : `${criticalThreats.length} critical threats require your attention.`}
          </p>

          <ul className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2 max-h-48 overflow-y-auto">
            {criticalThreats.map((t) => (
              <li key={t.id} className="flex gap-2 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500 mt-0.5" />
                <span>
                  <span className="font-medium text-gray-900">{t.type}</span>
                  <span className="text-gray-600"> – {t.location.areaDesc}</span>
                </span>
              </li>
            ))}
          </ul>

          <Button onClick={onAcknowledge} className="w-full">
            I&apos;ve seen the alert
          </Button>
        </div>
      </Card>
    </div>
  );
}
