'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useCheckUsername, useCrowdfundingProgram } from '../data-access/crowdfunding-data-access';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

type RegisterFormData = {
  username: string;
  fullname: string;
  bio: string;
};

type RegisterFormError = {
  username: string;
  fullname: string;
  bio: string;
};

const initialRegisterFormData: RegisterFormData = {
  username: '',
  fullname: '',
  bio: '',
};

const initialRegisterFormError: RegisterFormError = {
  username: '',
  fullname: '',
  bio: ''
};

// Define the Zod schema for validation
const registerFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  fullname: z.string()
    .min(3, 'Fullname must be at least 3 characters')
    .max(100, 'Fullname must be at most 100 characters'),
  bio: z.string()
    .max(250, 'Fullname must be at most 250 characters'),
});

export default function RegisterForm() {
  const { publicKey } = useWallet();
  const { registerCreator } = useCrowdfundingProgram();
  const router = useRouter();
  const queryParams = useSearchParams();

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>(initialRegisterFormData);
  const [errors, setErrors] = useState<RegisterFormError>(initialRegisterFormError);

  const { data: usernameRecord } = useCheckUsername({ username: registerFormData.username });

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert("Please connect your wallet");
      return;
    }

    // Clear previous errors
    setErrors(initialRegisterFormError);

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
        username: "Username is already taken",
      });

      return;
    }

    // all data is valid and the creator can be registered
    const { username, fullname, bio } = registerFormData;
    await registerCreator.mutateAsync({ username, fullname, bio, owner: publicKey });


    // redirect to dashboard after registration
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className='bg-white p-6 rounded-md shadow-md'>
      <div className="mb-2">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={registerFormData.fullname}
          placeholder="John Smith"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-2 text-slate-900 focus:border-slate-900 focus:bg-white"
          onChange={handleChange}
          required
        />
        {errors.fullname && <p className='text-red-600 text-sm'>{errors.fullname}</p>}
      </div>
      <div className="mb-2">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={registerFormData.username}
          placeholder="johnsmith"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-2 text-slate-900 focus:border-slate-900 focus:bg-white"
          onChange={handleChange}
          required
        />
        {errors.username && <p className='text-red-600 text-sm'>{errors.username}</p>}
      </div>
      <div className="mb-2">
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          name="bio"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-2 text-slate-900 focus:border-slate-900 focus:bg-white"
          placeholder="Blockchain Developer and coffee lover"
          value={registerFormData.bio}
          onChange={handleChange}
        ></textarea>
        {errors.bio && <p className='text-red-600 text-sm'>{errors.bio}</p>}
      </div>
      <button
        type="submit"
        className="btn btn-md rounded-btn w-full bg-purple-800 text-white outline-none hover:bg-purple-700"
        disabled={registerCreator.isPending}
      >
        Create my SolTips page {registerCreator.isPending && '...'}
      </button>
    </form>
  );
};