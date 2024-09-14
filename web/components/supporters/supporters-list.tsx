import NoData from '@/components/shared/no-data';
import { useCluster } from '../cluster/cluster-data-access';
import RelativeTime from '../shared/relative-time';
import { lamportsToSol } from '../utils/conversion.util';
import { LoadingSpinner } from '../shared/loading';
import {
  Creator,
  useCrowdfundingProgram,
} from '@/data-access/crowdfunding-data-access';

export function SupportersList({ creator }: { creator: Creator }) {
  const { getExplorerUrl } = useCluster();
  const { listSupporterDonations } = useCrowdfundingProgram();
  const { data, isLoading } = listSupporterDonations(creator.username);

  if (isLoading) {
    return (
      <LoadingSpinner className="my-4">
        Loading the list of supporters...
      </LoadingSpinner>
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
                      className="link font-semibold no-underline hover:underline"
                    >
                      {supporterDonation.name}
                    </a>
                  ) : (
                    <span className="font-semibold">Someone</span>
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
}
