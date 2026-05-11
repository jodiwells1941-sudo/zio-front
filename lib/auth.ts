import { cookies } from 'next/headers'

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  // Verify token — example with JWT
  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    // return decoded
    return { token } // replace with real verification
  } catch {
    return null
  }
}