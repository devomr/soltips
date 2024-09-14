'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorProvider } from '@/context/creator-context';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { getCreatorTheme } from '../utils/theme.util';
import Sidebar from './sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator, isLoading } = useGetCreatorByAddress({
    address: publicKey,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent redirection until both the creator data and wallet connection are checked
    if (!isLoading) {
      if (!creator) {
        // Redirect to the landing page if no creator found
        router.push('/');
      } else {
        // Stop the loading state once the creator is available
        setLoading(false);
      }
    }
  }, [creator, isLoading, router]);

  if (loading || isLoading) {
    // Display nothing or a loading state until the check is completed
    return null;
  }

  if (creator) {
    return (
      <CreatorProvider creator={creator}>
        <div style={getCreatorTheme(creator.themeColor)}>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              {children}
            </div>
          </div>
        </div>
      </CreatorProvider>
    );
  }
}
