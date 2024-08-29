import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { Crowdfunding } from '../target/types/crowdfunding';
import { confirmTransaction, makeKeypairs } from '@solana-developers/helpers';
import { randomBytes } from 'crypto';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  type TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

const SUPPORTER_DONATION_FEE_PERCENTAGE = 1;

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

const getSupporterDonationPda = (
  programId: PublicKey,
  creatorPda: PublicKey,
  supportersCount: BN,
) => {
  const [supporterDonationPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('supporterDonation'),
      creatorPda.toBuffer(),
      supportersCount.toArrayLike(Buffer, 'le', 8),
    ],
    programId,
  );

  return supporterDonationPda;
};

const getCampaignPda = (
  programId: PublicKey,
  creatorPda: PublicKey,
  campaignsCount: BN,
) => {
  const [campaignPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('campaign'),
      creatorPda.toBuffer(),
      campaignsCount.toArrayLike(Buffer, 'le', 8),
    ],
    programId,
  );

  return campaignPda;
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
  const [feeCollectorWallet, supporterWallet, creatorWallet] = makeKeypairs(3);

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

    const transactionSignature = await program.methods
      .registerCreator(
        creatorObject.username,
        creatorObject.fullname,
        creatorObject.bio,
      )
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

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
    expect(creatorAccount.supporterDonationsAmount.eq(zeroBN)).toBe(true);
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

    const transactionSignature = await program.methods
      .updateCreatorProfile(
        creatorObject.fullname,
        creatorObject.bio,
        creatorObject.imageUrl,
      )
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

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
    const transactionSignature = await program.methods
      .updateCreatorPage(
        pageSettings.isSupportersCountVisible,
        pageSettings.pricePerDonation,
        pageSettings.donationItem,
        pageSettings.thanksMessage,
      )
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

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

  test('Create new supporter donation', async () => {
    const supporterObject = {
      name: 'Alice',
      message: 'Hello, World!',
      quantity: 3,
    };
    const creatorBalanceBefore = await connection.getBalance(
      creatorWallet.publicKey,
    );

    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const supportersCountBefore = creatorAccount.supportersCount.toNumber();

    // Derive the PDA for the Supporter Donation account based on the current supporters count
    const supporterDonationPda = getSupporterDonationPda(
      program.programId,
      creatorPda,
      creatorAccount.supportersCount,
    );

    accounts.signer = supporterWallet.publicKey;
    accounts.supporterDonationAccount = supporterDonationPda;

    const transactionSignature = await program.methods
      .sendSupporterDonation(
        supporterObject.name,
        supporterObject.message,
        supporterObject.quantity,
      )
      .accounts({
        creatorAccount: creatorPda,
        receiver: creatorWallet.publicKey,
        feeCollector: feeCollectorWallet.publicKey,
        ...accounts,
      })
      .signers([supporterWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // Fetch the Supporter Donation account and verify its content
    const supporterDonationAccount =
      await program.account.supporterDonation.fetch(supporterDonationPda);

    const amount =
      creatorAccount.pricePerDonation.toNumber() * supporterObject.quantity;
    const fees = (amount * SUPPORTER_DONATION_FEE_PERCENTAGE) / 100;
    const amountWithoutFees = amount - fees;

    expect(
      supporterDonationAccount.supporter.equals(supporterWallet.publicKey),
    ).toBe(true);
    expect(supporterDonationAccount.creator.equals(creatorPda)).toBe(true);
    expect(supporterDonationAccount.name).toBe(supporterObject.name);
    expect(supporterDonationAccount.message).toBe(supporterObject.message);
    expect(supporterDonationAccount.quantity).toBe(supporterObject.quantity);
    expect(supporterDonationAccount.item).toBe(creatorAccount.donationItem);
    expect(supporterDonationAccount.amount.toNumber()).toBe(amount);
    expect(supporterDonationAccount.fees.toNumber()).toBe(fees);

    // Check if the supporters count have been incremented
    const updatedCeatorAccount =
      await program.account.creator.fetch(creatorPda);

    expect(updatedCeatorAccount.supportersCount.toNumber()).toBe(
      supportersCountBefore + 1,
    );

    // Check if the Creator balance have been increased
    const creatorBalanceAfter = await connection.getBalance(
      creatorWallet.publicKey,
    );
    expect(creatorBalanceAfter).toBe(creatorBalanceBefore + amountWithoutFees);
  });

  test('Create a new crowdfunding campaign', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const campaignsCountBefore = creatorAccount.campaignsCount.toNumber();

    // Derive the PDA for the Campaign account based on the current campaigns count
    const campaignPda = getCampaignPda(
      program.programId,
      creatorPda,
      creatorAccount.campaignsCount,
    );

    accounts.signer = creatorWallet.publicKey;
    accounts.campaignAccount = campaignPda;

    const name = 'My Test Campaign';
    const description = 'This is a test campaign';
    const targetAmount = new BN(1_000_000_000); // 1 SOL
    const isTargetAmountVisible = true;

    const transactionSignature = await program.methods
      .createCampaign(name, description, targetAmount, isTargetAmountVisible)
      .accounts({
        creatorAccount: creatorPda,
        ...accounts,
      })
      .signers([creatorWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // check our Campaign account contains the correct data
    const campaignAccount = await program.account.campaign.fetch(campaignPda);
    const zeroBN = new BN(0);

    expect(campaignAccount.owner.equals(creatorWallet.publicKey)).toBe(true);
    expect(campaignAccount.name).toBe(name);
    expect(campaignAccount.description).toBe(description);
    expect(campaignAccount.targetAmount.eq(targetAmount)).toBe(true);
    expect(campaignAccount.amountDonated.eq(zeroBN)).toBe(true);
    expect(campaignAccount.amountWithdrawn.eq(zeroBN)).toBe(true);
    expect(campaignAccount.isTargetAmountVisible).toBe(true);

    // Check if the campaigns count have been incremented
    const updatedCeatorAccount =
      await program.account.creator.fetch(creatorPda);

    expect(updatedCeatorAccount.campaignsCount.toNumber()).toBe(
      campaignsCountBefore + 1,
    );
  });

  test('Donate funds to an existing campaign', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const campaignsCount = creatorAccount.campaignsCount.toNumber();
    const existingCampaignIndex = new BN(campaignsCount - 1);

    // Derive the PDA for the Campaign account based on the current campaigns count
    const campaignPda = getCampaignPda(
      program.programId,
      creatorPda,
      existingCampaignIndex,
    );
    const campaignAccount = await program.account.campaign.fetch(campaignPda);
    const amountDonatedBefore = campaignAccount.amountDonated;
    const campaignBalanceBefore = await connection.getBalance(campaignPda);

    console.log('campaignBalanceBefore', campaignBalanceBefore);

    accounts.signer = supporterWallet.publicKey;

    const donationAmount = new BN(500_000_000); // 0.5 SOL

    const transactionSignature = await program.methods
      .makeCampaignDonation(donationAmount)
      .accounts({
        campaignAccount: campaignPda,
        ...accounts,
      })
      .signers([supporterWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    const updatedCampaignAccount =
      await program.account.campaign.fetch(campaignPda);

    // Check if the campaign balance have been increased
    const campaignBalanceAfter = await connection.getBalance(campaignPda);
    console.log('campaignBalanceAfter', campaignBalanceAfter);

    expect(campaignBalanceAfter).toBe(
      campaignBalanceBefore + donationAmount.toNumber(),
    );

    // Check if the amount donated have been increased
    const expectedAmountDonated = amountDonatedBefore.add(donationAmount);
    expect(updatedCampaignAccount.amountDonated.eq(expectedAmountDonated)).toBe(
      true,
    );
  });

  test('Withdraw funds from existing campaign by a not authorized signer', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const campaignsCount = creatorAccount.campaignsCount.toNumber();
    const existingCampaignIndex = new BN(campaignsCount - 1);

    // Derive the PDA for the Campaign account based on the current campaigns count
    const campaignPda = getCampaignPda(
      program.programId,
      creatorPda,
      existingCampaignIndex,
    );

    // ONLY the creator wallet must be allowed to withdraw
    accounts.signer = supporterWallet.publicKey;

    const withdrawAmount = new BN(200_000_000); // 0.2 SOL

    try {
      const transactionSignature = await program.methods
        .withdrawCampaignFunds(withdrawAmount)
        .accounts({
          campaignAccount: campaignPda,
          ...accounts,
        })
        .signers([supporterWallet])
        .rpc();

      await confirmTransaction(connection, transactionSignature);

      throw new Error('Expected error was not thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(anchor.AnchorError);

      const anchorError = error as anchor.AnchorError;
      expect(anchorError.error.errorCode.code).toBe('InvalidSigner');
    }
  });

  test('Withdraw more funds than available from existing campaign', async () => {
    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const campaignsCount = creatorAccount.campaignsCount.toNumber();
    const existingCampaignIndex = new BN(campaignsCount - 1);

    // Derive the PDA for the Campaign account based on the current campaigns count
    const campaignPda = getCampaignPda(
      program.programId,
      creatorPda,
      existingCampaignIndex,
    );
    const campaignBalance = await connection.getBalance(campaignPda);

    console.log('campaignBalance', campaignBalance);

    accounts.signer = creatorWallet.publicKey;

    const withdrawAmount = new BN(campaignBalance + 200_000_000);

    try {
      const transactionSignature = await program.methods
        .withdrawCampaignFunds(withdrawAmount)
        .accounts({
          campaignAccount: campaignPda,
          ...accounts,
        })
        .signers([creatorWallet])
        .rpc();

      await confirmTransaction(connection, transactionSignature);

      throw new Error('Expected error was not thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(anchor.AnchorError);

      const anchorError = error as anchor.AnchorError;
      expect(anchorError.error.errorCode.code).toBe(
        'InsufficientFundsAfterWithdraw',
      );
    }
  });

  test('Withdraw funds from existing campaign', async () => {
    const creatorBalanceBefore = await connection.getBalance(
      creatorWallet.publicKey,
    );

    const creatorPda = getCreatorPda(
      program.programId,
      creatorWallet.publicKey,
    );
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const campaignsCount = creatorAccount.campaignsCount.toNumber();
    const existingCampaignIndex = new BN(campaignsCount - 1);

    // Derive the PDA for the Campaign account based on the current campaigns count
    const campaignPda = getCampaignPda(
      program.programId,
      creatorPda,
      existingCampaignIndex,
    );
    const campaignBalanceBefore = await connection.getBalance(campaignPda);

    accounts.signer = creatorWallet.publicKey;

    const withdrawAmount = new BN(200_000_000); // 0.2 SOL

    const transactionSignature = await program.methods
      .withdrawCampaignFunds(withdrawAmount)
      .accounts({
        campaignAccount: campaignPda,
        ...accounts,
      })
      .signers([creatorWallet])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // Check if the Creator balance have been increased
    const creatorBalanceAfter = await connection.getBalance(
      creatorWallet.publicKey,
    );
    // Not checking exact balance match becase the transaction fees are applied
    expect(creatorBalanceAfter).toBeGreaterThan(creatorBalanceBefore);

    // Check the remaining campaign balance
    const campaignBalanceAfter = await connection.getBalance(campaignPda);
    expect(campaignBalanceAfter).toBe(
      campaignBalanceBefore - withdrawAmount.toNumber(),
    );

    // Check if the amount withdrawn have been increased
    const campaignAccount = await program.account.campaign.fetch(campaignPda);
    expect(campaignAccount.amountWithdrawn.eq(withdrawAmount)).toBe(true);
  });
});
