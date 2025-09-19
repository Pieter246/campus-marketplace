export type CreateItemResponse = {
  success: boolean;
  message: string;
  item: {
    itemId: string;
  };
  error?: string;
};
