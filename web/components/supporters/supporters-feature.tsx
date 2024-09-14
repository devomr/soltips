'use client';

import DashboardLayout from '../layouts/dashboard-layout';
import { SupportersList } from './supporters-list';
import { useCreator } from '@/context/creator-context';

export default function ManageSupportersFeature() {
  return (
    <DashboardLayout>
      <ManageSupportersSection />
    </DashboardLayout>
  );
}

function ManageSupportersSection() {
  const { creator } = useCreator();

  if (!creator) {
    return null;
  }

  return (
    <div className="rounded-box bg-white p-4">
      <h2 className="mb-4 text-xl font-semibold">Supporters 🤝</h2>
      <SupportersList creator={creator} />
    </div>
  );
}
