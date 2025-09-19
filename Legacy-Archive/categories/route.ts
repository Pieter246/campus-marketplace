// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('active') !== 'false' // default to true

    // Build query
    let categoriesQuery = query(
      collection(db, "categories"),
      orderBy("categoryName", "asc")
    )

    // Filter by active status if requested
    if (activeOnly) {
      categoriesQuery = query(
        collection(db, "categories"),
        where("isActive", "==", true),
        orderBy("categoryName", "asc")
      )
    }

    const querySnapshot = await getDocs(categoriesQuery)
    
    const categories = querySnapshot.docs.map(doc => ({
      categoryId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length
    })

  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get categories",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
