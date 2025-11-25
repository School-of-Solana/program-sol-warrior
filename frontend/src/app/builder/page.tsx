"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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
  ShieldCheck,
  Share2,
  Info,
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

  const setupSteps = [
    {
      title: "Connect wallet",
      description: "Use the header button to connect your Solana wallet.",
      done: Boolean(wallet?.publicKey),
    },
    {
      title: "Activate vault",
      description: "We deploy a secure vault PDA to hold incoming tips.",
      done: isActivated,
    },
    {
      title: "Share your link",
      description: "Send supporters your tip page  for instant funds.",
      done: Boolean(tipUrl),
    },
  ];

  const completedSteps = setupSteps.filter((step) => step.done).length;
  const progress = Math.round((completedSteps / setupSteps.length) * 100);

  const statusHighlights = [
    {
      label: "Wallet status",
      value: wallet?.publicKey
        ? formatAddress(wallet.publicKey.toString())
        : "Not connected",
      icon: Wallet,
      accent: wallet?.publicKey ? "text-green-500" : "text-muted-foreground",
    },
    {
      label: "Vault status",
      value: isActivated ? "Ready to receive tips" : "Activate to start",
      icon: ShieldCheck,
      accent: isActivated ? "text-primary" : "text-muted-foreground",
    },
    {
      label: "Available balance",
      value: `${vaultBal.toFixed(4)} SOL`,
      icon: Coins,
      accent: vaultBal > 0 ? "text-secondary" : "text-muted-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100  dark:from-black dark:via-zinc-950 dark:to-black">
      <main className="h-full">
        <div className="py-10 px-6 md:px-12 bg-[#f9f9fa]">
          <section className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl  border-primary/20 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 px-6 py-10 md:px-12 md:py-14 shadow-[0_20px_120px_-60px_rgba(99,102,241,0.8)]">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-10 right-10 w-48 h-48 bg-primary/30 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/30 blur-[140px]" />
              </div>

              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/40 bg-white/20 backdrop-blur">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Builder Command Center
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-balance">
                  Keep your supporters close,
                  <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    keep your tips closer.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  Spin up your non-custodial tip vault in seconds, watch
                  balances grow in real time, and share a human-friendly link
                  that feels welcoming.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleActivateWallet}
                    disabled={isLoading || !wallet}
                    size="lg"
                    className="group cursor-pointer bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    <Wallet className="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
                    {isActivated
                      ? "Refresh vault status"
                      : isLoading
                      ? "Activating..."
                      : "Activate tip vault"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  {!wallet && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary/40 px-4 py-2 text-sm text-muted-foreground">
                      <Info className="w-4 h-4" />
                      Connect your wallet from the header to continue.
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {statusHighlights.map(
                    ({ label, value, icon: Icon, accent }) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 rounded-2xl border border-border/40 bg-white/60 dark:bg-zinc-900/60 p-4"
                      >
                        <div className="rounded-2xl bg-primary/10 p-3">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {label}
                          </p>
                          <p className={`text-lg font-semibold ${accent}`}>
                            {value}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="glass-card border-primary/20">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Your setup journey
                  </CardTitle>
                  <CardDescription>
                    Complete the steps below. Progress updates automatically
                    when your wallet or vault status changes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium mb-2">
                      <span>{progress}% ready</span>
                      <span>
                        {completedSteps}/{setupSteps.length} steps
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {setupSteps.map((step, index) => (
                      <div
                        key={step.title}
                        className={`flex gap-4 rounded-2xl border p-4 ${
                          step.done
                            ? "border-green-400/40 bg-green-50/60 dark:bg-green-950/20"
                            : "border-border/50 bg-muted/30"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            step.done
                              ? "border-green-500 text-green-600"
                              : "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-base font-semibold">
                            {step.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isActivated ? (
                    <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4">
                      <p className="font-semibold text-secondary">
                        All set! Your vault is live.
                      </p>
                      <p className="text-sm text-secondary/70">
                        Share your link or embed the QR so supporters can tip
                        you instantly. You can withdraw anytime.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground">
                      When you hit “Activate tip vault” we’ll create a secure
                      vault PDA tied to your wallet. This only needs to happen
                      once per creator.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-primary" />
                      Share your tip vault
                    </CardTitle>
                    <CardDescription>
                      Send the vault address or shareable link. Supporters can
                      tip from any Solana wallet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="text-sm text-muted-foreground">
                      Vault address
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <code className="flex-1 text-sm font-mono text-foreground break-all">
                        {vaultAcc?.creatorVault ||
                          "Activate your vault to get an address"}
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
                          Tip landing page
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
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
                  </CardContent>
                </Card>

                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-primary" />
                      Tip activity
                    </CardTitle>
                    <CardDescription>
                      Live totals update automatically when supporters send SOL.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        Total tips
                      </p>
                      <p className="text-3xl font-bold text-secondary">
                        {vaultAcc?.totaltips.toFixed(4) || "0.0000"} SOL
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        Available balance
                      </p>
                      <p className="text-3xl font-bold text-secondary">
                        {vaultBal.toFixed(4)} SOL
                      </p>
                    </div>

                    {vaultBal > 0.01 ? (
                      <Button
                        onClick={handleWithdrawTip}
                        size="lg"
                        className="w-full group cursor-pointer bg-secondary hover:bg-secondary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-green transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-secondary/50"
                      >
                        Withdraw
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        You can withdraw once your balance is over 0.01 SOL.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;
