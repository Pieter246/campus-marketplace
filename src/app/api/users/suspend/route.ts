import { NextRequest, NextResponse } from "next/server";
import { firestore, auth, authenticateRequest } from "@/firebase/server";

export async function POST(req: NextRequest) {
  try {
    const adminUser = await authenticateRequest(req);
    if (!adminUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!adminUser.admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: "Missing user id" }, { status: 400 });

    // Check if user exists in Firestore
    const userRef = firestore.collection("users").doc(id);
    const doc = await userRef.get();
    if (!doc.exists) return NextResponse.json({ message: "User not found in Firestore" }, { status: 404 });

    // Update Firebase Authentication to disable the user
    try {
      await auth.updateUser(id, { disabled: true });
    } catch (authErr: any) {
      if (authErr.code !== 'auth/user-not-found') {
        throw authErr; // Rethrow if error is not user-not-found
      }
      console.warn(`User ${id} not found in Firebase Authentication, but suspending in Firestore`);
    }

    // Update isActive in Firestore
    await userRef.update({ isActive: false });

    return NextResponse.json({ success: true, message: "User suspended in Firestore and Authentication (if existed)" });
  } catch (err: any) {
    console.error("Suspend user error:", err);
    return NextResponse.json(
      { message: "Failed to suspend user", error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}