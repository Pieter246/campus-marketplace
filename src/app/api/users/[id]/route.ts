import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/server"; // adjust path if your Firestore util is elsewhere

// Suspend / update user (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isActive } = await req.json();

    await firestore.collection("users").doc(params.id).update({
      isActive,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Suspend user error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Delete user (DELETE)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await firestore.collection("users").doc(params.id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
