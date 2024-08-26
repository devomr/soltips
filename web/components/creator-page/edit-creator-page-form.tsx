'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  useCrowdfundingProgram,
  useGetCreatorByAddress,
} from '../data-access/crowdfunding-data-access';
import { z } from 'zod';
import { IconCurrencySolana, IconEye } from '@tabler/icons-react';
import { lamportsToSol, solToLamports } from '../utils/conversion.util';
import ThankYouModal from '../shared/modals/thank-you-modal';
import { getDonationItems } from '../data-access/local-data-access';

type CreatorFormData = {
  isSupportersCountVisible: boolean;
  pricePerDonation: number;
  donationItem: string;
  thanksMessage: string;
};

type CreatorFormError = {
  pricePerDonation: string;
  thanksMessage: string;
};

const initialCreatorFormData: CreatorFormData = {
  isSupportersCountVisible: true,
  pricePerDonation: 0.1,
  donationItem: '',
  thanksMessage: '',
};

const initialCreatorFormError: CreatorFormError = {
  pricePerDonation: '',
  thanksMessage: '',
};

// Define the Zod schema for validation
const creatorFormSchema = z.object({
  pricePerDonation: z
    .number()
    .min(0.0001, 'Price per donation must be at least 0.0001 SOL')
    .max(5, 'Price per donation must be at most 5 SOL'),
  thanksMessage: z
    .string()
    .max(250, 'Thank you message must be at most 250 characters'),
});

export default function EditCreatorPageForm() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { updateCreatorPage } = useCrowdfundingProgram();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const [formData, setFormData] = useState<CreatorFormData>(
    initialCreatorFormData,
  );
  const [errors, setErrors] = useState<CreatorFormError>(
    initialCreatorFormError,
  );

  if (!creator) {
    return null;
  }

  useEffect(() => {
    if (creator) {
      setFormData({
        isSupportersCountVisible: creator.isSupportersCountVisible,
        pricePerDonation: lamportsToSol(creator.pricePerDonation),
        donationItem: creator.donationItem,
        thanksMessage: creator.thanksMessage,
      });
    }
  }, [creator]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    // Clear previous errors
    setErrors(initialCreatorFormError);

    // Validate the creator page form fields
    const validationResult = creatorFormSchema.safeParse(formData);

    if (validationResult.error) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;
      setErrors({
        pricePerDonation: fieldErrors.pricePerDonation?.[0] || '',
        thanksMessage: fieldErrors.thanksMessage?.[0] || '',
      });

      return;
    }

    await updateCreatorPage.mutateAsync({
      ...formData,
      pricePerDonation: solToLamports(formData.pricePerDonation),
      owner: publicKey,
    });
  };

  const handlePreviewThankYouMessage = () => {
    setShowThankYouModal(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-2 divide-y divide-gray-200">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Display supporters count</h2>
              <input
                type="checkbox"
                name="isSupportersCountVisible"
                className="toggle"
                checked={formData.isSupportersCountVisible}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isSupportersCountVisible: e.target.checked,
                  })
                }
              />
            </div>
            <p className="text-xs text-gray-400">
              Set if the number of supporters should be displayed on your
              creator page
            </p>
          </div>
          <div className="py-6">
            <h2 className="text-lg font-bold">Price per donation</h2>
            <p className="text-xs text-gray-400">
              Set the amount in SOL you would like to receive per support
            </p>
            <input
              type="number"
              name="pricePerDonation"
              className="input mt-2 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
              placeholder="Enter price in SOL"
              min={0}
              step={0.1}
              value={formData.pricePerDonation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pricePerDonation: parseFloat(e.target.value),
                })
              }
            />
            {errors.pricePerDonation && (
              <p className="text-sm text-red-600">{errors.pricePerDonation}</p>
            )}
          </div>
          <div className="py-6">
            <h2 className="text-lg font-bold">Donation item</h2>
            <p className="text-xs text-gray-400">
              Select what people will buy you as a donation
            </p>
            <div className="mt-2 space-x-2">
              {getDonationItems().map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`btn btn-sm ${formData.donationItem === item.value ? 'btn-active' : ''}`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      donationItem: item.value,
                    })
                  }
                >
                  {item.icon} {item.value}
                </button>
              ))}
            </div>
          </div>

          <div className="py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Thank you message</h2>
              <button
                className="btn btn-sm"
                type="button"
                onClick={handlePreviewThankYouMessage}
              >
                <IconEye size={24} />
                Preview message
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Write a personalised thank you message that will be visible after
              a supporter will buy you something
            </p>
            <textarea
              name="thanksMessage"
              className="textarea textarea-md mt-2 w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
              placeholder="Add a thank you message for your supporters (max 250 characters)"
              maxLength={250}
              value={formData.thanksMessage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  thanksMessage: e.target.value,
                })
              }
            ></textarea>
            {errors.thanksMessage && (
              <p className="text-sm text-red-600">{errors.thanksMessage}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-md rounded-btn bg-purple-800 text-white outline-none hover:bg-purple-700"
          disabled={updateCreatorPage.isPending}
        >
          Save changes {updateCreatorPage.isPending && '...'}
        </button>
      </form>
      <ThankYouModal
        hide={() => setShowThankYouModal(false)}
        show={showThankYouModal}
        creator={creator}
        quantity={10}
        donationItem={formData.donationItem}
        thanksMessage={formData.thanksMessage}
      />
    </>
  );
}
