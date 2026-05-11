import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set("auth_token", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "strict",
    maxAge: 0, // immediately expire
  });

  return NextResponse.json({ success: true });
}