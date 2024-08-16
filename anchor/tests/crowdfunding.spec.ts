import * as anchor from "@coral-xyz/anchor";
import { AnchorError, BN, Program } from "@coral-xyz/anchor";
import { Crowdfunding } from '../target/types/crowdfunding';
import { confirmTransaction, makeKeypairs } from "@solana-developers/helpers";
import { randomBytes } from "crypto";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  type TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

const getRandomBigNumber = (size = 8) => {
  return new BN(randomBytes(size));
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
  const alice = (provider.wallet as anchor.Wallet).payer;

  // Save the accounts for later use
  accounts.owner = alice.publicKey;

  const creatorObject = {
    username: "johnsmith",
    fullname: "John Smith",
    bio: "future blockchain developer",
  };


  test("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  test("Register a new creator", async() => {
    const creatorPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("creator"),
        Buffer.from(creatorObject.username),
      ],
      program.programId
    )[0];

    accounts.creator = creatorPda;

    console.log('accounts', accounts);

    const transactionSignature = await program.methods
      .registerCreator(creatorObject.username, creatorObject.fullname, creatorObject.bio)
      .accounts({ ...accounts })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(accounts.creator);
    console.log("Creator account: ", creatorAccount);
    
    expect(creatorAccount.owner.equals(alice.publicKey)).toBe(true);
    expect(creatorAccount.username).toBe(creatorObject.username);
    expect(creatorAccount.fullname).toBe(creatorObject.fullname);
    expect(creatorAccount.bio).toBe(creatorObject.bio);
  });


  test("Update creator details", async() => {
    const creatorPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("creator"),
        Buffer.from(creatorObject.username),
      ],
      program.programId
    )[0];

    accounts.creator = creatorPda;

    const newFullname = "Will Smith";
    const newBio = "senior blockchain developer";

    const transactionSignature = await program.methods
      .updateCreator(creatorObject.username, newFullname, newBio)
      .accounts({ ...accounts })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(accounts.creator);
    console.log("Creator account after update: ", creatorAccount);
    
    expect(creatorAccount.owner.equals(alice.publicKey)).toBe(true);
    expect(creatorAccount.fullname).toBe(newFullname);
    expect(creatorAccount.bio).toBe(newBio);
  });

  test("Create a new crowdfunding campaign", async () => {
    const campaignId = getRandomBigNumber();

    const campaign = PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        accounts.owner.toBuffer(),
        campaignId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    accounts.campaign = campaign;

    const name = "My Test Campaign";
    const description = "This is a test campaign";
    const targetAmount = new BN(1_000);

    const transactionSignature = await program.methods
      .createCampaign(campaignId, name, description, targetAmount)
      .accounts({ ...accounts })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // check our Campaign account contains the correct data
    const campaignAccount = await program.account.campaign.fetch(campaign);
    console.log("Campaign account: ", campaignAccount);
    
    expect(campaignAccount.owner.equals(alice.publicKey)).toBe(true);
    expect(campaignAccount.id.eq(campaignId));
    expect(campaignAccount.name).toBe(name);
    expect(campaignAccount.description).toBe(description);
    expect(campaignAccount.targetAmount.eq(targetAmount));
  });
});
