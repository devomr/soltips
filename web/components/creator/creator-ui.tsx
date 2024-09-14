import Link from 'next/link';
import { ShareButton } from '../shared/buttons/share-button';
import { UserAvatar } from '../shared/user-avatar';
import { CreatorTab } from './types/creator-tab.type';
import { SocialIcon } from '../shared/icons/social-icon';
import { Creator } from '@/data-access/crowdfunding-data-access';

export function CreatorHeader({ creator }: { creator: Creator }) {
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

export function CreatorTabs({
  tabs,
  basePath,
  activePath,
}: {
  tabs: CreatorTab[];
  basePath: string;
  activePath: string | null;
}) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4">
        <div role="tablist" className="font-semibold">
          {tabs.map((tab, tabIndex) => {
            const tabHref = `${basePath}/${tab.path}`; // Construct the full href
            const isActive =
              activePath === tabHref ||
              (activePath === basePath && tab.path === '');

            return (
              <Link
                href={tabHref}
                key={tabIndex}
                className={`inline-block border-b-4 p-4 ${isActive ? 'border-creator-primary text-creator-primary' : 'border-transparent'}`}
              >
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SocialLinks({ links }: { links: string[] }) {
  return (
    <div className="flex gap-2">
      {links.map((link, index) => (
        <a key={index} href={link} target="_blank" rel="noopener noreferrer">
          <SocialIcon url={link} size={28} />
        </a>
      ))}
    </div>
  );
}
