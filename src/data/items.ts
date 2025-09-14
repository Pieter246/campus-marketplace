import { auth, getTotalPages } from "@/firebase/server";
import { Item } from "@/types/item";
import { ItemCondition } from "@/types/itemCondition";
import { ItemStatus } from "@/types/itemStatus";
import { firestore } from "firebase-admin";
import { cookies } from "next/headers";
import "server-only";

// Used for filtering and pagination
type GetItemsOptions = {
    filters?: {
        searchTerm?: string | null;
        sellerId?: string | null;
        buyerId?: string | null;
        minPrice?: number | null;
        maxPrice?: number | null;
        condition?: string | null;
        status?: ItemStatus[] | null;
    },
    pagination?: {
        pageSize?: number;
        page?: number;
    }
}

export const getItems = async (options?: GetItemsOptions) => {
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;
    const { sellerId, buyerId, minPrice, maxPrice, condition, status, searchTerm } = options?.filters || {};

    let itemsQuery = firestore().collection("items").orderBy("updated", "desc");

    // Apply filters
    if (sellerId) itemsQuery = itemsQuery.where("sellerId", "==", sellerId);
    if (buyerId) itemsQuery = itemsQuery.where("buyerId", "==", buyerId);
    if (minPrice !== null && minPrice !== undefined) itemsQuery = itemsQuery.where("price", ">=", minPrice);
    if (maxPrice !== null && maxPrice !== undefined) itemsQuery = itemsQuery.where("price", "<=", maxPrice);
    if (condition) {
        if (condition === "all") itemsQuery = itemsQuery.where("condition", "in", ["new", "used", "fair", "poor"]);
        else itemsQuery = itemsQuery.where("condition", "==", condition);
    }
    if (status) itemsQuery = itemsQuery.where("status", "in", status);

    // Fetch extra items to filter client-side if searchTerm is used
    const fetchSize = pageSize * 3; // adjust multiplier if needed
    const itemsSnapshot = await itemsQuery.limit(fetchSize).get();

    let items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Item));

    // Case-insensitive search filtering
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        items = items.filter(item =>
            item.title.toLowerCase().includes(term) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
    }

    // Pagination after filtering
    const totalPages = Math.ceil(items.length / pageSize);
    items = items.slice((page - 1) * pageSize, page * pageSize);

    return { data: items, totalPages };
};

// Get a single item by its ID
export const getItemById = async (itemId: string) => {
    const itemSnapshot = await firestore()
        .collection("items")
        .doc(itemId)
        .get();

    const itemData = {
        id: itemSnapshot.id,
        ...itemSnapshot.data(),
    } as Item;

    return itemData;
};

// Get multiple items by their IDs
export const getItemsById = async (itemIds: string[]) => {
    if (!itemIds.length) return [];

    const itemsSnapshot = await firestore()
        .collection("items")
        .where("__name__", "in", itemIds.slice(0, 10)) // max 10 at a time
        .get();

    const items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Item));

    return items;
};
