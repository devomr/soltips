import { useEffect, useState } from 'react';
import { AppModal } from '../../ui/ui-layout';
import {
  Campaign,
  useCrowdfundingProgram,
} from '../../data-access/crowdfunding-data-access';
import { lamportsToSol, solToLamports } from '../../utils/conversion.util';

export function WithdrawCampaignFunds({
  hide,
  show,
  campaign,
}: {
  hide: () => void;
  show: boolean;
  campaign: Campaign;
}) {
  const { withdrawCampaignFunds } = useCrowdfundingProgram();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    // Set default withdraw amount as amount donated
    const amountDonated = campaign.amountDonated.toNumber();
    const amountWithdrawn = campaign.amountWithdrawn.toNumber();
    const amountAvailable = amountDonated - amountWithdrawn;

    setAmount(lamportsToSol(amountAvailable));
  }, [show]);

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Withdraw campaign funds"
      submitDisabled={!amount || withdrawCampaignFunds.isPending}
      submitLabel="Withdraw"
      submit={() => {
        const amountInLamports = solToLamports(amount);

        withdrawCampaignFunds
          .mutateAsync({
            amount: amountInLamports,
            address: campaign.owner,
            campaignId: campaign.id,
          })
          .then(() => hide());
      }}
    >
      <div className="space-y-2">
        <div>
          <label htmlFor="amount" className="font-semibold">
            Withdraw amount (in SOL)
          </label>
          <input
            id="amount"
            disabled={withdrawCampaignFunds.isPending}
            type="number"
            step="any"
            min="1"
            placeholder="Amount"
            required
            className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </AppModal>
  );
}
