'use client';

import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import {
  Campaign,
  Creator,
  useCampaigns,
  useCrowdfundingProgram,
} from '../data-access/crowdfunding-data-access';
import { AppModal } from '../ui/ui-layout';
import { lamportsToSol, solToLamports } from '../utils/conversion.util';
import { Contribution, contributions } from './types/contribution.type';
import {
  IconCopy,
  IconGift,
  IconInfoCircle,
  IconShare3,
} from '@tabler/icons-react';
import NoData from '../shared/no-data';
import { useWallet } from '@solana/wallet-adapter-react';
import { LoadingSpinner } from '../shared/loading';

export function CampaignsList({ creator }: { creator: Creator }) {
  const { data: campaigns, isLoading } = useCampaigns({
    address: creator.owner,
  });
  const [showMakeDonationModal, setShowMakeDonationModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  if (isLoading) {
    return (
      <LoadingSpinner className="my-4">
        Loading the list of campaigns..
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
            handleWithdrawClick={() => {
              setSelectedCampaign(campaign);
              setShowWithdrawModal(true);
            }}
          />
        ))}
      </div>
      {selectedCampaign !== null && (
        <MakeCampaignDonationModal
          hide={() => setShowMakeDonationModal(false)}
          creator={creator}
          campaign={selectedCampaign}
          show={showMakeDonationModal}
        />
      )}
      {selectedCampaign !== null && (
        <WithdrawCampaignFunds
          hide={() => setShowWithdrawModal(false)}
          campaign={selectedCampaign}
          show={showWithdrawModal}
        />
      )}
    </>
  );
}

export function CampaignCard({
  campaign,
  handleMakeDonationClick,
  handleWithdrawClick,
}: {
  campaign: Campaign;
  handleMakeDonationClick: () => void;
  handleWithdrawClick: () => void;
}) {
  const { publicKey } = useWallet();

  const campaignId = campaign.id.toNumber();
  const isOwner = publicKey !== null && campaign.owner.equals(publicKey);
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const amountWithdrawn = campaign.amountWithdrawn.toNumber();

  const fundaAvailable = amountDonated - amountWithdrawn;
  const donatedPercentage = (amountDonated / targetAmount) * 100;

  return (
    <div className="rounded-box space-y-2 bg-white p-4 transition-shadow duration-300 ease-in-out hover:shadow-md">
      <div className="flex h-[200px] items-center justify-center rounded-md bg-purple-100">
        <IconGift className="text-slate-900" size={50} />
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
        {isOwner && (
          <div className="space-y-2 text-center">
            <button
              title="Withdraw"
              className="btn w-full rounded-full bg-purple-800 text-white"
              disabled={fundaAvailable <= 0}
              onClick={handleWithdrawClick}
            >
              Withdraw
            </button>
            {fundaAvailable <= 0 && (
              <span className="inline-flex items-center gap-1 text-xs">
                <IconInfoCircle size={18} /> No funds available to withdraw
              </span>
            )}
          </div>
        )}
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
          className="btn rounded-full"
          target="_blank"
        >
          View
        </a>
      </div>
    </div>
  );
}

export function CreateCampaignModal({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const { createCampaign } = useCrowdfundingProgram();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isTargetAmountVisible, setIsTargetAmountVisible] = useState(true);

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Create campaign"
      submitDisabled={!name || !amount || createCampaign.isPending}
      submitLabel="Create"
      submit={() => {
        const amountInLamports = solToLamports(parseFloat(amount));

        createCampaign
          .mutateAsync({
            name,
            description,
            amount: amountInLamports,
            isTargetAmountVisible,
            address: address,
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
            disabled={createCampaign.isPending}
            type="text"
            placeholder="Name"
            className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="font-semibold">
            Description
          </label>
          <textarea
            id="description"
            disabled={createCampaign.isPending}
            className="textarea textarea-md mt-1 block w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
            placeholder="Description"
            maxLength={250}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label htmlFor="amount" className="font-semibold">
            Target amount (in SOL)
          </label>
          <input
            id="amount"
            disabled={createCampaign.isPending}
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

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text font-semibold">
              Show target amount publicly
            </span>
            <input
              type="checkbox"
              className="checkbox"
              checked={isTargetAmountVisible}
              onChange={(e) => setIsTargetAmountVisible(e.target.checked)}
            />
          </label>
        </div>
        <div role="alert" className="alert bg-gray-500 text-white">
          <span>
            💰 You will get <span className="font-semibold">100%</span> of the
            raised amount
          </span>
        </div>
      </div>
    </AppModal>
  );
}

export function MakeCampaignDonationModal({
  hide,
  show,
  creator,
  campaign,
}: {
  hide: () => void;
  show: boolean;
  creator: Creator;
  campaign: Campaign;
}) {
  const { publicKey } = useWallet();
  const { makeCampaignDonation } = useCrowdfundingProgram();

  const [contribution, setContribution] = useState<Contribution>('fund');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const campaignId = campaign.id.toNumber();
  const targetAmount = campaign.targetAmount.toNumber();
  const amountDonated = campaign.amountDonated.toNumber();
  const donatedPercentage = (amountDonated / targetAmount) * 100;
  const remainingAmount = targetAmount - amountDonated;

  const isOwner = publicKey !== null && campaign.owner.equals(publicKey);

  return (
    <AppModal
      hide={hide}
      show={show}
      title=""
      submitDisabled={
        makeCampaignDonation.isPending ||
        isOwner ||
        (contribution === 'contribute' && !amount)
      }
      submitLabel={`Pay ${contribution === 'fund' ? lamportsToSol(remainingAmount) : amount} SOL`}
      submitStyle={{
        block: true,
        creatorTheme: true,
      }}
      closeVisible={false}
      submit={() => {
        const amountInLamports = solToLamports(parseFloat(amount));

        makeCampaignDonation
          .mutateAsync({
            name: message,
            amount: amountInLamports,
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
        </div>

        {contribution === 'contribute' && (
          <div>
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
      </div>
    </AppModal>
  );
}

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

export function ShareCampaignButton({ link }: { link: string }) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCampaignLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);

      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle btn-sm"
      >
        <IconShare3 size={20} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow"
      >
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleCopyCampaignLink();
            }}
          >
            <IconCopy size={24} /> {linkCopied ? 'Copied' : 'Copy link'}
          </a>
        </li>
      </ul>
    </div>
  );
}
