import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { removeItemFromAllCarts } from "@/lib/cartCleanup";

const VALID_STATUSES = ["pending", "for-sale", "draft", "sold", "withdrawn", "collected"];

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId, status } = await req.json();
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid or missing status" }, { status: 400 });
    }

    const itemRef = firestore.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const itemData = itemDoc.data();
    
    // Check permissions based on the status being set
    if (status === "collected") {
      // Only the buyer can mark an item as collected
      if (itemData?.buyerId !== user.uid) {
        return NextResponse.json({ 
          message: "You can only mark items as collected if you purchased them" 
        }, { status: 403 });
      }
      // Can only mark sold items as collected
      if (itemData?.status !== "sold") {
        return NextResponse.json({ 
          message: "Item must be sold before it can be marked as collected" 
        }, { status: 400 });
      }
    } else {
      // For all other status changes, require admin access
      if (!user.admin) {
        return NextResponse.json({ message: "Admin access required for this status change" }, { status: 403 });
      }
    }

    // Get the current status to check if we're changing from 'for-sale'
    const currentStatus = itemData?.status;

    await itemRef.update({ 
      status,
      ...(status === "collected" && { 
        collectedAt: new Date(),
        collectedBy: user.uid 
      })
    });

    // If status is changing away from 'for-sale', remove item from all carts
    if (currentStatus === 'for-sale' && status !== 'for-sale') {
      try {
        await removeItemFromAllCarts(itemId);
        console.log(`Removed item ${itemId} from all carts due to status change from ${currentStatus} to ${status}`);
      } catch (cartError) {
        console.error(`Error removing item ${itemId} from carts:`, cartError);
        // Don't fail the status update if cart cleanup fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Item status updated successfully",
      itemId,
      status,
    });
  } catch (err: unknown) {
    console.error("Update item status error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to update item status", error: errorMessage },
      { status: 500 }
    );
  }
}