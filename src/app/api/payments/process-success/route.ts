import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { removeUserCartItems } from "@/lib/cartCleanup";
import { removeItemFromAllCarts, markItemAsSold } from "@/lib/itemManagement";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { payment_id, user_id, payment_status } = await req.json();

    if (payment_status !== "success") {
      return NextResponse.json({ message: "Payment not successful" }, { status: 400 });
    }

    console.log(`Processing payment success for user: ${user_id || user.uid}`);
    
    const buyerId = user_id || user.uid;
    
    // Get the user's cart to see what items were purchased
    const cartItemsSnap = await firestore
      .collection("cartItems")
      .where("cartId", "==", buyerId)
      .get();

    if (cartItemsSnap.empty) {
      return NextResponse.json({ 
        success: true, 
        message: "No cart items found - cart may already be cleared" 
      });
    }

    const purchasedItemIds: string[] = [];
    const purchaseRecords = [];

    // Process each cart item
    for (const cartDoc of cartItemsSnap.docs) {
      const cartData = cartDoc.data();
      const itemId = cartData.itemId;
      
      if (itemId) {
        purchasedItemIds.push(itemId);

        // Get item details for purchase record
        const itemRef = firestore.collection("items").doc(itemId);
        const itemSnap = await itemRef.get();
        
        if (itemSnap.exists) {
          const itemData = itemSnap.data();
          const quantity = cartData.quantity || 1;

          console.log(`Processing item ${itemId} with price: ${itemData?.price}, title: ${itemData?.title}`);

          // Create purchase record
          const purchaseRef = firestore.collection("purchases").doc();
          const purchaseRecord = {
            id: purchaseRef.id,
            itemId: itemId,
            itemTitle: itemData?.title || '',
            itemPrice: itemData?.price || 0,
            quantity: quantity,
            sellerId: itemData?.sellerId || '',
            sellerEmail: itemData?.sellerEmail || '',
            buyerId: buyerId,
            paymentId: payment_id || 'success-' + Date.now(),
            totalAmount: (itemData?.price || 0) * quantity,
            status: 'paid',
            collectionStatus: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await purchaseRef.set(purchaseRecord);
          purchaseRecords.push(purchaseRecord);

          // Mark item as sold
          await markItemAsSold(itemId, buyerId, '');

          // Remove item from ALL users' carts (not just the buyer's)
          await removeItemFromAllCarts(itemId);
        }
      }
    }

    // Clear the buyer's cart completely
    await removeUserCartItems(buyerId);

    console.log(`Payment processing complete: processed ${purchasedItemIds.length} items for user ${buyerId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully processed payment for ${purchasedItemIds.length} items`,
      processedItems: purchasedItemIds,
      purchaseCount: purchaseRecords.length
    });

  } catch (error: any) {
    console.error("Error processing payment success:", error);
    return NextResponse.json(
      { success: false, message: "Payment processing failed", error: error.message },
      { status: 500 }
    );
  }
}