import { auth, getTotalPages } from "@/firebase/server"
import { Item } from "@/types/item"
import { ItemCondition } from "@/types/itemCondition"
import { ItemStatus } from "@/types/itemStatus"
import { firestore } from "firebase-admin"
import { cookies } from "next/headers"
import "server-only"

// Used for filtering and pagination
// Filtering for item-search page
// Pagination for dashboard and item-search page
type GetItemsOptions = {
    filters?: {
        sellerId?: string | null
        buyerId?: string | null
        minPrice?: number | null
        maxPrice?: number | null
        condition?:  string | null
        status?: ItemStatus[] | null
    },
    pagination?: {
        pageSize?: number;
        page?: number;
    }
}

export const getItems = async (options?: GetItemsOptions) => {
    // Get page, page size, filters from options with default values for page and page size
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;
    const {sellerId, buyerId, minPrice, maxPrice, condition, status} = options?.filters || {};
    
    // Order by and desc/asc must be option for user choice (only desc by updated if null)
    let itemsQuery = firestore().collection("items").orderBy("updated", "desc");

    // Apply filters if they exist
    if (sellerId) {
        itemsQuery = itemsQuery.where("sellerId", "==", sellerId); // Get items sold by user
    }
    if (buyerId) {
        itemsQuery = itemsQuery.where("buyerId", "==", buyerId); // Get items sold by user
    }
    if (minPrice !== null && minPrice !== undefined) {
        itemsQuery = itemsQuery.where("price", ">=", minPrice);
    }
    if (maxPrice !== null && maxPrice !== undefined) {
        itemsQuery = itemsQuery.where("price", "<=", maxPrice);
    }
    if (condition) {
        if (condition === "all")
            itemsQuery = itemsQuery.where("condition", "in", ["new", "used", "fair", "poor"]);
        else
            itemsQuery = itemsQuery.where("condition", "==", condition);
    }
    if (status) {
        itemsQuery = itemsQuery.where("status", "in", status);
    }

    // Get total pages that query would return given the page size
    const totalPages = await getTotalPages(itemsQuery, pageSize);

    // Get documents for the current page
    const itemsSnapshot = await itemsQuery
        .limit(pageSize) // Get 10 records (if pageSize is 10)
        .offset((page - 1) * pageSize) // From record 10 (if page is 2 and pageSize is 10) because 2-1 * 10 = 10
        .get(); // Results in getting documents 10-20

    // Map documents to Item type
    const items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Item));

    return { data: items, totalPages }
}

// export const getUserItems = async (options?: GetItemsOptions) => {
    

//     // Ensure filter and pagination options are initialized with token ID
//     const safeOptions: GetItemsOptions = {
//         ...options,
//         filters: {
//             ...options?.filters,
//             tokenID: verifiedToken.uid,
//         },
//         pagination: {
//             ...options?.pagination
//         }
//     };
    
//     return await getItems(safeOptions);
// }

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

// Get multiple items by their IDs (NOT USED AT MOMENT)
export const getItemsById = async (propertyIds: string[]) => {
    // Return early if no property IDs are provided
    if(!propertyIds.length) {
        return[];
    }

    const propertiesSnapshot = await firestore()
    .collection("properties")
    .where("__name__", "in", propertyIds) // __name__ is a special field that refers to the document ID
    .get(); // Grabbing multiple documents by ID (NB!!! max 10 IDs at a time when using an array)

    const propertiesData = propertiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    } as Item))
    return propertiesData;
}