import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";
import { removeItemFromAllCarts } from "@/lib/cartCleanup";

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

    await firestore.collection("items").doc(itemId).update({
      status: "withdrawn",
      updatedAt: new Date(),
    });

    // Remove item from all carts since it's no longer for sale
    try {
      await removeItemFromAllCarts(itemId);
      console.log(`Removed withdrawn item ${itemId} from all carts`);
    } catch (cartError) {
      console.error(`Error removing item ${itemId} from carts:`, cartError);
      // Don't fail the withdrawal if cart cleanup fails
    }

    return NextResponse.json({ success: true, message: "Item withdrawn" });
  } catch (error: unknown) {
    console.error("Withdraw error:", error);
    const errorMessage: string = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal error", error: errorMessage },
      { status: 500 }
    );
  }
}
