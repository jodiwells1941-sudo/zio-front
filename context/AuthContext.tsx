'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  affiliateCode?: string
  // add more fields as needed
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user data
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include', // send cookies
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Refresh user manually (call after profile update etc.)
  const refreshUser = async () => {
    await fetchUser()
  }

  // Logout
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}