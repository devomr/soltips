'use client';

import { FormEvent, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Creator,
  useCrowdfundingProgram,
} from '../data-access/crowdfunding-data-access';
import { lamportsToSol } from '../utils/conversion.util';
import ThankYouModal from '../shared/modals/thank-you-modal';
import { getDonationItem } from '../data-access/local-data-access';
import { DONATION_MESSAGE_MAX_LENGTH } from '../utils/constants';

const donationOptions = [1, 3, 5];

type DonationFormProps = {
  creator: Creator;
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
  const { saveSupporterDonation } = useCrowdfundingProgram();
  const [donationFormData, setDonationFormData] = useState<DonationFormData>(
    initialDonationFormData,
  );
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const coffeePrice = lamportsToSol(creator.pricePerDonation);
  const donationItem = getDonationItem(creator.donationItem);

  const donationMessageRemainingChars =
    DONATION_MESSAGE_MAX_LENGTH - donationFormData.message.length;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (creator.owner.equals(publicKey)) {
      alert('You cannot donate to yourself');
      return;
    }

    await saveSupporterDonation.mutateAsync({
      ...donationFormData,
      creator,
    });

    // clear the form state
    setDonationFormData(initialDonationFormData);
    setShowThankYouModal(true);
  };

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Buy {creator.fullname} some {donationItem.icon}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-creator-primary flex flex-wrap items-center justify-center gap-3 rounded-md bg-opacity-10 p-4">
          <div className="text-4xl md:text-5xl">{donationItem.icon}</div>
          <div className="text-xl font-bold text-gray-500">X</div>
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
                  className="peer-checked:bg-creator-primary peer-checked:text-creator-100 hover:bg-creator-primary inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white font-bold shadow transition-colors duration-200 ease-in-out hover:bg-opacity-10 md:h-12 md:w-12"
                >
                  {donationOption}
                </label>
              </div>
            ))}

            <input
              type="number"
              id="customQuantity"
              name="customQuantity"
              min={1}
              max={50}
              value={donationFormData.quantity}
              className="h-10 w-10 rounded-md text-center shadow md:h-12 md:w-12"
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

        <input
          type="text"
          id="name"
          value={donationFormData.name}
          placeholder="Add your name"
          className="w-full rounded-md bg-gray-100 px-4 py-3 text-slate-900 focus:border-slate-900 focus:bg-white"
          onChange={(e) =>
            setDonationFormData((prevState) => ({
              ...prevState,
              name: e.target.value,
            }))
          }
        />
        <div>
          <textarea
            id="message"
            name="message"
            className="block w-full rounded-md bg-gray-100 px-4 py-3 text-slate-900 focus:border-slate-900 focus:bg-white"
            placeholder={`Add your message for ${creator.fullname}`}
            maxLength={DONATION_MESSAGE_MAX_LENGTH}
            value={donationFormData.message}
            onChange={(e) =>
              setDonationFormData((prevState) => ({
                ...prevState,
                message: e.target.value,
              }))
            }
          ></textarea>
          {donationMessageRemainingChars <= 10 && (
            <p className="text-sm text-gray-500">
              Remaining characters: {donationMessageRemainingChars}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-md bg-creator-primary text-creator-100 hover:bg-creator-primary w-full rounded-full text-base outline-none hover:bg-opacity-90"
          disabled={
            saveSupporterDonation.isPending || donationFormData.quantity === 0
          }
        >
          {saveSupporterDonation.isPending && (
            <span className="loading loading-spinner"></span>
          )}
          Tip {donationFormData.quantity * coffeePrice} SOL
        </button>
      </form>
      <ThankYouModal
        hide={() => setShowThankYouModal(false)}
        show={showThankYouModal}
        creator={creator}
        quantity={donationFormData.quantity}
        donationItem={donationItem.value}
        thanksMessage={creator.thanksMessage}
      />
    </>
  );
};

export default DonationForm;
