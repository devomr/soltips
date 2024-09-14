'use client';

import { useParams } from 'next/navigation';
import {
  Campaign,
  Creator,
  useCampaign,
  useCrowdfundingProgram,
  useGetCreatorByUsername,
} from '@/components/data-access/crowdfunding-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { lamportsToSol, solToLamports } from '../utils/conversion.util';
import { FormEvent, useState } from 'react';
import { Contribution, contributions } from './types/contribution.type';
import { LoadingSpinner } from '../shared/loading';
import { Alert } from '../shared/alert';
import { getCreatorTheme } from '../utils/theme.util';
import { z } from 'zod';
import { CAMPAIGN_DONATION_MIN_AMOUNT } from '../utils/constants';

export default function CampaignDetailsFeature() {
  const params = useParams<{ username: string; campaignId: string }>();
  const {
    data: creator,
    isLoading,
    isError,
  } = useGetCreatorByUsername({
    username: params.username,
  });

  if (isLoading) {
    return (
      <LoadingSpinner className="mt-4">
        Loading creator profile...
      </LoadingSpinner>
    );
  }

  if (isError) {
    return (
      <Alert className="m-4 bg-red-500 text-white">
        An error occurred while loading the creator profile. Please try again
        later.
      </Alert>
    );
  }

  if (!creator) {
    return null;
  }

  return <CampaignDetails creator={creator} campaignId={params.campaignId} />;
}

function CampaignDetails({
  creator,
  campaignId,
}: {
  creator: Creator;
  campaignId: string;
}) {
  const { data: campaign, isLoading } = useCampaign({
    address: creator.owner,
    id: campaignId,
  });

  if (!campaign) {
    return null;
  }

  return (
    <div style={getCreatorTheme(creator.themeColor)}>
      <CampaignPageHeader campaign={campaign} />
      <div className="mx-auto max-w-screen-xl p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="rounded-box mb-4 w-full bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p>{campaign.description}</p>
            </div>
            <section className="rounded-box bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Donators
              </h2>
              dasd
            </section>
          </div>
          <div className="order-1">
            <CampaignDonationForm campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignDonationForm({ campaign }: { campaign: Campaign }) {
  const { publicKey } = useWallet();
  const { makeCampaignDonation } = useCrowdfundingProgram();

  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const remainingAmount = targetAmount - amountDonated;
  const remainingAmountInSol = lamportsToSol(remainingAmount);

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

  const handleCampaignDonationFormSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (publicKey.equals(campaign.owner)) {
      alert('You cannot donate to your own campaign');
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

    await makeCampaignDonation.mutateAsync({
      id: campaign.id.toNumber(),
      name: formData.message,
      amount: solToLamports(formData.amount ?? 0),
      address: campaign.owner,
      campaignId: campaign.id,
    });
  };

  return (
    <form
      className="rounded-box bg-white p-4"
      onSubmit={handleCampaignDonationFormSubmit}
    >
      <div className="mb-2 font-semibold">Contribute to this campaign</div>

      <div className="mb-4 flex flex-col gap-2 md:flex-row">
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
      <button className="btn mt-4 w-full rounded-full bg-purple-800 text-white hover:bg-purple-800 hover:bg-opacity-90">
        {`Pay ${formData.contribution === 'fund' ? remainingAmountInSol : formData.amount} SOL`}
      </button>
    </form>
  );
}

function CampaignPageHeader({ campaign }: { campaign: Campaign }) {
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const donatedPercentage = (amountDonated / targetAmount) * 100;

  return (
    <div className="top-[64px] z-10 bg-white md:sticky">
      <div className="mx-auto max-w-screen-xl p-4">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div>
            <h1 className="mb-4 text-2xl font-semibold">{campaign.name}</h1>
            <progress
              className="progress progress-success block w-full"
              value={donatedPercentage}
              max="100"
            ></progress>
            <p className="text-sm">
              <span className="font-bold">{donatedPercentage}%</span>
              {campaign.isTargetAmountVisible && (
                <span className="ml-1">
                  of {lamportsToSol(campaign.targetAmount.toNumber())} SOL
                  target
                </span>
              )}
            </p>
          </div>
          <div>
            <button className="btn my-4 w-full rounded-full hover:bg-opacity-90">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
