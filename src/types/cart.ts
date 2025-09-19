import { Item } from "./item";

export type Cart = {
  id: string;
  buyerId: string;
  createdAt: Date;
  updatedAt: Date;
  items: Item[];
};