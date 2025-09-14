// src/app/api/items/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { initializeApp as initializeClientApp, getApps as getClientApps } from "firebase/app"
import { getAuth as getClientAuth, signInWithCustomToken } from "firebase/auth"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { authenticateRequest } from "@/lib/auth-middleware"

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

// Initialize Client SDK for authenticated operations
const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const adminAuth = getAuth()

// Create client app for server-side authenticated operations
const getAuthenticatedFirestore = async (uid: string) => {
  // Create a custom token for the user
  const customToken = await adminAuth.createCustomToken(uid)
  
  // Initialize client app if not exists
  const clientApp = getClientApps().length === 0 
    ? initializeClientApp(clientConfig, 'server-client') 
    : getClientApps().find(app => app.name === 'server-client')!
  
  const clientAuth = getClientAuth(clientApp)
  const db = getFirestore(clientApp)
  
  // Sign in with the custom token
  await signInWithCustomToken(clientAuth, customToken)
  
  return db
}

interface CreateItemRequest {
  title: string
  description: string
  price: number
  category: string
  condition: 'new' | 'used' | 'fair' | 'poor'
  collectionAddress?: string
  collectionInstructions?: string
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body: CreateItemRequest = await req.json()
    const { 
      title, 
      description, 
      price, 
      category, 
      condition,
      collectionAddress = "",
      collectionInstructions = ""
    } = body

    // Validation
    if (!title || !description || !category || price < 0) {
      return NextResponse.json({ 
        message: "Missing required fields or invalid price" 
      }, { status: 400 })
    }

    // Get authenticated Firestore instance
    const db = await getAuthenticatedFirestore(user.uid)
    
    // Create item document using Client SDK with user authentication
    const itemRef = await addDoc(collection(db, "items"), {
      sellerId: user.uid,
      category,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      condition,
      itemStatus: 'available',
      collectionAddress: collectionAddress.trim(),
      collectionInstructions: collectionInstructions.trim(),
      postedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewsCount: 0
    })

    console.log(`Successfully created item: ${itemRef.id}`)

    return NextResponse.json({
      success: true,
      message: "Item created successfully",
      item: {
        itemId: itemRef.id,
        title,
        price,
        itemStatus: 'available',
        postedAt: new Date().toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Item creation error:", error)
    return NextResponse.json(
      { 
        message: "Failed to create item",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
