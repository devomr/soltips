import { useCrowdfundingProgram } from '@/components/data-access/crowdfunding-data-access';
import { AppModal } from '@/components/ui/ui-layout';
import { solToLamports } from '@/components/utils/conversion.util';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const createCampaignFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z
    .string()
    .max(250, 'Description must be at most 250 characters'),
  targetAmount: z.number().min(1, 'Target amount must be at least 1 SOL'),
  isTargetAmountVisible: z.boolean(),
});

// Define TypeScript type based on Zod schema
type CreateCampaignFormData = z.infer<typeof createCampaignFormSchema>;

const initialData: CreateCampaignFormData = {
  name: '',
  description: '',
  targetAmount: 0,
  isTargetAmountVisible: true,
};
const initialErrors = {
  name: '',
  description: '',
  targetAmount: '',
};

export function CreateCampaignModal({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const { publicKey } = useWallet();
  const { createCampaign } = useCrowdfundingProgram();

  const [formData, setFormData] = useState<CreateCampaignFormData>(initialData);
  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  useEffect(() => {
    if (show) {
      setFormData(initialData);
      setErrors(initialErrors);
    }
  }, [show]);

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Create campaign"
      submitDisabled={createCampaign.isPending}
      submitLabel="Create campaign"
      submit={() => {
        if (!publicKey) {
          alert('Please connect your wallet');
          return;
        }

        // Clear previous errors
        setErrors(initialErrors);

        // validate the registration form fields
        const validationResult = createCampaignFormSchema.safeParse(formData);

        if (validationResult.error) {
          const fieldErrors = validationResult.error.formErrors.fieldErrors;
          setErrors({
            name: fieldErrors.name?.[0] || '',
            description: fieldErrors.description?.[0] || '',
            targetAmount: fieldErrors.targetAmount?.[0] || '',
          });

          return;
        }

        createCampaign
          .mutateAsync({
            name: formData.name,
            description: formData.description,
            amount: solToLamports(formData.targetAmount),
            isTargetAmountVisible: formData.isTargetAmountVisible,
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
            placeholder="Give a name for your campaign"
            className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
            required
            minLength={3}
            maxLength={50}
            value={formData.name}
            onChange={(e) => {
              setFormData((prevValues) => ({
                ...prevValues,
                name: e.target.value,
              }));
            }}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="font-semibold">
            Description
          </label>
          <textarea
            id="description"
            disabled={createCampaign.isPending}
            className="textarea textarea-md mt-1 block w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
            placeholder="Briefly describe how you intend to use the funds"
            maxLength={250}
            value={formData.description}
            onChange={(e) => {
              setFormData((prevValues) => ({
                ...prevValues,
                description: e.target.value,
              }));
            }}
          ></textarea>
          <p className="text-sm text-gray-500">
            Remaining characters: {250 - formData.description.length}
          </p>
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="font-semibold">
            Target amount (in SOL)
          </label>
          <input
            id="amount"
            disabled={createCampaign.isPending}
            type="number"
            step="0.01"
            min={1}
            placeholder="Enter amount of SOL you need"
            required
            className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
            value={formData.targetAmount}
            onChange={(e) => {
              setFormData((prevValues) => ({
                ...prevValues,
                targetAmount: parseFloat(e.target.value),
              }));
            }}
          />
          {errors.targetAmount && (
            <p className="text-sm text-red-600">{errors.targetAmount}</p>
          )}
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="font-semibold">Show target amount publicly</span>
            <input
              type="checkbox"
              className="checkbox"
              checked={formData.isTargetAmountVisible}
              onChange={(e) =>
                setFormData((prevValues) => ({
                  ...prevValues,
                  isTargetAmountVisible: e.target.checked,
                }))
              }
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
