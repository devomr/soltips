'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import DashboardLayout from '../dashboard/dashboard-layout';
import EditProfileForm from './edit-profile-form';

export default function ProfileFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });


  // useEffect(() => {
  //   if (!creator) {
  //     router.push('/');
  //   }
  // }, [creator, router]);

  if (creator) {
    return (
      <DashboardLayout>
        <div className='rounded-md bg-white p-4'>
          <h3 className='font-bold text-xl mb-4'>
            My Profile
          </h3>

          <EditProfileForm />
        </div>
      </DashboardLayout>
    );
  }
}
