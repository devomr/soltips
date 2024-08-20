import Link from 'next/link';
import { WalletButton } from '../solana/solana-provider';
import { AccountBalance } from '../account/account-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export function Navbar() {
  const { publicKey } = useWallet();

  return (
    <nav className="navbar sticky top-0 z-[100] flex-col space-y-2 shadow-md md:flex-row md:space-y-0 md:px-8 bg-white">
      <div className="flex-1">
        <Link className="cursor-pointer normal-case" href="/">
          <span className="whitespace-nowrap text-xl font-bold"> SolTips </span>
        </Link>
      </div>
      <div className="flex-none space-x-2">
        {publicKey && <AccountBalance address={publicKey} />}
        <WalletButton />
      </div>
    </nav>
  );
}
