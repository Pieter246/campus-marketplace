// src/app/api/users/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { authenticateRequest, firestore } from "@/firebase/server"

interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  campusLocation?: string
  studentNumber?: string
  yearOfStudy?: number
  bio?: string
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp'
  profilePictureUrl?: string
  isAdmin?: boolean
}

export async function PUT(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body: UpdateUserRequest = await req.json()

    // Check if user exists
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        message: "User not found" 
      }, { status: 404 })
    }

    const currentUserData = userDoc.data()
    const isCurrentUserAdmin = currentUserData.isAdmin || false

    const now = serverTimestamp()
    const updateData: any = { updatedAt: now }
    const profileUpdateData: any = { updatedAt: now }

    // Prepare user document updates
    if (body.firstName !== undefined) {
      updateData.firstName = body.firstName.trim()
    }
    if (body.lastName !== undefined) {
      updateData.lastName = body.lastName.trim()
    }
    if (body.phoneNumber !== undefined) {
      updateData.phoneNumber = body.phoneNumber.trim()
    }
    if (body.isAdmin !== undefined) {
      // Only admins can update the isAdmin field
      if (!isCurrentUserAdmin) {
        return NextResponse.json({ 
          message: "Unauthorized: Only admins can update admin status" 
        }, { status: 403 })
      }
      updateData.isAdmin = body.isAdmin
    }

    // Prepare profile document updates
    if (body.campusLocation !== undefined) {
      profileUpdateData.campusLocation = body.campusLocation.trim()
    }
    if (body.studentNumber !== undefined) {
      profileUpdateData.studentNumber = body.studentNumber.trim()
    }
    if (body.yearOfStudy !== undefined) {
      profileUpdateData.yearOfStudy = Math.max(1, Math.min(10, body.yearOfStudy))
    }
    if (body.bio !== undefined) {
      profileUpdateData.bio = body.bio.trim()
    }
    if (body.preferredContactMethod !== undefined) {
      profileUpdateData.preferredContactMethod = body.preferredContactMethod
    }
    if (body.profilePictureUrl !== undefined) {
      profileUpdateData.profilePictureUrl = body.profilePictureUrl
    }

    // Update user document if there are changes
    if (Object.keys(updateData).length > 1) { // More than just updatedAt
      await updateDoc(userDocRef, updateData)
    }

    // Update profile document if there are changes
    if (Object.keys(profileUpdateData).length > 1) { // More than just updatedAt
      const profileDocRef = doc(db, "userProfiles", user.uid)
      await updateDoc(profileDocRef, profileUpdateData)
    }

    console.log(`Successfully updated user: ${user.uid}`)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      updatedFields: {
        user: Object.keys(updateData).filter(key => key !== 'updatedAt'),
        profile: Object.keys(profileUpdateData).filter(key => key !== 'updatedAt')
      }
    })

  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json(
      { 
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
