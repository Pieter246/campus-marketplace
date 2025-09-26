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

        setCustomClaims(claims ?? null)

        if (token && refreshToken) {
          await setToken({ token, refreshToken })
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

    return user  // <-- critical!
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
