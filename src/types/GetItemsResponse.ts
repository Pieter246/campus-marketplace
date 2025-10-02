import { Item } from "./item";

export interface GetItemsResponse {
  success: boolean;
  items: Item[];
  totalPages: number;
  count: number;
  filters?: {
    sellerId?: string;
    buyerId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    status?: string[];
    searchTerm?: string;
    sort?: string;
    category?: string;
  };
  message?: string;
  error?: string;
}