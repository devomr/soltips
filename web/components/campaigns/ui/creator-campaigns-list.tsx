import {
  Creator,
  useCampaigns,
  Campaign,
} from '@/components/data-access/crowdfunding-data-access';
import { LoadingSpinner } from '@/components/shared/loading';
import NoData from '@/components/shared/no-data';
import { useState } from 'react';
import { MakeCampaignDonationModal } from './modals/make-campaign-donation-modal';
import { lamportsToSol } from '@/components/utils/conversion.util';
import { useWallet } from '@solana/wallet-adapter-react';
import { IconGift } from '@tabler/icons-react';

export function CreatorCampaignsList({ creator }: { creator: Creator }) {
  const { data: campaigns, isLoading } = useCampaigns({
    address: creator.owner,
  });
  const [showMakeDonationModal, setShowMakeDonationModal] = useState(false);
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
    return <NoData className="my-4">No campaigns found.</NoData>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign: Campaign, index) => (
          <CampaignCard
            key={index}
            campaign={campaign}
            handleMakeDonationClick={() => {
              setSelectedCampaign(campaign);
              setShowMakeDonationModal(true);
            }}
          />
        ))}
      </div>
      {selectedCampaign !== null && (
        <MakeCampaignDonationModal
          hide={() => setShowMakeDonationModal(false)}
          campaign={selectedCampaign}
          show={showMakeDonationModal}
        />
      )}
    </>
  );
}

function CampaignCard({
  campaign,
  handleMakeDonationClick,
}: {
  campaign: Campaign;
  handleMakeDonationClick: () => void;
}) {
  const { publicKey } = useWallet();

  const campaignId = campaign.id.toNumber();
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();

  const isOwner = publicKey !== null && campaign.owner.equals(publicKey);
  const donatedPercentage = (amountDonated / targetAmount) * 100;

  return (
    <div className="rounded-box space-y-2 bg-white p-4 transition-shadow duration-300 ease-in-out hover:shadow-md">
      <div className="bg-creator-primary flex h-[200px] items-center justify-center rounded-md bg-opacity-20">
        <IconGift className="text-creator-20" size={50} />
      </div>
      <h3 className="text-lg font-semibold">{campaign.name}</h3>
      <progress
        className="progress progress-success block w-full"
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
      {campaign.description && (
        <p className="text-gray-700">{campaign.description}</p>
      )}
      <div className="flex flex-col gap-2 md:flex-row">
        {!isOwner && (
          <button
            className="btn bg-creator-primary text-creator-100 hover:bg-creator-primary flex-1 rounded-full hover:bg-opacity-90"
            onClick={handleMakeDonationClick}
          >
            Support
          </button>
        )}
        <a
          href={`campaigns/${campaignId}`}
          className={`btn rounded-full ${isOwner ? 'flex-1' : ''}`}
          target="_blank"
        >
          View campaign
        </a>
      </div>
    </div>
  );
}
