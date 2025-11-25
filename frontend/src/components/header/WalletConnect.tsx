"use client";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletIcon } from "lucide-react";

import dynamic from "next/dynamic";
import { SOLBalance } from "./SolBal";

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Connect Wallet",
} as const;

const ConnectWallet = () => {
  const wallet = useWallet();
  const isWalletConnected = wallet.connected;

  return (
    <div className="flex items-center justify-center sm:gap-3">
      <div className=" flex items-center text-white   ">
        {isWalletConnected && (
          <>
            <WalletIcon className=" h-4 w-4  hidden   sm:block" />
            <SOLBalance />
          </>
        )}
      </div>
      <WalletModalProvider>
        <div className="flex items-center justify-between">
          <BaseWalletMultiButtonDynamic
            style={isWalletConnected ? connectedStyle : disconnectedStyle}
            labels={LABELS}
          />
        </div>
      </WalletModalProvider>
    </div>
  );
};

const connectedStyle = {
  background: "#ededed",
  borderRadius: "1rem",
  maxWidth: "400px",
  color: "#000",
  // width: "10rem",
  fontSize: "1rem",
  height: "2.5rem",
  cursor: "pointer",
  padding: "1.5rem 1rem",
};
const disconnectedStyle = {
  background: "#522AA5",
  borderRadius: "1rem",
  maxWidth: "400px",
  // width: "10rem",
  color: "#fff",
  fontSize: "1rem",
  height: "2.5rem",
  cursor: "pointer",
  padding: "1.5rem 1rem",
};

const BaseWalletMultiButtonDynamic = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.BaseWalletMultiButton
    ),
  { ssr: false }
);

export default ConnectWallet;
