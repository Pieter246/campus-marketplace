"use server";

import { auth } from "@/firebase/server";
import { firestore } from "@/firebase/server";

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

    // Firestore document
    const userDoc = {
      createdAt: new Date(),
      updatedAt: new Date(),
      email: userRecord.email,
      emailVerified: userRecord.emailVerified ?? false,
      firstName,
      lastName,
      isActive: true,
      isAdmin: false,
      phoneNumber: "",
      userId: userRecord.uid,
    };

    await firestore.collection("users").doc(userRecord.uid).set(userDoc);

    return { error: false, uid: userRecord.uid };
  } catch (e: any) {
    return { error: true, message: e.message ?? "Could not register user" };
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
    const userDocRef = firestore.collection("users").doc(user.uid);
    const doc = await userDocRef.get();

    if (!doc.exists) {
      const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
      const lastName = lastNameParts.join(" ");

      await userDocRef.set({
        createdAt: new Date(),
        updatedAt: new Date(),
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: firstName || "",
        lastName: lastName || "",
        isActive: true,
        isAdmin: false,
        phoneNumber: "",
        userId: user.uid,
      });
    }

    return { error: false };
  } catch (e: any) {
    return { error: true, message: e.message ?? "Could not create Google user" };
  }
};
