'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import DashboardLayout from '../dashboard/dashboard-layout';
import EditProfileForm from './edit-profile-form';

export default function ProfileFeature() {
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  if (creator) {
    return (
      <DashboardLayout>
        <div className="rounded-box bg-white p-4">
          <h2 className="mb-4 text-xl font-semibold">My Profile</h2>
          <EditProfileForm />
        </div>
      </DashboardLayout>
    );
  }
}
