'use client';

import { notFound, useParams } from 'next/navigation';
import {
  Campaign,
  Creator,
  useCampaign,
  useCrowdfundingProgram,
  useGetCreatorByUsername,
} from '@/components/data-access/crowdfunding-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { lamportsToSol } from '../utils/conversion.util';
import { useState } from 'react';
import { Contribution, contributions } from './types/contribution.type';
import { UserAvatar } from '../shared/user-avatar';
import { getRGBColor, getAccessibleTextColor } from '../utils/theme.util';
import NoData from '../shared/no-data';
import { LoadingSpinner } from '../shared/loading';
import { Alert } from '../shared/alert';

function getCreatorTheme(color: string) {
  const primaryColor = getRGBColor(color, 'creator-theme-color');
  const textColor100 = getRGBColor(
    getAccessibleTextColor(color, 1),
    'creator-theme-text-color-100',
  );
  const textColor20 = getRGBColor(
    getAccessibleTextColor(color, 0.2),
    'creator-theme-text-color-20',
  );

  return {
    ...primaryColor,
    ...textColor100,
    ...textColor20,
  } as React.CSSProperties;
}

export default function CampaignDetailsFeature() {
  const params = useParams<{ username: string; campaignId: string }>();

  const {
    data: creator,
    isLoading,
    isSuccess,
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
  const { publicKey } = useWallet();
  const { data: campaign, isLoading } = useCampaign({
    address: creator.owner,
    id: campaignId,
  });
  const { makeCampaignDonation } = useCrowdfundingProgram();
  const [contribution, setContribution] = useState<Contribution>('fund');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  if (!campaign) {
    return null;
  }

  const isOwner = publicKey !== null && campaign.owner.equals(publicKey);
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const amountWithdrawn = campaign.amountWithdrawn.toNumber();
  const remainingAmount = targetAmount - amountDonated;

  const fundaAvailable = amountDonated - amountWithdrawn;
  const donatedPercentage = (amountDonated / targetAmount) * 100;

  return (
    <div style={getCreatorTheme(creator.themeColor)}>
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
            <div className="rounded-box bg-white p-4">
              <div className="mb-2 font-semibold">
                Contribute to this campaign
              </div>

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
                      checked={contributionOption === contribution}
                      onChange={(e) =>
                        setContribution(e.target.value as Contribution)
                      }
                    />
                    <label
                      htmlFor={contributionOption}
                      className="label peer-checked:bg-creator-primary peer-checked:text-creator-primary peer-checked:border-creator-primary cursor-pointer rounded-md border-2 border-gray-300 p-3 peer-checked:bg-opacity-10 peer-disabled:cursor-not-allowed peer-disabled:bg-gray-100"
                    >
                      <span>
                        {contributionOption === 'fund'
                          ? `Fund ${lamportsToSol(remainingAmount)} SOL`
                          : 'Contribute'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              {contribution === 'contribute' && (
                <div className="mb-4">
                  <label htmlFor="amount" className="font-semibold">
                    Contribution amount (in SOL)
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
              )}
              <div>
                <label htmlFor="message" className="font-semibold">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="textarea textarea-md mt-1 block w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
                  placeholder={`Add a message for ${creator.fullname}`}
                  maxLength={250}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={makeCampaignDonation.isPending}
                ></textarea>
              </div>
              <button className="btn mt-4 w-full rounded-full bg-purple-800 text-white hover:bg-purple-800 hover:bg-opacity-90">
                {`Pay ${contribution === 'fund' ? lamportsToSol(remainingAmount) : amount} SOL`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
