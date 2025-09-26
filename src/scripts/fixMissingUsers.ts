// src/scripts/fixCleanUsers.ts
import admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert("C:/campus-marketplace/src/scripts/firebase-service-account.json"),
});

const db = admin.firestore();
const auth = admin.auth();

// Canonical list of fields
const canonicalFields = [
  "userId",
  "email",
  "emailVerified",
  "firstName",
  "lastName",
  "phoneNumber",
  "isActive",
  "isAdmin",
  "createdAt",
  "updatedAt",
];

async function fixCleanUsers() {
  console.log("Fetching all users from Firebase Auth...");

  let nextPageToken: string | undefined = undefined;
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    const users = listUsersResult.users;

    for (const user of users) {
      if (!user.email) continue;

      const docRef = db.collection("users").doc(user.uid);
      const doc = await docRef.get();

      const updates: { [key: string]: any } = {};

      if (!doc.exists) {
        // Create full document
        updates.userId = user.uid;
        updates.email = user.email;
        updates.emailVerified = user.emailVerified;
        updates.firstName = "";
        updates.lastName = "";
        updates.phoneNumber = user.phoneNumber || "";
        updates.isActive = true;
        updates.isAdmin = false;
        updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        console.log(`Creating missing Firestore document for ${user.email}`);
        await docRef.set(updates);
      } else {
        const data = doc.data()!;
        let needsUpdate = false;

        // Add missing fields
        if (!("userId" in data)) { updates.userId = user.uid; needsUpdate = true; }
        if (!("email" in data)) { updates.email = user.email; needsUpdate = true; }
        if (!("emailVerified" in data)) { updates.emailVerified = user.emailVerified; needsUpdate = true; }
        if (!("firstName" in data)) { updates.firstName = ""; needsUpdate = true; }
        if (!("lastName" in data)) { updates.lastName = ""; needsUpdate = true; }
        if (!("phoneNumber" in data)) { updates.phoneNumber = user.phoneNumber || ""; needsUpdate = true; }
        if (!("isActive" in data)) { updates.isActive = true; needsUpdate = true; }
        if (!("isAdmin" in data)) { updates.isAdmin = false; needsUpdate = true; }
        if (!("createdAt" in data)) { updates.createdAt = admin.firestore.FieldValue.serverTimestamp(); needsUpdate = true; }

        // Always update updatedAt
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;

        // Remove extra fields
        const extraFields = Object.keys(data).filter((key) => !canonicalFields.includes(key));
        for (const key of extraFields) {
          updates[key] = admin.firestore.FieldValue.delete();
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log(`Updating Firestore document for ${user.email}:`, Object.keys(updates));
          await docRef.update(updates);
        }
      }
    }

    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log("Done cleaning Firestore users!");
}

fixCleanUsers().catch(console.error);
