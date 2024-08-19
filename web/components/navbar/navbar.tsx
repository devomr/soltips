import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from '../solana/solana-provider';
import { AccountBalance } from '../account/account-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGetCreatorByAddress } from '../data-access/crowdfunding-data-access';

type NavbarLink = {
  label: string;
  path: string;
};


export function Navbar() {
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const { data: creator } = useGetCreatorByAddress({ address: publicKey });
  const navbarLinks: NavbarLink[] = [];

  if (creator) {
    navbarLinks.push({ label: 'Dashboard', path: '/dashboard' });
    navbarLinks.push({ label: 'Profile', path: `/creator/${creator.username}` });
  }

  return (
    <nav className="navbar relative flex-col space-y-2 shadow-md md:flex-row md:space-y-0 md:px-8 bg-white">
      <div className="flex-1">
        <Link className="mr-4 cursor-pointer normal-case" href="/">
          <span className="whitespace-nowrap text-xl font-bold"> SolTips </span>
        </Link>
        <ul className="menu menu-horizontal space-x-1 px-1">
          {publicKey &&
            navbarLinks.map(({ label, path }) => (
              <li key={path}>
                <Link
                  className={pathname.startsWith(path) ? 'active' : ''}
                  href={path}
                >
                  {label}
                </Link>
              </li>
            ))}
        </ul>
      </div>
      <div className="flex-none space-x-2">
        {publicKey && <AccountBalance address={publicKey} />}
        <WalletButton />
      </div>
    </nav>
  );
}
