// chat.config.js

module.exports = {
  auth: {
    // Use NextAuth for authentication
    provider: 'nextauth', 
    
    // Configure NextAuth for Ethereum wallet authentication
    nextAuthConfig: {
      providers: [
        // SIWE (Sign-In with Ethereum) provider for wallet connection
        {
          id: 'ethereum',
          name: 'Ethereum',
          type: 'oauth',
          version: '2.0',
          scope: 'openid',
          params: {
            grant_type: 'authorization_code',
            response_type: 'code',
          },
          async authorization({ provider, req, credentials }) {
            // Logic to interact with RainbowKit or any other Ethereum wallet
            const { address } = credentials;

            if (!address) {
              throw new Error("Ethereum address is required");
            }

            // Simulate generating a session or token for authenticated users
            const token = await generateWalletSession(address);
            return token;
          },
          profile(profile) {
            // Extract user details from the wallet
            return {
              id: profile.address, // The wallet address as the user ID
              email: profile.email, // Email (if available)
              name: profile.name || profile.address, // Use wallet address as the name
            };
          },
        },
      ],
      session: {
        jwt: true, // Use JWT for session handling
      },
      pages: {
        signIn: '/auth/signin', // Custom sign-in page URL
      },
    },
  },

  // RainbowKit configuration (optional)
  rainbowKitConfig: {
    modalSize: 'small', // Specify modal size for wallet selection
    supportedChains: ['ethereum', 'polygon'], // Chains to support
    walletConnectClientMeta: {
      name: 'My DApp Wallet Authentication',
      description: 'A decentralized application for wallet authentication',
    },
  },
};

// Helper function to generate session token for the wallet address
async function generateWalletSession(address) {
  // Simulate session generation logic (can be JWT or other methods)
  const sessionToken = `session-token-for-${address}`;
  return sessionToken;
}
