'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { useEffect } from 'react';
import DashboardLayout from '../dashboard/dashboard-layout';
import { SupportersList } from './supporters-list';

export default function SupportersFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  // useEffect(() => {
  //   if (!creator) {
  //     router.push('/');
  //   }
  // }, [creator, router]);

  if (creator) {
    return (
      <DashboardLayout>
        <div className="rounded-box bg-white p-4">
          <h2 className="mb-4 text-xl font-semibold">Supporters 🤝</h2>
          <SupportersList username={creator.username} />
        </div>
      </DashboardLayout>
    );
  }
}
