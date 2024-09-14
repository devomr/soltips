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
        amount: fieldErrors.amount?.[0] || '',
        message: fieldErrors.message?.[0] || '',
      });

      return;
    }

    await makeCampaignDonation.mutateAsync({
      id: campaign.id.toNumber(),
      name: formData.message,
      amount: solToLamports(formData.amount),
      address: campaign.owner,
      campaignId: campaign.id,
    });
  };

  return (
    <form
      className="rounded-box space-y-2 bg-white p-4"
      onSubmit={handleCampaignDonationFormSubmit}
    >
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
      <button className="btn bg-creator-primary text-creator-100 hover:bg-creator-primary mt-4 w-full rounded-full hover:bg-opacity-90">
        Pay {formData.amount} SOL
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
