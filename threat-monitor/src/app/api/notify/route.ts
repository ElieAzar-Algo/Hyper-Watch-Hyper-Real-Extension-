import { NextRequest, NextResponse } from 'next/server';
import { getRecipients } from '@/lib/recipients/store';
import type { Recipient } from '@/lib/recipients/types';
import { sendEmail, type NotifyContext } from '@/lib/notify/email';
import { sendSms } from '@/lib/notify/sms';

export const dynamic = 'force-dynamic';

type Channel = 'email' | 'sms';

interface NotifyRequestBody {
  message: string;
  audiences: string[];
  channels: Channel[];
  threat?: {
    id?: string;
    type: string;
    severity: string;
    state?: string;
    source?: string;
  };
}

interface NotifyResponse {
  email: { attempted: number; succeeded: number; failed: number };
  sms: { attempted: number; succeeded: number; failed: number };
  simulated: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NotifyRequestBody;

    if (!body.message || !Array.isArray(body.channels) || body.channels.length === 0) {
      return NextResponse.json(
        { error: 'message and at least one channel are required' },
        { status: 400 }
      );
    }

    const recipients = (await getRecipients()).filter((r) => r.isActive);
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No active recipients configured' },
        { status: 400 }
      );
    }

    const context: NotifyContext = {
      message: body.message,
      audiences: body.audiences ?? [],
      channels: body.channels,
      threatSummary: body.threat,
    };

    const wantsEmail = body.channels.includes('email');
    const wantsSms = body.channels.includes('sms');

    let emailAttempted = 0;
    let emailSucceeded = 0;
    let smsAttempted = 0;
    let smsSucceeded = 0;

    let simulated = false;

    const emailConfigured =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_PORT &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS;

    const smsConfigured =
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_FROM_NUMBER;

    if (!emailConfigured || !smsConfigured) {
      simulated = true;
    }

    const tasks: Promise<void>[] = [];

    const emailRecipients: Recipient[] = wantsEmail
      ? recipients.filter((r) => !!r.email)
      : [];
    const smsRecipients: Recipient[] = wantsSms
      ? recipients.filter((r) => !!r.phone)
      : [];

    for (const r of emailRecipients) {
      emailAttempted += 1;
      tasks.push(
        (async () => {
          const ok = await sendEmail(r, context);
          if (ok) emailSucceeded += 1;
        })()
      );
    }

    for (const r of smsRecipients) {
      smsAttempted += 1;
      tasks.push(
        (async () => {
          const ok = await sendSms(r, context);
          if (ok) smsSucceeded += 1;
        })()
      );
    }

    await Promise.all(tasks);

    const response: NotifyResponse = {
      email: {
        attempted: emailAttempted,
        succeeded: emailSucceeded,
        failed: emailAttempted - emailSucceeded,
      },
      sms: {
        attempted: smsAttempted,
        succeeded: smsSucceeded,
        failed: smsAttempted - smsSucceeded,
      },
      simulated,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

