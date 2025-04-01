// freysa\app\api\auth\[...nextauth]\route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials, req) {
        // Auto-authorize the connected wallet
        return { id: 1 };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      // Include the wallet address in the session
      return {
        ...session,
        walletAddress: token.walletAddress
      };
    },
    async jwt({ token, account, user }) {
      // Include the wallet address in the token
      if (token) {
        token.walletAddress = "0xca1a64d9E4e6767C1034F6CA49778Db458337F76";
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 