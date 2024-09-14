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
import { useState } from 'react';
import { Contribution, contributions } from '../../types/contribution.type';
import { z } from 'zod';
import { CAMPAIGN_DONATION_MIN_AMOUNT } from '@/components/utils/constants';

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

  const formSchema = z
    .object({
      contribution: z.enum(['fund', 'contribute']),
      amount: z
        .number()
        .min(
          CAMPAIGN_DONATION_MIN_AMOUNT,
          `Amount must be at least ${CAMPAIGN_DONATION_MIN_AMOUNT}`,
        )
        .optional(),
      message: z.string().max(250, 'Message must be at most 250 characters'),
    })
    .refine(
      (data) => {
        // Check if 'contribution' is 'contribute' and 'amount' is provided
        if (data.contribution === 'contribute') {
          return data.amount !== undefined;
        }
        // No validation error if 'contribution' is 'fund'
        return true;
      },
      {
        message: 'Please add the contribution amount',
        path: ['amount'], // This targets the 'amount' field for the error message
      },
    );

  // Define TypeScript type based on Zod schema
  type CampaignDonationFormData = z.infer<typeof formSchema>;

  const [formData, setFormData] = useState<CampaignDonationFormData>({
    contribution: 'fund',
    amount: remainingAmountInSol,
    message: '',
  });
  const initialErrors = {
    contribution: '',
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
        (formData.contribution === 'contribute' && !formData.amount)
      }
      submitLabel={`Pay ${formData.contribution === 'fund' ? lamportsToSol(remainingAmount) : formData.amount} SOL`}
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
            contribution: fieldErrors.contribution?.[0] || '',
            amount: fieldErrors.amount?.[0] || '',
            message: fieldErrors.message?.[0] || '',
          });

          return;
        }

        makeCampaignDonation
          .mutateAsync({
            id: campaignId,
            name: formData.message,
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
          <div className="mb-2 font-semibold">Contribute to this campaign</div>

          <div className="flex flex-col gap-2 md:flex-row">
            {contributions.map((contributionOption) => (
              <div key={contributionOption} className="flex-1">
                <input
                  id={contributionOption}
                  type="radio"
                  name="contribution"
                  className="peer hidden"
                  disabled={makeCampaignDonation.isPending}
                  value={contributionOption}
                  checked={contributionOption === formData.contribution}
                  onChange={(e) => {
                    const selectedContribution = e.target.value as Contribution;
                    let amountValue = CAMPAIGN_DONATION_MIN_AMOUNT;

                    if (selectedContribution === 'fund') {
                      amountValue = remainingAmountInSol;
                    }

                    setFormData((prevValues) => ({
                      ...prevValues,
                      amount: amountValue,
                      contribution: selectedContribution,
                    }));
                  }}
                />
                <label
                  htmlFor={contributionOption}
                  className="label peer-checked:bg-creator-primary peer-checked:text-creator-primary peer-checked:border-creator-primary cursor-pointer rounded-md border-2 border-gray-300 p-3 peer-checked:bg-opacity-10 peer-disabled:cursor-not-allowed peer-disabled:bg-gray-100"
                >
                  <span>
                    {contributionOption === 'fund'
                      ? `Fund ${remainingAmountInSol} SOL`
                      : 'Contribute'}
                  </span>
                </label>
              </div>
            ))}
            {errors.contribution && (
              <p className="text-sm text-red-600">{errors.contribution}</p>
            )}
          </div>
        </div>

        {formData.contribution === 'contribute' && (
          <div className="mb-4">
            <label htmlFor="amount" className="font-semibold">
              Contribution amount (in SOL)
            </label>
            <input
              id="amount"
              disabled={makeCampaignDonation.isPending}
              name="amount"
              type="number"
              step="0.01"
              min={CAMPAIGN_DONATION_MIN_AMOUNT}
              placeholder="Amount"
              required
              className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
              value={formData.amount}
              onChange={(e) => {
                setFormData((prevValues) => ({
                  ...prevValues,
                  amount: parseFloat(e.target.value),
                }));
              }}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>
        )}

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
