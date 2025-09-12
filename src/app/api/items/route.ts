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
    const categoryId = searchParams.get("categoryId");
    const sellerId = searchParams.get("sellerId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Build Firestore query
    let query = adminDb.collection("items").where("itemStatus", "==", status);

    if (categoryId) {
      query = query.where("categoryId", "==", categoryId);
    }
    
    if (sellerId) {
      query = query.where("sellerId", "==", sellerId);
    }

    if (minPrice) {
      query = query.where("price", ">=", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.where("price", "<=", parseFloat(maxPrice));
    }

    // Order by most recent and limit results
    query = query.orderBy("postedAt", "desc").limit(limit);

    const itemsSnapshot = await query.get();

    const items = itemsSnapshot.docs.map((doc) => ({
      itemId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({ 
      success: true, 
      items,
      count: items.length,
      hasMore: items.length === limit 
    });
  } catch (error: any) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { message: "Failed to get items", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}