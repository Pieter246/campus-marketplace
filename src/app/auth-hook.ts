"use client"
// examples/auth-hook.ts
// Custom hook for authentication state management in TypeScript

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth({children}: {children: React.ReactNode}) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false
      })
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getToken = async (): Promise<string | null> => {
    if (authState.user) {
      return await authState.user.getIdToken()
    }
    return null
  }

  return {
    user: authState.user,
    loading: authState.loading,
    logout,
    getToken
  }
}