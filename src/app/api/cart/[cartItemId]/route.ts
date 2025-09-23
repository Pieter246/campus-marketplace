import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";

export async function DELETE(req: NextRequest, { params }: { params: { cartItemId: string } }) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { cartItemId } = params;
    if (!cartItemId) return NextResponse.json({ message: "Missing cartItemId" }, { status: 400 });

    const cartItemRef = firestore.collection("cartItems").doc(cartItemId);
    const doc = await cartItemRef.get();

    if (!doc.exists || doc.data()?.cartId !== user.uid) {
      return NextResponse.json({ message: "Item not found in your cart" }, { status: 404 });
    }

    await cartItemRef.delete();
    return NextResponse.json({ success: true, message: "Cart item removed" });
  } catch (error: any) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete cart item", error: error.message },
      { status: 500 }
    );
  }
}
