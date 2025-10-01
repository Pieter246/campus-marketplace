import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/firebase/server";
import { cleanupAllCartsForNonSaleItems } from "@/lib/cartCleanup";

/**
 * Admin-only API route for comprehensive cart cleanup
 * Removes all items that are not 'for-sale' from all users' carts
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    if (!user.admin) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    console.log(`Admin ${user.uid} initiated comprehensive cart cleanup`);
    
    await cleanupAllCartsForNonSaleItems();

    return NextResponse.json({
      success: true,
      message: "Cart cleanup completed successfully"
    });

  } catch (error: unknown) {
    console.error("Cart cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        success: false, 
        message: "Cart cleanup failed", 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}