import {z} from 'zod'

export const itemDataSchema = z.object({
  title: z.string().min(1, "Title must have a value"),
  collectionAddress: z.string().min(1, "Collection address must have a value"),
  description: z
    .string()
    .min(40, "Description must contain at least 10 characters"),
  price: z.coerce.number<number>().positive("Price must be greater than zero"),
  status: z.enum(["for-sale", "pending", "withdrawn", "sold"]),
  sellerId: z.string(),
  condition: z.enum(["new", "used", "fair", "poor"])
});

export const itemImagesSchema = z.object({
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    file: z.instanceof(File).optional()
  }))
})

export const itemSchema = itemDataSchema.and(itemImagesSchema);