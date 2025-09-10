import { ItemCondition } from "./itemCondition";
import { ItemStatus } from "./itemStatus";

export type Item = {
    id: string;
    title: string;
    collectionAddress: string;
    description: string;
    price: number;
    status: ItemStatus;
    condition: ItemCondition;
    sellerId: string;
    images?: string[];
}