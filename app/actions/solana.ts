import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { solanaConfig } from "../wagmi";

export async function getSolanaBalance(address: string) {
  try {
    const connection = new Connection(clusterApiUrl(solanaConfig.network));
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return {
      success: true,
      balance: balance / LAMPORTS_PER_SOL
    };
  } catch (error) {
    console.error("Error getting Solana balance:", error);
    return {
      success: false,
      balance: 0
    };
  }
} 