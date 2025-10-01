import { NextResponse } from "next/server";
import { firestore } from "@/firebase/server";

export async function GET() {
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

  } catch (error: unknown) {
    console.error("Error debugging purchases:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Failed to debug purchases", error: errorMessage },
      { status: 500 }
    );
  }
}