import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/server";

export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
  }

  try {
    const itemDoc = await firestore.collection("items").doc(itemId).get();

    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const itemData = itemDoc.data();

    // Fetch seller information
    let sellerEmail = null;
    if (itemData?.sellerId) {
      try {
        const sellerDoc = await firestore.collection("users").doc(itemData.sellerId).get();
        if (sellerDoc.exists) {
          const sellerData = sellerDoc.data();
          sellerEmail = sellerData?.email || null;
        }
      } catch (sellerError) {
        console.warn("Could not fetch seller information:", sellerError);
      }
    }

    return NextResponse.json({
      success: true,
      item: {
        id: itemDoc.id,
        ...itemData,
        sellerEmail,
        postedAt: itemData?.postedAt?.toDate?.()?.toISOString(),
        updatedAt: itemData?.updatedAt?.toDate?.()?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      {
        message: "Failed to get item",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}