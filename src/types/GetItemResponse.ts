import { Item } from "./item";

export type GetItemResponse = {
  success: boolean;
  item: Item;
  message?: string;
  error?: string;
};
