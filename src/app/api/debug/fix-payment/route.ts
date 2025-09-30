import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { removeItemFromAllCarts, markItemAsSold } from "@/lib/itemManagement";
import { removeUserCartItems } from "@/lib/cartCleanup";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { action, userId } = await req.json();

    if (action === "fix-payment") {
      console.log(`Manually processing payment completion for user: ${userId || user.uid}`);
      
      const buyerId = userId || user.uid;
      
      // Get the user's cart to see what items were purchased
      const cartItemsSnap = await firestore
        .collection("cartItems")
        .where("cartId", "==", buyerId)
        .get();

      if (cartItemsSnap.empty) {
        return NextResponse.json({ 
          success: false, 
          message: "No cart items found for user" 
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
              paymentId: 'manual-fix-' + Date.now(),
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

      return NextResponse.json({
        success: true,
        message: `Manually processed payment for ${purchasedItemIds.length} items`,
        processedItems: purchasedItemIds,
        purchaseRecords: purchaseRecords
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: "Invalid action" 
    });

  } catch (error: any) {
    console.error("Error in manual fix:", error);
    return NextResponse.json(
      { success: false, message: "Manual fix failed", error: error.message },
      { status: 500 }
    );
  }
}