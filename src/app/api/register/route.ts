import { NextResponse } from "next/server";

// Handle POST requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, confirmPassword } = body;

    const fieldErrors: { [key: string]: string } = {};

    // --- Basic validation ---
    if (!email.includes("@")) fieldErrors.email = "Please enter a valid email address";
    if (!username || username.trim().length < 3) fieldErrors.username = "Username must be at least 3 characters";
    if (!password || password.length < 6) fieldErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) fieldErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(fieldErrors, { status: 400 });
    }

    // --- Demo user registration ---
    // Normally you'd save to DB or Firebase here
    const newUser = {
      id: 1,
      email,
      username,
    };

    // Return mock JWT token and user info
    return NextResponse.json({
      access_token: "mock_jwt_token_register",
      user: newUser,
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { email: "Internal server error", username: "Internal server error", password: "Internal server error", confirmPassword: "Internal server error" },
      { status: 500 }
    );
  }
}
