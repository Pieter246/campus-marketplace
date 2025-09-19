"use client"

import { auth } from "@/firebase/client"
import {
  GoogleAuthProvider,
  ParsedToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  User
} from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { removeToken, setToken } from "./actions"

// Explicit custom claims type
export type CustomClaims = ParsedToken & {
  admin?: boolean
}

export type AuthContextType = {
  currentUser: User | null
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  customClaims: CustomClaims | null
  loginWithEmail: (email: string, password: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [customClaims, setCustomClaims] = useState<CustomClaims | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user ?? null)

      if (user) {
        const tokenResult = await user.getIdTokenResult()
        const token = tokenResult.token
        const refreshToken = user.refreshToken
        const claims = tokenResult.claims as CustomClaims

        console.log("DEBUG - Auth context claims:", {
          userEmail: user.email,
          claims: claims,
          isAdmin: claims?.admin
        });

        // If user should be admin but claims don't show it, force token refresh
        if (!claims?.admin) {
          console.log("Admin claim missing, forcing token refresh...");
          const freshTokenResult = await user.getIdTokenResult(true); // Force refresh
          const freshClaims = freshTokenResult.claims as CustomClaims;
          
          console.log("DEBUG - Fresh claims after refresh:", {
            freshClaims: freshClaims,
            isAdminNow: freshClaims?.admin
          });
          
          setCustomClaims(freshClaims ?? null);
          
          // Update token with fresh one
          if (freshTokenResult.token && refreshToken) {
            await setToken({ token: freshTokenResult.token, refreshToken });
          }
        } else {
          setCustomClaims(claims ?? null);
          
          if (token && refreshToken) {
            await setToken({ token, refreshToken });
          }
        }
      } else {
        await removeToken()
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await auth.signOut()
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const value: AuthContextType = {
    currentUser,
    logout,
    loginWithGoogle,
    customClaims,
    loginWithEmail,
    isLoading: loading,
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
