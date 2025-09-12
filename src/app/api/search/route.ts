// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Query parameters
    const searchTerm = searchParams.get('q') || searchParams.get('search')
    const categoryId = searchParams.get('category')
    const condition = searchParams.get('condition')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'newest' // newest, oldest, price_low, price_high
    const pageSize = parseInt(searchParams.get('limit') || '20')

    // Start with base query for available items
    let itemsQuery = query(
      collection(db, "items"),
      where("itemStatus", "==", "available"),
      limit(pageSize)
    )

    // Add category filter
    if (categoryId) {
      itemsQuery = query(
        collection(db, "items"),
        where("itemStatus", "==", "available"),
        where("categoryId", "==", categoryId),
        limit(pageSize)
      )
    }

    // Add condition filter
    if (condition) {
      itemsQuery = query(
        collection(db, "items"),
        where("itemStatus", "==", "available"),
        where("condition", "==", condition),
        ...(categoryId ? [where("categoryId", "==", categoryId)] : []),
        limit(pageSize)
      )
    }

    // Add sorting
    switch (sortBy) {
      case 'newest':
        itemsQuery = query(itemsQuery, orderBy("postedAt", "desc"))
        break
      case 'oldest':
        itemsQuery = query(itemsQuery, orderBy("postedAt", "asc"))
        break
      case 'price_low':
        itemsQuery = query(itemsQuery, orderBy("price", "asc"))
        break
      case 'price_high':
        itemsQuery = query(itemsQuery, orderBy("price", "desc"))
        break
      default:
        itemsQuery = query(itemsQuery, orderBy("postedAt", "desc"))
    }

    const querySnapshot = await getDocs(itemsQuery)
    
    let items = querySnapshot.docs.map(doc => ({
      itemId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
    }))

    // Apply text search filter (client-side for simplicity)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      items = items.filter((item: any) => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply price range filters
    if (minPrice || maxPrice) {
      items = items.filter((item: any) => {
        const price = item.price || 0
        if (minPrice && price < parseFloat(minPrice)) return false
        if (maxPrice && price > parseFloat(maxPrice)) return false
        return true
      })
    }

    // Get category names for items
    const categoriesSnapshot = await getDocs(collection(db, "categories"))
    const categoriesMap = new Map()
    categoriesSnapshot.docs.forEach(doc => {
      categoriesMap.set(doc.id, doc.data())
    })

    // Enhance items with category info
    const enhancedItems = items.map((item: any) => ({
      ...item,
      category: categoriesMap.get(item.categoryId) || null
    }))

    return NextResponse.json({
      success: true,
      items: enhancedItems,
      count: enhancedItems.length,
      filters: {
        search: searchTerm,
        category: categoryId,
        condition,
        minPrice,
        maxPrice,
        sortBy
      },
      facets: {
        conditions: ['new', 'like_new', 'good', 'fair', 'poor'],
        categories: Array.from(categoriesMap.entries()).map(([id, data]) => ({
          categoryId: id,
          ...data
        }))
      }
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { 
        message: "Search failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
