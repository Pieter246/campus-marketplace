"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault() // ✅ prevent default form submission
    setError("")
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token)
        router.push("/")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Login to your account</h2>
        <p className="text-gray-600 mb-6 text-center">Welcome back!</p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Button now just uses the `loading` prop */}
          <Button type="submit" className="w-full" loading={loading}>
            LOG IN
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Demo User:<br />
          Email: user@example.com<br />
          Password: password12345
        </div>
      </div>
    </div>
  )
}
