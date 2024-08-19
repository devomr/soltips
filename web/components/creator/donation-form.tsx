'use client';

import { FormEvent, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Creator, useCrowdfundingProgram, useSupporterTransfer } from '../data-access/crowdfunding-data-access';

const donationOptions = [1, 3, 5];
const coffeePrice = 0.01;

type DonationFormProps = {
  creator: Creator
};

type DonationFormData = {
  quantity: number;
  name: string;
  message: string;
};

const initialDonationFormData: DonationFormData = {
  quantity: 1,
  name: '',
  message: '',
};

const DonationForm: React.FC<DonationFormProps> = ({ creator }) => {
  const { publicKey } = useWallet();
  const { supporterTransfer } = useCrowdfundingProgram();

  const [donationFormData, setDonationFormData] = useState<DonationFormData>(initialDonationFormData);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    const { name, message, quantity } = donationFormData;
    await supporterTransfer.mutateAsync({ name, message, itemType: 'coffee', quantity, price: coffeePrice, creator });

    // clear the form state
    setDonationFormData(initialDonationFormData);
  };

  return (
    <div>
      <h3 className="text-md mb-4 font-bold text-slate-900">
        Buy {creator.fullname} some coffee ☕
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center rounded-md border-purple-300 border-[1px] bg-purple-100 p-4">
          <div className="text-5xl">☕</div>
          <div className="mx-4 text-2xl font-bold text-gray-400">X</div>
          <div className="flex items-center gap-2">
            {donationOptions.map((donationOption, idx) => (
              <div key={idx}>
                <input
                  type="radio"
                  id={`quantity${idx + 1}`}
                  name="quantity"
                  value={donationOption}
                  className="peer hidden"
                  checked={donationFormData.quantity === donationOption}
                  onChange={(e) =>
                    setDonationFormData((prevState) => ({
                      ...prevState,
                      quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                />
                <label
                  htmlFor={`quantity${idx + 1}`}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-purple-300 border-[1px] bg-white font-bold hover:border-purple-400 peer-checked:bg-purple-800 peer-checked:text-white"
                >
                  {donationOption}
                </label>
              </div>
            ))}
            <div>
              <input
                type="number"
                id="customQuantity"
                name="customQuantity"
                min={1}
                max={50}
                className="h-12 w-12 rounded-md border-purple-300 border-[1px] p-3 text-center"
                placeholder="10"
                onChange={(e) =>
                  setDonationFormData((prevState) => ({
                    ...prevState,
                    quantity: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <input
          type="text"
          id="name"
          value={donationFormData.name}
          placeholder="Add your name"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-3 text-slate-900 focus:border-slate-900 focus:bg-white"
          onChange={(e) =>
            setDonationFormData((prevState) => ({
              ...prevState,
              name: e.target.value,
            }))
          }
        />
        <textarea
          id="message"
          name="message"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-3 text-slate-900 focus:border-slate-900 focus:bg-white"
          placeholder="Add your message"
          value={donationFormData.message}
          onChange={(e) =>
            setDonationFormData((prevState) => ({
              ...prevState,
              message: e.target.value,
            }))
          }
        ></textarea>
        <button
          type="submit"
          className="btn btn-md rounded-btn w-full bg-purple-800 text-white outline-none hover:bg-purple-700"
          disabled={supporterTransfer.isPending || donationFormData.quantity === 0}
        >
          Support with {donationFormData.quantity * coffeePrice} SOL {supporterTransfer.isPending && '...'}
        </button>
      </form>
    </div>
  );
};

export default DonationForm;
