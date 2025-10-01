import { NextResponse } from "next/server";
import { firestore } from "@/firebase/server";

export async function GET() {
  try {
    // Get a sample item to see its structure
    const itemsSnap = await firestore
      .collection("items")
      .where("status", "==", "for-sale")
      .limit(1)
      .get();

    if (itemsSnap.empty) {
      return NextResponse.json({ 
        success: true, 
        message: "No items found" 
      });
    }

    const sampleItem = itemsSnap.docs[0];
    const itemData = sampleItem.data();

    return NextResponse.json({ 
      success: true, 
      itemId: sampleItem.id,
      itemData: itemData,
      priceField: itemData.price,
      priceType: typeof itemData.price
    });

  } catch (error: unknown) {
    console.error("Error debugging item:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Failed to debug item", error: errorMessage },
      { status: 500 }
    );
  }
}