import { useSupporterDonations } from '@/components/data-access/crowdfunding-data-access';
import LoadingSpinner from '@/components/shared/loading';
import NoData from '@/components/shared/no-data';
import { useCluster } from '../cluster/cluster-data-access';
import RelativeTime from '../shared/relative-time';
import { lamportsToSol } from '../utils/conversion.util';

type SupportersListProps = {
  username: string;
};

export const SupportersList: React.FC<SupportersListProps> = ({ username }) => {
  const { getExplorerUrl } = useCluster();
  const { data, isLoading } = useSupporterDonations({ username: username });

  if (isLoading) {
    return (
      <LoadingSpinner
        className="my-4"
        message="Loading the list of supporters..."
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <NoData className="my-4">
        You don't have any supporters yet. Share your creator link with the
        community 😀
      </NoData>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Transfer Amount</th>
            <th>Fees</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((supporterDonation, index) => (
              <tr className="hover" key={index}>
                <td>
                  {supporterDonation.name ? (
                    <a
                      href={getExplorerUrl(
                        `address/${supporterDonation.supporter.toBase58()}`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      <strong>{supporterDonation.name}</strong>
                      {}
                    </a>
                  ) : (
                    <strong>Someone</strong>
                  )}
                </td>
                <td>
                  {lamportsToSol(supporterDonation.amount.toNumber())} SOL
                </td>
                <td>{lamportsToSol(supporterDonation.fees.toNumber())} SOL</td>
                <td>
                  <RelativeTime
                    timestamp={supporterDonation.timestamp.toNumber()}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
