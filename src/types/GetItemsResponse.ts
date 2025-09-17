import { Item } from "./item";

export type GetItemsResponse = {
  success: boolean;
  items: Item[];
  totalPages: number;
  count: number;
  filters: Record<string, any>;
  message?: string;
  error?: string;
};