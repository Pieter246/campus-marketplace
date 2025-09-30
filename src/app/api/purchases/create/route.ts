import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemIds, totalAmount, paymentId } = await req.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ message: "Invalid item IDs" }, { status: 400 });
    }

    const batch = firestore.batch();
    const purchaseData = [];

    // Create purchase record for each item
    for (const itemId of itemIds) {
      // Get item details
      const itemRef = firestore.collection("items").doc(itemId);
      const itemSnap = await itemRef.get();
      
      if (!itemSnap.exists) {
        continue; // Skip if item doesn't exist
      }

      const itemData = itemSnap.data();
      
      // Create purchase record
      const purchaseRef = firestore.collection("purchases").doc();
      const purchaseRecord = {
        id: purchaseRef.id,
        itemId: itemId,
        itemTitle: itemData?.title || '',
        itemPrice: itemData?.price || 0,
        sellerId: itemData?.sellerId || '',
        sellerEmail: itemData?.sellerEmail || '',
        buyerId: user.uid,
        buyerEmail: user.email || '',
        paymentId: paymentId || '',
        totalAmount: totalAmount || 0,
        status: 'paid',
        collectionStatus: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      batch.set(purchaseRef, purchaseRecord);
      purchaseData.push(purchaseRecord);

      // Update item status to sold and add buyer info
      batch.update(itemRef, {
        status: 'sold',
        buyerId: user.uid,
        buyerEmail: user.email || '',
        soldAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: "Purchase records created successfully",
      purchases: purchaseData 
    });

  } catch (error: any) {
    console.error("Error creating purchase records:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create purchase records", error: error.message },
      { status: 500 }
    );
  }
}