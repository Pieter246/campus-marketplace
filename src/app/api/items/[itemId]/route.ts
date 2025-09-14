// src/app/api/items/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

interface UpdateItemRequest {
  title?: string
  description?: string
  price?: number
  category?: string
  condition?: 'new' | 'used' | 'fair' | 'poor'
  itemStatus?: 'available' | 'sold' | 'reserved' | 'inactive'
  collectionAddress?: string
  collectionInstructions?: string
}

// GET single item
export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params

    // Get item document
    const itemDocRef = doc(db, "items", itemId)
    const itemDoc = await getDoc(itemDocRef)

    if (!itemDoc.exists()) {
      return NextResponse.json({ 
        message: "Item not found" 
      }, { status: 404 })
    }

    const itemData = itemDoc.data()

    return NextResponse.json({
      success: true,
      item: {
        itemId: itemDoc.id,
        ...itemData,
        postedAt: itemData.postedAt?.toDate?.()?.toISOString(),
        updatedAt: itemData.updatedAt?.toDate?.()?.toISOString()
      }
    })

  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get item",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// UPDATE item
export async function PUT(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { itemId } = params
    const body: UpdateItemRequest = await req.json()

    // Check if item exists and user owns it
    const itemDocRef = doc(db, "items", itemId)
    const itemDoc = await getDoc(itemDocRef)

    if (!itemDoc.exists()) {
      return NextResponse.json({ 
        message: "Item not found" 
      }, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.sellerId !== user.uid) {
      return NextResponse.json({ 
        message: "Forbidden: You can only edit your own items" 
      }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = { updatedAt: serverTimestamp() }

    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }
    if (body.description !== undefined) {
      updateData.description = body.description.trim()
    }
    if (body.price !== undefined) {
      updateData.price = Number(body.price)
    }
    if (body.category !== undefined) {
      updateData.category = body.category
    }
    if (body.condition !== undefined) {
      updateData.condition = body.condition
    }
    if (body.itemStatus !== undefined) {
      updateData.itemStatus = body.itemStatus
    }
    if (body.collectionAddress !== undefined) {
      updateData.collectionAddress = body.collectionAddress.trim()
    }
    if (body.collectionInstructions !== undefined) {
      updateData.collectionInstructions = body.collectionInstructions.trim()
    }

    // Update item document
    await updateDoc(itemDocRef, updateData)

    console.log(`Successfully updated item: ${itemId}`)

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
    })

  } catch (error) {
    console.error("Item update error:", error)
    return NextResponse.json(
      { 
        message: "Failed to update item",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// DELETE item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { itemId } = params

    // Check if item exists and user owns it
    const itemDocRef = doc(db, "items", itemId)
    const itemDoc = await getDoc(itemDocRef)

    if (!itemDoc.exists()) {
      return NextResponse.json({ 
        message: "Item not found" 
      }, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.sellerId !== user.uid) {
      return NextResponse.json({ 
        message: "Forbidden: You can only delete your own items" 
      }, { status: 403 })
    }

    // Delete item document
    await deleteDoc(itemDocRef)

    console.log(`Successfully deleted item: ${itemId}`)

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
      itemId
    })

  } catch (error) {
    console.error("Item deletion error:", error)
    return NextResponse.json(
      { 
        message: "Failed to delete item",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
