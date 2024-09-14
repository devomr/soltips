'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useCrowdfundingProgram } from '../data-access/crowdfunding-data-access';
import { z } from 'zod';
import { IconCheck, IconEye, IconPalette } from '@tabler/icons-react';
import { lamportsToSol, solToLamports } from '../utils/conversion.util';
import ThankYouModal from '../shared/modals/thank-you-modal';
import {
  getDonationItems,
  getThemeColors,
} from '../data-access/local-data-access';
import {
  THANKS_MESSAGE_MAX_LENGTH,
  PRICE_PER_DONATION_MIN_VALUE,
  PRICE_PER_DONATION_MAX_VALUE,
} from '../utils/constants';
import { debounce } from '../utils/debounce.util';
import DashboardLayout from '../dashboard/dashboard-layout';
import { useCreator } from '@/context/creator-context';

export default function CreatorPageSettingsFeature() {
  return (
    <DashboardLayout>
      <CreatorPageForm />
    </DashboardLayout>
  );
}

const creatorPageFormSchema = z.object({
  isSupportersCountVisible: z.boolean(),
  pricePerDonation: z
    .number()
    .min(
      PRICE_PER_DONATION_MIN_VALUE,
      `Price per donation must be at least ${PRICE_PER_DONATION_MIN_VALUE} SOL`,
    )
    .max(
      PRICE_PER_DONATION_MAX_VALUE,
      `Price per donation must be at most ${PRICE_PER_DONATION_MAX_VALUE} SOL`,
    ),
  donationItem: z.string(),
  themeColor: z.string(),
  thanksMessage: z
    .string()
    .max(
      THANKS_MESSAGE_MAX_LENGTH,
      `Thank you message must be at most ${THANKS_MESSAGE_MAX_LENGTH} characters`,
    ),
});

// Define TypeScript type based on Zod schema
type CreatorPageFormData = z.infer<typeof creatorPageFormSchema>;

const initialCreatorFormData: CreatorPageFormData = {
  isSupportersCountVisible: true,
  pricePerDonation: 0.1,
  donationItem: 'coffee',
  themeColor: '#794BC4',
  thanksMessage: '',
};

const initialErrors = {
  pricePerDonation: '',
  donationItem: '',
  themeColor: '',
  thanksMessage: '',
};

function CreatorPageForm() {
  const { creator } = useCreator();
  const { publicKey } = useWallet();
  const { updateCreatorPage } = useCrowdfundingProgram();

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [customThemeColor, setCustomThemeColor] = useState('#000000');
  const [formData, setFormData] = useState<CreatorPageFormData>(
    initialCreatorFormData,
  );
  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  if (!creator) {
    return null;
  }

  useEffect(() => {
    if (creator) {
      setFormData({
        isSupportersCountVisible: creator.isSupportersCountVisible,
        pricePerDonation: lamportsToSol(creator.pricePerDonation),
        donationItem: creator.donationItem,
        themeColor: creator.themeColor,
        thanksMessage: creator.thanksMessage,
      });

      const hasDefinedThemeColor = getThemeColors().find(
        (c) => c.value === creator.themeColor,
      );
      if (!hasDefinedThemeColor) {
        setCustomThemeColor(creator.themeColor);
      }
    }
  }, [creator]);

  useEffect(() => {
    setFormData({
      ...formData,
      themeColor: customThemeColor,
    });
  }, [customThemeColor]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    // Clear previous errors
    setErrors(initialErrors);

    // Validate the creator page form fields
    const validationResult = creatorPageFormSchema.safeParse(formData);

    if (validationResult.error) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;
      setErrors({
        pricePerDonation: fieldErrors.pricePerDonation?.[0] || '',
        donationItem: fieldErrors.donationItem?.[0] || '',
        themeColor: fieldErrors.themeColor?.[0] || '',
        thanksMessage: fieldErrors.thanksMessage?.[0] || '',
      });

      return;
    }

    console.log(formData);

    await updateCreatorPage.mutateAsync({
      isSupportersCountVisible: formData.isSupportersCountVisible,
      pricePerDonation: solToLamports(formData.pricePerDonation),
      donationItem: formData.donationItem,
      themeColor: formData.themeColor,
      thanksMessage: formData.thanksMessage,
      owner: publicKey,
    });
  };

  const handlePreviewThankYouMessage = () => {
    setShowThankYouModal(true);
  };

  const thanksMessageRemainingChars =
    THANKS_MESSAGE_MAX_LENGTH - formData.thanksMessage.length;

  // Create a debounced version of the setCustomThemeColor function
  const debouncedSetCustomThemeColor = useCallback(
    debounce((color: string) => setCustomThemeColor(color), 300), // Adjust the debounce delay as needed
    [],
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-box bg-white p-4">
        <div className="space-y-2 divide-y divide-gray-200">
          <div className="py-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <label htmlFor="supporterCountSwitch" className="font-bold">
                  Display supporters count
                </label>
                <p className="text-sm text-gray-500">
                  Set if the number of supporters should be displayed on your
                  creator page
                </p>
              </div>
              <input
                id="supporterCountSwitch"
                type="checkbox"
                name="isSupportersCountVisible"
                className="toggle self-start"
                checked={formData.isSupportersCountVisible}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isSupportersCountVisible: e.target.checked,
                  })
                }
              />
            </div>
          </div>
          <div className="py-6">
            <label htmlFor="pricePerDonationInput" className="font-bold">
              Price per donation
            </label>
            <p className="text-sm text-gray-500">
              Set the amount in SOL you would like to receive per support
            </p>
            <input
              type="number"
              id="pricePerDonationInput"
              name="pricePerDonation"
              className="input mt-2 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
              placeholder="Enter price in SOL"
              min={PRICE_PER_DONATION_MIN_VALUE}
              step={0.01}
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
            <label className="font-bold">Donation item</label>
            <p className="text-sm text-gray-500">
              Select what people will buy you as a donation
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {getDonationItems().map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`btn btn-sm rounded-full outline-offset-1 ${formData.donationItem === item.value ? 'btn-active' : ''}`}
                  style={{
                    outline:
                      formData.donationItem === item.value
                        ? 'solid 2px #c7c8c8'
                        : 'none',
                  }}
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
            {errors.donationItem && (
              <p className="text-sm text-red-600">{errors.donationItem}</p>
            )}
          </div>
          <div className="py-6">
            <label className="font-bold">Theme color</label>
            <p className="text-sm text-gray-500">
              Select what theme color you would like to use for your creator
              page
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {getThemeColors().map((item, index) => (
                <button
                  key={index}
                  type="button"
                  style={{
                    backgroundColor: item.value,
                    outline:
                      formData.themeColor === item.value
                        ? `solid 2px ${item.value}`
                        : 'none',
                  }}
                  className="btn btn-sm h-10 w-10 rounded-full text-white outline-offset-1"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      themeColor: item.value,
                    });
                    setCustomThemeColor('#000000');
                  }}
                >
                  {formData.themeColor === item.value && (
                    <IconCheck strokeWidth={4} />
                  )}
                </button>
              ))}
              <div className="relative">
                <label
                  htmlFor="customColorPicker"
                  className="btn btn-sm btn-circle h-10 w-10 rounded-full bg-gray-400 text-white outline-offset-1"
                  title="Choose custom color"
                  style={{
                    backgroundColor: customThemeColor,
                    outline:
                      formData.themeColor === customThemeColor
                        ? `solid 2px ${customThemeColor}`
                        : 'none',
                  }}
                >
                  <IconPalette size={18} />
                </label>
                <input
                  type="color"
                  id="customColorPicker"
                  name="color-picker"
                  value={customThemeColor}
                  className="absolute cursor-pointer opacity-0"
                  onChange={(e) => {
                    debouncedSetCustomThemeColor(e.target.value);
                  }}
                />
              </div>
            </div>
            {errors.themeColor && (
              <p className="text-sm text-red-600">{errors.themeColor}</p>
            )}
          </div>

          <div className="py-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <label htmlFor="thanksMessageTextarea" className="font-bold">
                  Thank you message
                </label>
                <p className="text-sm text-gray-500">
                  Write a personalised thank you message that will be visible
                  after a supporter will buy you something
                </p>
              </div>
              <button
                className="btn btn-sm self-start rounded-full"
                type="button"
                onClick={handlePreviewThankYouMessage}
              >
                <IconEye size={24} />
                Preview
              </button>
            </div>
            <textarea
              id="thanksMessageTextarea"
              name="thanksMessage"
              className="textarea textarea-md mt-2 w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
              placeholder="Add a personalized thank you message for your supporters"
              maxLength={250}
              value={formData.thanksMessage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  thanksMessage: e.target.value,
                })
              }
            ></textarea>
            <p className="text-sm text-gray-500">
              Remaining characters: {thanksMessageRemainingChars}
            </p>
            {errors.thanksMessage && (
              <p className="text-sm text-red-600">{errors.thanksMessage}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-md rounded-full bg-purple-800 text-white outline-none hover:bg-purple-700"
          disabled={updateCreatorPage.isPending}
        >
          {updateCreatorPage.isPending && (
            <span className="loading loading-spinner"></span>
          )}
          Save changes
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
