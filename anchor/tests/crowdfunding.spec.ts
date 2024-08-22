import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { Crowdfunding } from '../target/types/crowdfunding';
import { makeKeypairs } from '@solana-developers/helpers';
import { randomBytes } from 'crypto';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  type TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

const getRandomBigNumber = (size = 8) => {
  return new BN(randomBytes(size));
};

const getCreatorPda = (programId: PublicKey, address: PublicKey) => {
  const [creatorPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('creator'), address.toBuffer()],
    programId,
  );
  return creatorPda;
};

const getCreatorUsernamePda = (programId: PublicKey, username: string) => {
  const [creatorPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('username'), Buffer.from(username)],
    programId,
  );
  return creatorPda;
};

const getSupporterTransferPda = (
  programId: PublicKey,
  creatorPda: PublicKey,
  supportersCount: BN,
) => {
  const [supporterTransferPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('supporterTransfer'),
      creatorPda.toBuffer(),
      supportersCount.toArrayLike(Buffer, 'le', 8),
    ],
    programId,
  );

  return supporterTransferPda;
};

const getSupporterTransferPaymentPda = (
  programId: PublicKey,
  creatorPda: PublicKey,
  supporterPaymentsCount: BN,
) => {
  const [supporterTransferPaymentPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('supporterTransferPayment'),
      creatorPda.toBuffer(),
      supporterPaymentsCount.toArrayLike(Buffer, 'le', 8),
    ],
    programId,
  );

  return supporterTransferPaymentPda;
};

describe('crowdfunding', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;
  const accounts: Record<string, PublicKey> = {
    tokenProgram: TOKEN_PROGRAM,
  };
  // const alice = (provider.wallet as anchor.Wallet).payer;

  // Define accounts
  const [supporterWallet, creatorWallet] = makeKeypairs(2);

  // Save the accounts for later use
  // accounts.owner = alice.publicKey;

  const creatorObject = {
    username: 'johnsmith',
    fullname: 'John Smith',
    bio: 'future blockchain developer',
    imageUrl: '',
  };

  beforeAll(async () => {
    // Airdrop some SOL to the supporter for paying transaction fees and transfers
    await provider.connection.requestAirdrop(
      supporterWallet.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    await provider.connection.requestAirdrop(
      creatorWallet.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
  });

  test('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log('Your transaction signature', tx);
  });

  test('Register a new creator', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorUsernamePda = getCreatorUsernamePda(
      program.programId,
      creatorObject.username,
    );

    accounts.signer = creatorWallet.publicKey;
    accounts.creatorAccount = creatorPda;
    accounts.creatorUsernameAccount = creatorUsernamePda;

    await program.methods
      .registerCreator(
        creatorObject.username,
        creatorObject.fullname,
        creatorObject.bio,
      )
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    // check if the Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const zeroBN = new BN(0);
    const defaultDonationPrice = new BN(0.1 * LAMPORTS_PER_SOL);

    expect(creatorAccount.username).toBe(creatorObject.username);
    expect(creatorAccount.fullname).toBe(creatorObject.fullname);
    expect(creatorAccount.bio).toBe(creatorObject.bio);
    expect(creatorAccount.imageUrl).toBe('');
    expect(creatorAccount.isSupportersCountVisible).toBe(true);
    expect(creatorAccount.pricePerDonation.eq(defaultDonationPrice)).toBe(true);
    expect(creatorAccount.donationItem).toBe('coffee');
    expect(creatorAccount.thanksMessage).toBe('');
    expect(creatorAccount.supportersCount.eq(zeroBN)).toBe(true);
    expect(creatorAccount.supporterPaymentsCount.eq(zeroBN)).toBe(true);
    expect(creatorAccount.withdrawnFunds.eq(zeroBN)).toBe(true);
    expect(creatorAccount.owner.equals(creatorWallet.publicKey)).toBe(true);

    // check if the Creator Username account has the correct owner
    const usernameAccount =
      await program.account.creatorUsername.fetch(creatorUsernamePda);
    expect(usernameAccount.owner.equals(creatorWallet.publicKey)).toBe(true);
  });

  test('Update creator profile details', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );

    accounts.signer = creatorWallet.publicKey;
    accounts.creatorAccount = creatorPda;

    // update creator details
    creatorObject.fullname = 'Johnny';
    creatorObject.bio = 'new bio';
    creatorObject.imageUrl = 'https://example.com/image.jpg';

    await program.methods
      .updateCreatorProfile(
        creatorObject.fullname,
        creatorObject.bio,
        creatorObject.imageUrl,
      )
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(creatorPda);

    expect(creatorAccount.fullname).toBe(creatorObject.fullname);
    expect(creatorAccount.bio).toBe(creatorObject.bio);
    expect(creatorAccount.imageUrl).toBe(creatorObject.imageUrl);
  });

  test('Update creator page settings', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );

    accounts.signer = creatorWallet.publicKey;
    accounts.creatorAccount = creatorPda;

    const pageSettings = {
      isSupportersCountVisible: false,
      pricePerDonation: new BN(0.2 * LAMPORTS_PER_SOL),
      donationItem: 'pizza',
      thanksMessage: 'thanks',
    };
    await program.methods
      .updateCreatorPage(
        pageSettings.isSupportersCountVisible,
        pageSettings.pricePerDonation,
        pageSettings.donationItem,
        pageSettings.thanksMessage,
      )
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(creatorPda);

    expect(creatorAccount.isSupportersCountVisible).toBe(
      pageSettings.isSupportersCountVisible,
    );
    expect(
      creatorAccount.pricePerDonation.eq(pageSettings.pricePerDonation),
    ).toBe(true);
    expect(creatorAccount.donationItem).toBe(pageSettings.donationItem);
    expect(creatorAccount.thanksMessage).toBe(pageSettings.thanksMessage);
  });

  test('Create new supporter transfer', async () => {
    const supporterObject = {
      name: 'Alice',
      message: 'Hello, World!',
      quantity: 3,
    };

    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const creatorBalanceBefore = await connection.getBalance(creatorPda);
    const supportersCountBefore = creatorAccount.supportersCount.toNumber();

    // Derive the PDA for the Supporter Transfer account based on the current supporters count
    const supporterTransferPda = getSupporterTransferPda(
      program.programId,
      creatorPda,
      creatorAccount.supportersCount,
    );

    accounts.supporterTransferAccount = supporterTransferPda;
    accounts.signer = supporterWallet.publicKey;

    await program.methods
      .depositSupporterTransfer(
        supporterObject.name,
        supporterObject.message,
        supporterObject.quantity,
      )
      .accounts({
        creatorAccount: creatorPda,
        ...accounts,
      })
      .signers([supporterWallet])
      .rpc();

    // Fetch the Supporter Transfer account and verify its content
    const supporterTransferAccount =
      await program.account.supporterTransfer.fetch(supporterTransferPda);

    const expectedTransferAmount =
      creatorAccount.pricePerDonation.toNumber() * supporterObject.quantity;

    expect(
      supporterTransferAccount.supporter.equals(supporterWallet.publicKey),
    ).toBe(true);
    expect(supporterTransferAccount.creator.equals(creatorPda)).toBe(true);
    expect(supporterTransferAccount.name).toBe(supporterObject.name);
    expect(supporterTransferAccount.message).toBe(supporterObject.message);
    expect(supporterTransferAccount.quantity).toBe(supporterObject.quantity);
    expect(supporterTransferAccount.donationItem).toBe(
      creatorAccount.donationItem,
    );
    expect(supporterTransferAccount.transferAmount.toNumber()).toBe(
      expectedTransferAmount,
    );

    // Check if the Creator account data have been updated
    const updatedCeatorAccount =
      await program.account.creator.fetch(creatorPda);

    expect(updatedCeatorAccount.supportersCount.toNumber()).toBe(
      supportersCountBefore + 1,
    );

    // Check if creator balance has been updated
    const creatorBalanceAfter = await connection.getBalance(creatorPda);
    expect(creatorBalanceAfter).toBe(
      creatorBalanceBefore + expectedTransferAmount,
    );
  });

  test('Claim supporter transfers', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const creatorAccountBlanceBefore = await connection.getBalance(creatorPda);
    const creatorWithdrawFundsBefore = creatorAccount.withdrawnFunds.toNumber();
    const supportersPaymentsCountBefore =
      creatorAccount.supporterPaymentsCount.toNumber();

    const ownerBalanceBefore = await connection.getBalance(
      creatorAccount.owner,
    );

    // Derive the PDA for the Supporter Transfer Payment account based on the current supporters payment count
    const supporterTransferPaymentPda = getSupporterTransferPaymentPda(
      program.programId,
      creatorPda,
      creatorAccount.supporterPaymentsCount,
    );

    accounts.supporterTransferPaymentAccount = supporterTransferPaymentPda;
    accounts.signer = creatorWallet.publicKey;

    console.log(accounts);
    console.log(creatorAccount.owner);
    console.log(creatorWallet.publicKey);
    // Withdraw 10% of the creator account balance
    const withdrawAmount = new BN(creatorAccountBlanceBefore * 0.1);
    await program.methods
      .claimSupporterTransfer(withdrawAmount)
      .accounts({
        creatorAccount: creatorPda,
        ...accounts,
      })
      .signers([creatorWallet])
      .rpc();

    // Fetch the Supporter Transfer Payment account and verify its content
    const supporterTransferPaymentAccount =
      await program.account.supporterTransferPayment.fetch(
        supporterTransferPaymentPda,
      );
    expect(supporterTransferPaymentAccount.creator.equals(creatorPda)).toBe(
      true,
    );
    expect(supporterTransferPaymentAccount.amount.eq(withdrawAmount)).toBe(
      true,
    );

    // Check if the Creator account data have been updated
    const updatedCeatorAccount =
      await program.account.creator.fetch(creatorPda);

    expect(updatedCeatorAccount.supporterPaymentsCount.toNumber()).toBe(
      supportersPaymentsCountBefore + 1,
    );
    expect(updatedCeatorAccount.withdrawnFunds.toNumber()).toBe(
      creatorWithdrawFundsBefore + withdrawAmount.toNumber(),
    );

    // Check if Owner wallet balance have been increased
    // Not checking exact balance match becase the transaction fees are applied
    const ownerBalanceAfter = await connection.getBalance(creatorAccount.owner);
    expect(ownerBalanceAfter).toBeGreaterThan(ownerBalanceBefore);

    // Check if Creator account balance have been decreased with the withdraw amount
    const creatorAccountBalanceAfter = await connection.getBalance(creatorPda);
    expect(creatorAccountBalanceAfter).toBe(
      creatorAccountBlanceBefore - withdrawAmount.toNumber(),
    );
  });

  // test("Create new supporter transfer", async() => {
  //   // Create a new supporter transfer
  //   const supporterTransferObject = {
  //     name: "Alice",
  //     message: "Hello, World!",
  //     item_type: "coffee",
  //     quantity: 3,
  //     price: 0.1
  //   };

  //   const amountDonated = supporterTransferObject.quantity * supporterTransferObject.price * LAMPORTS_PER_SOL;

  //   // Get the balance of the creator before the supporter transfer
  //   const creatorBalanceBefore = await provider.connection.getBalance(creatorWallet.publicKey);
  //   console.log('creatorBalanceBefore', creatorBalanceBefore);

  //   const creatorPda = getCreatorPda(program.programId, creatorWallet.publicKey);
  //   const creatorAccount = await program.account.creator.fetch(creatorPda);
  //   const supportersCount = creatorAccount.supportersCount.toNumber();

  //   // Derive the PDA for the Supporter Transfer account based on the current supporters count
  //   const supporterTransferPda = getSupporterTransferPda(program.programId, creatorPda, creatorAccount.supportersCount);

  //   accounts.supporterTransfer = supporterTransferPda;
  //   accounts.supporter = supporterWallet.publicKey;

  //   await program.methods
  //     .supportCreator(
  //       supporterTransferObject.name,
  //       supporterTransferObject.message,
  //       supporterTransferObject.item_type,
  //       supporterTransferObject.quantity,
  //       supporterTransferObject.price
  //     )
  //     .accounts({ creator: creatorPda, receiver: creatorWallet.publicKey, ...accounts })
  //     .signers([supporterWallet])
  //     .rpc();

  //   // Fetch the Donation account and verify its content
  //   const supporterTransferAccount = await program.account.supporterTransfer.fetch(supporterTransferPda);
  //   console.log('supporterTransferAccount', supporterTransferAccount);

  //   expect(supporterTransferAccount.supporter.equals(supporterWallet.publicKey)).toBe(true);
  //   expect(supporterTransferAccount.creator.equals(creatorPda)).toBe(true);
  //   expect(supporterTransferAccount.name).toBe(supporterTransferObject.name);
  //   expect(supporterTransferAccount.message).toBe(supporterTransferObject.message);

  //   //  Check if the Creator's supporters count has been incremented
  //   const updatedCreatorAccount = await program.account.creator.fetch(creatorPda);
  //   expect(updatedCreatorAccount.supportersCount.toNumber()).toBe(supportersCount + 1);

  //   // Get the balance of the creator after the donation
  //   const creatorBalanceAfter = await provider.connection.getBalance(creatorWallet.publicKey);
  //   console.log('creatorBalanceAfter', creatorBalanceAfter);

  //   // Check if the SOL transfer was successful
  //   expect(creatorBalanceAfter).toBe(creatorBalanceBefore + amountDonated);
  // });

  // test("Create a new crowdfunding campaign", async () => {
  //   const campaignId = getRandomBigNumber();

  //   const campaign = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("campaign"),
  //       accounts.owner.toBuffer(),
  //       campaignId.toArrayLike(Buffer, "le", 8),
  //     ],
  //     program.programId
  //   )[0];

  //   accounts.campaign = campaign;

  //   const name = "My Test Campaign";
  //   const description = "This is a test campaign";
  //   const targetAmount = new BN(1_000);

  //   const transactionSignature = await program.methods
  //     .createCampaign(campaignId, name, description, targetAmount)
  //     .accounts({ ...accounts })
  //     .signers([alice])
  //     .rpc();

  //   await confirmTransaction(connection, transactionSignature);

  //   // check our Campaign account contains the correct data
  //   const campaignAccount = await program.account.campaign.fetch(campaign);
  //   console.log("Campaign account: ", campaignAccount);

  //   expect(campaignAccount.owner.equals(alice.publicKey)).toBe(true);
  //   expect(campaignAccount.id.eq(campaignId));
  //   expect(campaignAccount.name).toBe(name);
  //   expect(campaignAccount.description).toBe(description);
  //   expect(campaignAccount.targetAmount.eq(targetAmount));
  // });
});
