'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import DashboardLayout from '../dashboard/dashboard-layout';
import { IconCurrencySolana, IconEye } from '@tabler/icons-react';
import { FormEvent, useEffect, useState } from 'react';
import { z } from 'zod';
import { lamportsToSol } from '../utils/conversion.util';
import { availableDonationItems } from '../data-access/local-data-access';

type CreatorFormData = {
  displaySupportersCount: boolean;
  pricePerDonation: number;
  donationItem: string;
  thankYouMessage: string;
};

type CreatorFormError = {
  pricePerDonation: string;
  thankYouMessage: string;
};

const initialCreatorFormData: CreatorFormData = {
  displaySupportersCount: true,
  pricePerDonation: 0.1,
  donationItem: '',
  thankYouMessage: '',
};

const initialCreatorFormError: CreatorFormError = {
  pricePerDonation: '',
  thankYouMessage: '',
};

// Define the Zod schema for validation
const creatorFormSchema = z.object({
  pricePerDonation: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
});

export default function CreatorPageFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  console.log(creator)
  const [formData, setFormData] = useState<CreatorFormData>(initialCreatorFormData);
  const [errors, setErrors] = useState<CreatorFormError>(initialCreatorFormError);

  useEffect(() => {
    if (creator) {
      setFormData({
        displaySupportersCount: creator.displaySupportersCount,
        pricePerDonation: lamportsToSol(creator.pricePerDonation),
        donationItem: creator.donationItem,
        thankYouMessage: creator.thankYouMessage,
      });
    }
  }, [creator]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert("Please connect your wallet");
      return;
    }

    // Clear previous errors
    setErrors(initialCreatorFormError);

    // validate the registration form fields
    const validationResult = creatorFormSchema.safeParse(formData);

    if (validationResult.error) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;
      setErrors({
        pricePerDonation: fieldErrors.pricePerDonation?.[0] || '',
        thankYouMessage: fieldErrors.pricePerDonation?.[0] || '',
      });

      return;
    }

    // all data is valid and the creator can be registered
    // await registerCreator.mutateAsync({ username, fullname, bio, owner: publicKey });

  };

  const handlePreviewThankYouMessage = () => {
    setShowThankYouModal(true);
  };

  if (creator) {
    return (
      <DashboardLayout>
        <div className='rounded-md bg-white p-4'>
          <h3 className='font-bold text-xl mb-4'>
            Customize your creator page
          </h3>

          <form onSubmit={handleSubmit}>
            <div className='space-y-2 divide-y divide-gray-200'>
              <div className='py-6'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-lg font-bold'>Display supporters count</h2>
                  <input type="checkbox" name="displaySupportersCount" className="toggle" checked={formData.displaySupportersCount}
                    onChange={(e) => setFormData({
                      ...formData,
                      displaySupportersCount: e.target.checked,
                    })} />
                </div>
                <p className='text-xs text-gray-400'>Set if the number of supporters should be displayed on your creator page</p>
              </div>
              <div className='py-6'>
                <h2 className='text-lg font-bold'>Price per donation</h2>
                <p className='text-xs text-gray-400'>Set the amount in SOL you would like to receive per support</p>
                <label className="input input-bordered flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    name="pricePerDonation"
                    className="grow"
                    placeholder="Enter price in SOL"
                    min={0}
                    step={0.1}
                    value={formData.pricePerDonation}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricePerDonation: parseFloat(e.target.value),
                    })}
                  />
                  <IconCurrencySolana />
                </label>
                {errors.pricePerDonation && <p className='text-red-600 text-sm'>{errors.pricePerDonation}</p>}
              </div>
              <div className='py-6'>
                <h2 className='text-lg font-bold'>Donation item</h2>
                <p className='text-xs text-gray-400'>Select what people will buy you as a donation</p>
                <div className="mt-2 space-x-2">
                  {availableDonationItems.map((item, index) => (
                    <button
                      key={index}
                      type='button'
                      className={`btn btn-sm ${formData.donationItem === item.value ? 'btn-active' : ''}`}
                      onClick={() => setFormData({
                        ...formData,
                        donationItem: item.value,
                      })}
                    >
                      {item.icon} {item.value}
                    </button>
                  ))}
                </div>
              </div>
              <div className='py-6'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-lg font-bold'>Thank you message</h2>
                  <button className='btn btn-sm' type='button' onClick={handlePreviewThankYouMessage}>
                    <IconEye size={24} />
                    Preview message
                  </button>
                </div>
                <p className='text-xs text-gray-400'>Write a personalised thank you message that will be visible after a supporter will buy you something</p>
                <textarea
                  name="thankYouMessage"
                  className="textarea textarea-bordered w-full mt-2"
                  placeholder="Add a thank you message for your supporters (max 250 characters)"
                  maxLength={250}
                  value={formData.thankYouMessage}
                  onChange={(e) => setFormData({
                    ...formData,
                    thankYouMessage: e.target.value,
                  })}
                ></textarea>
                {errors.thankYouMessage && <p className='text-red-600 text-sm'>{errors.thankYouMessage}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-md rounded-btn bg-purple-800 text-white outline-none hover:bg-purple-700"
            >
              Save changes
            </button>
          </form>
        </div>

      </DashboardLayout>
    );
  }
}
