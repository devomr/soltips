'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { useEffect } from 'react';


export default function DashboardFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  useEffect(() => {
    if (!creator) {
      // redirect not logged in users to landing page
      router.push('/');
    }

  }, [creator]);

  return (
    <div>
      dashboard
    </div>
  );
}
