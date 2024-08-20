'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useCheckUsername, useCrowdfundingProgram, useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { IconCamera, IconCameraFilled } from '@tabler/icons-react';

type ProfileFormData = {
  fullname: string;
  bio: string;
};

type RegisterFormError = {
  username: string;
  fullname: string;
  bio: string;
};

const initialProfileFormData: ProfileFormData = {
  fullname: '',
  bio: '',
};

const initialRegisterFormError: RegisterFormError = {
  username: '',
  fullname: '',
  bio: ''
};

// Define the Zod schema for validation
const profileFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  fullname: z.string()
    .min(3, 'Fullname must be at least 3 characters')
    .max(100, 'Fullname must be at most 100 characters'),
  bio: z.string()
    .max(250, 'Fullname must be at most 250 characters'),
});

export default function EditProfileForm() {
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  const { registerCreator } = useCrowdfundingProgram();
  const router = useRouter();
  const queryParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>(initialProfileFormData);
  const [errors, setErrors] = useState<RegisterFormError>(initialRegisterFormError);

  useEffect(() => {
    if (creator) {
      setProfileFormData((prevState) => ({
        ...prevState,
        fullname: creator.fullname,
        bio: creator.bio,
      }));
    }
  }, [creator])

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    // Preview the image
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfileFormData({
      ...profileFormData,
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
    const validationResult = profileFormSchema.safeParse(profileFormData);

    if (validationResult.error) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0] || '',
        fullname: fieldErrors.fullname?.[0] || '',
        bio: fieldErrors.bio?.[0] || '',
      });

      return;
    }

    // all data is valid and the creator can be registered
    const { fullname, bio } = profileFormData;
    // await registerCreator.mutateAsync({ username, fullname, bio, owner: publicKey });

  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='relative flex justify-center items-center w-20 h-20 cursor-pointer mb-4' onClick={handleDivClick} >
        <div className='absolute bg-black z-10 opacity-40 w-full h-full rounded-full'></div>
        <IconCameraFilled size={24} className='absolute z-20 text-white' />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          hidden
        />
        {preview && <img src={preview} alt="Selected file" className="absolute w-20 h-20 rounded-full object-cover" />}

      </div>
      <div className="mb-2">
        <label htmlFor="name" className='font-bold'>Name:</label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={profileFormData.fullname}
          placeholder="John Smith"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-2 text-slate-900 focus:border-slate-900 focus:bg-white"
          onChange={handleChange}
          required
        />
        {errors.fullname && <p className='text-red-600 text-sm'>{errors.fullname}</p>}
      </div>
      <div className="mb-2">
        <label htmlFor="bio" className='font-bold'>Bio:</label>
        <textarea
          id="bio"
          name="bio"
          className="mt-1 w-full rounded-md bg-gray-100 px-4 py-2 text-slate-900 focus:border-slate-900 focus:bg-white"
          placeholder="Blockchain Developer and coffee lover"
          value={profileFormData.bio}
          onChange={handleChange}
        ></textarea>
        {errors.bio && <p className='text-red-600 text-sm'>{errors.bio}</p>}
      </div>
      <button
        type="submit"
        className="btn btn-md rounded-btn bg-purple-800 text-white outline-none hover:bg-purple-700"
        disabled={registerCreator.isPending}
      >
        Save changes {registerCreator.isPending && '...'}
      </button>
    </form>
  );
};