"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Navbar from "@/src/components/header/Navbar";
import React, { useEffect, useState } from "react";
import {
  balOfVaultAccount,
  getCreatorVaultAccount,
  getWithdrawAllTip,
  initializeVault,
} from "@/src/lib/anchor/services";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getConnection } from "@/src/lib/solana/connection";
import { AnchorError } from "@coral-xyz/anchor";
import {
  Wallet,
  Coins,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatAddress } from "@/src/lib/utils";

const BuilderPage = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vaultBal, setBal] = useState<number>(0);
  const [vaultAcc, setVaultAcc] = useState<
    | {
        creatorVault: string;
        totaltips: number;
        creatorAdd: string;
      }
    | undefined
  >({
    creatorVault: "",
    totaltips: 0,
    creatorAdd: "",
  });
  const [copied, setCopied] = useState(false);
  const wallet = useAnchorWallet();
  const connection = getConnection();

  const handleActivateWallet = async () => {
    try {
      if (!wallet?.publicKey) {
        console.log("Please connect your wallet.");
        return;
      }
      setIsLoading(true);
      const result = await getCreatorVaultAccount(wallet, connection);

      if (!result?.exists) {
        await initializeVault(wallet, connection);
      }

      const final = await getCreatorVaultAccount(wallet, connection);

      setVaultAcc({
        creatorAdd: final?.account?.creator.toString() || "",
        creatorVault: final?.vaultPda.toString() || "",
        totaltips: Number(final?.account.totalTips) / 1e9 || 0,
      });
      setIsActivated(true);
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error(
          "Vault setup failed:",
          (error as { message?: string }).message
        );
      } else {
        console.error("Vault setup failed:", error);
      }
      setIsActivated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawTip = async () => {
    try {
      if (!wallet?.publicKey) return;

      await getWithdrawAllTip(wallet, connection);
      accBalance();
    } catch (err) {
      if (err instanceof AnchorError) {
        console.log("Error Name:", err.name);
        console.log("Error Code:", err.error.errorCode);
        console.log("Error Msg:", err.error.errorMessage);
      } else {
        console.error("Non-Anchor Error:", err);
      }
    }
  };

  const accBalance = async () => {
    if (!wallet?.publicKey) return;

    const bal = await balOfVaultAccount(connection, wallet.publicKey);
    setBal(bal);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!wallet) return;
    handleActivateWallet();
    accBalance();
  }, [wallet]);

  const tipUrl = vaultAcc?.creatorVault
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/tip/${
        vaultAcc.creatorVault
      }`
    : "";

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="h-full">
        <div className="py-7 px-6 md:px-12">
          {/* <Navbar /> */}

          <section className="max-w-5xl mx-auto mt-12 md:mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/40 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Builder Dashboard
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-[1.1] tracking-tight mb-4">
                Hey{" "}
                <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Builder
                </span>
                {wallet?.publicKey && (
                  <span className="text-2xl md:text-3xl block mt-2 text-muted-foreground font-normal">
                    {formatAddress(wallet.publicKey.toString())}
                  </span>
                )}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto">
                Appreciate the impact you're creating. Set up your tip vault and
                start receiving support.
              </p>
            </div>

            {!isActivated ? (
              <Card className="glass-card border-primary/20 max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">
                    Activate Your Tip Vault
                  </CardTitle>
                  <CardDescription>
                    Create your vault to start receiving tips from supporters
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                  <Button
                    onClick={handleActivateWallet}
                    disabled={isLoading || !wallet}
                    size="lg"
                    className="w-full sm:w-auto group cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-purple transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
                  >
                    <Wallet className="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
                    {isLoading ? "Activating..." : "Activate Your Wallet"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  {!wallet && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please connect your wallet to continue
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Total Tips Received
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-secondary">
                        {vaultAcc?.totaltips.toFixed(4) || "0.0000"} SOL
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        Available Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-secondary">
                        {vaultBal.toFixed(4)} SOL
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Vault Address Card */}
                <Card className="glass-card border-primary/20 max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle>Your Tip Vault Address</CardTitle>
                    <CardDescription>
                      Share this link with your supporters to receive tips
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <code className="flex-1 text-sm font-mono text-foreground break-all">
                        {vaultAcc?.creatorVault || "Loading..."}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          vaultAcc?.creatorVault &&
                          copyToClipboard(vaultAcc.creatorVault)
                        }
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {tipUrl && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Your Tip Link:
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                          <Link
                            href={tipUrl}
                            className="flex-1 text-sm text-primary hover:underline break-all"
                            target="_blank"
                          >
                            {tipUrl}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(tipUrl)}
                            className="shrink-0"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Link href={tipUrl} target="_blank">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {vaultBal > 0 && (
                      <Button
                        onClick={handleWithdrawTip}
                        size="lg"
                        className="w-full group cursor-pointer bg-secondary hover:bg-secondary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-green transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-secondary/50"
                      >
                        <Coins className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Withdraw {vaultBal.toFixed(4)} SOL
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;
