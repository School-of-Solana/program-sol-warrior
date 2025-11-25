import { ExternalLink } from "lucide-react";
import { Card } from "./ui/card";
import Link from "next/link";
import { getAllVaultAccount } from "../lib/anchor/services";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getConnection } from "../lib/solana/connection";
import { useCallback, useEffect, useState, startTransition } from "react";

export default function LatestTxns() {
  const wallet = useAnchorWallet();
  const conn = getConnection();

  const [vaultAccounts, setVaultAccounts] = useState<
    { pdaAddress: string; creator: string; totalTips: number }[]
  >([]);

  const fetchAllAccounts = useCallback(async () => {
    if (!wallet) return;
    const acc = await getAllVaultAccount(wallet, conn);

    const totalAccounts = acc
      .map((a) => ({
        pdaAddress: a.publicKey.toString(),
        creator: a.account.creator.toString(),
        totalTips: Number(a.account.totalTips / 1e9),
      }))
      .slice(0, 10)
      .sort((a, b) => b.totalTips - a.totalTips);

    startTransition(() => setVaultAccounts(totalAccounts));
  }, [wallet, conn]);

  useEffect(() => {
    void fetchAllAccounts();
  }, [fetchAllAccounts]);

  return (
    <section className="mt-32 max-w-6xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black">
          {"Top 10 Builder"}
        </h2>
      </div>

      <Card className="glass-card border-none overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="text-left py-5 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {"Builder"}
                </th>
                <th className="text-center py-5 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {"Wallet"}
                </th>
                <th className="text-left py-5 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {"Tip Received (SOL)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {vaultAccounts.map((tx, index) => (
                <tr
                  key={tx.creator + index}
                  className="border-b border-border/20 hover:bg-primary/10 transition-all duration-200 group"
                >
                  <td className="py-5 px-6">
                    <Link
                      target="_blank"
                      href={`https://explorer.solana.com/address/${tx.creator}?cluster=devnet`}
                      className="flex items-center gap-2 text-primary hover:text-blue-600"
                    >
                      <code className="text-sm font-mono  font-medium hover:text-blue-600">
                        {tx.creator}
                      </code>
                      <ExternalLink className="w-3.5 h-3.5  opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 " />
                    </Link>
                  </td>
                  <td className="py-5 px-6 ">
                    <Link
                      target="_blank"
                      href={`https://explorer.solana.com/address/${tx.pdaAddress}?cluster=devnet`}
                      className="flex items-center gap-2 text-primary hover:text-blue-600"
                    >
                      <code className="text-sm font-mono  font-medium ">
                        {tx.pdaAddress}
                      </code>
                      <ExternalLink className="w-3.5 h-3.5  opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="font-bold text-base text-secondary tabular-nums">
                      {tx.totalTips}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
