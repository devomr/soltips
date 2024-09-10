// components/Layout.tsx
import { ReactNode } from 'react';
import Sidebar from './sidebar';
import { CreatorProvider } from '@/context/creator-context';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import NoData from '../shared/no-data';
import { getRGBColor, getAccessibleTextColor } from '../utils/theme.util';
import { LoadingSpinner } from '../shared/loading';

interface DashboardLayoutProps {
  children: ReactNode;
}

function getCreatorTheme(color: string) {
  const primaryColor = getRGBColor(color, 'creator-theme-color');
  const textColor100 = getRGBColor(
    getAccessibleTextColor(color, 1),
    'creator-theme-text-color-100',
  );
  const textColor20 = getRGBColor(
    getAccessibleTextColor(color, 0.2),
    'creator-theme-text-color-20',
  );

  return {
    ...primaryColor,
    ...textColor100,
    ...textColor20,
  } as React.CSSProperties;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { publicKey } = useWallet();
  const { data: creator, isLoading } = useGetCreatorByAddress({
    address: publicKey,
  });

  if (isLoading) {
    return (
      <LoadingSpinner className="mt-4">Loading your profile...</LoadingSpinner>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto max-w-screen-xl p-4">
        <NoData className="my-4">Your profile cannot be found.</NoData>
      </div>
    );
  }

  return (
    <CreatorProvider creator={creator}>
      <div style={getCreatorTheme(creator.themeColor)}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-auto bg-gray-100 p-4">{children}</div>
        </div>
      </div>
    </CreatorProvider>
  );
};

export default DashboardLayout;
