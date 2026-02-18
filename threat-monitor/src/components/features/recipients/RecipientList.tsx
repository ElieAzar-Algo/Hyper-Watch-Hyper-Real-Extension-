'use client';

import { useEffect, useState } from 'react';
import type { Recipient, RecipientRole, RecipientCategory } from '@/lib/recipients/types';
import { Card, Button } from '@/components/ui';

const ROLES: RecipientRole[] = [
  'Emergency Manager',
  '911 Supervisor',
  'Dispatcher',
  'IT/Systems',
  'Communications/PIO',
];

const CATEGORIES: RecipientCategory[] = [
  'Public Safety',
  '911 Center',
  'Municipality',
  'School',
  'Utility',
];

export function RecipientList() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Recipient | null>(null);
  const [form, setForm] = useState<Omit<Recipient, 'id'>>({
    fullName: '',
    email: '',
    phone: '',
    role: 'Emergency Manager',
    category: 'Public Safety',
    isActive: true,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recipients');
      if (!res.ok) {
        throw new Error('Failed to load recipients');
      }
      const data = (await res.json()) as Recipient[];
      setRecipients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'Emergency Manager',
      category: 'Public Safety',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        ...form,
      };

      let res: Response;

      if (editing) {
        res = await fetch(`/api/recipients/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/recipients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save recipient');
      }

      await load();
      resetForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save recipient');
    }
  };

  const handleEdit = (r: Recipient) => {
    setEditing(r);
    setForm({
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
      role: r.role,
      category: r.category,
      isActive: r.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recipient?')) return;
    try {
      const res = await fetch(`/api/recipients/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete recipient');
      }
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete recipient');
    }
  };

  const handleToggleActive = async (r: Recipient) => {
    try {
      const res = await fetch(`/api/recipients/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      if (!res.ok) {
        throw new Error('Failed to update recipient');
      }
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update recipient');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Hyper Watch Staff Recipients</h2>
          <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mb-3">
            {error}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-4">{r.fullName}</td>
                  <td className="py-2 pr-4">{r.email}</td>
                  <td className="py-2 pr-4">{r.phone}</td>
                  <td className="py-2 pr-4">{r.role}</td>
                  <td className="py-2 pr-4">{r.category}</td>
                  <td className="py-2 pr-4">
                    <button
                      className={`px-2 py-0.5 rounded text-xs ${
                        r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                      onClick={() => void handleToggleActive(r)}
                    >
                      {r.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-2 pr-4 space-x-2">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => handleEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => void handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {recipients.length === 0 && !loading && (
                <tr>
                  <td className="py-4 text-gray-500 text-sm" colSpan={7}>
                    No recipients configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-lg mb-4">
          {editing ? 'Edit Recipient' : 'Add Recipient'}
        </h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as RecipientRole })
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as RecipientCategory })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="submit" size="sm">
              {editing ? 'Save Changes' : 'Add Recipient'}
            </Button>
            {editing && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

