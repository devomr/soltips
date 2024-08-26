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
        <div className="rounded-md bg-white p-4">
          <h3 className="mb-4 text-xl font-bold">
            Customize your creator page
          </h3>
          <EditCreatorPageForm />
        </div>
      </DashboardLayout>
    );
  }
}
