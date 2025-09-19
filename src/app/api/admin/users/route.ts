// src/app/api/admin/users/route.ts
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

// GET - List all users (Admin only)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") // "active", "inactive", "all"
    const sortBy = searchParams.get("sortBy") || "createdAt" // "createdAt", "email", "firstName"
    const sortOrder = searchParams.get("sortOrder") || "desc" // "asc", "desc"

    // Build query
    let query: any = adminDb.collection("users")

    // Filter by status
    if (status === "active") {
      query = query.where("isActive", "==", true)
    } else if (status === "inactive") {
      query = query.where("isActive", "==", false)
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder as "asc" | "desc")

    // Apply pagination
    const offset = (page - 1) * limit
    if (offset > 0) {
      // For pagination, we'd need to implement cursor-based pagination in a real app
      // For now, we'll get all and slice (not efficient for large datasets)
    }

    const usersSnapshot = await query.limit(limit * page).get()
    let users = usersSnapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        userId: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
        emailVerified: data.emailVerified,
        isAdmin: data.isAdmin || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString()
      }
    })

    // Apply search filter (client-side for simplicity)
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter((user: any) => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const paginatedUsers = users.slice(offset, offset + limit)

    // Get total count for pagination
    const totalQuery = await adminDb.collection("users").get()
    const totalUsers = totalQuery.size

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      },
      filters: {
        search,
        status,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error("List users error:", error)
    return NextResponse.json(
      { 
        message: "Failed to list users",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT - Update user status/permissions (Admin only)
export async function PUT(req: NextRequest) {
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

    const body = await req.json()
    const { userId, isActive, isAdmin: makeAdmin, action } = body

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Prevent admin from deactivating themselves
    if (userId === user.uid && isActive === false) {
      return NextResponse.json({ 
        message: "Cannot deactivate your own account" 
      }, { status: 400 })
    }

    // Get user document
    const userDocRef = adminDb.collection("users").doc(userId)
    const userDoc = await userDocRef.get()

    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const updates: any = {
      updatedAt: new Date()
    }

    // Handle different actions
    if (action === "activate" || isActive !== undefined) {
      updates.isActive = isActive !== false
    }

    if (action === "promote" || makeAdmin !== undefined) {
      updates.isAdmin = makeAdmin === true
    }

    if (action === "demote") {
      updates.isAdmin = false
    }

    // Update user document
    await userDocRef.update(updates)

    // Also update Firebase Auth user if deactivating
    if (updates.isActive === false) {
      try {
        await adminAuth.updateUser(userId, { disabled: true })
      } catch (error) {
        console.warn("Failed to disable Firebase Auth user:", error)
      }
    } else if (updates.isActive === true) {
      try {
        await adminAuth.updateUser(userId, { disabled: false })
      } catch (error) {
        console.warn("Failed to enable Firebase Auth user:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      userId,
      updates
    })

  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { 
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
