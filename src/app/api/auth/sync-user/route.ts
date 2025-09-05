// src/app/api/auth/sync-user/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth, firestore } from "firebase-admin"
import { initializeApp, getApps, cert } from "firebase-admin/app"

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  // Check if we have the required environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
      console.log('Firebase Admin SDK initialized successfully in sync-user')
    } catch (error) {
      console.error("Firebase Admin SDK initialization failed:", error)
    }
  } else {
    console.error("Firebase Admin SDK environment variables not configured")
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Sync-user API called')

    // Verify Firebase ID token using Admin SDK
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('No authorization header')
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]
    console.log('Token received, length:', idToken.length)

    // Check if Admin SDK is initialized
    if (!getApps().length) {
      console.log('Firebase Admin SDK not initialized')
      return NextResponse.json({
        message: "Server configuration error: Firebase Admin SDK not initialized"
      }, { status: 500 })
    }

    console.log('Verifying token...')
    const decodedToken = await auth().verifyIdToken(idToken)
    console.log('Token verified successfully for user:', decodedToken.uid)

    const body = await req.json()
    const { uid, email, displayName, emailVerified, photoURL } = body
    console.log('Request body:', { uid, email, displayName, emailVerified: !!emailVerified, photoURL: !!photoURL })

    // Verify the UID matches the token
    if (uid !== decodedToken.uid) {
      console.log('UID mismatch:', uid, 'vs', decodedToken.uid)
      return NextResponse.json({ message: "UID mismatch" }, { status: 401 })
    }

    // Check if user already exists in Firestore
    const userDocRef = firestore().doc(`users/${uid}`)
    const userDoc = await userDocRef.get()

    const now = new Date()

    if (!userDoc.exists) {
      console.log('Creating new user document...')
      // Create new user document
      const [firstName, ...lastNameParts] = (displayName || "").split(" ")

      try {
        // Use Promise.all for parallel writes to reduce timeout risk
        await Promise.all([
          // Create user document
          userDocRef.set({
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
          }),

          // Create user profile document
          firestore().doc(`userProfiles/${uid}`).set({
            userId: uid,
            profilePictureUrl: photoURL || null,
            bio: "",
            preferredContactMethod: "email",
            campusLocation: "",
            studentNumber: "",
            yearOfStudy: 1,
            createdAt: now,
            updatedAt: now
          }),

          // Create user cart
          firestore().doc(`carts/${uid}`).set({
            cartId: uid,
            buyerId: uid,
            createdAt: now,
            updatedAt: now
          })
        ])

        console.log('Successfully created all user documents:', uid)
      } catch (firestoreError) {
        console.error('Firestore write error:', firestoreError)
        throw new Error(`Failed to create user documents: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`)
      }
    } else {
      console.log('Updating existing user...')
      // Update existing user
      const userData = userDoc.data()
      if (!userData) {
        console.log('User document exists but data is null, skipping update')
      } else {
        await userDocRef.set({
          ...userData,
          email: email || userData.email,
          emailVerified: emailVerified || userData.emailVerified,
          updatedAt: now
        }, { merge: true })

        // Update profile picture if from Google
        if (photoURL && photoURL !== userData.profilePictureUrl) {
          await firestore().doc(`userProfiles/${uid}`).set({
            profilePictureUrl: photoURL,
            updatedAt: now
          }, { merge: true })
        }
      }

      console.log('Successfully updated existing user:', uid)
    }

    return NextResponse.json({
      success: true,
      message: "User synced successfully",
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
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
