// src/app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

// GET order details
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = params

    // Get order document
    const orderDoc = await getDoc(doc(db, "orders", orderId))
    if (!orderDoc.exists()) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()

    // Check if user has access to this order
    if (orderData.buyerId !== user.uid && orderData.sellerId !== user.uid) {
      return NextResponse.json({ message: "Forbidden: Cannot access this order" }, { status: 403 })
    }

    // Get order items
    const orderItemsQuery = query(
      collection(db, "orderItems"),
      where("orderId", "==", orderId)
    )
    const orderItemsSnapshot = await getDocs(orderItemsQuery)
    
    const orderItems = []
    for (const orderItemDoc of orderItemsSnapshot.docs) {
      const orderItemData = orderItemDoc.data()
      
      // Get item details
      const itemDoc = await getDoc(doc(db, "items", orderItemData.itemId))
      const itemData = itemDoc.exists() ? itemDoc.data() : null

      orderItems.push({
        orderItemId: orderItemDoc.id,
        ...orderItemData,
        item: itemData ? {
          itemId: orderItemData.itemId,
          ...itemData,
          postedAt: itemData.postedAt?.toDate?.()?.toISOString(),
          updatedAt: itemData.updatedAt?.toDate?.()?.toISOString()
        } : null
      })
    }

    // Get buyer and seller info
    const [buyerDoc, sellerDoc] = await Promise.all([
      getDoc(doc(db, "users", orderData.buyerId)),
      getDoc(doc(db, "users", orderData.sellerId))
    ])

    const buyer = buyerDoc.exists() ? buyerDoc.data() : null
    const seller = sellerDoc.exists() ? sellerDoc.data() : null

    return NextResponse.json({
      success: true,
      order: {
        orderId,
        ...orderData,
        orderDate: orderData.orderDate?.toDate?.()?.toISOString(),
        completionDate: orderData.completionDate?.toDate?.()?.toISOString(),
        buyer,
        seller,
        items: orderItems
      }
    })

  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get order",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT - Update order status
export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = params
    const { orderStatus, notes } = await req.json()

    if (!orderStatus || !['pending', 'confirmed', 'completed', 'cancelled'].includes(orderStatus)) {
      return NextResponse.json({ message: "Valid order status is required" }, { status: 400 })
    }

    // Get order document
    const orderDoc = await getDoc(doc(db, "orders", orderId))
    if (!orderDoc.exists()) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()

    // Check permissions - only seller can confirm/complete, only buyer can cancel
    if (orderStatus === 'confirmed' || orderStatus === 'completed') {
      if (orderData.sellerId !== user.uid) {
        return NextResponse.json({ message: "Only seller can confirm or complete orders" }, { status: 403 })
      }
    } else if (orderStatus === 'cancelled') {
      if (orderData.buyerId !== user.uid && orderData.sellerId !== user.uid) {
        return NextResponse.json({ message: "Only buyer or seller can cancel orders" }, { status: 403 })
      }
    }

    // Prepare update data
    const updateData: any = {
      orderStatus,
      updatedAt: new Date()
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (orderStatus === 'completed') {
      updateData.completionDate = new Date()
    }

    // Update order
    await updateDoc(doc(db, "orders", orderId), updateData)

    // If order is cancelled, make items available again
    if (orderStatus === 'cancelled') {
      const orderItemsQuery = query(
        collection(db, "orderItems"),
        where("orderId", "==", orderId)
      )
      const orderItemsSnapshot = await getDocs(orderItemsQuery)
      
      for (const orderItemDoc of orderItemsSnapshot.docs) {
        const orderItemData = orderItemDoc.data()
        await updateDoc(doc(db, "items", orderItemData.itemId), {
          itemStatus: 'available'
        })
      }
    }

    // If order is completed, mark items as sold
    if (orderStatus === 'completed') {
      const orderItemsQuery = query(
        collection(db, "orderItems"),
        where("orderId", "==", orderId)
      )
      const orderItemsSnapshot = await getDocs(orderItemsQuery)
      
      for (const orderItemDoc of orderItemsSnapshot.docs) {
        const orderItemData = orderItemDoc.data()
        await updateDoc(doc(db, "items", orderItemData.itemId), {
          itemStatus: 'sold'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully"
    })

  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json(
      { 
        message: "Failed to update order",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
