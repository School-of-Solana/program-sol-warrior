import { clusterApiUrl, Connection } from "@solana/web3.js";

export function getConnection() {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK || clusterApiUrl("devnet");
  return new Connection(endpoint, "confirmed");
}
