'use client';

import { Header } from '@/components/features/layout';
import { RecipientList } from '@/components/features/recipients/RecipientList';

export default function RecipientsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header variant="recipients" />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Hyper Watch Staff Recipients</h1>
          <p className="text-sm text-gray-600">
            Manage the internal Hyper-Reach staff who will receive email and SMS alerts when
            you click &quot;Send to Hyper Watch&quot;. Only active recipients are included.
          </p>
          <RecipientList />
        </div>
      </div>
    </div>
  );
}

