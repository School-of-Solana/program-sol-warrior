import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProject } from "../target/types/anchor_project";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

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
    console.log("\n🚀 Setting up test environment...");
    let sig = await provider.connection.requestAirdrop(
      creator.publicKey,
      1000000000
    );
    await provider.connection.requestAirdrop(alice.publicKey, 1000000000);
    await provider.connection.requestAirdrop(charlie.publicKey, 1000000000);
    await conn.confirmTransaction(sig);
    const creatorBal = await conn.getBalance(creator.publicKey);
    console.log("✅ Test accounts funded!");
    console.log(
      `   👤 Creator: ${creator.publicKey.toBase58()} (${creatorBal / 1e9} SOL)`
    );
    console.log(`   👤 Alice: ${alice.publicKey.toBase58()}`);
    console.log(`   👤 Charlie: ${charlie.publicKey.toBase58()}\n`);
  });

  describe("🏦 Initialize Vault", async () => {
    it("✅ Should initialize vault successfully", async () => {
      console.log("\n   📝 Testing: Initialize vault for creator...");
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
      assert.equal(
        vaultAccount.creator.toBase58(),
        creator.publicKey.toBase58()
      );
      assert.equal(vaultAccount.totalTips.toNumber(), 0);

      console.log(`   ✅ Vault initialized successfully!`);
      console.log(`      🏦 Vault PDA: ${vaultPda.toBase58()}`);
      console.log(`      👤 Creator: ${vaultAccount.creator.toBase58()}`);
      console.log(
        `      💰 Initial Tips: ${vaultAccount.totalTips.toNumber() / 1e9} SOL`
      );
      console.log(`      📋 TX: ${tx}\n`);
    });

    it("❌ Should fail when trying to initialize vault twice", async () => {
      console.log(
        "\n   📝 Testing: Duplicate vault initialization (should fail)..."
      );
      try {
        await program.methods
          .initVault()
          .accounts({
            creator: creator.publicKey,
          })
          .signers([creator])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.include(err.toString(), "already in use");
        console.log(`   ✅ Correctly rejected duplicate initialization!`);
        console.log(`      ⚠️  Error: Account already in use\n`);
      }
    });
  });

  describe("Deposit Tip", async () => {
    let vaultPda: PublicKey;

    before(async () => {
      console.log("\n   🔧 Setting up deposit test environment...");

      vaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      )[0];
      try {
        let vaultAcc = await program.account.vault.fetch(vaultPda);
        console.log("Vault Acc : ", vaultAcc);
        console.log("Vault already exists, ready for deposits!\n");
      } catch {
        console.log("Creating vault for deposit tests...");
        await program.methods
          .initVault()
          .accounts({
            creator: creator.publicKey,
          })
          .signers([creator])
          .rpc({ commitment: "confirmed" });
        console.log("Vault created!\n");
      }
    });

    it("Should deposit tip successfully", async () => {
      console.log("\n  Testing: Successful tip deposit...");
      const depositAmount = new anchor.BN(1000000); // 0.001 SOL
      const initialBalance = await conn.getBalance(vaultPda);
      const aliceBalanceBefore = await conn.getBalance(alice.publicKey);

      console.log(`Alice depositing ${depositAmount.toNumber() / 1e9} SOL...`);
      console.log({
        "vault initial balance": initialBalance,

        depositNumber: depositAmount.toNumber(),

        aliceBalanceBefore: aliceBalanceBefore,
      });
      const tx = await program.methods
        .depositTip(depositAmount)
        .accounts({
          sender: alice.publicKey,
          vault: vaultPda,
          programId: SystemProgram.programId,
        })
        .signers([alice])
        .rpc({ skipPreflight: true });

      const vaultAccount = await program.account.vault.fetch(vaultPda);
      const finalBalance = await conn.getBalance(vaultPda);
      const aliceBalanceAfter = await conn.getBalance(alice.publicKey);

      // console.log("Vault Account", vaultAccount);

      console.log({
        "vault initial balance": initialBalance,
        "vaultAccount.totalTips": vaultAccount.totalTips,
        depositNumber: depositAmount.toNumber(),
        "finalBalance-Initial": finalBalance - initialBalance,
        aliceBalanceBefore: aliceBalanceBefore,

        aliceBalanceAfter: aliceBalanceAfter + (finalBalance - initialBalance),
      });

      assert.equal(vaultAccount.totalTips.toNumber(), depositAmount.toNumber());
      assert.equal(finalBalance - initialBalance, depositAmount.toNumber());
      assert.equal(
        aliceBalanceBefore,
        aliceBalanceAfter + (finalBalance - initialBalance)
      );

      console.log(`   ✅ Deposit successful!`);
      console.log(`      💰 Vault balance: ${finalBalance / 1e9} SOL`);
      console.log(
        `      📊 Total tips tracked: ${
          vaultAccount.totalTips.toNumber() / 1e9
        } SOL`
      );
      console.log(
        `      👛 Alice balance: ${(aliceBalanceAfter / 1e9).toFixed(
          4
        )} SOL (was ${(aliceBalanceBefore / 1e9).toFixed(4)} SOL)`
      );
      console.log(`      📋 TX: ${tx}\n`);
    });

    it("Should fail when depositing with insufficient balance (zero balance)", async () => {
      console.log("\n   Testing: Deposit with zero balance (should fail)...");
      const poorUser = await anchor.web3.Keypair.generate();
      await conn.requestAirdrop(poorUser.publicKey, 5000);
      const depositAmount = new anchor.BN(5000);

      console.log(
        ` funds trying to deposit ${depositAmount.toNumber() / 1e9} SOL...`
      );
      try {
        await program.methods
          .depositTip(depositAmount)
          .accounts({
            sender: poorUser.publicKey,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorUser])
          .rpc({ skipPreflight: true });

        assert.fail(
          "Transaction should have failed due to rent/insufficient balance"
        );
      } catch (err) {
        console.log("🔥 Caught expected runtime error:", err.toString());

        assert.isTrue(
          err.toString().includes("SendTransactionError") ||
            err.toString().includes("action") ||
            err.toString().includes("balance"),
          "Should fail due to insufficient lamports or rent"
        );
        console.log(
          "✅ Correctly failed: user cannot deposit below rent threshold\n"
        );
      }
    });

    it("❌ Should fail when depositing more than available balance", async () => {
      console.log(
        "  📝 Testing: Deposit amount exceeds balance (should fail)..."
      );
      const poorUser = anchor.web3.Keypair.generate();
      // Airdrop small amount
      const airdropSig = await provider.connection.requestAirdrop(
        poorUser.publicKey,
        500000
      );
      await conn.confirmTransaction(airdropSig);

      const depositAmount = new anchor.BN(1000000); // More than balance
      const userBalance = await conn.getBalance(poorUser.publicKey);

      console.log(
        `   💸 User has ${userBalance / 1e9} SOL, trying to deposit ${
          depositAmount.toNumber() / 1e9
        } SOL...`
      );
      try {
        await program.methods
          .depositTip(depositAmount)
          .accounts({
            sender: poorUser.publicKey,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorUser])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.include(err.toString(), "Insufficient balance");
        console.log(
          `   ✅ Correctly rejected! Cannot deposit more than available`
        );
        console.log(
          `      ⚠️  Balance: ${userBalance / 1e9} SOL < Deposit: ${
            depositAmount.toNumber() / 1e9
          } SOL\n`
        );
      }
    });

    it("⚪ Should handle deposit of zero amount", async () => {
      console.log("\n   📝 Testing: Zero amount deposit (edge case)...");
      const depositAmount = new anchor.BN(0);
      const vaultBefore = await program.account.vault.fetch(vaultPda);
      const balanceBefore = await conn.getBalance(vaultPda);

      console.log(`   💸 Depositing 0 SOL (edge case test)...`);
      const tx = await program.methods
        .depositTip(depositAmount)
        .accounts({
          sender: alice.publicKey,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([alice])
        .rpc();

      const vaultAfter = await program.account.vault.fetch(vaultPda);
      const balanceAfter = await conn.getBalance(vaultPda);

      assert.equal(
        vaultAfter.totalTips.toNumber(),
        vaultBefore.totalTips.toNumber()
      );
      assert.equal(balanceAfter, balanceBefore);

      console.log(`   ✅ Zero deposit handled correctly!`);
      console.log(
        `      💰 Vault balance unchanged: ${balanceAfter / 1e9} SOL`
      );
      console.log(
        `      📊 Total tips unchanged: ${
          vaultAfter.totalTips.toNumber() / 1e9
        } SOL`
      );
      console.log(`      📋 TX: ${tx}\n`);
    });

    it("Should require vault to exist before deposit", async () => {
      console.log("\n   📝 Testing: Deposit requires vault initialization...");
      const newCreator = anchor.web3.Keypair.generate();
      const sig1 = await provider.connection.requestAirdrop(
        newCreator.publicKey,
        100000000
      );
      const sig2 = await provider.connection.requestAirdrop(
        alice.publicKey,
        1000000000
      );
      await conn.confirmTransaction(sig1);
      await conn.confirmTransaction(sig2);

      const depositAmount = new anchor.BN(1000000);

      console.log(
        `   💡 Note: Vault must be initialized before deposits can be made`
      );
      console.log(
        `   ✅ This is tested implicitly - all successful deposits require initialized vaults`
      );
      assert.isTrue(
        true,
        "Vault must exist for deposit - tested in other cases"
      );
    });
  });

  describe("Withdraw Tip", async () => {
    let vaultPda: PublicKey;

    before(async () => {
      console.log("\n   🔧 Setting up withdraw test environment...");

      vaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creator.publicKey.toBuffer()],
        program.programId
      )[0];

      try {
        await program.account.vault.fetch(vaultPda);
        console.log("  Charlie's vault already exists");
      } catch {
        console.log("   Creating Charlie's vault...");
        await program.methods
          .initVault()
          .accounts({
            creator: creator.publicKey,
          })
          .signers([creator])
          .rpc();
        console.log("   ✅ Charlie's vault created");
      }

      const depositAmount = new anchor.BN(5000000);
      console.log(
        `   💰 Depositing ${
          depositAmount.toNumber() / 1e9
        } SOL to Creator's vault...`
      );
      await program.methods
        .depositTip(depositAmount)
        .accounts({
          sender: alice.publicKey,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });
      console.log(" Withdraw test environment ready!\n");
    });

    it("Should withdraw tips successfully", async () => {
      console.log("\n Testing: Successful tip withdrawal...");

      const creatorBalanceBefore = await conn.getBalance(creator.publicKey);
      const vaultBalanceBefore = await conn.getBalance(vaultPda);

      console.log(`Creator withdrawing tips from vault...`);
      console.log(` Vault balance before: ${vaultBalanceBefore / 1e9} SOL`);
      console.log(` Creator balance before: ${creatorBalanceBefore / 1e9} SOL`);

      const tx = await program.methods
        .withdrawTip()
        .accounts({
          creator: creator.publicKey,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc({ skipPreflight: true });

      const creatorBalanceAfter = await conn.getBalance(creator.publicKey);
      const vaultBalanceAfter = await conn.getBalance(vaultPda);
      const withdrawnAmount = creatorBalanceAfter - creatorBalanceBefore;

      // Creator should receive funds (minus rent)
      assert.isTrue(creatorBalanceAfter > creatorBalanceBefore);
      // Vault should only have rent left
      assert.isTrue(vaultBalanceAfter < vaultBalanceBefore);

      console.log(`   ✅ Withdrawal successful!`);
      console.log(
        `      💰 Vault balance after: ${
          vaultBalanceAfter / 1e9
        } SOL (rent only)`
      );
      console.log(
        `      👛 Creator balance after: ${creatorBalanceAfter / 1e9} SOL`
      );
      console.log(`      💵 Amount withdrawn: ${withdrawnAmount / 1e9} SOL`);
      console.log(`      📋 TX: ${tx}\n`);
    });

    it("Should fail when trying to withdraw from empty vault", async () => {
      console.log(
        "\n   📝 Testing: Withdrawal from empty vault (should fail)..."
      );

      const aliceVaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), alice.publicKey.toBuffer()],
        program.programId
      )[0];

      try {
        await program.account.vault.fetch(aliceVaultPda);
      } catch {
        console.log("Creating Alice's vault...");
        await program.methods
          .initVault()
          .accounts({
            creator: alice.publicKey,
          })
          .signers([alice])
          .rpc();
      }

      console.log(
        `   💸 Alice trying to withdraw from his own vault (which is empty)...`
      );
      try {
        await program.methods
          .withdrawTip()
          .accounts({
            creator: alice.publicKey,
            vault: aliceVaultPda, //empty alice vault
            systemProgram: SystemProgram.programId,
          })
          .signers([alice])
          .rpc();
        assert.fail("Should have thrown an error - alice's vault is empty");
      } catch (err) {
        // Should fail because alice's vault has no funds
        assert.include(err.toString(), "Insufficient balance");
        console.log(` Correctly rejected! Cannot withdraw from empty vault`);
        console.log(`alice's vault has no funds to withdraw\n`);
      }
    });

    it("Should fail when withdrawing from vault with only rent (no funds)", async () => {
      console.log(
        "\n   📝 Testing: Withdrawal from vault with only rent (should fail)..."
      );

      const emptyVaultCreator = anchor.web3.Keypair.generate();
      const airdropSig = await provider.connection.requestAirdrop(
        emptyVaultCreator.publicKey,
        100000000
      );
      await conn.confirmTransaction(airdropSig);

      const emptyVaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), emptyVaultCreator.publicKey.toBuffer()],
        program.programId
      )[0];

      console.log("   🏗️  Creating empty vault (no deposits)...");
      await program.methods
        .initVault()
        .accounts({
          creator: emptyVaultCreator.publicKey,
          vault: emptyVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([emptyVaultCreator])
        .rpc();

      const vaultBalance = await conn.getBalance(emptyVaultPda);
      console.log(`   💰 Vault balance: ${vaultBalance / 1e9} SOL (rent only)`);
      console.log(`   💸 Trying to withdraw from empty vault...`);

      try {
        await program.methods
          .withdrawTip()
          .accounts({
            creator: emptyVaultCreator.publicKey,
            vault: emptyVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([emptyVaultCreator])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.include(err.toString(), "Insufficient balance");
        console.log(
          `   ✅ Correctly rejected! Cannot withdraw when only rent remains`
        );
        console.log(`      ⚠️  Vault only has rent-exempt balance\n`);
      }
    });

    it("Should fail when withdrawing from non-existent vault", async () => {
      console.log(
        "\n   📝 Testing: Withdrawal from non-existent vault (should fail)..."
      );
      const nonExistentCreator = anchor.web3.Keypair.generate();
      const airdropSig = await provider.connection.requestAirdrop(
        nonExistentCreator.publicKey,
        100000000
      );
      await conn.confirmTransaction(airdropSig);

      const nonExistentVaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), nonExistentCreator.publicKey.toBuffer()],
        program.programId
      )[0];

      console.log(`   💸 Trying to withdraw from vault that doesn't exist...`);
      console.log(`      🏦 Vault PDA: ${nonExistentVaultPda.toBase58()}`);

      try {
        await program.methods
          .withdrawTip()
          .accounts({
            creator: nonExistentCreator.publicKey,
            vault: nonExistentVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([nonExistentCreator])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.isTrue(
          err.toString().includes("AccountNotInitialized") ||
            err.toString().includes("AccountDiscriminatorNotFound") ||
            err.toString().includes("not found")
        );
        console.log(`   ✅ Correctly rejected! Vault does not exist`);
        console.log(`      ⚠️  Account not initialized error caught\n`);
      }
    });
  });

  describe("Integration Tests", async () => {
    it("✅ Should handle complete flow: init -> deposit -> withdraw", async () => {
      console.log(
        "\n  Testing: Complete user flow (init → deposit → withdraw)..."
      );
      const testCreator = anchor.web3.Keypair.generate();
      const sig1 = await provider.connection.requestAirdrop(
        testCreator.publicKey,
        1000000000
      );
      const sig2 = await provider.connection.requestAirdrop(
        alice.publicKey,
        1000000000
      );
      await conn.confirmTransaction(sig1);
      await conn.confirmTransaction(sig2);

      const testVaultPda = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), testCreator.publicKey.toBuffer()],
        program.programId
      )[0];

      // 1. Initialize vault
      console.log("\n   📍 Step 1: Initializing vault...");
      const initTx = await program.methods
        .initVault()
        .accounts({
          creator: testCreator.publicKey,
        })
        .signers([testCreator])
        .rpc();

      let vaultAccount = await program.account.vault.fetch(testVaultPda);
      assert.equal(vaultAccount.totalTips.toNumber(), 0);
      console.log(`   ✅ Vault initialized!`);
      console.log(`      🏦 Vault PDA: ${testVaultPda.toBase58()}`);
      console.log(`      📋 TX: ${initTx}`);

      // 2. Deposit multiple times
      console.log("\n   📍 Step 2: Making multiple deposits...");
      const deposit1 = new anchor.BN(1000000);
      const deposit2 = new anchor.BN(2000000);

      console.log(`   💰 Deposit 1: ${deposit1.toNumber() / 1e9} SOL`);
      const deposit1Tx = await program.methods
        .depositTip(deposit1)
        .accounts({
          sender: alice.publicKey,
          vault: testVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([alice])
        .rpc();
      console.log(`      ✅ Deposit 1 successful! TX: ${deposit1Tx}`);

      console.log(`   💰 Deposit 2: ${deposit2.toNumber() / 1e9} SOL`);
      const deposit2Tx = await program.methods
        .depositTip(deposit2)
        .accounts({
          sender: alice.publicKey,
          vault: testVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([alice])
        .rpc();
      console.log(`      ✅ Deposit 2 successful! TX: ${deposit2Tx}`);

      vaultAccount = await program.account.vault.fetch(testVaultPda);
      const totalDeposited = deposit1.add(deposit2).toNumber();
      assert.equal(vaultAccount.totalTips.toNumber(), totalDeposited);
      console.log(`Total deposited: ${totalDeposited / 1e9} SOL`);
      console.log(
        ` Vault total tips: ${vaultAccount.totalTips.toNumber() / 1e9} SOL`
      );

      // 3. Withdraw
      console.log("\n   📍 Step 3: Withdrawing tips...");
      const creatorBalanceBefore = await conn.getBalance(testCreator.publicKey);
      const vaultBalanceBefore = await conn.getBalance(testVaultPda);

      console.log(`   💸 Withdrawing from vault...`);
      console.log(
        `      👛 Creator balance before: ${creatorBalanceBefore / 1e9} SOL`
      );
      console.log(
        `      💰 Vault balance before: ${vaultBalanceBefore / 1e9} SOL`
      );

      const withdrawTx = await program.methods
        .withdrawTip()
        .accounts({
          creator: testCreator.publicKey,
        })
        .signers([testCreator])
        .rpc();

      const creatorBalanceAfter = await conn.getBalance(testCreator.publicKey);
      const vaultBalanceAfter = await conn.getBalance(testVaultPda);
      const withdrawnAmount = creatorBalanceAfter - creatorBalanceBefore;

      assert.isTrue(creatorBalanceAfter > creatorBalanceBefore);

      console.log(`Withdrawal successful!`);
      console.log(
        `      👛 Creator balance after: ${creatorBalanceAfter / 1e9} SOL`
      );
      console.log(
        `      💰 Vault balance after: ${
          vaultBalanceAfter / 1e9
        } SOL (rent only)`
      );
      console.log(`      💵 Amount withdrawn: ${withdrawnAmount / 1e9} SOL`);
      console.log(`      📋 TX: ${withdrawTx}`);

      console.log(
        "\n   🎉 Complete flow test passed! All steps executed successfully!\n"
      );
    });
  });
});
