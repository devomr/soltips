'use client';

import { useCreator } from '@/context/creator-context';
import { CampaignsList } from './campaign-ui';
import { CreatorLayout } from '../creator/creator-layout';

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

  return <CampaignsList creator={creator} />;
}
