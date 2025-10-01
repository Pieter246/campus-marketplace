import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { removeItemFromAllCarts } from "@/lib/cartCleanup";

export async function DELETE(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await req.json();
  if (!itemId) {
    return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
  }

  const itemRef = firestore.collection("items").doc(itemId);
  const itemDoc = await itemRef.get();
  if (!itemDoc.exists) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  const itemData = itemDoc.data();
  if (itemData?.sellerId !== user.uid) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Remove from all carts before deleting
  try {
    await removeItemFromAllCarts(itemId);
    console.log(`Removed deleted item ${itemId} from all carts`);
  } catch (cartError) {
    console.error(`Error removing item ${itemId} from carts:`, cartError);
    // Don't fail the deletion if cart cleanup fails
  }

  await itemRef.delete();

  return NextResponse.json({
    success: true,
    message: "Item deleted successfully",
    itemId,
  });
}