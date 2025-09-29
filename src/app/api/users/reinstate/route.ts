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

    // Update Firebase Authentication to enable the user
    try {
      await auth.updateUser(id, { disabled: false });
    } catch (authErr: any) {
      if (authErr.code !== 'auth/user-not-found') {
        throw authErr; // Rethrow if error is not user-not-found
      }
      console.warn(`User ${id} not found in Firebase Authentication, but reinstating in Firestore`);
    }

    // Update isActive in Firestore
    await userRef.update({ isActive: true });

    return NextResponse.json({ success: true, message: "User reinstated in Firestore and Authentication (if existed)" });
  } catch (err: any) {
    console.error("Reinstate user error:", err);
    return NextResponse.json(
      { message: "Failed to reinstate user", error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}