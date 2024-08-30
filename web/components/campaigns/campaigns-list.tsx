import {
  Campaign,
  useCampaigns,
} from '@/components/data-access/crowdfunding-data-access';
import LoadingSpinner from '@/components/shared/loading';
import NoData from '@/components/shared/no-data';
import { PublicKey } from '@solana/web3.js';
import { lamportsToSol } from '../utils/conversion.util';
import { useState } from 'react';
import { MakeCampaignDonationModal } from './modals/make-campaign-donation-modal';
import { WithdrawCampaignFunds } from './modals/withdraw-campaign-funds-modal';

type CampaignsListProps = {
  address: PublicKey;
};

export const CampaignsList: React.FC<CampaignsListProps> = ({ address }) => {
  const { data: campaigns, isLoading } = useCampaigns({ address: address });

  if (isLoading) {
    return (
      <LoadingSpinner
        className="my-4"
        message="Loading the list of campaigns..."
      />
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return <NoData className="my-4">You don't have any campaigns yet.</NoData>;
  }

  console.log(campaigns);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {campaigns.map((campaign: Campaign, index) => (
        <CampaignCard key={index} campaign={campaign} address={address} />
      ))}
    </div>
  );
};

const CampaignCard: React.FC<{
  campaign: Campaign;
  address: PublicKey;
}> = ({ campaign, address }) => {
  const [showDonateModal, setDonateModal] = useState(false);
  const [showWithdrawModal, setWithdrawModal] = useState(false);

  const isOwner = campaign.owner.equals(address);
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const amountWithdrawn = campaign.amountWithdrawn.toNumber();

  const fundaAvailable = amountDonated - amountWithdrawn;
  const donatedPercentage = (amountDonated / targetAmount) * 100;

  return (
    <>
      <div className="rounded-lg bg-white p-4 drop-shadow">
        <h3 className="mb-3 text-lg font-semibold">{campaign.name}</h3>
        <progress
          className="progress progress-success mb-1 block w-full"
          value={donatedPercentage}
          max="100"
        ></progress>
        <p className="text-sm">
          <span className="font-bold">{donatedPercentage}%</span>
          {campaign.isTargetAmountVisible && (
            <span className="ml-1">
              of {lamportsToSol(campaign.targetAmount.toNumber())} SOL target
            </span>
          )}
        </p>
        {isOwner && (
          <button
            className="btn my-4 w-full rounded-full bg-purple-600 text-white hover:bg-purple-600"
            disabled={fundaAvailable <= 0}
            onClick={(_) => setWithdrawModal(true)}
          >
            Withdraw
          </button>
        )}

        {!isOwner && (
          <button
            className="btn my-4 w-full rounded-full bg-purple-600 text-white hover:bg-purple-600"
            onClick={(_) => setDonateModal(true)}
          >
            Donate
          </button>
        )}
        <p className="text-gray-700">{campaign.description}</p>
      </div>

      {isOwner && (
        <WithdrawCampaignFunds
          hide={() => setWithdrawModal(false)}
          campaign={campaign}
          show={showWithdrawModal}
        />
      )}

      {!isOwner && (
        <MakeCampaignDonationModal
          hide={() => setDonateModal(false)}
          campaign={campaign}
          show={showDonateModal}
        />
      )}
    </>
  );
};
