import { firestore } from "@/firebase/server";

export async function removeItemFromAllCarts(itemId: string) {
  try {
    console.log(`Removing item ${itemId} from all users' carts`);

    // Find all cart items for this item across all users
    const cartItemsSnap = await firestore
      .collection("cartItems")
      .where("itemId", "==", itemId)
      .get();

    if (cartItemsSnap.empty) {
      console.log("No cart items found for this item");
      return { removed: 0 };
    }

    const batch = firestore.batch();
    let removeCount = 0;

    cartItemsSnap.forEach(doc => {
      batch.delete(doc.ref);
      removeCount++;
    });

    await batch.commit();
    console.log(`Successfully removed item ${itemId} from ${removeCount} carts`);

    return { removed: removeCount };
  } catch (error) {
    console.error("Error removing item from all carts:", error);
    throw error;
  }
}

export async function markItemAsSold(itemId: string, buyerId: string, buyerEmail: string) {
  try {
    console.log(`Marking item ${itemId} as sold to buyer ${buyerId}`);

    const itemRef = firestore.collection("items").doc(itemId);
    const itemSnap = await itemRef.get();

    if (!itemSnap.exists) {
      throw new Error("Item not found");
    }

    await itemRef.update({
      status: 'sold',
      buyerId: buyerId,
      buyerEmail: buyerEmail,
      soldAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Successfully marked item ${itemId} as sold`);
    return { success: true };
  } catch (error) {
    console.error("Error marking item as sold:", error);
    throw error;
  }
}