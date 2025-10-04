"use server";

import { auth } from "@/firebase/server";
import { ensureUserDocument } from "@/lib/userUtils";

// ---------------------------
// Email/Password Registration
// ---------------------------
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Create user document in Firestore with proper admin status
    await ensureUserDocument(userRecord.uid, userRecord.email || email, {
      firstName,
      lastName,
      phoneNumber: "",
      userId: userRecord.uid,
      emailVerified: userRecord.emailVerified ?? false,
    });

    return { error: false, uid: userRecord.uid };
  } catch (e: unknown) {
    const error = e as { message?: string };
    return { error: true, message: error.message ?? "Could not register user" };
  }
};

// ---------------------------
// Google Registration (Server-side Firestore)
// ---------------------------
interface GoogleUserInput {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

export const registerGoogleUser = async (user: GoogleUserInput) => {
  try {
    const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
    const lastName = lastNameParts.join(" ");

    // Use ensureUserDocument to handle admin status properly
    await ensureUserDocument(user.uid, user.email, {
      firstName: firstName || "",
      lastName: lastName || "",
      phoneNumber: "",
      userId: user.uid,
      emailVerified: user.emailVerified,
    });

    return { error: false };
  } catch (e: unknown) {
    const error = e as { message?: string };
    return { error: true, message: error.message ?? "Could not create Google user" };
  }
};