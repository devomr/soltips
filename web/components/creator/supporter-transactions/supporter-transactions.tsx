import { useSupporterTransfer } from '@/components/data-access/crowdfunding-data-access';
import { SupporterTransactionCard } from './supporter-transaction-card';
import LoadingSpinner from '@/components/shared/loading';
import NoData from '@/components/shared/no-data';

type SupporterTransactionsProps = {
  username: string;
};

export const SupporterTransactions: React.FC<SupporterTransactionsProps> = ({
  username,
}) => {
  const { data, isLoading } = useSupporterTransfer({ username: username });

  if (isLoading) {
    return <LoadingSpinner className='my-4' message='Loading the recent supporters...' />;
  }

  if (!data || data.length === 0) {
    return <NoData className='my-4'>Your favorite creator does not have any supporters yet, but you can be the first one! 😀</NoData>;
  }

  return (
    <div className="space-y-4">
      {data &&
        data.map((supporterTransaction, index) => (
          <SupporterTransactionCard
            key={index}
            {...supporterTransaction}
          />
        ))}
    </div>
  );
};
