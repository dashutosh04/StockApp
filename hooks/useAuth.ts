'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  name : string
  email: string
}

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router                = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('stockai_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('stockai_user')
    setUser(null)
    router.push('/')
  }

  const isLoggedIn = !!user

  return { user, loading, logout, isLoggedIn }
}