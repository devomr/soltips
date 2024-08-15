import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
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

  test("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  test("Register new creator", async() => {
    const creator = PublicKey.findProgramAddressSync(
      [
        Buffer.from("creator"),
        accounts.owner.toBuffer(),
      ],
      program.programId
    )[0];

    accounts.creator = creator;

    const username = "johnsmith";
    const fullname = "John Smith";
    const bio = "future blockchain developer";

    const transactionSignature = await program.methods
      .registerCreator(username, fullname, bio)
      .accounts({ ...accounts })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(creator);
    console.log("Creator account: ", creatorAccount);
    
    expect(creatorAccount.owner.equals(alice.publicKey)).toBe(true);
    expect(creatorAccount.username).toBe(username);
    expect(creatorAccount.fullname).toBe(fullname);
    expect(creatorAccount.bio).toBe(bio);
  });

  test("Update creator details", async() => {
    const creator = PublicKey.findProgramAddressSync(
      [
        Buffer.from("creator"),
        accounts.owner.toBuffer(),
      ],
      program.programId
    )[0];

    accounts.creator = creator;

    const newFullname = "Will Smith";
    const newBio = "senior blockchain developer";

    const transactionSignature = await program.methods
      .updateCreator(newFullname, newBio)
      .accounts({ ...accounts })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    // check our Creator account contains the correct data
    const creatorAccount = await program.account.creator.fetch(creator);
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
