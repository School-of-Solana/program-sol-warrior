"use client";
import LatestTxns from "@/src/components/LatestTxns";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { getDepositTip } from "@/src/lib/anchor/services";
import { getConnection } from "@/src/lib/solana/connection";
import { formatAddress } from "@/src/lib/utils";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Coins,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Wallet,
  Share2,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { balOfVaultAccount } from "@/src/lib/anchor/services";
import Link from "next/link";

const TipPage = () => {
  const wallet = useAnchorWallet();
  const connection = getConnection();
  const { tipid } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isSign, setIsSign] = useState("");
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [isValidVault, setIsValidVault] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const builderAddForTip = tipid as string;

  useEffect(() => {
    const fetchVaultBalance = async () => {
      try {
        const vaultPda = new PublicKey(builderAddForTip);
        const balance = await balOfVaultAccount(connection, vaultPda);
        console.log("Vault Balance", balance, vaultPda.toString());
        setVaultBalance(balance);
        setIsValidVault(true);
      } catch (error) {
        console.error("Failed to fetch vault balance:", error);
        setIsValidVault(false);
      }
    };

    if (builderAddForTip) {
      fetchVaultBalance();
    }
  }, [builderAddForTip, connection]);

  const handleTipWallet = async () => {
    const tipAmount = parseFloat(amount);

    if (!tipAmount || tipAmount <= 0) {
      return;
    }

    try {
      setIsLoading(true);

      if (!wallet?.publicKey) {
        throw new Error("Please connect your wallet");
      }

      const sign = await getDepositTip(
        wallet,
        connection,
        tipAmount,
        builderAddForTip
      );

      setIsSign(sign || "");
      setAmount("");

      // Refresh vault balance after tip
      const balance = await balOfVaultAccount(
        connection,
        new PublicKey(builderAddForTip)
      );
      setVaultBalance(balance);
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

  const quickAmounts = ["0.05", "0.1", "0.25", "0.5"];

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const copyVault = () => {
    navigator.clipboard.writeText(builderAddForTip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusHighlights = [
    {
      label: "Builder address",
      value: formatAddress(builderAddForTip),
      icon: Share2,
    },
    {
      label: "Vault Balance",
      value: `${vaultBalance.toFixed(4)} SOL`,
      icon: TrendingUp,
    },
    // {
    //   label: "Your Wallet",
    //   value: wallet?.publicKey
    //     ? formatAddress(wallet.publicKey.toString())
    //     : "Not connected",
    //   icon: Wallet,
    // },
  ];

  if (!isValidVault) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
        <main className="h-full">
          <div className="py-10 px-6 md:px-12">
            <section className="max-w-4xl mx-auto mt-24 text-center">
              <Card className="glass-card border-red-200 dark:border-red-800 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                    Invalid vault address
                  </CardTitle>
                  <CardDescription>
                    We couldn&apos;t find a vault for that link. Double-check
                    the URL or search for another creator.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Link href="/tipper">
                    <Button className="w-full sm:w-auto">
                      Search creators
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
      <main className="h-full bg-[#fafafa]">
        <div className="py-10 px-6 md:px-12 bg-[#fafafa]">
          <section className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border-none bg-linear-to-br from-primary/10 via-transparent to-secondary/10 px-6 py-10 md:px-12 md:py-14 shadow-[0_20px_120px_-60px_rgba(99,102,241,0.8)]">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-12 right-10 w-48 h-48 bg-primary/40 blur-[120px]" />
                <div className="absolute bottom-6 left-10 w-56 h-56 bg-secondary/40 blur-[140px]" />
              </div>

              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/40 bg-white/30 backdrop-blur">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Support a builder
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-balance">
                  Small tips,
                  <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    big momentum.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  Your tip fuels creativity and empowers builders to bring ideas
                  to life. By supporting, you&apos;re helping inspire new
                  innovations that can make a positive impact for everyone.
                  Thanks for being part of something bigger!
                </p>

                <div className="flex flex-wrap gap-3">
                  {statusHighlights.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-2xl border border-border/50 bg-white/70 dark:bg-zinc-900/70 px-4 py-3"
                    >
                      <div className="rounded-xl bg-primary/10 p-2.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-base font-semibold">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {!wallet && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/60 bg-white/20 px-4 py-2 text-sm text-white">
                    <Info className="w-4 h-4" />
                    Connect your wallet from the header to tip instantly.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="glass-card border-none">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Share2 className="w-5 h-5 text-primary" />
                    Builder details
                  </CardTitle>
                  <CardDescription>
                    This vault is non-custodial. Funds go directly to the
                    builder and remain accessible only to them.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Vault address
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                      <code className="flex-1 text-sm font-mono text-foreground break-all">
                        {builderAddForTip}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyVault}
                        className="inline-flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        Vault balance
                      </p>
                      <p className="text-3xl font-bold text-secondary">
                        {vaultBalance.toFixed(4)} SOL
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1 flex items-center gap-2 text-green-600 dark:text-green-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground">
                    Support this builder and join the community!
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader className="space-y-2 text-center">
                  <CardTitle className="text-3xl font-semibold">
                    Send a tip
                  </CardTitle>
                  <CardDescription>
                    Enter the SOL amount you'd like to tip. You can review
                    before confirming in your wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 mt-5">
                    <label className="text-sm font-medium text-foreground">
                      Amount (SOL)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.10"
                      className="text-lg h-14 text-center"
                      min={0}
                      step="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading || !wallet}
                    />
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {quickAmounts.map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(value)}
                          disabled={isLoading || !wallet}
                          className={`rounded-full px-4 ${
                            amount === value ? "bg-secondary/20" : ""
                          }`}
                        >
                          {value} SOL
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Minimum: 0.001 SOL
                    </p>
                  </div>

                  {!wallet && (
                    <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200 text-center">
                      Please connect your wallet to send a tip.
                    </div>
                  )}

                  <Button
                    onClick={handleTipWallet}
                    disabled={
                      isLoading || !wallet || !amount || parseFloat(amount) <= 0
                    }
                    size="lg"
                    className="w-full group  cursor-pointer bg-secondary hover:bg-secondary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-blue transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-secondary/50 mt-8"
                  >
                    {/* <Coins className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" /> */}
                    {isLoading ? "Processing..." : `Tip ${amount || "0"} SOL`}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {isSign && (
                    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <h3 className="font-semibold text-green-800 dark:text-green-300">
                              Tip sent successfully!
                            </h3>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Transaction signature:
                          </p>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-black/40 border border-green-200 dark:border-green-800">
                            <code className="flex-1 text-xs font-mono text-foreground break-all">
                              {isSign}
                            </code>
                            <Link
                              href={`https://explorer.solana.com/tx/${isSign}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <div className="bg-transparent dark:bg-black h-full w-full mt-16">
          <LatestTxns />
        </div>
      </main>
    </div>
  );
};

export default TipPage;
