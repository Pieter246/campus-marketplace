import { NextRequest, NextResponse } from "next/server";
import { removeUserCartItems } from "@/lib/cartCleanup";
import { removeItemFromAllCarts, markItemAsSold } from "@/lib/itemManagement";
import { firestore } from "@/firebase/server";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  console.log("=== PAYFAST WEBHOOK CALLED ===");
  
  const formData = await req.formData();

  // PayFast fields
  const merchant_id = formData.get("merchant_id");
  const pf_payment_id = formData.get("pf_payment_id");
  const amount_gross = formData.get("amount_gross");
  const payment_status = formData.get("payment_status");
  const custom_str1 = formData.get("custom_str1"); // This should contain the user ID
  const signature = formData.get("signature"); // PayFast signature

  console.log("=== PAYFAST NOTIFY - SIGNATURE DEBUG ===");
  console.log("All form data received:");
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  console.log("\nKey PayFast fields:", {
    merchant_id,
    pf_payment_id,
    amount_gross,
    payment_status,
    custom_str1,
    signature,
  });
  
  console.log("\nSignature verification data:");
  console.log(`MERCHANT_KEY: ${process.env.PAYFAST_MERCHANT_KEY ? '[SET]' : '[NOT SET]'}`);
  console.log(`PASSPHRASE: ${process.env.PAYFAST_PASSPHRASE ? '[SET]' : '[NOT SET]'}`);
  console.log(`Received signature: ${signature}`);
  console.log("=== END SIGNATURE DEBUG ===");

  // If payment is successful, handle all the necessary updates
  if (payment_status === "COMPLETE" && custom_str1) {
    try {
      const buyerId = custom_str1 as string;
      
      // Get the user's cart to see what items were purchased
      const cartItemsSnap = await firestore
        .collection("cartItems")
        .where("cartId", "==", buyerId)
        .get();

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
              paymentId: pf_payment_id as string || '',
              totalAmount: parseFloat(amount_gross as string || '0'),
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

      console.log(`Payment successful: processed ${purchasedItemIds.length} items for user ${buyerId}`);
      console.log(`Created ${purchaseRecords.length} purchase records`);
      
    } catch (error) {
      console.error("Failed to process successful payment:", error);
      // Don't fail the webhook because of processing failure
    }
  }

  // TODO: verify signature using MERCHANT_KEY & PASSPHRASE
  console.log("=== PAYFAST WEBHOOK PROCESSING COMPLETE ===");
  console.log(`Final status: Payment ${payment_status}, processed: ${payment_status === 'COMPLETE' ? 'YES' : 'NO'}`);
  
  return new NextResponse("OK"); // Must return 200
}
