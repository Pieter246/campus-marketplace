// src/app/api/items/my-items/route.ts
import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { authenticateRequest } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Query user's items
    const itemsQuery = query(
      collection(db, "items"),
      where("sellerId", "==", user.uid),
      orderBy("postedAt", "desc")
    )

    const querySnapshot = await getDocs(itemsQuery)
    
    const items = querySnapshot.docs.map(doc => ({
      itemId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    })

  } catch (error) {
    console.error("Get my items error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get items",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
