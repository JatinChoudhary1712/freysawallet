// services/actions/getMessages.ts

export type TMessage = {
  id: string;
  content: string;
  price: string; // Price in Wei, ETH, etc.
  createdAt: Date;
};

/**
 * Retrieves recent messages.
 * @param filter Optional filter criteria.
 * @param limit Maximum number of messages to return.
 * @returns A promise that resolves to an array of messages.
 */
export async function getRecentMessages(filter?: any, limit: number = 10): Promise<TMessage[]> {
  // Dummy implementation: Replace this with your actual logic.
  const dummyMessages: TMessage[] = [
    { id: "1", content: "Hello, world!", price: "0.001", createdAt: new Date() },
    { id: "2", content: "This is a test message. Made for testing purposes.", price: "0.002", createdAt: new Date() },
    // Add more dummy messages as needed
  ];

  // Return up to the specified limit
  return dummyMessages.slice(0, limit);
}
