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

    await program.methods
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
