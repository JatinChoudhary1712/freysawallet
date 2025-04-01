import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { useSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  const { data: session, status } = useSession();

  console.log('Full session data:', session);

  if (status === "loading") {
    res.json({ status: "loading" });
  } else if (status === "authenticated") {
    res.json({ status: "authenticated", session });
  } else {
    res.json({ status: "unauthenticated" });
  }
} 