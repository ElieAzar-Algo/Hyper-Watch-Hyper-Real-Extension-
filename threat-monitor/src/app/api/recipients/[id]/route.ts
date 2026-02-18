import { NextRequest, NextResponse } from 'next/server';
import type { Recipient } from '@/lib/recipients/types';
import { getRecipients, saveRecipients } from '@/lib/recipients/store';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = (await request.json()) as Partial<Recipient>;

    const recipients = await getRecipients();
    const idx = recipients.findIndex((r) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const updated: Recipient = {
      ...recipients[idx],
      ...body,
      id,
    };

    const next = [...recipients];
    next[idx] = updated;
    await saveRecipients(next);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating recipient:', error);
    return NextResponse.json({ error: 'Failed to update recipient' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const recipients = await getRecipients();
    const next = recipients.filter((r) => r.id !== id);

    if (next.length === recipients.length) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    await saveRecipients(next);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json({ error: 'Failed to delete recipient' }, { status: 500 });
  }
}

