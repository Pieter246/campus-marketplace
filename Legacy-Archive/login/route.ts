// src/app/api/login/route.ts
import { NextResponse } from "next/server";

// Handle POST requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // --- Demo user implementation ---
    if (email === "user@example.com" && password === "password12345") {
      return NextResponse.json({
        access_token: "mock_jwt_token_here",
        user: { id: 1, email: "user@example.com", name: "Demo User" },
      });
    }

    // --- Invalid credentials response ---
    // Return errors for specific fields to match inline validation
    const fieldErrors: { [key: string]: string } = {};
    if (!email.includes("@")) fieldErrors.email = "Please enter a valid email address";
    else fieldErrors.email = "Email or password is incorrect";

    fieldErrors.password = "Email or password is incorrect";

    return NextResponse.json({ ...fieldErrors }, { status: 401 });

    // --- Optional real authentication (Firebase, Supabase, etc.) ---
    /*
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { auth } from "@/lib/firebase";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return NextResponse.json({
        access_token: await user.getIdToken(),
        user: { id: user.uid, email: user.email, name: user.displayName },
      });
    } catch (error) {
      return NextResponse.json({ email: "Email or password is incorrect", password: "Email or password is incorrect" }, { status: 401 });
    }
    */
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ email: "Internal server error", password: "Internal server error" }, { status: 500 });
  }
}
