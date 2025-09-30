import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/server";

export async function GET(req: NextRequest) {
  try {
    // Get all purchases for debugging
    const purchasesSnap = await firestore
      .collection("purchases")
      .limit(10)
      .get();

    const purchases = purchasesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      };
    });

    return NextResponse.json({ 
      success: true, 
      count: purchases.length,
      purchases 
    });

  } catch (error: any) {
    console.error("Error debugging purchases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to debug purchases", error: error.message },
      { status: 500 }
    );
  }
}