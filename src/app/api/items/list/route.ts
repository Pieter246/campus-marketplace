import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";
import { Item } from "@/types/item";

// Post function
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();

    const {
      page = 1,
      pageSize = 10,
      sellerId,
      buyerId,
      minPrice,
      maxPrice,
      condition,
      status,
      searchTerm,
    } = body;

    let query = firestore.collection("items").orderBy("updatedAt", "desc");

    // 🔧 Apply filters
    if (sellerId) query = query.where("sellerId", "==", sellerId);
    if (buyerId) query = query.where("buyerId", "==", buyerId);
    if (minPrice !== null && minPrice !== undefined)
      query = query.where("price", ">=", minPrice);
    if (maxPrice !== null && maxPrice !== undefined)
      query = query.where("price", "<=", maxPrice);
    if (condition) {
      if (condition === "all") {
        query = query.where("condition", "in", ["new", "used", "fair", "poor"]);
      } else {
        query = query.where("condition", "==", condition);
      }
    }
    if (Array.isArray(status) && status.length > 0) {
      query = query.where("status", "in", status);
    }

    const fetchSize = pageSize * 3;
    const snapshot = await query.limit(fetchSize).get();

    let items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        postedAt: data.postedAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      } as Item;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
      );
    }

    const totalPages = Math.ceil(items.length / pageSize);
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      success: true,
      items: paginatedItems,
      count: paginatedItems.length,
      totalPages,
      filters: {
        sellerId,
        buyerId,
        minPrice,
        maxPrice,
        condition,
        status,
        searchTerm,
      },
    });
  } catch (error: any) {
    console.error("Get items error:", error);
    return NextResponse.json(
      {
        message: "Failed to get items",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
