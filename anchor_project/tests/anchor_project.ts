import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProject } from "../target/types/anchor_project";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import crypto from "crypto";

describe("tipping_program", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();
  const conn = provider.connection;
  anchor.setProvider(provider);
  const program = anchor.workspace.anchorProject as Program<AnchorProject>;
  const creator = anchor.web3.Keypair.generate();
  const alice = anchor.web3.Keypair.generate();
  const charlie = anchor.web3.Keypair.generate();

  before(async () => {
    let sig = await provider.connection.requestAirdrop(
      creator.publicKey,
      1000000000
    );
    await provider.connection.requestAirdrop(alice.publicKey, 1000000000);
    await conn.confirmTransaction(sig);
    const creatorBal = await conn.getBalance(creator.publicKey);
    console.log("Creators Pub: ", creator.publicKey.toBase58(), creatorBal);
  });

  describe("Initialize Vault", async () => {
    it("Is initialized!", async () => {
      const vaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      )[0];
      const tx = await program.methods
        .initVault()
        .accounts({
          creator: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      const vaultAccount = await program.account.vault.fetch(vaultPda);
      console.log("Vault Account", vaultAccount.creator.toBase58());
      console.log("Vault Pda ", vaultPda.toBase58());
      assert.equal(
        vaultAccount.creator.toBase58(),
        creator.publicKey.toBase58()
      );
      assert.equal(vaultAccount.totalTips.toNumber(), 0);
      console.log("Your transaction signature", tx);
    });
  });
});
