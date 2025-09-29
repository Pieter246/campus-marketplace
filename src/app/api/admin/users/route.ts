import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";

export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins
    if (!user.admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ message: "Missing userId or action" }, { status: 400 });
    }

    // Get admin emails from environment variable
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

    // Get user document
    const userDoc = await firestore.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Check if user email is in protected admin emails (from .env.local)
    const isProtectedAdmin = adminEmails.includes(userData?.email || '');

    if (action === "promote-admin") {
      // Make user admin
      await firestore.collection("users").doc(userId).update({
        isAdmin: true,
        updatedAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: "User promoted to admin successfully" 
      });

    } else if (action === "demote-admin") {
      // Check if trying to demote a protected admin
      if (isProtectedAdmin) {
        return NextResponse.json({ 
          message: "Cannot demote admin user defined in environment configuration" 
        }, { status: 400 });
      }

      // Remove admin privileges
      await firestore.collection("users").doc(userId).update({
        isAdmin: false,
        updatedAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: "Admin privileges removed successfully" 
      });

    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Admin management error:", error);
    return NextResponse.json(
      { 
        message: "Failed to update admin status", 
        error: error?.message ?? "Unknown error" 
      },
      { status: 500 }
    );
  }
}