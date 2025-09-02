"use client"

import Link from "next/link"
import { useAuth } from "@/app/auth-hook"
import { Button } from "@/components/ui/Button"


export default function ExamplesIndex() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Campus Marketplace Auth Examples
        </h1>

        {user ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">You're logged in!</h2>
              <p className="text-gray-600 mb-4">
                Email: {user.email}
              </p>
              <p className="text-gray-600 mb-6">
                UID: {user.uid}
              </p>
              <Button onClick={logout} className="bg-red-600 hover:bg-red-700">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Not logged in</h2>
              <p className="text-gray-600 mb-6">
                Try the examples below to test authentication
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Login Example */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-3">Login Example</h3>
            <p className="text-gray-600 mb-4">
              Firebase Auth with email/password and Google OAuth
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>• Email/password authentication</li>
              <li>• Google OAuth integration</li>
              <li>• Database sync via /api/auth/sync-user</li>
              <li>• Error handling</li>
            </ul>
            <Link href="/examples/login">
              <Button className="w-full">
                View Login Example
              </Button>
            </Link>
          </div>

          {/* Register Example */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-3">Register Example</h3>
            <p className="text-gray-600 mb-4">
              Firebase Auth registration with validation
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>• Email/password registration</li>
              <li>• Google OAuth registration</li>
              <li>• Password confirmation</li>
              <li>• Form validation</li>
            </ul>
            <Link href="/examples/register">
              <Button className="w-full">
                View Register Example
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Start Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h3 className="text-xl font-bold mb-4">Quick Start</h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold">1. Start the dev server:</h4>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run dev</code>
            </div>
            <div>
              <h4 className="font-semibold">2. Visit these URLs:</h4>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/examples</code> - This page</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/examples/login</code> - Login example</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/examples/register</code> - Register example</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">3. Files to copy:</h4>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">examples/login.tsx</code> - Login component</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">examples/register.tsx</code> - Register component</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">examples/auth-hook.ts</code> - Auth state hook</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
