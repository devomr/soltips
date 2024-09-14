import { LoadingSpinner } from '@/components/shared/loading';
import { PublicKey } from '@solana/web3.js';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { Alert } from '@/components/shared/alert';
import { useCrowdfundingProgram } from '@/data-access/crowdfunding-data-access';
import { getDonationItem } from '@/data-access/local-data-access';

export function SupporterDonations({ username }: { username: string }) {
  const { listSupporterDonations } = useCrowdfundingProgram();
  const { data, isLoading } = listSupporterDonations(username);

  if (isLoading) {
    return <LoadingSpinner>Loading the recent supporters...</LoadingSpinner>;
  }

  if (!data || data.length === 0) {
    return (
      <Alert>
        Your favorite creator does not have any supporters yet, but you can be
        the first one! 😀
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {data &&
        data.map((supporterDonation, index) => (
          <SupporterDonationCard key={index} props={{ ...supporterDonation }} />
        ))}
    </div>
  );
}

type SupporterDonationCardProps = {
  supporter: PublicKey;
  name: string;
  message: string;
  amount: number;
  quantity: number;
  item: string;
};

export function SupporterDonationCard({
  props,
}: {
  props: SupporterDonationCardProps;
}) {
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
}
