import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { FieldPath } from "firebase-admin/firestore";

interface CartItem {
  cartItemId: string;
  itemId: string;
  cartId: string;
}

interface Item {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition?: string;
  sellerId?: string;
  collectionAddress?: string;
  description?: string;
  category?: string;
  status?: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const cartId = user.uid;
    const cartItemsSnap = await firestore.collection("cartItems")
      .where("cartId", "==", cartId)
      .get();

    const cartItems: CartItem[] = [];
    const itemIds: string[] = [];
    cartItemsSnap.forEach(doc => {
      const data = doc.data();
      cartItems.push({ cartItemId: doc.id, ...data } as CartItem);
      if (data.itemId) itemIds.push(data.itemId);
    });

    if (!itemIds.length) return NextResponse.json({ success: true, cartItems, itemsData: [] });

    const itemsSnap = await firestore.collection("items")
      .where(FieldPath.documentId(), "in", itemIds)
      .get();

    const itemsData: Item[] = [];
    itemsSnap.forEach(doc => {
      const data = doc.data();
      itemsData.push({
        id: doc.id,
        title: data.title,
        price: data.price,
        images: data.images || [],
        condition: data.condition || 'used',
        sellerId: data.sellerId || '',
        // Add other required Item properties
        collectionAddress: data.collectionAddress || '',
        description: data.description || '',
        category: data.category || 'other',
        status: data.status || 'draft',
      } as Item);
    });

    // Filter out items that are not for sale and remove them from cart
    const validItems: Item[] = [];
    const validCartItems: CartItem[] = [];
    const itemsToRemove: string[] = [];

    for (let i = 0; i < itemsData.length; i++) {
      const item = itemsData[i];
      const cartItem = cartItems[i];
      
      if (item.status === 'for-sale') {
        validItems.push(item);
        validCartItems.push(cartItem);
      } else {
        // Mark item for removal from cart
        itemsToRemove.push(item.id);
      }
    }

    // Remove invalid items from user's cart
    if (itemsToRemove.length > 0) {
      const batch = firestore.batch();
      
      for (const itemId of itemsToRemove) {
        const cartItemRef = firestore
          .collection('cartItems')
          .where('userId', '==', user.uid)
          .where('itemId', '==', itemId);
        
        const cartItemSnapshot = await cartItemRef.get();
        cartItemSnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
          batch.delete(doc.ref);
        });
      }
      
      await batch.commit();
      console.log(`Removed ${itemsToRemove.length} non-for-sale items from cart for user ${user.uid}`);
    }

    return NextResponse.json({ 
      success: true, 
      cartItems: validCartItems, 
      itemsData: validItems,
      removedItems: itemsToRemove.length 
    });
  } catch (err: unknown) {
    console.error("Error fetching cart:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message });
  }
}