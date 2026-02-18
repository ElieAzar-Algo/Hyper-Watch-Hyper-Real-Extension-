import { NextRequest, NextResponse } from 'next/server';
import type { Recipient } from '@/lib/recipients/types';
import { getRecipients, addRecipient } from '@/lib/recipients/store';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const recipients = await getRecipients();
  return NextResponse.json(recipients);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Recipient>;

    if (!body.fullName || !body.email || !body.phone || !body.role || !body.category) {
      return NextResponse.json(
        { error: 'fullName, email, phone, role, and category are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const recipient: Recipient = {
      id,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      category: body.category,
      isActive: body.isActive ?? true,
    };

    const saved = await addRecipient(recipient);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating recipient:', error);
    return NextResponse.json({ error: 'Failed to create recipient' }, { status: 500 });
  }
}

