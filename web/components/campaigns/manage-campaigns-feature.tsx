'use client';

import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useCreator } from '@/context/creator-context';
import { CreateCampaignModal } from './ui/modals/create-campaign-modal';
import NoData from '../shared/no-data';
import { LoadingSpinner } from '../shared/loading';
import { lamportsToSol } from '../utils/conversion.util';
import { WithdrawCampaignFunds } from './ui/modals/withdraw-campaign-funds';
import DashboardLayout from '../layouts/dashboard-layout';
import {
  Campaign,
  Creator,
  useCrowdfundingProgram,
} from '@/data-access/crowdfunding-data-access';

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
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <h2 className="text-xl font-semibold">Campaigns 💰</h2>
          <button
            className="btn rounded-full bg-purple-800 text-white hover:bg-purple-800 hover:bg-opacity-90"
            onClick={(_) => setCreateCampaignModal(true)}
          >
            <IconPlus />
            Create campaign
          </button>
        </div>
        <ManageCampaignsList creator={creator} />
      </div>
      <CreateCampaignModal
        hide={() => setCreateCampaignModal(false)}
        address={creator.owner}
        show={showCreateCampaignModal}
      />
    </>
  );
}

function ManageCampaignsList({ creator }: { creator: Creator }) {
  const { listCampaigns } = useCrowdfundingProgram();
  const { data: campaigns, isLoading } = listCampaigns(creator.owner);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  if (isLoading) {
    return (
      <LoadingSpinner className="my-4">
        Loading the list of campaigns...
      </LoadingSpinner>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return <NoData className="my-4">You don't have any campaigns yet</NoData>;
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Target</th>
            <th>Donated</th>
            <th>Withdrawn</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, index) => {
            const targetAmount = campaign.targetAmount.toNumber();
            const amountDonated = campaign.amountDonated.toNumber();
            const amountWithdrawn = campaign.amountWithdrawn.toNumber();
            const donatedPercentage = (amountDonated / targetAmount) * 100;

            const status = donatedPercentage < 100 ? 'Ongoing' : 'Completed';

            return (
              <tr className="hover" key={index}>
                <td>
                  <a
                    href={`/creator/${creator.username}/campaigns/${campaign.id.toNumber()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-semibold no-underline hover:underline"
                  >
                    {campaign.name}
                  </a>
                </td>
                <td>
                  <div className="badge badge-primary whitespace-nowrap">
                    {status} {donatedPercentage}%
                  </div>
                </td>

                <td>{lamportsToSol(targetAmount)} SOL</td>
                <td>{lamportsToSol(amountDonated)} SOL</td>
                <td>{lamportsToSol(amountWithdrawn)} SOL</td>
                <td>
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-sm rounded-full bg-purple-800 text-white hover:bg-purple-800 hover:bg-opacity-90"
                    >
                      Actions
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                    >
                      <li>
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCampaign(campaign);
                            setShowWithdrawModal(true);
                          }}
                        >
                          💸 Withdraw funds
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedCampaign !== null && (
        <WithdrawCampaignFunds
          hide={() => setShowWithdrawModal(false)}
          campaign={selectedCampaign}
          show={showWithdrawModal}
        />
      )}
    </div>
  );
}
