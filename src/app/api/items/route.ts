/* NO LONGER NEEDED UNLESS USING ADMIN SDK
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

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

    // Query items from Firestore
    const itemsSnapshot = await adminDb
      .collection("items")
      .where("itemStatus", "==", "available")
      .orderBy("postedAt", "desc")
      .limit(10)
      .get();

    const items = itemsSnapshot.docs.map((doc) => ({
      itemId: doc.id,
      ...doc.data(),
      postedAt: doc.data().postedAt?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { message: "Failed to get items", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
*/