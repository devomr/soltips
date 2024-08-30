'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { useEffect, useState } from 'react';
import DashboardLayout from '../dashboard/dashboard-layout';
import { IconPlus } from '@tabler/icons-react';
import { CampaignsList } from './campaigns-list';
import { CreateCampaignModal } from './modals/create-campaign-modal';

export default function CampaignsFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  const [showCreateCampaignModal, setCreateCampaignModal] = useState(false);

  if (!publicKey) {
    return null;
  }

  // useEffect(() => {
  //   if (!creator) {
  //     router.push('/');
  //   }
  // }, [creator, router]);

  if (creator) {
    return (
      <DashboardLayout>
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
          <CampaignsList address={publicKey} />
        </div>
        <CreateCampaignModal
          hide={() => setCreateCampaignModal(false)}
          address={publicKey}
          show={showCreateCampaignModal}
        />
      </DashboardLayout>
    );
  }
}
