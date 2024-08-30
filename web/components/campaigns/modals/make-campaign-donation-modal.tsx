import { useState } from 'react';
import { AppModal } from '../../ui/ui-layout';
import {
  Campaign,
  useCrowdfundingProgram,
} from '../../data-access/crowdfunding-data-access';
import { solToLamports } from '../../utils/conversion.util';

export function MakeCampaignDonationModal({
  hide,
  show,
  campaign,
}: {
  hide: () => void;
  show: boolean;
  campaign: Campaign;
}) {
  const { makeCampaignDonation } = useCrowdfundingProgram();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Donate to campaign"
      submitDisabled={!amount || makeCampaignDonation.isPending}
      submitLabel="Donate"
      submit={() => {
        const amountInLamports = solToLamports(parseFloat(amount));

        makeCampaignDonation
          .mutateAsync({
            name,
            amount: amountInLamports,
            address: campaign.owner,
            campaignId: campaign.id,
          })
          .then(() => hide());
      }}
    >
      <div className="space-y-2">
        <div>
          <label htmlFor="name" className="font-semibold">
            Name
          </label>
          <input
            id="name"
            disabled={makeCampaignDonation.isPending}
            type="text"
            placeholder="Name"
            className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="amount" className="font-semibold">
            Target amount (in SOL)
          </label>
          <input
            id="amount"
            disabled={makeCampaignDonation.isPending}
            type="number"
            step="any"
            min="1"
            placeholder="Amount"
            required
            className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
    </AppModal>
  );
}
