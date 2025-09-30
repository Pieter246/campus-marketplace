import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

const VALID_STATUSES = ["pending", "for-sale", "draft", "sold", "withdrawn", "collected"];

export async function POST(req: NextRequest) {
  try {
    const adminUser = await authenticateRequest(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!adminUser.admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { itemId, status } = await req.json();
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid or missing status" }, { status: 400 });
    }

    const itemRef = firestore.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    await itemRef.update({ status });

    return NextResponse.json({
      success: true,
      message: "Item status updated successfully",
      itemId,
      status,
    });
  } catch (err: unknown) {
    console.error("Update item status error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to update item status", error: errorMessage },
      { status: 500 }
    );
  }
}