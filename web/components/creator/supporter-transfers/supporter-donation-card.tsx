import { useCluster } from '@/components/cluster/cluster-data-access';
import { getDonationItem } from '@/components/data-access/local-data-access';
import { PublicKey } from '@solana/web3.js';

type SupporterDonationCardProps = {
  supporter: PublicKey;
  name: string;
  message: string;
  amount: number;
  quantity: number;
  item: string;
};

export const SupporterDonationCard: React.FC<SupporterDonationCardProps> = (
  props: SupporterDonationCardProps,
) => {
  const { getExplorerUrl } = useCluster();
  const { supporter, name, message, item, quantity } = props;

  const donationItem = getDonationItem(item);
  const donationItemName =
    quantity > 1 ? donationItem.plural : donationItem.value;

  return (
    <div className="rounded-box bg-creator-primary text-creator-20 bg-opacity-20 p-4">
      <div className="flex justify-between">
        <p>
          {name ? (
            <a
              href={getExplorerUrl(`address/${supporter.toBase58()}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="link font-semibold no-underline hover:underline"
            >
              {name}
            </a>
          ) : (
            <span className="font-semibold">Someone</span>
          )}{' '}
          bought {quantity} {donationItemName} 🎉
        </p>
      </div>
      {message && (
        <div className="bg-creator-primary mt-2 rounded-md bg-opacity-10 p-2">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};
