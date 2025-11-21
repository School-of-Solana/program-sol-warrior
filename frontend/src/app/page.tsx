"use client";
import Image from "next/image";
import Navbar from "../components/header/Navbar";
import HeroSection from "../components/HeroSection";
import LatestTxns from "../components/LatestTxns";
import { getAllVaultAccount } from "../lib/anchor/services";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getConnection } from "../lib/solana/connection";
import { useEffect, useState } from "react";

export default function Home() {
  const [vaultAccounts, setVaultAccounts] = useState<
    { pdaAddress: string; creator: string; totalTips: number }[]
  >([]);
  const wallet = useAnchorWallet();
  const conn = getConnection();

  async function fetchAllAccounts() {
    if (!wallet) return;
    const acc = await getAllVaultAccount(wallet, conn);
    console.log({ acc });

    // const accs = {
    //   pdaAddress: acc[0].publicKey.toString(),
    //   creator: acc[0].account.creator.toString(),
    //   totalTips: Number(acc[0].account.totalTips),
    // };

    const totalAccounts = [];

    for (let i = 0; i < acc.length; i++) {
      const tempAcc = {
        pdaAddress: acc[i].publicKey.toString(),
        creator: acc[i].account.creator.toString(),
        totalTips: Number(acc[i].account.totalTips),
      };

      totalAccounts.push(tempAcc);
    }

    setVaultAccounts(totalAccounts);
  }

  // account
  // :
  // {creator: PublicKey, bump: 253, totalTips: BN}
  // publicKey
  // :
  // PublicKey {_bn: BN}
  useEffect(() => {
    fetchAllAccounts();
  }, [wallet]);
  return (
    <div className=" bg-zinc-50 font-sans dark:bg-black py-7 px-12">
      {/* <main className="min-h-screen flex  w-full  flex-col items-start justify-between py-3 px-16  sm:items-start border    bg-red-400 font-sans"> */}
      <main className="h-full border-red-500 ">
        <Navbar />

        <HeroSection />

        <div className="bg-zinc-50 h-full w-full">
          <p>
            Vaults Accounts({vaultAccounts.length}) :{" "}
            {vaultAccounts[0]?.pdaAddress}
          </p>
          <h2 className="text-indigo-950">Latest Transactions:</h2>
          <LatestTxns />
        </div>
      </main>
    </div>
  );
}

{
  /* <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        /> */
}
{
  /* <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div> */
}
{
  /* <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div> */
}
