"use client"

import { auth } from "@/firebase/client"
import {
  GoogleAuthProvider,
  ParsedToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  User
} from "firebase/auth"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { removeToken, setToken } from "./actions"

// NEW: Import server action for Google Firestore registration
import { registerGoogleUser } from "@/app/register/actions"

// Explicit custom claims type
export type CustomClaims = ParsedToken & {
  admin?: boolean
}

export type AuthContextType = {
  currentUser: User | null
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<User>
  customClaims: CustomClaims | null
  loginWithEmail: (email: string, password: string) => Promise<void>
  isLoading: boolean
  isAdmin: boolean // Add real-time admin status
  refreshAdminStatus: () => Promise<void> // Function to refresh admin status
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [customClaims, setCustomClaims] = useState<CustomClaims | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false) // Add admin status state

  // Function to check admin status via API
  const refreshAdminStatus = useCallback(async () => {
    try {
      if (!currentUser) {
        setIsAdmin(false)
        return
      }

      const token = await currentUser.getIdToken()
      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }, [currentUser])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user ?? null)

      if (user) {
        const tokenResult = await user.getIdTokenResult()
        const token = tokenResult.token
        const refreshToken = user.refreshToken
        const claims = tokenResult.claims as CustomClaims

        setCustomClaims(claims ?? null)

        if (token && refreshToken) {
          await setToken({ token, refreshToken })
        }
      } else {
        await removeToken()
        setIsAdmin(false) // Clear admin status when logged out
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Separate useEffect for checking admin status when user changes
  useEffect(() => {
    if (currentUser) {
      refreshAdminStatus()
      
      // Set up periodic admin status check (every 60 seconds)
      const adminStatusInterval = setInterval(() => {
        refreshAdminStatus()
      }, 60000) // Check every minute
      
      return () => clearInterval(adminStatusInterval)
    }
  }, [currentUser, refreshAdminStatus])

  const logout = async () => {
    await auth.signOut()
  }

  // -------------------------------
  // UPDATED: loginWithGoogle
  // -------------------------------
  const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  if (!user) throw new Error("No user returned from Google login")

  // Call server action to create Firestore document if missing
  await registerGoogleUser({
    uid: user.uid,
    email: user.email!,
    emailVerified: user.emailVerified,
    displayName: user.displayName || "",
  })

  // Refresh admin status after registration
  setTimeout(() => refreshAdminStatus(), 1000) // Small delay to ensure document is created

    return user  // <-- critical!
  }

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
    // Admin status will be refreshed automatically by the useEffect
  }

  const value: AuthContextType = {
    currentUser,
    logout,
    loginWithGoogle,
    customClaims,
    loginWithEmail,
    isLoading: loading,
    isAdmin,
    refreshAdminStatus,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
