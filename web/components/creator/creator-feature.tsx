'use client';

import { useParams } from 'next/navigation';
import DonationForm from './donation-form';
import { UserAvatar } from '../shared/user-avatar';
import {
  Creator,
  useGetCreatorByUsername,
} from '../data-access/crowdfunding-data-access';
import LoadingSpinner from '../shared/loading';
import NoData from '../shared/no-data';
import { ShareButton } from '../shared/buttons/share-button';
import { SupporterDonations } from './supporter-transfers/supporter-donations';
import { getAccessibleTextColor, getRGBColor } from '../utils/theme.util';

function getCreatorTheme(color: string) {
  const primaryColor = getRGBColor(color, 'creator-theme-color');
  const textColor100 = getRGBColor(
    getAccessibleTextColor(color, 1),
    'creator-theme-text-color-100',
  );
  const textColor20 = getRGBColor(
    getAccessibleTextColor(color, 0.2),
    'creator-theme-text-color-20',
  );

  return {
    ...primaryColor,
    ...textColor100,
    ...textColor20,
  } as React.CSSProperties;
}

export default function CreatorFeature() {
  const params = useParams<{ username: string }>();
  const { data: creator, isLoading } = useGetCreatorByUsername({
    username: params.username,
  });

  if (isLoading) {
    return (
      <LoadingSpinner
        className="my-4"
        message="Please wait, we are loading the creator profile..."
      />
    );
  }

  // if (!creator && isFetched) {
  //   return (
  //     <NoData className="my-4">
  //       This creator is not on our platform. You can let him know about us.
  //     </NoData>
  //   );
  // }

  if (!creator) {
    return null;
  }

  return (
    <div style={getCreatorTheme(creator.themeColor)}>
      <CreatorPageHeader creator={creator} />
      <div className="mx-auto max-w-screen-xl p-4">
        <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-3">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="rounded-box mb-4 w-full bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold">About me</h2>
              <p>{creator.bio}</p>
            </div>
            <section className="rounded-box bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Recent supporters 🤝
              </h2>
              <SupporterDonations username={params.username} />
            </section>
          </div>
          <div className="order-1">
            <div className="rounded-box bg-white p-4">
              <DonationForm creator={creator} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatorPageHeader({ creator }: { creator: Creator }) {
  return (
    <div className="top-[64px] z-10 bg-white md:sticky">
      <div className="mx-auto max-w-screen-xl p-4">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <UserAvatar
              name={creator.fullname}
              imageUrl={creator.imageUrl}
              customTheme={true}
            />
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-2xl font-semibold">{creator.fullname}</h1>
              {creator.isSupportersCountVisible && (
                <p>❤️ {creator.supportersCount.toNumber()} supporter(s)</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <ShareButton username={creator.username} />
          </div>
        </div>
      </div>
    </div>
  );
}
