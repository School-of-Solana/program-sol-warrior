"use client";
import LatestTxns from "@/src/components/LatestTxns";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { getDepositTip } from "@/src/lib/anchor/services";
import { getConnection } from "@/src/lib/solana/connection";
import { formatAddress } from "@/src/lib/utils";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { DM_Sans } from "next/font/google";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const dmsans = DM_Sans({
  subsets: ["latin"],
});

const page = () => {
  const wallet = useAnchorWallet();
  const connection = getConnection();
  const { tipid } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [isSign, setIsSign] = useState("");
  console.log("Tip Id ", tipid);

  const builderAddForTip = tipid as string;

  const handleTipWallet = async () => {
    console.log("Handling tipping wallet");

    try {
      setIsLoading(true);

      if (!wallet?.publicKey) {
        console.log("Please connect your wallet.");
        throw new Error("Please connect your wallet");
      }

      console.log("1", amount);
      const sign = await getDepositTip(
        wallet,
        connection,
        amount,
        builderAddForTip
      );

      console.log(sign);

      setIsSign(sign || "");
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error(
          "Deposit tip failed:",
          (error as { message?: string }).message
        );
      } else {
        console.error("Vault deposit tip failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div
        className={`text-black  flex items-start justify-between ${dmsans.className} mt-20 `}
      >
        <div>
          <p
            className="text-2xl md:text-[2.7rem]  font-semibold "
            style={{ fontFamily: "cursive" }}
          >
            Hey tipper (1Z..0Y), <br />
            Your support makes it easier <br />
            to bring good things to the world.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <p>
            Address :{" "}
            <span className="font-semibold">
              {" "}
              {formatAddress(builderAddForTip)}{" "}
            </span>{" "}
          </p>
          <p>Total tips : 10 SOL </p>
        </div>
      </div>

      <div className="flex items-center mx-auto justify-center flex-col h-[45vh] gap-5">
        <Input
          type="number"
          placeholder="0.001 SOL"
          className="text-blue-950  max-w-28"
          min={0}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <Button
          variant={"secondary"}
          disabled={isLoading}
          className="bg-[#522AA5] hover:bg-[#5128a5d9] text-white font-semibold cursor-pointer"
          onClick={handleTipWallet}
        >
          {" "}
          Tip
        </Button>
      </div>

      {isSign && <p>https://explorer.solana.com/tx/{isSign}?cluster=devnet </p>}
      <div className="bg-zinc-50 h-full w-full">
        <h2 className="text-indigo-950">Latest Transactions:</h2>
        <LatestTxns />
      </div>
    </>
  );
};

export default page;
