import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user's purchases (avoiding composite index requirement)
    const purchasesSnap = await firestore
      .collection("purchases")
      .where("buyerId", "==", user.uid)
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

    // Sort by createdAt in memory to avoid composite index
    purchases.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // desc order
    });

    return NextResponse.json({ 
      success: true, 
      purchases 
    });

  } catch (error: unknown) {
    console.error("Error fetching purchases:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Failed to fetch purchases", error: errorMessage },
      { status: 500 }
    );
  }
}