import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const adminUser = await authenticateRequest(req);
    if (!adminUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!adminUser.admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: "Missing user id" }, { status: 400 });

    const userRef = firestore.collection("users").doc(id);
    const doc = await userRef.get();
    if (!doc.exists) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await userRef.delete();

    return NextResponse.json({ success: true, message: "User removed" });
  } catch (err: any) {
    console.error("Remove user error:", err);
    return NextResponse.json(
      { message: "Failed to remove user", error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
