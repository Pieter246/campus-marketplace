import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }

    await firestore.collection("items").doc(itemId).update({
      status: "draft",
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Item marked as draft",
    });
  } catch (error: any) {
    console.error("Sell error:", error);
    return NextResponse.json(
      { message: "Internal error", error: error.message },
      { status: 500 }
    );
  }
}
