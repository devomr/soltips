'use client';

import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useCreator } from '@/context/creator-context';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { CampaignsList, CreateCampaignModal } from './campaign-ui';

export default function ManageCampaignsFeature() {
  return (
    <DashboardLayout>
      <ManageCampaignsSection />
    </DashboardLayout>
  );
}

function ManageCampaignsSection() {
  const { creator } = useCreator();
  const [showCreateCampaignModal, setCreateCampaignModal] = useState(false);

  if (!creator) {
    return null;
  }

  return (
    <>
      <div className="rounded-box bg-white p-4">
        <div className="mb-4 flex justify-between">
          <h2 className="mb-4 text-xl font-semibold">Campaigns 💰</h2>
          <button
            className="btn btn-md rounded-full"
            onClick={(_) => setCreateCampaignModal(true)}
          >
            <IconPlus />
            Create campaign
          </button>
        </div>
        <CampaignsList creator={creator} />
      </div>
      <CreateCampaignModal
        hide={() => setCreateCampaignModal(false)}
        address={creator.owner}
        show={showCreateCampaignModal}
      />
    </>
  );
}
