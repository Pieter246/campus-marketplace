import { firestore } from "@/firebase/server";

export async function removeUserCartItems(userId: string) {
  try {
    console.log(`Removing all cart items for user: ${userId}`);

    const userCartItemsSnap = await firestore
      .collection("cartItems")
      .where("cartId", "==", userId)
      .get();

    if (userCartItemsSnap.empty) {
      console.log("No cart items found for user");
      return { removed: 0 };
    }

    const batch = firestore.batch();
    let removeCount = 0;

    userCartItemsSnap.forEach(doc => {
      batch.delete(doc.ref);
      removeCount++;
    });

    await batch.commit();
    console.log(`Successfully removed ${removeCount} cart items for user ${userId}`);

    return { removed: removeCount };
  } catch (error) {
    console.error("Error removing user cart items:", error);
    throw error;
  }
}

export async function removeCartItemsByIds(cartItemIds: string[]) {
  try {
    console.log(`Removing specific cart items: ${cartItemIds.join(', ')}`);

    if (cartItemIds.length === 0) {
      return { removed: 0 };
    }

    const batch = firestore.batch();

    cartItemIds.forEach(cartItemId => {
      const cartItemRef = firestore.collection("cartItems").doc(cartItemId);
      batch.delete(cartItemRef);
    });

    await batch.commit();
    console.log(`Successfully removed ${cartItemIds.length} cart items`);

    return { removed: cartItemIds.length };
  } catch (error) {
    console.error("Error removing cart items:", error);
    throw error;
  }
}