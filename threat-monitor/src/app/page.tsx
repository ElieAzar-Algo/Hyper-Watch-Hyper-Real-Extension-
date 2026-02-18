'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Threat, DraftResponse, Severity } from '@/lib/types';
import { STATE_CENTERS } from '@/lib/types';
import { useThreats, useCriticalAlert } from '@/lib/hooks';
import { Header } from '@/components/features/layout';
import { ThreatMap, ThreatList, CriticalAlertModal, ThreatDetailsModal } from '@/components/features/threats';
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
    emailConfigured?: boolean;
    smsConfigured?: boolean;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [autoSmartAgentOn, setAutoSmartAgentOn] = useState(false);
  const [autoSentForCurrentCritical, setAutoSentForCurrentCritical] = useState(false);
  const [seenAtByThreatId, setSeenAtByThreatId] = useState<Record<string, string>>({});
  const [sentAtByThreatId, setSentAtByThreatId] = useState<Record<string, string>>({});
  const [threatForDetailsModal, setThreatForDetailsModal] = useState<Threat | null>(null);

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

  const {
    hasUnacknowledgedCritical,
    criticalThreats,
    acknowledge,
  } = useCriticalAlert(threats);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const beepContextRef = useRef<{ context: AudioContext; gain: GainNode; oscillator: OscillatorNode } | null>(null);
  const sirenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationShownRef = useRef(false);
  const autoSendTriggeredRef = useRef(false);

  const alertSoundSetting = process.env.NEXT_PUBLIC_CRITICAL_ALERT_SOUND ?? '/sounds/alert.mp3';

  // Play looping alert sound when critical is unacknowledged; stop when acknowledged
  useEffect(() => {
    if (!hasUnacknowledgedCritical) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (beepContextRef.current) {
        try {
          beepContextRef.current.gain.gain.setValueAtTime(0, beepContextRef.current.context.currentTime);
          beepContextRef.current.oscillator.stop();
        } catch {
          // already stopped
        }
        beepContextRef.current = null;
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      notificationShownRef.current = false;
      return;
    }

    const playBeep = () => {
      if (typeof window === 'undefined') return;
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        beepContextRef.current = { context: ctx, gain, oscillator: osc };
        const repeat = () => {
          const current = beepContextRef.current;
          if (!current) return;
          try {
            current.oscillator.stop(current.context.currentTime + 0.3);
            current.oscillator.disconnect();
          } catch {
            // already stopped
          }
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, ctx.currentTime);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc2.start(ctx.currentTime);
          beepContextRef.current = { context: ctx, gain, oscillator: osc2 };
          setTimeout(() => {
            if (beepContextRef.current?.context.state === 'running') repeat();
          }, 400);
        };
        setTimeout(repeat, 400);
      } catch {
        // ignore
      }
    };

    const playSiren = () => {
      if (typeof window === 'undefined') return;
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const gain = ctx.createGain();
        gain.gain.value = 0.12;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        beepContextRef.current = { context: ctx, gain, oscillator: osc };
        let freq = 600;
        let rising = true;
        sirenIntervalRef.current = setInterval(() => {
          if (!beepContextRef.current) return;
          const current = beepContextRef.current;
          try {
            current.oscillator.stop(current.context.currentTime + 0.25);
            current.oscillator.disconnect();
          } catch {
            // already stopped
          }
          freq = rising ? freq + 100 : freq - 100;
          if (freq >= 1200) rising = false;
          if (freq <= 600) rising = true;
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq, ctx.currentTime);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc2.start(ctx.currentTime);
          beepContextRef.current = { context: ctx, gain, oscillator: osc2 };
        }, 250);
      } catch {
        // ignore
      }
    };

    const playFile = (src: string) => {
      const audio = new Audio(src);
      audio.loop = true;
      audioRef.current = audio;
      audio.play().catch(() => {
        if (alertSoundSetting === 'builtin:siren') playSiren();
        else playBeep();
      });
    };

    if (alertSoundSetting === 'builtin:siren') {
      playSiren();
    } else if (alertSoundSetting === 'builtin:beep') {
      playBeep();
    } else {
      playFile(alertSoundSetting);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
    };
  }, [hasUnacknowledgedCritical, alertSoundSetting]);

  // Reset auto-send state when critical is acknowledged or cleared
  useEffect(() => {
    if (!hasUnacknowledgedCritical) {
      autoSendTriggeredRef.current = false;
      setAutoSentForCurrentCritical(false);
    }
  }, [hasUnacknowledgedCritical]);

  // Auto-send when critical appears and Auto Smart Agent is ON (once per batch)
  useEffect(() => {
    if (
      !hasUnacknowledgedCritical ||
      !autoSmartAgentOn ||
      criticalThreats.length === 0 ||
      autoSendTriggeredRef.current
    ) {
      return;
    }

    autoSendTriggeredRef.current = true;
    const threat = criticalThreats[0];

    const run = async () => {
      try {
        const draftRes = await fetch('/api/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threat }),
        });
        if (!draftRes.ok) return;

        const draft: DraftResponse = await draftRes.json();
        const channels: ('email' | 'sms')[] = ['email', 'sms'];

        const notifyRes = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: draft.message,
            audiences: draft.audiences,
            channels,
            threat: {
              id: threat.id,
              type: threat.type,
              severity: threat.severity,
              state: selectedState,
              source: threat.source,
            },
          }),
        });
        if (notifyRes.ok) {
          setAutoSentForCurrentCritical(true);
          setSentAtByThreatId((prev) => ({ ...prev, [threat.id]: new Date().toISOString() }));
        }
      } catch {
        // leave autoSentForCurrentCritical false
      }
    };

    void run();
  }, [hasUnacknowledgedCritical, autoSmartAgentOn, criticalThreats, selectedState]);

  // One-shot browser notification when critical appears
  useEffect(() => {
    if (!hasUnacknowledgedCritical || notificationShownRef.current || typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification('Hyper Watch: Critical threat', {
          body: 'One or more critical threats detected. Check the dashboard.',
        });
        notificationShownRef.current = true;
      } catch {
        // ignore
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') {
          try {
            new Notification('Hyper Watch: Critical threat', {
              body: 'One or more critical threats detected. Check the dashboard.',
            });
            notificationShownRef.current = true;
          } catch {
            // ignore
          }
        }
      });
    }
  }, [hasUnacknowledgedCritical]);

  const handleOpenDetails = useCallback((threat: Threat) => {
    setThreatForDetailsModal(threat);
    setSeenAtByThreatId((prev) => ({
      ...prev,
      [threat.id]: new Date().toISOString(),
    }));
  }, []);

  const handleThreatSelect = useCallback((threat: Threat) => {
    setSelectedThreat(threat);
    setSeenAtByThreatId((prev) => ({
      ...prev,
      [threat.id]: new Date().toISOString(),
    }));
  }, []);

  useEffect(() => {
    if (selectedThreat?.id) {
      setSeenAtByThreatId((prev) => ({
        ...prev,
        [selectedThreat.id]: new Date().toISOString(),
      }));
    }
  }, [selectedThreat?.id]);

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
          if (selectedThreat) {
            setSentAtByThreatId((prev) => ({ ...prev, [selectedThreat.id]: new Date().toISOString() }));
          }
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
        criticalAlertActive={hasUnacknowledgedCritical}
        autoSmartAgentOn={autoSmartAgentOn}
        onAutoSmartAgentChange={setAutoSmartAgentOn}
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
              onOpenDetails={handleOpenDetails}
              isLoading={isLoading}
              seenAtByThreatId={seenAtByThreatId}
              sentAtByThreatId={sentAtByThreatId}
            />
          </div>

          {/* Center - Map */}
          <div className="col-span-5 bg-white rounded-lg shadow-sm overflow-hidden">
            <ThreatMap
              threats={threats}
              selectedState={selectedState}
              selectedThreat={selectedThreat}
              onThreatSelect={handleThreatSelect}
              onOpenDetails={handleOpenDetails}
              sentAtByThreatId={sentAtByThreatId}
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

              {sendResult && !sendResult.emailConfigured && sentDraft.channels.includes('email') && (
                <p className="text-xs text-amber-700 mt-2">
                  Email not sent (SMTP not configured). Add SMTP_* to .env.local to enable email.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-4">
                {sendResult?.simulated
                  ? 'No email/SMS providers configured. Notifications were simulated (logged only).'
                  : 'Notifications were dispatched via configured email/SMS providers.'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Full-screen red overlay when critical threat is unacknowledged */}
      {hasUnacknowledgedCritical && (
        <div className="fixed inset-0 bg-red-600/40 z-[999]" aria-hidden />
      )}

      {/* Critical Alert Modal */}
      <CriticalAlertModal
        open={hasUnacknowledgedCritical}
        criticalThreats={criticalThreats}
        onAcknowledge={acknowledge}
        autoSent={autoSentForCurrentCritical}
      />

      {/* Threat Details Modal */}
      <ThreatDetailsModal
        open={!!threatForDetailsModal}
        threat={threatForDetailsModal}
        onClose={() => setThreatForDetailsModal(null)}
        sentAt={threatForDetailsModal ? sentAtByThreatId[threatForDetailsModal.id] : undefined}
      />

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
