// src/app/api/users/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/firebase/server"

interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  campusLocation?: string
  studentNumber?: string
  yearOfStudy?: number
  bio?: string
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp'
  isAdmin?: boolean
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body: CreateUserRequest = await req.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber = "",
      campusLocation = "",
      studentNumber = "",
      yearOfStudy = 1,
      bio = "",
      preferredContactMethod = "email",
      isAdmin = false
    } = body

    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ 
        message: "Missing required fields: firstName, lastName, email" 
      }, { status: 400 })
    }

    // Check if user already exists in Firestore
    const userDocRef = doc(db, "users", user.uid)
    const existingUser = await getDoc(userDocRef)

    if (existingUser.exists()) {
      return NextResponse.json({ 
        message: "User already exists",
        userId: user.uid 
      }, { status: 409 })
    }

    // Check if current user is admin (for creating admin users)
    const currentUserDoc = await getDoc(doc(db, "users", user.uid))
    const isCurrentUserAdmin = currentUserDoc.exists() ? (currentUserDoc.data().isAdmin || false) : false

    // Only admins can create admin users
    if (isAdmin && !isCurrentUserAdmin) {
      return NextResponse.json({ 
        message: "Unauthorized: Only admins can create admin users" 
      }, { status: 403 })
    }

    const now = serverTimestamp()

    // Create user document in 'users' collection
    await setDoc(userDocRef, {
      userId: user.uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      createdAt: now,
      updatedAt: now,
      isActive: true,
      emailVerified: user.email_verified || false,
      isAdmin: isAdmin
    })

    // Create user profile document in 'userProfiles' collection
    await setDoc(doc(db, "userProfiles", user.uid), {
      userId: user.uid,
      profilePictureUrl: null,
      bio: bio.trim(),
      preferredContactMethod,
      campusLocation: campusLocation.trim(),
      studentNumber: studentNumber.trim(),
      yearOfStudy: Math.max(1, Math.min(10, yearOfStudy)), // Ensure between 1-10
      createdAt: now,
      updatedAt: now
    })

    // Create user cart in 'carts' collection
    await setDoc(doc(db, "carts", user.uid), {
      cartId: user.uid,
      buyerId: user.uid,
      createdAt: now,
      updatedAt: now
    })

    console.log(`Successfully created user: ${user.uid}`)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        userId: user.uid,
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error("User creation error:", error)
    return NextResponse.json(
      { 
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET method to check if user exists
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({
        exists: false,
        message: "User not found in database"
      }, { status: 404 })
    }

    const userData = userDoc.data()
    
    return NextResponse.json({
      exists: true,
      user: {
        userId: userData.userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified,
        isAdmin: userData.isAdmin || false,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    })

  } catch (error) {
    console.error("User lookup error:", error)
    return NextResponse.json(
      { 
        message: "Failed to lookup user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
