import {
  Campaign,
  useCrowdfundingProgram,
} from '@/components/data-access/crowdfunding-data-access';
import { AppModal } from '@/components/ui/ui-layout';
import {
  lamportsToSol,
  solToLamports,
} from '@/components/utils/conversion.util';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { z } from 'zod';

const withdrawFundsFormSchema = z.object({
  amount: z.number().min(1, 'Target amount must be at least 1 SOL'),
});

// Define TypeScript type based on Zod schema
type WithdrawFundsFormData = z.infer<typeof withdrawFundsFormSchema>;

const initialData: WithdrawFundsFormData = {
  amount: 0,
};

const initialErrors = {
  amount: '',
};

export function WithdrawCampaignFunds({
  hide,
  show,
  campaign,
}: {
  hide: () => void;
  show: boolean;
  campaign: Campaign;
}) {
  const { publicKey } = useWallet();
  const { withdrawCampaignFunds } = useCrowdfundingProgram();

  const [formData, setFormData] = useState<WithdrawFundsFormData>(initialData);
  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  const amountDonated = campaign.amountDonated.toNumber();
  const amountWithdrawn = campaign.amountWithdrawn.toNumber();

  useEffect(() => {
    if (show) {
      setFormData(initialData);
      setErrors(initialErrors);
    }
  }, [show]);

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Withdraw campaign funds"
      submitDisabled={formData.amount <= 0 || withdrawCampaignFunds.isPending}
      submitLabel="Withdraw funds"
      submit={() => {
        if (!publicKey) {
          alert('Please connect your wallet');
          return;
        }

        // Clear previous errors
        setErrors(initialErrors);

        // validate the registration form fields
        const validationResult = withdrawFundsFormSchema.safeParse(formData);

        if (validationResult.error) {
          const fieldErrors = validationResult.error.formErrors.fieldErrors;
          setErrors({
            amount: fieldErrors.amount?.[0] || '',
          });

          return;
        }

        withdrawCampaignFunds
          .mutateAsync({
            amount: solToLamports(formData.amount),
            address: campaign.owner,
            campaignId: campaign.id,
          })
          .then(() => hide());
      }}
    >
      <p className="font-semibold">Amount (in SOL)</p>
      <label className="input mt-1 flex items-center gap-2 bg-gray-100">
        <input
          id="amount"
          disabled={withdrawCampaignFunds.isPending}
          type="number"
          step="0.01"
          placeholder="Amount in SOL"
          required
          className="grow"
          min={1}
          value={formData.amount}
          onChange={(e) => {
            setFormData((prevValues) => ({
              ...prevValues,
              amount: parseFloat(e.target.value),
            }));
          }}
        />
        <button
          title="Maximum amount available for withdraw"
          className="btn btn-sm btn-outline"
          onClick={() => {
            const amountAvailable = amountDonated - amountWithdrawn;
            setFormData((prevValues) => ({
              ...prevValues,
              amount: lamportsToSol(amountAvailable),
            }));
          }}
        >
          MAX
        </button>
      </label>
      {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
    </AppModal>
  );
}
