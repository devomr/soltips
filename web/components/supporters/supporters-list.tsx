import { useSupporterTransfer } from '@/components/data-access/crowdfunding-data-access';
import LoadingSpinner from '@/components/shared/loading';
import NoData from '@/components/shared/no-data';
import { useCluster } from '../cluster/cluster-data-access';
import RelativeTime from '../shared/relative-time';

type SupportersListProps = {
    username: string;
};

export const SupportersList: React.FC<SupportersListProps> = ({
    username,
}) => {
    const { getExplorerUrl } = useCluster();
    const { data, isLoading } = useSupporterTransfer({ username: username });

    if (isLoading) {
        return <LoadingSpinner className='my-4' message='Loading the list of supporters...' />;
    }

    if (!data || data.length === 0) {
        return <NoData className='my-4'>You don't have any supporters yet. Share your creator link with the community 😀</NoData>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Transfer Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {data &&
                        data.map((supporterTransfer, index) => (
                            <tr className="hover" key={index}>
                                <td>
                                    {supporterTransfer.name ? (
                                        <a
                                            href={getExplorerUrl(`address/${supporterTransfer.supporter.toBase58()}`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link"
                                        >
                                            <strong>{supporterTransfer.name}</strong>
                                            { }
                                        </a>
                                    ) : (
                                        <strong>Someone</strong>
                                    )}
                                </td>
                                <td>{supporterTransfer.transferAmount} SOL</td>
                                <td><RelativeTime timestamp={supporterTransfer.timestamp.toNumber()} /></td>
                            </tr>
                        ))}
                </tbody>
            </table>

        </div>
    );
};
