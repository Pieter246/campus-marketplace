// src/app/api/login/route.ts
import { NextResponse } from "next/server";

// Handle POST requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // --- Test implementation (keep for now) ---
    if (email === "user@example.com" && password === "password12345") {
      return NextResponse.json({
        access_token: "mock_jwt_token_here",
        user: { id: 1, email: "user@example.com", name: "Demo User" },
      });
    }

    // --- Firebase authentication (commented out for later use) ---
    /*
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { auth } from "@/lib/firebase"; // make sure you set this up

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return NextResponse.json({
        access_token: await user.getIdToken(),
        user: { id: user.uid, email: user.email, name: user.displayName },
      });
    } catch (error) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    */

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
