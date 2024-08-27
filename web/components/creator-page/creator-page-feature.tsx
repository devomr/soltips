'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import DashboardLayout from '../dashboard/dashboard-layout';
import EditCreatorPageForm from './edit-creator-page-form';

export default function CreatorPageFeature() {
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  if (creator) {
    return (
      <DashboardLayout>
        <div className="rounded-box bg-white p-4">
          <h2 className="mb-4 text-xl font-semibold">
            Customize your creator page
          </h2>
          <EditCreatorPageForm />
        </div>
      </DashboardLayout>
    );
  }
}
