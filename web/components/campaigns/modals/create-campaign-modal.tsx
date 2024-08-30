import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import { AppModal } from '../../ui/ui-layout';
import { useCrowdfundingProgram } from '../../data-access/crowdfunding-data-access';
import { solToLamports } from '../../utils/conversion.util';

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
