'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CreatorProvider } from '@/context/creator-context';
import { LoadingSpinner } from '../shared/loading';
import { Alert } from '../shared/alert';
import { getCreatorTheme } from '../utils/theme.util';
import { CreatorHeader, CreatorTabs } from './creator-ui';
import { CreatorTab } from './types/creator-tab.type';
import { useCrowdfundingProgram } from '@/data-access/crowdfunding-data-access';

const creatorTabs: CreatorTab[] = [
  { id: 1, label: 'About', path: '' },
  { id: 2, label: 'Campaigns', path: 'campaigns' },
];

export function CreatorLayout({ children }: { children: ReactNode }) {
  const { getCreatorByUsername } = useCrowdfundingProgram();

  const [activePath, setActivePath] = useState<string | null>(null);
  const params = useParams<{ username: string }>();
  const {
    data: creator,
    isLoading,
    isSuccess,
    isError,
  } = getCreatorByUsername(params.username);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname); // Get the current path from window.location
    }
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner className="mt-4">
        Loading creator profile...
      </LoadingSpinner>
    );
  }

  if (isError) {
    return (
      <Alert className="m-4 bg-red-500 text-white">
        An error occurred while loading the creator profile. Please try again
        later.
      </Alert>
    );
  }

  if (isSuccess && creator) {
    return (
      <CreatorProvider creator={creator}>
        <div style={getCreatorTheme(creator.themeColor)}>
          <CreatorHeader creator={creator} />
          <CreatorTabs
            tabs={creatorTabs}
            basePath={`/creator/${creator.username}`}
            activePath={activePath}
          />
          <div className="mx-auto max-w-screen-xl p-4">{children}</div>
        </div>
      </CreatorProvider>
    );
  }
}
