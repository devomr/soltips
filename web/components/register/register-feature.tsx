'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import RegisterForm from './register-form';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator, isLoading } = useGetCreatorByAddress({
    address: publicKey,
  });

  useEffect(() => {
    if (creator) {
      // redirect logged in creator to dashboard
      router.push('/dashboard');
    }
  }, [creator]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="mx-4 mt-6 max-w-full md:mx-auto md:max-w-[600px]">
      <h1 className="text-balance mb-4 text-center text-4xl font-bold text-slate-900">
        Start Your Page
      </h1>
      <p className="mb-8 text-center text-lg text-gray-500">
        Unlock powerful features that help you monetize your content and get
        paid in crypto effortlessly 💸
      </p>
      <RegisterForm />
    </div>
  );
}
