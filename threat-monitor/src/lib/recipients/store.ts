import { promises as fs } from 'fs';
import path from 'path';
import type { Recipient } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECIPIENTS_PATH = path.join(DATA_DIR, 'recipients.json');

async function ensureFile(): Promise<void> {
  try {
    await fs.access(RECIPIENTS_PATH);
  } catch {
    // If file does not exist, create an empty array file
    await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
    await fs.writeFile(RECIPIENTS_PATH, '[]', 'utf-8');
  }
}

export async function getRecipients(): Promise<Recipient[]> {
  await ensureFile();
  const raw = await fs.readFile(RECIPIENTS_PATH, 'utf-8');
  try {
    const parsed = JSON.parse(raw) as Recipient[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecipients(recipients: Recipient[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await fs.writeFile(RECIPIENTS_PATH, JSON.stringify(recipients, null, 2), 'utf-8');
}

export async function addRecipient(recipient: Recipient): Promise<Recipient> {
  const recipients = await getRecipients();
  const next = [...recipients, recipient];
  await saveRecipients(next);
  return recipient;
}

export async function updateRecipient(id: string, updates: Partial<Recipient>): Promise<Recipient | null> {
  const recipients = await getRecipients();
  const idx = recipients.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const updated: Recipient = { ...recipients[idx], ...updates, id };
  const next = [...recipients];
  next[idx] = updated;
  await saveRecipients(next);
  return updated;
}

export async function deleteRecipient(id: string): Promise<boolean> {
  const recipients = await getRecipients();
  const next = recipients.filter((r) => r.id !== id);
  const changed = next.length !== recipients.length;
  if (changed) {
    await saveRecipients(next);
  }
  return changed;
}

