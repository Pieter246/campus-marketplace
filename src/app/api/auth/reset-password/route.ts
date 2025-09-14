// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

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

const adminAuth = getAuth()
const adminDb = getFirestore()

interface ResetPasswordRequest {
  email: string
}

interface ConfirmResetRequest {
  token: string
  newPassword: string
}

// POST - Request password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, token, newPassword } = body

    // If token and newPassword provided, confirm reset
    if (token && newPassword) {
      return handleConfirmReset({ token, newPassword })
    }

    // Otherwise, request reset
    if (!email) {
      return NextResponse.json({ 
        message: "Email is required" 
      }, { status: 400 })
    }

    return handleRequestReset({ email })

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { 
        message: "Failed to process password reset",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Handle password reset request
async function handleRequestReset({ email }: ResetPasswordRequest) {
  try {
    // Verify user exists
    let userRecord
    try {
      userRecord = await adminAuth.getUserByEmail(email)
    } catch (error) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      })
    }

    // Generate password reset link (valid for 1 hour)
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
      handleCodeInApp: false
    })

    // Store reset request in database for tracking
    await adminDb.collection("passwordResets").add({
      userId: userRecord.uid,
      email: email,
      requestedAt: new Date(),
      used: false,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    })

    // In a real app, you would send the reset link via email
    // For now, we'll just return success (the link would be in resetLink)
    console.log(`Password reset link for ${email}: ${resetLink}`)

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      // In development, you might want to return the link
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    })

  } catch (error) {
    console.error("Request reset error:", error)
    throw error
  }
}

// Handle password reset confirmation
async function handleConfirmReset({ token, newPassword }: ConfirmResetRequest) {
  try {
    if (!token || !newPassword) {
      return NextResponse.json({ 
        message: "Token and new password are required" 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        message: "Password must be at least 6 characters" 
      }, { status: 400 })
    }

    // For Firebase Admin SDK, we need to use client-side methods for password reset confirmation
    // This endpoint would typically work with the client-side Firebase Auth
    // Admin SDK doesn't have direct password reset confirmation methods
    
    // In a real implementation, you would:
    // 1. Validate the token format
    // 2. Check if it exists in your password reset tracking
    // 3. Use Firebase Client SDK on frontend for actual password reset
    
    return NextResponse.json({ 
      message: "Password reset confirmation should be handled on client-side with Firebase Auth" 
    }, { status: 400 })

  } catch (error: any) {
    console.error("Confirm reset error:", error)
    
    return NextResponse.json({ 
      message: "Invalid or expired reset token" 
    }, { status: 400 })
  }
  }
}
