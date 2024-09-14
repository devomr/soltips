import { AppModal } from '@/components/ui/ui-layout';
import {
  lamportsToSol,
  solToLamports,
} from '@/components/utils/conversion.util';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { z } from 'zod';
import { CAMPAIGN_DONATION_MIN_AMOUNT } from '@/components/utils/constants';
import {
  Campaign,
  useCrowdfundingProgram,
} from '@/data-access/crowdfunding-data-access';

export function MakeCampaignDonationModal({
  hide,
  show,
  campaign,
}: {
  hide: () => void;
  show: boolean;
  campaign: Campaign;
}) {
  const { publicKey } = useWallet();
  const { makeCampaignDonation } = useCrowdfundingProgram();

  const campaignId = campaign.id.toNumber();
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const donatedPercentage = (amountDonated / targetAmount) * 100;
  const remainingAmount = targetAmount - amountDonated;
  const remainingAmountInSol = lamportsToSol(remainingAmount);

  const isOwner = publicKey !== null && campaign.owner.equals(publicKey);

  const formSchema = z.object({
    amount: z
      .number()
      .min(
        CAMPAIGN_DONATION_MIN_AMOUNT,
        `Amount must be at least ${CAMPAIGN_DONATION_MIN_AMOUNT}`,
      ),
    message: z.string().max(250, 'Message must be at most 250 characters'),
  });

  // Define TypeScript type based on Zod schema
  type CampaignDonationFormData = z.infer<typeof formSchema>;

  const [formData, setFormData] = useState<CampaignDonationFormData>({
    amount: CAMPAIGN_DONATION_MIN_AMOUNT,
    message: '',
  });
  const initialErrors = {
    amount: '',
    message: '',
  };

  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  return (
    <AppModal
      hide={hide}
      show={show}
      title=""
      submitDisabled={
        makeCampaignDonation.isPending ||
        isOwner ||
        formData.amount < CAMPAIGN_DONATION_MIN_AMOUNT
      }
      submitLabel={`Pay ${formData.amount} SOL`}
      submitStyle={{
        block: true,
        creatorTheme: true,
      }}
      closeVisible={false}
      submit={() => {
        if (!publicKey) {
          alert('Please connect your wallet');
          return;
        }

        // Clear previous errors
        setErrors(initialErrors);

        // validate the registration form fields
        const validationResult = formSchema.safeParse(formData);

        if (validationResult.error) {
          const fieldErrors = validationResult.error.formErrors.fieldErrors;
          setErrors({
            amount: fieldErrors.amount?.[0] || '',
            message: fieldErrors.message?.[0] || '',
          });

          return;
        }

        makeCampaignDonation
          .mutateAsync({
            id: campaignId,
            message: formData.message,
            amount: solToLamports(formData.amount ?? 0),
            address: campaign.owner,
            campaignId: campaign.id,
          })
          .then(() => hide());
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded-md bg-white p-4 drop-shadow">
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
        </div>

        <div>
          <p className="font-semibold">Contribution amount (in SOL)</p>
          <label className="input mt-1 flex items-center gap-2 border-2 bg-gray-100 focus-within:border-slate-900 focus-within:bg-white focus-within:outline-none">
            <input
              id="amount"
              disabled={makeCampaignDonation.isPending}
              type="number"
              step="0.01"
              placeholder="Amount in SOL"
              required
              className="grow"
              min={CAMPAIGN_DONATION_MIN_AMOUNT}
              value={formData.amount}
              onChange={(e) => {
                setFormData((prevValues) => ({
                  ...prevValues,
                  amount: parseFloat(e.target.value),
                }));
              }}
            />
            <button
              title="Fund entire campaign"
              className="btn btn-sm btn-outline"
              type="button"
              onClick={(e) => {
                e.preventDefault();

                const remainingAmount = targetAmount - amountDonated;

                setFormData((prevValues) => ({
                  ...prevValues,
                  amount: lamportsToSol(remainingAmount),
                }));
              }}
            >
              MAX
            </button>
          </label>
        </div>

        <div>
          <label htmlFor="message" className="font-semibold">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            className="textarea textarea-md mt-1 block w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
            placeholder="Say something nice here..."
            maxLength={250}
            value={formData.message}
            onChange={(e) => {
              setFormData((prevValues) => ({
                ...prevValues,
                message: e.target.value,
              }));
            }}
            disabled={makeCampaignDonation.isPending}
          ></textarea>
          {errors.message && (
            <p className="text-sm text-red-600">{errors.message}</p>
          )}
        </div>
      </div>
    </AppModal>
  );
}
