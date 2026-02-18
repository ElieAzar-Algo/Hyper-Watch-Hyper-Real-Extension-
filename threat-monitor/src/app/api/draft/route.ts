/**
 * POST /api/draft
 * Generate an AI-drafted alert message for a given threat
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAlertDraft } from '@/lib/api/openai';
import type { Threat } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface DraftRequest {
  threat: Threat;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DraftRequest;

    if (!body.threat) {
      return NextResponse.json(
        { error: 'Threat data is required' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      // Return a default response if no API key is configured
      console.warn('OPENAI_API_KEY not configured, using default response');
      return NextResponse.json({
        message: `ALERT: ${body.threat.type} in ${body.threat.location.areaDesc}. Follow official guidance and stay safe.`,
        audiences: [
          `Residents of ${body.threat.location.areaDesc}`,
          'Emergency services',
          'Local businesses',
          'Schools and institutions',
        ],
        channels: ['sms', 'email'],
        note: 'Default response (OpenAI not configured)',
      });
    }

    const draft = await generateAlertDraft(body.threat, body.context);

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Draft generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
