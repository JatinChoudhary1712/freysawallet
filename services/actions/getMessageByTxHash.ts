// actions/getMessageByTxHash.ts

import type { TMessage } from "./getMessages";

export async function getMessageByTxHash(
  txHash: string,
  txExpiryMinutes?: number
): Promise<TMessage | null> {
  // Dummy implementation: Replace with your actual logic.
  if (!txHash) return null;

  return {
    id: txHash,
    content: "Dummy message content",
    price: "1000000000000000", // Example: 0.001 ETH in Wei
    createdAt: new Date(),
  };
}
