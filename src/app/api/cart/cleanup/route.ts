import { NextRequest, NextResponse } from "next/server";
import { removeUserCartItems, removeCartItemsByIds } from "@/lib/cartCleanup";

export async function POST(req: NextRequest) {
  try {
    const { userId, cartItemIds } = await req.json();
    
    let result;
    if (userId) {
      // Remove all cart items for a user (e.g., after successful payment)
      result = await removeUserCartItems(userId);
    } else if (cartItemIds && Array.isArray(cartItemIds)) {
      // Remove specific cart items
      result = await removeCartItemsByIds(cartItemIds);
    } else {
      return NextResponse.json(
        { success: false, message: "Either userId or cartItemIds must be provided" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Removed ${result.removed} cart items`,
      removed: result.removed 
    });
  } catch (error: any) {
    console.error("Cart cleanup API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cleanup cart", error: error.message },
      { status: 500 }
    );
  }
}