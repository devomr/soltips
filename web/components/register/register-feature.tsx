'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import RegisterForm from './register-form';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterFeature() {

  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  useEffect(() => {
    if (creator) {
      // redirect logged in creator to dashboard
      router.push('/dashboard');
    }

  }, [creator]);

  return (
    <div className="mx-auto mt-10 w-[600px] max-w-full">
      <h1 className="text-balance mb-6 text-center text-4xl font-bold text-slate-900">
        Start Your Page
      </h1>
      <RegisterForm />
    </div>
  );
}
