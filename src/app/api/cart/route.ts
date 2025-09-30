import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { FieldPath } from "firebase-admin/firestore";

interface CartItem {
  cartItemId: string;
  itemId: string;
  cartId: string;
}

interface Item {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const cartId = user.uid;
    const cartItemsSnap = await firestore.collection("cartItems")
      .where("cartId", "==", cartId)
      .get();

    const cartItems: CartItem[] = [];
    const itemIds: string[] = [];
    cartItemsSnap.forEach(doc => {
      const data = doc.data();
      cartItems.push({ cartItemId: doc.id, ...data } as CartItem);
      if (data.itemId) itemIds.push(data.itemId);
    });

    if (!itemIds.length) return NextResponse.json({ success: true, cartItems, itemsData: [] });

    const itemsSnap = await firestore.collection("items")
      .where(FieldPath.documentId(), "in", itemIds)
      .get();

    const itemsData: Item[] = [];
    itemsSnap.forEach(doc => {
      const data = doc.data();
      itemsData.push({
        id: doc.id,
        title: data.title,
        price: data.price,
        images: data.images || [],
        condition: data.condition || 'used',
        sellerId: data.sellerId || '',
        // Add other required Item properties
        collectionAddress: data.collectionAddress || '',
        description: data.description || '',
        category: data.category || 'other',
        status: data.status || 'draft',
      } as Item);
    });

    return NextResponse.json({ success: true, cartItems, itemsData });
  } catch (err: unknown) {
    console.error("Error fetching cart:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message });
  }
}