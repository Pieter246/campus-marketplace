import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { itemId } = await req.json();
    if (!itemId) return NextResponse.json({ message: "Missing itemId" }, { status: 400 });

    const cartId = user.uid;

    // Ensure cart exists
    await firestore.collection("cart").doc(cartId).set(
      { cartId, buyerId: user.uid },
      { merge: true }
    );

    // Deterministic doc ID: combine cartId + itemId
    const cartItemDocId = `${cartId}_${itemId}`;
    const cartItemRef = firestore.collection("cartItems").doc(cartItemDocId);

    const cartItemSnap = await cartItemRef.get();

    if (cartItemSnap.exists) {
      return NextResponse.json({ success: false, message: "Item is already in your cart" });
    }

    // Add new cart item
    await cartItemRef.set({
      cartItemId: cartItemDocId,
      cartId,
      itemId,
      addedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Item added to cart" });
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { message: "Internal error", error: error.message },
      { status: 500 }
    );
  }
}
