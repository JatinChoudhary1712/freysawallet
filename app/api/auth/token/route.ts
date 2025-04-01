import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ 
    req,
    raw: true // This will give us the raw JWT token string
  });
  
  return NextResponse.json({ token });
} 