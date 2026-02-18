import dns from 'node:dns';
import nodemailer from 'nodemailer';
import type { Recipient } from '@/lib/recipients/types';

export interface NotifyContext {
  message: string;
  audiences: string[];
  channels: ('email' | 'sms')[];
  threatSummary?: {
    id?: string;
    type: string;
    severity: string;
    state?: string;
    source?: string;
  };
}

/** Resolve SMTP host to IPv4 and create transport so SMTP works from runtimes (e.g. Railway) where IPv6 is unreachable. */
async function getTransport(): Promise<ReturnType<typeof nodemailer.createTransport> | null> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  let resolvedAddress: string;
  try {
    const resolved = await dns.promises.lookup(host, { family: 4 });
    resolvedAddress = resolved.address;
  } catch (err) {
    console.warn('[EMAIL] Failed to resolve SMTP host to IPv4:', host, err);
    return null;
  }

  return nodemailer.createTransport({
    host: resolvedAddress,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { servername: host },
  });
}

export async function sendEmail(
  recipient: Recipient,
  context: NotifyContext
): Promise<boolean> {
  const transporter = await getTransport();
  const from = process.env.EMAIL_FROM || 'hyperwatch-demo@example.com';

  if (!transporter) {
    console.log('[EMAIL][SIMULATED]', {
      to: recipient.email,
      from,
      subject: `Hyper Watch Alert: ${context.threatSummary?.type ?? 'Notification'}`,
    });
    return false;
  }

  const subject = `Hyper Watch Alert: ${context.threatSummary?.type ?? 'Notification'} (${context.threatSummary?.severity ?? 'advisory'})`;

  const bodyLines = [
    context.message,
    '',
    `Recommended audience segments: ${context.audiences.join(', ') || 'N/A'}`,
    `Channels: ${context.channels.join(', ') || 'N/A'}`,
    context.threatSummary
      ? `Threat: ${context.threatSummary.type} [${context.threatSummary.severity}]${context.threatSummary.state ? ` in ${context.threatSummary.state}` : ''}`
      : '',
    '',
    'Sent by Hyper Watch (demo integration).',
  ].filter(Boolean);

  try {
    await transporter.sendMail({
      from,
      to: recipient.email,
      subject,
      text: bodyLines.join('\n'),
    });
    return true;
  } catch (error) {
    console.error('Error sending email to', recipient.email, error);
    return false;
  }
}

