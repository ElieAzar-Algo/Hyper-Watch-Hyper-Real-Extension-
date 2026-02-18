import twilio from 'twilio';
import type { Recipient } from '@/lib/recipients/types';
import type { NotifyContext } from './email';

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    return null;
  }

  const client = twilio(accountSid, authToken);
  return { client, from };
}

export async function sendSms(
  recipient: Recipient,
  context: NotifyContext
): Promise<boolean> {
  const twilioClient = getClient();

  const msgPart = context.message.length > 120 ? `${context.message.slice(0, 117)}...` : context.message;
  const line1 = `Hyper Watch: ${context.threatSummary?.type ?? 'Alert'} (${context.threatSummary?.severity ?? 'advisory'}) - ${msgPart}`;
  const audiencesPart = context.audiences.length > 0
    ? `Audiences: ${context.audiences.slice(0, 3).join('; ')}`
    : '';
  let text = line1;
  if (audiencesPart) {
    const withAudiences = `${line1}\n${audiencesPart}`;
    text = withAudiences.length <= 300 ? withAudiences : line1;
  }

  if (!twilioClient) {
    console.log('[SMS][SIMULATED]', {
      to: recipient.phone,
      from: 'TWILIO_FROM_NUMBER',
      text,
    });
    return false;
  }

  try {
    await twilioClient.client.messages.create({
      from: twilioClient.from,
      to: recipient.phone,
      body: text,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS to', recipient.phone, error);
    return false;
  }
}

