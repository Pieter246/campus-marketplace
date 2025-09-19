import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, firestore } from "@/firebase/server"

export async function PUT(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        message: "User not found" 
      }, { status: 404 })
    }

    const userData = userDoc.data()
    
    if (!userData.isActive) {
      return NextResponse.json({ 
        message: "User is already deactivated" 
      }, { status: 400 })
    }

    // Deactivate user
    await updateDoc(userDocRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    })

    console.log(`Successfully deactivated user: ${user.uid}`)

    return NextResponse.json({
      success: true,
      message: "User account deactivated successfully",
      userId: user.uid
    })

  } catch (error) {
    console.error("User deactivation error:", error)
    return NextResponse.json(
      { 
        message: "Failed to deactivate user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Reactivate user account
export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        message: "User not found" 
      }, { status: 404 })
    }

    const userData = userDoc.data()
    
    if (userData.isActive) {
      return NextResponse.json({ 
        message: "User is already active" 
      }, { status: 400 })
    }

    // Reactivate user
    await updateDoc(userDocRef, {
      isActive: true,
      updatedAt: serverTimestamp()
    })

    console.log(`Successfully reactivated user: ${user.uid}`)

    return NextResponse.json({
      success: true,
      message: "User account reactivated successfully",
      userId: user.uid
    })

  } catch (error) {
    console.error("User reactivation error:", error)
    return NextResponse.json(
      { 
        message: "Failed to reactivate user",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
