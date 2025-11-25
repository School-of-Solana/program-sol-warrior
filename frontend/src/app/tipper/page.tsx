"use client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { checkCreatorVaultAccount } from "@/src/lib/anchor/services";
import { getConnection } from "@/src/lib/solana/connection";
import React, { useState } from "react";
import { ArrowRight, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

const TipperPage = () => {
  const [searchAdd, setSearchAdd] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [creatorAdd, setCreatorAdd] = useState<{
    isExist: boolean;
    pdaAcc: null | string;
    message: string;
  }>({ isExist: false, pdaAcc: null, message: "" });

  const handleTipper = async () => {
    if (!searchAdd.trim()) return;

    setIsSearching(true);
    try {
      const creatorDetails = await checkCreatorVaultAccount(
        searchAdd,
        getConnection()
      );
      setCreatorAdd(creatorDetails);
    } catch (error) {
      console.error("Search failed:", error);
      setCreatorAdd({
        isExist: false,
        pdaAcc: null,
        message: "Failed to search. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchAdd.trim()) {
      handleTipper();
    }
  };

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="h-full">
        <div className="py-7 px-6 md:px-12">
          <section className="max-w-5xl mx-auto mt-12 md:mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/40 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Find a Builder
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-[1.1] tracking-tight mb-4">
                Support the{" "}
                <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Builders
                </span>
                <br />
                You Love
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto">
                Search for a builder&apos;s wallet address or vault address to
                send them a tip
              </p>
            </div>

            <Card className="glass-card border-none max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Search Builder
                </CardTitle>
                <CardDescription className="text-center">
                  Enter a wallet address or vault address to find the builder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="Enter wallet or vault address..."
                    className="flex-1 text-base h-12"
                    onChange={(e) => setSearchAdd(e.target.value)}
                    onKeyPress={handleKeyPress}
                    value={searchAdd}
                    disabled={isSearching}
                  />
                  <Button
                    onClick={handleTipper}
                    disabled={!searchAdd.trim() || isSearching}
                    size="lg"
                    className="w-full sm:w-auto group cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 py-6 rounded-2xl neon-glow-purple transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {creatorAdd.message && (
                  <div
                    className={`p-4 rounded-xl border ${
                      creatorAdd.isExist
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {creatorAdd.isExist ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      )}
                      <p
                        className={`text-sm ${
                          creatorAdd.isExist
                            ? "text-green-800 dark:text-green-300"
                            : "text-red-800 dark:text-red-300"
                        }`}
                      >
                        {creatorAdd.message}
                      </p>
                    </div>
                  </div>
                )}

                {creatorAdd.isExist && creatorAdd.pdaAcc && (
                  <Card className=" bg-primary/5 border-none">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold">
                            Builder Found!
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ready to tip this builder? Click the button below to
                          go to their tip page.
                        </p>
                        <Link
                          href={`/tip/${creatorAdd.pdaAcc}`}
                          className="block"
                        >
                          <Button
                            size="lg"
                            className="w-full group cursor-pointer bg-secondary hover:bg-secondary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-blue transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-secondary/50"
                          >
                            <span className="flex items-center mr-3"></span>
                            Go to Tip Page
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        <div className="pt-4 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">
                            Vault Address:
                          </p>
                          <code className="text-xs font-mono text-foreground break-all block p-2 rounded bg-muted/30">
                            {creatorAdd.pdaAcc}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TipperPage;
