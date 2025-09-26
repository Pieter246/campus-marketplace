import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";
import { Item, ItemStatus, ItemCondition } from "@/types/item";
import { Query, DocumentData } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      sellerId,
      buyerId,
      minPrice,
      maxPrice,
      condition,
      status,
      searchTerm,
      sort = "newest",
      category,
    } = body;

    const user = await authenticateRequest(req);

    // Only enforce auth for private filters
    if ((sellerId || buyerId) && !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!user?.admin && !(sellerId || buyerId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let query: Query<DocumentData> = firestore.collection("items");

    // Apply filters
    if (sellerId) query = query.where("sellerId", "==", sellerId);
    if (buyerId) query = query.where("buyerId", "==", buyerId);
    if (minPrice !== null && minPrice !== undefined)
      query = query.where("price", ">=", minPrice);
    if (maxPrice !== null && maxPrice !== undefined)
      query = query.where("price", "<=", maxPrice);
    if (condition) {
      if (condition === "all") {
        query = query.where("condition", "in", ["new", "excellent", "used", "fair", "poor"]);
      } else {
        query = query.where("condition", "==", condition);
      }
    }
    if (Array.isArray(status) && status.length > 0) {
      query = query.where("status", "in", status);
    }
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    // Apply sort logic
    if (sort === "price-asc") {
      query = query.orderBy("price", "asc");
    } else if (sort === "price-desc") {
      query = query.orderBy("price", "desc");
    } else if (sort === "oldest") {
      query = query.orderBy("updatedAt", "asc");
    } else {
      query = query.orderBy("updatedAt", "desc"); // default: newest
    }

    // Fetch all items (with a reasonable limit for safety)
    const snapshot = await query.limit(1000).get();

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

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      totalPages: 1, // No pagination
      filters: {
        sellerId,
        buyerId,
        minPrice,
        maxPrice,
        condition,
        status,
        searchTerm,
        sort,
        category,
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