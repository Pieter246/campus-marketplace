import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";
import { Item } from "@/types/item";
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
      page = 1,
      pageSize = 10,
    } = body;

    const user = await authenticateRequest(req);

    // Only enforce auth for private filters (sellerId or buyerId)
    if ((sellerId || buyerId) && !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Get total count for pagination
    const totalItems = (await query.count().get()).data().count;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Apply pagination
    query = query.offset((page - 1) * pageSize).limit(pageSize);

    // Fetch items
    const snapshot = await query.get();

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
      totalPages,
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
  } catch (error: unknown) {
    console.error("Get items error:", error);
    const errorMessage: string = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        message: "Failed to get items",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}