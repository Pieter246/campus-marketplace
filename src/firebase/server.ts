import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getApps, ServiceAccount } from "firebase-admin/app";
import admin from "firebase-admin";
import { Auth, getAuth, DecodedIdToken } from "firebase-admin/auth";
import { ensureUserDocument, checkCurrentAdminStatus } from "@/lib/userUtils";

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com",
};

let firestore: Firestore;
let auth: Auth;
const currentApps = getApps();

if (!currentApps.length) {
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
  firestore = getFirestore(app);
  auth = getAuth(app);
} else {
  const app = currentApps[0];
  firestore = getFirestore(app);
  auth = getAuth(app);
}

export { firestore, auth };

/** START NEW CODE DDJ (also the DecodedIdToken import)
 * Safely verify a Firebase ID token.
 * Returns null if token is missing or expired.
 */
export const verifyTokenSafe = async (
  token?: string
): Promise<DecodedIdToken | null> => {
  if (!token) return null;

  try {
    return await auth.verifyIdToken(token);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("auth/id-token-expired")) {
      console.warn("Firebase ID token expired");
      return null; // token expired, treat user as unauthenticated
    }
    console.error("Error verifying Firebase token:", err);
    return null; // treat any verification error as unauthenticated
  }
};
/* END NEW CODE DDJ */

export async function authenticateRequest(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    // Ensure user document exists and get current admin status
    await ensureUserDocument(decodedToken.uid, decodedToken.email || '', {
      emailVerified: decodedToken.email_verified || false
    });

    // Check current admin status (environment + database)
    const isCurrentlyAdmin = await checkCurrentAdminStatus(decodedToken.uid, decodedToken.email || '');

    // Get updated user data
    const userDoc = await firestore.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return {
      ...decodedToken,
      admin: isCurrentlyAdmin,
      isAdmin: isCurrentlyAdmin,
      userData
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export const getTotalPages = async (
  firestoreQuery: FirebaseFirestore.Query<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  pageSize: number
) => {
  const queryCount = firestoreQuery.count();
  const countSnapshot = await queryCount.get();
  const countData = countSnapshot.data();
  const total = countData.count;
  const totalPages = Math.ceil(total / pageSize);
  return totalPages;
};
