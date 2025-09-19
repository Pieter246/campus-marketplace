// src/app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { authenticateRequest } from "@/firebase/server"

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

// Helper function to check if user is admin
async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get()
    return userDoc.exists && userDoc.data()?.isAdmin === true
  } catch (error) {
    return false
  }
}

// GET - Get specific user details (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check admin permission
    const isAdmin = await checkAdminPermission(user.uid)
    if (!isAdmin) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { userId } = params

    // Get user document
    const userDoc = await adminDb.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get user profile
    const profileDoc = await adminDb.collection("userProfiles").doc(userId).get()

    // Get Firebase Auth user info
    let authUser = null
    try {
      authUser = await adminAuth.getUser(userId)
    } catch (error) {
      console.warn("Failed to get Firebase Auth user:", error)
    }

    // Get user's items count
    const itemsQuery = await adminDb.collection("items")
      .where("sellerId", "==", userId)
      .get()

    // Get user's orders count (as buyer)
    const ordersQuery = await adminDb.collection("orders")
      .where("buyerId", "==", userId)
      .get()

    // Get user's messages count
    const sentMessagesQuery = await adminDb.collection("messages")
      .where("senderId", "==", userId)
      .get()
    
    const receivedMessagesQuery = await adminDb.collection("messages")
      .where("receiverId", "==", userId)
      .get()

    const userData = userDoc.data()
    const profileData = profileDoc.exists ? profileDoc.data() : {}

    const userDetails = {
      // Basic user info
      userId: userData?.userId,
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      email: userData?.email,
      phoneNumber: userData?.phoneNumber,
      isActive: userData?.isActive,
      emailVerified: userData?.emailVerified,
      isAdmin: userData?.isAdmin || false,
      
      // Profile info
      profilePictureUrl: profileData?.profilePictureUrl,
      bio: profileData?.bio,
      preferredContactMethod: profileData?.preferredContactMethod,
      campusLocation: profileData?.campusLocation,
      studentNumber: profileData?.studentNumber,
      yearOfStudy: profileData?.yearOfStudy,
      
      // Firebase Auth info
      firebaseAuth: authUser ? {
        emailVerified: authUser.emailVerified,
        disabled: authUser.disabled,
        lastSignInTime: authUser.metadata.lastSignInTime,
        creationTime: authUser.metadata.creationTime,
        providerData: authUser.providerData
      } : null,
      
      // Activity stats
      stats: {
        itemsListed: itemsQuery.size,
        ordersMade: ordersQuery.size,
        messagesSent: sentMessagesQuery.size,
        messagesReceived: receivedMessagesQuery.size
      },
      
      // Timestamps
      createdAt: userData?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: userData?.updatedAt?.toDate?.()?.toISOString(),
      lastLoginAt: userData?.lastLoginAt?.toDate?.()?.toISOString()
    }

    return NextResponse.json({
      success: true,
      user: userDetails
    })

  } catch (error) {
    console.error("Get user details error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get user details",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete user account (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check admin permission
    const isAdmin = await checkAdminPermission(user.uid)
    if (!isAdmin) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { userId } = params

    // Prevent admin from deleting themselves
    if (userId === user.uid) {
      return NextResponse.json({ 
        message: "Cannot delete your own account" 
      }, { status: 400 })
    }

    // Check if user exists
    const userDoc = await adminDb.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Start batch operations
    const batch = adminDb.batch()

    // Delete user document
    batch.delete(adminDb.collection("users").doc(userId))

    // Delete user profile
    batch.delete(adminDb.collection("userProfiles").doc(userId))

    // Note: In a real application, you might want to:
    // 1. Archive the user data instead of deleting
    // 2. Handle related data (items, orders, messages) appropriately
    // 3. Send notifications to affected users
    // 4. Clean up associated files/images

    // Execute batch
    await batch.commit()

    // Delete Firebase Auth user
    try {
      await adminAuth.deleteUser(userId)
    } catch (error) {
      console.warn("Failed to delete Firebase Auth user:", error)
      // Continue with success even if Firebase Auth deletion fails
    }

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully",
      userId
    })

  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { 
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
