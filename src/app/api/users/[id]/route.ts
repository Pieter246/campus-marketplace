import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/server"; // adjust path if your Firestore util is elsewhere

// Suspend / update user (PATCH)
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context;
    const { id } = await params;
    const { isActive } = await req.json();

    await firestore.collection("users").doc(id).update({
      isActive,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Suspend user error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

// Delete user (DELETE)
export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context;
    const { id } = await params;
    await firestore.collection("users").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete user error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
