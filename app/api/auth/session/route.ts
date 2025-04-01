import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Session error" }, { status: 500 });
  }
} 