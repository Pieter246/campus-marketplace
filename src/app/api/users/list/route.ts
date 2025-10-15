import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { DocumentData, Query } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req); // verify user
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins
    if (!user.admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const startAfterId = url.searchParams.get("startAfter") || null;
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);

    let query: Query<DocumentData> = firestore
      .collection("users")
      .orderBy("email"); // ordering needed for startAfter

    if (startAfterId) {
      const lastDocSnap = await firestore
        .collection("users")
        .doc(startAfterId)
        .get();
      if (lastDocSnap.exists) {
        query = query.startAfter(lastDocSnap);
      }
    }

    query = query.limit(limit);

    const snapshot = await query.get();

    // Get admin emails from environment variable
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

    const users = snapshot.docs.map((doc) => {

      const data = doc.data();
      
      // Check if user email is in admin emails list
      const isAdminFromEnv = adminEmails.includes(data.email || '');
      const isAdminFromDB = data.isAdmin ?? false;
      
      // If user is admin in env but not in DB, update the database
      if (isAdminFromEnv && !isAdminFromDB) {
        // Update the user document to set isAdmin: true
        firestore.collection("users").doc(doc.id).update({ isAdmin: true }).catch(err => {
          console.error("Failed to update admin status for", data.email, err);
        });
      }
      
  function normalizeDate(val: any): string | null {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate().toISOString();
        return null;
      }
      return {
        id: doc.id,          // <- use 'id' not 'userId'
        email: data.email,
        isActive: data.isActive ?? false,
        isAdmin: isAdminFromEnv || isAdminFromDB, // Combined admin status
        ...data,
        createdAt: normalizeDate(data.createdAt),
        updatedAt: normalizeDate(data.updatedAt),
      };
    });


    return NextResponse.json(users, { status: 200 });
  } catch (error: unknown) {
    console.error("Get users error:", error);
    const errorMessage: string = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to get users", error: errorMessage },
      { status: 500 }
    );
  }
}