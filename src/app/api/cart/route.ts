import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const cartId = user.uid;
    const cartItemsSnap = await firestore.collection("cartItems")
      .where("cartId", "==", cartId)
      .get();

    const cartItems: any[] = [];
    const itemIds: string[] = [];
    cartItemsSnap.forEach(doc => {
      const data = doc.data();
      cartItems.push({ cartItemId: doc.id, ...data });
      if (data.itemId) itemIds.push(data.itemId);
    });

    if (!itemIds.length) return NextResponse.json({ success: true, cartItems: [], itemsData: [] });

    const admin = require("firebase-admin");
    const itemsSnap = await firestore.collection("items")
      .where(admin.firestore.FieldPath.documentId(), "in", itemIds)
      .get();

    const itemsData: any[] = [];
    itemsSnap.forEach(doc => {
      const data = doc.data();
      itemsData.push({
        id: doc.id,
        title: data.title,
        price: data.price,
        images: data.images || [],
      });
    });

    return NextResponse.json({ success: true, cartItems, itemsData });
  } catch (err: any) {
    console.error("Error fetching cart:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
