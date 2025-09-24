import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
//import { firestore } from "./server"; // your server.ts with admin SDK setup

export async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // verify token using Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken; // contains uid, email, etc.
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}
