import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const adminDb = getAdminFirestore();

export async function GET(req: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log("Authenticated user:", decodedToken.uid);

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50 items
    const status = searchParams.get("status") || "available";
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const searchTerm = searchParams.get("search") || searchParams.get("q");
    const condition = searchParams.get("condition");
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, price_low, price_high

    // Build Firestore query
    let query = adminDb.collection("items").where("itemStatus", "==", status);

    if (category) {
      query = query.where("category", "==", category);
    }
    
    if (sellerId) {
      query = query.where("sellerId", "==", sellerId);
    }

    if (condition) {
      query = query.where("condition", "==", condition);
    }

    if (minPrice) {
      query = query.where("price", ">=", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.where("price", "<=", parseFloat(maxPrice));
    }

    // Add sorting based on sortBy parameter
    switch (sortBy) {
      case "oldest":
        query = query.orderBy("postedAt", "asc");
        break;
      case "price_low":
        query = query.orderBy("price", "asc");
        break;
      case "price_high":
        query = query.orderBy("price", "desc");
        break;
      case "newest":
      default:
        query = query.orderBy("postedAt", "desc");
        break;
    }

    // Apply limit
    query = query.limit(limit);

    const itemsSnapshot = await query.get();

    let items = itemsSnapshot.docs.map((doc) => ({
      itemId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
    }));

    // Apply text search filter (client-side for simplicity)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      items = items.filter((item: any) => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ 
      success: true, 
      items,
      count: items.length,
      hasMore: items.length === limit,
      filters: {
        status,
        category,
        sellerId,
        condition,
        minPrice,
        maxPrice,
        search: searchTerm,
        sortBy
      }
    });
  } catch (error: any) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { message: "Failed to get items", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}