'use client';

import { UserAvatar } from '../shared/user-avatar';
import Link from 'next/link';
import {
  IconCurrencySolana,
  IconHeart,
  IconMoneybag,
} from '@tabler/icons-react';
import AnimatedCardNumber from '../shared/cards/animated-card-number';
import { ShareButton } from '../shared/buttons/share-button';
import { lamportsToSol } from '../utils/conversion.util';
import { useCreator } from '@/context/creator-context';
import DashboardLayout from '../layouts/dashboard-layout';

export default function DashboardFeature() {
  return (
    <DashboardLayout>
      <DashboardSection />
    </DashboardLayout>
  );
}

export function DashboardSection() {
  const { creator } = useCreator();

  if (!creator) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="rounded-box bg-white p-4">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="flex gap-3 max-md:mb-4">
            <UserAvatar name={creator.fullname} />
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                {creator.fullname}
              </h2>
              <Link
                href={`/creator/${creator.username}`}
                target="_blank"
                className="text-sm text-slate-500"
              >
                @{creator.username}
              </Link>
            </div>
          </div>
          <ShareButton username={creator.username} />
        </div>
      </div>
      <div className="rounded-box bg-white p-4">
        <h3 className="mb-4 text-xl font-semibold">Overview</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatedCardNumber
            value={lamportsToSol(creator.supporterDonationsAmount.toNumber())}
            label="Received Tips"
            suffix="SOL"
            icon={<IconCurrencySolana size={24} />}
          />
          <AnimatedCardNumber
            value={creator.supportersCount.toNumber()}
            label="Supporters"
            icon={<IconHeart size={24} />}
          />
          <AnimatedCardNumber
            value={creator.campaignsCount.toNumber()}
            label="Campaigns"
            icon={<IconMoneybag size={24} />}
          />
        </div>
      </div>
    </div>
  );
}
