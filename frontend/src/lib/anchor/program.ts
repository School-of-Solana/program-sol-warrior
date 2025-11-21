import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import type { AnchorProject } from "./anchor_project_idl";
import idl from "./anchor_project_idl.json";
import { Connection } from "@solana/web3.js";

export function getProgram(
  connection: Connection,
  wallet: AnchorWallet
): Program<AnchorProject> | null {
  // const { connection } = useConnection();

  if (!wallet) {
    console.error("No wallet found");
    return null;
  }

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  setProvider(provider);

  const program = new Program(idl as AnchorProject, provider);

  return program as unknown as Program<AnchorProject>;
}
