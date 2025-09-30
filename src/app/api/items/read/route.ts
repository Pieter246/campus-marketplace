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

    return NextResponse.json({
      success: true,
      item: {
        id: itemDoc.id,
        ...itemData,
        postedAt: itemData?.postedAt?.toDate?.()?.toISOString(),
        updatedAt: itemData?.updatedAt?.toDate?.()?.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching item:", error);
    const errorMessage: string = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        message: "Failed to get item",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}