'use client';

import { useState, useEffect } from 'react';
import type { Threat, DraftResponse, Channel } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Wand2,
  Send,
  Copy,
  Check,
  MessageSquare,
  Phone,
  Mail,
  Smartphone,
  Users,
  RefreshCw,
} from 'lucide-react';

interface DraftPanelProps {
  threat: Threat | null;
  onSend?: (draft: DraftResponse) => void;
}

const channelIcons: Record<Channel, typeof MessageSquare> = {
  sms: MessageSquare,
  voice: Phone,
  email: Mail,
  app: Smartphone,
};

const channelLabels: Record<Channel, string> = {
  sms: 'SMS',
  voice: 'Voice Call',
  email: 'Email',
  app: 'Mobile App',
};

export function DraftPanel({ threat, onSend }: DraftPanelProps) {
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Generate draft when threat changes
  useEffect(() => {
    if (threat) {
      generateDraft(threat);
    } else {
      setDraft(null);
      setEditedMessage('');
      setSelectedChannels([]);
      setSelectedAudiences([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threat?.id]);

  const generateDraft = async (threatData: Threat) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat: threatData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const data = await response.json();
      setDraft(data);
      setEditedMessage(data.message);
      setSelectedChannels(data.channels);
      setSelectedAudiences(data.audiences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate draft');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const toggleAudience = (audience: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(audience)
        ? prev.filter((a) => a !== audience)
        : [...prev, audience]
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (onSend && draft) {
      onSend({
        message: editedMessage,
        audiences: selectedAudiences,
        channels: selectedChannels,
      });
    }
  };

  if (!threat) {
    return (
      <Card className="h-full">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Wand2 className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="font-medium text-gray-600 mb-2">No Threat Selected</h3>
          <p className="text-sm text-gray-500">
            Select a threat from the list or map to generate an AI-drafted alert message.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            AI Draft Assistant
          </CardTitle>
          {draft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateDraft(threat)}
              disabled={isLoading}
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Drafting for: <span className="font-medium">{threat.type}</span>
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-gray-600">Generating alert draft...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="secondary" onClick={() => generateDraft(threat)}>
              Try Again
            </Button>
          </div>
        ) : draft ? (
          <>
            {/* Message Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Alert Message
                </label>
                <span className={cn(
                  'text-xs',
                  editedMessage.length > 160 ? 'text-amber-600' : 'text-gray-500'
                )}>
                  {editedMessage.length}/160 characters
                </span>
              </div>
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter your alert message..."
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="mt-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy message'}
              </Button>
            </div>

            {/* Audience Segments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Audience Segments
                </label>
              </div>
              <div className="space-y-2">
                {draft.audiences.map((audience) => (
                  <label
                    key={audience}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedAudiences.includes(audience)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAudiences.includes(audience)}
                      onChange={() => toggleAudience(audience)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{audience}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Channels */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Notification Channels
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['sms', 'voice', 'email', 'app'] as Channel[]).map((channel) => {
                  const Icon = channelIcons[channel];
                  const isSelected = selectedChannels.includes(channel);

                  return (
                    <button
                      key={channel}
                      onClick={() => toggleChannel(channel)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {channelLabels[channel]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>

      {/* Footer Actions */}
      {draft && (
        <div className="border-t p-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={selectedChannels.length === 0 || selectedAudiences.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Hyper Watch
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            {selectedAudiences.length} segments • {selectedChannels.length} channels
          </p>
        </div>
      )}
    </Card>
  );
}
