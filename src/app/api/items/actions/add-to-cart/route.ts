import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }

    const cartId = user.uid;
    const cartItemsRef = firestore.collection("cartItems");

    // Check for duplicates
    const existingSnap = await cartItemsRef
      .where("cartId", "==", cartId)
      .where("itemId", "==", itemId)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({ success: false, message: "Item already in cart" });
    }

    const newDoc = cartItemsRef.doc();
    await newDoc.set({
      cartItemId: newDoc.id,
      cartId,
      itemId,
      quantity: 1,
      addedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Item added to cart" });
  } catch (err: unknown) {
    console.error("Add to cart error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ message: "Internal error", error: errorMessage }, { status: 500 });
  }
}
