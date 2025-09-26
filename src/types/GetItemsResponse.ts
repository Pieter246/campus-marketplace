import { Item } from "./item";

export interface GetItemsResponse {
  success: boolean;
  items: Item[];
  totalPages: number;
  message?: string;
  error?: string;
}