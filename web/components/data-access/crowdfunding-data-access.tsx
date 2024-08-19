'use client';

import { CROWDFUNDING_PROGRAM_ID, getCrowdfundingProgram } from '@soltips/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { BN } from '@coral-xyz/anchor';

export type Creator = {
  owner: PublicKey,
  username: string,
  fullname: string,
  bio: string,
  bump: number,
}

interface RegisterCreatorInput {
  owner: PublicKey,
  username: string,
  fullname: string,
  bio: string,
}

interface SupporterTransferInput {
  name: string;
  message: string;
  itemType: string;
  quantity: number;
  price: number;
  creator: Creator;
}

export function useCrowdfundingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getCrowdfundingProgram(provider);
  const client = useQueryClient();

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(CROWDFUNDING_PROGRAM_ID),
  });

  const accounts = useQuery({
    queryKey: ['crowdfunding', 'all', { cluster }],
    queryFn: () => program.account.creator.all(),
  });

  const registerCreator = useMutation<string, Error, RegisterCreatorInput>({
    mutationKey: ['crowdfunding', 'register-creator', { cluster }],
    mutationFn: async ({ username, fullname, bio, owner }) => {
      const creatorPda = getCreatorPda(owner);
      const usernamePda = getUsernamePda(username);

      const accounts = {
        creator: creatorPda,
        owner: owner,
        usernameAccount: usernamePda
      };

      return program.methods.registerCreator(username, fullname, bio)
        .accounts({ ...accounts })
        .rpc();
    },
    onSuccess: (signature) => {
      console.log(signature);
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });

  const supporterTransfer = useMutation<string, Error, SupporterTransferInput>({
    mutationKey: ['crowdfunding', 'supporter-transfer', { cluster }],
    mutationFn: async ({ name, message, itemType, quantity, price, creator }) => {

      const creatorPda = getCreatorPda(creator.owner);
      const creatorAccount = await program.account.creator.fetch(creatorPda);
      const supporterTransferPda = getSupporterTransferPda(creatorPda, creatorAccount.supportersCount)

      const accounts = {
        creator: creatorPda,
        supporterTransfer: supporterTransferPda,
        receiver: creator.owner
      }

      return program.methods.supportCreator(name, message, itemType, quantity, price)
        .accounts({ ...accounts })
        .rpc();
    },
    onSuccess: (signature, input) => {
      console.log(signature);
      transactionToast(signature);

      console.log(cluster)
      console.log(input.creator.username);

      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            'crowdfunding',
            'get-creator-by-username',
            { cluster, username: input.creator.username },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            'crowdfunding',
            'list-supporter-transfers',
            { cluster, username: input.creator.username },
          ],
        }),
      ]);
    },
    onError: () => toast.error('Failed to run program'),
  });



  return {
    program,
    CROWDFUNDING_PROGRAM_ID,
    getProgramAccount,
    accounts,
    registerCreator,
    supporterTransfer,
  };
}

export function useCheckUsername({ username }: { username: string }) {
  const { cluster } = useCluster();
  const { program } = useCrowdfundingProgram();

  return useQuery({
    queryKey: ['crowdfunding', 'check-username', { cluster, username }],
    queryFn: () => {
      const usernamePda = getUsernamePda(username);
      return program.account.creatorUsername.fetchNullable(usernamePda);
    },
  });
}

export function useGetCreatorByAddress({ address }: { address: PublicKey | null }) {
  const { cluster } = useCluster();
  const { program } = useCrowdfundingProgram();

  return useQuery({
    queryKey: ['crowdfunding', 'get-creator-by-address', { cluster, address }],
    queryFn: () => {

      if (!address) {
        return null;
      }

      const creatorPda = getCreatorPda(address);
      return program.account.creator.fetchNullable(creatorPda);
    }
  });
}

export function useGetCreatorByUsername({ username }: { username: string }) {
  const { cluster } = useCluster();
  const { program } = useCrowdfundingProgram();
  const { data: usernameRecord } = useCheckUsername({ username: username });

  return useQuery({
    queryKey: ['crowdfunding', 'get-creator-by-username', { cluster, username }],
    queryFn: () => {
      if (!usernameRecord) {
        return null;
      }
      const creatorPda = getCreatorPda(usernameRecord.owner);
      return program.account.creator.fetchNullable(creatorPda);
    },
    enabled: !!usernameRecord,
  });
}

export function useSupporterTransfer({ username }: { username: string }) {
  const { cluster } = useCluster();
  const { program } = useCrowdfundingProgram();
  const { data: usernameRecord } = useCheckUsername({ username: username });

  return useQuery({
    queryKey: ['crowdfunding', 'list-supporter-transfers', { cluster, username }],
    queryFn: async () => {

      if (!usernameRecord) {
        return [];
      }

      const creatorPda = getCreatorPda(usernameRecord.owner);
      const creator = await program.account.creator.fetchNullable(creatorPda);

      if (!creator) {
        return [];
      }

      const results = [];

      for (let idx = creator.supportersCount - 1; idx >= 0; idx--) {
        const supporterTransferPda = getSupporterTransferPda(creatorPda, new BN(idx));
        const supporterTransfer = await program.account.supporterTransfer.fetchNullable(supporterTransferPda);

        if (supporterTransfer) {
          results.push(supporterTransfer);
        }
      }
      return results;
    },
    enabled: !!usernameRecord,
  });
}

// export function useCrowdfundingProgramAccount({ account }: { account: PublicKey }) {
//   const { cluster } = useCluster();
//   const transactionToast = useTransactionToast();
//   const { CROWDFUNDING_PROGRAM_ID, program, accounts } = useCrowdfundingProgram();

//   const accountQuery = useQuery({
//     queryKey: ['crowdfunding', 'fetch', { cluster, account }],
//     queryFn: () => program.account.creator.fetch(account),
//   });

//   const updateCreator = useMutation<string, Error, >({
//     mutationKey: ['crowdfunding', 'updateCreator', { cluster }],
//     mutationFn: async ({ username, fullname, bio, owner }) => {
//       const [creatorAddress] = PublicKey.findProgramAddressSync(
//         [Buffer.from('creator'), owner.toBuffer()],
//         CROWDFUNDING_PROGRAM_ID
//       );

//       return program.methods.updateCreator(username, fullname, bio)
//         .accounts({
//           owner: creatorAddress,
//         })
//         .rpc();
//     },
//     onSuccess: (signature) => {
//       transactionToast(signature);
//     },
//     onError: () => toast.error('Failed to run program'),
//   });

//   return {
//     accountQuery,
//     updateCreator
//   };
// }

const getUsernamePda = (username: string) => {
  const [usernamePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('username'), Buffer.from(username)
    ],
    CROWDFUNDING_PROGRAM_ID
  );

  return usernamePda;
}

const getCreatorPda = (address: PublicKey) => {
  const [creatorPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('creator'), address.toBuffer()],
    CROWDFUNDING_PROGRAM_ID
  );
  return creatorPda;
}

const getSupporterTransferPda = (creatorPda: PublicKey, supportersCount: BN) => {
  const [supporterTransferPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('supporterTransfer'),
      creatorPda.toBuffer(),
      supportersCount.toArrayLike(Buffer, "le", 8),
    ],
    CROWDFUNDING_PROGRAM_ID
  );

  return supporterTransferPda;
}