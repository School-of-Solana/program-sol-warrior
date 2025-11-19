"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { createContext, useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";

const rpcURL =
  (process.env.NEXT_PUBLIC_RPC_URL as string) ||
  "https://api.devnet.solana.com";

interface BalanceContextType {
  walletBalance: number;
  fetchBalance: () => void;
}

export const BalanceContext = createContext<BalanceContextType>({
  walletBalance: 0,
  fetchBalance: () => {},
});

export const BalanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const wallet = useWallet();

  const fetchBalance = async () => {
    if (!wallet.publicKey) {
      setWalletBalance(0);
      return;
    }
    try {
      const connection = new Connection(rpcURL);

      const balanceLamports = await connection.getBalance(
        wallet.publicKey,
        "confirmed"
      );

      const balanceSOL = balanceLamports / 1e9;

      console.log({ balanceSOL });
      setWalletBalance(balanceSOL);
    } catch (error) {
      console.error("Fetching Wallet Bal Error:", error);
      setWalletBalance(0);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [wallet.connected]);

  return (
    <BalanceContext.Provider value={{ walletBalance, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
