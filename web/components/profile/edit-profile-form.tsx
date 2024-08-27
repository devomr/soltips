'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import {
  useCheckUsername,
  useCrowdfundingProgram,
  useGetCreatorByAddress,
} from '../data-access/crowdfunding-data-access';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { IconCamera, IconCameraFilled } from '@tabler/icons-react';

type ProfileFormData = {
  fullname: string;
  bio: string;
  imageUrl: string;
};

type ProfileFormError = {
  fullname: string;
  bio: string;
};

const initialProfileFormData: ProfileFormData = {
  fullname: '',
  bio: '',
  imageUrl: '',
};

const initialProfileFormError: ProfileFormError = {
  fullname: '',
  bio: '',
};

// Define the Zod schema for validation
const profileFormSchema = z.object({
  fullname: z
    .string()
    .min(3, 'Fullname must be at least 3 characters')
    .max(100, 'Fullname must be at most 100 characters'),
  bio: z.string().max(250, 'Fullname must be at most 250 characters'),
});

export default function EditProfileForm() {
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  const { updateCreatorProfile } = useCrowdfundingProgram();
  const router = useRouter();
  const queryParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>(
    initialProfileFormData,
  );
  const [errors, setErrors] = useState<ProfileFormError>(
    initialProfileFormError,
  );

  useEffect(() => {
    if (creator) {
      setProfileFormData((prevState) => ({
        ...prevState,
        fullname: creator.fullname,
        bio: creator.bio,
      }));
    }
  }, [creator]);

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
      alert('Please connect your wallet');
      return;
    }

    // Clear previous errors
    setErrors(initialProfileFormError);

    // Validate the update profile form fields
    const validationResult = profileFormSchema.safeParse(profileFormData);

    if (validationResult.error) {
      const fieldErrors = validationResult.error.formErrors.fieldErrors;

      setErrors({
        fullname: fieldErrors.fullname?.[0] || '',
        bio: fieldErrors.bio?.[0] || '',
      });

      return;
    }

    await updateCreatorProfile.mutateAsync({
      ...profileFormData,
      owner: publicKey,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="relative mb-4 flex h-20 w-20 cursor-pointer items-center justify-center"
        onClick={handleDivClick}
      >
        <div className="absolute z-10 h-full w-full rounded-full bg-black opacity-40"></div>
        <IconCameraFilled size={24} className="absolute z-20 text-white" />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          hidden
        />
        {preview && (
          <img
            src={preview}
            alt="Selected file"
            className="absolute h-20 w-20 rounded-full object-cover"
          />
        )}
      </div>
      <div className="mb-2">
        <label htmlFor="fullname" className="font-bold">
          Full name
        </label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={profileFormData.fullname}
          placeholder="John Smith"
          className="input mt-1 w-full border-2 bg-gray-100 focus:border-slate-900 focus:bg-white focus:outline-none"
          onChange={handleChange}
          required
        />
        {errors.fullname && (
          <p className="text-sm text-red-600">{errors.fullname}</p>
        )}
      </div>
      <div className="mb-2">
        <label htmlFor="bio" className="font-bold">
          What are you creating?
        </label>
        <textarea
          id="bio"
          name="bio"
          className="textarea textarea-md mt-1 w-full border-2 bg-gray-100 text-base focus:border-slate-900 focus:bg-white focus:outline-none"
          placeholder="Blockchain Developer and coffee lover"
          value={profileFormData.bio}
          onChange={handleChange}
        ></textarea>
        {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
      </div>
      <button
        type="submit"
        className="btn btn-md rounded-btn bg-purple-800 text-white outline-none hover:bg-purple-700"
        disabled={updateCreatorProfile.isPending}
      >
        {updateCreatorProfile.isPending && (
          <span className="loading loading-spinner"></span>
        )}
        Save changes
      </button>
    </form>
  );
}
