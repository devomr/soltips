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
    <div className="rounded-box bg-purple-200 p-4">
      <div className="flex justify-between">
        <div>
          <p>
            {name ? (
              <a
                href={getExplorerUrl(`address/${supporter.toBase58()}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                <strong>{name}</strong>
                {}
              </a>
            ) : (
              <strong>Someone</strong>
            )}{' '}
            bought you {quantity} {donationItemName} 🎉
          </p>
        </div>
      </div>
      {message && (
        <div className="mt-2 rounded-md bg-purple-50 p-2">
          <p className="text-slate-900">{message}</p>
        </div>
      )}
    </div>
  );
};
