// src/app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Query parameters
    const categoryId = searchParams.get('category')
    const searchTerm = searchParams.get('search')
    const pageSize = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'available'

    // Build query
    let itemsQuery = query(
      collection(db, "items"),
      where("itemStatus", "==", status),
      orderBy("postedAt", "desc"),
      limit(pageSize)
    )

    // Add category filter if specified
    if (categoryId) {
      itemsQuery = query(
        collection(db, "items"),
        where("itemStatus", "==", status),
        where("categoryId", "==", categoryId),
        orderBy("postedAt", "desc"),
        limit(pageSize)
      )
    }

    const querySnapshot = await getDocs(itemsQuery)
    
    let items = querySnapshot.docs.map(doc => ({
      itemId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
    }))

    // Apply search filter if specified (client-side filtering for simplicity)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      items = items.filter((item: any) => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      filters: {
        category: categoryId,
        search: searchTerm,
        status
      }
    })

  } catch (error) {
    console.error("Get items error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get items",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
