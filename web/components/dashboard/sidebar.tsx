// components/Sidebar.tsx
import Link from 'next/link';
import {
  IconAppWindow,
  IconHeartHandshake,
  IconHome,
  IconLayoutDashboard,
  IconMenu2,
  IconMoneybag,
  IconSettings,
  IconSquareX,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';

const Sidebar = () => {
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });

  const [isOpen, setIsOpen] = useState(false);
  const username = creator?.username || '';

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const linkGroups = (username: string) => [
    {
      title: 'General',
      links: [
        {
          href: '/dashboard',
          icon: IconLayoutDashboard,
          label: 'Dashboard',
          target: '_self',
        },
        {
          href: `/creator/${username}`,
          icon: IconAppWindow,
          label: 'View creator page',
          target: '_blank',
        },
      ],
    },
    {
      title: 'Monetize',
      links: [
        {
          href: '/supporters',
          icon: IconHeartHandshake,
          label: 'Supporters',
          target: '_self',
        },
        {
          href: '/campaigns',
          icon: IconMoneybag,
          label: 'Campaigns',
          target: '_self',
        },
      ],
    },
    {
      title: 'Settings',
      links: [
        { href: '/profile', icon: IconUser, label: 'Profile', target: '_self' },
        {
          href: '/creator-page',
          icon: IconSettings,
          label: 'Creator page',
          target: '_self',
        },
      ],
    },
  ];

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[20]">
        <button
          onClick={toggleSidebar}
          className="btn btn-circle btn-lg bg-purple-800 text-white hover:bg-purple-700 md:hidden"
          title={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-[11] w-64 bg-white text-slate-900 transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex-1 overflow-y-auto">
          {linkGroups(username).map((group, groupIndex) => (
            <div key={groupIndex} className="px-6 py-4">
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-400">
                {group.title}
              </h2>
              <div className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <Link
                    href={link.href}
                    key={linkIndex}
                    className="flex w-full items-center rounded-full px-4 py-2 hover:bg-gray-200"
                    target={link.target}
                  >
                    <link.icon size={20} className="mr-2" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-[10] bg-black opacity-50 md:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
