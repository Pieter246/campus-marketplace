import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { removeItemFromAllCarts } from "@/lib/cartCleanup";

const VALID_CONDITIONS = ["new", "excellent", "used", "fair", "poor"];
const VALID_STATUSES = ["for-sale", "pending"];

export async function POST(req: NextRequest) {
  try {
    const adminUser = await authenticateRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!adminUser.admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { itemId, condition, status } = await req.json();
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }
    if (!condition || !VALID_CONDITIONS.includes(condition)) {
      return NextResponse.json({ message: "Invalid or missing condition" }, { status: 400 });
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid or missing status" }, { status: 400 });
    }

    const itemRef = firestore.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Get current status for cart cleanup logic
    const currentData = itemDoc.data();
    const currentStatus = currentData?.status;

    await itemRef.update({ condition, status });

    // If status is changing from 'for-sale' to 'pending', remove item from all carts
    if (currentStatus === 'for-sale' && status === 'pending') {
      try {
        await removeItemFromAllCarts(itemId);
        console.log(`Removed item ${itemId} from all carts due to status change to pending`);
      } catch (cartError) {
        console.error(`Error removing item ${itemId} from carts:`, cartError);
        // Don't fail the approval if cart cleanup fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Item ${status === "for-sale" ? "approved" : "unapproved"} successfully`,
      itemId,
      condition,
      status,
    });
  } catch (err: unknown) {
    console.error("Approve item error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to update item", error: errorMessage },
      { status: 500 }
    );
  }
}