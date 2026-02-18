'use client';

import { useState, useCallback } from 'react';
import type { Threat, DraftResponse, Severity } from '@/lib/types';
import { STATE_CENTERS } from '@/lib/types';
import { useThreats } from '@/lib/hooks';
import { Header } from '@/components/features/layout';
import { ThreatMap, ThreatList } from '@/components/features/threats';
import { DraftPanel } from '@/components/features/drafts';
import { Card, Button, Spinner } from '@/components/ui';
import { CheckCircle, X } from 'lucide-react';

export default function HomePage() {
  const [selectedState, setSelectedState] = useState('CA');
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sentDraft, setSentDraft] = useState<DraftResponse | null>(null);
  const [sendResult, setSendResult] = useState<{
    email: { attempted: number; succeeded: number; failed: number };
    sms: { attempted: number; succeeded: number; failed: number };
    simulated: boolean;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const {
    threats,
    isLoading,
    error,
    lastUpdated,
    refresh,
    addSimulatedThreat,
  } = useThreats({
    state: selectedState,
    refreshInterval: 60000,
    autoRefresh: true,
  });

  const handleThreatSelect = useCallback((threat: Threat) => {
    setSelectedThreat(threat);
  }, []);

  const handleSimulateThreat = useCallback(() => {
    const center = STATE_CENTERS[selectedState] || { lat: 37.7749, lng: -122.4194 };
    
    const simulatedTypes = [
      { type: 'Flash Flood Warning', severity: 'warning' as Severity, source: 'nws' as const },
      { type: 'Severe Thunderstorm', severity: 'watch' as Severity, source: 'nws' as const },
      { type: 'Earthquake', severity: 'critical' as Severity, source: 'usgs' as const, magnitude: 5.2 },
      { type: 'Air Quality Alert', severity: 'warning' as Severity, source: 'airquality' as const, aqi: 165 },
    ];

    const randomType = simulatedTypes[Math.floor(Math.random() * simulatedTypes.length)];

    const simulatedThreat: Threat = {
      id: `sim-${Date.now()}`,
      source: randomType.source,
      type: randomType.type,
      severity: randomType.severity,
      title: `[SIMULATED] ${randomType.type}`,
      description: `This is a simulated ${randomType.type.toLowerCase()} for demonstration purposes. In a real scenario, this would contain actual alert details.`,
      location: {
        lat: center.lat + (Math.random() - 0.5) * 2,
        lng: center.lng + (Math.random() - 0.5) * 2,
        areaDesc: `Simulated Location, ${selectedState}`,
      },
      startTime: new Date().toISOString(),
      magnitude: randomType.magnitude,
      aqi: randomType.aqi,
    };

    addSimulatedThreat(simulatedThreat);
    setSelectedThreat(simulatedThreat);
  }, [selectedState, addSimulatedThreat]);

  const handleSend = useCallback(
    async (draft: DraftResponse) => {
      setSentDraft(draft);
      setIsSending(true);

      const channels = draft.channels.filter(
        (c) => c === 'email' || c === 'sms'
      );

      try {
        const res = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: draft.message,
            audiences: draft.audiences,
            channels,
            threat: selectedThreat
              ? {
                  id: selectedThreat.id,
                  type: selectedThreat.type,
                  severity: selectedThreat.severity,
                  state: selectedState,
                  source: selectedThreat.source,
                }
              : undefined,
          }),
        });

        if (!res.ok) {
          console.error('Notify failed', await res.json());
          setSendResult(null);
        } else {
          const data = await res.json();
          setSendResult(data);
        }
      } catch (err) {
        console.error('Notify error', err);
        setSendResult(null);
      } finally {
        setIsSending(false);
      }

      setShowSendModal(true);
    },
    [selectedThreat, selectedState]
  );

  const closeSendModal = useCallback(() => {
    setShowSendModal(false);
    setSentDraft(null);
    setSendResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Header
        selectedState={selectedState}
        onStateChange={setSelectedState}
        onRefresh={refresh}
        onSimulateThreat={handleSimulateThreat}
        isRefreshing={isLoading}
        lastUpdated={lastUpdated || undefined}
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Threat List */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm overflow-hidden">
            <ThreatList
              threats={threats}
              selectedThreat={selectedThreat}
              onThreatSelect={handleThreatSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Center - Map */}
          <div className="col-span-5 bg-white rounded-lg shadow-sm overflow-hidden">
            <ThreatMap
              threats={threats}
              selectedState={selectedState}
              selectedThreat={selectedThreat}
              onThreatSelect={handleThreatSelect}
            />
          </div>

          {/* Right Panel - Draft */}
          <div className="col-span-4">
            <DraftPanel threat={selectedThreat} onSend={handleSend} />
          </div>
        </div>
      </main>

      {/* Sending overlay */}
      {isSending && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[1000]">
          <Spinner size="lg" className="text-white" />
          <p className="mt-3 text-sm text-white font-medium">Sending...</p>
        </div>
      )}

      {/* Send Confirmation Modal */}
      {showSendModal && sentDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <Card className="w-full max-w-md mx-4 animate-fade-in" padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Alert Sent to Hyper Watch Staff
              </h2>
              <p className="text-gray-600 mb-6">
                Your alert has been processed for internal Hyper Watch staff.
                {sendResult && (
                  <>
                    {' '}
                    Emails attempted: {sendResult.email.attempted}, succeeded:{' '}
                    {sendResult.email.succeeded}. SMS attempted:{' '}
                    {sendResult.sms.attempted}, succeeded:{' '}
                    {sendResult.sms.succeeded}.
                  </>
                )}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Message Preview:</p>
                <p className="text-sm text-gray-600 italic">&quot;{sentDraft.message}&quot;</p>
              </div>

              <div className="flex gap-3 text-sm text-gray-500 justify-center mb-6">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {sentDraft.audiences.length} segments
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {sentDraft.channels.map(c => c.toUpperCase()).join(', ')}
                </span>
              </div>

              <Button onClick={closeSendModal} className="w-full">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>

              <p className="text-xs text-gray-400 mt-4">
                {sendResult?.simulated
                  ? 'No email/SMS providers configured. Notifications were simulated (logged only).'
                  : 'Notifications were dispatched via configured email/SMS providers.'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <p className="font-medium">Error loading threats</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}
    </div>
  );
}
