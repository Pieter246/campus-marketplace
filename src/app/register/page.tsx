"use client"

import Button from "@/components/ui/Button"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function registerForm(){
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // Firebase Email/Password Registration
    async function handleEmailRegister(e: React.FormEvent) {
        e.preventDefault()
        setError("")
    
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return
        }
    
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters")
          return
        }
    
        setLoading(true)
    
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password
          )
          const user = userCredential.user
          
          // Get Firebase ID token
          const idToken = await user.getIdToken()
          
          // Sync user with Firestore database
          await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: null,
              emailVerified: user.emailVerified
            }),
          })
    
          router.push("/examples") //Redirect to home page

        } catch (error: any) {
          console.error("Registration error:", error)
          setError(error.message || "Registration failed")
        } finally {
          setLoading(false)
        }
    }

    // Google OAuth Registration
    async function handleGoogleRegister() {
        setError("")
        setLoading(true)
        
        try {
          //Sign in with Google authenticator
          const provider = new GoogleAuthProvider()
          const userCredential = await signInWithPopup(auth, provider)
          const user = userCredential.user
          
          // Get Firebase ID token
          const idToken = await user.getIdToken()
          
          // Sync user with Firestore database
          await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL
            }),
          })
    
          router.push("/examples") //Redirect to home page

        } catch (error: any) {
          console.error("Google registration error:", error)
          setError(error.message || "Google registration failed")
        } finally {
          setLoading(false)
        }
    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Create your account</h2>
        <p className="text-gray-600 mb-6 text-center">Join the campus marketplace!</p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Google Registration Button */}
        <Button 
          onClick={handleGoogleRegister}
          className="w-full mb-4 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          loading={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            CREATE ACCOUNT
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}