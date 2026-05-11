// import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers'

// export async function GET() {
//   const cookieStore = await cookies()
//   const token = cookieStore.get('auth_token')?.value

//   if (!token) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     // Verify token and get user from DB
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
//     // const user = await db.user.findById(decoded.id)

//     // Example mock response:
//     const user = {
//       id: '1',
//       name: 'John Doe',
//       email: 'john@example.com',
//       role: 'user',
//       affiliateCode: 'JOHN123',
//     }

//     return NextResponse.json({ user })
//   } catch {
//     return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
//   }
// }

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "strict",
  });

  return NextResponse.json({ success: true });
}