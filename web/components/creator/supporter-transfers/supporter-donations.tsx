import { useSupporterDonations } from '@/components/data-access/crowdfunding-data-access';
import LoadingSpinner from '@/components/shared/loading';
import NoData from '@/components/shared/no-data';
import { SupporterDonationCard } from './supporter-donation-card';

type SupporterDonationsProps = {
  username: string;
};

export const SupporterDonations: React.FC<SupporterDonationsProps> = ({
  username,
}) => {
  const { data, isLoading } = useSupporterDonations({ username: username });

  if (isLoading) {
    return (
      <LoadingSpinner
        className="my-4"
        message="Loading the recent supporters..."
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <NoData className="my-4">
        Your favorite creator does not have any supporters yet, but you can be
        the first one! 😀
      </NoData>
    );
  }

  return (
    <div className="space-y-4">
      {data &&
        data.map((supporterDonation, index) => (
          <SupporterDonationCard key={index} {...supporterDonation} />
        ))}
    </div>
  );
};
