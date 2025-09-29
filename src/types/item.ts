export type ItemStatus = "pending" | "for-sale" | "draft" | "sold" | "withdrawn" | "collected";

export type ItemCondition = "new" | "excellent" | "used" | "fair" | "poor";

export type ItemCategory = string;

export interface Item {
  id: string;
  title: string;
  collectionAddress: string;
  description: string;
  price: number;
  condition: ItemCondition;
  category: ItemCategory;
  sellerId: string;
  sellerEmail?: string;
  status: ItemStatus;
  updatedAt?: string;
  postedAt?: string;
  images?: string[];
}