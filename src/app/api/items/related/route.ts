import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/server";
import { DocumentData, Query } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const itemId = searchParams.get("itemId");
  const limitParam = parseInt(searchParams.get("limit") || "4", 10);

  if (!itemId) {
    return NextResponse.json({ success: false, message: "itemId is required" }, { status: 400 });
  }

  try {
    // Fetch the current item to get its category
    const itemRef = firestore.collection("items").doc(itemId);
    const itemSnapshot = await itemRef.get();

    if (!itemSnapshot.exists) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }

    const itemData = itemSnapshot.data() as DocumentData;
    const category = itemData.category; // Assuming items have a 'category' field

    // Query for related items (same category, for-sale)
    let q: Query<DocumentData> = firestore.collection("items");
    q = q.where("category", "==", category);
    q = q.where("status", "==", "for-sale");
    q = q.limit(limitParam + 1); // Fetch one extra to potentially exclude the current item if included

    const snapshot = await q.get();

    let items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Exclude the current item if it's in the results
    items = items.filter((item) => item.id !== itemId);

    // Slice to the requested limit in case we fetched extra
    items = items.slice(0, limitParam);

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching related items:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}