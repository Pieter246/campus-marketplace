import { authenticateRequest, firestore } from "@/firebase/server";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for validation
const CreateItemSchema = z.object({
  title: z.string().min(1),
  collectionAddress: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  status: z.enum(["draft", "pending", "for-sale", "sold", "withdrawn"]),
  condition: z.enum(["new", "excellent", "used", "fair", "poor"]),
  category: z.enum(["books", "electronics", "clothing", "notes", "stationery", "other"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const raw = await req.json();
    const parsed = CreateItemSchema.safeParse(raw.rest ?? raw);

    if (!parsed.success) {
      console.warn("Validation failed:", parsed.error.flatten());
      return NextResponse.json(
        {
          message: "Invalid input",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Create the item
    const item = await firestore.collection("items").add({
      ...parsed.data,
      sellerId: user.uid,
      postedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      viewsCount: 0,
    });

    console.log(`Item created: ${item.id}`);

    // Diplay message item created and return the item Id
    return NextResponse.json(
      {
        success: true,
        message: "Item created successfully",
        item: { itemId: item.id },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Item creation error:", error);
    const errorMessage: string = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        message: "Internal server error",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
