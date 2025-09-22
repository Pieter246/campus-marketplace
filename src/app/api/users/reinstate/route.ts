// /app/api/users/reinstate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!user.admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const userId = body.id;
    if (!userId) return NextResponse.json({ message: "Missing user id" }, { status: 400 });

    await firestore.collection("users").doc(userId).update({ isActive: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reinstate user error:", err);
    return NextResponse.json({ message: err.message || "Failed to reinstate user" }, { status: 500 });
  }
}