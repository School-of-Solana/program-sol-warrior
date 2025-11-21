"use client";
import { Button } from "@/src/components/ui/button";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  getCreatorAccount,
  getCreatorVaultAccount,
  initializeVault,
} from "@/src/lib/anchor/services";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { getConnection } from "@/src/lib/solana/connection";

const dmsans = DM_Sans({
  subsets: ["latin"],
});
const page = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isbal, setBal] = useState(false);
  const [vaultAcc, setVaultAcc] = useState<
    { creatorVault: string; totaltips: number; creatorAdd: string } | undefined
  >({
    creatorVault: "",
    totaltips: 0,
    creatorAdd: "",
  });
  const wallet = useAnchorWallet();
  const connection = getConnection();

  const handleActivateWallet = async () => {
    try {
      setIsLoading(true);

      if (!wallet?.publicKey) {
        console.log("Please connect your wallet.");
        return;
      }
      //check: creator vault exist
      const result = await getCreatorVaultAccount(wallet, connection);

      // 2. Create if missing
      if (!result?.exists) {
        await initializeVault(wallet, connection);
      }

      // 3. Always fetch final vault
      const final = await getCreatorVaultAccount(wallet, connection);

      setVaultAcc({
        creatorAdd: final?.account?.creator.toString() || "",
        creatorVault: final?.vaultPda.toString() || "",
        totaltips: Number(final?.account.totalTips) || 0,
      });
      setIsActivated(true);
    } catch (error) {
      console.error("Vault setup failed:", error.message || error);
      // optionally show toast
      setIsActivated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!wallet) return;
    handleActivateWallet();
  }, [wallet]);
  return (
    <>
      <div
        className={`text-black  flex items-center justify-between ${dmsans.className} mt-20 `}
      >
        <div>
          <p
            className="text-2xl md:text-[2.7rem]  font-semibold "
            style={{ fontFamily: "cursive" }}
          >
            Hey builders (2Y…i0),
            <br />
            Appreciate the impact you’re creating.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <p>Total tips : {vaultAcc?.totaltips} </p>
          <p>Balance left : 2 left</p>
        </div>
      </div>

      <div className="flex items-center justify-center flex-col h-[45vh] gap-10">
        {!isActivated ? (
          <Button
            variant={"secondary"}
            className="bg-[#522AA5] hover:bg-[#5128a5d9] text-white font-semibold cursor-pointer"
            onClick={handleActivateWallet}
          >
            Activate Your Wallet
          </Button>
        ) : (
          <>
            <div className="flex gap-2 flex-col items-center">
              <p className="border-2 text-2xl text-gray-900 px-2 py-1 rounded-2xl">
                {vaultAcc?.creatorVault}
              </p>
              <p className="text-black text-xs">
                Share with the world →{" "}
                <Link href={`/tip/${vaultAcc?.creatorVault}`}>
                  <span className="text-indigo-700">
                    {" "}
                    https://tipper.vercel.app/tip/{vaultAcc?.creatorVault}
                  </span>{" "}
                </Link>
              </p>
            </div>
            {isbal && (
              <div>
                <Button
                  variant={"secondary"}
                  className="bg-[#522AA5] mt-3 hover:bg-[#5128a5d9] text-white font-semibold cursor-pointer"
                >
                  Withdraw
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default page;
