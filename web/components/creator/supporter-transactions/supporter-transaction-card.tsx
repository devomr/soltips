import { useCluster } from '@/components/cluster/cluster-data-access';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type SupporterTransactionProps = {
  supporter: PublicKey;
  name: string;
  message: string;
  transferAmount: number;
  itemType: string;
  quantity: number;
  price: number;
  timestamp: BN;
};

const getItemTypeName = (itemType: string, quantity: number) => {
  if (itemType === 'coffee') {
    return quantity > 1 ? 'coffees' : 'coffee';
  }
  return itemType;
}

export const SupporterTransactionCard: React.FC<SupporterTransactionProps> = (
  props: SupporterTransactionProps,
) => {
  const { getExplorerUrl } = useCluster();
  const {
    supporter,
    name,
    message,
    transferAmount,
    itemType,
    quantity,
    price,
    timestamp } = props;

  return (
    <div className="rounded-md border-slate-400 bg-purple-100 p-4">
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
                { }
              </a>
            ) : (
              <strong>Someone</strong>
            )}{' '}
            bought you {quantity} {getItemTypeName(itemType, quantity)} 🎉
          </p>
        </div>
      </div>
      {message && (
        <div className="mt-2 rounded-md bg-white p-2">
          <p className="text-slate-900">{message}</p>
        </div>
      )}
    </div>
  );
};
