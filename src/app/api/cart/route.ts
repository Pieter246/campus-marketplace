// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore, auth } from "@/firebase/server"; // Admin SDK
import admin from "firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get cart items for this user
    const cartSnapshot = await firestore
      .collection("cartItems")
      .where("cartId", "==", userId)
      .get();

    const cartItems: any[] = [];

    for (const doc of cartSnapshot.docs) {
      const cartData = doc.data();
      const itemDoc = await firestore.collection("items").doc(cartData.itemId).get();

      if (itemDoc.exists) {
        const itemData = itemDoc.data();
        cartItems.push({
          cartItemId: doc.id,
          cartId: cartData.cartId,
          itemId: cartData.itemId,
          quantity: cartData.quantity,
          addedAt: cartData.addedAt?.toDate?.()?.toISOString(),
          item: {
            itemId: itemDoc.id,
            ...itemData,
            postedAt: itemData?.postedAt?.toDate?.()?.toISOString(),
            updatedAt: itemData?.updatedAt?.toDate?.()?.toISOString(),
          },
        });
      }
    }

    // Calculate total and VAT (15%)
    const subtotal = cartItems.reduce((total, item) => {
      const price = (item.item?.price as number) || 0;
      return total + price * item.quantity;
    }, 0);

    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    return NextResponse.json({
      success: true,
      cartItems,
      itemCount: cartItems.length,
      subtotal,
      vat,
      total,
    });
  } catch (err: any) {
    console.error("GET cart error:", err);
    return NextResponse.json({ message: "Failed to get cart", error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { itemId, quantity = 1 } = await req.json();
    if (!itemId) return NextResponse.json({ message: "Item ID is required" }, { status: 400 });

    // Check if item exists
    const itemDoc = await firestore.collection("items").doc(itemId).get();
    if (!itemDoc.exists) return NextResponse.json({ message: "Item not found" }, { status: 404 });

    const itemData = itemDoc.data();
    if (itemData?.itemStatus !== "available") {
      return NextResponse.json({ message: "Item is not available", status: 400 });
    }

    // Prevent adding your own item
    if (itemData?.sellerId === userId) {
      return NextResponse.json({ message: "Cannot add your own item", status: 400 });
    }

    // Check if already in cart
    const existingSnapshot = await firestore
      .collection("cartItems")
      .where("cartId", "==", userId)
      .where("itemId", "==", itemId)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json({ message: "Item already in cart", status: 400 });
    }

    // Add to cart with Admin SDK timestamp
    const cartRef = await firestore.collection("cartItems").add({
      cartId: userId,
      itemId,
      quantity: Number(quantity),
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      cartItemId: cartRef.id,
      message: "Item added to cart",
    });
  } catch (err: any) {
    console.error("POST cart error:", err);
    return NextResponse.json({ message: "Failed to add item", error: err.message }, { status: 500 });
  }
}
