// src/app/api/profiles/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

// GET user profile
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const userProfileDoc = await getDoc(doc(db, "userProfiles", user.uid))
    
    if (!userProfileDoc.exists()) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    const profileData = userProfileDoc.data()

    // Also get basic user info
    const userDoc = await getDoc(doc(db, "users", user.uid))
    const userData = userDoc.exists() ? userDoc.data() : {}

    return NextResponse.json({
      success: true,
      profile: {
        userId: user.uid,
        ...profileData,
        ...userData,
        createdAt: profileData.createdAt?.toDate?.()?.toISOString(),
        updatedAt: profileData.updatedAt?.toDate?.()?.toISOString()
      }
    })

  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get profile",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      bio,
      preferredContactMethod,
      campusLocation,
      studentNumber,
      yearOfStudy,
      phoneNumber,
      firstName,
      lastName
    } = await req.json()

    // Validate preferredContactMethod
    if (preferredContactMethod && !['email', 'phone', 'message'].includes(preferredContactMethod)) {
      return NextResponse.json({ message: "Invalid contact method" }, { status: 400 })
    }

    // Update user profile
    const profileUpdateData: any = {
      updatedAt: serverTimestamp()
    }

    if (bio !== undefined) profileUpdateData.bio = bio
    if (preferredContactMethod !== undefined) profileUpdateData.preferredContactMethod = preferredContactMethod
    if (campusLocation !== undefined) profileUpdateData.campusLocation = campusLocation
    if (studentNumber !== undefined) profileUpdateData.studentNumber = studentNumber
    if (yearOfStudy !== undefined) profileUpdateData.yearOfStudy = Number(yearOfStudy)

    await updateDoc(doc(db, "userProfiles", user.uid), profileUpdateData)

    // Update basic user info if provided
    if (phoneNumber !== undefined || firstName !== undefined || lastName !== undefined) {
      const userUpdateData: any = {
        updatedAt: serverTimestamp()
      }

      if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber
      if (firstName !== undefined) userUpdateData.firstName = firstName
      if (lastName !== undefined) userUpdateData.lastName = lastName

      await updateDoc(doc(db, "users", user.uid), userUpdateData)
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { 
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
