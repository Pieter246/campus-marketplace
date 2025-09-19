// src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore"
import { authenticateRequest, firestore } from "@/firebase/server"

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user document
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        message: "User not found" 
      }, { status: 404 })
    }

    // Get user profile document
    const profileDocRef = doc(db, "userProfiles", user.uid)
    const profileDoc = await getDoc(profileDocRef)

    if (!profileDoc.exists()) {
      return NextResponse.json({ 
        message: "User profile not found" 
      }, { status: 404 })
    }

    const userData = userDoc.data()
    const profileData = profileDoc.data()

    // Combine user and profile data
    const completeProfile = {
      // User data
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      isActive: userData.isActive,
      emailVerified: userData.emailVerified,
      isAdmin: userData.isAdmin || false,
      
      // Profile data
      profilePictureUrl: profileData.profilePictureUrl,
      bio: profileData.bio,
      preferredContactMethod: profileData.preferredContactMethod,
      campusLocation: profileData.campusLocation,
      studentNumber: profileData.studentNumber,
      yearOfStudy: profileData.yearOfStudy,
      
      // Timestamps
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    }

    return NextResponse.json({
      success: true,
      user: completeProfile
    })

  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get user profile",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
