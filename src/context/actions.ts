"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("firebaseAuthToken");
  cookieStore.delete("firebaseAuthRefreshToken");
  cookieStore.delete("lastActivity");
};

export const setToken = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  try {
    const verifiedToken = await auth.verifyIdToken(token);
    if (!verifiedToken) {
      return;
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") ?? []; //Get all admins was (process.env.ADMIN_EMAIL === userRecord.email &&)
    const userRecord = await auth.getUser(verifiedToken.uid);

    console.log("DEBUG - Admin check:", {
      userEmail: userRecord.email,
      adminEmails: adminEmails,
      isEmailInList: userRecord.email ? adminEmails.includes(userRecord.email) : false,
      currentClaims: userRecord.customClaims
    });

    if (
      // If user is admin assign admin user claim
      userRecord.email &&
      adminEmails.includes(userRecord.email) &&
      !userRecord.customClaims?.admin
    ) {
      console.log("Setting admin claim for user:", userRecord.email);
      await auth.setCustomUserClaims(verifiedToken.uid, {
        admin: true,
      });
      
      // Note: Custom claims will be available in the next token refresh
      // The client should call getIdToken(true) to force refresh
    }

    const cookieStore = await cookies();
    
    console.log("🍪 SETTING COOKIES - Before:");
    console.log("  - Current cookies:", cookieStore.getAll().map(c => c.name));
    
    cookieStore.set("firebaseAuthToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set("firebaseAuthRefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    // Set last activity time when setting tokens (user is actively logging in)
    cookieStore.set("lastActivity", Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    console.log("🍪 SETTING COOKIES - After:");
    console.log("  - firebaseAuthToken set:", !!cookieStore.get("firebaseAuthToken"));
    console.log("  - All cookies now:", cookieStore.getAll().map(c => c.name));
  } catch (e) {
    console.log(e);
  }
};
