'use client';

import { useCrowdfundingProgram } from '@/data-access/crowdfunding-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { z } from 'zod';

// Define the Zod schema for validation
const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  fullname: z
    .string()
    .min(3, 'Fullname must be at least 3 characters')
    .max(100, 'Fullname must be at most 100 characters'),
  bio: z.string().max(250, 'Bio must be at most 250 characters'),
});

// Define TypeScript type based on Zod schema
type RegisterFormData = z.infer<typeof registerFormSchema>;

const initialRegisterFormData: RegisterFormData = {
  username: '',
  fullname: '',
  bio: '',
};

const initialErrors = {
  username: '',
  fullname: '',
  bio: '',
};

export default function RegisterForm() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { registerCreator, checkUsername } = useCrowdfundingProgram();
  const queryParams = useSearchParams();

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>(
    initialRegisterFormData,
  );
  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  const { data: usernameRecord } = checkUsername(registerFormData.username);

  // get the username from query parameters
  const username = queryParams.get('username');

  useEffect(() => {
    if (username) {
      setRegisterFormData((prevState) => ({
        ...prevState,
        username: username,
      }));
    }
  }, [username]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    // Clear previous errors
    setErrors(initialErrors);

    // validate the registration form fields
    const validationResult = registerFormSchema.safeParse(registerFormData);

    if (validationResult.error) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0] || '',
        fullname: fieldErrors.fullname?.[0] || '',
        bio: fieldErrors.bio?.[0] || '',
      });

      return;
    }

    // validate the username is not taken
    if (usernameRecord) {
      setErrors({
        ...errors,
        username: 'Username is already taken',
      });

      return;
    }

    // all data is valid and the creator can be registered
    await registerCreator.mutateAsync({
      username: registerFormData.username,
      fullname: registerFormData.fullname,
      bio: registerFormData.bio,
      owner: publicKey,
    });

    // redirect to dashboard after registration
    router.push('/dashboard');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-box bg-white p-6 shadow-md"
    >
      <div className="mb-4">
        <label htmlFor="fullname" className="font-semibold">
          Full name
        </label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={registerFormData.fullname}
          disabled={registerCreator.isPending}
          placeholder="John Smith"
          className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
          onChange={(e) => {
            setRegisterFormData((prevValues) => ({
              ...prevValues,
              fullname: e.target.value,
            }));
          }}
          required
        />
        {errors.fullname && (
          <p className="text-sm text-red-600">{errors.fullname}</p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="username" className="font-semibold">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={registerFormData.username}
          disabled={registerCreator.isPending}
          placeholder="johnsmith"
          className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
          onChange={(e) => {
            setRegisterFormData((prevValues) => ({
              ...prevValues,
              username: e.target.value,
            }));
          }}
          required
        />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username}</p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="bio" className="font-semibold">
          What are you creating?
        </label>
        <textarea
          id="bio"
          name="bio"
          className="textarea textarea-md mt-1 block w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
          placeholder="web development tutorials on YouTube"
          maxLength={250}
          value={registerFormData.bio}
          disabled={registerCreator.isPending}
          onChange={(e) => {
            setRegisterFormData((prevValues) => ({
              ...prevValues,
              bio: e.target.value,
            }));
          }}
        ></textarea>
        {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
      </div>
      <button
        type="submit"
        className="btn btn-md w-full rounded-full bg-purple-800 text-white outline-none hover:bg-purple-700"
        disabled={registerCreator.isPending}
      >
        {registerCreator.isPending && (
          <span className="loading loading-spinner"></span>
        )}
        Create my SolTips page
      </button>
    </form>
  );
}
