/**
 * OpenAI API Client for message drafting
 */

import OpenAI from 'openai';
import type { Threat, DraftResponse, Channel } from '../types';

// Lazy-load OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openaiClient;
}

/**
 * System prompt for the AI message drafter
 */
const SYSTEM_PROMPT = `You are an emergency notification specialist helping emergency managers draft alert messages for the Hyper-Reach mass notification platform.

Your role is to:
1. Create clear, concise, and actionable alert messages
2. Suggest appropriate audience segments to notify
3. Recommend the best notification channels based on urgency

Guidelines for alert messages:
- Keep messages under 160 characters when possible (SMS limit)
- Start with the most critical information
- Include clear action items (e.g., "Seek shelter immediately", "Avoid the area")
- Avoid jargon and use plain language
- Include timeframes when relevant
- End with a source attribution when appropriate

For audience segments, consider:
- Geographic targeting (affected areas, evacuation zones)
- Demographic groups (schools, elderly care facilities, hospitals)
- Special needs (hearing impaired, mobility limited)
- Business categories (restaurants, retail, industrial)

For channel recommendations:
- SMS: Urgent, time-sensitive alerts
- Voice: Critical alerts, elderly population
- Email: Non-urgent updates, detailed information
- App: Push notifications, ongoing updates`;

/**
 * Generate an alert message draft for a given threat
 */
export async function generateAlertDraft(
  threat: Threat,
  context?: string
): Promise<DraftResponse> {
  const openai = getOpenAIClient();
  
  // Return fallback if no API key
  if (!openai) {
    return {
      message: getDefaultMessage(threat),
      audiences: getDefaultAudiences(threat),
      channels: getDefaultChannels(threat),
    };
  }

  const userPrompt = `Generate an emergency alert for the following threat:

Type: ${threat.type}
Severity: ${threat.severity.toUpperCase()}
Location: ${threat.location.areaDesc}
Description: ${threat.description}
${threat.magnitude ? `Magnitude: ${threat.magnitude}` : ''}
${threat.aqi != null ? `AQI: ${threat.aqi}` : ''}
${context ? `\nAdditional Context: ${context}` : ''}

Please provide:
1. A concise alert message (under 160 characters if possible)
2. 3-5 recommended audience segments to notify
3. Recommended notification channels in order of priority

Format your response as JSON:
{
  "message": "Your alert message here",
  "audiences": ["Segment 1", "Segment 2", "Segment 3"],
  "channels": ["sms", "email"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content) as DraftResponse;
    
    // Validate and sanitize the response
    return {
      message: parsed.message || getDefaultMessage(threat),
      audiences: parsed.audiences || getDefaultAudiences(threat),
      channels: validateChannels(parsed.channels) || getDefaultChannels(threat),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Return fallback response if API fails
    return {
      message: getDefaultMessage(threat),
      audiences: getDefaultAudiences(threat),
      channels: getDefaultChannels(threat),
    };
  }
}

/**
 * Validate channel array
 */
function validateChannels(channels: unknown): Channel[] | null {
  if (!Array.isArray(channels)) return null;
  
  const validChannels: Channel[] = ['sms', 'email'];
  const filtered = channels.filter((c): c is Channel => 
    validChannels.includes(c as Channel)
  );
  
  return filtered.length > 0 ? filtered : null;
}

/**
 * Default message based on threat type
 */
function getDefaultMessage(threat: Threat): string {
  const location = threat.location.areaDesc.split(',')[0]; // First part of location
  
  switch (threat.source) {
    case 'nws':
      return `${threat.severity.toUpperCase()}: ${threat.type} for ${location}. Monitor local news for updates. Stay safe.`;
    case 'usgs':
      return `EARTHQUAKE ALERT: M${threat.magnitude?.toFixed(1) || '?'} earthquake reported near ${location}. Check for damage. Be prepared for aftershocks.`;
    case 'airquality':
      return `AIR QUALITY ALERT: AQI ${threat.aqi ?? 'elevated'} in ${location}. Limit outdoor exposure. Check air quality updates.`;
    default:
      return `ALERT: ${threat.type} in ${location}. Follow official guidance.`;
  }
}

/**
 * Default audiences based on threat type
 */
function getDefaultAudiences(threat: Threat): string[] {
  const base = [`Residents of ${threat.location.areaDesc.split(',')[0]}`];
  
  switch (threat.source) {
    case 'nws':
      return [
        ...base,
        'Schools and educational facilities',
        'Emergency response teams',
        'Healthcare facilities',
        'Public transit operators',
      ];
    case 'usgs':
      return [
        ...base,
        'Building managers',
        'Utility companies',
        'Search and rescue teams',
        'Hospital emergency departments',
      ];
    case 'airquality':
      return [
        ...base,
        'Schools and outdoor facilities',
        'Healthcare facilities',
        'Outdoor workers',
        'Sensitive groups (respiratory, elderly)',
      ];
    default:
      return base;
  }
}

/**
 * Default channels based on severity
 */
function getDefaultChannels(threat: Threat): Channel[] {
  switch (threat.severity) {
    case 'critical':
      return ['email', 'sms'];
    case 'warning':
      return ['email', 'sms'];
    case 'watch':
      return ['email', 'sms'];
    case 'advisory':
      return ['email'];
    default:
      return ['email', 'sms'];
  }
}
