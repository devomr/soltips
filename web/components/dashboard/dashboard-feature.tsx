'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';
import { useEffect, useState } from 'react';
import DashboardLayout from './dashboard-layout';
import { UserAvatar } from '../creator/user-avatar';
import Link from 'next/link';
import { IconCopy, IconCurrencySolana, IconHeart, IconShare3, IconUser } from '@tabler/icons-react';
import AnimatedCardNumber from '../shared/animated-card-number';
import { ShareButton } from '../creator/share-button';

export default function DashboardFeature() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  console.log(creator);

  // useEffect(() => {
  //   if (!creator) {
  //     router.push('/');
  //   }
  // }, [creator, router]);

  if (creator) {
    return (
      <DashboardLayout>
        <div className='grid grid-cols-1 gap-4'>
          <div className='rounded-md bg-white p-4'>
            <div className='flex justify-between'>
              <div className='flex gap-4'>
                <UserAvatar name={creator.fullname} />
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {creator.fullname}
                  </h2>
                  <Link href={`/creator/${creator.username}`} target='_blank' className='text-sm text-slate-500'>
                    @{creator.username}
                  </Link>
                </div>
              </div>
              <ShareButton username={creator.username} />
            </div>
          </div>
          <div className='rounded-md bg-white p-4'>
            <h3 className='font-bold text-xl mb-4'>
              Earnings 💰
            </h3>

            {
              creator.availableFunds.toNumber() > 0 && (
                <div role='alert' className='p-4 bg-purple-500 rounded-md flex justify-between items-center mb-4'>
                  <span className='text-white font-bold'>Yay! You have available funds to withdraw 🎉</span>
                  <button className='btn btn-sm bg-purple-800 text-white border-none hover:bg-purple-800'>Withdraw</button>
                </div>
              )
            }

            <div className='grid grid-cols-3 gap-4'>
              <AnimatedCardNumber
                value={creator.availableFunds.toNumber()}
                label="Available Funds"
                suffix="SOL"
                icon={<IconCurrencySolana size={24} />}
              />
              <AnimatedCardNumber
                value={creator.withdrawnFunds.toNumber()}
                label="Withdrawn Funds"
                suffix="SOL"
                icon={<IconCurrencySolana size={24} />}
              />
              <AnimatedCardNumber
                value={creator.supportersCount.toNumber()}
                label="Supporters"
                icon={<IconHeart size={24} />}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}
