import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  
  try {
    const token = await getToken({ 
      req,
      secret 
    });
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token error:', error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
} 