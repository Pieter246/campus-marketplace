// src/app/api/cart/route.ts
/*import { NextRequest, NextResponse } from "next/server"
import { collection, doc, getDoc, getDocs, query, where, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

// GET user's cart items
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get cart items for this user
    const cartItemsQuery = query(
      collection(db, "cartItems"),
      where("cartId", "==", user.uid)
    )

    const cartItemsSnapshot = await getDocs(cartItemsQuery)
    
    const cartItems = []
    
    // For each cart item, get the item details
    for (const cartItemDoc of cartItemsSnapshot.docs) {
      const cartItemData = cartItemDoc.data()
      
      // Get the actual item details
      const itemDoc = await getDoc(doc(db, "items", cartItemData.itemId))
      
      if (itemDoc.exists()) {
        const itemData = itemDoc.data()
        
        cartItems.push({
          cartItemId: cartItemDoc.id,
          cartId: cartItemData.cartId,
          itemId: cartItemData.itemId,
          quantity: cartItemData.quantity,
          addedAt: cartItemData.addedAt?.toDate?.()?.toISOString(),
          item: {
            itemId: itemDoc.id,
            ...itemData,
            postedAt: itemData.postedAt?.toDate?.()?.toISOString(),
            updatedAt: itemData.updatedAt?.toDate?.()?.toISOString()
          }
        })
      }
    }

    // Calculate totals
    const cartTotal = cartItems.reduce((total, item) => {
      const price = (item.item as any).price || 0
      return total + (price * item.quantity)
    }, 0)

    return NextResponse.json({
      success: true,
      cartItems,
      cartTotal,
      itemCount: cartItems.length
    })

  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get cart",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { itemId, quantity = 1 } = await req.json()

    if (!itemId) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 })
    }

    // Check if item exists and is available
    const itemDoc = await getDoc(doc(db, "items", itemId))
    if (!itemDoc.exists()) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.itemStatus !== 'available') {
      return NextResponse.json({ message: "Item is not available" }, { status: 400 })
    }

    // Can't add your own item to cart
    if (itemData.sellerId === user.uid) {
      return NextResponse.json({ message: "Cannot add your own item to cart" }, { status: 400 })
    }

    // Check if item is already in cart
    const existingCartItemQuery = query(
      collection(db, "cartItems"),
      where("cartId", "==", user.uid),
      where("itemId", "==", itemId)
    )
    
    const existingCartItemSnapshot = await getDocs(existingCartItemQuery)
    
    if (!existingCartItemSnapshot.empty) {
      return NextResponse.json({ message: "Item already in cart" }, { status: 400 })
    }

    // Add item to cart
    const cartItemRef = await addDoc(collection(db, "cartItems"), {
      cartId: user.uid,
      itemId,
      quantity: Number(quantity),
      addedAt: serverTimestamp()
    })

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cartItemId: cartItemRef.id
    })

  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json(
      { 
        message: "Failed to add item to cart",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}*/
