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

    const users = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,          // <- use 'id' not 'userId'
      email: data.email,
      isActive: data.isActive ?? false,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate().toISOString() ?? null,
    };
  });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { message: "Failed to get users", error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}