'use client';

import { useCreator } from '@/context/creator-context';
import { CreatorLayout } from '../creator/creator-layout';
import { CreatorCampaignsList } from './ui/creator-campaigns-list';

export default function CreatorCampaignsFeature() {
  return (
    <CreatorLayout>
      <CreatorCampaignsSection />
    </CreatorLayout>
  );
}

function CreatorCampaignsSection() {
  const { creator } = useCreator();

  if (!creator) {
    return null;
  }

  return <CreatorCampaignsList creator={creator} />;
}
