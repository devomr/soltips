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
        <div className='rounded-md bg-white p-4'>
          <h3 className='font-bold text-xl mb-4'>
            Supporters 🤝
          </h3>

          <SupportersList username={creator.username} />
        </div>
      </DashboardLayout>
    );
  }
}
