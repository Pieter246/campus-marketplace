import {z} from 'zod'

export const itemDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  collectionAddress: z.string().min(1, "Collection address must have a value"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(1, "Price is required"),
  status: z.enum(["draft", "pending", "for-sale", "sold", "withdrawn"]),
  sellerId: z.string(),
  condition: z.enum(["new", "used", "fair", "poor"]),
  category: z.enum(["books", "electronics", "clothing"])
});

export const itemImagesSchema = z.object({
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      file: z.instanceof(File).optional()
    })
  ).min(1, "At least one image is required")
})


export const itemSchema = itemDataSchema.and(itemImagesSchema);