// src/app/api/cart/[cartItemId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

// DELETE cart item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { cartItemId } = params

    // Check if cart item exists and belongs to user
    const cartItemDoc = await getDoc(doc(db, "cartItems", cartItemId))
    if (!cartItemDoc.exists()) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 })
    }

    const cartItemData = cartItemDoc.data()
    if (cartItemData.cartId !== user.uid) {
      return NextResponse.json({ message: "Forbidden: Can only remove items from your own cart" }, { status: 403 })
    }

    // Delete cart item
    await deleteDoc(doc(db, "cartItems", cartItemId))

    return NextResponse.json({
      success: true,
      message: "Item removed from cart"
    })

  } catch (error) {
    console.error("Remove from cart error:", error)
    return NextResponse.json(
      { 
        message: "Failed to remove item from cart",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT - Update cart item quantity
export async function PUT(
  req: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { cartItemId } = params
    const { quantity } = await req.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json({ message: "Valid quantity is required" }, { status: 400 })
    }

    // Check if cart item exists and belongs to user
    const cartItemDoc = await getDoc(doc(db, "cartItems", cartItemId))
    if (!cartItemDoc.exists()) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 })
    }

    const cartItemData = cartItemDoc.data()
    if (cartItemData.cartId !== user.uid) {
      return NextResponse.json({ message: "Forbidden: Can only update items in your own cart" }, { status: 403 })
    }

    // Update quantity
    await updateDoc(doc(db, "cartItems", cartItemId), {
      quantity: Number(quantity)
    })

    return NextResponse.json({
      success: true,
      message: "Cart item quantity updated"
    })

  } catch (error) {
    console.error("Update cart item error:", error)
    return NextResponse.json(
      { 
        message: "Failed to update cart item",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
