// src/lib/auth-middleware.ts
import { auth } from "firebase-admin"
import { initializeApp, getApps, cert } from "firebase-admin/app"

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

/**
 * Verify Firebase ID Token with 30-minute expiration check
 * @param idToken - Firebase ID token from client
 * @returns Decoded token or null if invalid/expired
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth().verifyIdToken(idToken)
    
    // Check if token is older than 30 minutes
    const now = Math.floor(Date.now() / 1000) // Current time in seconds
    const tokenAge = now - decodedToken.iat // iat = issued at time
    const THIRTY_MINUTES_IN_SECONDS = 30 * 60 // 30 minutes
    
    if (tokenAge > THIRTY_MINUTES_IN_SECONDS) {
      console.log("Token expired: older than 30 minutes")
      return null
    }
    
    return decodedToken
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

/**
 * Middleware to authenticate requests
 * @param req - Request object
 * @returns User data or null if unauthorized
 */
export async function authenticateRequest(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const idToken = authHeader.split("Bearer ")[1]
    const decodedToken = await verifyIdToken(idToken)
    
    return decodedToken
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 * @param req - Request object
 * @returns boolean
 */
export async function isAuthenticated(req: Request): Promise<boolean> {
  const user = await authenticateRequest(req)
  return user !== null
}

/**
 * Get authenticated user ID
 * @param req - Request object
 * @returns User UID or null
 */
export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const user = await authenticateRequest(req)
  return user?.uid || null
}
