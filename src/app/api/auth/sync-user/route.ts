// src/app/api/auth/sync-user/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { verifyIdToken } from "@/lib/auth-middleware"

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase ID token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]
    const decodedToken = await verifyIdToken(idToken)
    
    if (!decodedToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const body = await req.json()
    const { uid, email, displayName, emailVerified, photoURL } = body

    // Verify the UID matches the token
    if (uid !== decodedToken.uid) {
      return NextResponse.json({ message: "UID mismatch" }, { status: 401 })
    }

    // Check if user already exists in Firestore
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)

    const now = serverTimestamp()

    if (!userDoc.exists()) {
      // Create new user document
      const [firstName, ...lastNameParts] = (displayName || "").split(" ")
      
      await setDoc(userDocRef, {
        userId: uid,
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        email: email || "",
        phoneNumber: "", // Will be filled later
        createdAt: now,
        updatedAt: now,
        isActive: true,
        emailVerified: emailVerified || false,
        isAdmin: false // New users are not admins by default
      })

      // Create user profile document
      await setDoc(doc(db, "userProfiles", uid), {
        userId: uid,
        profilePictureUrl: photoURL || null,
        bio: "",
        preferredContactMethod: "email",
        campusLocation: "",
        studentNumber: "",
        yearOfStudy: 1,
        createdAt: now,
        updatedAt: now
      })

      // Create user cart
      await setDoc(doc(db, "carts", uid), {
        cartId: uid,
        buyerId: uid,
        createdAt: now,
        updatedAt: now
      })

      console.log(`Created new user: ${uid}`)
    } else {
      // Update existing user
      const userData = userDoc.data()
      await setDoc(userDocRef, {
        ...userData,
        email: email || userData.email,
        emailVerified: emailVerified || userData.emailVerified,
        updatedAt: now
      }, { merge: true })

      // Update profile picture if from Google
      if (photoURL && photoURL !== userData.profilePictureUrl) {
        await setDoc(doc(db, "userProfiles", uid), {
          profilePictureUrl: photoURL,
          updatedAt: now
        }, { merge: true })
      }

      console.log(`Updated existing user: ${uid}`)
    }

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email,
        displayName,
        emailVerified
      }
    })

  } catch (error) {
    console.error("User sync error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
