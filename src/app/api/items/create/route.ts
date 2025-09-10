// src/app/api/items/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

interface CreateItemRequest {
  title: string
  description: string
  price: number
  categoryId: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  collectionAddress?: string
  collectionInstructions?: string
}

export async function POST(req: NextRequest) {
  try {
    //Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body: CreateItemRequest = await req.json()
    const { 
      title, 
      description, 
      price, 
      categoryId, 
      condition,
      collectionAddress = "",
      collectionInstructions = ""
    } = body

    // Validation
    if (!title || !description || !categoryId || price < 0) {
      return NextResponse.json({ 
        message: "Missing required fields or invalid price" 
      }, { status: 400 })
    }

    const now = serverTimestamp()

    // Create item document
    const itemRef = await addDoc(collection(db, "items"), {
      sellerId: user.uid,
      categoryId,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      condition,
      itemStatus: 'available',
      collectionAddress: collectionAddress.trim(),
      collectionInstructions: collectionInstructions.trim(),
      postedAt: now,
      updatedAt: now,
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
