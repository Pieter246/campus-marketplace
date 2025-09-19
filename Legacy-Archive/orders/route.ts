// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { collection, doc, addDoc, getDocs, query, where, orderBy, serverTimestamp, getDoc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

// GET user's orders
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // 'buying', 'selling', 'all'

    let ordersQuery

    if (type === 'buying') {
      ordersQuery = query(
        collection(db, "orders"),
        where("buyerId", "==", user.uid),
        orderBy("orderDate", "desc")
      )
    } else if (type === 'selling') {
      ordersQuery = query(
        collection(db, "orders"),
        where("sellerId", "==", user.uid),
        orderBy("orderDate", "desc")
      )
    } else {
      // Get both buying and selling orders
      const buyingQuery = query(
        collection(db, "orders"),
        where("buyerId", "==", user.uid),
        orderBy("orderDate", "desc")
      )
      const sellingQuery = query(
        collection(db, "orders"),
        where("sellerId", "==", user.uid),
        orderBy("orderDate", "desc")
      )

      const [buyingSnapshot, sellingSnapshot] = await Promise.all([
        getDocs(buyingQuery),
        getDocs(sellingQuery)
      ])

      const orders = [
        ...buyingSnapshot.docs.map(doc => ({ ...doc.data(), orderId: doc.id, type: 'buying' })),
        ...sellingSnapshot.docs.map(doc => ({ ...doc.data(), orderId: doc.id, type: 'selling' }))
      ].sort((a: any, b: any) => b.orderDate?.toDate?.()?.getTime() - a.orderDate?.toDate?.()?.getTime())

      return NextResponse.json({
        success: true,
        orders: orders.map((order: any) => ({
          ...order,
          orderDate: order.orderDate?.toDate?.()?.toISOString(),
          completionDate: order.completionDate?.toDate?.()?.toISOString()
        }))
      })
    }

    const ordersSnapshot = await getDocs(ordersQuery)
    const orders = ordersSnapshot.docs.map(doc => ({
      orderId: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate?.()?.toISOString(),
      completionDate: doc.data().completionDate?.toDate?.()?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      orders
    })

  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get orders",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// POST - Create order from cart
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { cartItemIds, collectionAddress, collectionInstructions, notes } = await req.json()

    if (!cartItemIds || cartItemIds.length === 0) {
      return NextResponse.json({ message: "Cart items are required" }, { status: 400 })
    }

    if (!collectionAddress) {
      return NextResponse.json({ message: "Collection address is required" }, { status: 400 })
    }

    const batch = writeBatch(db)
    const orderIds = []

    // Group cart items by seller
    const cartItemsByseller = new Map()

    for (const cartItemId of cartItemIds) {
      const cartItemDoc = await getDoc(doc(db, "cartItems", cartItemId))
      if (!cartItemDoc.exists()) continue

      const cartItemData = cartItemDoc.data()
      if (cartItemData.cartId !== user.uid) continue // Security check

      const itemDoc = await getDoc(doc(db, "items", cartItemData.itemId))
      if (!itemDoc.exists()) continue

      const itemData = itemDoc.data()
      if (itemData.itemStatus !== 'available') continue

      const sellerId = itemData.sellerId
      if (!cartItemsByseller.has(sellerId)) {
        cartItemsByseller.set(sellerId, [])
      }

      cartItemsByseller.get(sellerId).push({
        cartItemId,
        cartItemData,
        itemData: { ...itemData, itemId: cartItemData.itemId }
      })
    }

    // Create separate orders for each seller
    for (const [sellerId, items] of cartItemsByseller.entries()) {
      const orderRef = doc(collection(db, "orders"))
      const orderId = orderRef.id
      orderIds.push(orderId)

      // Calculate order total
      const orderTotal = items.reduce((total: number, item: any) => 
        total + (item.itemData.price * item.cartItemData.quantity), 0
      )

      // Create order document
      batch.set(orderRef, {
        orderId,
        buyerId: user.uid,
        sellerId,
        orderStatus: 'pending',
        orderTotal,
        deliveryCost: 0,
        collectionAddress,
        collectionInstructions: collectionInstructions || '',
        orderDate: serverTimestamp(),
        completionDate: null,
        notes: notes || ''
      })

      // Create order items and remove from cart
      for (const item of items) {
        // Add order item
        const orderItemRef = doc(collection(db, "orderItems"))
        batch.set(orderItemRef, {
          orderItemId: orderItemRef.id,
          orderId,
          itemId: item.itemData.itemId,
          quantity: item.cartItemData.quantity,
          priceAtPurchase: item.itemData.price,
          itemTotal: item.itemData.price * item.cartItemData.quantity
        })

        // Update item status to pending
        batch.update(doc(db, "items", item.itemData.itemId), {
          itemStatus: 'pending'
        })

        // Remove from cart
        batch.delete(doc(db, "cartItems", item.cartItemId))
      }
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: "Orders created successfully",
      orderIds
    })

  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { 
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

//DELETE - Delete order once cancelled
export async function DELETE(req: NextRequest, 
  { params }: { params: { orderId: string } }
){
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {orderId} = params

     // Check if order exists and belongs to user
        const orderDoc = await getDoc(doc(db, "orders", orderId))
        if (!orderDoc.exists()) {
          return NextResponse.json({ message: "Oder not found" }, { status: 404 })
        }
    
        const orderData = orderDoc.data()
        // Check if user has access to this order
        if (orderData.buyerId !== user.uid && orderData.sellerId !== user.uid) {
          return NextResponse.json({ message: "Forbidden: Cannot access this order" }, { status: 403 })
        }
    
        // Delete order items and order
        const orderItemsQuery = query(collection(db, "orderItems"), where("orderId", "==", orderId))
        
        const orderItemsSnapshot = await getDocs(orderItemsQuery)
        for (const orderItemDoc of orderItemsSnapshot.docs){
          const orderItemData = orderItemDoc.data()

          await deleteDoc(orderItemDoc.ref)
        }

        await deleteDoc(doc(db, "orders", orderId))
    
        return NextResponse.json({
          success: true,
          message: "Order removed"
        })
    
      } catch (error) {
        console.error("Remove order error:", error)
        return NextResponse.json(
          { 
            message: "Failed to remove order",
            error: error instanceof Error ? error.message : "Unknown error"
          },
          { status: 500 }
        )
      }
    }
