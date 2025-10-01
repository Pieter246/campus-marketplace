import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ cartItemId: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId } = await context.params;
    const { quantity } = await req.json();

    if (!cartItemId) {
      return NextResponse.json({ message: "Missing cartItemId" }, { status: 400 });
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json({ message: "Invalid quantity" }, { status: 400 });
    }

    const cartItemRef = firestore.collection("cartItems").doc(cartItemId);
    const cartItemSnap = await cartItemRef.get();

    if (!cartItemSnap.exists || cartItemSnap.data()?.cartId !== user.uid) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    await cartItemRef.update({ quantity });
    return NextResponse.json({ success: true, message: "Quantity updated" });
  } catch (err: any) {
    console.error("Update cart item error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ cartItemId: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // await params here
    const { cartItemId } = await context.params;
    if (!cartItemId) {
      return NextResponse.json({ message: "Missing cartItemId" }, { status: 400 });
    }

    const cartItemRef = firestore.collection("cartItems").doc(cartItemId);
    const cartItemSnap = await cartItemRef.get();

    if (!cartItemSnap.exists || cartItemSnap.data()?.cartId !== user.uid) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    await cartItemRef.delete();
    return NextResponse.json({ success: true, message: "Cart item removed" });
  } catch (err: unknown) {
    console.error("Delete cart item error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message: errorMessage });
  }
}
