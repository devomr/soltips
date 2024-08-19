import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Crowdfunding } from '../target/types/crowdfunding';
import { makeKeypairs } from "@solana-developers/helpers";
import { randomBytes } from "crypto";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  type TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

const getRandomBigNumber = (size = 8) => {
  return new BN(randomBytes(size));
};

const getCreatorPda = (programId: PublicKey, address: PublicKey) => {
  const [creatorPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("creator"),
      address.toBuffer()
    ],
    programId
  );
  return creatorPda
}

const getCreatorUsernamePda = (programId: PublicKey, username: string) => {
  const [creatorPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("username"),
      Buffer.from(username)
    ],
    programId
  );
  return creatorPda
}

const getSupporterTransferPda = (programId: PublicKey, creatorPda: PublicKey, supportersCount: BN) => {
  const [supporterTransferPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("supporterTransfer"),
      creatorPda.toBuffer(),
      supportersCount.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );

  return supporterTransferPda
}

describe('crowdfunding', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;
  const accounts: Record<string, PublicKey> = {
    tokenProgram: TOKEN_PROGRAM,
  };
  const alice = (provider.wallet as anchor.Wallet).payer;

  // Define accounts
  const [supporterWallet, creatorWallet] = makeKeypairs(2);

  // Save the accounts for later use
  accounts.owner = alice.publicKey;

  const creatorObject = {
    username: "johnsmith",
    fullname: "John Smith",
    bio: "future blockchain developer",
  };

  beforeAll(async () => {
    // Airdrop some SOL to the supporter for paying transaction fees and transfers
    await provider.connection.requestAirdrop(supporterWallet.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(creatorWallet.publicKey, 2 * LAMPORTS_PER_SOL);
  });


  test("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  test("Register a new creator", async() => {
    const creatorPda = getCreatorPda(program.programId, creatorWallet.publicKey);
    const creatorUsernamePda = getCreatorUsernamePda(program.programId, creatorObject.username);

    accounts.creator = creatorPda;
    accounts.owner = creatorWallet.publicKey;
    accounts.creatorUsername = creatorUsernamePda;

    await program.methods
      .registerCreator(creatorObject.username, creatorObject.fullname, creatorObject.bio)
      .accounts({ ...accounts })
      .signers([creatorWallet])
      .rpc();

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(creatorPda);

    expect(creatorAccount.owner.equals(creatorWallet.publicKey)).toBe(true);
    expect(creatorAccount.username).toBe(creatorObject.username);
    expect(creatorAccount.fullname).toBe(creatorObject.fullname);
    expect(creatorAccount.bio).toBe(creatorObject.bio);
  });

  test("Check username is in use", async() => {
    // check if the username is in use
    const creatorUsernamePda = getCreatorUsernamePda(program.programId, creatorObject.username);

    const usernameAccount = await program.account.creatorUsername.fetchNullable(creatorUsernamePda);
    expect(usernameAccount).not.toBeNull();
  }); 

  test("Create new supporter transfer", async() => {
    // Create a new supporter transfer
    const supporterTransferObject = {
      name: "Alice",
      message: "Hello, World!",
      item_type: "coffee",
      quantity: 3,
      price: 0.1
    };

    const amountDonated = supporterTransferObject.quantity * supporterTransferObject.price * LAMPORTS_PER_SOL;

    // Get the balance of the creator before the supporter transfer
    const creatorBalanceBefore = await provider.connection.getBalance(creatorWallet.publicKey);
    console.log('creatorBalanceBefore', creatorBalanceBefore);

    const creatorPda = getCreatorPda(program.programId, creatorWallet.publicKey);
    const creatorAccount = await program.account.creator.fetch(creatorPda);
    const supportersCount = creatorAccount.supportersCount.toNumber();

    // Derive the PDA for the Supporter Transfer account based on the current supporters count
    const supporterTransferPda = getSupporterTransferPda(program.programId, creatorPda, creatorAccount.supportersCount);

    accounts.supporterTransfer = supporterTransferPda;
    accounts.supporter = supporterWallet.publicKey;
    
    await program.methods
      .supportCreator(
        supporterTransferObject.name,
        supporterTransferObject.message,
        supporterTransferObject.item_type,
        supporterTransferObject.quantity,
        supporterTransferObject.price
      )
      .accounts({ creator: creatorPda, receiver: creatorWallet.publicKey, ...accounts })
      .signers([supporterWallet])
      .rpc();

    // Fetch the Donation account and verify its content
    const supporterTransferAccount = await program.account.supporterTransfer.fetch(supporterTransferPda);
    console.log('supporterTransferAccount', supporterTransferAccount);

    expect(supporterTransferAccount.supporter.equals(supporterWallet.publicKey)).toBe(true);
    expect(supporterTransferAccount.creator.equals(creatorPda)).toBe(true);
    expect(supporterTransferAccount.name).toBe(supporterTransferObject.name);
    expect(supporterTransferAccount.message).toBe(supporterTransferObject.message);

    //  Check if the Creator's supporters count has been incremented
    const updatedCreatorAccount = await program.account.creator.fetch(creatorPda);
    expect(updatedCreatorAccount.supportersCount.toNumber()).toBe(supportersCount + 1);

    // Get the balance of the creator after the donation
    const creatorBalanceAfter = await provider.connection.getBalance(creatorWallet.publicKey);
    console.log('creatorBalanceAfter', creatorBalanceAfter);
    
    // Check if the SOL transfer was successful
    expect(creatorBalanceAfter).toBe(creatorBalanceBefore + amountDonated);
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
