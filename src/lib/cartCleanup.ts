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

/**
 * Remove an item from all users' carts when its status changes from 'for-sale'
 * This should be called whenever an item status changes to ensure cart integrity
 */
export async function removeItemFromAllCarts(itemId: string): Promise<void> {
  try {
    console.log(`Starting cart cleanup for item ${itemId}`);
    
    // Find all cart items for this specific item across all users
    const cartItemsQuery = firestore
      .collection('cartItems')
      .where('itemId', '==', itemId);
    
    const cartItemsSnapshot = await cartItemsQuery.get();
    
    if (cartItemsSnapshot.empty) {
      console.log(`No cart items found for item ${itemId}`);
      return;
    }
    
    // Use batch to delete all cart items for this item
    const batch = firestore.batch();
    let deleteCount = 0;
    
    cartItemsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    await batch.commit();
    console.log(`Removed item ${itemId} from ${deleteCount} cart(s) across all users`);
    
  } catch (error) {
    console.error(`Error removing item ${itemId} from all carts:`, error);
    throw error;
  }
}

/**
 * Clean up carts by removing all items that are not 'for-sale'
 * This can be run as a maintenance task or triggered by admin actions
 */
export async function cleanupAllCartsForNonSaleItems(): Promise<void> {
  try {
    console.log('Starting comprehensive cart cleanup for non-sale items');
    
    // Get all cart items
    const cartItemsSnapshot = await firestore.collection('cartItems').get();
    
    if (cartItemsSnapshot.empty) {
      console.log('No cart items found to cleanup');
      return;
    }
    
    // Get all unique item IDs from cart items
    const itemIds = [...new Set(cartItemsSnapshot.docs.map(doc => doc.data().itemId))];
    
    if (itemIds.length === 0) {
      console.log('No items found in carts');
      return;
    }
    
    // Batch get all items to check their status
    const itemsSnapshot = await firestore
      .collection('items')
      .where('__name__', 'in', itemIds)
      .get();
    
    // Create a map of item statuses
    const itemStatusMap = new Map<string, string>();
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      itemStatusMap.set(doc.id, data.status || 'draft');
    });
    
    // Find cart items with non-for-sale items
    const batch = firestore.batch();
    let deleteCount = 0;
    
    cartItemsSnapshot.forEach((cartDoc) => {
      const cartData = cartDoc.data();
      const itemId = cartData.itemId;
      const itemStatus = itemStatusMap.get(itemId);
      
      // If item doesn't exist or is not for-sale, remove from cart
      if (!itemStatus || itemStatus !== 'for-sale') {
        batch.delete(cartDoc.ref);
        deleteCount++;
      }
    });
    
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deleteCount} cart items with non-for-sale status`);
    } else {
      console.log('No cart cleanup needed - all items are for-sale');
    }
    
  } catch (error) {
    console.error('Error during comprehensive cart cleanup:', error);
    throw error;
  }
}

/**
 * Remove items from carts for a specific user
 * Used when user-specific cart cleanup is needed
 */
export async function removeItemFromUserCart(userId: string, itemId: string): Promise<void> {
  try {
    const cartItemsQuery = firestore
      .collection('cartItems')
      .where('userId', '==', userId)
      .where('itemId', '==', itemId);
    
    const cartItemsSnapshot = await cartItemsQuery.get();
    
    if (cartItemsSnapshot.empty) {
      return;
    }
    
    const batch = firestore.batch();
    cartItemsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Removed item ${itemId} from user ${userId}'s cart`);
    
  } catch (error) {
    console.error(`Error removing item ${itemId} from user ${userId}'s cart:`, error);
    throw error;
  }
}