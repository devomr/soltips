'use client';

import { SupporterDonations } from './supporter-donations';
import { useCreator } from '@/context/creator-context';
import { CreatorLayout } from './creator-layout';
import { DonationForm } from './donation-form';
import { SocialLinks } from './creator-ui';

export default function CreatorFeature() {
  return (
    <CreatorLayout>
      <CreatorAboutSection />
    </CreatorLayout>
  );
}

function CreatorAboutSection() {
  const { creator } = useCreator();

  if (!creator) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="order-2 lg:order-1 lg:col-span-2">
        <div className="rounded-box mb-4 w-full bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">About me</h2>
          <p>{creator.bio}</p>
          {creator.socialLinks.length > 0 && (
            <div className="mt-4">
              <SocialLinks links={creator.socialLinks} />
            </div>
          )}
        </div>
        <section className="rounded-box bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Recent supporters 🤝
          </h2>
          <SupporterDonations username={creator.username} />
        </section>
      </div>
      <div className="order-1">
        <div className="rounded-box bg-white p-4">
          <DonationForm creator={creator} />
        </div>
      </div>
    </div>
  );
}
