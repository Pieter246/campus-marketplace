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

    // Delete all items where sellerId matches the user id
    const itemsQuery = await firestore.collection("items").where("sellerId", "==", id).get();
    const batch = firestore.batch();
    itemsQuery.forEach((itemDoc) => {
      batch.delete(itemDoc.ref);
    });
    await batch.commit();

    // Delete user from Firestore
    await userRef.delete();

    // Delete user from Firebase Authentication (ignore if user not found)
    try {
      await auth.deleteUser(id);
    } catch (authErr: unknown) {
      if (authErr instanceof Error && authErr.message.includes('auth/user-not-found')) {
        console.warn(`User ${id} not found in Firebase Authentication, but removed from Firestore`);
      } else {
        throw authErr; // Rethrow if error is not user-not-found
      }
      console.warn(`User ${id} not found in Firebase Authentication, but removed from Firestore`);
    }

    return NextResponse.json({ success: true, message: "User and their items removed from Firestore and Authentication (if existed)" });
  } catch (err: unknown) {
    console.error("Remove user error:", err);
    const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to remove user", error: errorMessage },
      { status: 500 }
    );
  }
}