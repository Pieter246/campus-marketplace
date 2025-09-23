import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const cartId = user.uid;
    const cartItemsSnapshot = await firestore
      .collection("cartItems")
      .where("cartId", "==", cartId)
      .get();

    const items = await Promise.all(
      cartItemsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const itemDoc = await firestore.collection("items").doc(data.itemId).get();
        const itemData = itemDoc.exists ? itemDoc.data() : null;

        return {
          cartItemId: doc.id,
          itemId: data.itemId,
          quantity: data.quantity,
          addedAt: data.addedAt?.toDate?.()?.toISOString() || null,
          item: itemData
            ? {
                id: itemDoc.id,
                title: itemData.title,
                price: itemData.price,
                images: itemData.images || [],
              }
            : undefined,
        };
      })
    );

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart", error: error.message },
      { status: 500 }
    );
  }
}
