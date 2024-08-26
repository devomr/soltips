import React, { useState } from 'react';
import { Creator } from '../data-access/crowdfunding-data-access';
import { getDonationItem } from '../data-access/local-data-access';

type DonateButtonProps = {
  creator: Creator;
};

export function DonateButton({ creator }: DonateButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const donationItem = getDonationItem(creator.donationItem);

  const handleCopyProfileLink = async () => {
    // try {
    //   const profileLink = `${process.env.NEXT_PUBLIC_APP_URL}/creator/${username}`;
    //   await navigator.clipboard.writeText(profileLink);
    //   setLinkCopied(true);
    //   setTimeout(() => setLinkCopied(false), 3000);
    // } catch (error) {
    //   console.error('Failed to copy: ', error);
    // }
  };

  return (
    <button className="btn btn-md min-w-[200px] rounded-full bg-purple-800 text-base text-white hover:bg-purple-700">
      {donationItem?.icon} Tip
    </button>
  );
}
