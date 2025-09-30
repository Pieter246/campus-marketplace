import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/server";

export async function GET(req: NextRequest) {
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

  } catch (error: any) {
    console.error("Error debugging item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to debug item", error: error.message },
      { status: 500 }
    );
  }
}