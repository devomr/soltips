'use client';

import { useParams } from 'next/navigation';
import DonationForm from './donation-form';
import { UserAvatar } from './user-avatar';
import { SupporterTransactions } from './supporter-transactions/supporter-transactions';
import { useGetCreatorByUsername } from '../data-access/crowdfunding-data-access';
import { IconUsers } from '@tabler/icons-react';
import LoadingSpinner from '../shared/loading';
import NoData from '../shared/no-data';
import { ShareButton } from './share-button';

export default function CreatorFeature() {
  const params = useParams<{ username: string }>();
  const { data: creator, isLoading } = useGetCreatorByUsername({ username: params.username });

  if (isLoading) {
    return <LoadingSpinner className='my-4' message='Please wait, we are loading the creator profile...' />
  }

  if (!creator) {
    return <NoData className='my-4'>This creator is not on our platform. You can let him know about us.</NoData>;
  }

  if (creator) {
    return (
      <div className='mx-4 lg:mx-8'>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
          <section className="lg:col-span-3 order-1 rounded-md bg-white p-4 w-full">
            <div className='flex justify-between'>
              <div className="flex gap-4">
                <UserAvatar name={creator.fullname} />
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {creator.fullname}
                  </h2>
                  {
                    creator.displaySupportersCount && (
                      <div className='text-sm text-slate-500 flex gap-1 items-center'>
                        <IconUsers size={18} />
                        <p >{creator.supportersCount.toNumber()} supporter(s)</p>
                      </div>
                    )
                  }
                </div>
              </div>
              <ShareButton username={creator.username} />
            </div>
            <div className='mt-4'>
              <h3 className='text-lg font-bold mb-2'>About me</h3>
              <p>{creator.bio}</p>
            </div>
          </section>
          <section className="order-3 lg:col-span-2 rounded-md bg-white p-4">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Recent supporters 🤝
            </h3>
            <SupporterTransactions username={params.username} />
          </section>
          <section className="order-2 lg:order-3 rounded-md bg-white p-4">
            <DonationForm creator={creator} />
          </section>
        </div>

      </div>
    );
  }
}
