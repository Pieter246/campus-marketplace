import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// Zod schema for validation
const UpdateItemSchema = z.object({
  title: z.string().min(1),
  collectionAddress: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  status: z.enum(["draft", "pending", "for-sale", "sold", "withdrawn"]),
  condition: z.enum(["new", "used", "fair", "poor"]),
  category: z.enum([
    "books",
    "electronics",
    "clothing",
    "notes",
    "stationery",
    "other",
  ]),
});

export async function PUT(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { itemId, ...updateFields } = body;

  if (!itemId) {
    return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
  }

  const parsed = UpdateItemSchema.safeParse(updateFields);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const itemRef = firestore.collection("items").doc(itemId);
  const itemDoc = await itemRef.get();
  if (!itemDoc.exists) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  const itemData = itemDoc.data();
  if (itemData?.sellerId !== user.uid) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await itemRef.update({ ...parsed.data, updatedAt: Timestamp.now() });

  return NextResponse.json({
    success: true,
    message: "Item updated successfully",
    updatedFields: Object.keys(parsed.data),
  });
}
