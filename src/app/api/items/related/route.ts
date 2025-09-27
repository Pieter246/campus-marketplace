// app/api/items/related/route.ts
import { NextResponse } from "next/server";
import { getFirestore, collection, query, where, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const limitParam = searchParams.get("limit") || "4";

  if (!itemId) {
    return NextResponse.json({ success: false, message: "itemId is required" }, { status: 400 });
  }

  try {
    // Fetch the current item to get its category
    const itemDoc = doc(db, "items", itemId);
    const itemSnapshot = await getDoc(itemDoc);

    if (!itemSnapshot.exists()) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }

    const itemData = itemSnapshot.data();
    const category = itemData.category; // Assuming items have a 'category' field

    // Query for related items (same category, for-sale, excluding current item)
    const itemsRef = collection(db, "items");
    const q = query(
      itemsRef,
      where("category", "==", category),
      where("status", "==", "for-sale"),
      where("id", "!=", itemId),
      limit(Number(limitParam))
    );

    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching related items:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}